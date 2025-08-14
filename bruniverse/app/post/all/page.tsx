// "use client";

// import { PostNavigation } from "@/app/ui/navigation";
// import {
// 	LeftSidebar,
// 	LeftSideBarTopLevelItemsProps,
// 	RightContentArea,
// } from "@/app/ui/posts/all";
// import { PostCreationModal } from "@/app/ui/posts/create";
// import { Plus } from "lucide-react";
// import { useEffect, useLayoutEffect, useState } from "react";
// import { Category, Post } from "@/app/ui/definitions";
// import { fetchCategories } from "@/app/lib/post/util";

// // Main App Component
// const MainPostPage = () => {
// 	const [_, setActiveCategory] = useState<string>("all");
// 	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
// 	const [createPost, setCreatePost] = useState<boolean>(false);
// 	const [categories, setCategories] = useState<Category[]>([]);

// 	useLayoutEffect(() => {});
// 	useEffect(() => {
// 		fetchCategories().then((res) => {
// 			setCategories(res);
// 		});
// 	}, []);
// 	/**
// 	 * Helper method to handle created post
// 	 * @param post
// 	 */
// 	// const addPost = async (post: {}) => {
// 	// 	console.log("Post added");
// 	// 	try {
// 	// 		const res = await fetch("/api/post/add", {
// 	// 			method: "POST",
// 	// 			headers: {
// 	// 				"Content-Type": "application/json",
// 	// 				"x-user-data": sessionStorage.getItem("user") as string,
// 	// 			},
// 	// 			body: JSON.stringify(post),
// 	// 		});

// 	// 		return await res.json();
// 	// 	} catch (error) {
// 	// 		console.log(error);
// 	// 		return {
// 	// 			success: false,
// 	// 			error: "INTERNAL_ERROR",
// 	// 			message: "Failed to create post.",
// 	// 		};
// 	// 	}
// 	// };

// 	const navItems = [
// 		{
// 			label: "About",
// 			style: "hover:text-amber-700 absolute top-[6.9vh] left-[22.74vw] font-extrabold text-3xl tracking",
// 			action: () => console.log("About clicked"),
// 			link: "/About",
// 		},
// 		{
// 			label: "Team",
// 			style: "hover:text-amber-700 absolute top-[6.9vh] left-[33.21vw] font-extrabold text-3xl tracking",
// 			action: () => console.log("Team clicked"),
// 			link: "/Team",
// 		},
// 	];

// 	const posts = [
// 		{
// 			id: "170",
// 			title: "Looking for Internship Advice",
// 			author: "Melody Chen",
// 			createdAt: "2 days ago",
// 			category: "questions",
// 			reactions: {
// 				heart: {
// 					isActive: true,
// 					count: 12,
// 				},
// 				star: { isActive: false, count: 3 },
// 			},
// 			commentCount: 2,
// 			isAnonymous: false,
// 			content:
// 				"Hey everyone! 👋\nHope you're all doing great! I'm currently starting to think about internships and wanted to ask for some advice from folks who've been through the process. I'm especially interested in roles related to creative tech, product design, music + AI.\nFeel free to drop any advice here or DM me — I really appreciate it! 🙏\nThanks in advance!!",
// 			comments: [
// 				{
// 					id: "1",
// 					title: "",
// 					content:
// 						"Hi! I'm here offering some advice. I would say talk to people from both the CS department and Music Department at Brown. Also, there's a lab doing Music generation here. This is the link https://musicgen.com. Check it out and hope it helps!",
// 					category: "",
// 					author: "Bruce Liang",
// 					createdAt: "",
// 					reactions: {
// 						heart: {
// 							isActive: true,
// 							count: 5,
// 						},
// 						star: { isActive: false, count: 4 },
// 					},
// 					comments: [],
// 					commentCount: 2,
// 					isAnonymous: false,
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
// 				heart: {
// 					isActive: true,
// 					count: 12,
// 				},
// 				star: { isActive: false, count: 3 },
// 			},
// 			content:
// 				"Looking for people to form a study group for CS150. We can meet twice a week to go over problem sets and prepare for exams together.",
// 			comments: [
// 				{
// 					id: "2",
// 					content: "I'm interested! What days work best for you?",
// 					category: "",
// 					author: "Sarah Johnson",
// 					createdAt: "",
// 					reactions: {
// 						heart: {
// 							isActive: true,
// 							count: 12,
// 						},
// 						star: { isActive: false, count: 3 },
// 					},
// 					comments: [],
// 					commentCount: 2,
// 					isAnonymous: false,
// 				},
// 				{
// 					id: "3",
// 					title: "",
// 					content:
// 						"Count me in. I'm free Tuesday and Thursday evenings.",
// 					category: "",
// 					author: "Mike Davis",
// 					createdAt: "",
// 					reactions: {
// 						heart: {
// 							isActive: true,
// 							count: 12,
// 						},
// 						star: { isActive: false, count: 3 },
// 					},
// 					comments: [],
// 					commentCount: 2,
// 					isAnonymous: false,
// 				},
// 			],
// 		},
// 		{
// 			id: "168",
// 			title: "Best Coffee Shops Near Campus",
// 			author: "Emma Wilson",
// 			createdAt: "3 days ago",
// 			category: "life-trivia",
// 			reactions: {
// 				heart: {
// 					isActive: true,
// 					count: 12,
// 				},
// 				star: { isActive: false, count: 3 },
// 			},
// 			isAnonymous: false,
// 			content:
// 				"New to the area and looking for good coffee shops to study at. Any recommendations for places with good wifi and a quiet atmosphere?",
// 			comments: [
// 				{
// 					id: "4",
// 					content:
// 						"Blue State Coffee is great! They have excellent wifi and plenty of seating.",
// 					category: "",
// 					author: "David Brown",
// 					createdAt: "",
// 					reactions: {
// 						heart: {
// 							isActive: true,
// 							count: 12,
// 						},
// 						star: { isActive: false, count: 3 },
// 					},
// 					comments: [],
// 					commentCount: 2,
// 				},
// 			],
// 		},
// 	];

// 	const topLevelItems: LeftSideBarTopLevelItemsProps[] = [
// 		{
// 			id: "all",
// 			name: "All",
// 			hasDropdown: false,
// 		},
// 		{
// 			id: "categories",
// 			name: "Categories",
// 			hasDropdown: true,
// 			dropdownItems: categories,
// 		},
// 		{
// 			id: "yours",
// 			name: "Yours",
// 			hasDropdown: true,
// 			dropdownItems: [
// 				{ id: "your-posts", name: "Posts" },
// 				{ id: "your-comments", name: "Comments" },
// 				{ id: "your-drafts", name: "Drafts" },
// 			],
// 		},
// 		{
// 			id: "starred",
// 			name: "Starred",
// 			hasDropdown: true,
// 			dropdownItems: [
// 				{ id: "starred-posts", name: "Posts" },
// 				{ id: "starred-comments", name: "Comments" },
// 			],
// 		},
// 	];

// 	return (
// 		<div
// 			className={`fixed min-h-dvh min-w-dvw ${createPost ? "bg-[#ADA89B]" : "bg-[#FEF4DC]"}`}
// 		>
// 			<PostNavigation
// 				logo={{ show: true, position: "left", src: "" }}
// 				menuButton={{
// 					show: true,
// 					position: "left",
// 					style: "absolute top-[6.9vh] left-[3vw] w-15 h-15 ",
// 				}}
// 				navItems={navItems}
// 				searchBar={{
// 					show: !createPost,
// 					position: "center",
// 					placeholder: "Search Posts",
// 					style: "absolute left-[43.92vw] top-[6.31vh] h-[6.39vh] w-[39.12vw]",
// 				}}
// 				userSection={{ show: true, position: "right", style: "" }}
// 			/>

// 			<div className="absolute top-[15vh] w-full h-[80vh] py-3 px-3">
// 				<div className="flex gap-6 divide-x divide-[#00000036]">
// 					<LeftSidebar
// 						onCategoryChange={setActiveCategory}
// 						posts={posts}
// 						selectedPost={selectedPost}
// 						onPostSelect={setSelectedPost}
// 						options={topLevelItems}
// 					/>

// 					<RightContentArea
// 						selectedPost={selectedPost}
// 						style={"w-[60%]"}
// 					/>
// 				</div>
// 			</div>
// 			{/* Floating Action Button */}
// 			<button
// 				onClick={() => setCreatePost(true)}
// 				className="absolute bottom-8 left-[35vw] w-15 h-15 bg-[#B10F0F] hover:bg-amber-900 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
// 			>
// 				<Plus size={"100%"} />
// 			</button>

// 			{createPost && (
// 				<PostCreationModal
// 					categories={categories}
// 					onClose={() => setCreatePost(false)}
// 					className={"z-50 top-[13vh]"}
// 				/>
// 			)}
// 		</div>
// 	);
// };

// export default MainPostPage;
