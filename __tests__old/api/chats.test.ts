/**
 * @jest-environment node
 */

import { NextApiRequest, NextApiResponse } from "next";
import { mockRequestResponse } from "../testUtils";
import login from "@/pages/api/auth/login";
import chats from "@/pages/api/chats";
import { getCookie, setCookie } from "cookies-next";
import { Chat } from "@/models";
// import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

let reqRes: { req: NextApiRequest; res: NextApiResponse };

let accessToken: string;
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
  //closing the mongoDB connection in order to
  //prevent the tests from hanging
  await (await clientPromise).close();
});

describe("Chats API route", () => {
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
    await chats(req, res);

    expect(res.statusCode).toBe(403);
    expect(resJsonSpy.mock?.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Not authorized"`
    );
  });

  it("Should return a 401 code if request sent with bad auth", async () => {
    // request made without a user access token cookie
    reqRes = mockRequestResponse("GET");

    const { req, res } = reqRes;
    req.query.userId = process.env.TEST_USER_ID;

    const resJsonSpy = jest.spyOn(res, "json");
    await chats(req, res);

    expect(res.statusCode).toBe(401);
    expect(resJsonSpy.mock?.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Authentication Failed"`
    );
  });
  it("Should return a 200 code and an array of chats if request valid", async () => {
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;
    req.query.userId = process.env.TEST_USER_ID;
    setCookie("accessToken", accessToken, { req, res });
    const resJsonSpy = jest.spyOn(res, "json");

    await chats(req, res);

    expect(res.statusCode).toBe(200);
    const result = resJsonSpy.mock?.lastCall?.[0];
    expect(Array.isArray(result)).toBe(true);
    console.log(result);
    // expect(result[0]).toMatchObject<Chat>({
    //   id: expect.any(String),
    //   users: expect.any(Array),
    //   group: expect.any(Boolean),
    // });
  });
});
