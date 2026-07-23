export function queryStringFormatter(searchParamsObj: {
  [key: string]: string | string[] | undefined;
}): string {
  const queryArray = Object.entries(searchParamsObj)
    .filter(([key]) => key !== "lang")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      } else if (value !== undefined && value !== "") {
        return `${key}=${encodeURIComponent(value)}`;
      }

      return "";
    });

  return queryArray.filter((q) => q !== "").join("&");
}

export function removeUnderscore(text: string): string {
  return (
    text
      ?.split("_")
      ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1)?.toLowerCase())
      ?.join(" ") ?? ""
  );
}
