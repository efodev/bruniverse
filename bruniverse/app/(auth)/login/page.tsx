/// app/(auth)/login/page.tsx
"use client";
import { signinFields } from "@/app/ui/auth/data";
import { AuthForm } from "@/app/ui/auth/forms";

/**
 *
 * @returns
 */
export default function LoginPage() {
	const handleClick = async (loginData: Record<string, string>) => {
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...loginData,
				}),
			});

			const { success, data, message } = await res.json();
			if (!success) {
				return message;
			}
			// If login is successful, redirect to the home page or dashboard
			window.location.href = "/";
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error during login:", error.message);
			}
		}
	};
	return (
		<>
			<AuthForm
				title={
					"Welcome Back to Bruniverse,\nWhere you connect and find answers."
				}
				subtitle="Login to Bruniverse"
				fields={signinFields}
				className="text-[#770000]"
				formClassName=""
				buttonAction={{
					label: "Login",
					onClick: async (data) => {
						return await handleClick(data);
						// Handle signin logic and  set disabling state
					},
				}}
				links={[
					{
						label: "Forgot your password?",
						href: "/reset_password",
					},
				]}
				footer={{
					text: "Don't have an account?",
					link: {
						label: "Sign up",
						href: "/signup",
					},
				}}
			/>
		</>
	);
}
