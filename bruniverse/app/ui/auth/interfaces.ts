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
  variant?: 'primary' | 'secondary' | 'outline';
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
  primaryAction: AuthAction;
  secondaryActions?: AuthAction[];
  links?: AuthLink[];
  footer?: {
    text: string;
    link: AuthLink;
  };
  className?: string;
  formClassName?: string;
  showPasswordToggle?: boolean;
  socialProviders?: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[];
}
