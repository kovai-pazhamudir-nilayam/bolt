import _ from "lodash";

export const getAmountInRupee = (amount) => {
  if (_.isEmpty(amount)) {
    return 0;
  }

  return amount?.cent_amount / amount?.fraction;
};
