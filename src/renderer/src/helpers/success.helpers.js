import { notification } from "antd";

export const renderSuccessNotification = ({ message }) => {
  notification.success({
    message: message,
    placement: "topRight",
  });
};
