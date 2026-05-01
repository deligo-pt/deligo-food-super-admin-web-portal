export const getActualFileName = (url: string) => {
  try {
    const decoded = decodeURIComponent(url);
    const lastSegment = decoded.split("/").pop() || "";
    const match = lastSegment.match(/file-(.+)$/);
    return match ? match[1] : lastSegment;
  } catch {
    return "";
  }
};
