import db, { DatabaseError, handleDatabaseError } from "./db";
import { verifyOTPWithCTE } from "./query";

// Implementation with comprehensive error handling
export async function verifyOTP(req: Record<string, string>) {
	const { token, otp } = req;
	try {
		// Execute the CTE query
		const result = await db.query(verifyOTPWithCTE, [token, otp]);
	
		// Check row count and validate results
		if (result.rows.length === 0) {
			const logContext = {
				success: false,
				error: "INVALID_OTP",
				message: "Invalid or expired verification code",
			};
			console.warn("Invalid OTP", logContext);
			return {
				success: false,
				message: "Invalid or expired verification code",
				data: {},
			};
		}

		const row = result.rows[0];

		// Validate all operations succeeded
		const validationErrors = [];

		if (!row.verification_found) {
			validationErrors.push("Verification not found or invalid");
		}

		if (!row.verification_updated) {
			validationErrors.push("Failed to update verification status");
		}

		if (!row.user_updated) {
			validationErrors.push("Failed to update user verification status");
		}

		if (validationErrors.length > 0) {
			const logContext = {
				success: false,
				error: "PARTIAL_UPDATE_FAILURE",
				message: "Verification partially failed",
				details: validationErrors,
			};
			console.warn("Verification partially failed", logContext);
			return {
				success: false,
				message: "Verification partially failed",
				data: {},
			};
		}

		return {
			success: true,
			data: {
				userId: row.user_id,
				email: row.user_email,
				verificationId: row.verification_id,
			},
			message: "Email verified. Redirecting to login page.",
		};
	} catch (error) {
		// Handle DatabaseError instances
		if (error instanceof DatabaseError) {
			const res = handleDatabaseError(error, null)!;
			switch (res.error) {
				case "DUPLICATE_ERROR":
					return {
						success: false,
						message: "Verification already processed.",
						data: {},
					};
			}
		}
		// Handle custom business logic errors
		if (error instanceof Error) {
			// Log and handle unexpected errors
			console.error("OTP verification error:", {
				type: error.constructor.name,
				message: error.message,
				token: token ? token.substring(0, 8) + "..." : "null",
				stack: error.stack,
			});
		}
		return {
			success: false,
			message: "Something went wrong! Try again later...",
			data: {},
		};
	}
}
