import { Handler, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export default function authenticate(next) {
  return async function (req: Request, res: Response) {
    // Parse the cookies
    const accessToken = req.cookies.accessToken;

    try {
      if (!accessToken) {
        throw new Error();
      }

      // Verify the token and extract the payload
      // Check if the accessToken is defined, if so
      // we have an authenticated user if not we have
      // an unauthenticated user but with  the api access token

      const payload = verifyAccessToken(<string>accessToken) as {
        username: string;
      };

      /** Attach the payload to the request object for later use */
      if (!req.body) req.body = { user: payload };
      else req.body.user = payload;

      // Call the next middleware or API route handler function
      await next(req, res);
    } catch (error: any) {
      console.error(error);
      return res.status(401).json({ message: "Authentication Failed" });
    }
  };
}
