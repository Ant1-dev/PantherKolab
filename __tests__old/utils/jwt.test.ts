import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt";

describe("JWT functions", () => {
  const payload = { userId: 123 };

  it("should generate an access token", () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe("string");
  });

  it("should generate a refresh token", () => {
    const token = generateRefreshToken(payload);
    expect(typeof token).toBe("string");
  });

  it("should verify an access token", () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token) as { userId: string };
    expect(decoded.userId).toBe(payload.userId);
  });

  it("should verify a refresh token", () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token) as { userId: string };
    expect(decoded.userId).toBe(payload.userId);
  });

  it("should throw an error for an invalid access token", () => {
    const token = "invalid-token";
    expect(() => verifyAccessToken(token)).toThrow(jwt.JsonWebTokenError);
  });

  it("should throw an error for an invalid refresh token", () => {
    const token = "invalid-token";
    expect(() => verifyRefreshToken(token)).toThrow(jwt.JsonWebTokenError);
  });
});
