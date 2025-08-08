import React, { useEffect, useRef, useState } from "react";
import { FlexButton } from "../util/buttons";
import { Bold, Italic, Link, List, Underline, X } from "lucide-react";
import { validatePostInput } from "@/app/lib/post/util";
import { Category } from "../definitions";
import { ToastMessage } from "../util/toast";

// Post Creation Modal Component
interface PostModalProps {
	onClose: () => void;
	onPost: (post: {}) => Promise<any>;
	categories?: Category[];
	className?: string;
}
// Post status interface
interface PostStatus {
	success: boolean;
	message: string;
}
export const PostCreationModal = ({
	onClose,
	onPost,
	categories = [],
	className = "",
}: PostModalProps) => {
	const [title, setTitle] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<{
		id: string;
		name: string;
	}>({ id: "", name: "" });
	const [content, setContent] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [addPostStatus, setAddPostStatus] = useState<PostStatus | null>();
	const [drafts, setDrafts] = useState<Draft[]>([]);

	// Get drafts from database
	// Subsequent User draft should just be append to current drafts
	// Scroll should be handled with pagination
	useEffect(() => {}, [drafts]);

	if (drafts.length == 0) {
		const mydrafts = [
			{
				id: 1,
				title: "My Travel Adventure",
				date: "2024-01-15",
				content: "This is the content of My Travel Adventure.",
				category: { id: "travel", name: "Travel" },
			},
			{
				id: 2,
				title: "Tech Trends 2024",
				date: "2024-01-10",
				content: "This is the content of Tech Trends 2024.",
				category: { id: "technology", name: "Technology" },
			},
			{
				id: 3,
				title: "Healthy Cooking Tips",
				date: "2024-01-08",
				content: "This is the content of Healthy Cooking Tips.",
				category: {
					id: "food",
					name: "Food",
				},
			},
		];

		setDrafts(mydrafts);
	}
	/**
	 *  Helper method to handle creation of new post.
	 */
	const handlePost = async () => {
		const post = {
			title,
			categoryId: selectedCategory.id,
			content,
			is_anonymous: isAnonymous,
		};
		const { isValid, errors } = validatePostInput(post);
		if (!isValid) {
			console.log(errors);
			setAddPostStatus({ success: false, message: errors[0] });
		}
		const result = await onPost(post);
		if (result.success) {
			setAddPostStatus({ success: true, message: "Posted!" });
		} else {
			setAddPostStatus({ success: false, message: result.message });
		}
	};

	const handleSave = () => {
		// Save to drafts logic
		console.log("Saving draft...");
	};

	const handleDraftClick = (draft: Draft) => {
		setTitle(draft.title);
		setSelectedCategory(draft.category);
		setContent(draft.content);
	};

	return (
		<div
			className={`absolute flex item-center justify-center bg-[#FEF4DC] rounded-[2.8vw] w-[90%] h-[86%]
				border-2 box-border z-50 ${className}`}
		>
			{addPostStatus && (
				<ToastMessage
					status={addPostStatus}
					onClose={() => setAddPostStatus(null)}
				/>
			)}
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
									{categories.map((category) => (
										<button
											key={category.id}
											onClick={() =>
												setSelectedCategory(category)
											}
											className={`px-3 py-1 rounded-full text-sm font-medium transition-all shadow-sm ${
												category.id ===
												selectedCategory.id
													? "bg-[#A70B0B] text-white"
													: "bg-[#CC81001A] text-gray-700 hover:bg-orange-200"
											}`}
										>
											{category.name}
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

// Drafts Sidebar Component
interface Draft {
	id: number;
	title: string;
	date: string;
	content: string;
	category: { id: string; name: string };
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
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Your Drafts
			</h3>
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
							<span
								key={draft.category.id}
								className="px-2 py-1 bg-gray-100  text-xs rounded-full"
							>
								{draft.category.name}
							</span>
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
