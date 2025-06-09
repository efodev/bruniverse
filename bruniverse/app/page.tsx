import Image from "next/image";
import  { NavBar } from "./ui/navigation";
import { MyUser } from "./ui/definitions";

/**
 * 
 * @returns 
 */
export default function Home() {
  const bruno: MyUser = {
    username:  "Bruno",
    email: "bruno@brown.edu",
    avatar: undefined
  }

  return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-full min-w-full m-2/100 p-8 pb-20 gap-16 sm:p-20">
			<NavBar
				user={bruno}
				position="top"
				variant="minimal"
				isLoggedIn={false}
				showNotifications={false}
				showSearch={false}
			/>
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"></main>

		</div>
  );
}

//   Todo: Handle by fetching from db.