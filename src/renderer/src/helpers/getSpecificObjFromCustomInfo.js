import _ from "lodash";

const getSpecificObjFromCustomInfo = ({ custom_info, key }) => {
  if (_.isEmpty(custom_info)) {
    return null;
  }
  const data = custom_info.filter(({ name }) => name === key);
  return _.isEmpty(data) ? null : data[0].values;
};

export { getSpecificObjFromCustomInfo };
