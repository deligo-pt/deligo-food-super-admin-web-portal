"use server";

import { format, parse } from "date-fns";
import { XMLParser } from "fast-xml-parser";

export const parsePayoutXml = async (file: File) => {
  let parsedData = {
    bankReferenceId: "",
    iban: "",
    accountHolderName: "",
    paymentDate: "",
    amount: 0,
    transferType: "NORMAL" as "NORMAL" | "IMMEDIATE",
  };

  try {
    const parser = new XMLParser();
    const jsonObj = parser.parse(await file.text());

    parsedData = {
      bankReferenceId: jsonObj?.PayoutData?.BankReferenceId || "",
      iban: jsonObj?.PayoutData?.IBAN || "",
      accountHolderName: jsonObj?.PayoutData?.AccountHolderName || "",
      paymentDate:
        format(
          parse(jsonObj?.PayoutData?.Date, "dd/MM/yyyy", new Date()),
          "yyyy-MM-dd",
        ) || "",
      amount: parseFloat(jsonObj?.PayoutData?.Amount?.replace(",", ".") || "0"),
      transferType:
        jsonObj?.PayoutData?.TransferType?.toUpperCase() === "IMMEDIATE"
          ? "IMMEDIATE"
          : "NORMAL",
    };

    return {
      success: true,
      data: parsedData,
      message: "Parsed successfully!",
      error: null,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      success: false,
      data: parsedData,
      message: err.message,
      error: err,
    };
  }
};
