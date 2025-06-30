import { signupDb } from "@/app/database/signupService";
import { verifyOTP } from "@/app/database/otpVerification";

export async function handleAuthOperation(
	operation: string,
	req: Record<string, string>
) {
	// Common error handling, logging, rate limiting
	switch (operation) {
		case "signup":
			return signupDb(req);
		case "verify_otp":
			return verifyOTP(req);
	}
}
