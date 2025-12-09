import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//#region un livre POST
router.post("/", protectRoute, async (req, res) => {
    try {
        const {title, caption, rating, image} = req.body;

        if (!title || !caption || !rating || !image) {
            return res.status(400).json({message: "Veuillez fournir tous"});
        }

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });
        await newBook.save();

        res.status(201).json(newBook)

    } catch (error) {
        console.log("Erreur dans la création du livre", error);
        res.status(500).json({ message: error.message});
    }
});
//#endregion

//#region tous les livres GET
// route pour recuperer tous les livres
router.get("/", protectRoute, async (req, res) => {
    //exemple d'appel pour le frontend react native
    //  const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");

    try {
        // recuperation des parametres de pagination
        const page = req.query.page || 1; //numero de page par default: 1
        const limit = req.query.limit || 5; //nombre de livres par page par default: 5
        const skip = (page - 1) * limit; //calcul du nombre de livres a sauter

        // recherche des livres dans la bdd
        const books = await Book.find()
            .sort({ createdAt: -1 }) //tri des livres par date de creation décroissante
            .skip(skip) //saut des livres precedents
            .limit(limit) //limite du nombre de livres a recup
            .populate("user", "username profileImage"); //recup des info de l'utilisateur

        // comptage du nombre total de livres
        const totalBooks = await Book.countDocuments();

        //envoi de la reponse avec les livres et les infos de pagination
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Erreur dans la route pour tous les livres", error);
        res.status(500).json({ message: "Erreur serveur interne "});
    }
})
//#endregion

//#region reco de livres sur profil GET
// route pour recup les livres d'un user specifique
router.get("/user", protectRoute, async (req, res) => {
    try {
        // recherche de livres du user connecté et tri des livres par date de creation decroissante
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.erreur("Erreur lors de la récupération des livres de l'utilisateur", error.message);
        res.status(500).json({message: "Erreur serveur"})
    }
})
//#endregion

//#region DELETE
router.delete(":id", protectRoute, async (req, res) => {
    try {
        // recuperation du livre a supprimer
        const book = await Book.findById(req.params.id) //params sert a prendre le parametre dans l'url de la route, ici on prend l'id donc :id aka la white card 

        if (!book) {
            res.status(404).json({ message: "Le livre n'a pas été trouvé"});
        };

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Vous  n'etes pas autorisé à faire cette action"});
        };

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Erreur de suppression d'image depuis cloudinary", deleteError);
            };
        };

        await book.deleteOne();

        res.json({ message: "Le livre a été supprimé avec succès"});
    } catch (error) {
        console.log("Erreur de suppression du livre", error);
        res.status(500).json({ message: "Erreur serveur interne"});
    }
})
//#endregion

export default router;