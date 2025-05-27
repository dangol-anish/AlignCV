import dotenv from "dotenv";
dotenv.config();

import { app } from "./loaders/app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
