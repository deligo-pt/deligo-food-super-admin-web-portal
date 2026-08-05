const OTP_EXPIRY_KEY = "deligo-food-otp-expiry-admin";

const isBrowser = typeof window !== "undefined";

export const setLocalOtpExpiry = (minutes = 5) => {
    if (!isBrowser) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    localStorage.setItem(OTP_EXPIRY_KEY, now.toISOString());
};

export const removeLocalOtpExpiry = () => {
    if (isBrowser) {
        localStorage.removeItem(OTP_EXPIRY_KEY);
    }
};

export const getExpiryTime = (): number => {
    if (!isBrowser) return 0;

    const expiry = localStorage.getItem(OTP_EXPIRY_KEY);
    const now = new Date();

    if (!expiry) {
        return 0;
    }

    const expiryTime = new Date(expiry).getTime() - now.getTime();

    if (expiryTime <= 0) {
        removeLocalOtpExpiry();
        return 0;
    }

    return Math.floor(expiryTime / 1000);
};
