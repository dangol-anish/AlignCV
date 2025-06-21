import dotenv from "dotenv";
dotenv.config();

import { app } from "./loaders/app";
import { verifySupabaseJWT } from "./utils/verifySupabaseJWT";

const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

// Example protected route
app.get("/api/protected", verifySupabaseJWT, (req, res) => {
  res.json({ message: "You are authenticated!", user: (req as any).user });
});
