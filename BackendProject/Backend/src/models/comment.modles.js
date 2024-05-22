import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const repliedSchema = new Schema(
    {
        content : {
            type : String,
            required : true
        },
        commentBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
    },
    {
        timestamps: true,
    }
)

const commentSchema = new Schema(
    {
        content : {
            type : String,
            required : true
        },
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        comment : {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        },
        tweet : {
            type : Schema.Types.ObjectId,
            ref : "Tweet"
        },
        repliedComment : [
          repliedSchema
        ]
    },
    {
        timestamps: true,
    }
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)
