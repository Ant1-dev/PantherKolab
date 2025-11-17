// Shared styles for all auth pages (login, signup, confirm-email, reset-password, etc.)

export const root = {
  backgroundImage: "url('/images/login-splash.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

export const decorativePaws = {
  backgroundImage: "url('/images/login-panther-paws.png')",
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

export const passwordStrength = {
  weak: {
    backgroundColor: "var(--password-weak)",
    color: "var(--password-weak)",
  },
  medium: {
    backgroundColor: "var(--password-medium)",
    color: "var(--password-medium)",
  },
  strong: {
    backgroundColor: "var(--password-strong)",
    color: "var(--password-strong)",
  },
  empty: {
    backgroundColor: "var(--password-empty)",
    color: "var(--password-empty)",
  },
};
