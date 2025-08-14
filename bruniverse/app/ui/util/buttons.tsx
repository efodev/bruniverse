import React, { ReactNode, useState } from "react";

interface FlexButtonProps {
	children?: ReactNode;
	color?:
		| "primary"
		| "secondary"
		| "success"
		| "danger"
		| "warning"
		| "outline"
		| "ghost"
		| "bruniverse";
	width?: string | number;
	height?: string | number;
	action: (e: Event) => void;
	style?: object;
	className?: string;
	disabled?: boolean;
	props?: {};
}
// Flexible Button Component
export const FlexButton = ({
	children,
	color = "primary",
	width = "auto",
	height = "auto",
	action,
	style = {},
	className = "",
	disabled = false,
	...props
}: FlexButtonProps) => {
	const [isPressed, setIsPressed] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	// Color variants
	const colorVariants = {
		primary: {
			bg: "#3B82F6",
			hover: "#2563EB",
			active: "#1D4ED8",
			text: "#FFFFFF",
			border: "#3B82F6",
		},
		secondary: {
			bg: "#6B7280",
			hover: "#4B5563",
			active: "#374151",
			text: "#FFFFFF",
			border: "#6B7280",
		},
		success: {
			bg: "#10B981",
			hover: "#059669",
			active: "#047857",
			text: "#FFFFFF",
			border: "#10B981",
		},
		danger: {
			bg: "#A70B0B",
			hover: "#DC2626",
			active: "#B91C1C",
			text: "#FFFFFF",
			border: "#EF4444",
		},
		warning: {
			bg: "#F59E0B",
			hover: "#D97706",
			active: "#B45309",
			text: "#FFFFFF",
			border: "#F59E0B",
		},
		outline: {
			bg: "transparent",
			hover: "#F3F4F6",
			active: "#E5E7EB",
			text: "#374151",
			border: "#D1D5DB",
		},
		ghost: {
			bg: "transparent",
			hover: "#F3F4F6",
			active: "#E5E7EB",
			text: "#374151",
			border: "transparent",
		},
		bruniverse: {
			bg: "#CC810033",
			hover: "oklch(90.1% 0.076 70.697)",
			active: "oklch(90.1% 0.076 80)",
			text: "#0000005E",
			border: "",
		},
	};
	const currentColor = colorVariants[color] || colorVariants.bruniverse;

	// Default styles with state management
	const defaultStyles = {
		width:
			width === "auto"
				? "auto"
				: typeof width === "number"
					? `${width}px`
					: width,
		height:
			height === "auto"
				? "auto"
				: typeof height === "number"
					? `${height}px`
					: height,
		backgroundColor: isPressed
			? currentColor.active
			: isHovered
				? currentColor.hover
				: currentColor.bg,
		color: currentColor.text,
		border: `1px solid ${currentColor.border}`,
		borderRadius: "8px",
		padding: "8px 16px",
		fontSize: "14px",
		fontWeight: "500",
		cursor: disabled ? "not-allowed" : "pointer",
		transition: "all 0.2s ease-in-out",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
		outline: "none",
		opacity: disabled ? 0.5 : 1,
		transform: isPressed ? "scale(0.98)" : "scale(1)",
		boxShadow: isPressed ? "inset 0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
		...style, // Override with custom styles
	};

	const handleMouseDown = () => {
		if (!disabled) setIsPressed(true);
	};

	const handleMouseUp = () => {
		if (!disabled) setIsPressed(false);
	};

	const handleMouseEnter = () => {
		if (!disabled) setIsHovered(true);
	};

	const handleMouseLeave = () => {
		if (!disabled) {
			setIsHovered(false);
			setIsPressed(false);
		}
	};

	const handleClick = (e: any) => {
		if (!disabled && action) {
			action(e);
		}
	};

	return (
		<button
			style={defaultStyles}
			className={className}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};
