import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// définition du schema de données pour les users
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
        minlength: 6,
    },
    profileImage : {
        type: String,
        default: '',
    },
}, {timestamps: true}); // date de création de l'user

// hash du password avant sauvegarde en bdd
userSchema.pre('save', async function() {
    if(!this.isModified("password")) return ; // Vérifier si le mdp a été modifié

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// comparaison du mot de passe pour se log
userSchema.methods.comparePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

// creation du modele de données "User"
const User = mongoose.model("User", userSchema);

export default User;