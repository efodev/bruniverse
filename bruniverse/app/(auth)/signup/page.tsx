/// app/(auth)/signup.tsx
"use client";

import { AuthForm } from "@/app/ui/auth/forms";
import { signupFields } from "@/app/ui/auth/data";
import { useRouter } from "next/router";


export default function SignupPage() {
	/**
	 * Handles the submission of signup form.
	 * First validates that passwords confirmation is correct
	 * @param formData form inputs
	 */
	const handleClick = async (formData: Record<string, string>) => {
		// Verify that user cor1rectly confirms password
		if (formData?.password !== formData?.confirmPassword) {
			throw new Error("passwords don't match");
		}

		const signupResponse = await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});

		// Get and verify that signup succeeded.
		const signupResult = await signupResponse.json();

		if (!signupResult.success) {
			throw new Error(signupResult.message);
		}
		// route to the verification page
		const router = useRouter();
		const timer = setTimeout(() => router.push("/verify-email"), 3000);
	};

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
					onClick: handleClick,
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
