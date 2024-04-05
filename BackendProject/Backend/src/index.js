import express from 'express';
import { connectDatabase } from './db/db.js';

import dotenv from 'dotenv';

dotenv.config({
    path : './env'
});

const app = express();

connectDatabase()
.then(
    () => {
        app.listen(process.env.PORT || 3000 , () => {
            console.log(`Twityou server listening on port ${process.env.PORT || 3000}`);
        });
    }
)
.catch(err => console.error("Mongo db Connection Failed",err));

/*
import mongoose from 'mongoose';
import express from 'express';

const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        app.on('error',(error)  => {
            console.log("ERROR: " + error);
            throw error
        })         

        app.listen(process.env.PORT, () => {
            console.log(`Twityou listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR: " + error);   
    }
})()
*/
