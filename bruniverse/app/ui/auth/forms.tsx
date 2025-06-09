// app/ui/auth/signin.tsx
'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { AuthFormProps, AuthAction, FormField } from '../definitions';
import { montserrat } from "@/app/ui/fonts";
import Link from 'next/link';
import styles from "@/app/(auth)/auth.module.css";

// Button variants
// Todo: Probably move button to the 
const buttonVariants = {
	primary:
		"bg-[#770000] text-white font-semibold rounded-lg hover:bg-[#550000] focus:outline-none focus:ring-2 focus:ring-[#770000] focus:ring-offset-2 transition-colors duration-200",
	secondary:
		"bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200",
};

export const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  buttonAction,
  links = [],
  footer,
  className = "",
  formClassName = "",
  showPasswordToggle = true,
}) => {
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
		{}
	);

	/**
	 * Updates form fields when user types in the values.
	 * Clear error messages in fills in a form field.
	 * @param fieldId name of field
	 * @param value value provided by user.
	 */
	const handleInputChange = (fieldId: string, value: string) => {
		setFormData((prev) => ({ ...prev, [fieldId]: value }));
		// Clear error when user starts typing
		if (errors[fieldId]) {
			setErrors((prev) => ({ ...prev, [fieldId]: "" }));
		}
	};
	/**
	 * Reveals or conceals password depending on user preference
	 * @param fieldId name of field
	 */
	const togglePasswordVisibility = (fieldId: string) => {
		setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
	};

	/**
	 * Check whether user provides valid form data.
	 * @param field interface of form field being validated.
	 * @param value value provided by user.
	 * @returns null string if entry is valid, otherwise error message.
	 */
	const validateField = (field: FormField, value: string): string => {
		if (field.required && !value.trim()) {
			return `${field.label} is required`;
		}

		if (field.validation) {
			const { minLength, maxLength, pattern, message } = field.validation;

			if (minLength && value.length < minLength) {
				return (
					message ||
					`${field.label} must be at least ${minLength} characters`
				);
			}

			if (maxLength && value.length > maxLength) {
				return (
					message ||
					`${field.label} must be no more than ${maxLength} characters`
				);
			}

			if (pattern && !pattern.test(value)) {
				return message || `${field.label} format is invalid`;
			}
		}

		return "";
	};

	/**
	 * Checks whether all form fields contain valid enteries.
	 * When a field is invalid, the `errors` state object is updated with
	 * the field name as property with the a specific error message as value.
	 *
	 * @returns True if all form entries are valid, otherwise False.
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		fields.forEach((field) => {
			const value = formData[field.id] || "";
			const error = validateField(field, value);
			if (error) {
				newErrors[field.id] = error;
			}
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handles submission of form on button click.
	 * It first validate the form and sets the error message in case of any error.
	 * If the form is valid, it calls the `onClick` method of the provided `AuthAction`
	 * interface with the form data.
	 * @param action an instance of AuthAction interface
	 * @returns
	 */
	const handleSubmit = async (action: AuthAction) => {
		if (!validateForm()) return;

		try {
			await action.onClick(formData);
		} catch (error) {
			console.error("Auth action failed:", error);
		}
	};

	return (
		<div
			className={` flex flex-col items-center justify-center space-y-4 ${className}`}
		>
			{/* Header Section */}
			<div className="text-center space-y-2 mt-3">
				<h1 className="text-2xl font-bold tracking-tight mt-1">
					{title}
				</h1>
				{subtitle && <p className="text-lg font-bold">{subtitle}</p>}
			</div>

			{/* Form Section */}
			<div
				className={`min-w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3 ${styles.bgcolor}
				 ${formClassName}`}
			>
				{/* Form Fields */}
				<div className="space-y-3">
					{fields.map((field) => (
						<div
							key={field.id}
							className="space-y-1"
						>
							<label
								htmlFor={field.id}
								className={`block text-sm font-medium`}
							>
								{field.label}
								{field.required && (
									<span className="text-red-500 ml-1">*</span>
								)}
							</label>

							<div className="relative">
								{field.icon && (
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<field.icon className="h-5 w-5 text-gray-400" />
									</div>
								)}

								<input
									id={field.id}
									name={field.id}
									type={
										field.type === "password" &&
										showPasswords[field.id]
											? "text"
											: field.type
									}
									placeholder={field.placeholder}
									value={formData[field.id] || ""}
									onChange={(e) =>
										handleInputChange(
											field.id,
											e.target.value
										)
									}
									className={` ${styles.fieldbgcolor}
                    block w-full px-3 py-2 border rounded-lg text-gray-900
                    placeholder-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-[#770000] focus:border-transparent transition-all duration-200
                    ${field.icon ? "pl-10" : ""}
                    ${
						field.type === "password" && showPasswordToggle
							? "pr-10"
							: ""
					}
                    ${
						errors[field.id]
							? "border-red-300 focus:ring-red-500"
							: "border-gray-300 hover:border-gray-400"
					}
                  `}
								/>

								{field.type === "password" &&
									showPasswordToggle && (
										<button
											type="button"
											onClick={() =>
												togglePasswordVisibility(
													field.id
												)
											}
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
										>
											{showPasswords[field.id] ? (
												<EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
											) : (
												<EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
											)}
										</button>
									)}
							</div>

							{errors[field.id] && (
								<p className="text-sm text-red-600 mt-1">
									{errors[field.id]}
								</p>
							)}
						</div>
					))}
				</div>

				{/* Links Section */}
				{links.length > 0 && (
					<div className="text-sm">
						{links.map((link, index) => (
							<Link
								key={index}
								href={link.href}
								onClick={link.onClick}
								className="text-[#770000] hover:text-[#550000] font-medium transition-colors duration-200"
							>
								{link.label}
							</Link>
						))}
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					onClick={() => handleSubmit(buttonAction)}
					className={`w-full px-4 py-3
						${buttonVariants[buttonAction.variant || "primary"]}`}
				>
					{buttonAction.label}
				</button>

				{/* Footer Section */}
				{footer && (
					<div className="text-center">
						<p className="text-sm text-gray-600">
							{footer.text}{" "}
							<Link
								href={footer.link.href}
								onClick={footer.link.onClick}
								className="font-medium text-[#770000] hover:text-[#550000] transition-colors duration-200"
							>
								{footer.link.label}
							</Link>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};


