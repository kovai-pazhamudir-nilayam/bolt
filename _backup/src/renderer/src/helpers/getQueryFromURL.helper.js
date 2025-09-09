export const getValuesFromQueryString = (searchParams) => {
  const queryString = searchParams.toString();
  const values = Object.fromEntries(new URLSearchParams(queryString));
  return values;
};
