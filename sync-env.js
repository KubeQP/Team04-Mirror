// Use this command to update both frontend and backend: node sync-env.js

const fs = require("fs");
const path = require("path");

// Find the shared config file relative to this script
const configPath = path.join(__dirname, "env.config.js");
const { API_BASE_URL } = require(configPath);

// Generate backend .env
const backendEnv = `API_BASE_URL=${API_BASE_URL}\n`;
fs.writeFileSync(path.join(__dirname, "backend", ".env"), backendEnv);
console.log("Wrote backend/.env");

// Generate frontend .env
const frontendEnv = `VITE_API_BASE_URL=${API_BASE_URL}\n`;
fs.writeFileSync(path.join(__dirname, "frontend", ".env"), frontendEnv);
console.log("Wrote frontend/.env");

console.log("Sync complete!");
