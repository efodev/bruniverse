import { NextRequest, NextResponse } from "next/server";
import { toggleReactionQuery } from "@/app/database/query";
import db, { DatabaseError, handleDatabaseError } from "@/app/database/db";
interface ToggleReactionRequest {
	userId: string;
	reactionType: "heart" | "share" | "star";
	postId?: string | null;
	commentId?: string | null;
}

export async function POST(request: NextRequest): Promise<void> {
	try {
		const { reactionType, postId, commentId }: ToggleReactionRequest =
			await request.json();

		const userId = request.headers.get("x-user-data");
		// Validation
		if (!userId || !reactionType) {
			NextResponse.json(
				{
					success: false,
					message: "userId and reactionType are required",
				},
				{ status: 400 }
			);
			return;
		}

		if (!postId && !commentId) {
			NextResponse.json(
				{
					success: false,
					message: "Either postId or commentId must be provided",
				},
				{ status: 400 }
			);
			return;
		}

		if (postId && commentId) {
			NextResponse.json(
				{
					success: false,
					message:
						"Cannot react to both post and comment simultaneously",
				},
				{ status: 400 }
			);
			return;
		}

		if (!["heart", "share", "star"].includes(reactionType)) {
			NextResponse.json(
				{
					success: false,
					message: "Invalid reaction type",
				},
				{ status: 400 }
			);
			return;
		}

		const result = await db.query(toggleReactionQuery, [
			userId,
			reactionType,
			postId,
			commentId,
		]);
		const data = result.rows[0];
		if (data || data.length === 0) {
			NextResponse.json(
				{
					success: false,
					message: "Failed to toggle reaction",
				},
				{ status: 500 }
			);
			return;
		}

		const { count, is_active, action } = data;

		NextResponse.json(
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
		NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}

// // Alternative query function for getting initial reaction states
// export const getReactionStates = async (
// 	userId: string,
// 	targetId: string,
// 	targetType: "post" | "comment"
// ): Promise<Record<string, { isActive: boolean; count: number }>> => {
// 	const query = `
//     SELECT
//       reaction_type,
//       COUNT(*) as total_count,
//       COUNT(CASE WHEN user_id = $1 THEN 1 END) > 0 as is_active
//     FROM reactions
//     WHERE ${targetType === "post" ? "post_id" : "comment_id"} = $2
//     GROUP BY reaction_type;
//   `;

// 	const db = getDatabase();
// 	const result = await db.query({
// 		text: query,
// 		values: [userId, targetId],
// 	});

// 	if (!result.success) {
// 		throw new Error("Failed to fetch reaction states");
// 	}

// 	// Transform result into the expected format
// 	const states: Record<string, { isActive: boolean; count: number }> = {};

// 	result.data?.forEach((row: any) => {
// 		states[row.reaction_type] = {
// 			isActive: row.is_active,
// 			count: parseInt(row.total_count),
// 		};
// 	});

// 	// Ensure all reaction types have a state
// 	["heart", "share", "star"].forEach((reactionType) => {
// 		if (!states[reactionType]) {
// 			states[reactionType] = { isActive: false, count: 0 };
// 		}
// 	});

// 	return states;
// };
