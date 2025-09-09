export const getQuantityFromObject = (quantity = {}) => {
  const { quantity_uom, quantity_number } = quantity;
  return `${quantity_number} ${quantity_uom}`;
};
