import { MAX_USERNAME_LENGTH } from "@/utils/constants";

import {
  validatePassword,
  validateUsername,
  validateName,
  validateInputs,
} from "@/utils/validate";

describe("validatePassword", () => {
  test("returns true for a valid password", () => {
    expect(validatePassword("Abc123!@#")).toBe(true);
  });

  test("returns false for a password that is too short", () => {
    expect(validatePassword("Abc123!")).toBe(false);
  });

  test("returns false for a password that does not contain a number", () => {
    expect(validatePassword("Abcdefg!")).toBe(false);
  });

  test("returns false for a password that does not contain a special character", () => {
    expect(validatePassword("Abc1234")).toBe(false);
  });
});

describe("validateUsername", () => {
  test("returns true for a valid username", () => {
    expect(validateUsername("john.doe_123")).toBe(true);
  });

  test("returns false for a username that is too short", () => {
    expect(validateUsername("jo")).toBe(false);
  });

  test("returns false for a username that is too long", () => {
    let longUsername = "john34_";
    for (let i = 0; i < MAX_USERNAME_LENGTH - 6; i++) longUsername += "a";
    expect(validateUsername(longUsername)).toBe(false);
  });

  test("returns false for a username that contains invalid characters", () => {
    expect(validateUsername("john.doe!")).toBe(false);
  });
});

describe("validateName", () => {
  test("returns true for a valid name", () => {
    expect(validateName("Jean-Luc Picard")).toBe(true);
  });

  test("returns false for a name that is too short", () => {
    expect(validateName("J")).toBe(false);
  });

  test("returns false for a name that is too long", () => {
    expect(
      validateName("Jean-Luc Picard is the captain of the USS Enterprise.")
    ).toBe(false);
  });

  test("returns false for a name that contains invalid characters", () => {
    expect(validateName("Jean-Luc Picard!")).toBe(false);
  });
});

describe("validateInputs", () => {
  test("returns true for valid inputs", () => {
    expect(
      validateInputs("Jean-Luc Picard", "captain", "Abc123!@#", "Abc123!@#")
    ).toBe(true);
  });

  test("throws an error for invalid name", () => {
    expect(() => {
      validateInputs("J", "captain", "Abc123!@#", "Abc123!@#");
    }).toThrowError(
      "Validation failed: Name must be between 2 and 50 characters long and only contain letters and spaces. "
    );
  });

  test("throws an error for invalid username", () => {
    expect(() => {
      validateInputs(
        "Jean-Luc Picard",
        "captain12345678901234!5",
        "Abc123!@#",
        "Abc123!@#"
      );
    }).toThrowError(
      "Validation failed: Username must be between 3 and 41 characters long and can only contain letters, numbers, periods, and underscores. "
    );
  });

  test("throws an error for invalid password", () => {
    expect(() => {
      validateInputs("Jean-Luc Picard", "captain", "password", "password");
    }).toThrowError(
      "Validation failed: Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character. "
    );
  });

  test("throws an error for passwords that do not match", () => {
    expect(() => {
      validateInputs("Jean-Luc Picard", "captain", "Abc123!@#", "Abc123");
    }).toThrowError(
      "Validation failed: The password and confirm password fields do not match."
    );
  });
});
