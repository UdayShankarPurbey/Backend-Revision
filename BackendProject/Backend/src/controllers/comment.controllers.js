import mongoose from "mongoose"
import {Comment} from "../models/comment.modles.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page , limit } = req.query
    const comment = await Comment.find({video : videoId}).skip((page - 1) * limit).limit(limit)

    return res.status(200).json(
        new ApiResponse(200 ,comment , "Video comments Fetched")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;

    if(! content) {
        throw new ApiError(400, "Please enter a comment")
    }

    const comments = await Comment.create({
       content,
       video : videoId,
       owner : req.user?._id
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