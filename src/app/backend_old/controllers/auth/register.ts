import * as mongoDB from "mongodb";
import { normalizeInputs } from "../../utils/normalize";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { v4 as uuid4 } from "uuid";
import authorize from "../../middlewares/authorize";
import allowMethods from "../../middlewares/allowMethods";

import clientPromise from "../../../lib/mongodb";
import type { Request, Response } from "express";

const handler = async (req: Request, res: Response) => {
  const client = await clientPromise;
  const users: mongoDB.Collection = client.db("ichat").collection("users");
  const data = req.body;

  try {
    const { name, username, password } = await normalizeInputs(
      data.name,
      data.username,
      data.password
    );

    const newUser = {
      ...data,
      id: uuid4(),
      about: data.about ?? "Hey there! I'm on Ichat!",
      name,
      username,
      password,
    };

    // Generate an access token and a refresh token
    const accessToken = generateAccessToken({ username });
    const refreshToken = generateRefreshToken({ username });

    // Set the access token as a cookie with a short expiration time

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 1000 * 60 * 60,
      // sameSite: process.env.NODE_ENV !== "production" ? "none" : "strict",
    });

    // Set the refresh token as a cookie with a longer expiration time

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // sameSite: process.env.NODE_ENV !== "production" ? "none" : "strict",
    });

    return await users
      .insertOne(newUser)
      .then(() => res.status(201).end())
      .catch((err) => {
        process.env.NODE_ENV !== "production" && console.dir(err, { depth: null });
        res.status(500).json({ message: "Could not register user" });
      });
  } catch (err) {
    process.env.NODE_ENV !== "test" && console.log(err);
    res.status(500).json({ message: "Could not register user" });
  }
};

export default authorize(handler);
