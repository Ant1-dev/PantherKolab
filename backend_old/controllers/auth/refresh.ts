import { verifyRefreshToken, generateAccessToken } from "../../utils/jwt";
import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    const refreshToken = req.cookies.refreshToken;

    try {
      // Verify the refresh token
      const { username } = verifyRefreshToken(<string>refreshToken) as {
        username: string;
      };

      if (!username) {
        throw new Error();
      }

      // Generate a new access token
      const accessToken = generateAccessToken({ username });

      // Set the new access token as a cookie with a short expiration time
      res.cookie(`accessToken`, accessToken, {
        httpOnly: true,
        path: "/",
        maxAge: 1000 * 60 * 60,
        sameSite: "none",
        secure: true,
      });

      // Return the new access token in the response
      return res.status(200).end();
    } catch (err) {
      process.env.NODE_ENV === "test" && console.log(err);
      res.status(401).json({ message: "Authentication failed" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
