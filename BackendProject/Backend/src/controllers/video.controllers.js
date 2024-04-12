import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {removeFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title && !description) {
        throw new ApiError(400, "Please provide a title and a description of Video")
    }

    let videoLocalPath = req.files?.videoFile[0]?.path;
    let thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(! videoLocalPath && ! thumbnailLocalPath) {
        throw new ApiError(405, "Please upload a video and a thumbnail")
    }

    const video = await uploadOnCloudinary(videoLocalPath , "video");
    if(!video) {
        throw new ApiError( 505 , "Unable to upload video");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath , "image");
    if(!thumbnail) {
        throw new ApiError( 505 , "Unable to upload thumbnail");
    }

    const publishVideo = await Video.create(
        {
            title,
            description,
            videoFile: video?.url,
            thumbnail: thumbnail?.url,
            duration : video?.duration,
            isPublished : true,
            owner : req.user?._id
        }
    )
    if(!publishVideo) {
        throw new ApiError( 505 , "Unable to publish video");
    }

    return res.status(201).json(
        new ApiResponse(200 , publishVideo , "Video Published Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    return res.status(200).json(
        new ApiResponse(200 , video , "Video retrieved successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body;

    if(!(title || description)) {
        throw new ApiError(400, "Please provide a title or a description of Video")
    }
    const video = await Video.findById(videoId)
    if(! video) {
        throw new ApiError(404, "Video not found")
    }

    let thumbnailLocalPath = req?.file?.path
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath , "image")
    let removedThumbnail;
    if(thumbnail) {
        removedThumbnail = await removeFromCloudinary(video?.thumbnail, "image")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
           $set :  {
                title,
                description,
                thumbnail: thumbnail?.url
           }
        },
        {
            new: true,
        }
    )

    if(! updatedVideo) {
        throw new ApiError( 505 , "Unable to update Video Data");
    }

    return res.status(200).json(
        new ApiResponse(200 , {thumbnailRemoved : removedThumbnail , updatedVideo} , "Video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if(! video) {
        throw new ApiError(404, "Video not found")
    }

    console.log("video Url : ",video.videoFile ,video.thumbnail);
    const thumbnail = await removeFromCloudinary(video?.thumbnail, "image")
    const videoFile = await removeFromCloudinary(video?.videoFile , "video")

    
    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200 ,{ removedVideo : videoFile ,removedThumbnail : thumbnail, data : {}}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const videoToGetPublish = await Video.findById(videoId)
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !videoToGetPublish.isPublished,
            },
        },
        {
            new: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(200 ,video, "Video updated successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}