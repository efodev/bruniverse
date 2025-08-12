import React, { useState, useEffect, useCallback } from "react";
import {
	Plus,
	ChevronDown,
	Search,
	Menu,
	X,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
import { Reactions } from "../util/reactions";
import { createReactionHandler } from "@/app/lib/reactions";
import { PostCreationModal } from "./create";
import { Post } from "../definitions";
import { fetchPosts } from "@/app/lib/post/util";
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
const fetchMockPosts = async (
	page: number,
	category: string,
	search: string
): Promise<{ posts: Post[]; pagination: PaginationInfo }> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	const mockPosts = [
		{
			id: "170",
			title: "Looking for Internship Advice",
			author: "Melody Chen",
			createdAt: "2 days ago",
			category: "questions",
			reactions: {
				heart: { isActive: true, count: 12 },
				star: { isActive: false, count: 3 },
			},
			content: `Hey everyone! 👋\nHope you're all doing great! I'm currently starting to think about internships and wanted to ask for some advice from folks who've been through the process. I'm especially interested in roles related to creative tech, product design, music + AI.\nFeel free to drop any advice here or DM me — I really appreciate it! 🙏\nThanks in advance!!`,
			comments: [
				{
					id: "1",
					title: "",
					content:
						"Hi! I'm here offering some advice. I would say talk to people from both the CS department and Music Department at Brown.",
					category: "",
					author: "Bruce Liang",
					createdAt: "",
					reactions: {
						heart: { isActive: true, count: 5 },
						star: { isActive: false, count: 4 },
					},
					comments: [],
				},
			],
		},
		{
			id: "169",
			title: "Study Group for CS150",
			author: "Alex Kim",
			createdAt: "1 day ago",
			category: "on-campus",
			reactions: {
				heart: { isActive: true, count: 12 },
				star: { isActive: false, count: 3 },
			},
			content: `Looking for people to form a study group for CS150. We can meet twice a week to go over problem sets and prepare for exams together.`,
			comments: [
				{
					id: "2",
					title: "",
					content: "I'm interested! What days work best for you?",
					category: "",
					author: "Sarah Johnson",
					createdAt: "",
					reactions: {
						heart: { isActive: true, count: 12 },
						star: { isActive: false, count: 3 },
					},
					comments: [],
				},
			],
		},
		// Add more mock posts...
	];

	// Filter posts based on category and search
	let filteredPosts = mockPosts;
	if (category !== "all") {
		filteredPosts = mockPosts.filter((post) => post.category === category);
	}
	if (search) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				post.title.toLowerCase().includes(search.toLowerCase()) ||
				post.content.toLowerCase().includes(search.toLowerCase())
		);
	}

	const postsPerPage = 5;
	const startIndex = (page - 1) * postsPerPage;
	const endIndex = startIndex + postsPerPage;
	const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

	return {
		posts: paginatedPosts,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(filteredPosts.length / postsPerPage),
			totalPosts: filteredPosts.length,
			postsPerPage,
		},
	};
};

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
		let end = Math.min(totalPages, start + maxVisible - 1);

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

// Enhanced Right Content Area
const EnhancedRightContentArea = ({
	selectedPost,
	isMobile,
}: {
	selectedPost: Post | null;
	isMobile: boolean;
}) => {
	const handleReaction = createReactionHandler();
	// Helper  posting functionfunction
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
				<div className="flex items-start space-x-4 mb-6">
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
				</div>

				{/* Post Content */}
				<div className="prose max-w-none mb-6">
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
				</div>

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
						Comments ({selectedPost.comments.length})
					</h4>
					{selectedPost.comments.map((comment, index) => (
						<div
							key={index}
							className="flex items-start space-x-3 mb-6"
						>
							<div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
								{comment.author.charAt(0)}
							</div>
							<div className="flex-1">
								<div className="flex items-center space-x-2 mb-2">
									<span className="font-medium text-gray-900 text-sm">
										{comment.author}
									</span>
									<div className="flex space-x-3">
										<Reactions
											size={14}
											commentId={comment.id}
											onReact={handleReaction}
											allowedReactions={{
												heart: true,
												star: true,
											}}
											initialStates={comment.reactions}
										/>
									</div>
								</div>
								<p className="text-sm text-gray-700 leading-relaxed">
									{comment.content}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

// Main Enhanced Post Page Component
const EnhancedMainPostPage = () => {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [createPost, setCreatePost] = useState<boolean>(false);
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
				const result = await fetchPosts(
					pagination.currentPage,
					activeCategory,
					searchQuery
				);
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
			className={`min-h-screen ${createPost ? "bg-[#ADA89B]" : "bg-[#FEF4DC]"}`}
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
							onClick: () => setCreatePost(true),
						}}
					/>

					<EnhancedRightContentArea
						selectedPost={selectedPost}
						isMobile={isMobile}
					/>
				</div>
				{/* Create Post Modal */}
				{createPost && (
					<PostCreationModal
						onClose={() => setCreatePost(false)}
						categories={categories}
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
export default EnhancedMainPostPage;
