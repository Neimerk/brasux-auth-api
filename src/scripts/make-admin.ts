import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    throw new Error("Informe o e-mail. Exemplo: npm run make:admin alberto@brasux.com");
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Usuário promovido para ADMIN:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });