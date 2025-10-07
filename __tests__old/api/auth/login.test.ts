/**
 * @jest-environment node
 */

import login from "@/pages/api/auth/login";
import { mockRequestResponse, testUser } from "../../testUtils";
import clientPromise from "@/lib/mongodb";
import { setCookie, getCookie, getCookies } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

// type InspectedPromise = Promise<any> & { state?: string; label?: string };
// class Inspector {
//   arr: InspectedPromise[] = [];
//   add(p: InspectedPromise, label: string) {
//     p.label = label || "";
//     if (!p.state) {
//       p.state = "pending";
//       p.then(
//         function () {
//           p.state = "resolved";
//         },
//         function () {
//           p.state = "rejected";
//         }
//       );
//     }
//     this.arr.push(p);
//     return p;
//   }
//   getPending() {
//     return this.arr.filter(function (p) {
//       return p.state === "pending";
//     });
//   }
//   getSettled() {
//     return this.arr.filter(function (p) {
//       return p.state !== "pending";
//     });
//   }
//   getResolved() {
//     return this.arr.filter(function (p) {
//       return p.state === "resolved";
//     });
//   }
//   getRejected() {
//     return this.arr.filter(function (p) {
//       return p.state === "rejected";
//     });
//   }
//   getAll() {
//     return this.arr.slice(0); // return a copy of arr, not arr itself.
//   }
// }

let reqRes: { req: NextApiRequest; res: NextApiResponse };

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

describe("Login API route", () => {
  // it("is none of your business", async () => {
  //   reqRes = mockRequestResponse("POST");
  //   setCookie("refreshToken", process.env.TEST_USER_REFRESH_TOKEN, reqRes);
  //   const { req, res } = reqRes;
  //   jest.spyOn(res, "json");

  //   await login(req, res);
  //   expect(res.statusCode).toBe(200);

  //   expect(4).toBe(4);
  // });

  it("should return a 401 error if user does not exist", async () => {
    //Mock the request, response context
    reqRes = mockRequestResponse("POST");
    const { req, res } = reqRes;
    jest.spyOn(res, "json");

    await login(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Could not login user",
    });
  });

  it("should return a 401 error if password is incorrect", async () => {
    reqRes = mockRequestResponse("POST", {
      ...testUser,
      password: "badPassword",
    });
    const { req, res } = reqRes;
    const ResJsonSpy = jest.spyOn(res, "json");

    await login(req, res);

    expect(res.statusCode).toBe(401);
    expect(typeof ResJsonSpy.mock.calls[0][0]?.message).toBe("string");
    expect(ResJsonSpy.mock.calls[0][0].message).toMatchInlineSnapshot(`"Could not login user"`);
  });

  it("should return a 401 error if refreshToken is incorrect", async () => {
    reqRes = mockRequestResponse("POST");
    const { req, res } = reqRes;
    setCookie("refreshToken", "badToken", { req, res });
    const ResJsonSpy = jest.spyOn(res, "json");

    await login(req, res);

    expect(res.statusCode).toBe(401);
    expect(typeof ResJsonSpy.mock.calls[0][0]?.message).toBe("string");
    expect(ResJsonSpy.mock.calls[0][0].message).toMatchInlineSnapshot(
      `"Could not login user"`
    );
  });

  it("should return a JWT access token and refresh token cookie if authentication with username + password is successful", async () => {
    reqRes = mockRequestResponse("POST", testUser);
    const { req, res } = reqRes;
    jest.spyOn(res, "status");

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    const { refreshToken, accessToken } = getCookies({ req, res }) as {
      refreshToken: string;
      accessToken: string;
    };

    expect(typeof refreshToken).toBe("string");
    expect(refreshToken.length).toBeGreaterThan(10);
    expect(typeof accessToken).toBe("string");
    expect(accessToken.length).toBeGreaterThan(10);
  });

  it("should set a JWT access token cookie if authentication with refresh token is successful", async () => {
    reqRes = mockRequestResponse("POST");
    const { req, res } = reqRes;
    setCookie("refreshToken", process.env.TEST_USER_REFRESH_TOKEN, { req, res });

    jest.spyOn(res, "status");

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const accessToken = getCookie("accessToken", { req, res }) as string;
    expect(typeof accessToken).toBe("string");

    expect(accessToken.length).toBeGreaterThan(10);
  });
});
