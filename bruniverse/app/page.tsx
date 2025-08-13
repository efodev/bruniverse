import Image from "next/image";
import { NavBar } from "./ui/navigation";
import { MyUser } from "./ui/definitions";

/**
 *
 * @returns
 */
export default function Home() {
	const bruno: MyUser = {
		username: "Bruno",
		email: "bruno@brown.edu",
		avatar: undefined,
	};

	return (
		<>
			<NavBar
				user={bruno}
				position="top"
				variant="minimal"
				isLoggedIn={false}
				showNotifications={false}
				showSearch={false}
			/>
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<p className="text-center text-7xl">
					This is the Landing Page!!!
					<br />
					We could put Welcome message here.
				</p>
			</main>
		</>
	);
}

//   Todo: Handle by fetching from db.
