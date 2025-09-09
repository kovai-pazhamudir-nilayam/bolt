export const getOutletName = ({ outlet_id, allOutletsData }) => {
  const found = allOutletsData.find(
    (element) => element.outlet_id === outlet_id
  );
  return found ? found.short_name + " (" + outlet_id + ")" : outlet_id;
};
