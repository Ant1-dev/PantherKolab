import { hash } from "bcrypt";

import {
  normalizeName,
  normalizeUsername,
  normalizeInputs,
} from "@/utils/normalize";
import { SALT_ROUNDS } from "@/utils/constants";

jest.mock("bcrypt");

describe("normalizeName", () => {
  test("removes extra spaces and non word characters", () => {
    const result = normalizeName("  José ) García -\u00B4");
    expect(result).toBe("José García");
  });

  test("removes non-word characters", () => {
    const result = normalizeName("John Doe!@#$%^&*()");
    expect(result).toBe("John Doe");
  });
});

describe("normalizeUsername", () => {
  test("converts username to lowercase", () => {
    const result = normalizeUsername("JohnDoe");
    expect(result).toBe("johndoe");
  });
});

describe("normalizeInputs", () => {
  test("normalizes name, username, and password", async () => {
    const hashedPassword = await hash("password", SALT_ROUNDS);

    const result = await normalizeInputs(
      "  José  García  ",
      "JohnDoe",
      "password"
    );
    expect(result).toEqual({
      name: "José García",
      username: "johndoe",
      password: hashedPassword,
    });
  });
});
