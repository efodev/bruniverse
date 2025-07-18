"use client";

import { PostNavigation } from "@/app/ui/navigation";
import { LeftSidebar, Post, RightContentArea } from "@/app/ui/post/all";
import { PostCreationModal } from "@/app/ui/post/create";
import { Plus } from "lucide-react";
import { useState } from "react";

// Main App Component
const MainPostPage = () => {
	const [activeCategory, setActiveCategory] = useState("all");
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [createPost, setCreatePost] = useState<boolean>(false);

	const navItems = [
		{
			label: "About",
			style: "hover:text-amber-700 absolute top-[6.9vh] left-[22.74vw] font-extrabold text-3xl tracking",
			action: () => console.log("About clicked"),
			link: "/About",
		},
		{
			label: "Team",
			style: "hover:text-amber-700 absolute top-[6.9vh] left-[33.21vw] font-extrabold text-3xl tracking",
			action: () => console.log("Team clicked"),
			link: "/Team",
		},
	];

	const category = [
		{ id: "all", name: "All" },
		{ id: "category", name: "category" },
		{ id: "yours", name: "Yours" },
		{ id: "starred", name: "Starred" },
		{ id: "on-campus", name: "On-campus Questions" },
		{ id: "off-campus", name: "Off-campus Questions" },
		{ id: "find-people", name: "Find people" },
		{ id: "promotion", name: "Promotion" },
		{ id: "life-trivia", name: "Life Trivia" },
		{ id: "other", name: "Other" },
	];

	const posts = [
		{
			id: "170",
			title: "Looking for Internship Advice",
			author: "Melody Chen",
			timestamp: "2 days ago",
			category: "questions",
			likes: 0,
			content: `Hey everyone! 👋\nHope you're all doing great! I'm currently starting to think about internships and wanted to ask for some advice from folks who've been through the process. I'm especially interested in roles related to creative tech, product design, music + AI.\nFeel free to drop any advice here or DM me — I really appreciate it! 🙏\nThanks in advance!!`,
			comments: [
				{
					id: "1",
					title: "",
					content:
						"Hi! I'm here offering some advice. I would say talk to people from both the CS department and Music Department at Brown. Also, there's a lab doing Music generation here. This is the link https://musicgen.com. Check it out and hope it helps!",
					category: "",
					author: "Bruce Liang",
					timestamp: "",
					likes: 0,
					comments: [],
				},
			],
		},
		{
			id: "169",
			title: "Study Group for CS150",
			author: "Alex Kim",
			timestamp: "1 day ago",
			category: "on-campus",
			likes: 0,
			content: `Looking for people to form a study group for CS150. We can meet twice a week to go over problem sets and prepare for exams together.`,
			comments: [
				{
					id: "2",
					title: "",
					content: "I'm interested! What days work best for you?",
					category: "",
					author: "Sarah Johnson",
					timestamp: "",
					likes: 0,
					comments: [],
				},
				{
					id: "3",
					title: "",
					content:
						"Count me in. I'm free Tuesday and Thursday evenings.",
					category: "",
					author: "Mike Davis",
					timestamp: "",
					likes: 0,
					comments: [],
				},
			],
		},
		{
			id: "168",
			title: "Best Coffee Shops Near Campus",
			author: "Emma Wilson",
			timestamp: "3 days ago",
			category: "life-trivia",
			likes: 0,
			content: `New to the area and looking for good coffee shops to study at. Any recommendations for places with good wifi and a quiet atmosphere?`,
			comments: [
				{
					id: "4",
					title: "",
					content:
						"Blue State Coffee is great! They have excellent wifi and plenty of seating.",
					category: "",
					author: "David Brown",
					timestamp: "",
					likes: 0,
					comments: [],
				},
			],
		},
	];

	return (
		<div
			className={`fixed min-h-dvh min-w-dvw ${createPost ? "bg-[#ADA89B]" : "bg-amber-25 "}`}
		>
			<PostNavigation
				logo={{ show: true, position: "left", src: "" }}
				menuButton={{
					show: true,
					position: "left",
					style: "absolute top-[6.9vh] left-[3vw] w-15 h-15 ",
				}}
				navItems={navItems}
				searchBar={{
					show: !createPost,
					position: "center",
					placeholder: "Search Posts",
					style: "absolute left-[43.92vw] top-[6.31vh] h-[6.39vh] w-[39.12vw]",
				}}
				userSection={{ show: true, position: "right", style: `` }}
			/>

			<div className="absolute top-[15vh] w-full h-[80vh] py-3 px-3">
				<div className="flex gap-6 divide-x divide-[#00000036]">
					<LeftSidebar
						onCategoryChange={setActiveCategory}
						posts={posts}
						selectedPost={selectedPost}
						onPostSelect={setSelectedPost}
					/>

					<RightContentArea
						selectedPost={selectedPost}
						style={"w-[60%]"}
					/>
				</div>
			</div>
			{/* Floating Action Button */}
			<button
				onClick={() => setCreatePost(true)}
				className="absolute bottom-8 left-[35vw] w-15 h-15 bg-[#B10F0F] hover:bg-amber-900 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
			>
				<Plus size={"100%"} />
			</button>

			{createPost && (
				<div className="flex items-center justify-center">
					<PostCreationModal
						onClose={() => setCreatePost(false)}
						onPost={({}) => console.log("posted")}
						className={`z-100000 top-[13vh] `}
					/>
				</div>
			)}
		</div>
	);
};

export default MainPostPage;
