/// app/(auth)/verify_email/page.tsx
"use client";

import EmailVerification from "@/app/ui/auth/email_verification";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function EmailVerificationPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const verifyEmail = async (otp: string) => {
		try {
			const response = await fetch("/api/verify_otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token, otp }),
			});

			const { success, message } = await response.json();
			return { success, message };
		} catch (error) {
			console.log(error);
			return {
				success: false,
				message: "Something went wrong! Try again later...",
			};
		}
	};
	const resendCode = async () => {
		return { success: false, message: "Not implemented.." };
	};

	return (
		<Suspense>
			<EmailVerification
				title="A Verification Code has been Sent to your Email."
				subtitle="Enter the Verification Code."
				className=""
				onVerify={(otp) => verifyEmail(otp)}
				onResendCode={() => resendCode()}
			/>
		</Suspense>
	);
}
