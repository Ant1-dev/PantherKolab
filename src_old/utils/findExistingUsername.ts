import userService from "../services/userService";

export async function findExistingUsername(username: string) {
  process.env.NODE_ENV !== "production" && console.log("FOUND :", username);
  const response = userService.getUser(username);
  return await response.then(() => true).catch(() => false);
}
