// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/db";

// Mock database - replace with your actual database implementation
interface Comment {
	id: string;
	postId: string;
	parentCommentId?: string;
	content: string;
	author: string;
	authorId: string;
	createdAt: string;
	reactions: {
		heart: { count: number; isActive: boolean };
		star: { count: number; isActive: boolean };
	};
	replies?: Comment[];
}

// This would be your actual database
let commentsDB: Comment[] = [
	{
		id: "1",
		postId: "post1",
		content: "This is a great post!",
		author: "Alice Johnson",
		authorId: "user1",
		createdAt: "2 hours ago",
		reactions: {
			heart: { count: 3, isActive: false },
			star: { count: 1, isActive: true },
		},
		replies: [
			{
				id: "2",
				postId: "post1",
				parentCommentId: "1",
				content: "I totally agree with you!",
				author: "Bob Smith",
				authorId: "user2",
				createdAt: "1 hour ago",
				reactions: {
					heart: { count: 1, isActive: false },
					star: { count: 0, isActive: false },
				},
			},
		],
	},
];

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

// GET: Fetch comments for a post
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const postId = searchParams.get("postId");

		if (!postId) {
			return NextResponse.json(
				{ error: "Post ID is required" },
				{ status: 400 }
			);
		}

		// Filter comments for the specific post
		const postComments = commentsDB.filter(
			(comment) => comment.postId === postId
		);

		// Organize comments into nested structure
		const organizedComments = organizeComments(postComments);

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
		const body = await request.json();
		const { postId, parentCommentId, content } = body;

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

		// In a real app, you'd get this from authentication
		const currentUser = {
			id: "current-user-id",
			name: "Current User",
		};

		// Create new comment
		const newComment: Comment = {
			id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			postId,
			parentCommentId: parentCommentId || undefined,
			content: content.trim(),
			author: currentUser.name,
			authorId: currentUser.id,
			createdAt: "just now",
			reactions: {
				heart: { count: 0, isActive: false },
				star: { count: 0, isActive: false },
			},
			replies: [],
		};

		// Add to database
		commentsDB.push(newComment);

		// Return the created comment
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
		const body = await request.json();
		const { commentId, content } = body;

		// Validation
		if (!commentId || !content) {
			return NextResponse.json(
				{ error: "Comment ID and content are required" },
				{ status: 400 }
			);
		}

		// Find and update comment
		const commentIndex = commentsDB.findIndex(
			(comment) => comment.id === commentId
		);
		if (commentIndex === -1) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		// In a real app, check if user owns the comment
		const currentUserId = "current-user-id";
		if (commentsDB[commentIndex].authorId !== currentUserId) {
			return NextResponse.json(
				{ error: "Unauthorized to edit this comment" },
				{ status: 403 }
			);
		}

		commentsDB[commentIndex].content = content.trim();

		return NextResponse.json(commentsDB[commentIndex]);
	} catch (error) {
		console.error("Error updating comment:", error);
		return NextResponse.json(
			{ error: "Failed to update comment" },
			{ status: 500 }
		);
	}
}

// DELETE: Delete a comment
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const commentId = searchParams.get("commentId");

		if (!commentId) {
			return NextResponse.json(
				{ error: "Comment ID is required" },
				{ status: 400 }
			);
		}

		// Find comment
		const commentIndex = commentsDB.findIndex(
			(comment) => comment.id === commentId
		);
		if (commentIndex === -1) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		// In a real app, check if user owns the comment
		const currentUserId = "current-user-id";
		if (commentsDB[commentIndex].authorId !== currentUserId) {
			return NextResponse.json(
				{ error: "Unauthorized to delete this comment" },
				{ status: 403 }
			);
		}

		// Remove comment and its replies
		const commentToDelete = commentsDB[commentIndex];
		commentsDB = commentsDB.filter(
			(comment) =>
				comment.id !== commentId &&
				comment.parentCommentId !== commentId
		);

		return NextResponse.json({ message: "Comment deleted successfully" });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 }
		);
	}
}

// Alternative route for nested comments API structure
// app/api/posts/[postId]/comments/route.ts
export const POST_NESTED = async (
	request: NextRequest,
	{ params }: { params: { postId: string } }
) => {
	const postId = params.postId;
	// Same logic as POST above but with postId from URL params
	// This provides a more RESTful API structure
};

// Alternative route for individual comment operations
// app/api/comments/[commentId]/route.ts
export const GET_SINGLE = async (
	request: NextRequest,
	{ params }: { params: { commentId: string } }
) => {
	const commentId = params.commentId;
	const comment = commentsDB.find((c) => c.id === commentId);

	if (!comment) {
		return NextResponse.json(
			{ error: "Comment not found" },
			{ status: 404 }
		);
	}

	return NextResponse.json(comment);
};

// Database integration example (replace with your actual database)
/*
// With Prisma
async function getComments(postId: string) {
  return await prisma.comment.findMany({
    where: { postId },
    include: {
      author: true,
      replies: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// With MongoDB
async function getComments(postId: string) {
  return await db.collection('comments')
    .find({ postId })
    .sort({ createdAt: -1 })
    .toArray();
}
*/
