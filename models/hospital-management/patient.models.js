import mongoose, { model, Schema } from "mongoose";

const patientSchema = new Schema({
    
}, { timestamps: true });

export const Patient = model("Patient", patientSchema);