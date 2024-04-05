import express from 'express';

import mongoose from 'mongoose';
import { connectDatabase } from './db/db.js';

import dotenv from 'dotenv';

dotenv.config({
    path : './env'
});

const app = express();

connectDatabase()


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
