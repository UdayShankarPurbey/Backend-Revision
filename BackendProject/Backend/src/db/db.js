import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(` \n Mongoose Connect !! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongoose Connection Error : ",error.message);
        process.exit(1);
    }
}