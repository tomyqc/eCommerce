const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const prisma = new PrismaClient();
const email = process.argv[2] || "tomynilso@gmail.com";

const passwordPrompt = () => new Promise((resolve) => {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  terminal.question("Enter the new admin password (input hidden by your terminal): ", (password) => {
    terminal.close();
    resolve(password);
  });
});

async function resetAdminCredentials() {
  const password = await passwordPrompt();
  if (!password || password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must be at least 10 characters and include uppercase, lowercase, and a number");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user found for ${email}`);
  await prisma.user.update({ where: { id: user.id }, data: { role: "admin", password: await bcrypt.hash(password, 14) } });
  console.log(`Admin credentials updated for ${email}`);
}

resetAdminCredentials().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
