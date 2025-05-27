import express from "express";
import routes from "../api/routes";
import { errorHandler } from "../api/middlewares/errorHandler";

const app = express();

app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export { app };
