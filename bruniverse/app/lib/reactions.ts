// Example backend integration function
import { ReactionType } from "../ui/definitions";
export const createReactionHandler = () => {
	return async (
		reactionType: ReactionType,
		postId?: string,
		commentId?: string
	) => {
		const response = await fetch("/api/reactions/toggle", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				reactionType,
				postId: postId || null,
				commentId: commentId || null,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to toggle reaction");
		}

		const data = await response.json();
		return {
			count: data.count,
			isActive: data.is_active,
		};
	};
};
