import type { AxiosRequestConfig } from "axios";
import emojiRegexFunc from "emoji-regex";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_USERNAME_LENGTH = 41;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 50;
export const MIN_NAME_LENGTH = 2;
export const SALT_ROUNDS = 10;
export const LONG_REFRESH_TOKEN_DAYS_COUNT = 30;
export const SHORT_REFRESH_TOKEN_DAYS_COUNT = 1;
export const BASE_URL = (
  process.env.NODE_ENV === "production"
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : "http://localhost:3001/api"
) as string;

// console.log(process.env.NODE_ENV);
export const AXIOS_CONFIG: AxiosRequestConfig = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_API_ACCESS_TOKEN}`,
  },
};

const emojiString = emojiRegexFunc().toString();

export const EMOJI_REGEXP = new RegExp(
  `(${emojiString.substring(1, emojiString.length - 2)}){1,}`,
  "g"
);
