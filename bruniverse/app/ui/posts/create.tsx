import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlexButton } from "../util/buttons";
import {
	Bold,
	FileText,
	Italic,
	Link,
	List,
	Search,
	Underline,
	X,
} from "lucide-react";
import {
	getDrafts,
	updateDraft,
	validatePostInput,
	saveDraft,
	useDraftPagination,
} from "@/app/lib/post/util";
import { Category, Draft } from "../definitions";
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
// Draft context interface
interface DraftContext {
	id: Draft["id"];
	isFromDraft: boolean;
	originalData: Draft;
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
	const draftContextRef = useRef<DraftContext>(null);

	// Use the pagination hook
	const {
		addDraft,
		updateDraft: updateDraftInList,
		removeDraft,
	} = useDraftPagination(10);

	/**
	 *  Helper method to handle creation of new post.
	 */
	const handleNewPost = async () => {
		const post = {
			title,
			categoryId: selectedCategory.id,
			content,
			isAnonymous,
		};
		const { isValid, error } = validatePostInput(post);
		if (!isValid) {
			console.log(error);
			setAddPostStatus({ success: false, message: error });
			return;
		}

		const context = draftContextRef.current;
		const result = await onPost(post);

		if (result.success) {
			setAddPostStatus({ success: true, message: "Posted!" });

			// If posted from a draft, remove it from the list
			if (context?.id && context?.isFromDraft) {
				removeDraft(context.id);
			}

			// Clear form
			clearForm();
		} else {
			setAddPostStatus({ success: false, message: result.message });
		}

		draftContextRef.current = null;
	};

	/**
	 * Helper method to handle saving of drafted post.
	 */
	const handleSave = async () => {
		const post = {
			title,
			categoryId: selectedCategory.id,
			content,
			isAnonymous,
		};

		const context = draftContextRef.current;

		try {
			let result: Draft;

			if (context?.isFromDraft && context.id) {
				// Update existing draft
				result = await updateDraft(context.id, post);
				updateDraftInList(result);
				setAddPostStatus({ success: true, message: "Draft updated!" });
			} else {
				// Create new draft
				result = await saveDraft(post);
				addDraft(result);
				setAddPostStatus({ success: true, message: "Draft saved!" });
			}
		} catch (error) {
			error instanceof Error &&
				setAddPostStatus({ success: false, message: error.message });
		}

		draftContextRef.current = null;
	};

	/**
	 * Helper method populates post fields with draft content.
	 * @param draft
	 */
	const handleDraftSelect = (draft: Draft) => {
		// Set ref with complete context
		draftContextRef.current = {
			id: draft.id,
			isFromDraft: true,
			originalData: { ...draft },
		};

		// Populate fields
		setTitle(draft.title);
		setContent(draft.content);
		setSelectedCategory(draft.category);
		setIsAnonymous(draft.is_anonymous);
	};

	/**
	 * Clear form fields
	 */
	const clearForm = () => {
		setTitle("");
		setContent("");
		setSelectedCategory({ id: "", name: "" });
		setIsAnonymous(false);
		draftContextRef.current = null;
	};

	return (
		<div
			className={`absolute top-[7%] left-1/2 transform -translate-x-1/2 bg-[#FEF4DC] rounded-[2.8vw] w-[90%] h-[86%]
				border-2 box-border ${className}`}
		>
			{addPostStatus && (
				<ToastMessage
					status={addPostStatus}
					onClose={() => setAddPostStatus(null)}
				/>
			)}
			<div className="flex h-full w-full">
				{/* Close button */}
				<div className="absolute right-5 top-3 z-10">
					<button
						onClick={onClose}
						className="w-6 h-6 rounded-full border flex items-center justify-center text-gray-500 hover:text-red-700 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Main Form */}
				<div className="flex-1 p-6 pr-0 flex flex-col">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-[#B10F0F] tracking-normal pb-4 mt-3">
							Create A New Post
						</h1>
					</div>

					<div className="flex-1 space-y-5 overflow-y-auto">
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

				{/* Drafts Sidebar with pagination */}
				<div className="w-80 flex flex-col border-l border-gray-200 bg-[#FEF4DC] rounded-r-[2.8vw] overflow-hidden">
					{/* Drafts Section */}
					<div className="flex-1 p-4 min-h-0">
						<EnhancedDraftsSidebar
							onDraftClick={handleDraftSelect}
							pageSize={8} // Smaller page size for sidebar
						/>
					</div>

					{/* Action Buttons - Always visible */}
					<div className="p-4 border-t border-gray-200 bg-[#FEF4DC]">
						<div className="flex space-x-3">
							<FlexButton
								color="bruniverse"
								action={handleSave}
								width={"auto"}
								className="flex-1 px-4 py-3 rounded-lg font-medium text-center"
							>
								<strong>Save Draft</strong>
							</FlexButton>
							<FlexButton
								color="danger"
								width={"auto"}
								action={handleNewPost}
								className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-center"
							>
								<strong>Post</strong>
							</FlexButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
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
		<div className={`h-full flex flex-col ${className}`}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-bold text-gray-800">Your Drafts</h3>
				<span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
					{drafts.length}
				</span>
			</div>

			{drafts.length === 0 ? (
				<div className="flex-1 flex flex-col items-center justify-center text-center py-8">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<FileText className="w-8 h-8 text-gray-400" />
					</div>
					<h4 className="text-lg font-medium text-gray-600 mb-2">
						No drafts yet
					</h4>
					<p className="text-sm text-gray-500 max-w-xs">
						Start writing your post and save it as a draft to access
						it later.
					</p>
				</div>
			) : (
				<div className="flex-1 overflow-y-auto space-y-3 pr-1">
					{drafts.map((draft, index) => (
						<div
							key={draft.id}
							className="group p-3 bg-[#D9D9D942] rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
							onClick={() => onDraftClick(draft)}
						>
							<div className="flex items-start justify-between mb-2">
								<h4 className="font-semibold text-gray-800 truncate flex-1 group-hover:text-[#A70B0B] transition-colors">
									{draft.title || `Draft ${index + 1}`}
								</h4>
								<span className="text-xs text-gray-400 ml-2 flex-shrink-0">
									{draft.date}
								</span>
							</div>

							{draft.content && (
								<p className="text-sm text-gray-600 line-clamp-2 mb-2">
									{draft.content
										.replace(/<[^>]*>/g, "")
										.substring(0, 100)}
									{draft.content.length > 100 ? "..." : ""}
								</p>
							)}

							<div className="flex items-center justify-between">
								<span className="px-2 py-1 bg-[#CC81001A] text-xs rounded-full text-gray-700">
									{draft.category.name}
								</span>
								{draft.is_anonymous && (
									<span className="text-xs text-gray-500 italic">
										Anonymous
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// Rich Text Editor Component (unchanged)
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

// Enhanced DraftsSidebar component with pagination
interface EnhancedDraftSidebarProps {
	onDraftClick: (draft: Draft) => void;
	style?: {};
	className?: string;
	pageSize?: number;
}

export const EnhancedDraftsSidebar = ({
	onDraftClick,
	style,
	className,
	pageSize = 10,
}: EnhancedDraftSidebarProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	const {
		drafts,
		totalCount,
		hasMore,
		isLoading,
		error,
		loadMore,
		refresh,
		addDraft,
		updateDraft,
		removeDraft,
		searchDrafts,
	} = useDraftPagination(pageSize);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Perform search when debounced query changes
	useEffect(() => {
		searchDrafts(debouncedQuery);
	}, [debouncedQuery, searchDrafts]);

	// Intersection Observer for infinite scroll
	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{ threshold: 1.0 }
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasMore, isLoading, loadMore]);

	return (
		<div
			className={`h-full flex flex-col ${className}`}
			style={style}
		>
			{/* Header with search */}
			<div className="flex flex-col space-y-3 mb-4">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-bold text-gray-800">
						Your Drafts
					</h3>
					<span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
						{totalCount}
					</span>
				</div>

				<div className="relative">
					<input
						type="text"
						placeholder="Search drafts..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A70B0B] focus:border-transparent bg-[#D9D9D942]"
					/>
					<Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
				</div>
			</div>

			{/* Error state */}
			{error && (
				<div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
					<p className="text-sm text-red-600">{error}</p>
					<button
						onClick={refresh}
						className="text-sm text-red-700 underline hover:no-underline mt-1"
					>
						Try again
					</button>
				</div>
			)}

			{/* Drafts list */}
			{drafts.length === 0 && !isLoading ? (
				<div className="flex-1 flex flex-col items-center justify-center text-center py-8">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<FileText className="w-8 h-8 text-gray-400" />
					</div>
					<h4 className="text-lg font-medium text-gray-600 mb-2">
						{searchQuery ? "No drafts found" : "No drafts yet"}
					</h4>
					<p className="text-sm text-gray-500 max-w-xs">
						{searchQuery
							? "Try adjusting your search terms"
							: "Start writing your post and save it as a draft to access it later."}
					</p>
				</div>
			) : (
				<div className="flex-1 overflow-y-auto space-y-3 pr-1">
					{drafts.map((draft, index) => (
						<div
							key={draft.id}
							className="group p-3 bg-[#D9D9D942] rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
							onClick={() => onDraftClick(draft)}
						>
							<div className="flex items-start justify-between mb-2">
								<h4 className="font-semibold text-gray-800 truncate flex-1 group-hover:text-[#A70B0B] transition-colors">
									{draft.title || `Draft ${index + 1}`}
								</h4>
								<span className="text-xs text-gray-400 ml-2 flex-shrink-0">
									{draft.date}
								</span>
							</div>

							{draft.content && (
								<p className="text-sm text-gray-600 line-clamp-2 mb-2">
									{draft.content
										.replace(/<[^>]*>/g, "")
										.substring(0, 100)}
									{draft.content.length > 100 ? "..." : ""}
								</p>
							)}

							<div className="flex items-center justify-between">
								<span className="px-2 py-1 bg-[#CC81001A] text-xs rounded-full text-gray-700">
									{draft.category.name}
								</span>
								{draft.is_anonymous && (
									<span className="text-xs text-gray-500 italic">
										Anonymous
									</span>
								)}
							</div>
						</div>
					))}

					{/* Loading indicator */}
					{isLoading && (
						<div className="flex items-center justify-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A70B0B]"></div>
							<span className="ml-2 text-sm text-gray-500">
								Loading drafts...
							</span>
						</div>
					)}

					{/* Load more trigger */}
					{hasMore && !isLoading && (
						<div
							ref={loadMoreRef}
							className="h-4"
						/>
					)}

					{/* End of list indicator */}
					{!hasMore && drafts.length > 0 && (
						<div className="text-center py-4 text-sm text-gray-500">
							That's all your drafts!
						</div>
					)}
				</div>
			)}
		</div>
	);
};
