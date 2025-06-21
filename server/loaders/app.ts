import express from "express";
import routes from "../api/routes";
import { errorHandler } from "../api/middlewares/errorHandler";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://aligncv.vercel.app", // Your production domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow dynamically generated Vercel preview URLs
      if (origin.endsWith("-aligncv.vercel.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
