import { notification } from "antd";

/**
 * Render error notifications.
 *
 * @param {Array<{ message: string }>} [errors=[]] - An array of error objects.
 */

export const renderErrorNotifications = (errors = []) => {
  errors?.forEach((errorMessage) => {
    let description = "[CS]";

    if (errorMessage.rawErrors) {
      description = errorMessage.rawErrors
        .map((rawErr) => {
          const mess =
            rawErr.description ||
            rawErr.message ||
            rawErr.title ||
            "Unknown Error";
          return mess;
        })
        .join(" | ");
    }

    const errorTitle = errorMessage.title
      ? errorMessage.title
      : "Internal Server Error";

    notification.error({
      message: `${errorTitle} - ${description}`,
      placement: "topRight",
      duration: 5,
    });
  });
};
