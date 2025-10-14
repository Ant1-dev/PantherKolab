// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "../../../lib/mongodb";
import authenticate from "../../middlewares/authenticate";
import authorize from "../../middlewares/authorize";
import allowMethods from "../../middlewares/allowMethods";
import type { Request, Response } from "express";
//models
import { User } from "../../models";
import type { Collection } from "mongodb";

const handler = authorize(async (req: Request, res: Response) => {
  const client = await clientPromise;
  const users: Collection<User> = client.db("ichat").collection("users");
  const { user: search } = req.query;

  process.env.NODE_ENV !== "development" &&
    console.log("User search query: ", search);

  try {
    //We select all the users where the name or username field matches the search
    //query
    const matchingExpression = { $regex: new RegExp(search as string, "i") };
    const results = users
      .find({
        $or: [{ username: matchingExpression }, { name: matchingExpression }],
      })
      .toArray();
    await results
      .then((r) => {
        const data = r.slice(0, 10).map((item) => ({ ...item, password: "" }));
        res.status(200).json(data);
      })
      .catch((e) => {
        throw new Error(e);
      });
  } catch (e) {
    process.env.NODE_ENV !== "production" && console.log(e);
    res.status(500).json({ message: "Username search failed" });
  }
});

export default handler;
