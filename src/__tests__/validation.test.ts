import {
  applicantSchema,
  attachmentsSchema,
  detailsSchema,
  MAX_FILE_SIZE,
  todayISO,
} from "@/lib/validation";

const validApplicant = {
  fullName: "Mohsen Hussein",
  nationalId: "1234567890",
  email: "mohsen@example.com",
  mobile: "0551234567",
};

function firstError(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  field: string,
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("applicantSchema", () => {
  it("accepts a valid applicant", () => {
    expect(applicantSchema.safeParse(validApplicant).success).toBe(true);
  });

  it.each([
    ["nationalId", "3234567890", "nationalId"],
    ["nationalId", "12345", "nationalId"],
    ["mobile", "0661234567", "mobile"],
    ["mobile", "055123456", "mobile"],
    ["email", "not-an-email", "email"],
    ["fullName", "Mo", "minName"],
    ["fullName", "   ", "required"],
  ])("rejects %s = %p with the %p error key", (field, value, key) => {
    const result = applicantSchema.safeParse({ ...validApplicant, [field]: value });
    expect(result.success).toBe(false);
    expect(firstError(result, field)).toBe(key);
  });
});

describe("detailsSchema", () => {
  const validDetails = {
    entityName: "Riyadh Sports Club",
    city: "riyadh",
    startDate: todayISO(),
    description: "Request to operate a private sports club.",
  };

  it("accepts today's date", () => {
    expect(detailsSchema.safeParse(validDetails).success).toBe(true);
  });

  it("rejects past dates", () => {
    const result = detailsSchema.safeParse({ ...validDetails, startDate: "2000-01-01" });
    expect(firstError(result, "startDate")).toBe("futureDate");
  });

  it("requires a description of at least 20 characters", () => {
    const result = detailsSchema.safeParse({ ...validDetails, description: "Too short" });
    expect(firstError(result, "description")).toBe("minDescription");
  });
});

describe("attachmentsSchema", () => {
  const pdf = { name: "cr.pdf", size: 1024, type: "application/pdf" };

  it("requires at least one file", () => {
    const result = attachmentsSchema.safeParse({ attachments: [] });
    expect(firstError(result, "attachments")).toBe("attachmentsRequired");
  });

  it("rejects unsupported types and oversized files", () => {
    const result = attachmentsSchema.safeParse({
      attachments: [
        { ...pdf, type: "application/zip" },
        { ...pdf, size: MAX_FILE_SIZE + 1 },
      ],
    });
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual(expect.arrayContaining(["fileType", "fileSize"]));
  });

  it("allows at most five files", () => {
    const result = attachmentsSchema.safeParse({ attachments: Array(6).fill(pdf) });
    expect(firstError(result, "attachments")).toBe("attachmentsMax");
  });
});
