export const getPascalCase = (string = "") => {
  return string
    ?.toLowerCase()
    .split("_")
    .map((input) => {
      return input.charAt(0).toUpperCase() + input.slice(1);
    })
    .join(" ");
};
