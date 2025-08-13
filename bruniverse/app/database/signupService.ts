import { generateAlphanumericOTP } from "@/app/lib/auth/verification_util";
import db, { DatabaseError, handleDatabaseError } from "@/app/database/db";
import { signupWithVerificationCTE } from "@/app/database/query";
import { hashPassword } from "@/app/lib/auth/password";
import { createId } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";

export async function signupDb(request: Record<string, string>) {
	const { username, email, password } = request;
	try {
		// Generate verification id and code
		const id = createId();
		const otp = generateAlphanumericOTP();
		const token = randomBytes(32).toString("base64url"); // URL-safe base64

		// hash password
		const hashedPassword = await hashPassword(password);

		// Generate the expiration time of 15minutes ( + 1 to handle latency)
		const expiresAt = new Date(
			Date.now() + 16 * 60 * 1000
		).toLocaleString();

		// Save user details to database;
		const result = await db.query(signupWithVerificationCTE, [
			username, // $1
			email, // $2
			hashedPassword, // $3
			otp, // $4
			token, // $5
			expiresAt, // $6
			id, // $7
		]);

		return {
			success: true,
			data: result.rows[0],
			message: "Account created successfully",
		};
	} catch (error) {
		// Maybe handle all error in query??
		if (error instanceof DatabaseError) {
			const res = handleDatabaseError(error, null)!;
			switch (res.error) {
				case "DUPLICATE_ERROR":
					let message;
					if (error.constraint === "users_brown_email_key") {
						message = "An account with this email already exists.";
					} else if (error.constraint === "users_username_key") {
						message = "This username is already taken.";
					} else {
						message =
							"An account with your credentials already exist.";
					}
					return {
						success: false,
						message,
						status: res.status,
					};
			}
		} else if (error instanceof Error) {
			console.error(error.stack);
			return {
				success: false,
				message: "Something went wrong. Try again later ...",
				status: 500, // Internal Server Error
			};
		}
	}
}
