const hasUpdateAccess = ({ authContext, permissionToCompare }) => {
  const { permissions, userType } = authContext;
  if (userType === "SUPER_ADMIN" || userType === "ADMIN") {
    return true;
  }
  const hasUpdatePermission = permissions.includes(permissionToCompare);
  return hasUpdatePermission;
};

export default hasUpdateAccess;
