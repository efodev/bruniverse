/// app/(auth)/verify_email/page.tsx
"use client";

import EmailVerification from "@/app/ui/auth/email_verification";
import {useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailVerificationPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const id = searchParams.get("id");
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (token) {
			verifyEmail(token as string);
		}
	}, [token]);

	const verifyEmail = async (verificationToken: string) => {
		try {
			const response = await fetch("/api/verify-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token: verificationToken }),
			});

			const result = await response.json();

			if (result.success) {
				setStatus("success");
				setMessage("Email verified successfully");
				//setTimeout(() => router.push("/login"), 3000);
			} else {
				setStatus("error");
				setMessage(
					result.message || "Invalid or expired verification code."
				);
			}
		} catch (error) {
			setStatus("error");
			setMessage("An error occurred while verifying your email.");
		}
	};
	return (
		<>
			<EmailVerification
				title="A Verification Code has been Sent to your Email."
				subtitle="Enter the Verification Code."
				className=""
				onVerify={() => {}}
				onResendCode={() => {}}
			/>
		</>
	);
}
