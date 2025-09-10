const nameHOC = (Component, suffix = '') => {
  return `${Component.originalName || Component.displayName || Component.name || 'Component'}${suffix}`;
};

export { nameHOC };
