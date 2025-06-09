/// app/auth/signup.tsx
'use client';
import { AuthForm, } from "@/app/ui/auth/forms";
import { signupFields } from "@/app/ui/auth/data";

export default function SignupPage() {

    return (
		<>
			<AuthForm
				title="Getting Started for an amazing Journey!"
				subtitle="Sign up to Bruniverse"
				fields={signupFields}
				formClassName=""
				className="text-[#770000]"
				buttonAction={{
					label: "Sign Up",
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
