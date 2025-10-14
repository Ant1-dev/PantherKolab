import * as mongoDB from "mongodb";

import type { MongoClient } from "mongodb";

declare global {
  namespace globalThis {
    var _mongoClientPromise: Promise<MongoClient>;
  }
}

const uri = process.env.MONGODB_URI;

let client: mongoDB.MongoClient;
let clientPromise;

if (!uri || typeof uri !== "string") {
  throw new Error("Add Mongo URI to .env.local");
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new mongoDB.MongoClient(uri, {
      serverApi: mongoDB.ServerApiVersion.v1,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new mongoDB.MongoClient(uri, {
    serverApi: mongoDB.ServerApiVersion.v1,
  });
  clientPromise = client.connect();
}

export default clientPromise as Promise<MongoClient>;
