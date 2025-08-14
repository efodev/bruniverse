/// app/auth/layout.tsx
import { PostNavigation } from "../ui/navigation";
import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<header className="h-[80px]">
				<PostNavigation />
			</header>
			<main className="h-[calc(100vh-80px)]">
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
		</div>
	);
}
