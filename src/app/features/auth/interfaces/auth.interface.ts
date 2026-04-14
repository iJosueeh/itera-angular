export interface AuthFooterLink {
  label: string;
  href: string;
}

export interface SocialProvider {
  label: string;
  icon: string;
}

export interface AuthFeatureBullet {
  title: string;
  description: string;
  icon: string;
}

export interface LoginViewModel {
  productName: string;
  visualTag: string;
  visualTitle: string;
  visualSubtitle: string;
  visualBullets: ReadonlyArray<AuthFeatureBullet>;
  mentorQuote: string;
  mentorName: string;
  formTitle: string;
  formSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPasswordText: string;
  primaryAction: string;
  socialProviders: ReadonlyArray<SocialProvider>;
  registerPrompt: string;
  registerCta: string;
  footerLinks: ReadonlyArray<AuthFooterLink>;
}

export interface RegisterViewModel {
  productName: string;
  visualSubtitle: string;
  visualBullets: ReadonlyArray<AuthFeatureBullet>;
  mentorQuote: string;
  mentorName: string;
  formEyebrow: string;
  formTitle: string;
  formSubtitle: string;
  fullNameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordHint: string;
  primaryAction: string;
  socialProviders: ReadonlyArray<SocialProvider>;
  loginPrompt: string;
  loginCta: string;
  footerLinks: ReadonlyArray<AuthFooterLink>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  redirectTo: string;
}
