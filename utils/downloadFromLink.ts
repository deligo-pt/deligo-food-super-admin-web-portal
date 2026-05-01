import { getActualFileName } from "@/utils/formatters/getActualFileName";
import { format } from "date-fns";

export const downloadFromCloudinaryLink = (fileLink: string) => {
  if (typeof window === "undefined") return;

  const link = document.createElement("a");
  link.href = fileLink.replace("/upload/", "/upload/fl_attachment/");

  link.setAttribute("target", "_blank");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadFileFromAnyLink = async (fileLink: string) => {
  try {
    const response = await fetch(fileLink);
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.setAttribute(
      "download",
      getActualFileName(fileLink) ||
        `payment_proof_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}`,
    );

    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(fileLink, "_blank");
  }
};
