// app/api/posts/route.ts (App Router) or pages/api/posts.ts (Pages Router)
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/db";

interface CreatePostRequest {
	title: string;
	content: string;
	categoryId: string;
	is_anonymous: boolean;
}

interface UserData {
	id: string;
	email?: string;
	role?: string;
	// Add other user data fields as needed
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

// Helper function to parse user data from header
function parseUserData(userDataHeader: string | null): UserData | null {
	if (!userDataHeader) return null;

	try {
		return JSON.parse(userDataHeader) as UserData;
	} catch (error) {
		console.error("Failed to parse user data from header:", error);
		return null;
	}
}

// Helper function to validate input
function validatePostInput(body: any): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!body.title || typeof body.title !== "string") {
		errors.push("Title is required and must be a string");
	} else if (body.title.trim().length === 0) {
		errors.push("Title cannot be empty");
	} else if (body.title.length > 50) {
		errors.push("Title must be 50 characters or less");
	}

	if (!body.content || typeof body.content !== "string") {
		errors.push("Content is required and must be a string");
	} else if (body.content.trim().length === 0) {
		errors.push("Content cannot be empty");
	}

	if (!body.categoryId || typeof body.categoryId !== "string") {
		errors.push("Category ID is required and must be a string");
	}

	if (typeof body.is_anonymous !== "boolean") {
		errors.push("is_anonymous must be a boolean");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

// App Router version (app/api/posts/route.ts)
export async function POST(request: NextRequest) {
	try {
		// Get user data from header
		const userDataHeader = request.headers.get("x-user-data");
		const userData = parseUserData(userDataHeader);

		if (!userData || !userData.id) {
			console.log("User authentication required ", userData?.id);
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
		const validation = validatePostInput(body);
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

		// Insert post into database
		const result = await db.query(createPostQuery, [
			userData.id,
			body.categoryId,
			body.title.trim(),
			body.content.trim(),
			body.is_anonymous,
		]);

		const newPost = result?.rows[0];
		if (newPost || newPost.length === 0) {
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

// Pages Router version (pages/api/posts.ts)
// import { NextApiRequest, NextApiResponse } from 'next';
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({
//       success: false,
//       error: 'METHOD_NOT_ALLOWED',
//       message: 'Only POST method is allowed',
//     });
//   }
//
//   try {
//     // Get user data from header
//     const userDataHeader = req.headers['x-user-data'] as string;
//     const userData = parseUserData(userDataHeader);
//
//     if (!userData || !userData.id) {
//       return res.status(401).json({
//         success: false,
//         error: 'UNAUTHORIZED',
//         message: 'User authentication required',
//       });
//     }
//
//     // Parse request body
//     const body: CreatePostRequest = req.body;
//
//     // Validate input
//     const validation = validatePostInput(body);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         error: 'VALIDATION_ERROR',
//         message: 'Invalid input data',
//         errors: validation.errors,
//       });
//     }
//
//     // Database logic (same as above)
//     const db = getDatabase();
//     const result = await db.query({
//       text: createPostQuery,
//       values: [
//         userData.id,
//         body.categoryId,
//         body.title.trim(),
//         body.content.trim(),
//         body.is_anonymous,
//       ],
//     });
//
//     if (!result.success || !result.data || result.data.length === 0) {
//       return res.status(500).json({
//         success: false,
//         error: 'DATABASE_ERROR',
//         message: 'Failed to create post',
//       });
//     }
//
//     const newPost = result.data[0];
//
//     return res.status(201).json({
//       success: true,
//       message: 'Post created successfully',
//       data: {
//         id: newPost.id,
//         title: newPost.title,
//         content: newPost.content,
//         categoryId: newPost.category_id,
//         isAnonymous: newPost.is_anonymous,
//         moderationStatus: newPost.moderation_status,
//         createdAt: newPost.created_at,
//       },
//     });
//
//   } catch (error) {
//     console.error('Create post error:', error);
//
//     if (error instanceof Error && error.message.includes('foreign key constraint')) {
//       return res.status(400).json({
//         success: false,
//         error: 'INVALID_REFERENCE',
//         message: 'Invalid user ID or category ID',
//       });
//     }
//
//     return res.status(500).json({
//       success: false,
//       error: 'INTERNAL_ERROR',
//       message: 'Internal server error',
//     });
//   }
// }

// Example usage in frontend:
/*
const createPost = async (postData: CreatePostRequest) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-data': JSON.stringify({ id: 'user-123' }), // From auth context
    },
    body: JSON.stringify(postData),
  });
  
  return await response.json();
};

// Usage:
const result = await createPost({
  title: 'My New Post',
  content: 'This is the content of my post...',
  categoryId: 'category-456',
  is_anonymous: false,
});
*/
