import React, { useState } from "react";
import {
	Menu,
	Bold,
	Italic,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Link,
	Paperclip,
	List,
	Underline,
	ListOrdered,
} from "lucide-react";

// Main App Component
const PostingUI = () => {
	return (
		<div className="w-screen h-screen relative overflow-hidden flex items-center justify-center">
			{/* Main Posting UI Container */}
			<div
				className="absolute border-2 border-black bg-[#FEF4DC] overflow-hidden p-5 z-10 h-full"
				style={{
					width: "90vw",
					top: "0vh",
					borderRadius: "3.7vw",
					transform: "rotate(0deg)",
					opacity: 1,
				}}
			>
				{/* Main Content Pane */}
				<div
					className="relative p-[1vw]"
					style={{ width: "65vw", height: "100%" }}
				>
					<CreatePostHeader />
					<TitleSection />
					<CategoriesSection />
					<ContentArea />
				</div>

				{/* Draft Sidebar */}
				<DraftSidebar />
			</div>
		</div>
	);
};

export default PostingUI;

// MenuButton Component
const MenuButton = () => {
	return (
		<button
			className="absolute hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
			style={{
				width: "3.47vw",
				height: "5.09vh",
				top: "8.33vh",
				transform: "rotate(0deg)",
				opacity: 1,
			}}
		>
			<Menu className="w-6 h-6 text-white" />
		</button>
	);
};
// CreatePostHeader Component
const CreatePostHeader = () => {
	return (
		<h1 className="text-3xl font-bold text-[#B10F0F] tracking-normal p-3">
			Create A New Post
		</h1>
	);
};

// Title Section Component
const TitleSection = () => {
	return (
		<div className="flex justify-start items-center gap-[5vw] py-5">
			{/* Title Label */}
			<span className="text-gray-800 font-bold text-[1.25rem]">
				Title
			</span>
			{/* Title Input */}
			<span
				className=""
				style={{
					width: "50vw",
					height: "5vh",
					transform: "rotate(0deg)",
					opacity: 1,
					gap: "0.58vw",
				}}
			>
				<input
					type="text"
					placeholder="Enter post title..."
					className="w-full h-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all
					 duration-200  p-2 font-bold text-base bg-[#D9D9D942]"
				/>
			</span>
		</div>
	);
};

// Categories Section Component
const CategoriesSection = () => {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const availableCategories = [
		"People",
		"Question",
		"Travel",
		"Courses",
		"Health",
		"Study",
		"Events",
		"General",
		"Collaboration",
		"Selling",
		"Giveout",
	];

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev: string[]) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	return (
		<div className="flex justify-start items-center gap-[2vh] py-5">
			{/* Categories Label */}
			<span className="text-gray-800 font-bold text-[1.25rem]">
				Categories
			</span>

			{/* Categories Tags */}
			<span className="flex flex-wrap gap-3 w-4/5">
				{availableCategories.map((category) => (
					<button
						key={category}
						onClick={() => toggleCategory(category)}
						className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-sm ${
							selectedCategories.includes(category)
								? "bg-[#A70B0B] text-white"
								: "bg-[#CC81001A] text-gray-700 hover:bg-orange-200"
						}`}
					>
						{category}
					</button>
				))}
			</span>
		</div>
	);
};

// Content Toolbar Component
const ContentToolbar = () => {
	return (
		<div
			className="flex items-center gap-2 p-2"
			style={{ top: "28vh", right: "2vw", zIndex: 10 }}
		>
			<button className="p-1 hover:border rounded transition-colors">
				<Bold className="w-4 h-4" />
			</button>
			<button className="p-1 hover:border rounded transition-colors">
				<Italic className="w-4 h-4" />
			</button>
			<button className="p-1 hover:border rounded transition-colors">
				<Underline className="w-4 h-4" />
			</button>
			<button className="p-1 hover:border rounded transition-colors">
				<ListOrdered className="w-4 h-4" />
			</button>
			<button className="p-1 hover:border rounded transition-colors">
				<Link className="w-4 h-4" />
			</button>
			{/* <button className="p-1 hover:border rounded transition-colors">
				<Paperclip className="w-4 h-4" />
			</button> */}
		</div>
	);
};

// Content Area Component
const ContentArea = () => {
	const [content, setContent] = useState("");

	return (
		<div className="flex justify-start items-start gap-[2vw] py-5">
			<span className="text-gray-800 font-bold text-[1.25rem]">
				Content
			</span>

			<div
				className="border-2 border-gray-300 rounded-lg bg-[#D9D9D942]"
				// style={{ width: "50vw", height: "45vh" }}
			>
				<ContentToolbar />
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Start writing your post..."
					className="overflow-scroll w-[50vw] h-[35vh] focus:outline-none resize-none p-3"
					style={{
						fontFamily: "Montserrat",
						fontSize: "16px",
						lineHeight: "24px",
					}}
				/>
			</div>
		</div>
	);
};

// Draft Sidebar Component
const DraftSidebar = () => {
	const draftPosts = [
		{
			id: 1,
			title: "My Travel Adventure",
			date: "2024-01-15",
			categories: ["Travel", "Lifestyle"],
		},
		{
			id: 2,
			title: "Tech Trends 2024",
			date: "2024-01-10",
			categories: ["Technology", "Business"],
		},
		{
			id: 3,
			title: "Healthy Cooking Tips",
			date: "2024-01-08",
			categories: ["Food", "Health"],
		},
	];

	return (
		<div
			className="absolute p-4"
			style={{ top: "0", right: "0", width: "25vw", height: "100%" }}
		>
			<h2 className="text-xl font-bold text-gray-800 mb-4">
				Draft Posts
			</h2>

			<div className="space-y-4">
				{draftPosts.map((draft) => (
					<div
						key={draft.id}
						className="p-3 bg-[#D9D9D942] rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
					>
						<h3 className="font-semibold text-gray-800 mb-1">
							{draft.title}
						</h3>
						<p className="text-sm text-gray-600 mb-2">
							{draft.date}
						</p>
						<div className="flex flex-wrap gap-1">
							{draft.categories.map((category) => (
								<span
									key={category}
									className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
								>
									{category}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
