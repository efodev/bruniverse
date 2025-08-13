import { signupDb } from "@/app/database/signupService";
import { verifyOTP } from "@/app/database/otpVerification";
import { loginDb } from "@/app/database/loginService";

export async function handleAuthOperation(
	operation: string,
	req: Record<string, string | number | boolean | any>
) {
	// Common error handling, logging, rate limiting
	switch (operation) {
		case "signup":
			return signupDb(req);
		case "verify_otp":
			return verifyOTP(req);
		case "login":
			return loginDb(req);
	}
}
