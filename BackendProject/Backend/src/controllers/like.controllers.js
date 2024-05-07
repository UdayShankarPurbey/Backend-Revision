import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const toggleLike = await Like.find(
        {
            $and : [{LikedBy : req.user?._id},{video : videoId}]
        }
    )
    let message;
    let like;
    if(toggleLike.length > 0) {
        like = await Like.findByIdAndDelete(toggleLike[0]._id) 
        message = "Liked Video deleted successfully"
    } else{
        like = await Like.create(
            {
                LikedBy : req.user?._id,
                video : videoId,
            }
        )
        message = " Liked Video created successfully"
    }     

    return res.status(200).json(
        new ApiResponse ( 200 , like , message)
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
   
    const toggleComment = await Like.find(
        {
            $and : [{LikedBy : req.user?._id},{comment : commentId}]
        }
    )
    let message;
    let comment;
    if(toggleComment.length > 0) {
        comment = await Like.findByIdAndDelete(toggleComment[0]._id) 
        message = "Liked Comment deleted successfully"
    } else{
        comment = await Like.create(
            {
                LikedBy : req.user?._id ,
                comment : commentId,
            }
        )
        message = " Liked Comment created successfully"
    }     

    return res.status(200).json(
        new ApiResponse ( 200 , comment , message)
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const toggleTweet = await Like.find(
        {
            $and : [{LikedBy : req.user?._id},{tweet : tweetId}]
        }
    )
    let message;
    let tweet;
    if(toggleTweet.length > 0) {
        await Like.findByIdAndDelete(toggleTweet[0]._id) 
        tweet = {}
        message = "Liked Comment deleted successfully"
    } else{
        tweet = await Like.create(
            {
                LikedBy : req.user?._id ,
                tweet : tweetId,
            }
        )
        message = " Liked Comment created successfully"
    }     

    return res.status(200).json(
        new ApiResponse ( 200 , tweet , message)
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {

    const like = await Like.find({LikedBy : req.user?._id, video: { $ne: null }})
    // const like = await Like.find({LikedBy : req.user?._id, video: { $exists: true } })

    return res.status(200).json(
        new ApiResponse(200 , like , "Get All Liked Video Succesdfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}