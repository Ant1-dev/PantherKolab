import formatTime from "../../src/utils/formatTime";

beforeAll(() => {
  process.env.TZ = "Etc/UTC";
});

describe("formatTime", () => {
  test("formats a timestamp in the morning", () => {
    const result = formatTime("2022-01-02T09:30:00.000");

    expect(result).toBe("9:30 AM");
  });

  test("formats a timestamp in the afternoon", () => {
    const result = formatTime("2022-01-02T16:30:00.000");
    expect(result).toBe("4:30 PM");
  });

  test("formats a timestamp at midnight", () => {
    const result = formatTime("2022-01-02T24:00:00.000");
    expect(result).toBe("12:00 AM");
  });

  test("formats a timestamp at noon", () => {
    const result = formatTime("2022-01-01T12:00:00.000");
    expect(result).toBe("12:00 PM");
  });
  test("returns an empty string if a timestamp is invalid", () => {
    const result = formatTime("invalidTimestamp");
    expect(result).toBe("");
  });
});
