const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");
const { asyncHandler, AppError } = require("../utills/errorHandler");

// Helper function to exclude password from user object
function excludePassword(user) {
  if (!user) return user;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

const allowedPermissions = ["dashboard", "orders", "products", "categories", "bulk-upload", "payment-settings", "agents"];
const isValidPassword = (password) => typeof password === "string" && password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
function cleanPermissions(permissions) {
  if (!Array.isArray(permissions)) return null;
  return [...new Set(permissions.filter((permission) => allowedPermissions.includes(permission)))];
}

const getAllUsers = asyncHandler(async (request, response) => {
  const users = await prisma.user.findMany({});
  // Exclude password from all users
  const usersWithoutPasswords = users.map(user => excludePassword(user));
  return response.json(usersWithoutPasswords);
});

const createUser = asyncHandler(async (request, response) => {
  const { email, phone, password, role, name, permissions } = request.body;

  // Basic validation
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }

  // Password validation
  if (!isValidPassword(password)) {
    throw new AppError("Password must be at least 10 characters and include an uppercase letter, lowercase letter, and number", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = await prisma.user.create({
    data: {
      email,
      phone: phone || null,
      name: name || null,
      password: hashedPassword,
      role: role || "user",
      permissions: cleanPermissions(permissions),
    },
  });
  // Exclude password from response
  return response.status(201).json(excludePassword(user));
});

const updateUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { email, password, role, name, permissions } = request.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  // Prepare update data
  const updateData = {};
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email format", 400);
    }
    updateData.email = email;
  }
  if (password) {
    if (!isValidPassword(password)) {
      throw new AppError("Password must be at least 10 characters and include an uppercase letter, lowercase letter, and number", 400);
    }
    updateData.password = await bcrypt.hash(password, 14);
  }
  if (role) {
    updateData.role = role;
  }
  if (name !== undefined) updateData.name = name || null;
  if (permissions !== undefined) updateData.permissions = cleanPermissions(permissions);

  const updatedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: updateData,
  });

  // Exclude password from response
  return response.status(200).json(excludePassword(updatedUser));
});

const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return response.status(204).send();
});

const getUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

const getUserByEmail = asyncHandler(async (request, response) => {
  const { email } = request.params;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  // Exclude password from response
  return response.status(200).json(excludePassword(user));
});

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserByEmail,
};
