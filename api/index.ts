import "dotenv/config";
import { registerRoutes } from "./routes";
import express from "express";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
await registerRoutes(app);

// Export the Express API handler for Vercel
export default app;