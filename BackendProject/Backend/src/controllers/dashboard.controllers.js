import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // const SubscriberCount = await Subscription.aggregate(
    //     [
    //         {
    //           $match: {
    //             channel : new mongoose.Types.ObjectId(req.user._id)
    //           }
    //         },
    //         {
    //             $count: "SubscriberCount"
    //         },
    //       ]
    // )

    // const video = await Video.aggregate(
    //     [
    //         {
    //           $match: {
    //             owner : new mongoose.Types.ObjectId(req.user._id),
    //           }
    //         },
    //         {
    //             $lookup : {
    //                 from : "likes",
    //                 localField : "_id",
    //                 foreignField : "video",
    //                 as : "result"
    //             }
    //         },
    //         {
    //             $addFields : {
    //                 likedCount: { $size: "$result" }
    //             }
    //         },
    //         {
    //             $project : {
    //                 _id : 1,
    //                 title : 1,
    //                 description : 1,
    //                 videoFile : 1,
    //                 thumbnail : 1,
    //                 duration : 1,
    //                 likedCount : 1,
    //             }
    //         }
    //       ]
    // )    
    const [subscriberCount, videoWithLikes] = await Promise.all([
        Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $count: "SubscriberCount"
            }
        ]),
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.user._id),
                }
            },
            {
                $lookup: {
                    from: "likes",
                    let: { videoId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$video", "$$videoId"] }
                            }
                        }
                    ],
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likedCount: { $size: "$likes" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    duration: 1,
                    likedCount: 1,
                }
            }
        ])
    ]);

    const stats = {
        SubscriberCount: subscriberCount.length > 0 ? subscriberCount[0].SubscriberCount : 0,
        TotalNumberOfVideos: videoWithLikes.length,
        videos: videoWithLikes
    };
    return res.status(200).json(
        new ApiResponse(200, stats, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.aggregate(
        [
            {
                $match: {
                    owner : new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $project : {
                    _id : 1,
                    title : 1,
                    description : 1,
                    videoFile : 1,
                    thumbnail : 1,
                }
            }
        ]
    )

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }