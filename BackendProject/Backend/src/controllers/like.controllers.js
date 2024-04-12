import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//tryit : do something like like and dislike and implement toggle in it.

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const like = await Like.create(
        {
            LikedBy : req.user?._id,
            video : videoId,
        }
    )

    return res.status(200).json(
        new ApiResponse ( 200 , like , " Liked Video created successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const like = await Like.create(
        {
            LikedBy : req.user?._id ,
            comment : commentId,
        }
    )

    return res.status(200).json(
        new ApiResponse ( 200 , like , " Comment Liked successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const like = await Like.create(
        {
            LikedBy : req.user?._id ,
            tweet : tweetId,
        }
    )

    return res.status(200).json(
        new ApiResponse ( 200 , like , " Tweet Liked successfully")
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const like = await Like.find({owner : req.user?._id})

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