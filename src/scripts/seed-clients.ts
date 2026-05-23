import "dotenv/config";
import { prisma } from "../lib/prisma";
import { v4 as uuid } from "uuid";

const clients = [
  {
    name: "gizapp-image-api",
    description: "API de banco de imagens da BrasUX",
    scopes: ["images:read", "images:upload", "images:delete"],
  },
  {
    name: "notaon-ead",
    description: "Plataforma EAD Curso NotaOn",
    scopes: ["courses:read", "lessons:complete", "students:manage"],
  },
  {
    name: "explicadon-app",
    description: "Aplicativo educacional ExplicadOn",
    scopes: ["questions:create", "questions:answer", "calls:create"],
  },
  {
    name: "simulamedi-app",
    description: "Simulador educacional SimulaMedi",
    scopes: ["simulations:create", "simulations:read", "results:read"],
  },
  {
    name: "brasux-payments",
    description: "Gateway interno de pagamentos da BrasUX",
    scopes: ["payments:create", "payments:read", "payments:refund"],
  },
];

async function main() {
  for (const client of clients) {
    const secret = uuid();

    const createdClient = await prisma.clientApp.upsert({
      where: {
        name: client.name,
      },
      update: {
        description: client.description,
      },
      create: {
        name: client.name,
        description: client.description,
        secret,
      },
    });

    for (const scope of client.scopes) {
      await prisma.clientScope.upsert({
        where: {
          clientId_scope: {
            clientId: createdClient.id,
            scope,
          },
        },
        update: {},
        create: {
          clientId: createdClient.id,
          scope,
          description: `Permissão ${scope} para ${client.name}`,
        },
      });
    }

    console.log(`Client configurado: ${client.name}`);
  }

  console.log("Seed de clients finalizado com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });