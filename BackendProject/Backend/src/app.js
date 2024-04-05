import expres from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = expres();

app.use(cors({
    origin: process.env.CORS_0RIGIN,
    credentials: true,
}))

app.use(expres.json({limit : '50kb'}))
app.use(expres.urlencoded({extended : true , limit : '50kb'}))
app.use(expres.static("public"))
app.use(cookieParser())

//routes 

import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter);

export {app}