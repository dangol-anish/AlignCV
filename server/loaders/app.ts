import express from "express";
import routes from "../api/routes";
import { errorHandler } from "../api/middlewares/errorHandler";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export { app };

app._router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(
      `${Object.keys(r.route.methods).join(",").toUpperCase()} ${r.route.path}`
    );
  }
});
