// app/ui/auth/signin.tsx
'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { AuthFormProps, AuthAction, AuthLink, FormField } from './interfaces';

// Button variants
// Todo: Probably move button to the 
const buttonVariants = {
  primary: "w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
  secondary: "w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
  outline: "w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
};

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  primaryAction,
  secondaryActions = [],
  links = [],
  footer,
  className = "",
  formClassName = "",
  showPasswordToggle = true,
  socialProviders = []
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const validateField = (field: FormField, value: string): string => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { minLength, maxLength, pattern, message } = field.validation;
      
      if (minLength && value.length < minLength) {
        return message || `${field.label} must be at least ${minLength} characters`;
      }
      
      if (maxLength && value.length > maxLength) {
        return message || `${field.label} must be no more than ${maxLength} characters`;
      }
      
      if (pattern && !pattern.test(value)) {
        return message || `${field.label} format is invalid`;
      }
    }

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.id] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: AuthAction) => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await action.onClick(formData);
    } catch (error) {
      console.error('Auth action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Social Providers */}
        {socialProviders.length > 0 && (
          <div className="space-y-3">
            {socialProviders.map((provider, index) => (
              <button
                key={index}
                onClick={provider.onClick}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <provider.icon className="h-5 w-5" />
                <span className="text-sm font-medium text-gray-700">
                  Continue with {provider.name}
                </span>
              </button>
            ))}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className={`space-y-6 ${formClassName}`}>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
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
                    type={field.type === 'password' && showPasswords[field.id] ? 'text' : field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={`
                      block w-full px-3 py-3 border border-gray-300 rounded-lg
                      placeholder-gray-400 text-gray-900 focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors duration-200
                      ${field.icon ? 'pl-10' : ''}
                      ${field.type === 'password' && showPasswordToggle ? 'pr-10' : ''}
                      ${errors[field.id] ? 'border-red-500 focus:ring-red-500' : ''}
                    `}
                  />
                  {field.type === 'password' && showPasswordToggle && (
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.id)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[field.id] ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Links (like "Forgot Password?") */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={link.onClick}
                  className="text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              onClick={() => handleSubmit(primaryAction)}
              disabled={isLoading || primaryAction.loading}
              className={buttonVariants[primaryAction.variant || 'primary']}
            >
              {(isLoading || primaryAction.loading) ? (
                <>
                  <LoadingSpinner />
                  Loading...
                </>
              ) : (
                primaryAction.label
              )}
            </button>

            {secondaryActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSubmit(action)}
                disabled={isLoading || action.loading}
                className={buttonVariants[action.variant || 'outline']}
              >
                {action.loading ? (
                  <>
                    <LoadingSpinner />
                    Loading...
                  </>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {footer.text}{' '}
              <a
                href={footer.link.href}
                onClick={footer.link.onClick}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                {footer.link.label}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage components
export const SignUpForm = () => {
  const signupFields: FormField[] = [
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

  return (
    <AuthForm
      title="Create Account"
      subtitle="Sign up to get started with our platform"
      fields={signupFields}
      primaryAction={{
        label: 'Create Account',
        onClick: async (data) => {
          console.log('Signup data:', data);
          // Handle signup logic
        }
      }}
      footer={{
        text: "Already have an account?",
        link: {
          label: "Sign in",
          href: "/signin"
        }
      }}
    />
  );
};

export const SignInForm = () => {
    const signinFields: FormField[] = [
        {
            id: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'Enter your email',
            required: true
        },
        {
            id: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter your password',
            required: true
        }
    ];

    return (
        <AuthForm
            title="Welcome Back"
            subtitle="Sign in to your account"
            fields={signinFields}
            primaryAction={{
                label: 'Sign In',
                onClick: async (data) => {
                    console.log('Signin data:', data);
                    // Handle signin logic
                }
            }}
            links={[
                {
                    label: 'Forgot your password?',
                    href: '/forgot-password'
                }
            ]}
            footer={{
                text: "Don't have an account?",
                link: {
                    label: "Sign up",
                    href: "/signup"
                }
            }}
        />
    );
}