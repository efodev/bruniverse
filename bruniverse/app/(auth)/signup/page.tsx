/// app/(auth)/signup.tsx
"use client";

import { AuthForm } from "@/app/ui/auth/forms";
import { signupFields } from "@/app/ui/auth/data";
import { useRouter } from "next/navigation";

export default function SignupPage() {
	// route to the verification page
	const router = useRouter();
	/**
	 * Handles the submission of signup form.
	 * First validates that passwords confirmation is correct
	 * @param formData form inputs
	 */
	const handleClick = async (formData: Record<string, string>) => {
		// Verify that user correctly confirms password
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
		const { success, data, message } = await signupResponse.json();

		if (!success) {
			return message || "Unexpected error occurred. Please try again.";
		}

		router.push(`/verify_email?user=${data?.id}&token=${data?.token}`);
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
					onClick: async (formData) => await handleClick(formData),
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
