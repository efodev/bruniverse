import db, { DatabaseError } from "@/app/database/db";
import {
	userByEmailTransact,
	getLoginAttemptsTransact,
	logLoginAttemptsTransact,
	updateLastLoginTransact,
} from "./query";
import { verifyPassword } from "../lib/auth/password";

/**
 * Handles user login by checking credentials, logging attempts, and managing account status.
 * @param req - Request object containing user credentials and metadata.
 * @returns Response object with success status, message, and user data or error details.
 */
export async function loginDb(req: Record<string, string>) {
	const { email, password, ipAddress, userAgent, startTime } = req;

	try {
		// start transaction
		await db.query("BEGIN");
		const result = await db.query(userByEmailTransact, [email]);
		const user = result.rows[0];

		// Get login attempt status regardless of whether user exists
		const loginStatus = await getLoginAttemptStatus(email);
		// Check if account is locked based on recent failed attempts
		if (
			loginStatus &&
			loginStatus.isLocked! &&
			loginStatus.lockExpiry! > new Date()
		) {
			await logLoginAttempt(
				user?.id || null,
				email,
				false,
				ipAddress,
				userAgent
			);
			await db.query("COMMIT");

			return {
				success: false,
				message:
					"Account temporarily locked. Please try again after 30 minutes.",
				lockedUntil: loginStatus.lockExpiry,
				status: 423,
				error: "LOCKED_ACCOUNT",
				data: {},
			};
		}

		if (!user) {
			await logLoginAttempt(user.id, email, false, ipAddress, userAgent);
			await db.query("COMMIT");

			// Generic error to prevent email enumeration
			return {
				success: false,
				message: "Invalid credentials",
				status: 401,
				error: "INVALID_CREDENTIALS",
				data: {},
			};
		}

		// Check if account is active
		if (!user.is_active) {
			await logLoginAttempt(user.id, email, false, ipAddress, userAgent);
			await db.query("COMMIT");

			return {
				success: false,
				message: "Account is deactivated",
				status: 403,
				error: "DEACTIVATED_ACCOUNT",
				data: {},
			};
		}

		// Check if email is verified
		if (!user.email_verified) {
			await logLoginAttempt(user.id, email, false, ipAddress, userAgent);
			await db.query("COMMIT");

			return {
				success: false,
				message: "Please verify your email address before logging in",
				status: 403,
				error: "UNVERIFIED_EMAIL",
				data: {},
			};
		}
		// Verify password
		const isPasswordValid = await verifyPassword(password, user.password);

		if (!isPasswordValid) {
			await logLoginAttempt(user.id, email, false, ipAddress, userAgent);
			await db.query("COMMIT");

			return {
				success: false,
				message: "Invalid password",
				error: "INVALID_CREDENTIAL",
				status: 401,
				data: {},
			};
		}

		// Successful login - log the attempt and update last login
		await logLoginAttempt(user.id, email, true, ipAddress, userAgent);
		await updateLastLogin(user.id);

		// Clean up old login attempts periodically (run occasionally)
		if (Math.random() < 0.01) {
			// 1% chance to run cleanup
			cleanupOldLoginAttempts();
		}

		return {
			success: true,
			message: "Login successful",
			data: user,
			status: 200,
		};
		// Set secure HTTP-only cookie
	} catch (error) {
		if (error instanceof Error) {
			console.error("Login error:", {
				message: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString(),
				duration: Date.now() - parseInt(startTime),
			});
		}
		if (error instanceof DatabaseError) {
			// Log error (in production, use proper logging service)
			try {
				await db.query("ROLLBACK");
			} catch (error) {
				console.error("Rollback failed:", error);
				// Categorize errors
				if (error instanceof DatabaseError) {
					if (error.message.includes("Database query failed")) {
						return {
							success: false,
							error: "SERVICE_DOWN",
							message:
								"Service temporarily unvailable. Please try again later",
							status: 503,
							data: {},
						};
					}

					if (error.code === "ECONNREFUSED") {
						return {
							success: false,
							error: "CONNECTION_FAILURE",
							message: "Service temporarily unavailable",
							status: 503,
							data: {},
						};
					}
				}
			}
		}

		// Generic server error
		return {
			success: false,
			error: "INTERNAL_ERROR",
			message: "An unexpected error occurred",
			status: 500,
			data: {},
		};
	}
}
/**
 * Queries the database for user login attempt history.
 * Checks whether the account is locked, or lock expired if previously
 * locked.
 * @param user_email user email
 * @returns database record of user login attempt history.
 */
const getLoginAttemptStatus = async (user_email: string) => {
	try {
		const result = await db.query(getLoginAttemptsTransact, [user_email]);
		const row = result.rows[0];

		// Check if account should be locked (5+ failed attempts in last 30 minutes)
		const isLocked = parseInt(row.recent_failed_attempts) >= 5;
		const lockExpiry =
			isLocked && row.last_failed_attempt
				? new Date(
						new Date(row.last_failed_attempt).getTime() +
							30 * 60 * 1000
					)
				: null;

		return {
			recentFailedAttempts: parseInt(row.recent_failed_attempts) || 0,
			failedAttempts15min: parseInt(row.failed_attempts_15min) || 0,
			lastFailedAttempt: row.last_failed_attempt,
			lastSuccessfulLogin: row.last_successful_login,
			isLocked,
			lockExpiry,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Failed to get login attempt status: ${error.message}`
			);
		}
	}
};
/**
 * Track the number of login attempts made by user in other to
 * limit too many attempts at logging.
 * @param userId database id of user
 * @param email user email
 * @param success whether login was successful or not
 * @param ipAddress ip address of user device
 * @param userAgent  device used on which user logged in.
 * @returns return database record of user login attempt.
 */
const logLoginAttempt = async (
	userId: string,
	email: string,
	success: boolean,
	ipAddress: string,
	userAgent: string
) => {
	try {
		const result = await db.query(logLoginAttemptsTransact, [
			userId,
			email,
			success,
			ipAddress,
			userAgent,
		]);
		return result.rows[0];
	} catch (error) {
		// Log but don't throw - logging failure shouldn't break login
		if (error instanceof Error) {
			console.error("Failed to log login attempt:", error.message);
		}

		return null;
	}
};

/**
 * Helper function to update last time user logged in.
 * @param userId
 * @returns
 */
const updateLastLogin = async (userId: string) => {
	try {
		const result = await db.query(updateLastLoginTransact, [userId]);
		return result.rows[0]?.last_login;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to update last login: ${error.message}`);
		}
	}
};
/**
 *  Clean up previous record of login attemspts
 * @returns
 */
const cleanupOldLoginAttempts = async () => {
	// Clean up login attempts older than 90 days
	const query = `
	  DELETE FROM login_attempts 
	  WHERE attempted_at < NOW() - INTERVAL '90 days'
	`;

	try {
		const result = await db.query(query);
		return result.rowCount;
	} catch (error) {
		if (error instanceof Error) {
			console.error(
				"Failed to cleanup old login attempts:",
				error.message
			);
		}

		return 0;
	}
};
