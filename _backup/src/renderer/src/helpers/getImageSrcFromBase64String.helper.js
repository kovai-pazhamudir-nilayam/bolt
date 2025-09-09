export const getImageSrcFromBase64String = (base64String) => {
  const url = `data:image/png;base64,${base64String}`;
  return url;
};
