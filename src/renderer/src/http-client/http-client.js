import axiosInstance, { X_CHANNEL_ID } from "./axios";

const ERROR_CONSTANTS = {
  GENERIC_ERROR: "Something went wrong, Please try again!",
};

const getErrorMessageListFromApiResponse = (error) => {
  return (
    error?.response?.data?.errors || [
      { message: ERROR_CONSTANTS.GENERIC_ERROR },
    ]
  );
};

const axiosCall = async ({
  url,
  method,
  body = undefined,
  headers = {},
  params = {},
  responseType = undefined,
}) => {
  let http = axiosInstance;

  try {
    const { data, status } = await http.request({
      url,
      method,
      data: body,
      params: {
        channel: X_CHANNEL_ID,
        ...params,
      },
      headers,
      responseType,
    });
    return { data, status, errors: [] };
  } catch (error) {
    const errorList = getErrorMessageListFromApiResponse(error);
    return { data: null, status: error?.response?.status, errors: errorList };
  }
};

const httpClient = {
  get: (args) => axiosCall({ ...args, method: "GET" }),
  post: (args) => axiosCall({ ...args, method: "POST" }),
  put: (args) => axiosCall({ ...args, method: "PUT" }),
  delete: (args) => axiosCall({ ...args, method: "DELETE" }),
  patch: (args) => axiosCall({ ...args, method: "PATCH" }),
};

export default httpClient;
