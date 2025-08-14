///@/app/api/signup/route.ts

// @/app/api/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleAuthOperation } from "@/app/lib/auth/services";
import { generateVerificationEmailHTML } from "@/app/ui/auth/email_template";
import { sendVerificationEmail } from "@/app/lib/auth/verification_util";

export async function POST(request: NextRequest) {
	// ← Named export, not default
	const req = await request.json();
	try {
		const result = await handleAuthOperation("signup", req);

		// Send verification email to user on successful account creation.
		if (result?.success == true) {
			const { success, data, message } = result;

			const emailHttp = generateVerificationEmailHTML({
				verificationCode: data.otp,
				expirationTime: new Date(data.expires_at).toLocaleString(),
				duration: "15",
			});
			// TODO LATER: maybe handle throtling?
			await sendVerificationEmail(data.brown_email, "", emailHttp);

			// Return success response
			return NextResponse.json(
				{
					success,
					data,
					message,
				},
				{ status: 200 }
			);
		} else {
			return NextResponse.json(result, { status: 500 });
		}
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, message: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
