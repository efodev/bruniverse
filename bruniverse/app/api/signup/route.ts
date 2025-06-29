///@/app/api/signup/route.ts

// @/app/api/signup/route.ts
import { generateAlphanumericOTP } from "@/app/lib/auth/verification_util";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/db";
import {
	signupTransact,
	InsertOTPTransact,
	InvalidateOTPtransact,
} from "@/app/db/query";
import { hashPassword } from "@/app/lib/auth/password";
import { generateVerificationEmailHTML } from "@/app/ui/auth/email_template";
import { sendVerificationEmail } from "@/app/lib/auth/verification_util";
import { createId } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";
import { DatabaseError } from "pg";

export async function POST(request: NextRequest) {
	// ← Named export, not default
	const { username, email, password } = await request.json();
	const client = await db.getClient();
	try {
		// Generate verification id and code
		const id = createId();
		const verificationCode = generateAlphanumericOTP();
		const token = randomBytes(32).toString("base64url"); // URL-safe base64

		// hash password
		const hashedPassword = await hashPassword(password);

		// Generate the expiration time of 15minutes ( + 1 to handle latency)
		const expireTime = new Date(
			Date.now() + 16 * 60 * 1000
		).toLocaleString();

		// Save user details to database;
		const queryResult = await db.transact(
			[signupTransact, InvalidateOTPtransact, InsertOTPTransact],
			[
				[
					username,
					email, // maps to brown_email ($2)
					hashedPassword, // maps to password ($3)
					verificationCode, // maps to verification_code ($4)]
				],
				[email],
				[email, token, verificationCode, expireTime, id],
			],
			client
		);

		const emailHTML = generateVerificationEmailHTML({
			verificationCode: verificationCode,
			expirationTime: expireTime,
			duration: "15",
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
				rows: queryResult.rows[0],
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof DatabaseError && error.code === "23505") {
			client.query("ROLLBACK");
			let message;
			if (error.constraint === "users_brown_email_key") {
				message = "An account with this email already exists.";
			} else if (error.constraint === "users_username_key") {
				message = "This username is already taken.";
			} else {
				message = "An account with your credentials already exist.";
			}
			return NextResponse.json(
				{
					success: false,
					message: message,
				},
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ success: false, message: "An unexpected error occurred." },
			{ status: 500 }
		);
	} finally {
		client.release();
	}
}
