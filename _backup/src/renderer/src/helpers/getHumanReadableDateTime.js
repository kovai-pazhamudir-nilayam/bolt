import moment from "moment";

export const getHumanReadableDateTime = ({
  isoString = false,
  separate,
  withSecs = false,
}) => {
  if (!isoString) return "";

  const formattedDateTime = moment(new Date(isoString)).format(
    "DD-MM-YYYY, hh:mm A"
  );
  const formattedDateTimeWithSec = moment(new Date(isoString)).format(
    "DD-MM-YYYY, hh:mm:ss A"
  );

  const formattedDateTimeToUse = withSecs
    ? formattedDateTimeWithSec
    : formattedDateTime;

  if (separate) {
    const [date, time] = formattedDateTimeToUse.split(",");
    return { date, time };
  }
  return formattedDateTimeToUse;
};

export const getHumanReadableDate = ({ isoString }) => {
  if (!isoString) return "";
  const formattedDate = moment(new Date(isoString)).format("DD-MM-YYYY");
  return formattedDate;
};

export const getLocaleTimeStringFromISOString = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString();
};

export const getLocaleTimeStringInHourMinuteFromISOString = (isoString) => {
  if (!isoString) return "";
  return moment(new Date(isoString)).format("HH:mm");
};
