// src/server.js
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

// usa el mismo nombre en todos lados
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});
