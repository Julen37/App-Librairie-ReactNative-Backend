// importation du framework Express
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";

// creation d'une instance de l'appli Express
const app = express();
const PORT = process.env.PORT || 3000;

// definition du middleware pour parser les requetes https en json
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// definition du port d'ecoute du serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`) // message de confirmation lorsque le serveur est en cours d'excecution
    connectDB();
});