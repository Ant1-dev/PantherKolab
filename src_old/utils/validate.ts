import {
  MIN_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from "./constants";

export function validatePassword(password: string): boolean {
  // Check if password length is at least 8 characters
  if (password.length < MIN_PASSWORD_LENGTH) {
    return false;
  }

  // Check if password contains at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Check if password contains at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return false;
  }

  // Password is valid
  return true;
}

export function validateUsername(username: string): boolean {
  // Check if username length is between 3 and 20 characters
  if (
    username.length < MIN_USERNAME_LENGTH ||
    username.length > MAX_USERNAME_LENGTH ||
    username === "undefined"
  ) {
    return false;
  }

  // Check if username contains only letters, numbers, underscores or periods
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return false;
  }

  // Username is valid
  return true;
}

export function validateName(name: string): boolean {
  // Check if name contains only letters, spaces, and special characters in the French language
  if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/.test(name)) {
    return false;
  }

  // Check if name length is between 2 and 50 characters
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return false;
  }

  // Name is valid
  return true;
}

export function validateInputs(
  name: string,
  username: string,
  password: string,
  cPassword: string
): boolean | string {
  const nameIsValid = validateName(name);
  const usernameIsValid = validateUsername(username);
  const passwordIsValid = validatePassword(password);
  const cPasswordIsValid = password === cPassword;

  if (nameIsValid && usernameIsValid && passwordIsValid && cPasswordIsValid) {
    return true;
  } else {
    let errorMessage = "Validation failed: ";

    if (!nameIsValid) {
      errorMessage += `Name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters long and only contain letters and spaces. `;
    }

    if (!usernameIsValid) {
      errorMessage += `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters long and can only contain letters, numbers, periods, and underscores. `;
    }

    if (!passwordIsValid) {
      errorMessage += `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character. `;
    }

    if (!cPasswordIsValid) {
      errorMessage += "The password and confirm password fields do not match.";
    }

    throw new Error(errorMessage);
  }
}
