import clientPromise from "../../lib/mongodb";
import type { Request, Response } from "express";
import authorize from "../middlewares/authorize";

import { Collection } from "mongodb";
import { User } from "../models";

import { verifyAccessToken } from "../utils/jwt";
import allowMethods from "../middlewares/allowMethods";

async function handler(req: Request, res: Response) {
  const client = await clientPromise;
  const users: Collection<User> = client.db("ichat").collection("users");
  if (req.method === "GET") {
    const param = req.query.param;
    let user;
    try {
      //try to get a user with param being a username or an id
      // and query the database accordingly
      if (param && param !== "undefined") {
        user =
          (await users.findOne({ id: <string>param })) ??
          (await users
            .find({ username: param })
            .collation({ locale: "en", strength: 2 })
            .toArray()
            .then((arr) => arr[0]));
      } else {
        //if we didn't find a user then,
        //return the user whose access token is in the access token cookie
        const accessToken = req.cookies.accessToken;

        if (accessToken) {
          const { username } = verifyAccessToken(accessToken as string) as {
            username: string;
          };

          user = await users
            .find({ username: username })
            .collation({ locale: "en", strength: 2 })
            .toArray()
            .then((arr) => arr[0]);
        }
      }
    } catch (err) {
      process.env.NODE_ENV === "test" && console.log(err);
      res.status(500).json({ message: "Something went wrong", error: err });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, profilePicture, id, username, about } = user;
    const result = { name, profilePicture, id, username, about };
    return res.status(200).json(result);
  } else {
    const { updatedProfile } = req.body;
    delete updatedProfile.updated;
    const { id } = updatedProfile;

    try {
      //find the corresponding user
      const matchedUser = await users.findOne({ id: id });
      if (!matchedUser) throw new Error();

      //updated it
      await users
        .findOneAndReplace({ id: id }, { ...matchedUser, ...updatedProfile })
        .catch((err) => {
          console.dir(err, { depth: null });
          throw new Error();
        });

      res.status(200).json({ message: "user updated" });
    } catch {
      return res.status(500).json({ message: "Could not update user" });
    }
  }
}

export default allowMethods(["GET", "POST"], authorize(handler));
