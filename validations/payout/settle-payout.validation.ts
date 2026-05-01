import z from "zod";

export const settlePayoutSchema = z.object({
  bankReferenceId: z
    .string("Bank reference ID is required")
    .nonempty("Bank reference ID is required"),

  iban: z.string("IBAN is required").nonempty("IBAN is required"),

  accountHolderName: z
    .string("Account holder name is required")
    .nonempty("Account holder name is required"),

  amount: z
    .number("Amount must be a number")
    .min(1, "Amount must be at least 1"),

  transferType: z.enum(
    ["NORMAL", "IMMEDIATE"],
    "Transfer type must be one of the following: NORMAL, IMMEDIATE",
  ),

  remarks: z
    .string("Remarks is required")
    .min(2, "Remarks must be at least 2 characters")
    .max(200, "Remarks must be at most 200 characters")
    .nonempty("Remarks is required"),

  paymentDate: z
    .string()
    .refine((value) => {
      return Date.parse(value);
    }, "Invalid date format")
    .nonempty("Payment date is required"),
});
