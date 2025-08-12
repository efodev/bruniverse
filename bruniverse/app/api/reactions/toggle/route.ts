import { NextRequest, NextResponse } from "next/server";
import { toggleReactionQuery } from "@/app/database/query";
import db, { DatabaseError, handleDatabaseError } from "@/app/database/db";
import { parseUserToken } from "../../lib";

interface ToggleReactionRequest {
	userId?: string;
	reactionType: "heart" | "share" | "star";
	postId?: string | null;
	commentId?: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const { reactionType, postId, commentId }: ToggleReactionRequest =
			await request.json();
		console.log(`${reactionType} ${postId} ${commentId}`);

		// Get authenticated user
		const token = request.cookies.get("token")?.value;
		const userData = parseUserToken(token!);
		const userId = userData?.id;

		// Validation
		if (!userId || !reactionType) {
			return NextResponse.json(
				{
					success: false,
					message: "userId and reactionType are required",
				},
				{ status: 400 }
			);
		}

		if (!postId && !commentId) {
			return NextResponse.json(
				{
					success: false,
					message: "Either postId or commentId must be provided",
				},
				{ status: 400 }
			);
		}

		if (postId && commentId) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Cannot react to both post and comment simultaneously",
				},
				{ status: 400 }
			);
		}

		if (!["heart", "share", "star"].includes(reactionType)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid reaction type",
				},
				{ status: 400 }
			);
		}

		// Prepare parameters with explicit null handling
		const params = [
			userId,
			reactionType,
			postId || null,
			commentId || null,
		];

		const result = await db.query(toggleReactionQuery, params);
		const data = result.rows[0];

		// Fixed condition logic
		if (!data || result.rows.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Failed to toggle reaction",
				},
				{ status: 500 }
			);
		}

		const { count, is_active, action } = data;

		return NextResponse.json(
			{
				success: true,
				count: parseInt(count),
				is_active,
				action,
				message: `Reaction ${action === "inserted" ? "added" : action === "deleted" ? "removed" : "unchanged"}`,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Toggle reaction error:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
