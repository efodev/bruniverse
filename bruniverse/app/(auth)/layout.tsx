/// app/auth/layout.tsx
import { NavBar } from "../ui/navigation";


export default function AuthLayout({ children}: { children: React.ReactNode }) {

    return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<NavBar
				user={undefined}
				position="top"
				variant="minimal"
				isLoggedIn={false}
				showNotifications={false}
				showSearch={false}
			/>
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                {children}
                {/* Todo: Handle email link later */}
				<p className="text-sm text-gray-600 -m-3 lg:relative lg:left-37">
					Have question? Ask {" "}
					<a href="mailto:bruniverse@gmail.com">bruniverse@gmail.com</a>
				</p>
			</main>

		</div>
	);
}