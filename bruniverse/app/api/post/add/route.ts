// app/api/posts/route.ts (App Router) or pages/api/posts.ts (Pages Router)
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/db";
import { validateApiPostInput, parseUserData } from "../../lib";

interface CreatePostRequest {
	title: string;
	content: string;
	categoryId: string;
	is_anonymous: boolean;
}

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
  created_at;
`;

// App Router version (app/api/posts/route.ts)
export async function POST(request: NextRequest) {
	try {
		// Get user data from header
		const userDataHeader = request.headers.get("x-user-data");
		const userData = parseUserData(userDataHeader);

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
		console.log("body ", [
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
		if (newPost?.length === 0) {
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
