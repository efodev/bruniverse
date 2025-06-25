/// app/ui/auth/data.ts
import { UserIcon } from "@heroicons/react/24/outline";
import { FormField } from "../definitions";


export const signupFields: FormField[] = [
	{
		id: "username",
		label: "Your Username",
		type: "text",
		placeholder: "bruno",
		required: true,
	},
	{
		id: "email",
		label: "Your School Email",
		type: "email",
		placeholder: "Enter your email",
		required: true,
		validation: {
			//pattern:  /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@brown\.edu$/,
			message: "Please enter a valid Brown University email address",
		},
	},
	{
		id: "password",
		label: "Password",
		type: "password",
		placeholder: "Create a password",
		required: true,
		validation: {
			minLength: 8,
			message: "Password must be at least 8 characters long",
		},
	},
	{
		id: "confirmPassword",
		label: "Confirm Password",
		type: "password",
		placeholder: "Confirm your password",
		required: true,
	},
];
  
export const signinFields: FormField[] = [
	{
		id: "email",
		label: "Your School Email",
		type: "email",
		placeholder: "bruno@brown.edu",
		icon: UserIcon,
		required: true,
	},
	{
		id: "password",
		label: "Password",
		type: "password",
		placeholder: "Create a password",
		required: true,
		validation: {
			minLength: 8,
			message: "Password must be at least 8 characters long",
		},
	},
];

