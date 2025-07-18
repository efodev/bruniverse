import React, { useState } from "react";
import {
	Search,
	Menu,
	Heart,
	Share,
	Star,
	Plus,
	ChevronDown,
} from "lucide-react";
import { NavItem } from "../definitions";
import { PostNavigation } from "../navigation";
import { inter } from "../fonts";

// Category Filter Component
interface CategoryFilterProps {
	categories: string[];
	activeCategory: string;
	onCategoryChange: (category: string) => void;
}
const CategoryFilter = ({
	categories,
	activeCategory,
	onCategoryChange,
}: CategoryFilterProps) => {
	return (
		<div className="flex flex-wrap gap-2 mb-6">
			{categories.map((category, index) => (
				<button
					key={index}
					onClick={() => onCategoryChange(category)}
					className={`px-4 py-2 rounded-full font-medium transition-colors ${
						activeCategory === category
							? "bg-amber-800 text-white"
							: "bg-amber-100 text-amber-800 hover:bg-amber-200"
					}`}
				>
					{category}
				</button>
			))}
		</div>
	);
};

// Left Sidebar Component with categories and posts list
interface LeftSideBarTopLevelItemsProps {
	id: string;
	name: string;
	hasDropdown: boolean;
	dropdownItems?: { id: string; name: string }[];
}
interface LeftSidebarProps {
	onCategoryChange: (category: string) => void;
	posts: Post[];
	selectedPost: Post | null;
	onPostSelect: (post: Post) => void;
}
export interface Post {
	id: string;
	title: string;
	content: string;
	category: string;
	author: string;
	timestamp: string;
	likes: number;
	comments: Post[];
}
export const LeftSidebar = ({
	onCategoryChange,
	posts,
	selectedPost,
	onPostSelect,
}: LeftSidebarProps) => {
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>("all");

	const topLevelItems: LeftSideBarTopLevelItemsProps[] = [
		{
			id: "all",
			name: "All",
			hasDropdown: false,
		},
		{
			id: "categories",
			name: "Categories",
			hasDropdown: true,
			dropdownItems: [
				{ id: "on-campus", name: "On-campus Questions" },
				{ id: "off-campus", name: "Off-campus Questions" },
				{ id: "find-people", name: "Find people" },
				{ id: "promotion", name: "Promotion" },
				{ id: "life-trivia", name: "Life Trivia" },
				{ id: "other", name: "Other" },
			],
		},
		{
			id: "yours",
			name: "Yours",
			hasDropdown: true,
			dropdownItems: [
				{ id: "your-posts", name: "Your Posts" },
				{ id: "your-comments", name: "Your Comments" },
				{ id: "your-drafts", name: "Your Drafts" },
			],
		},
		{
			id: "starred",
			name: "Starred",
			hasDropdown: true,
			dropdownItems: [
				{ id: "starred-posts", name: "Starred Posts" },
				{ id: "starred-comments", name: "Starred Comments" },
			],
		},
	];

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
	};

	return (
		<div className="w-[40%] p-6 h-full overflow-y-auto">
			{/* Categories Section */}
			<div className="mb-6 w-full">
				<div className="flex flex-wrap gap-3">
					{topLevelItems.map((item) => (
						<div
							key={item.id}
							className="relative"
						>
							<button
								onClick={() => handleItemClick(item)}
								className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
									activeCategory === item.id
										? "bg-[#B10F0F] text-white"
										: "bg-[#CC810033] hover:bg-amber-200"
								}`}
							>
								<span>{item.name}</span>
								{item.hasDropdown && <ChevronDown size={15} />}
							</button>

							{item.hasDropdown && openDropdown === item.id && (
								<div className="absolute top-full left-0 mt-1 bg-[#713F12] rounded-lg shadow-xl border border-amber-200 z-50 overflow-hidden min-w-fit divide-y-[0.01px]">
									{item.dropdownItems?.map((dropdownItem) => (
										<button
											key={dropdownItem.id}
											onClick={() =>
												handleDropdownItemClick(
													dropdownItem.id
												)
											}
											className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors text-white border-[#CC8100B0] hover:text-red-600`}
										>
											{dropdownItem.name}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Posts List Section */}
			<div className="">
				{posts.map((post) => (
					<div
						key={post.id}
						onClick={() => onPostSelect(post)}
						className={`p-4 cursor-pointer transition-colors border-b border-[#0000003D] hover:shadow-sm ${
							selectedPost?.id === post.id
								? "bg-orange-100"
								: "hover:shadow-sm"
						}`}
					>
						<div className="flex items-start space-x-3">
							<div
								className={`size-13 bg-amber-900 rounded-full flex items-center justify-center text-white font-semibold text-4xl ${inter}`}
							>
								{post.author.charAt(0)}
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium truncate">
									{post.title}
								</h4>
								<p className="text-sm mt-1">by {post.author}</p>
								<div className="flex items-center space-x-2 mt-2">
									<span className="inline-block bg-amber-100 px-2 py-1 rounded text-xs font-medium">
										{post.category}
									</span>
									<span className="text-xs text-amber-600">
										#{post.id}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Right Content Area Component
export const RightContentArea = ({
	selectedPost,
	style = "",
}: {
	selectedPost: Post | null;
	style: string;
}) => {
	const [isLiked, setIsLiked] = useState(false);
	const [isStarred, setIsStarred] = useState(false);

	if (!selectedPost) {
		return (
			<div
				className={`flex-1 p-8 flex items-center justify-center ${style}`}
			>
				<div className="text-center text-amber-600">
					<h3 className="text-lg font-medium mb-2">
						Select a post to view details
					</h3>
					<p className="text-sm">
						Click on any post from the left panel to see its content
						and comments here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`flex-1 p-6 max-h-screen overflow-y-auto ${style}`}>
			<div className="flex items-start space-x-4">
				<div
					className={`size-18 bg-amber-900 rounded-full flex items-center justify-center text-white font-semibold text-5xl`}
				>
					{selectedPost.author.charAt(0)}
				</div>
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						<h3 className="font-semibold">{selectedPost.author}</h3>
						<span className="text-sm ">
							{selectedPost.timestamp}
						</span>
					</div>
					<div className="inline-block bg-amber-100 px-3 py-1 rounded-full text-sm font-medium mb-3">
						{selectedPost.category}
					</div>
					<h2 className="text-xl font-black text-[#5D3B28] mb-4 flex items-center">
						{selectedPost.title}
						<span className="ml-3 text-sm text-amber-600 font-normal">
							#{selectedPost.id}
						</span>
					</h2>
					<div className=" space-y-2 mb-4 text-base font-semibold">
						{selectedPost.content
							.split("\n")
							.map((paragraph, index) => (
								<p key={index}>{paragraph}</p>
							))}
					</div>
					<div className="flex items-center space-x-6 text-amber-700 mb-6">
						<button
							onClick={() => setIsLiked(!isLiked)}
							className={`flex items-center space-x-2 hover:text-amber-900 transition-colors ${
								isLiked ? "text-red-500" : ""
							}`}
						>
							<Heart
								size={18}
								fill={isLiked ? "currentColor" : "none"}
							/>
						</button>
						<button className="flex items-center space-x-2 hover:text-amber-900 transition-colors">
							<Share size={18} />
						</button>
						<button
							onClick={() => setIsStarred(!isStarred)}
							className={`flex items-center space-x-2 hover:text-amber-900 transition-colors ${
								isStarred ? "text-yellow-500" : ""
							}`}
						>
							<Star
								size={18}
								fill={isStarred ? "currentColor" : "none"}
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Comments Section */}
			<div className="border-t border-amber-200 pt-4">
				<h4 className="font-semibold text-amber-900 mb-4">Comments</h4>
				{selectedPost.comments.map((comment, index) => (
					<div
						key={index}
						className="flex items-start space-x-3 mb-4"
					>
						<div
							className={`size-11 bg-amber-700 rounded-full flex items-center justify-center text-white font-semibold text-3xl ${inter}`}
						>
							{comment.author.charAt(0)}
						</div>
						<div className="flex-1">
							<div className="flex items-center space-x-2 mb-1">
								<span className="font-medium">
									{comment.author}
								</span>
								<div className="flex space-x-2">
									<button className="text-amber-600 hover:text-amber-800">
										<Heart size={14} />
									</button>
									<button className="text-amber-600 hover:text-amber-800">
										<Share size={14} />
									</button>
								</div>
							</div>
							<p className="text-sm font-normal leading-relaxed">
								{comment.content}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Post Component
const Post = ({ post }: { post: Post }) => {
	const [isLiked, setIsLiked] = useState(false);
	const [isStarred, setIsStarred] = useState(false);

	return (
		<div className="bg-white rounded-2xl p-6 mb-6 border border-amber-200 hover:shadow-md transition-shadow">
			<div className="flex items-start space-x-4">
				<div className="w-12 h-12 bg-amber-900 rounded-full flex items-center justify-center text-white font-semibold text-lg">
					{post.author.charAt(0)}
				</div>
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-2">
						<h3 className="font-semibold text-amber-900">
							{post.author}
						</h3>
						<span className="text-sm text-amber-600">
							{post.timestamp}
						</span>
					</div>
					<div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
						{post.category}
					</div>
					<h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
						{post.title}
						<span className="ml-3 text-sm text-amber-600 font-normal">
							#{post.id}
						</span>
					</h2>
					<div className="text-amber-800 space-y-2 mb-4">
						{post.content.split("\n").map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
					</div>
					<div className="flex items-center space-x-6 text-amber-700">
						<button
							onClick={() => setIsLiked(!isLiked)}
							className={`flex items-center space-x-2 hover:text-amber-900 transition-colors ${
								isLiked ? "text-red-500" : ""
							}`}
						>
							<Heart
								size={18}
								fill={isLiked ? "currentColor" : "none"}
							/>
						</button>
						<button className="flex items-center space-x-2 hover:text-amber-900 transition-colors">
							<Share size={18} />
						</button>
						<button
							onClick={() => setIsStarred(!isStarred)}
							className={`flex items-center space-x-2 hover:text-amber-900 transition-colors ${
								isStarred ? "text-yellow-500" : ""
							}`}
						>
							<Star
								size={18}
								fill={isStarred ? "currentColor" : "none"}
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Comments Section */}
			<div className="mt-6 border-t border-amber-200 pt-4">
				<h4 className="font-semibold text-amber-900 mb-4">Comments</h4>
				{post.comments.map((comment: Post, index) => (
					<div
						key={index}
						className="flex items-start space-x-3 mb-4"
					>
						<div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
							{comment.author.charAt(0)}
						</div>
						<div className="flex-1">
							<div className="flex items-center space-x-2 mb-1">
								<span className="font-medium text-amber-900">
									{comment.author}
								</span>
								<div className="flex space-x-2">
									<button className="text-amber-600 hover:text-amber-800">
										<Heart size={14} />
									</button>
									<button className="text-amber-600 hover:text-amber-800">
										<Share size={14} />
									</button>
								</div>
							</div>
							<p className="text-amber-800 text-sm leading-relaxed">
								{comment.content}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
