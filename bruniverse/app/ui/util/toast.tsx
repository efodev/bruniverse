import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

// Toast Message Component
interface ToastMessageProps {
	status: { success: boolean; message: string };
	onClose: () => void;
	autoCloseDelay?: number; // milliseconds
}

export const ToastMessage = ({
	status,
	onClose,
	autoCloseDelay = 4000,
}: ToastMessageProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const [progress, setProgress] = useState(100);
	useEffect(() => {
		// Auto-dismiss timer
		const dismissTimer = setTimeout(() => {
			handleClose();
		}, autoCloseDelay);

		// Progress bar animation - updates every 50ms for smoother animation
		const updateInterval = 50;
		const progressStep = 100 / (autoCloseDelay / updateInterval);

		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev - progressStep;
				return newProgress <= 0 ? 0 : newProgress;
			});
		}, updateInterval);

		// Cleanup timers on unmount
		return () => {
			clearTimeout(dismissTimer);
			clearInterval(progressInterval);
		};
	}, [autoCloseDelay]);

	const handleClose = () => {
		setIsVisible(false);
		// Small delay for exit animation
		setTimeout(() => {
			onClose();
		}, 300);
	};

	if (!isVisible) return null;

	return (
		<div
			className={`fixed top-4 right-4 text-white px-2 py-3 rounded-lg shadow-lg z-51 transition-all duration-300 transform ${
				isVisible
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			} ${status.success ? "bg-green-500" : "bg-red-500"} min-w-80`}
		>
			{/* Progress bar */}
			<div className="absolute bottom-0 left-0 h-1 bg-inherit bg-opacity-30 rounded-b-lg overflow-hidden w-full">
				<div
					className={`h-full ${status.success ? "bg-green- 600" : "bg-red-600"} transition-all duration-100 ease-linear`}
					style={{ width: `${progress}%` }}
				/>
			</div>
			<div className="flex items-start space-x-3">
				{/* Icon */}
				<div className="flex-shrink-0 mt-0.5">
					{status.success ? (
						<CheckCircle className="w-5 h-5" />
					) : (
						<AlertCircle className="w-5 h-5" />
					)}
				</div>

				{/* Message */}
				<div className="flex-1 pr-2">
					<span className="font-semibold text-sm">
						{status.success ? "Success! " : "Error: "}
					</span>
					<span className="text-sm font-medium opacity-90 mt-1">
						{status.success
							? "Successfully Posted"
							: status.message}
					</span>
				</div>

				{/* Close button */}
				<button
					onClick={handleClose}
					className="flex-shrink-0 text-white hover:text-gray-200 transition-colors duration-200 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
					aria-label="Close notification"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};

// // Demo Component to show the toast in action
// const ToastDemo = () => {
// 	const [toasts, setToasts] = useState<
// 		Array<{
// 			id: number;
// 			status: { success: boolean; message: string };
// 		}>
// 	>([]);
// 	const [nextId, setNextId] = useState(1);

// 	const showSuccessToast = () => {
// 		const newToast = {
// 			id: nextId,
// 			status: { success: true, message: "Post created successfully!" },
// 		};
// 		setToasts((prev) => [...prev, newToast]);
// 		setNextId((prev) => prev + 1);
// 	};

// 	const showErrorToast = () => {
// 		const newToast = {
// 			id: nextId,
// 			status: {
// 				success: false,
// 				message: "Failed to create post. Please try again.",
// 			},
// 		};
// 		setToasts((prev) => [...prev, newToast]);
// 		setNextId((prev) => prev + 1);
// 	};

// 	const removeToast = (id: number) => {
// 		setToasts((prev) => prev.filter((toast) => toast.id !== id));
// 	};

// 	return (
// 		<div className="min-h-screen bg-gray-100 p-8">
// 			<div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
// 				<h2 className="text-2xl font-bold text-gray-800 mb-6">
// 					Toast Notification Demo
// 				</h2>

// 				<div className="space-y-4">
// 					<button
// 						onClick={showSuccessToast}
// 						className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
// 					>
// 						Show Success Toast
// 					</button>

// 					<button
// 						onClick={showErrorToast}
// 						className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
// 					>
// 						Show Error Toast
// 					</button>
// 				</div>

// 				<div className="mt-6 p-4 bg-gray-50 rounded-lg">
// 					<h3 className="font-medium text-gray-700 mb-2">
// 						Features:
// 					</h3>
// 					<ul className="text-sm text-gray-600 space-y-1">
// 						<li>• Auto-dismisses after 4 seconds</li>
// 						<li>• Manual close with X button</li>
// 						<li>• Progress bar shows remaining time</li>
// 						<li>• Smooth animations</li>
// 						<li>• Success/Error variants</li>
// 						<li>• Multiple toasts stack properly</li>
// 					</ul>
// 				</div>
// 			</div>

// 			{/* Render all toasts */}
// 			{toasts.map((toast, index) => (
// 				<div
// 					key={toast.id}
// 					style={{ top: `${1 + index * 5}rem` }}
// 					className="fixed right-4"
// 				>
// 					<ToastMessage
// 						status={toast.status}
// 						onClose={() => removeToast(toast.id)}
// 						autoCloseDelay={4000}
// 					/>
// 				</div>
// 			))}
// 		</div>
// 	);
// };

// export default ToastDemo;
