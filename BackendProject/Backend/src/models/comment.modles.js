import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
          {
            content : {
                type : String,
                required : true
            },
            commentBy : {
                type : Schema.Types.ObjectId,
                ref : "User"
            },
            // userName : {
            //     type : String,
            //     required : true,
            //     // Custom setter function to add '@' at the beginning
            //     set: function(value) {
            //         // Check if value is provided and doesn't already start with '@'
            //         if (value && !value.startsWith('@')) {
            //             return '@' + value; // Add '@' at the beginning
            //         }
            //         return value;
            //     }
            // }
          }
        ]
    },
    {
        timestamps: true,
    }
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)
