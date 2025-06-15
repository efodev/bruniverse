/// app/(auth)/login/page.tsx
"use client";
import { signinFields } from "@/app/ui/auth/data";
import { AuthForm } from "@/app/ui/auth/forms";

/**
 *
 * @returns
 */
export default function LoginPage() {
	return (
		<>
			<AuthForm
				title={"Welcome Back to Bruniverse,\nWhere you connect and find answers."}
				subtitle="Login to Bruniverse"
				fields={signinFields}
				className="text-[#770000]"
				formClassName=""
				buttonAction={{
					label: "Login",
					onClick: async (data) => {
						console.log("Signin data:", data);
						// Handle signin logic and  set disabling state
					},
				}}
				links={[
					{
						label: "Forgot your password?",
						href: "/forgot-password",
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
