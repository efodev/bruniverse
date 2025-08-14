import { NextRequest, NextResponse } from "next/server";
import { parseUserToken } from "../lib";
import db from "@/app/database/db";

// Comment interface matching your required format
interface Comment {
	id: string;
	postId: string;
	parentCommentId?: string;
	content: string;
	author: string;
	authorId: string;
	isAnonymous: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	reactions: {
		like: { count: number; isActive: boolean };
		helpful: { count: number; isActive: boolean };
		thanks: { count: number; isActive: boolean };
	};
	replies?: Comment[];
}

// Helper function to organize comments into nested structure
function organizeComments(comments: Comment[]): Comment[] {
	const commentMap = new Map<string, Comment>();
	const rootComments: Comment[] = [];

	// First pass: create map of all comments
	comments.forEach((comment) => {
		commentMap.set(comment.id, { ...comment, replies: [] });
	});

	// Second pass: organize into tree structure
	comments.forEach((comment) => {
		if (comment.parentCommentId) {
			const parent = commentMap.get(comment.parentCommentId);
			if (parent) {
				parent.replies = parent.replies || [];
				parent.replies.push(commentMap.get(comment.id)!);
			}
		} else {
			rootComments.push(commentMap.get(comment.id)!);
		}
	});

	return rootComments;
}

// Helper function to get reaction counts and user's reaction status
async function getCommentReactions(
	commentId: string,
	userId?: string
): Promise<{
	like: { count: number; isActive: boolean };
	helpful: { count: number; isActive: boolean };
	thanks: { count: number; isActive: boolean };
}> {
	try {
		// Get reaction counts
		const countQuery = `
			SELECT reaction_type, COUNT(*) as count
			FROM reactions 
			WHERE comment_id = ?
			GROUP BY reaction_type
		`;
		const countResult = await db.query(countQuery, [commentId]);
		const counts = countResult.rows;

		// Get user's reactions if userId provided
		let userReactions = [];
		if (userId) {
			const userReactionQuery = `
				SELECT reaction_type 
				FROM reactions 
				WHERE comment_id = ? AND user_id = ?
			`;
			const userReactionResult = await db.query(userReactionQuery, [
				commentId,
				userId,
			]);
			userReactions = userReactionResult.rows;
		}

		const likeCount =
			counts.find((c: any) => c.reaction_type === "like")?.count || 0;
		const helpfulCount =
			counts.find((c: any) => c.reaction_type === "helpful")?.count || 0;
		const thanksCount =
			counts.find((c: any) => c.reaction_type === "thanks")?.count || 0;

		const userLikeReaction = userReactions.some(
			(r: any) => r.reaction_type === "like"
		);
		const userHelpfulReaction = userReactions.some(
			(r: any) => r.reaction_type === "helpful"
		);
		const userThanksReaction = userReactions.some(
			(r: any) => r.reaction_type === "thanks"
		);

		return {
			like: { count: parseInt(likeCount), isActive: userLikeReaction },
			helpful: {
				count: parseInt(helpfulCount),
				isActive: userHelpfulReaction,
			},
			thanks: {
				count: parseInt(thanksCount),
				isActive: userThanksReaction,
			},
		};
	} catch (error) {
		console.error("Error fetching reactions:", error);
		return {
			like: { count: 0, isActive: false },
			helpful: { count: 0, isActive: false },
			thanks: { count: 0, isActive: false },
		};
	}
}

// GET: Fetch comments for a post
export async function GET(request: NextRequest) {
	const token = request.cookies.get("token")!.value;
	const currentUser = parseUserToken(token)!;
	const currentUserId = currentUser.id;
	try {
		const { searchParams } = new URL(request.url);
		const postId = searchParams.get("postId");

		if (!postId) {
			return NextResponse.json(
				{ error: "Post ID is required" },
				{ status: 400 }
			);
		}

		// Query to get all comments for the post
		const query = `
			SELECT 
				c.id,
				c.post_id as postId,
				c.parent_comment_id as parentCommentId,
				c.content,
				c.user_id as authorId,
				c.is_anonymous as isAnonymous,
				c.is_deleted as isDeleted,
				c.created_at as createdAt,
				c.updated_at as updatedAt,
				CASE 
					WHEN c.is_anonymous = true THEN 'Anonymous'
					ELSE COALESCE(NULLIF(u.username, ''), u.first_name || ' ' || u.last_name)
				END as author
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.post_id = $1 AND c.is_deleted = false
			ORDER BY c.created_at ASC
		`;

		const result = await db.query(query, [postId]);
		const comments = result.rows;

		// Add reactions to each comment
		const commentsWithReactions = await Promise.all(
			comments.map(async (comment: any) => ({
				...comment,
				reactions: await getCommentReactions(comment.id, currentUserId),
			}))
		);

		// Organize comments into nested structure
		const organizedComments = organizeComments(commentsWithReactions);

		return NextResponse.json(organizedComments);
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 }
		);
	}
}

// POST: Create a new comment or reply
export async function POST(request: NextRequest) {
	try {
		// Parse user token to get current user
		const token = request.cookies.get("token");
		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const currentUser = parseUserToken(token.value);
		if (!currentUser?.id) {
			return NextResponse.json(
				{ error: "Invalid user token" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { postId, parentCommentId, content, isAnonymous = false } = body;

		// Validation
		if (!postId || !content) {
			return NextResponse.json(
				{ error: "Post ID and content are required" },
				{ status: 400 }
			);
		}

		if (content.trim().length === 0) {
			return NextResponse.json(
				{ error: "Comment content cannot be empty" },
				{ status: 400 }
			);
		}

		if (content.length > 1000) {
			return NextResponse.json(
				{ error: "Comment content cannot exceed 1000 characters" },
				{ status: 400 }
			);
		}

		// Verify post exists
		const postCheckQuery = "SELECT id FROM posts WHERE id = $1";
		const postCheckResult = await db.query(postCheckQuery, [postId]);
		if (postCheckResult.rows.length === 0) {
			return NextResponse.json(
				{ error: "Post not found" },
				{ status: 404 }
			);
		}

		// If it's a reply, verify parent comment exists
		if (parentCommentId) {
			const parentCheckQuery =
				"SELECT id FROM comments WHERE id = $1 AND post_id = $2 AND is_deleted = false";
			const parentCheckResult = await db.query(parentCheckQuery, [
				parentCommentId,
				postId,
			]);
			if (parentCheckResult.rows.length === 0) {
				return NextResponse.json(
					{ error: "Parent comment not found" },
					{ status: 404 }
				);
			}
		}

		// Insert comment into database - let UUID be generated by default
		const insertQuery = `
			INSERT INTO comments (post_id, parent_comment_id, content, user_id, is_anonymous)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, created_at, updated_at
		`;

		const insertResult = await db.query(insertQuery, [
			postId,
			parentCommentId || null,
			content.trim(),
			currentUser.id,
			isAnonymous,
		]);

		const insertedComment = insertResult.rows[0];
		const commentId = insertedComment.id;
		const createdAt = insertedComment.created_at;
		const updatedAt = insertedComment.updated_at;

		// Get user name for response
		let authorName = "Anonymous";
		if (!isAnonymous) {
			const userQuery =
				"SELECT username, first_name, last_name FROM users WHERE id = $1";
			const userResult = await db.query(userQuery, [currentUser.id]);
			if (userResult.rows.length > 0) {
				const user = userResult.rows[0];
				authorName =
					user.username || `${user.first_name} ${user.last_name}`;
			}
		}

		// Create response comment object
		const newComment: Comment = {
			id: commentId,
			postId,
			parentCommentId: parentCommentId || undefined,
			content: content.trim(),
			author: authorName,
			authorId: currentUser.id,
			isAnonymous,
			isDeleted: false,
			createdAt: createdAt,
			updatedAt: updatedAt,
			reactions: {
				like: { count: 0, isActive: false },
				helpful: { count: 0, isActive: false },
				thanks: { count: 0, isActive: false },
			},
			replies: [],
		};

		return NextResponse.json(newComment, { status: 201 });
	} catch (error) {
		console.error("Error creating comment:", error);
		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 }
		);
	}
}

// PUT: Update a comment
export async function PUT(request: NextRequest) {
	try {
		// Parse user token to get current user
		const token = request.cookies.get("token");
		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const currentUser = parseUserToken(token.value);
		if (!currentUser?.id) {
			return NextResponse.json(
				{ error: "Invalid user token" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { commentId, content } = body;

		// Validation
		if (!commentId || !content) {
			return NextResponse.json(
				{ error: "Comment ID and content are required" },
				{ status: 400 }
			);
		}

		if (content.trim().length === 0) {
			return NextResponse.json(
				{ error: "Comment content cannot be empty" },
				{ status: 400 }
			);
		}

		if (content.length > 1000) {
			return NextResponse.json(
				{ error: "Comment content cannot exceed 1000 characters" },
				{ status: 400 }
			);
		}

		// Check if comment exists and user owns it
		const checkQuery = `
			SELECT id, user_id, is_deleted 
			FROM comments 
			WHERE id = ?
		`;
		const commentResult = await db.query(checkQuery, [commentId]);

		if (commentResult.rows.length === 0) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		const comment = commentResult.rows[0];
		if (comment.is_deleted) {
			return NextResponse.json(
				{ error: "Cannot edit deleted comment" },
				{ status: 400 }
			);
		}

		if (comment.user_id !== currentUser.id) {
			return NextResponse.json(
				{ error: "Unauthorized to edit this comment" },
				{ status: 403 }
			);
		}

		// Update comment
		const updateQuery = `
			UPDATE comments 
			SET content = $1, updated_at = CURRENT_TIMESTAMP
			WHERE id = $2
			RETURNING updated_at
		`;
		await db.query(updateQuery, [
			content.trim(),
			commentId,
		]);

		// Get updated comment with user info
		const getUpdatedQuery = `
			SELECT 
				c.id,
				c.post_id as postId,
				c.parent_comment_id as parentCommentId,
				c.content,
				c.user_id as authorId,
				c.is_anonymous as isAnonymous,
				c.is_deleted as isDeleted,
				c.created_at as createdAt,
				c.updated_at as updatedAt,
				CASE 
					WHEN c.is_anonymous = true THEN 'Anonymous'
					ELSE COALESCE(u.username, u.first_name || ' ' || u.last_name)
				END as author
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.id = $1
		`;

		const updatedCommentResult = await db.query(getUpdatedQuery, [
			commentId,
		]);
		const updatedComment = updatedCommentResult.rows[0];

		// Add reactions
		updatedComment.reactions = await getCommentReactions(
			commentId,
			currentUser.id
		);
		updatedComment.replies = [];

		return NextResponse.json(updatedComment);
	} catch (error) {
		console.error("Error updating comment:", error);
		return NextResponse.json(
			{ error: "Failed to update comment" },
			{ status: 500 }
		);
	}
}

// DELETE: Delete a comment (soft delete)
export async function DELETE(request: NextRequest) {
	try {
		// Parse user token to get current user
		const token = request.cookies.get("token");
		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const currentUser = parseUserToken(token.value);
		if (!currentUser?.id) {
			return NextResponse.json(
				{ error: "Invalid user token" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const commentId = searchParams.get("commentId");

		if (!commentId) {
			return NextResponse.json(
				{ error: "Comment ID is required" },
				{ status: 400 }
			);
		}

		// Check if comment exists and user owns it
		const checkQuery = `
			SELECT id, user_id, is_deleted 
			FROM comments 
			WHERE id = $1
		`;
		const commentResult = await db.query(checkQuery, [commentId]);

		if (commentResult.rows.length === 0) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		const comment = commentResult.rows[0];
		if (comment.is_deleted) {
			return NextResponse.json(
				{ error: "Comment already deleted" },
				{ status: 400 }
			);
		}

		if (comment.user_id !== currentUser.id) {
			return NextResponse.json(
				{ error: "Unauthorized to delete this comment" },
				{ status: 403 }
			);
		}

		// Soft delete the comment (and optionally its replies)
		const deleteQuery = `
			UPDATE comments 
			SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
			WHERE id = $1 OR parent_comment_id = $1
		`;
		await db.query(deleteQuery, [commentId, commentId]);

		return NextResponse.json({ message: "Comment deleted successfully" });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 }
		);
	}
}
