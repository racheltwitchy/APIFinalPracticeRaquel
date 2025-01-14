import "reflect-metadata";
import express from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import { config } from "./config/environment";
import { DatabaseService } from "./database/database.service";
import { Container } from "typedi";
import { Api } from "./server/api/api";

const app = express();

const dbService = Container.get(DatabaseService);
dbService
  .initializeDatabase()
  .then(() => {
    console.log("Database initialized successfully.");
  })
  .catch((err) => {
    console.error("Error initializing the database:", err);
  });

// Middlewares
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

// Registrar las rutas principales
const api = Container.get(Api);
app.use("/api", api.getRouter());

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
