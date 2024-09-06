import mongoose from "mongoose";

// mongoose.schema takes object as parameter


// 1 way=>
const userSchema = new mongoose.Schema(
    {
        username: String,
        email: String,
        isActive: Boolean,
    }
);

// 2nd way of defining schema
// iska phla param/obj define krta h ki kya kya data lena h & dusra object timestamp define krta h
const userSchema2 = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "password is required"]
        }
    }, { timestamps: true }
)

// mongoose.model takes two parameter 1=> kya model bnau 2=> kiske basis pe bnau
export const User = mongoose.model("User", userSchema2);

// Ye User database me "users" se show hoga, ye mongodb  ka schema h. Plural kr deta h