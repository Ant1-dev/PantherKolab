/**
 * @jest-environment node
 */

import register from "@/pages/api/auth/register";
import {
  mockRequestResponse,
  createRandomUser,
  testUser,
  testUserWithWeakPassword,
} from "../../testUtils";

import clientPromise from "@/lib/mongodb";
import { getCookies } from "cookies-next";
import * as mongoDb from "mongodb";
import { User } from "@/models";
import { NextApiRequest, NextApiResponse } from "next";

let users: mongoDb.Collection;
let newUser: Partial<User>;
let reqRes: { req: NextApiRequest; res: NextApiResponse };
let testClient: mongoDb.MongoClient;

beforeAll(async () => {
  testClient = await clientPromise;
  users = testClient.db("ichat").collection("users");
});

afterEach(async () => {
  // Make sure that the api returned a response
  // no matter what. We do that by checking
  // the writableEnded property of res
  expect(reqRes?.res.writableEnded).toBeTruthy();

  //delete registered test User
  if (newUser) {
    const [matchedUser] = await users
      .find({ username: newUser.username })
      .collation({ locale: "en", strength: 2 })
      .toArray();

    await users
      .deleteOne({ _id: matchedUser?._id })
      .then((value) => {
        expect(value.acknowledged).toBe(true);
        expect(value.deletedCount).toBeGreaterThan(0);
      })
      .catch(
        (reason) => process.env.NODE_ENV === "test" && console.dir(reason.errInfo)
      );
  }
});

afterAll(async () => {
  await testClient.close();
});

describe("Register API route", () => {
  it("should return a 405 if request is not POST", async () => {
    //Mock the request, response context
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;

    const resJsonSpy = jest.spyOn(res, "json");

    await register(req, res);

    expect(res.statusCode).toBe(405);
    expect(resJsonSpy.mock.calls[0][0].message).toMatchInlineSnapshot(`"Method GET not allowed"`

);
  });

  it("should return a 500 error if user's username already exits", async () => {
    reqRes = mockRequestResponse("POST", testUser);
    const { req, res } = reqRes;

    const ResJsonSpy = jest.spyOn(res, "json");

    await register(req, res);

    expect(ResJsonSpy.mock.calls[0][0].message).toMatchInlineSnapshot(
      `"Could not register user"`
    );

    expect(res.statusCode).toBe(500);
  });

  it("should return a 500 error if user's password is not strong", async () => {
    reqRes = mockRequestResponse("POST", testUserWithWeakPassword);
    const { req, res } = reqRes;

    const ResJsonSpy = jest.spyOn(res, "json");

    await register(req, res);

    expect(ResJsonSpy.mock.calls[0][0].message).toMatchInlineSnapshot(
      `"Could not register user"`
    );

    expect(res.statusCode).toBe(500);
  });

  it("should return a code 201 and access token and refresh token if user is valid", async () => {
    newUser = createRandomUser();
    reqRes = mockRequestResponse("POST", newUser);
    const { req, res } = reqRes;
    const ResJsonSpy = jest.spyOn(res, "json");
    jest.spyOn(res, "status");

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    const { refreshToken, accessToken } = getCookies({ req, res }) as {
      refreshToken: string;
      accessToken: string;
    };

    expect(typeof refreshToken).toBe("string");
    expect(refreshToken.length).toBeGreaterThan(10);
    expect(typeof accessToken).toBe("string");
    expect(accessToken.length).toBeGreaterThan(10);
  });
});
