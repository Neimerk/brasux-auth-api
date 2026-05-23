import "dotenv/config";
import { app } from "./app";

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`🚀 BrasUX Auth API running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();