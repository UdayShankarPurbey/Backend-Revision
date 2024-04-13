import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const isValidChannel = await User.findById(channelId)

    if(! isValidChannel) {
        throw new ApiError(404, "Channel not found")
    }

    const isSubscribed = await Subscription.findOne({
        $and : [ {subscriber : req.user?._id}, {channel : channelId}]
    })

    
    let subscription ;
    let message ;
    if(isSubscribed) {
        subscription = await Subscription.findByIdAndDelete(isSubscribed?._id)
        message = "Unsubscribed Successfully"
    } else {
        subscription = await Subscription.create(
            {
                channel : channelId,
                subscriber : req.user?._id,
            }
        )
        message = "Subscribed Successfully"
    }

    return res.status(200).json(
        new ApiResponse(200, subscription, message)
    )
})

// controller to return channel list to which user has subscribed
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    const subscriptions = await Subscription.aggregate(
        [
            {
              $match: {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "result"
              }
            },
            {
                $group: {
                    "_id": "$_id",
                    "channelName": { $first: { $arrayElemAt: ["$result.fullName", 0] } },
                    "channelUsername": { $first: { $arrayElemAt: ["$result.username", 0] } }
                }
            },
          ]
    )

    return res.status(200).json(
        new ApiResponse(200, subscriptions , "Channel Subscribed By User Fetched")
    )
})

// controller to return subscriber list of a channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscriptions = await Subscription.aggregate(
        [
            {
              $match: {
                channel : new mongoose.Types.ObjectId(channelId)
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "result"
              }
            },
            {
                $group: {
                    "_id": "$_id",
                    "SubscriberName": { $first: { $arrayElemAt: ["$result.fullName", 0] } },
                }
            },
          ]
    )

    return res.status(200).json(
        new ApiResponse(200, subscriptions , "Channel Subscribed By User Fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}