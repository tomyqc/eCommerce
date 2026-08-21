// helper function for converting URL category name to friendly and more readable name
// For example "smart-watches" after this function will be "smart watches"
const formatCategoryName = (categoryName: string) => {
  return categoryName.split("-").join(" ");
};

// helper function for converting category name to URL category name
// For example "smart watches" after this function will be "smart-watches"
const convertCategoryNameToURLFriendly = (categoryName: string) => {
  return categoryName.trim().split(/\s+/u).join("-");
};

export { formatCategoryName, convertCategoryNameToURLFriendly };
