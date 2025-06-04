/// app/auth/signup.tsx
'use client';
import { AuthForm, } from "@/app/ui/auth/forms";
import { signupFields } from "@/app/ui/auth/data";

export default function SignupPage() {

    return (
		<>
			<AuthForm
				title="Create Account"
				subtitle="Sign up to get started with our platform"
				fields={signupFields}
				formClassName="bg-orange-50 rounded-lg bg-white p-6 shadow-lg"
				className="fixed inset-0 overflow-hidden"
				primaryAction={{
					label: "Create Account",
					onClick: async (data) => {
						console.log("Signup data:", data);
						// Handle signup logic
					},
				}}
				footer={{
					text: "Already have an account?",
					link: {
						label: "Sign In",
						href: "/login",
					},
				}}
			/>
		</>
	);
}
