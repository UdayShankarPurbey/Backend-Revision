import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body
    
    if(! content ) {
        throw new ApiError(400, "Tweet content is required")
    } 

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet Created Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params

    const tweets = await Tweet.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets Retrieved Successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body

    if(! content ) {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content }},
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet Updated Successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    
    const { tweetId } = req.params

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}