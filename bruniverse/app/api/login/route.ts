import jwt from "jsonwebtoken";
import rateLimit from "next-rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { handleAuthOperation } from "@/app/lib/auth/services";

export async function POST(request: NextRequest) {
	const startTime = Date.now().toString();
	try {
		// Obtian the client IP address from the request headers
		const getClientIP = (request: NextRequest): string => {
			const forwarded = request.headers.get("x-forwarded-for");
			if (forwarded) {
				return forwarded.split(",")[0].trim();
			}

			const realIP = request.headers.get("x-real-ip");
			if (realIP) return realIP;

			const cfConnectingIP = request.headers.get("cf-connecting-ip");
			if (cfConnectingIP) return cfConnectingIP;

			return "unknown";
		};

		const { email, password } = await request.json();
		const ipAddress = getClientIP(request);
		const userAgent = request.headers.get("user-agent") || "unknown";

		const requestPayload = {
			email,
			password,
			ipAddress,
			startTime,
			userAgent,
		};

		const result = await handleAuthOperation("login", requestPayload);

		const { success, data, message, status } = result!;
		console.log("Login result:", result);
		if (!success) {
			return NextResponse.json(
				{
					success: false,
					message: message || "Login failed",
					data: {},
				},
				{ status: status || 500 }
			);
		}

		// Create JWT token.
		const token = jwt.sign(
			{
				id: data.id,
				email: data.brown_email,
			},
			process.env.JWT_SECRET!,
			{
				expiresIn: "7d",
				issuer: "bruniverse",
				audience: `${data.id}`,
			}
		);
		return NextResponse.json(
			{
				success: true,
				message: "Login successful",
				data: {
					id: data.id,
					email: data.email,
					lastLogin: data.last_login,
				},
			},
			{
				status: 200,
				headers: {
					"Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
					"Content-Type": "application/json",
				},
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			let message;
			console.error("Login error:", {
				message: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString(),
				duration: Date.now() - parseInt(startTime),
			});

			if (error.message.includes("JWT")) {
				message = "Authentication service error.";
			}

			return NextResponse.json(
				{
					success: false,
					message:
						message || "An unexpected error occurred during login",
					data: {},
				},
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}
}

// const limiter = rateLimit({
// 	interval: 60 * 1000, // 60 seconds
// 	uniqueTokenPerInterval: 500, // Max 500 users per second
// });
