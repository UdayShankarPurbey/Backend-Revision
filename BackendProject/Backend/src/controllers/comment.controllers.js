import mongoose from "mongoose"
import {Comment} from "../models/comment.modles.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.models.js"
import { Video } from "../models/video.models.js"

const commentTypeEnum = ['comment', 'video', 'tweet'];


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { id , type } = req.params;
    
    if (!commentTypeEnum.includes(type)) {
        throw new ApiError(400 , 'Invalid type. Type is of tweet, video,comment');
    }
    // const {page , limit } = req.query
    // const comment = await Comment.find({video : videoId}).skip((page - 1) * limit).limit(limit)

    const page = parseInt(req.query.page) || 1; // Convert page to number
    const limit = parseInt(req.query.limit) || 10; // Convert limit to number
    const comment = await Comment.aggregate(
        [
            {
                $match: {
                  [type]: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "ownerName"
                }
            },
            {
                $unwind: "$ownerName" 
              },
              {
                $project: {
                  _id: 0, // Exclude the _id field if desired
                  ownerName: "$ownerName.fullName",
                  ownerAvatar: "$ownerName.avatar"
                }
              },
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ]
    )
    
    return res.status(200).json(
        new ApiResponse(200 ,comment , "Video comments Fetched")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content } = req.body;
    const { id , type } = req.params;
    
    if (!commentTypeEnum.includes(type)) {
        throw new ApiError(400 , 'Invalid type. Type is of tweet, video,comment');
    }

    if(! content) {
        throw new ApiError(400, "Please enter a comment")
    }

    const referencedObject = await mongoose.model(type.charAt(0).toUpperCase() + type.slice(1)).findById(id);

    if (!referencedObject) {
        throw new ApiError(404, `${type.charAt(0).toUpperCase() + type.slice(1)} does not exist`);
    }

    const comments = await Comment.create({
       content,
       owner : req.user?._id,
       [type]: id // Dynamically add the type field
    })

    if( ! comments) {
        throw new ApiError(500, "Something went wrong When Createing Comment")
    }
    
    return res.status(201)
    .json(new ApiResponse( 201 , comments , "Comment created Successfully" ))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body;
    if(! content) {
        throw new ApiError(400, "Please enter a comment")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new: true
        }
    )

    if(! comment) {
        throw new ApiError(500, "Unable to Update Comment")
    }

    return res.status(200)
    .json(new ApiResponse( 200 , comment , "Comment updated Successfully" ))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params
    await Comment.findByIdAndDelete(commentId)

    return res.status(200)
    .json(new ApiResponse( 200 , {} , "Comment deleted Successfully" ))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }