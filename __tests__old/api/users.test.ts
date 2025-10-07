/**
 * @jest-environment node
 */

import { User } from "@/models";
import { NextApiRequest, NextApiResponse } from "next";
import { mockRequestResponse } from "../testUtils";
import login from "@/pages/api/auth/login";
import users from "@/pages/api/users";
import { getCookie, setCookie } from "cookies-next";
// import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
let reqRes: { req: NextApiRequest; res: NextApiResponse };

let accessToken: string;
let userObj = {
  id: expect.any(String),
  username: expect.any(String),
  name: expect.any(String),
};
beforeAll(async () => {
  //login in in order to receive an access token
  const { req, res } = mockRequestResponse("POST");
  setCookie("refreshToken", process.env.TEST_USER_REFRESH_TOKEN, { req, res });
  await login(req, res);
  accessToken = getCookie("accessToken", { req, res }) as string;
});

afterEach(() => {
  // Make sure that the api returned a response
  // no matter what. We do that by checking
  // the writableEnded property of res
  expect(reqRes?.res.writableEnded).toBeTruthy();
});

afterAll(async () => {
  //closing the mongoDB connection made
  // in the api in order to
  //prevent the tests from hanging
  await (await clientPromise).close();
});

describe("Users API route", () => {
  it("Should return a 403 code if request sent without/with bad API access token", async () => {
    //request made with an invalid api access token
    reqRes = mockRequestResponse(
      "GET",
      { userId: "" },
      { authorization: `Bearer ${process.env.BAD_API_ACCESS_TOKEN}` }
    );
    const { req, res } = reqRes;
    const resJsonSpy = jest.spyOn(res, "json");

    // add the user access token cookie to the request
    setCookie("accessToken", accessToken, { req, res });
    await users(req, res);

    expect(res.statusCode).toBe(403);
    expect(resJsonSpy.mock?.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Not authorized"`
    );
  });

  it("Should return a 404 code if no user found", async () => {
    // request made without a user access token cookie
    reqRes = mockRequestResponse("GET");

    const { req, res } = reqRes;
    req.query.param = "NonExistingUser#";
    const resJsonSpy = jest.spyOn(res, "json");
    await users(req, res);

    expect(res.statusCode).toBe(404);
    expect(resJsonSpy.mock?.lastCall?.[0].message).toMatchInlineSnapshot(
      `"User not found"`
    );
  });

  it("Should return a 200 code and a user if request valid with username given", async () => {
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;
    req.query.param = process.env.TEST_USER_USERNAME;
    const resJsonSpy = jest.spyOn(res, "json");
    await users(req, res);

    expect(res.statusCode).toBe(200);
    const result = resJsonSpy.mock?.lastCall?.[0];
    expect(result).toMatchObject<Partial<User>>(userObj);
  });

  it("Should return a 200 code and a user if request valid with user id given", async () => {
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;
    req.query.param = process.env.TEST_USER_ID;
    const resJsonSpy = jest.spyOn(res, "json");
    await users(req, res);

    expect(res.statusCode).toBe(200);
    const result = resJsonSpy.mock?.lastCall?.[0];
    expect(result).toMatchObject<Partial<User>>(userObj);
  });

  it("Should return a 200 code and a user if request valid with no param given but with valid access Token cookie", async () => {
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;
    setCookie("accessToken", accessToken, { req, res });
    const resJsonSpy = jest.spyOn(res, "json");
    await users(req, res);

    expect(res.statusCode).toBe(200);
    const result = resJsonSpy.mock?.lastCall?.[0];
    expect(result).toMatchObject<Partial<User>>(userObj);
  });
});
