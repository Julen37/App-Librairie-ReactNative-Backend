import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
};

//#region register
// Route pour l'inscription d'un user 
// methode POST 
// URL : /register
router.post("/register", async (req, res) => {
    // fonction sera appelée quand la route /register est appelée en methode POST
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Veuillez fournir tous les champs"});
        };

        if (password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères"});
        };

        if (username.length < 3) {
            return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères"});
        };

        // verification de l'existence d'un user avec meme mail et meme pseudo
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({ message: "Cet email existe déjà"});
        };

        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur existe déjà"});
        };

        // creation avatar aleatoire
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        // creation new user si tout ok
        const user = new User({
            email, 
            username, 
            password, 
            profileImage,
        })
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user : {
                id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            },
        })
    } catch (error) {
        console.log("Erreur dans la route register", error);
        res.status(500).json({ message: "Erreur serveur"});
    }
});
//#endregion

//#region login
// Route pour la connection d'un user 
// methode POST 
// URL : /login
router.post("/login", async (req, res) => {
    try {
        // exo 1
        // on a besoin de l'email et du password
        // on veut tous les champs sont remplis
        // on verifie que l'email existe dans la bdd et donc si l'email existe alors le user aussi
        // et si le password est bon avec le user associé alors on peut se connecter
        // renvoyer le token et les user info comme dans register

        const { email, password } = req.body;

        if ( !email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs"});
        };

        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({ message: "Utilisateur inexistant"});
        };

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Mot de passe invalide"});
        };

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user : {
                id: user._id,
                email: user.email,
                username: user.username,
                password: user.password,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            },
        });
        
    } catch (error) {
        console.log("Erreur dans la route login", error);
        res.status(500).json({ message: "Erreur serveur"});
    }
});
//#endregion

export default router;