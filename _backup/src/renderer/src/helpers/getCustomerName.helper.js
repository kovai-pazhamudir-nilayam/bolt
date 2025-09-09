export const getCustomerName = (customer_name = {}) => {
  const { first_name = "", last_name = "" } = customer_name;
  return first_name + " " + last_name;
};
