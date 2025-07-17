"use client";
import { PostCreationModal } from "@/app/ui/post/create";
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
			<PostCreationModal
				onClose={() => console.log("closed")}
				onPost={({}) => console.log("posted")}
			/>
		</>
	);
}
