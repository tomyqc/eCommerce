const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { asyncHandler, AppError } = require("../utills/errorHandler");

const createCategory = asyncHandler(async (request, response) => {
  const { name } = request.body;

  if (!name || name.trim().length === 0) {
    throw new AppError("Category name is required", 400);
  }

  const normalizedName = name.trim();
  const existingCategory = await prisma.category.findUnique({
    where: { name: normalizedName },
  });

  if (existingCategory) {
    throw new AppError("A category with this name already exists", 400);
  }

  const category = await prisma.category.create({
    data: {
      name: normalizedName,
    },
  });
  return response.status(201).json(category);
});

const updateCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name } = request.body;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  if (!name || name.trim().length === 0) {
    throw new AppError("Category name is required", 400);
  }

  const normalizedName = name.trim();

  const existingCategory = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      name: normalizedName,
      id: { not: id },
    },
  });

  if (duplicateCategory) {
    throw new AppError("A category with this name already exists", 400);
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: existingCategory.id,
    },
    data: {
      name: normalizedName,
    },
  });

  return response.status(200).json(updatedCategory);
});

const deleteCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const existingCategory = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  const productsWithCategory = await prisma.product.findMany({
    where: {
      categoryId: id,
    },
    select: {
      id: true,
    },
  });

  if (productsWithCategory.length > 0) {
    const productIds = productsWithCategory.map((product) => product.id);
    const orderedProducts = await prisma.customer_order_product.findFirst({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    if (orderedProducts) {
      throw new AppError(
        "Cannot delete category because one or more products are included in an order",
        400
      );
    }
  }

  await prisma.$transaction(async (transaction) => {
    if (productsWithCategory.length > 0) {
      const productIds = productsWithCategory.map((product) => product.id);
      await transaction.image.deleteMany({
        where: {
          productID: {
            in: productIds,
          },
        },
      });
      await transaction.product.deleteMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });
    }

    await transaction.category.delete({
      where: {
        id: id,
      },
    });
  });
  return response.status(204).send();
});

const getCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });
  
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  
  return response.status(200).json(category);
});

const getAllCategories = asyncHandler(async (request, response) => {
  const categories = await prisma.category.findMany({});
  return response.json(categories);
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
