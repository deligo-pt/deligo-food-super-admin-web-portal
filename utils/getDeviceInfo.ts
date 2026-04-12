import { DEVICE_KEY } from "@/consts/device.const";
import Cookies from "js-cookie";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";

export const getDeviceInfo = async () => {
  const parser = new UAParser();
  const result = parser.getResult();

  let deviceId = Cookies.get(DEVICE_KEY);

  if (!deviceId) {
    deviceId = uuidv4();
    Cookies.set(DEVICE_KEY, deviceId, {
      expires: 365,
    });
  }

  return {
    deviceId,
    deviceType: "browser",
    deviceName: `${result.browser.name} ${result.browser.version}`,
    userAgent: navigator.userAgent,
  };
};
