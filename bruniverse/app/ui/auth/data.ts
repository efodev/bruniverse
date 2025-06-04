/// app/ui/auth/data.ts
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { FormField } from "../definitions";


export const signupFields: FormField[] = [
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      required: true
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      required: true
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Create a password',
      required: true,
      validation: {
        minLength: 8,
        message: 'Password must be at least 8 characters long'
      }
    },
    {
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Confirm your password',
      required: true
    }
];
  
export const signinFields: FormField[] = [
	{
		id: "email",
		label: "Email Address",
		type: "email",
        placeholder: "Enter your email",
        icon: UserIcon,
		required: true,
	},
	{
		id: "password",
		label: "Password",
        type: "password",
        placeholder: "Enter your password",
        icon: LockClosedIcon,
		required: true,
	},
];

