import React, { useState, useRef, useEffect } from "react";
import { EmailVerificationProps } from "@/app/ui/definitions";

export default function EmailVerification({
	title,
	subtitle,
	className = "",
	onVerify,
	onResendCode,
	isLoading = false,
	isResending = false,
}: EmailVerificationProps) {
	const [code, setCode] = useState<string[]>(Array(6).fill(""));
	const [isComplete, setIsComplete] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Handle input change
	const handleInputChange = (index: number, value: string) => {
		// Only allow single digit
		if (value.length > 1) return;

		// Only allow numbers
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...code];
		newCode[index] = value;

		setCode(newCode);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}

		// Check if code is complete
		const isCodeComplete = newCode.every((digit) => digit !== "");
		setIsComplete(isCodeComplete);
	};

	// Handle backspace
	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	// Handle paste
	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);

		if (!/^\d+$/.test(pastedData)) return;

		const newCode = Array(6).fill("");
		for (let i = 0; i < pastedData.length && i < 6; i++) {
			newCode[i] = pastedData[i];
		}

		setCode(newCode);
		setIsComplete(newCode.every((digit) => digit !== ""));

		// Focus the next empty input or last input
		const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
		const focusIndex =
			nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
		inputRefs.current[focusIndex]?.focus();
	};

	// Handle verify button click
	const handleVerify = () => {
		if (isComplete && onVerify) {
			onVerify(code.join(""));
		}
	};

	// Handle resend code
	const handleResendCode = () => {
		if (onResendCode) {
			onResendCode();
		}
	};

	// Focus first input on mount
	useEffect(() => {
		inputRefs.current[0]?.focus();
	}, []);

	return (
		<div className={`overflow-hidden flex items-center justify-center p-4 ${className}`}>
			<div className="w-full">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold text-[#770000] mt-24 mb-16">
						{title}
					</h1>
				</div>

				{/* Verification Container */}
				<div className="bg-[#CC810033] rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md m-auto">
					<p className="text-[#770000] text-2xl leading-relaxed mb-4 ml-4 font-bold">
						{subtitle}
					</p>
					{/* Code Input Boxes */}
					<div className="flex justify-center gap-3 mb-8">
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => {
									inputRefs.current[index] = el;
								}}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(e) =>
									handleInputChange(index, e.target.value)
								}
								onKeyDown={(e) => handleKeyDown(index, e)}
								onPaste={handlePaste}
								className={`
                  w-12 h-12 text-center text-xl font-semibold
                  border-2 rounded-lg outline-none transition-all duration-200
                  ${
						digit
							? "border-red-900 bg-orange-50 text-red-900"
							: "border-gray-300 bg-[#F5F5F591] text-gray-900"
					}
                  focus:border-orange-200 focus:bg-red-50 focus:ring-2 focus:ring-gray-200
                  hover:border-gray-400
                `}
								disabled={isLoading}
							/>
						))}
					</div>

					{/* Resend Code Section */}
					<div className="text-left mb-6">
						<span className="text-[#770000] text-xl font-bold m-3">
							Didn't Receive it?
						</span>
						<button
							onClick={handleResendCode}
							disabled={isResending}
							className="text-black-50 hover:text-[#550000] text-md font-medium 
                             transition-colors duration-200 bg-[#F5F5F591] p-2 ml-3 
                            disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
						>
							{isResending ? "Sending..." : "Send Again"}
						</button>
					</div>

					{/* Verify Button */}
					<button
						onClick={handleVerify}
						disabled={!isComplete || isLoading}
						className={`
              w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
              ${
					isComplete && !isLoading
						? "bg-red-900 hover:bg-[#770010] active:bg-blue-800 shadow-sm hover:shadow-md"
						: "bg-gray-300 cursor-not-allowed"
				}
            `}
					>
						{isLoading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Verifying...
							</div>
						) : (
							"Enter"
						)}
					</button>

					{/* Footer */}
					<div className="text-center mt-6">
						<p className="text-xs text-gray-500">
							Check your spam folder if you don't see the email
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
