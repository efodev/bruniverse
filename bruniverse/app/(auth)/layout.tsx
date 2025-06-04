/// app/auth/layout.tsx
import { NavBar } from "../ui/navigation";


export default function AuthLayout({ children}: { children: React.ReactNode }) {

    return (
            <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
            </main>
                <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
            </div>
      );
}