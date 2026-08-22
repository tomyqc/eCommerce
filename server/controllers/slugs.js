const prisma = require("../utills/db"); // ✅ Use shared connection

async function getProductBySlug(request, response) {
  const { slug } = request.params;
  const product = await prisma.product.findMany({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      mainImage: true,
      price: true,
      rating: true,
      description: true,
      manufacturer: true,
      size: true,
      color: true,
      variantPrices: true,
      inStock: true,
      quantity: true,
      isNew: true,
      isSold: true,
      couponCode: true,
      couponPercent: true,
      categoryId: true,
      merchantId: true,
      category: true,
    },
  });

  const foundProduct = product[0]; // Assuming there's only one product with that slug
  if (!foundProduct) {
    return response.status(404).json({ error: "Product not found" });
  }
  return response.status(200).json(foundProduct);
}

module.exports = { getProductBySlug };
