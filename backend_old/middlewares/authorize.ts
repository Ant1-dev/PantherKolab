import type { Handler, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import clientPromise from "../../lib/mongodb";

export default function authorize(next) {
  return async function (req: Request, res: Response) {
    const apiAccessToken = req.headers.authorization?.split(" ")[1];

    try {
      if (!apiAccessToken) {
        throw new Error();
      }

      const { username } = verifyAccessToken(<string>apiAccessToken) as {
        username: string;
      };

      /** Attach the payload to the request object for later use */
      if (username === "system") await next(req, res);
      else throw new Error();

      // Call the next middleware or API route handler function
    } catch (error: any) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }
  };
}
