import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

// timestamps gives two fields => createdAt & updatedAt

export const Category = mongoose.model('Category', categorySchema)