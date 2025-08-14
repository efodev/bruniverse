import { useState } from "react";
import { Heart, Share, Star } from "lucide-react";

import { ReactionType, ReactionProps, ReactionState } from "../definitions";

const reactionConfig = {
	heart: {
		icon: Heart,
		activeColor: "text-pink-500 bg-pink-50",
		hoverColor: "hover:text-pink-400 hover:bg-pink-50",
		label: "heart",
	},
	share: {
		icon: Share,
		activeColor: "text-blue-500 bg-blue-50",
		hoverColor: "hover:text-blue-400 hover:bg-blue-50",
		label: "share",
	},
	star: {
		icon: Star,
		activeColor: "text-yellow-500 bg-yellow-50",
		hoverColor: "hover:text-yellow-400 hover:bg-yellow-50",
		label: "star",
	},
} as const;

const zeroState: ReactionState = { isActive: false, count: 0 };

export const Reactions = ({
	size = 18,
	postId,
	commentId,
	onReact,
	allowedReactions = { heart: true, share: true, star: true },
	initialStates = {},
	className = "",
}: ReactionProps) => {
	const [reactions, setReactions] = useState<
		Record<ReactionType, ReactionState>
	>({
		heart: initialStates.heart || zeroState,
		share: initialStates.share || zeroState,
		star: initialStates.star || zeroState,
	});

	const [isLoading, setIsLoading] = useState<ReactionType | null>(null);

	const handleReactionClick = async (reactionType: ReactionType) => {
		if (isLoading) return;

		setIsLoading(reactionType);

		try {
			// Call the database function
			const result = await onReact(reactionType, postId, commentId);

			// Update local state with server response
			setReactions((prev) => ({
				...prev,
				[reactionType]: {
					isActive: result.isActive,
					count: result.count,
				},
			}));
		} catch (error) {
			console.error("Failed to toggle reaction:", error);
			// Optionally show error toast/notification
		} finally {
			setIsLoading(null);
		}
	};

	const enabledReactions = (
		Object.keys(allowedReactions) as ReactionType[]
	).filter((reaction) => allowedReactions[reaction]);

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{enabledReactions.map((reactionType) => {
				const config = reactionConfig[reactionType];
				const reaction = reactions[reactionType];
				const Icon = config.icon;
				const showCount = reaction.count > 0;
				const isCurrentlyLoading = isLoading === reactionType;

				return (
					<button
						key={reactionType}
						onClick={() => handleReactionClick(reactionType)}
						disabled={isCurrentlyLoading}
						className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-full 
              transition-all duration-200 ease-in-out
              ${
					reaction.isActive
						? `${config.activeColor} scale-95`
						: `text-gray-500 hover:scale-105 ${config.hoverColor}`
				}
              ${showCount ? "min-w-[3rem]" : "min-w-[2.5rem]"}
              border border-transparent hover:border-gray-200
              ${isCurrentlyLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
						aria-label={`${config.label}${showCount ? ` (${reaction.count})` : ""}`}
					>
						<Icon
							size={size}
							fill={reaction.isActive ? "currentColor" : "none"}
							className={`flex-shrink-0 z-5 ${isCurrentlyLoading ? "animate-pulse" : ""}`}
						/>
						{showCount && (
							<span
								className={`
                text-xs font-medium tabular-nums
                ${reaction.isActive ? "text-current" : "text-gray-600"}
              `}
							>
								{reaction.count > 999 ? "999+" : reaction.count}
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
};
