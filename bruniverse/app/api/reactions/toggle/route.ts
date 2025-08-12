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

		const data = await toggleReaction(
			userId,
			reactionType,
			postId!,
			commentId!
		);

		const { count, is_active, action } = data;

		return NextResponse.json(
			{
				success: true,
				count: count,
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

// More reliable approach - use separate queries in sequence
export async function toggleReaction(
	userId: string,
	reactionType: string,
	postId: string | null,
	commentId: string | null
) {
	try {
		await db.query("BEGIN");

		// 1. Check if reaction exists
		const existingQuery = `
            SELECT id FROM reactions 
            WHERE user_id = $1 AND reaction_type = $2
            AND (
                ($3::uuid IS NOT NULL AND post_id = $3::uuid AND comment_id IS NULL) OR 
                ($4::uuid IS NOT NULL AND comment_id = $4::uuid AND post_id IS NULL)
            )
        `;

		const existing = await db.query(existingQuery, [
			userId,
			reactionType,
			postId,
			commentId,
		]);

		let action: string;

		if (existing.rows.length > 0) {
			// 2a. Delete existing reaction
			await db.query(
				`
                DELETE FROM reactions 
                WHERE user_id = $1 AND reaction_type = $2
                AND (
                    ($3::uuid IS NOT NULL AND post_id = $3::uuid AND comment_id IS NULL) OR 
                    ($4::uuid IS NOT NULL AND comment_id = $4::uuid AND post_id IS NULL)
                )
            `,
				[userId, reactionType, postId, commentId]
			);
			action = "deleted";
		} else {
			// 2b. Insert new reaction
			await db.query(
				`
                INSERT INTO reactions (user_id, post_id, comment_id, reaction_type)
                VALUES ($1, $2, $3, $4)
            `,
				[userId, postId, commentId, reactionType]
			);
			action = "inserted";
		}

		// 3. Get final stats
		const statsQuery = `
            SELECT 
                COUNT(*) as total_count,
                BOOL_OR(user_id = $1) as is_active
            FROM reactions 
            WHERE reaction_type = $2
            AND (
                ($3::uuid IS NOT NULL AND post_id = $3::uuid AND comment_id IS NULL) OR 
                ($4::uuid IS NOT NULL AND comment_id = $4::uuid AND post_id IS NULL)
            )
        `;

		const statsResult = await db.query(statsQuery, [
			userId,
			reactionType,
			postId,
			commentId,
		]);
		const stats = statsResult.rows[0];

		await db.query("COMMIT");

		return {
			count: parseInt(stats.total_count),
			is_active: stats.is_active,
			action,
		};
	} catch (error) {
		await db.query("ROLLBACK");
		throw error;
	} finally {
		db.close();
	}
}
