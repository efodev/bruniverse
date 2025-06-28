/// @app/lib/auth/verify-email.ts
import nodemailer from "nodemailer";
import emailjs from "@emailjs/browser";

// Create transporter with server-side env vars
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// initialize emailjs options
emailjs.init({
	publicKey: process.env.EMAILJS_PUBLIC_KEY,
	blockHeadless: true,
	blockList: {
		list: [],
	},
	limitRate: {
		throttle: 10000, // 10s
	},
});

export function generateVerificationCode() {
	// Generate verification code and update database
	const verificationCode = Math.floor(
		100000 + Math.random() * 900000
	).toString();

	return verificationCode;
}

export async function sendVerificationEmail(
	receiver: string,
	text: string = "",
	html: string
) {
	const response = await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to: receiver,
		subject: "Verify Your Email Address",
		text: text,
		html: html,
	});

	return response;
}

export async function sendVerificationEmailJs(
	templateParams: Record<string, string>
) {
	console.log("public key", process.env.EMAILJS_PUBLIC_KEY);
	const emailjsResponse = await emailjs.send(
		process.env.EMAILJS_SERVICE_ID!,
		process.env.EMAILJS_VERIFICATION_TEMPLATE_ID!,
		templateParams,
		{
			publicKey: process.env.EMAILJS_PUBLIC_KEY,
		}
	);

	console.error(emailjsResponse);
	return emailjsResponse;
}
