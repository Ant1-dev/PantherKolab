import authenticate from "@/pages/api/middlewares/authenticate";

import { mockRequestResponse } from "../../testUtils";
import { setCookie } from "cookies-next";

describe("Authenticate middleware", () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
  });

  it("should return a 401 error if no accessToken cookie is given", async () => {
    const { req, res } = mockRequestResponse("GET");

    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const resJsonSpy = jest.spyOn(res, "json");

    await authenticate(mockHandler)(req, res);

    expect(res.statusCode).toBe(401);

    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Authentication Failed"`
    );
  });

  it("should return a 401 error if the accessToken cookie is not valid", async () => {
    const { req, res } = mockRequestResponse("GET");

    //passing an expired token
    setCookie("accessToken", process.env.REACT_APP_API_ACCESS_TOKEN, {
      req,
      res,
      maxAge: -1,
    });

    // Arrange
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const resJsonSpy = jest.spyOn(res, "json");

    await authenticate(mockHandler)(req, res);

    expect(res.statusCode).toBe(401);
    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Authentication Failed"`
    );
  });

  it("should call the next middleware if the  accessToken cookie is valid", async () => {
    const { req, res } = mockRequestResponse("GET");
    setCookie("accessToken", process.env.REACT_APP_API_ACCESS_TOKEN, {
      req,
      res,
    });
    await authenticate(mockHandler)(req, res);

    expect(mockHandler).toHaveBeenCalledWith(req, res);
  });
});
