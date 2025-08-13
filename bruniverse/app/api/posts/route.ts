// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/db";
import { validateApiPostInput, parseUserData, parseUserToken } from "../lib";

interface CreatePostRequest {
	title: string;
	content: string;
	categoryId: string;
	is_anonymous: boolean;
}

interface GetPostsQueryParams {
	page?: string;
	limit?: string;
	category?: string;
	search?: string;
	author?: string;
	userId?: string;
	filter?:
		| "all"
		| "yours"
		| "starred"
		| "your-posts"
		| "your-comments"
		| "your-drafts"
		| "starred-posts"
		| "starred-comments";
	sortBy?: "latest" | "oldest" | "popular" | "most-commented";
}

// SQL Queries
const createPostQuery = `
  WITH next_thread_number AS (
  SELECT COALESCE(MAX(thread_number), 0) + 1 AS new_thread_number FROM posts
)
INSERT INTO posts (
  user_id, 
  category_id, 
  title, 
  content, 
  is_anonymous, 
  thread_number,
  moderation_status,
  created_at,
  updated_at
) 
VALUES (
  $1, 
  $2, 
  $3, 
  $4,
  $5,
  (SELECT new_thread_number FROM next_thread_number),
  'approved', 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
)
RETURNING
  id,
  user_id,
  category_id,
  title,
  content,
  is_anonymous,
  thread_number,
  moderation_status,
  created_at,
  updated_at;`;

const getPostsBaseQuery = `
  SELECT 
    p.id,
    p.title,
    p.content,
    p.is_anonymous,
    p.view_count,
	p.thread_number,
    p.is_pinned,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN p.is_anonymous THEN 'Anonymous'
      ELSE COALESCE( u.username, u.first_name || ' ' || u.last_name)
    END as author,
    p.user_id,
    c.name as category,
    c.id as category_id,
    -- Reaction counts by type
    COALESCE(like_count.count, 0) as like_count,
    COALESCE(starred_count.count, 0) as starred_count,
    COALESCE(shared_count.count, 0) as shared_count,
    -- User's reactions (if authenticated)
    CASE WHEN $userIdParam IS NOT NULL AND user_like.id IS NOT NULL THEN true ELSE false END as user_liked,
    CASE WHEN $userIdParam IS NOT NULL AND user_starred.id IS NOT NULL THEN true ELSE false END as user_starred,
    CASE WHEN $userIdParam IS NOT NULL AND user_shared.id IS NOT NULL THEN true ELSE false END as user_shared,
    -- Comment count (including nested comments)
    COALESCE(comment_count.count, 0) as comment_count
  FROM posts p
  LEFT JOIN users u ON p.user_id = u.id
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM reactions 
    WHERE reaction_type = 'like' AND post_id IS NOT NULL
    GROUP BY post_id
  ) like_count ON p.id = like_count.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM reactions 
    WHERE reaction_type = 'starred' AND post_id IS NOT NULL
    GROUP BY post_id
  ) starred_count ON p.id = starred_count.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM reactions 
    WHERE reaction_type = 'shared' AND post_id IS NOT NULL
    GROUP BY post_id
  ) shared_count ON p.id = shared_count.post_id
  LEFT JOIN reactions user_like ON p.id = user_like.post_id 
    AND user_like.user_id = $userIdParam 
    AND user_like.reaction_type = 'like'
  LEFT JOIN reactions user_starred ON p.id = user_starred.post_id 
    AND user_starred.user_id = $userIdParam 
    AND user_starred.reaction_type = 'starred'
  LEFT JOIN reactions user_shared ON p.id = user_shared.post_id 
    AND user_shared.user_id = $userIdParam 
    AND user_shared.reaction_type = 'shared'
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count 
    FROM comments 
    WHERE is_deleted = false
    GROUP BY post_id
  ) comment_count ON p.id = comment_count.post_id
  WHERE p.moderation_status = 'approved'
    AND p.is_deleted = false
`;

// Recursive CTE to get nested comments

const getNestedCommentsForPostQuery = `
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments (no parent)
    SELECT 
      c.id,
      c.post_id,
      c.parent_comment_id,
      c.content,
      c.is_anonymous,
      c.created_at,
      c.updated_at,
      CASE 
        WHEN c.is_anonymous THEN 'Anonymous'
        ELSE COALESCE(u.username, u.first_name || ' ' || u.last_name)
      END as author,
      c.user_id,
      0 as depth,
      ARRAY[c.created_at] as sort_path,
      c.id::text as path_ids
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $2
      AND c.parent_comment_id IS NULL
      AND c.is_deleted = false
    
    UNION ALL
    
    -- Recursive case: replies to comments
    SELECT 
      c.id,
      c.post_id,
      c.parent_comment_id,
      c.content,
      c.is_anonymous,
      c.created_at,
      c.updated_at,
      CASE  
        WHEN c.is_anonymous THEN 'Anonymous'
        ELSE COALESCE(u.username, u.first_name || ' ' || u.last_name)
      END as author,
      c.user_id,
      ct.depth + 1,
      ct.sort_path || c.created_at,
      ct.path_ids || ',' || c.id::text
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE c.is_deleted = false
      AND ct.depth < 10 -- Limit nesting depth to prevent infinite recursion
  ),
  comment_reactions AS (
    SELECT 
      ct.*,
      -- Reaction counts for each comment
      COALESCE(like_count.count, 0) as like_count,
      COALESCE(starred_count.count, 0) as starred_count,
      COALESCE(shared_count.count, 0) as shared_count,
      -- User's reactions to comments (if authenticated)
      CASE WHEN $1 IS NOT NULL AND user_like.id IS NOT NULL THEN true ELSE false END as user_liked,
      CASE WHEN $1 IS NOT NULL AND user_starred.id IS NOT NULL THEN true ELSE false END as user_starred,
      CASE WHEN $1 IS NOT NULL AND user_shared.id IS NOT NULL THEN true ELSE false END as user_shared,
      -- Reply count for each comment
      COALESCE(reply_count.count, 0) as reply_count
    FROM comment_tree ct
    LEFT JOIN (
      SELECT comment_id, COUNT(*) as count 
      FROM reactions 
      WHERE reaction_type = 'like' AND comment_id IS NOT NULL
      GROUP BY comment_id
    ) like_count ON ct.id = like_count.comment_id
    LEFT JOIN (
      SELECT comment_id, COUNT(*) as count 
      FROM reactions 
      WHERE reaction_type = 'starred' AND comment_id IS NOT NULL
      GROUP BY comment_id
    ) starred_count ON ct.id = starred_count.comment_id
    LEFT JOIN (
      SELECT comment_id, COUNT(*) as count 
      FROM reactions 
      WHERE reaction_type = 'shared' AND comment_id IS NOT NULL
      GROUP BY comment_id
    ) shared_count ON ct.id = shared_count.comment_id
    LEFT JOIN reactions user_like ON ct.id = user_like.comment_id 
      AND user_like.user_id = $1 
      AND user_like.reaction_type = 'like'
    LEFT JOIN reactions user_starred ON ct.id = user_starred.comment_id 
      AND user_starred.user_id = $1 
      AND user_starred.reaction_type = 'starred'
    LEFT JOIN reactions user_shared ON ct.id = user_shared.comment_id 
      AND user_shared.user_id = $1 
      AND user_shared.reaction_type = 'shared'
    LEFT JOIN (
      SELECT parent_comment_id, COUNT(*) as count 
      FROM comments 
      WHERE is_deleted = false AND parent_comment_id IS NOT NULL
      GROUP BY parent_comment_id
    ) reply_count ON ct.id = reply_count.parent_comment_id
  )
  SELECT * FROM comment_reactions
  ORDER BY sort_path
`;

// Helper function to build nested comment structure
function buildNestedComments(flatComments: any[]): any[] {
	const commentMap = new Map();
	const rootComments: any[] = [];

	// First pass: create comment objects and map them by ID
	flatComments.forEach((comment) => {
		const commentObj = {
			id: comment.id.toString(),
			title: "", // Comments don't have titles in your schema
			content: comment.content,
			category: "", // Comments don't have categories
			author: comment.author,
			created_at: formatTimeAgo(comment.created_at),
			user_id: comment.user_id,
			parent_comment_id: comment.parent_comment_id,
			depth: comment.depth,
			reactions: {
				like: {
					isActive: comment.user_liked,
					count: comment.like_count,
				},
				starred: {
					isActive: comment.user_starred,
					count: comment.starred_count,
				},
				shared: {
					isActive: comment.user_shared,
					count: comment.shared_count,
				},
			},
			reply_count: comment.reply_count,
			comments: [], // Will be populated with nested replies
		};

		commentMap.set(comment.id.toString(), commentObj);

		if (!comment.parent_comment_id) {
			rootComments.push(commentObj);
		}
	});

	// Second pass: build the nested structure
	flatComments.forEach((comment) => {
		if (comment.parent_comment_id) {
			const parentComment = commentMap.get(
				comment.parent_comment_id.toString()
			);
			const childComment = commentMap.get(comment.id.toString());

			if (parentComment && childComment) {
				parentComment.comments.push(childComment);
			}
		}
	});

	return rootComments;
}

// Helper function to build WHERE clause based on filters
function buildWhereClause(
	params: GetPostsQueryParams,
	userId?: string
): { whereClause: string; queryParams: any[] } {
	const conditions: string[] = [];
	const queryParams: any[] = [];
	let paramIndex = 1;

	// Category filter
	if (params.category && params.category !== "all") {
		conditions.push(`c.id = $${paramIndex}`);
		queryParams.push(params.category);
		paramIndex++;
	}

	// Search filter
	if (params.search && params.search.trim()) {
		conditions.push(`(
      LOWER(p.title) LIKE LOWER($${paramIndex}) OR 
      LOWER(p.content) LIKE LOWER($${paramIndex + 1}) OR 
      LOWER(COALESCE(u.username, u.first_name || ' ' || u.last_name)) LIKE LOWER($${paramIndex + 2})
    )`);
		const searchTerm = `%${params.search.trim()}%`;
		queryParams.push(searchTerm, searchTerm, searchTerm);
		paramIndex += 3;
	}

	// Filter-based conditions
	if (params.filter && userId) {
		switch (params.filter) {
			case "yours":
			case "your-posts":
				conditions.push(`p.user_id = $${paramIndex}`);
				queryParams.push(userId);
				paramIndex++;
				break;

			case "your-comments":
				// Posts where user has commented
				conditions.push(`EXISTS (
          SELECT 1 FROM comments c 
          WHERE c.post_id = p.id 
          AND c.user_id = $${paramIndex} 
          AND c.is_deleted = false
        )`);
				queryParams.push(userId);
				paramIndex++;
				break;

			case "your-drafts":
				conditions.push(
					`p.user_id = $${paramIndex} AND p.moderation_status = 'pending'`
				);
				queryParams.push(userId);
				paramIndex++;
				break;
		}
	}

	// Author filter
	if (params.author) {
		conditions.push(`(
      LOWER(u.username) = LOWER($${paramIndex}) OR 
      LOWER(u.first_name || ' ' || u.last_name) = LOWER($${paramIndex + 1})
    )`);
		queryParams.push(params.author, params.author);
		paramIndex += 2;
	}

	const whereClause =
		conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : "";

	return { whereClause, queryParams };
}

// Helper function to build ORDER BY clause
function buildOrderByClause(sortBy?: string): string {
	switch (sortBy) {
		case "oldest":
			return "ORDER BY p.is_pinned DESC, p.created_at ASC";
		case "popular":
			return "ORDER BY p.is_pinned DESC, (like_count + starred_count + shared_count) DESC, p.created_at DESC";
		case "most-commented":
			return "ORDER BY p.is_pinned DESC, comment_count DESC, p.created_at DESC";
		case "latest":
		default:
			return "ORDER BY p.is_pinned DESC, p.created_at DESC";
	}
}

// GET handler for fetching posts with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const queryParams: GetPostsQueryParams = {
			page: searchParams.get("page") || "1",
			limit: searchParams.get("limit") || "10",
			category: searchParams.get("category") || undefined,
			search: searchParams.get("search") || undefined,
			author: searchParams.get("author") || undefined,
			filter: (searchParams.get("filter") as any) || "all",
			sortBy: (searchParams.get("sortBy") as any) || "latest",
		};

		// Get user data from header (optional for public posts)
		// Get authenticated user
		const token = request.cookies.get("token")?.value;
		const userData = parseUserToken(token!);
		const userId = userData?.id;

		// Parse pagination parameters
		const page = Math.max(1, parseInt(queryParams.page || "1"));
		const limit = Math.min(
			50,
			Math.max(1, parseInt(queryParams.limit || "10"))
		); // Max 50 posts per page
		const offset = (page - 1) * limit;

		// Build dynamic WHERE clause
		const { whereClause, queryParams: whereParams } = buildWhereClause(
			queryParams,
			userId
		);

		// Build ORDER BY clause
		const orderByClause = buildOrderByClause(queryParams.sortBy);

		// Replace placeholder with actual parameter number for userId
		let finalQuery = getPostsBaseQuery.replace(
			/\$userIdParam/g,
			userId ? `$${whereParams.length + 1}` : "NULL"
		);

		// Add WHERE clause and ORDER BY
		finalQuery +=
			whereClause +
			` ${orderByClause} LIMIT $${whereParams.length + (userId ? 2 : 1)} OFFSET $${whereParams.length + (userId ? 3 : 2)}`;

		// Prepare final query parameters
		const finalParams = [...whereParams];
		if (userId) finalParams.push(userId);
		finalParams.push(limit, offset);

		// Execute the query
		const postsResult = await db.query(finalQuery, finalParams);

		// Get total count for pagination
		let countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.moderation_status = 'approved'
        AND p.is_deleted = false
      ${whereClause}
    `;

		const countParams = [...whereParams];

		const countResult = await db.query(countQuery, countParams);
		const totalPosts = parseInt(countResult.rows[0]?.total || "0");

		// Fetch nested comments for each post
		const postsWithComments = await Promise.all(
			postsResult.rows.map(async (post) => {
				// Increment view count (you might want to do this more efficiently with a background job)
				if (userId) {
					await db.query(
						"UPDATE posts SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
						[post.id]
					);
				}

				const commentsResult = await db.query(
					getNestedCommentsForPostQuery,
					[userId, post.id]
				);

				// Build nested comment structure
				const nestedComments = buildNestedComments(commentsResult.rows);

				return {
					id: post.id.toString(),
					title: post.title,
					content: post.content,
					category: post.category,
					threadNumber: post.thread_number,
					author: post.author,
					created_at: formatTimeAgo(post.created_at),
					view_count: post.view_count,
					is_pinned: post.is_pinned,
					reactions: {
						like: {
							isActive: post.user_liked,
							count: post.like_count,
						},
						starred: {
							isActive: post.user_starred,
							count: post.starred_count,
						},
						shared: {
							isActive: post.user_shared,
							count: post.shared_count,
						},
					},
					comments: nestedComments,
					comment_count: post.comment_count,
				};
			})
		);

		// Calculate pagination info
		const totalPages = Math.ceil(totalPosts / limit);

		return NextResponse.json({
			success: true,
			data: {
				posts: postsWithComments,
				pagination: {
					currentPage: page,
					totalPages,
					totalPosts,
					postsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
				},
				filters: {
					category: queryParams.category,
					search: queryParams.search,
					sortBy: queryParams.sortBy,
					filter: queryParams.filter,
				},
			},
			message: `Retrieved ${postsWithComments.length} posts`,
		});
	} catch (error) {
		console.error("Get posts error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "INTERNAL_ERROR",
				message: "Failed to fetch posts",
			},
			{ status: 500 }
		);
	}
}

// POST handler for creating posts (your existing logic)
export async function POST(request: NextRequest) {
	try {
		// Get user data from header
		// Get authenticated user
		const token = request.cookies.get("token")?.value;
		const userData = parseUserToken(token!);

		if (!userData || !userData.id) {
			console.log("User authentication required ");
			return NextResponse.json(
				{
					success: false,
					error: "UNAUTHORIZED",
					message: "User authentication required",
				},
				{ status: 401 }
			);
		}

		// Parse request body
		const body: CreatePostRequest = await request.json();

		// Validate input
		const validation = validateApiPostInput(body);
		if (!validation.isValid) {
			console.log(validation.errors);
			return NextResponse.json(
				{
					success: false,
					error: "VALIDATION_ERROR",
					message: "Invalid input data",
					errors: validation.errors,
				},
				{ status: 400 }
			);
		}

		console.log("Creating post:", [
			userData.id,
			body.categoryId,
			body.title.trim(),
			body.content.trim(),
			body.is_anonymous,
		]);

		// Insert post into database
		const result = await db.query(createPostQuery, [
			userData.id,
			body.categoryId,
			body.title.trim(),
			body.content.trim(),
			body.is_anonymous,
		]);

		const newPost = result?.rows[0];
		if (!newPost) {
			console.log("Failed to create post.");
			return NextResponse.json(
				{
					success: false,
					error: "DATABASE_ERROR",
					message: "Failed to create post",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Post created successfully",
				data: {
					id: newPost.id,
					title: newPost.title,
					content: newPost.content,
					categoryId: newPost.category_id,
					isAnonymous: newPost.is_anonymous,
					moderationStatus: newPost.moderation_status,
					createdAt: newPost.created_at,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Create post error:", error);

		// Handle specific database errors
		if (error instanceof Error) {
			if (error.message.includes("foreign key constraint")) {
				return NextResponse.json(
					{
						success: false,
						error: "INVALID_REFERENCE",
						message: "Invalid user ID or category ID",
					},
					{ status: 400 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				error: "INTERNAL_ERROR",
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor(
		(now.getTime() - new Date(date).getTime()) / 1000
	);

	if (diffInSeconds < 60) return "Just now";
	if (diffInSeconds < 3600)
		return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400)
		return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	if (diffInSeconds < 2592000)
		return `${Math.floor(diffInSeconds / 86400)} days ago`;
	if (diffInSeconds < 31536000)
		return `${Math.floor(diffInSeconds / 2592000)} months ago`;
	return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
