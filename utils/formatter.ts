export function queryStringFormatter(searchParamsObj: {
  [key: string]: string | string[] | undefined;
}): string {
  let queryString = "";

  const queryArray = Object.entries(searchParamsObj).map(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
    } else if (value !== undefined) {
      return `${key}=${encodeURIComponent(value)}`;
    }

    return "";
  });

  queryString = queryArray.filter((q) => q !== "").join("&");

  return queryString;
}

export function removeUnderscore(text: string): string {
  return (
    text
      ?.split("_")
      ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1)?.toLowerCase())
      ?.join(" ") ?? ""
  );
}
