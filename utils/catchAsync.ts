import { TResponse } from "@/types";

export const catchAsync = async <T>(
  fn: () => Promise<TResponse<T>>,
  customSuccessMsg?: string,
  customErrMsg?: string,
) => {
  try {
    const result = await fn();

    const response = {
      statusCode: result.statusCode,
      success: true,
      data: null,
      message: result.message || customSuccessMsg,
      meta: undefined,
      error: undefined,
    };

    if (result.success) {
      return {
        ...response,
        data: result.data,
        meta: result.meta,
      };
    }

    console.log(result);
    return {
      ...response,
      success: false,
      message: result.message,
      error: result.error,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);

    return {
      statusCode: error?.response?.status,
      success: false,
      data: error?.response?.data || null,
      message: error?.response?.data?.message || customErrMsg,
      error,
      meta: undefined,
    };
  }
};
