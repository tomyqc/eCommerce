import config from './config';

const getProductImagePath = (image?: string) => {
  if (!image) return "/product_placeholder.jpg";
  try {
    const parsedImage = new URL(image);
    if (parsedImage.pathname.startsWith("/media/")) {
      return `/${decodeURIComponent(parsedImage.pathname.slice("/media/".length))}`;
    }
  } catch {
    // Keep relative image values unchanged.
  }
  return image.startsWith("http") || image.startsWith("/")
    ? image
    : `/${image}`;
};

export const getProductImageUrl = (image?: string, inStock?: number, isNew?: boolean, isPromo?: boolean) => {
  const imagePath = getProductImagePath(image);
  if (imagePath.startsWith("http")) return imagePath;

  const extensionIndex = imagePath.lastIndexOf(".");
  const suffix = Number(inStock) === 0 ? "-outofstock" : isPromo ? "-promo" : isNew ? "-new" : "";
  if (!suffix) return imagePath;
  if (extensionIndex === -1) return `${imagePath}${suffix}`;

  return `${imagePath.slice(0, extensionIndex)}${suffix}${imagePath.slice(extensionIndex)}`;
};
