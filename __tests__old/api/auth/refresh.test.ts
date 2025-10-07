/**
 * @jest-environment node
 */

import { mockRequestResponse } from "../../testUtils";
import refresh from "@/pages/api/auth/refresh";

import { getCookie, setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

let reqRes: { req: NextApiRequest; res: NextApiResponse };

afterEach(() => {
  expect(reqRes.res.writableEnded).toBe(true);
});

describe("Refresh  Api Route", () => {
  it("Should return a 405 error if request method is not POST", async () => {
    reqRes = mockRequestResponse("GET");
    const { req, res } = reqRes;

    const resJsonSpy = jest.spyOn(res, "json");

    await refresh(req, res);

    expect(res.statusCode).toBe(405);
    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Method not allowed"`
    );
  });

  it("Should return a 401 error if refresh token is invalid", async () => {
    reqRes = mockRequestResponse("POST");
    const { req, res } = reqRes;
    setCookie("refreshToken", "BadRefreshToken", { req, res });

    const resJsonSpy = jest.spyOn(res, "json");

    await refresh(req, res);

    expect(res.statusCode).toBe(401);

    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Authentication failed"`
    );
  });

  it("Should return a new access Token when refresh token valid", async () => {
    reqRes = mockRequestResponse("POST");
    const { req, res } = reqRes;
    setCookie("refreshToken", process.env.TEST_USER_REFRESH_TOKEN, { req, res });

    await refresh(req, res);

    expect(res.statusCode).toBe(200);
    const accessToken = getCookie("accessToken", { req, res }) as string;

    expect(typeof accessToken).toBe("string");
    expect(accessToken.length).toBeGreaterThan(10);
  });
});
