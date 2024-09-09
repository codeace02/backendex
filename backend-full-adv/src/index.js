// require('dotenv').config({ path: './env' }); // older approach

import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 8080;

connectDB()
    .then(() => {

        app.on("error", (error) => {
            console.log('<====================App connection error ==========================>', error);
            throw error;
        })

        app.listen(port, () => {
            console.log(`<======================App running on port=======================>`, port);
        })
    })
    .catch((err) => {
        console.log("<====================Mongo db connection failed=========================>", err);
    })



































/* older approach=====================================>

// iifee
// yha starting me semicolon isliye lga h "FOR CLEANING PURPOSE ONLY" bcz aksr log previous line pe semicolon lgana bhul jate h, to iske wjh se kai bar prblm hoti h, isiliye professional approach me log starting me hi semicolon lga dete h

; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on("error", (error) => {
            console.log('Error ', error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error", error);
        throw error;
    }
})()
*/