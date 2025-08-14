import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	Plus,
	ChevronDown,
	Search,
	Menu,
	X,
	ArrowLeft,
	ArrowRight,
	MoreHorizontal,
	Edit2,
	Trash2,
	AlertTriangle,
} from "lucide-react";
import { Reactions } from "../util/reactions";
import { createReactionHandler } from "@/app/lib/reactions";
import { PostCreationModal } from "./create";
import { Post, Comment } from "../definitions";
import {
	createPost,
	deletePost,
	fetchPosts,
	updatePost,
} from "@/app/lib/post/util";
import { fetchCategories } from "@/app/post/all/page";
import { PostNavigation } from "../navigation";

// Types
interface Category {
	id: string;
	name: string;
}

interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalPosts: number;
	postsPerPage: number;
}

interface LeftSideBarTopLevelItemsProps {
	id: string;
	name: string;
	hasDropdown: boolean;
	dropdownItems?: { id: string; name: string }[];
}

// Mock API functions
// const fetchMockPosts = async (
// 	page: number,
// 	category: string,
// 	search: string
// ): Promise<{ posts: Post[]; pagination: PaginationInfo }> => {
// 	// Simulate API delay
// 	await new Promise((resolve) => setTimeout(resolve, 300));

// 	const mockPosts = [
// 		{
// 			id: "170",
// 			title: "Looking for Internship Advice",
// 			author: "Melody Chen",
// 			createdAt: "2 days ago",
// 			category: "questions",
// 			reactions: {
// 				heart: { isActive: true, count: 12 },
// 				star: { isActive: false, count: 3 },
// 			},
// 			content: `Hey everyone! 👋\nHope you're all doing great! I'm currently starting to think about internships and wanted to ask for some advice from folks who've been through the process. I'm especially interested in roles related to creative tech, product design, music + AI.\nFeel free to drop any advice here or DM me — I really appreciate it! 🙏\nThanks in advance!!`,
// 			comments: [
// 				{
// 					id: "1",
// 					title: "",
// 					content:
// 						"Hi! I'm here offering some advice. I would say talk to people from both the CS department and Music Department at Brown.",
// 					category: "",
// 					author: "Bruce Liang",
// 					createdAt: "",
// 					reactions: {
// 						heart: { isActive: true, count: 5 },
// 						star: { isActive: false, count: 4 },
// 					},
// 					comments: [],
// 				},
// 			],
// 		},
// 		{
// 			id: "169",
// 			title: "Study Group for CS150",
// 			author: "Alex Kim",
// 			createdAt: "1 day ago",
// 			category: "on-campus",
// 			reactions: {
// 				heart: { isActive: true, count: 12 },
// 				star: { isActive: false, count: 3 },
// 			},
// 			content: `Looking for people to form a study group for CS150. We can meet twice a week to go over problem sets and prepare for exams together.`,
// 			comments: [
// 				{
// 					id: "2",
// 					title: "",
// 					content: "I'm interested! What days work best for you?",
// 					category: "",
// 					author: "Sarah Johnson",
// 					createdAt: "",
// 					reactions: {
// 						heart: { isActive: true, count: 12 },
// 						star: { isActive: false, count: 3 },
// 					},
// 					comments: [],
// 				},
// 			],
// 		},
// 		// Add more mock posts...
// 	];

// 	// Filter posts based on category and search
// 	let filteredPosts = mockPosts;
// 	if (category !== "all") {
// 		filteredPosts = mockPosts.filter((post) => post.category === category);
// 	}
// 	if (search) {
// 		filteredPosts = filteredPosts.filter(
// 			(post) =>
// 				post.title.toLowerCase().includes(search.toLowerCase()) ||
// 				post.content.toLowerCase().includes(search.toLowerCase())
// 		);
// 	}

// 	const postsPerPage = 5;
// 	const startIndex = (page - 1) * postsPerPage;
// 	const endIndex = startIndex + postsPerPage;
// 	const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

// 	return {
// 		posts: paginatedPosts,
// 		pagination: {
// 			currentPage: page,
// 			totalPages: Math.ceil(filteredPosts.length / postsPerPage),
// 			totalPosts: filteredPosts.length,
// 			postsPerPage,
// 		},
// 	};
// };

// Loading Skeleton Component
const PostSkeleton = () => (
	<div className="p-4 border-b border-gray-200 animate-pulse bg-inherit">
		<div className="flex items-start space-x-3">
			<div className="w-12 h-12 bg-gray-300 rounded-full"></div>
			<div className="flex-1 space-y-2">
				<div className="h-4 bg-gray-300 rounded w-3/4"></div>
				<div className="h-3 bg-gray-300 rounded w-1/2"></div>
				<div className="h-3 bg-gray-300 rounded w-1/4"></div>
			</div>
		</div>
	</div>
);

// Pagination Component
const Pagination = ({
	pagination,
	onPageChange,
}: {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
}) => {
	const { currentPage, totalPages } = pagination;

	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	};

	return (
		<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-inherit">
			<div className="flex items-center text-sm text-gray-500">
				Showing {(currentPage - 1) * pagination.postsPerPage + 1} to{" "}
				{Math.min(
					currentPage * pagination.postsPerPage,
					pagination.totalPosts
				)}{" "}
				of {pagination.totalPosts} posts
			</div>
			<div className="flex items-center space-x-1">
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ArrowLeft size={16} />
				</button>

				{getPageNumbers().map((page) => (
					<button
						key={page}
						onClick={() => onPageChange(page)}
						className={`px-3 py-1 text-sm rounded ${
							page === currentPage
								? "bg-amber-600 text-white"
								: "text-gray-700 hover:bg-gray-100"
						}`}
					>
						{page}
					</button>
				))}

				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ArrowRight size={16} />
				</button>
			</div>
		</div>
	);
};

// Enhanced Left Sidebar Component
const EnhancedLeftSidebar = ({
	posts,
	selectedPost,
	onPostSelect,
	options,
	onCategoryChange,
	pagination,
	onPageChange,
	isLoading,
	isMobile,
	isOpen,
	onToggle,
	searchBar,
	createPostButton,
}: {
	posts: Post[];
	selectedPost: Post | null;
	onPostSelect: (post: Post) => void;
	options: LeftSideBarTopLevelItemsProps[];
	onCategoryChange: (category: string) => void;
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
	isLoading: boolean;
	isMobile: boolean;
	isOpen: boolean;
	onToggle: () => void;
	searchBar?: { show: boolean; onSearch: (query: string) => void };
	createPostButton?: { show: boolean; onClick: () => void };
}) => {
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>("all");

	const handleItemClick = (item: LeftSideBarTopLevelItemsProps) => {
		setActiveCategory(item.id);
		if (item.hasDropdown) {
			setOpenDropdown(openDropdown === item.id ? null : item.id);
		} else {
			onCategoryChange(item.id);
			setOpenDropdown(null);
		}
	};

	const handleDropdownItemClick = (itemId: string) => {
		onCategoryChange(itemId);
		setOpenDropdown(null);
		if (isMobile) onToggle();
	};

	const sidebarContent = (
		<div className="h-full flex flex-col bg-inherit">
			{/* Categories Section */}
			<div
				//TODO: Addd dividing borders if the searchBar is rendered
				className={`p-4 border-gray-200 border-b ${searchBar?.show ? "flex flex-col gap-2 " : ""}`}
			>
				<div className="flex flex-wrap gap-2">
					{options.map((item) => (
						<div
							key={item.id}
							className="relative"
						>
							<button
								onClick={() => handleItemClick(item)}
								className={`px-2 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
									activeCategory === item.id
										? "bg-[#B10F0F] text-white"
										: "bg-[#CC810033] hover:bg-amber-200"
								}`}
							>
								<span>{item.name}</span>
								{item.hasDropdown && <ChevronDown size={12} />}
							</button>

							{item.hasDropdown && openDropdown === item.id && (
								<div className="absolute top-full left-0 mt-1 bg-[#713F12] rounded-lg shadow-lg border border-amber-200 z-10 w-max divide-y-[0.01px]">
									{item.dropdownItems?.map((dropdownItem) => (
										<button
											key={dropdownItem.id}
											onClick={() =>
												handleDropdownItemClick(
													dropdownItem.id
												)
											}
											className="block w-full text-left px-2 py-1 text-sm text-white font-medium hover:text-red-600 border-[#CC8100B0] first:rounded-t-lg last:rounded-b-lg"
										>
											{dropdownItem.name}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</div>
				{/* Search bar */}
				{searchBar?.show && <SearchBar onSearch={searchBar.onSearch} />}
			</div>

			{/* Posts List Section */}
			{/* Posts List Section */}
			<div className="flex-1 overflow-hidden flex flex-col">
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						Array.from({ length: 3 }).map((_, i) => (
							<PostSkeleton key={i} />
						))
					) : posts.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<p>No posts found</p>
						</div>
					) : (
						posts.map((post) => (
							<div
								key={post.id}
								onClick={() => {
									onPostSelect(post);
									if (isMobile) onToggle();
								}}
								className={`p-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-amber-50 ${
									selectedPost?.id === post.id
										? "bg-amber-50 border-amber-200"
										: ""
								}`}
							>
								{/* Add a function to update user modal with random colors */}
								<div className="flex items-start space-x-3">
									<div className="size-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
										{post.author.charAt(0)}
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-medium truncate">
											{post.title}
										</h4>
										<p className="text-xs text-gray-600 mt-1">
											by {post.author}
										</p>
										<div className="flex items-center space-x-2 mt-2">
											<span className="inline-block bg-amber-100 px-2 py-1 rounded text-xs font-medium">
												{post.category}
											</span>
											<span className="text-xs text-amber-600">
												#{post.threadNumber}
											</span>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{!isLoading && posts.length > 0 && (
					<>
						{/* Floating Action Button */}
						{createPostButton?.show && (
							<div className="flex justify-end py-4 border-t border-gray-100 mr-1 mb-0">
								<button
									onClick={() => createPostButton.onClick()}
									className="w-12 h-12 bg-[#B10F0F] hover:bg-[#8B0000] active:bg-[#660000] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
								>
									<Plus size={50} />
								</button>
							</div>
						)}
						{/* Pagination */}
						<Pagination
							pagination={pagination}
							onPageChange={onPageChange}
						/>
					</>
				)}
			</div>
		</div>
	);

	if (isMobile) {
		return (
			<>
				{/* Mobile Overlay */}
				{isOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-40 bg-inherit"
						onClick={onToggle}
					/>
				)}

				{/* Mobile Sidebar */}
				<div
					className={`fixed left-0 top-0 h-full w-80 bg-inherit z-50 transform transition-transform duration-300 ${
						isOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="flex items-center justify-between p-4 border-b border-gray-200">
						<h2 className="font-semibold text-gray-900">Posts</h2>
						<button
							onClick={onToggle}
							className="p-2 text-gray-500 hover:text-gray-700"
						>
							<X size={20} />
						</button>
					</div>
					{sidebarContent}
				</div>
			</>
		);
	}

	return (
		<div className="w-96 bg-inherit border-r border-gray-200 h-full">
			{sidebarContent}
		</div>
	);
};

//Helper function to getUserData
function getUserId() {
	try {
		const userData = JSON.parse(sessionStorage.getItem("user") || "");
		if (userData) {
			return userData.id || "";
		}
	} catch (error) {
		return "";
	}
}

// Enhanced Right Content Area
const EnhancedRightContentArea = ({
	selectedPost,
	categories,
	isMobile,
	onUpdatePost,
	onDeletePost,
}: {
	selectedPost: Post | null;
	categories: Category[];
	isMobile: boolean;
	onUpdatePost: PostsComponentProps["onUpdatePost"];
	onDeletePost: PostsComponentProps["onDeletePost"];
}) => {
	const handleReaction = createReactionHandler();
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string>(getUserId()); // Replace with real auth

	// Initialize comments when post changes
	useEffect(() => {
		if (selectedPost) {
			fetchComments(selectedPost.id);
			console.log("posts: ", selectedPost);
		}
	}, [selectedPost]);
	if (comments) {
		console.log("comment", comments);
	}
	// Add new comment to post
	const handleAddComment = async (
		content: string,
		isAnonymous: boolean = false
	) => {
		if (!selectedPost) return;

		const tempId = `temp-${Date.now()}`;
		const newComment: Comment = {
			id: tempId,
			postId: selectedPost.id,
			content,
			author: isAnonymous ? "Anonymous" : "Current User",
			authorId: currentUserId,
			isAnonymous,
			isDeleted: false,
			createdAt: "just now",
			updatedAt: "just now",
			reactions: {
				heart: { count: 0, isActive: false },
				star: { count: 0, isActive: false },
			},
			replies: [],
		};

		// Optimistically add comment to top
		setComments((prev) => [newComment, ...prev]);
		setError(null);

		try {
			const response = await fetch("/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					postId: selectedPost.id,
					content,
					isAnonymous,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add comment");
			}

			const createdComment = await response.json();

			// Replace temp comment with real one
			setComments((prev) =>
				prev.map((comment) =>
					comment.id === tempId ? createdComment : comment
				)
			);

			// Refresh all comments to get latest state
			await fetchComments(selectedPost.id);
		} catch (error) {
			console.error("Failed to add comment:", error);
			setError(
				error instanceof Error ? error.message : "Failed to add comment"
			);

			// Remove optimistic comment on error
			setComments((prev) =>
				prev.filter((comment) => comment.id !== tempId)
			);
		}
	};

	// Add reply to comment
	const handleAddReply = async (
		parentCommentId: string,
		content: string,
		isAnonymous: boolean = false
	) => {
		if (!selectedPost) return;

		const tempId = `temp-reply-${Date.now()}`;
		const newReply: Comment = {
			id: tempId,
			postId: selectedPost.id,
			parentCommentId,
			content,
			author: isAnonymous ? "Anonymous" : "Current User",
			authorId: currentUserId,
			isAnonymous,
			isDeleted: false,
			createdAt: "just now",
			updatedAt: "just now",
			reactions: {
				heart: { count: 0, isActive: false },
				star: { count: 0, isActive: false },
			},
		};

		// Optimistically add reply
		setComments((prev) =>
			prev.map((comment) => {
				if (comment.id === parentCommentId) {
					return {
						...comment,
						replies: [newReply, ...(comment.replies || [])],
					};
				}
				// Handle nested replies
				if (comment.replies) {
					return {
						...comment,
						replies: comment.replies.map((reply) =>
							reply.id === parentCommentId
								? {
										...reply,
										replies: [
											newReply,
											...(reply.replies || []),
										],
									}
								: reply
						),
					};
				}
				return comment;
			})
		);

		try {
			const response = await fetch("/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					postId: selectedPost.id,
					parentCommentId,
					content,
					isAnonymous,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add reply");
			}

			// Refresh all comments from database
			await fetchComments(selectedPost.id);
		} catch (error) {
			console.error("Failed to add reply:", error);
			setError(
				error instanceof Error ? error.message : "Failed to add reply"
			);

			// Remove optimistic reply on error
			setComments((prev) =>
				prev.map((comment) => {
					if (comment.id === parentCommentId) {
						return {
							...comment,
							replies:
								comment.replies?.filter(
									(reply) => reply.id !== tempId
								) || [],
						};
					}
					if (comment.replies) {
						return {
							...comment,
							replies: comment.replies.map((reply) =>
								reply.id === parentCommentId
									? {
											...reply,
											replies:
												reply.replies?.filter(
													(r) => r.id !== tempId
												) || [],
										}
									: reply
							),
						};
					}
					return comment;
				})
			);
		}
	};

	// Edit comment
	const handleEditComment = async (commentId: string, newContent: string) => {
		try {
			const response = await fetch("/api/comments", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					commentId,
					content: newContent,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update comment");
			}

			const updatedComment = await response.json();

			// Update comment in state
			setComments((prev) =>
				updateCommentInTree(prev, commentId, updatedComment)
			);
			setError(null);
		} catch (error) {
			console.error("Failed to edit comment:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to edit comment"
			);
		}
	};

	// Delete comment
	const handleDeleteComment = async (commentId: string) => {
		if (!confirm("Are you sure you want to delete this comment?")) return;

		try {
			const response = await fetch(
				`/api/comments?commentId=${commentId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete comment");
			}

			// Refresh comments to show deleted state
			if (selectedPost) {
				await fetchComments(selectedPost.id);
			}
			setError(null);
		} catch (error) {
			console.error("Failed to delete comment:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to delete comment"
			);
		}
	};

	// Helper function to update comment in nested tree
	const updateCommentInTree = (
		comments: Comment[],
		commentId: string,
		updatedComment: Comment
	): Comment[] => {
		return comments.map((comment) => {
			if (comment.id === commentId) {
				return { ...updatedComment, replies: comment.replies };
			}
			if (comment.replies) {
				return {
					...comment,
					replies: updateCommentInTree(
						comment.replies,
						commentId,
						updatedComment
					),
				};
			}
			return comment;
		});
	};

	// Fetch comments from database
	const fetchComments = async (postId: string) => {
		setIsLoadingComments(true);
		setError(null);

		try {
			const response = await fetch(`/api/comments?postId=${postId}`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch comments");
			}

			const fetchedComments = await response.json();
			setComments(fetchedComments);
		} catch (error) {
			console.error("Failed to fetch comments:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to load comments"
			);
			setComments([]);
		} finally {
			setIsLoadingComments(false);
		}
	};

	if (!selectedPost) {
		return (
			<div className="flex-1 flex items-center justify-center bg-inherit">
				<div className="text-center text-gray-500">
					<h3 className="text-lg font-medium mb-2">
						Select a post to view details
					</h3>
					<p className="text-sm">
						Click on any post from the{" "}
						{isMobile ? "menu" : "left panel"} to see its content
						and comments here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="p-6">
				{/* Post Header */}
				{/* <div className="flex items-start space-x-4 mb-6">
					<div className="w-[clamp(2.5rem,3.5rem,4.5rem)] h-[clamp(2.5rem,3.5rem,4.5rem)] bg-amber-900 rounded-full flex items-center justify-center text-white font-semibold text-[clamp(1.8rem,2.8rem,3.8rem)]">
						{selectedPost.author.charAt(0)}
					</div>
					<div className="flex-1">
						<div className="flex items-center space-x-3 mb-2">
							<h3 className="font-semibold text-gray-900">
								{selectedPost.author}
							</h3>
							<span className="text-sm text-gray-500">
								{selectedPost.createdAt}
							</span>
						</div>
						<div className="inline-block bg-amber-100 px-3 py-1 rounded-full text-sm font-medium mb-3">
							{selectedPost.category}
						</div>
						<h2 className="text-xl font-black text-[#5D3B28] mb-4 flex items-center">
							{selectedPost.title}
							<span className="ml-5 text-sm text-amber-500 font-normal">
								#{selectedPost.threadNumber}
							</span>
						</h2>
					</div>
				</div> */}
				{/* Post Content */}
				{/* <div className="prose max-w-none mb-6">
					{selectedPost.content
						.split("\n")
						.map((paragraph, index) => (
							<p
								key={index}
								className="mb-3 text-gray-700 leading-relaxed"
							>
								{paragraph}
							</p>
						))}
				</div> */}
				<PostsComponent
					selectedPost={selectedPost!}
					currentUserId={currentUserId}
					onDeletePost={onDeletePost}
					onUpdatePost={onUpdatePost}
					categories={categories}
				/>
				{/* Reactions */}
				<div className="flex items-center space-x-6 text-gray-600 mb-8 pb-6 border-b border-gray-200">
					<Reactions
						postId={selectedPost.id}
						onReact={handleReaction}
						initialStates={selectedPost.reactions}
					/>
				</div>
				{/* Comments Section */}
				<div>
					<h4 className="font-semibold text-gray-900 mb-4">
						Comments ({comments.length})
					</h4>

					{/* Comment Input Bar */}
					<div className="mb-6">
						<CommentBar
							onSubmit={handleAddComment}
							onToggleAnonymous={() => {}}
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-700">{error}</p>
							<button
								onClick={() => setError(null)}
								className="text-xs text-red-600 hover:text-red-800 mt-1"
							>
								Dismiss
							</button>
						</div>
					)}

					{/* Comments List */}
					{isLoadingComments ? (
						<div className="text-center text-gray-500 py-8">
							<div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-amber-600 rounded-full animate-spin mb-2"></div>
							<p>Loading comments...</p>
						</div>
					) : comments.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<MessageCircle
								size={24}
								className="mx-auto mb-2 text-gray-300"
							/>
							<p>No comments yet. Be the first to comment!</p>
						</div>
					) : (
						<div className="space-y-4">
							{comments.map((comment) => (
								<NestedComment
									key={comment.id}
									comment={comment}
									onReact={handleReaction}
									onReply={handleAddReply}
									onEdit={handleEditComment}
									onDelete={handleDeleteComment}
									currentUserId={currentUserId}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// Main Enhanced Post Page Component
const EnhancedMainPostPage = () => {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [showCreatePostModal, setShowCreatePostModal] =
		useState<boolean>(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [posts, setPosts] = useState<Post[]>([]);
	const [pagination, setPagination] = useState<PaginationInfo>({
		currentPage: 1,
		totalPages: 0,
		totalPosts: 0,
		postsPerPage: 5,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isMobile, setIsMobile] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Check for mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Fetch categories on mount
	useEffect(() => {
		fetchCategories().then((res) => {
			console.log("res ", res);
			setCategories(res);
		});
	}, []);

	// Fetch posts when category, page, or search changes
	useEffect(() => {
		const loadPosts = async () => {
			setIsLoading(true);
			try {
				console.log("Pagination, ", JSON.stringify(Pagination));
				const result = await fetchPosts({
					page: pagination.currentPage,
					category: activeCategory,
					search: searchQuery,
					limit: 10,
				});
				// if (!result.success) {
				// 	location.reload();
				// }
				setPosts(result.data.posts);
				setPagination(result.data.pagination);
			} catch (error) {
				console.error("Failed to fetch posts:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPosts();
	}, [activeCategory, pagination.currentPage, searchQuery]);

	const handleCategoryChange = useCallback(
		(category: string) => {
			setActiveCategory(category);
			setPagination((prev) => ({ ...prev, currentPage: 1 }));
			setSelectedPost(null);
		},
		[createPost]
	);

	const handlePageChange = useCallback((page: number) => {
		setPagination((prev) => ({ ...prev, currentPage: page }));
	}, []);

	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);
		setPagination((prev) => ({ ...prev, currentPage: 1 }));
		setSelectedPost(null);
	}, []);

	// Handle post
	// Handle creating a new post
	const handleCreatePost = async (postData: any) => {
		try {
			const result = await createPost(postData);

			if (result.success) {
				// Add new post to the top of the list
				setPosts((prevPosts) => [result.data, ...prevPosts]);

				// Update pagination count
				setPagination((prev) => ({
					...prev,
					totalPosts: prev.totalPosts + 1,
				}));
			}

			return result;
		} catch (error) {
			return {
				success: false,
				message: "Failed to create post",
			};
		}
	};

	// Handle updating a post
	const handleUpdatePost = async (postData: any) => {
		try {
			const result = await updatePost(postData);

			if (result.success) {
				// Update post in the list
				setPosts((prevPosts) =>
					prevPosts.map((post) =>
						post.id === postData.id
							? { ...post, ...result.data }
							: post
					)
				);
				return {
					success: true,
					message: result.message,
				};
			}

			return {
				success: false,
				message: "Failed to update post",
			};
		} catch (error) {
			return {
				success: false,
				message: "Failed to update post",
			};
		}
	};

	// Handle deleting a post
	const handleDeletePost = async (postId: string) => {
		try {
			const result = await deletePost(postId);

			if (result.success) {
				// Remove post from the list
				setPosts((prevPosts) =>
					prevPosts.filter((post) => post.id !== postId)
				);

				// Update pagination count
				setPagination((prev) => ({
					...prev,
					totalPosts: prev.totalPosts - 1,
				}));

				// Clear selected post if it was deleted
				if (selectedPost?.id === postId) {
					setSelectedPost(null);
				}
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error("Failed to delete post:", error);
			throw error;
		}
	};

	const topLevelItems: LeftSideBarTopLevelItemsProps[] = [
		{ id: "all", name: "All", hasDropdown: false },
		{
			id: "categories",
			name: "Categories",
			hasDropdown: true,
			dropdownItems: categories,
		},
		{
			id: "yours",
			name: "Yours",
			hasDropdown: true,
			dropdownItems: [
				{ id: "your-posts", name: "Posts" },
				{ id: "your-comments", name: "Comments" },
				{ id: "your-drafts", name: "Drafts" },
			],
		},
		{
			id: "starred",
			name: "Starred",
			hasDropdown: true,
			dropdownItems: [
				{ id: "starred-posts", name: "Posts" },
				{ id: "starred-comments", name: "Comments" },
			],
		},
	];

	return (
		<div
			className={`min-h-screen ${showCreatePostModal ? "bg-[#ADA89B]" : "bg-[#FEF4DC]"}`}
		>
			<header className="h-[70px]">
				<PostNavigation />
			</header>
			{/* Main Content */}
			<main className="mt-2">
				<div className="flex h-[calc(100vh-70px)]">
					<EnhancedLeftSidebar
						posts={posts}
						selectedPost={selectedPost}
						onPostSelect={setSelectedPost}
						options={topLevelItems}
						onCategoryChange={handleCategoryChange}
						pagination={pagination}
						onPageChange={handlePageChange}
						isLoading={isLoading}
						isMobile={isMobile}
						isOpen={sidebarOpen}
						onToggle={() => setSidebarOpen(!sidebarOpen)}
						// searchBar={/*{ show: true, onSearch: handleSearch }*/}
						createPostButton={{
							show: true,
							onClick: () => setShowCreatePostModal(true),
						}}
					/>

					<EnhancedRightContentArea
						selectedPost={selectedPost}
						categories={categories}
						isMobile={isMobile}
						onDeletePost={handleDeletePost}
						onUpdatePost={handleUpdatePost}
					/>
				</div>
				{/* Create Post Modal */}
				{showCreatePostModal && (
					<PostCreationModal
						onClose={() => setShowCreatePostModal(false)}
						categories={categories}
						onPost={handleCreatePost}
					/>
				)}
			</main>
		</div>
	);
};

interface SearchBarProps {
	iconStyle?: string;
	inputStyle?: string;
	onSearch: (query: string) => void;
}
export const SearchBar = ({
	iconStyle,
	inputStyle,
	onSearch,
}: SearchBarProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	/**
	 * Helper function to handle search
	 */
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		onSearch(query);
	};
	return (
		<div className="relative w-full">
			<Search
				size={16}
				className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconStyle}`}
			/>
			<input
				type="text"
				placeholder="Search posts..."
				value={searchQuery}
				onChange={(e) => handleSearch(e.target.value)}
				className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${inputStyle}`}
			/>
		</div>
	);
};

import { MessageCircle, Send } from "lucide-react";

/**
 *Comment Bar Component
 */

const CommentBar = ({
	onSubmit,
	placeholder = "Add a comment...",
	replyTo = null,
	isAnonymous = false,
	onToggleAnonymous,
}: {
	onSubmit: (content: string, isAnonymous: boolean) => void;
	placeholder?: string;
	replyTo?: string | null;
	isAnonymous?: boolean;
	onToggleAnonymous?: (anonymous: boolean) => void;
}) => {
	const [comment, setComment] = useState("");
	const [anonymous, setAnonymous] = useState(isAnonymous);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (comment.trim() && !isSubmitting) {
			setIsSubmitting(true);
			try {
				await onSubmit(comment.trim(), anonymous);
				setComment("");
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const handleAnonymousToggle = (checked: boolean) => {
		setAnonymous(checked);
		onToggleAnonymous?.(checked);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-gray-50 rounded-lg p-3"
		>
			<div className="flex items-center space-x-3 mb-2">
				<div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
					{anonymous ? "?" : "U"}
				</div>
				<input
					ref={inputRef}
					type="text"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder={
						replyTo ? `Reply to ${replyTo}...` : placeholder
					}
					className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500"
					disabled={isSubmitting}
					maxLength={1000}
				/>
				<button
					type="submit"
					disabled={!comment.trim() || isSubmitting}
					className="text-amber-600 hover:text-amber-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
				>
					{isSubmitting ? (
						<div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
					) : (
						<Send size={16} />
					)}
				</button>
			</div>

			{onToggleAnonymous && (
				<div className="flex items-center space-x-2 ml-11">
					<input
						type="checkbox"
						id="anonymous"
						checked={anonymous}
						onChange={(e) =>
							handleAnonymousToggle(e.target.checked)
						}
						className="text-amber-600 focus:ring-amber-500"
					/>
					<label
						htmlFor="anonymous"
						className="text-xs text-gray-600"
					>
						Post anonymously
					</label>
				</div>
			)}
		</form>
	);
};

// Nested Comment Component
const NestedComment = ({
	comment,
	onReact,
	onReply,
	onEdit,
	onDelete,
	currentUserId,
	depth = 0,
}: {
	comment: Comment;
	onReact: any;
	onReply: (commentId: string, content: string, isAnonymous: boolean) => void;
	onEdit?: (commentId: string, content: string) => void;
	onDelete?: (commentId: string) => void;
	currentUserId?: string;
	depth?: number;
}) => {
	const [showReplyBar, setShowReplyBar] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const maxDepth = 3;

	const handleReply = async (content: string, isAnonymous: boolean) => {
		await onReply(comment.id, content, isAnonymous);
		setShowReplyBar(false);
	};

	const handleEdit = async () => {
		if (onEdit && editContent.trim() !== comment.content) {
			await onEdit(comment.id, editContent.trim());
		}
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditContent(comment.content);
		setIsEditing(false);
	};

	const canEdit = currentUserId === comment.authorId && !comment.isDeleted;
	const canDelete = currentUserId === comment.authorId && !comment.isDeleted;

	return (
		<div
			className={`${depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-4" : ""} mb-4`}
		>
			<div className="flex items-start space-x-3">
				<div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
					{comment.isAnonymous ? "?" : comment.author.charAt(0)}
				</div>
				<div className="flex-1">
					<div className="flex items-center space-x-2 mb-2">
						<span className="font-medium text-gray-900 text-sm">
							{comment.isAnonymous ? "Anonymous" : comment.author}
						</span>
						<span className="text-xs text-gray-500">
							{comment.createdAt}
						</span>
						{comment.updatedAt !== comment.createdAt && (
							<span className="text-xs text-gray-400">
								(edited)
							</span>
						)}
						{comment.isDeleted && (
							<span className="text-xs text-red-500">
								(deleted)
							</span>
						)}
					</div>

					{isEditing ? (
						<div className="mb-2">
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
								rows={2}
								maxLength={1000}
							/>
							<div className="flex items-center space-x-2 mt-2">
								<button
									onClick={handleEdit}
									className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
								>
									Save
								</button>
								<button
									onClick={handleCancelEdit}
									className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<p className="text-sm text-gray-700 leading-relaxed mb-2">
							{comment.isDeleted
								? "[This comment has been deleted]"
								: comment.content}
						</p>
					)}

					{!comment.isDeleted && (
						<div className="flex items-center space-x-4 text-gray-500">
							<div className="flex space-x-2">
								<Reactions
									size={14}
									commentId={comment.id}
									onReact={onReact}
									allowedReactions={{
										heart: true,
										star: true,
									}}
									initialStates={comment.reactions}
								/>
							</div>
							{depth < maxDepth && (
								<button
									onClick={() =>
										setShowReplyBar(!showReplyBar)
									}
									className="flex items-center space-x-1 text-xs hover:text-amber-600 transition-colors"
								>
									<MessageCircle size={12} />
									<span>Reply</span>
								</button>
							)}
							{canEdit && (
								<button
									onClick={() => setIsEditing(true)}
									className="text-xs hover:text-amber-600 transition-colors"
								>
									Edit
								</button>
							)}
							{canDelete && onDelete && (
								<button
									onClick={() => onDelete(comment.id)}
									className="text-xs hover:text-red-600 transition-colors"
								>
									Delete
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{showReplyBar && !comment.isDeleted && (
				<div className="mt-3 ml-11">
					<CommentBar
						onSubmit={handleReply}
						placeholder="Add a reply..."
						replyTo={
							comment.isAnonymous ? "Anonymous" : comment.author
						}
						onToggleAnonymous={(anonymous) => {}}
					/>
				</div>
			)}

			{/* Nested replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="mt-3">
					{comment.replies.map((reply: Comment) => (
						<NestedComment
							key={reply.id}
							comment={reply}
							onReact={onReact}
							onReply={onReply}
							onEdit={onEdit}
							onDelete={onDelete}
							currentUserId={currentUserId}
							depth={depth + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};

interface PostsComponentProps {
	selectedPost: Post | null;
	categories: Category[];
	currentUserId: string;
	onUpdatePost: (
		postId: string
	) => Promise<{ success: boolean; message: string }>;
	onDeletePost: (postData: any) => Promise<void>;
}

export const PostsComponent: React.FC<PostsComponentProps> = ({
	selectedPost,
	categories,
	currentUserId,
	onDeletePost,
	onUpdatePost,
}) => {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingPost, setEditingPost] = useState<any>(null);
	const [post, setPost] = useState(selectedPost);

	// Handle updating a post
	const handleUpdatePost = async (postData: any) => {
		try {
			setPost((prev) => prev && { ...selectedPost, ...post! });
			const result = onUpdatePost(postData);
			setEditingPost(null);
			return result;
		} catch (error) {
			return {
				success: false,
				message: "Failed to update post",
			};
		}
	};

	// Handle deleting a post
	const handleDeletePost = async (postId: string) => {
		try {
			setEditingPost(null);
			onDeletePost(postId);
			setPost(null);
		} catch (error) {
			console.error("Failed to delete post:", error);
		}
	};

	// Handle opening create modal
	const handleOpenCreateModal = () => {
		setEditingPost(null);
		setShowCreateModal(true);
	};

	// Handle opening edit modal
	const handleEditPost = (post: any) => {
		setEditingPost(post);
		setShowCreateModal(true);
	};

	// Handle closing modal
	const handleCloseModal = () => {
		setShowCreateModal(false);
		setEditingPost(null);
	};

	if (!post) {
		return null;
	}

	return (
		<>
			{/* Posts List Section */}
			<div className="flex-1 flex flex-col">
				{/*Post Header*/}
				<div className="flex items-start space-x-4 mb-6">
					<div className="w-[clamp(2.5rem,3.5rem,4.5rem)] h-[clamp(2.5rem,3.5rem,4.5rem)] bg-amber-900 rounded-full flex items-center justify-center text-white font-semibold text-[clamp(1.8rem,2.8rem,3.8rem)]">
						{post.author.charAt(0)}
					</div>
					<div className="flex-1">
						<div className="flex items-center space-x-3 mb-2">
							<h3 className="font-semibold text-gray-900">
								{post.author}
							</h3>
							<span className="text-sm text-gray-500">
								{post.createdAt}
							</span>
						</div>
						<div className="inline-block bg-amber-100 px-3 py-1 rounded-full text-sm font-medium mb-3">
							{post.category}
						</div>
						<h2 className="text-xl font-black text-[#5D3B28] mb-4 flex items-center">
							{post.title}
							<span className="ml-5 text-sm text-amber-500 font-normal">
								#{post.threadNumber}
							</span>
						</h2>
					</div>
				</div>
				{/* Post Content */}
				<div className="prose max-w-none mb-6">
					{post.content.split("\n").map((paragraph, index) => (
						<p
							key={index}
							className="mb-3 text-gray-700 leading-relaxed"
						>
							{paragraph}
						</p>
					))}
				</div>
				{/* Post Actions */}
				<PostActions
					post={post}
					currentUserId={currentUserId}
					onEdit={handleEditPost}
					onDelete={handleDeletePost}
					className="ml-2"
				/>
			</div>

			{/* Post Creation/Edit Modal */}
			{showCreateModal && (
				<PostCreationModal
					onClose={handleCloseModal}
					onUpdatePost={handleUpdatePost}
					categories={categories}
					editingPost={editingPost}
				/>
			)}
		</>
	);
};

interface PostActionsProps {
	post: Post;
	currentUserId: string | null;
	onEdit: (post: any) => void;
	onDelete: (postId: string) => Promise<void>;
	className?: string;
}

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	postTitle: string;
	isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	postTitle,
	isDeleting,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
							<AlertTriangle className="w-5 h-5 text-red-600" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900">
							Delete Post
						</h3>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						disabled={isDeleting}
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="mb-6">
					<p className="text-gray-700 mb-3">
						Are you sure you want to delete this post? This action
						cannot be undone.
					</p>
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
						<p className="text-sm font-medium text-gray-900 truncate">
							"{postTitle}"
						</p>
					</div>
				</div>

				<div className="flex space-x-3">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
						disabled={isDeleting}
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete Post"}
					</button>
				</div>
			</div>
		</div>
	);
};

export const PostActions: React.FC<PostActionsProps> = ({
	post,
	currentUserId,
	onEdit,
	onDelete,
	className = "",
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Only show actions if user owns the post
	const canManagePost = currentUserId && post.authorId === currentUserId;

	if (!canManagePost) {
		return null;
	}

	const handleEdit = () => {
		setIsDropdownOpen(false);

		// Get category from categories array or create a default one
		const categoryData = {
			id: post.category, // Assuming category is stored as ID
			name: post.category, // You might need to map this properly
		};

		onEdit({
			id: post.id,
			title: post.title,
			content: post.content,
			category: categoryData,
			isAnonymous: post.isAnonymous || false,
		});
	};

	const handleDeleteClick = () => {
		setIsDropdownOpen(false);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete(post.id);
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Delete failed:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<div className={`relative ${className}`}>
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="p-1 rounded-full hover:bg-gray-100 transition-colors"
					title="Post options"
				>
					<MoreHorizontal className="w-4 h-4 text-gray-500" />
				</button>

				{isDropdownOpen && (
					<>
						{/* Backdrop */}
						<div
							className="fixed inset-0 z-10"
							onClick={() => setIsDropdownOpen(false)}
						/>

						{/* Dropdown Menu */}
						<div className="absolute left-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
							<div className="py-1">
								<button
									onClick={handleEdit}
									className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									<Edit2 className="w-4 h-4" />
									<span>Edit Post</span>
								</button>
								<button
									onClick={handleDeleteClick}
									className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
									<span>Delete Post</span>
								</button>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleConfirmDelete}
				postTitle={post.title}
				isDeleting={isDeleting}
			/>
		</>
	);
};

export default EnhancedMainPostPage;
