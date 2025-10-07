import { hash } from "bcrypt";
import { SALT_ROUNDS } from "./constants";

export function normalizeName(name: string): string {
  // Normalize name by removing extra spaces and non-word characters

  const normalized = name
    .normalize("NFC")
    .replace(/[^a-zA-Z àâäèéêëîïôœùûüÿçÀÂÄÜÈÉÊËÎÏÔŒÙÛÜÑŸÍñíÇ]/g, "")
    .trim()
    .replace(/\s{2,}/, " ");

  return normalized;
}

export function normalizeUsername(username: string): string {
  return username.toLowerCase();
}

export async function normalizeInputs(
  name: string,
  username: string,
  password: string
): Promise<{ name: string; username: string; password: string }> {
  // Normalize the name and username
  const normalizedName = normalizeName(name);
  const normalizedUsername = normalizeUsername(username);

  // Hash the password with SALT_ROUNDS salt rounds
  const hashedPassword = await hash(password, SALT_ROUNDS);

  return {
    name: normalizedName,
    username: normalizedUsername,
    password: hashedPassword,
  };
}
