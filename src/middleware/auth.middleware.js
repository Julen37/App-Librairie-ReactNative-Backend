import jwt from "jsonwebtoken";
import User from "../models/User.js";

// exemple
// const reponse = async fetch(`http://localhost:3000/api/books`, {
//     method: 'POST',
//     body: JSON.stringify({
//         title,
//         caption
//     }),
//     headers: { Authorization: `Bearer ${token}`},
// });

const protectRoute = async (req, res, next) => {
    try {
        // Récupération du token d'authentification dans l'en-tête Authorization 
        // Suppression du préfixe "Bearer" pour obtenir le token brut
        const token = req.header("Authorization").replace("Bearer","");

        // Vérification de l'existence du token
        // Si le token est absent, renvoi d'une erreur 401 avec un message d'erreur
        if (!token) {
            return res.status(401).json({ message: "Pas de token d'authentification, accès refusé"});
        };

        // Vérification de la validité du token
        // Utilisation de la clé secrète pour décoder le token et obtenir les informations utilisateur
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupération de l'utilisateur associé au token
        // Utilisation de l'ID utilisateur pour récupérer les informations utilisateur
        const user = await User.findById(decoded.userId).select("-password");

        // Vérification de l'existence de l'utilisateur
        // Si l'utilisateur est inexistant, renvoi d'une erreur 401 avec un message d'erreur
        if (!user) {
            return res.status(401).json({ message: "Le token n'est pas valide"});
        };

        // Ajout de l'utilisateur à la requête
        // Passage de l'utilisateur à la fonction suivante pour une utilisation ultérieure
        req.user = user;

        // Passage à la fonction suivante
        // Autorisation de la requête à continuer
        next();

    } catch (error) {
        console.error("Authentification error:", error.message);
        res.status(401).json({ message: "Le token n'est pas valide"});
    }
};

export default protectRoute;