import dotenv from "dotenv";
dotenv.config();

import { app } from "./loaders/app";
import { verifySupabaseJWT } from "./utils/verifySupabaseJWT";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Example protected route
app.get("/api/protected", verifySupabaseJWT, (req, res) => {
  res.json({ message: "You are authenticated!", user: (req as any).user });
});
