const prisma = require("../utills/db");
const bcrypt = require("bcryptjs");

const isValidPassword = (password) => typeof password === "string" && password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

async function getAllMerchants(request, response) {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        products: true,
      },
    });
    return response.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return response.status(500).json({ error: "Error fetching merchants" });
  }
}

async function getMerchantById(request, response) {
  try {
    const { id } = request.params;
    const merchant = await prisma.merchant.findUnique({
      where: {
        id: id,
      },
      include: {
        products: true,
      },
    });

    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }

    return response.json(merchant);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return response.status(500).json({ error: "Error fetching merchant" });
  }
}

async function createMerchant(request, response) {
  try {
    const { name, email, phone, password, address, description, status, grade, permissions } = request.body;
    if (!name?.trim() || !phone?.trim() || !isValidPassword(password)) {
      return response.status(400).json({ error: "Name, phone, and a password with 10+ characters, uppercase, lowercase, and number are required" });
    }
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ phone: phone.trim() }, email ? { email } : { id: "__none__" }] } });
    if (existingUser) {
      const conflict = existingUser.email === email ? "email" : "phone number";
      return response.status(409).json({ error: `That ${conflict} is already assigned to ${existingUser.name || "another agent"}. Use a different ${conflict}.` });
    }
    const merchant = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({ data: { name: name.trim(), email: email || null, phone: phone.trim(), password: await bcrypt.hash(password, 14), role: grade || "seller", permissions: Array.isArray(permissions) ? permissions : [] } });
      return transaction.merchant.create({
        data: {
          name: name.trim(),
          email: email || null,
          phone: phone.trim(),
          address: address || null,
          description: description || null,
          status: status || "ACTIVE",
          grade: grade || "seller",
          permissions: Array.isArray(permissions) ? permissions : [],
          userId: user.id,
        },
      });
    });

    return response.status(201).json(merchant);
  } catch (error) {
    console.error("Error creating merchant:", error);
    return response.status(500).json({ error: "Error creating merchant" });
  }
}

async function updateMerchant(request, response) {
  try {
    const { id } = request.params;
    const { name, email, phone, address, description, status, grade, permissions } = request.body;

    const merchant = await prisma.merchant.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
        phone,
        address,
        description,
        status,
        grade,
        permissions: Array.isArray(permissions) ? permissions : [],
      },
    });
    if (merchant.userId) await prisma.user.update({ where: { id: merchant.userId }, data: { name, phone, role: grade, permissions: Array.isArray(permissions) ? permissions : [] } });

    return response.json(merchant);
  } catch (error) {
    console.error("Error updating merchant:", error);
    return response.status(500).json({ error: "Error updating merchant" });
  }
}

async function deleteMerchant(request, response) {
  try {
    const { id } = request.params;
    
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!merchant) return response.status(404).json({ error: "Merchant not found" });
    await prisma.$transaction(async (transaction) => {
      await transaction.merchant.delete({ where: { id } });
      if (merchant.userId) await transaction.user.delete({ where: { id: merchant.userId } });
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return response.status(500).json({ error: "Error deleting merchant" });
  }
}

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};