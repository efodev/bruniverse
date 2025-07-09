"use client";
import PostingUI from "@/app/ui/post/create";
import { NavBar } from "@/app/ui/navigation";

export default function NewPostPage() {
	return (
		<>
			<NavBar
				user={undefined}
				position="top"
				variant="minimal"
				isLoggedIn={true}
				showNotifications={true}
				showSearch={true}
			/>
			<PostingUI />
		</>
	);
}
