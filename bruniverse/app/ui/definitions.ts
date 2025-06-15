import { StaticImageData } from "next/image";

// Types
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface AuthAction {
  label: string;
  onClick: (formData: Record<string, string>) => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export interface AuthLink {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  buttonAction: AuthAction;
  links?: AuthLink[];
  footer?: {
    text: string;
    link: AuthLink;
  };
  className?: string;
  formClassName?: string;
  showPasswordToggle?: boolean;
}

/// Navigation item interface
export interface NavItem {
  label: string;
  link: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

// Navigation component props
export interface NavigationProps {
  items: NavItem[];
  position?: "top" | "side";
  variant?: "default" | "glass" | "minimal";
  logo?: React.ReactNode;
  userSection?: React.ReactNode;
  showSearch?: boolean;
  showNotifications?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

export interface MyUser {
  username: string;
  email?: string;
  avatar: React.ReactNode;
};

export interface NavBarProps {
  user?: MyUser;
  isLoggedIn: boolean;
  showSearch: boolean;
  showNotifications: boolean;
  position: "top" | "side";
  variant: "default" | "glass" | "minimal";
}

export interface LogoProps {
  src: string | StaticImageData;
	alt: string;
	aspectRatio: number;
	width?: number;
	height?: number;
	href?: string;
	className?: string;
	priority?: boolean;
	quality?: number;
}

export interface EmailVerificationProps {
  /** Main title for the verification page */
  title: string;
  /** Subtitle/description text */
  subtitle: string;
  /** Additional CSS classes for styling customization */
  className?: string;
  /** Callback function when verification code is submitted */
  onVerify?: (code: string) => void;
  /** Callback function when resend code is requested */
  onResendCode?: () => void;
  /** Whether the verification is in loading state */
  isLoading?: boolean;
  /** Whether resend is in loading state */
  isResending?: boolean;
}
