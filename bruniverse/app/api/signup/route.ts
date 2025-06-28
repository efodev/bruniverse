///@/app/api/signup/route.ts

// @/app/api/signup/route.ts
import { generateVerificationCode } from "@/app/lib/auth/verification_util";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/db";
import { signupQuery } from "@/app/db/query";
import { hashPassword } from "@/app/lib/auth/password";
import { generateVerificationEmailHTML } from "@/app/ui/auth/email_template";
import { sendVerificationEmail } from "@/app/lib/auth/verification_util";

export async function POST(request: NextRequest) {
	// ← Named export, not default
	const { username, email, password } = await request.json();

	try {
		// Generate verification code
		const verificationCode = generateVerificationCode();

		// hash password
		const hashedPassword = await hashPassword(password);
		const client = await db.getClient();

		const result = await client.query(signupQuery, [
			username,
			email, // maps to brown_email ($2)
			hashedPassword, // maps to password ($3)
			verificationCode, // maps to verification_code ($4)
		]);

		// Generate the expiration time of 15minutes ( + 1 to handle latency)
		const expireTime = new Date(
			Date.now() + 16 * 60 * 1000
		).toLocaleString();

		const duration = "15 minutes";
		const emailHTML = generateVerificationEmailHTML({
			verificationCode: verificationCode,
			expirationTime: expireTime,
			duration: duration,
		});

		const emailResult = await sendVerificationEmail(
			email,
			verificationCode,
			emailHTML
		);

		if (!emailResult.accepted.includes(email)) {
			// Work on Rolling back the values added to the db
			// Or may add throttling.
			throw new Error("Fail to create account.");
		}
		// Return success response
		return NextResponse.json(
			{
				success: true,
				message: "Successfully created account",
				rows: result.rows,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Email error:", error);
		if (error instanceof Error) {
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ success: false, message: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
