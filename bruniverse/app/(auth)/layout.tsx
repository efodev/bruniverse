/// app/auth/layout.tsx
import { NavBar } from "../ui/navigation";
import Link from "next/link";


export default function AuthLayout({ children}: { children: React.ReactNode }) {

	return (
		<>
			<NavBar
				user={undefined}
				position="top"
				variant="minimal"
				isLoggedIn={false}
				showNotifications={false}
				showSearch={false}
			/>

			<main className="overflow-hidden py-3 px-4">
				{children}
				<p className="text-sm text-gray-600 text-center mt-5">
					Have question? Ask{" "}
					<a href="mailto:bruniverse@gmail.com">
						bruniverse@gmail.com
					</a>
				</p>
			</main>
			<footer>
				<p className="fixed text-sm underline hover:text-[#550000] transition-colors duration-200 absolute right-5 bottom-5 overflow-hidden">
					<Link href={"/privacy-policy"}>Privacy|Terms</Link>
				</p>
			</footer>
		</>
	);
}