import * as mongoDB from "mongodb";
import { compare } from "bcrypt";
import clientPromise from "../../../lib/mongodb";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

import authorize from "../../middlewares/authorize";
import {
  LONG_REFRESH_TOKEN_DAYS_COUNT,
  SHORT_REFRESH_TOKEN_DAYS_COUNT,
} from "../../utils/constants";

import type { Request, Response } from "express";
import { User } from "@/models";
type UserWithPassword = User & { password: string };
export default authorize(async (req: Request, res: Response, next) => {
  try {
    if (req.method === "POST") {
      const refreshToken = req.cookies.refreshToken;

      //Try login in with the refresh token
      if (refreshToken) {
        // Verify the refresh token

        const { username } = verifyRefreshToken(<string>refreshToken) as {
          username: string;
        };

        // Generate a new access token
        const accessToken = generateAccessToken({ username });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          maxAge: 1000 * 24 * 60 * 60,
          sameSite: "none",
        });

        return res.status(200).end();
      } else {
        const client = await clientPromise;
        const users: mongoDB.Collection<UserWithPassword> = client
          .db("ichat")
          .collection("users");
        const data = req.body;
        const username = data?.username;
        // const user = await users
        //   .find({ username: username })
        //   .collation({ locale: "en", strength: 2 })
        //   .toArray()
        //   .then((arr) => arr?.[0])
        //   .catch((err) => {
        //     process.env.NODE_ENV !== "production" && console.log(err);
        //     return res.status(500).json(err);
        //   });

        const userPromise = users
          .find({ username: username })
          .collation({ locale: "en", strength: 2 })
          .toArray()
          .catch((err) => {
            process.env.NODE_ENV !== "production" && console.log(err);
            return res.status(500).json(err);
          });

        const user = (await userPromise.then((arr) => arr[0])) as UserWithPassword;

        const passwordsMatch = user
          ? await compare(data.password, user?.password)
          : null;

        if (user && passwordsMatch) {
          users
            .updateOne({ id: user.id }, { $set: { online: true } })
            .catch((err) => res.status(500).json(err));

          // Generate an access token and a refresh token
          const accessToken = generateAccessToken({ username });
          const refreshToken = generateRefreshToken({ username });
          const refreshTokenDuration =
            (data.rememberUser
              ? LONG_REFRESH_TOKEN_DAYS_COUNT
              : SHORT_REFRESH_TOKEN_DAYS_COUNT) * 86_400_000;

          // Set the access token as a cookie with a short expiration time
          try {
            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              path: "/",
              maxAge: 1000 * 60 * 60,
              sameSite: "none",
              secure: true,
            });
          } catch (error) {
            console.log(error);
          }

          // Set the refresh token as a cookie with a longer expiration time

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            maxAge: refreshTokenDuration,
            sameSite: "none",
            secure: true,
          });

          // console.log("the response is");
          // console.dir(res, { depth: null });

          // Return the access token in the response
          return res.status(200).end();
        } else throw new Error();
      }
    } else {
      return res.status(405).json({ message: "Bad Request, only POST accepted" });
    }
  } catch (err) {
    process.env.NODE_ENV !== "development" && console.log(err);

    return res.status(401).json({
      message: "Could not login user",
    });
  }
});
