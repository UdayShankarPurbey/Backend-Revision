import mongoose ,{Schema} from "mongoose";

const likeSchema = new Schema(
    {
       
        comment : {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        },
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        LikedBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        tweet : {
            type : Schema.Types.ObjectId,
            ref : "Tweet"
        },
        repliedComment : {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        }
    },
    {
        timestamps: true,
    }
)


export const Like = mongoose.model("Like", likeSchema)
