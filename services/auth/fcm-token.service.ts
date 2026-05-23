export const updateFcmTockenReq = async (
  data: {
    token: string;
    deviceId: string;
  },
  accessToken: string
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update-fcm-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    const contentType = res.headers.get("content-type");

    let responseData;


    if (contentType?.includes("application/json")) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    if (!res.ok) {
      throw new Error(responseData?.message || "Request failed");
    }

    return responseData;
  } catch (error) {
    console.error("FCM update API error:", error);
    return {
      success: false,
      message: (error as Error)?.message,
    };
  }
};