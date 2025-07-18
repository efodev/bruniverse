import React, { useState } from "react";
import { FlexButton } from "../util/buttons";
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
	X,
} from "lucide-react";

// // Main App Component
// const PostingUI = () => {
// 	return (
// 		<div className="w-screen h-screen relative overflow-hidden flex items-center justify-center">
// 			{/* Main Posting UI Container */}
// 			<div
// 				className="absolute border-2 border-black bg-[#FEF4DC] overflow-hidden p-5 z-10 h-full"
// 				style={{
// 					width: "90vw",
// 					top: "0vh",
// 					borderRadius: "3.7vw",
// 					transform: "rotate(0deg)",
// 					opacity: 1,
// 				}}
// 			>
// 				{/* Main Content Pane */}
// 				<div
// 					className="relative p-[1vw]"
// 					style={{ width: "65vw", height: "100%" }}
// 				>
// 					<CreatePostHeader />
// 					<TitleSection />
// 					<CategoriesSection />
// 					<ContentArea />
// 				</div>

// 				{/* Draft Sidebar */}
// 				<DraftSidebar />
// 			</div>
// 			<div className="absolute top-[90vh]">
// 				<FlexButton
// 					action={(e: Event) => console.log("Button clicked")}
// 					props={{}}
// 				>
// 					Save
// 				</FlexButton>
// 				<FlexButton
// 					action={(e: Event) => console.log("Button clicked")}
// 					props={{}}
// 				>
// 					Post
// 				</FlexButton>
// 			</div>
// 		</div>
// 	);
// };

// export default PostingUI;

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

// Title Section Component
const TitleSection = () => {
	return (
		<div className="flex justify-start items-center gap-[5vw] py-2">
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
					className=""
				/>
			</span>
		</div>
	);
};

// Drafts Sidebar Component
interface Draft {
	id: number;
	title: string;
	date: string;
	content: string;
	categories: string[];
}

interface DraftSidebarProps {
	drafts: Draft[];
	onDraftClick: (draft: Draft) => void;
	style?: {};
	className?: string;
}
const DraftsSidebar = ({
	drafts,
	onDraftClick,
	style,
	className,
}: DraftSidebarProps) => {
	return (
		<div className={`p-4${className}`}>
			<h3 className="text-xl font-bold text-gray-800">Your Drafts</h3>
			<div className="flex items-center justify-between mb-4">
				{/* <button className="text-amber-600 hover:text-amber-800">
					<X className="w-4 h-4" />
				</button> */}
			</div>

			<div className="space-y-2">
				{drafts.map((draft) => (
					<div
						key={draft.id}
						className="p-3 bg-[#D9D9D942] rounded-lg border border-gray-200 hover:bg-stone-200 transition-colors cursor-pointer space-y-1"
					>
						<h3 className="font-semibold text-gray-800 truncate">
							{draft.title}
						</h3>
						<p className="text-sm text-gray-600">{draft.date}</p>
						<div className="flex flex-wrap gap-1">
							{draft.categories.map((category) => (
								<span
									key={category}
									className="px-2 py-1 bg-gray-100  text-xs rounded-full"
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

// Rich Text Editor Component

const RichTextEditor = ({
	content,
	onChange,
}: {
	content: string;
	onChange: (content: string) => void;
}) => {
	const [activeFormats, setActiveFormats] = useState(new Set());

	const toggleFormat = (format: string) => {
		const newFormats = new Set(activeFormats);
		if (newFormats.has(format)) {
			newFormats.delete(format);
		} else {
			newFormats.add(format);
		}
		setActiveFormats(newFormats);
	};

	return (
		<div className="border border-gray-300 rounded-lg bg-[#D9D9D942] h-1/2 box-border">
			<div className="flex items-center space-x-2 p-2 h-[2vw]">
				<button
					onClick={() => toggleFormat("bold")}
					className={`p-1 rounded ${activeFormats.has("bold") ? "text-amber-700" : "hover:border"}`}
				>
					<Bold className="w-4 h-4" />
				</button>
				<button
					onClick={() => toggleFormat("italic")}
					className={`p-1 rounded ${activeFormats.has("italic") ? "text-amber-700" : "hover:border"}`}
				>
					<Italic className="w-4 h-4" />
				</button>
				<button
					onClick={() => toggleFormat("underline")}
					className={`p-1 rounded ${activeFormats.has("underline") ? "text-amber-700" : "hover:border"}`}
				>
					<Underline className="w-4 h-4" />
				</button>
				<button
					onClick={() => toggleFormat("list")}
					className={`p-1 rounded ${activeFormats.has("list") ? "text-amber-700" : "hover:border"}`}
				>
					<List className="w-4 h-4" />
				</button>
				<button
					onClick={() => toggleFormat("link")}
					className={`p-1 rounded ${activeFormats.has("link") ? "text-amber-700" : "hover:border"}`}
				>
					<Link className="w-4 h-4" />
				</button>
			</div>
			<textarea
				value={content}
				onChange={(e) => onChange(e.target.value)}
				className="w-full h-[35vh] px-6 py-3 resize-none focus:outline-none overflow"
				placeholder="I'm not sure if there should a length limitation here"
			/>
			<div className="flex justify-end m-2">
				<FlexButton
					action={() => console.log("Preview")}
					color="bruniverse"
					className="px-3 py-2 text-amber-700 rounded font-medium text-base"
				>
					<strong>Preview</strong>
				</FlexButton>
			</div>
		</div>
	);
};

// Post Creation Modal Component
interface PostModalProps {
	onClose: () => void;
	onPost: ({}) => void;
	drafts?: Draft[];
	className?: string;
}
export const PostCreationModal = ({
	onClose,
	onPost,
	drafts = [],
	className = "",
}: PostModalProps) => {
	const [title, setTitle] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [content, setContent] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);

	const availableCategories = [
		"On-campus Question",
		"Off-campus Question",
		"Find People",
		"Promotion",
		"Life Trivia",
		"Other",
	];

	if (drafts.length == 0) {
		drafts = [
			{
				id: 1,
				title: "My Travel Adventure",
				date: "2024-01-15",
				content: "This is the content of My Travel Adventure.",
				categories: ["Travel", "Lifestyle"],
			},
			{
				id: 2,
				title: "Tech Trends 2024",
				date: "2024-01-10",
				content: "This is the content of Tech Trends 2024.",
				categories: ["Technology", "Business"],
			},
			{
				id: 3,
				title: "Healthy Cooking Tips",
				date: "2024-01-08",
				content: "This is the content of Healthy Cooking Tips.",
				categories: ["Food", "Health"],
			},
		];
	}

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev: string[]) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};
	const handlePost = () => {
		onPost({
			title,
			selectedCategories,
			content,
			isAnonymous,
		});
		onClose();
	};

	const handleSave = () => {
		// Save to drafts logic
		console.log("Saving draft...");
	};

	const handleDraftClick = (draft: Draft) => {
		setTitle(draft.title);
		setSelectedCategories(draft.categories);
		setContent(draft.content);
	};

	return (
		<div
			className={`absolute flex item-center justify-center bg-[#FEF4DC] rounded-[2.8vw] w-[90%] h-[86%]
				border-2 box-border z-50 ${className}`}
		>
			<div className="flex">
				{/* Close button */}
				<div className="absolute right-5 top-3 mb-4">
					<button
						onClick={onClose}
						className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-500 hover:text-red-700"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
				{/* Main Form */}
				<div className="flex-1 p-6">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-[#B10F0F] tracking-normal pb-4 mt-3 ">
							Create A New Post
						</h1>
					</div>

					<div className="space-y-5">
						<div className="flex items-start space-x-4">
							<label className="font-bold text-gray-700 pt-2 w-20 flex-shrink-0">
								Title
							</label>
							<div className="flex-1">
								<input
									type="text"
									value={title}
									placeholder="Enter your post title"
									onChange={(e) => setTitle(e.target.value)}
									className={`w-full h-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all
					 					duration-200  p-2 ${title ? "font-bold" : ""} text-base bg-[#D9D9D942]`}
								/>
							</div>
						</div>

						<div className="flex items-start space-x-4">
							<label className="font-bold text-gray-700 w-20 pt-2 flex-shrink-0">
								Category
							</label>
							<div className="flex-1">
								<div className="flex flex-wrap gap-2">
									{availableCategories.map((category) => (
										<button
											key={category}
											onClick={() =>
												toggleCategory(category)
											}
											className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-sm ${
												selectedCategories.includes(
													category
												)
													? "bg-[#A70B0B] text-white"
													: "bg-[#CC81001A] text-gray-700 hover:bg-orange-200"
											}`}
										>
											{category}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="flex items-start space-x-4">
							<label className="font-bold text-gray-700 w-20 pt-2 flex-shrink-0">
								Content
							</label>
							<div className="flex-1">
								<RichTextEditor
									content={content}
									onChange={setContent}
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2 mt-10 ml-4">
							<label
								htmlFor="anonymous"
								className="text-sm font-bold"
							>
								Post Anonymously
							</label>
							<input
								type="checkbox"
								id="anonymous"
								checked={isAnonymous}
								onChange={(e) =>
									setIsAnonymous(e.target.checked)
								}
								className="w-4 h-4 rounded focus:ring-red-500 p-2 bg-[#A70B0B]"
								style={{ accentColor: "#A70B0B" }}
							/>
						</div>
					</div>
				</div>

				{/* Drafts Sidebar */}
				<div className="w-80 p-3 mt-5 ml-3">
					<div className="space-y-2 mb-6">
						<DraftsSidebar
							drafts={drafts}
							onDraftClick={(draft) =>
								console.log("Draft Clicked")
							}
						/>
					</div>

					<div className="absolute bottom-4 right-4 flex flex-row space-x-6">
						<FlexButton
							color="bruniverse"
							action={handleSave}
							width={"6vw"}
							className="px-4 py-2 rounded-lg font-medium"
						>
							<strong>Save</strong>
						</FlexButton>
						<FlexButton
							color="danger"
							width={"6vw"}
							action={handlePost}
							className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
						>
							<strong>Post</strong>
						</FlexButton>
					</div>
				</div>
			</div>
		</div>
	);
};

// // Success Message Component
// const SuccessMessage = ({ isVisible, onClose }) => {
// 	if (!isVisible) return null;

// 	return (
// 		<div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
// 			<div className="flex items-center space-x-2">
// 				<span>Successful Posted</span>
// 				<button
// 					onClick={onClose}
// 					className="text-white hover:text-gray-200"
// 				>
// 					<X className="w-4 h-4" />
// 				</button>
// 			</div>
// 		</div>
// 	);
// };

// // Main App Component
// const App = () => {
// 	const [isModalOpen, setIsModalOpen] = useState(true);
// 	const [showSuccess, setShowSuccess] = useState(false);
// 	const [sidebarOpen, setSidebarOpen] = useState(false);

// 	const sampleDrafts = [
// 		{
// 			title: "Find A Guitar Player for Friday Show...",
// 			category: "Find ppl",
// 		},
// 		{ title: "Music Theory Study Group", category: "General" },
// 		{ title: "Weekend Jam Session", category: "Event" },
// 	];

// 	const handlePost = (postData) => {
// 		console.log("Posting:", postData);
// 		setShowSuccess(true);
// 		setTimeout(() => setShowSuccess(false), 3000);
// 	};

// 	const handleDraftClick = (draft) => {
// 		console.log("Opening draft:", draft);
// 		setIsModalOpen(true);
// 	};

// 	return (
// 		<div className="min-h-screen bg-amber-25">
// 			{/* <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} /> */}

// 			<div className="flex">
// 				{/* <UserSidebar user={{ name: "Melody", id: "652397" }} /> */}

// 				<main className="flex-1 p-6">
// 					<div className="max-w-4xl mx-auto">
// 						<div className="bg-white rounded-lg shadow-sm p-6">
// 							<h1 className="text-2xl font-bold text-amber-900 mb-4">
// 								Welcome to Bruniverse
// 							</h1>
// 							<p className="text-amber-700 mb-6">
// 								Create posts, connect with others, and share
// 								your thoughts with the community.
// 							</p>

// 							<button
// 								onClick={() => setIsModalOpen(true)}
// 								className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
// 							>
// 								Create A Post
// 							</button>
// 						</div>
// 					</div>
// 				</main>

// 				<DraftsSidebar
// 					drafts={sampleDrafts}
// 					onDraftClick={handleDraftClick}
// 				/>
// 			</div>

// 			<PostCreationModal
// 				isOpen={isModalOpen}
// 				onClose={() => setIsModalOpen(false)}
// 				onPost={handlePost}
// 				drafts={sampleDrafts}
// 			/>

// 			<SuccessMessage
// 				isVisible={showSuccess}
// 				onClose={() => setShowSuccess(false)}
// 			/>
// 		</div>
// 	);
// };

// // Categories Section Component
// const CategoriesSection = () => {
// 	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
// 	const availableCategories = [
// 		"On-campus Question",
// 		"Off-campus Question",
// 		"Find People",
// 		"Promotion",
// 		"Life Trivia",
// 		"Other",
// 	];

// 	const toggleCategory = (category: string) => {
// 		setSelectedCategories((prev: string[]) =>
// 			prev.includes(category)
// 				? prev.filter((c) => c !== category)
// 				: [...prev, category]
// 		);
// 	};

// 	return (
// 		<div className="flex justify-start items-center gap-[1vh] py-2">
// 			{/* Categories Label */}
// 			<span className="text-gray-800 font-bold text-[1.25rem]">
// 				Categories
// 			</span>

// 			{/* Categories Tags */}
// 			<span className="flex flex-wrap gap-3 w-4/5"></span>
// 		</div>
// 	);
// };

//Content Toolbar Component
// const ContentToolbar = () => {
// 	return (
// 		<div
// 			className="flex items-center gap-2 p-2"
// 			style={{ top: "28vh", right: "2vw", zIndex: 10 }}
// 		>
// 			<button className="p-1 hover:border rounded transition-colors">
// 				<Bold className="w-4 h-4" />
// 			</button>
// 			<button className="p-1 hover:border rounded transition-colors">
// 				<Italic className="w-4 h-4" />
// 			</button>
// 			<button className="p-1 hover:border rounded transition-colors">
// 				<Underline className="w-4 h-4" />
// 			</button>
// 			<button className="p-1 hover:border rounded transition-colors">
// 				<ListOrdered className="w-4 h-4" />
// 			</button>
// 			<button className="p-1 hover:border rounded transition-colors">
// 				<Link className="w-4 h-4" />
// 			</button>
// 			{/* <button className="p-1 hover:border rounded transition-colors">
// 				<Paperclip className="w-4 h-4" />
// 			</button> */}
// 		</div>
// 	);
// };

// Content Area Component
// const ContentArea = () => {
// 	const [content, setContent] = useState("");

// 	return (
// 		<div className="flex justify-start items-start gap-[1vw] py-2 w-[52vw]">
// 			<span className="text-gray-800 font-bold text-[1.25rem]">
// 				Content
// 			</span>

// 			<div
// 				className="border-2 border-gray-300 rounded-lg bg-[#D9D9D942]"
// 				// style={{ width: "50vw", height: "45vh" }}
// 			>
// 				<ContentToolbar />
// 				<textarea
// 					value={content}
// 					onChange={(e) => setContent(e.target.value)}
// 					placeholder="Start writing your post..."
// 					className="overflow-scroll w-[50vw] h-[30vh] focus:outline-none resize-none p-3"
// 					style={{
// 						fontFamily: "Montserrat",
// 						fontSize: "16px",
// 						lineHeight: "24px",
// 					}}
// 				/>
// 				<FlexButton
// 					action={(e: Event) => console.log("Button clicked")}
// 					className="relative left-13/15 m-2"
// 				>
// 					<strong>Preview</strong>
// 				</FlexButton>
// 			</div>
// 		</div>
// 	);
// };

// Draft Sidebar Component
// const DraftSidebar = () => {
// 	const draftPosts = [
// 		{
// 			id: 1,
// 			title: "My Travel Adventure",
// 			date: "2024-01-15",
// 			categories: ["Travel", "Lifestyle"],
// 		},
// 		{
// 			id: 2,
// 			title: "Tech Trends 2024",
// 			date: "2024-01-10",
// 			categories: ["Technology", "Business"],
// 		},
// 		{
// 			id: 3,
// 			title: "Healthy Cooking Tips",
// 			date: "2024-01-08",
// 			categories: ["Food", "Health"],
// 		},
// 	];

//  	return (
// 		<div
// 			className="absolute p-4"
// 			style={{ top: "6vh", right: "0", width: "25vw", height: "100%" }}
// 		>
// 			<h2 className="text-xl font-bold text-gray-800 mb-4">
// 				Your Drafts
// 			</h2>
// 		</div>
// 	);
// };

// // Header Component
// const Header = ({ onMenuClick }) => {
// 	return (
// 		<header className="bg-amber-100 border-b border-amber-200 px-4 py-3">
// 			<div className="flex items-center justify-between">
// 				<div className="flex items-center space-x-4">
// 					<button
// 						onClick={onMenuClick}
// 						className="lg:hidden"
// 					>
// 						<Menu className="w-6 h-6 text-amber-800" />
// 					</button>
// 					<div className="flex items-center space-x-2">
// 						<div className="w-8 h-8 bg-amber-800 rounded flex items-center justify-center">
// 							<span className="text-white font-bold text-sm">
// 								🐻
// 							</span>
// 						</div>
// 						<span className="font-semibold text-amber-900">
// 							Bruniverse June
// 						</span>
// 					</div>
// 				</div>

// 				<nav className="hidden lg:flex items-center space-x-8">
// 					<a
// 						href="#"
// 						className="text-amber-800 hover:text-amber-900 font-medium"
// 					>
// 						About
// 					</a>
// 					<a
// 						href="#"
// 						className="text-amber-800 hover:text-amber-900 font-medium"
// 					>
// 						Team
// 					</a>
// 				</nav>

// 				<div className="flex items-center space-x-4">
// 					<div className="relative">
// 						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
// 						<input
// 							type="text"
// 							placeholder="Search Posts"
// 							className="pl-10 pr-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
// 						/>
// 					</div>
// 					<div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center">
// 						<span className="text-white font-bold">M</span>
// 					</div>
// 				</div>
// 			</div>
// 		</header>
// 	);
// };

// // User Sidebar Component
// const UserSidebar = ({ user }) => {
// 	return (
// 		<div className="w-64 bg-amber-50 border-r border-amber-200 p-4">
// 			<div className="flex flex-col items-center mb-6">
// 				<div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mb-3">
// 					<span className="text-white font-bold text-xl">M</span>
// 				</div>
// 				<h3 className="font-semibold text-amber-900">Melody</h3>
// 				<p className="text-sm text-amber-700">ID: 652397</p>
// 			</div>

// 			<div className="space-y-2">
// 				<button className="w-full text-left px-3 py-2 text-amber-800 hover:bg-amber-100 rounded">
// 					Profile
// 				</button>
// 				<button className="w-full text-left px-3 py-2 text-amber-800 hover:bg-amber-100 rounded">
// 					My Posts
// 				</button>
// 				<button className="w-full text-left px-3 py-2 text-amber-800 hover:bg-amber-100 rounded">
// 					Settings
// 				</button>
// 			</div>
// 		</div>
// 	);
// };
