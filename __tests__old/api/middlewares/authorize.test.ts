import authorize from "@/pages/api/middlewares/authorize";

import { mockRequestResponse } from "../../testUtils";

describe("Authorize middleware", () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
    //     mockRequest = {
    //       headers: {},
    //     };
    //     mockResponse = {
    //       status: jest.fn().mockReturnThis(),
    //       json: jest.fn(),
    //     };
  });

  it("should return a 403 error if no authorization header is present", async () => {
    const { req, res } = mockRequestResponse("GET", null, {
      authorization: "",
    });

    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const resJsonSpy = jest.spyOn(res, "json");

    await authorize(mockHandler)(req, res);

    expect(res.statusCode).toBe(403);

    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Not authorized"`
    );
  });

  it('should return a 403 error if the user is not "system"', async () => {
    const { req, res } = mockRequestResponse("GET", null, {
      authorization: `Bearer ${process.env.BAD_API_ACCESS_TOKEN}`,
    });

    // Arrange
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const resJsonSpy = jest.spyOn(res, "json");

    await authorize(mockHandler)(req, res);

    expect(res.statusCode).toBe(403);
    expect(resJsonSpy.mock.lastCall?.[0].message).toMatchInlineSnapshot(
      `"Not authorized"`
    );
  });

  it("should call the next middleware if the api access Token if valid", async () => {
    // A valid access token is already set in the headers by default
    const { req, res } = mockRequestResponse("GET");

    await authorize(mockHandler)(req, res);

    expect(mockHandler).toHaveBeenCalledWith(req, res);
  });
});
