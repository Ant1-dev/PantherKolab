import clientPromise from "../../../lib/mongodb";

import * as mongoDB from "mongodb";

import authorize from "../../middlewares/authorize";
import authenticate from "../../middlewares/authenticate";

export default authenticate(
  authorize(async (req, res, next) => {
    if (req.method === "POST") {
      const client = await clientPromise;
      const users: mongoDB.Collection = client.db("ichat").collection("users");
      const data = req.body;
      const username = data?.username;
      const user = await users.findOne({ username: username });

      users.updateOne({ id: user?.id }, { $set: { online: false } });

      // Set the access token to null
      res.cookie(`accessToken`, "");

      // Set the refresh token as a cookie with a longer expiration time
      res.cookie(`refreshToken`, "");

      // Return the access token in the response
      return res.status(200).json({ message: "Logged out successfully" });
    } else {
      res.status(405).json({ message: "Bad Request, only POST accepted" });
    }
  })
);
