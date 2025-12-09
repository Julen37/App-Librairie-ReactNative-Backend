// importation de la bibliotheque Mongoose pour interagir avec MongoDB
import mongoose from "mongoose";

// exportation de la fonction de connexion à la base de données
export const connectDB = async () => {
    // gere les erreur de connections
    try {
        // connexion a la bdd mongodb 
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connecting to database", error); 
        process.exit(1); // exit with failure
    }
}