/// app/(auth)/login/page.tsx
'use client';
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
				title="Welcome Back to Bruniverse, Where you connect and find answers."
				subtitle="Sign in to your account"
				fields={signinFields}
				formClassName="bg-orange-50 rounded-lg bg-white p-6 shadow-lg"
				className="fixed inset-0 overflow-hidden"
				primaryAction={{
					label: "Sign In",
					onClick: async (data) => {
						console.log("Signin data:", data);
						// Handle signin logic
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
