const getDecimalPlaces = (number) => {
  // Convert the number to a string
  const numStr = number.toString();

  if (numStr === 0) {
    return 0;
  }

  // Check if there's a decimal point
  if (numStr.includes(".")) {
    // Return the number of digits after the decimal point
    return numStr.split(".")[1].length;
  }

  // No decimal point, return 0
  return 0;
};

export default getDecimalPlaces;
