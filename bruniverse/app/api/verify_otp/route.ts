import { NextRequest, NextResponse } from "next/server";
import { handleAuthOperation } from "@/app/lib/auth/services";

export async function POST(request: NextRequest) {
	const req = await request.json();
	console.log(req);

	try {
		const result = await handleAuthOperation("verify_otp", req);
		// console logging result here...
		console.log(result);
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.stack);
			return NextResponse.json({
				success: false,
				message: error.message,
			});
		}
	}
}
