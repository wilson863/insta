import app from "./app";
import { logger } from "./lib/logger";

// Use Railway PORT or fallback to 8080
const port = Number(process.env.PORT) || 8080;

// Start server
app.listen(port, "0.0.0.0", (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
