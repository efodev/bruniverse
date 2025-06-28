/// app/auth/layout.tsx
import { NavBar } from "../ui/navigation";


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
		</>
	);
}