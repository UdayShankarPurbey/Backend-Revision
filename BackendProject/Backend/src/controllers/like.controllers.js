import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { TypeEnum } from "../utils/TypeEnum.js"


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

const getLikedData= asyncHandler(async (req, res) => {
    const { type ,id } = req.params;
    if (!TypeEnum.includes(type)) {
        throw new ApiError(400 , 'Invalid type. Type is of tweet, video, comment');
    }

    const like = await Like.aggregate(
        [
            {
                $match: {
                 $and : [{LikedBy : req.user?._id},{[type]: new mongoose.Types.ObjectId(id)}]
                }
            }
        ]
    )

    return res.status(200).json(
        new ApiResponse(200, like, `Get All Liked ${type.charAt(0).toUpperCase() + type.slice(1)}s Successfully`)
    );

})

const toggleRepliedCommentLike = asyncHandler(async (req, res) => {
    const { commentId,repliedCommentId } = req.params;

    const existingLike = await Like.findOne({
        LikedBy: req.user?._id,
        comment : repliedCommentId,
        repliedComment : commentId,
    });

    let message;
    let likeAction;

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Liked replied comment deleted successfully";
    } else {
        likeAction = await Like.create({
            LikedBy: req.user?._id,
            comment : repliedCommentId,
            repliedComment : commentId,
        });
        message = "Liked replied comment created successfully";
    }

    return res.status(200).json(new ApiResponse(200, likeAction, message));
});

const getRepliedLikeData = asyncHandler(async (req, res) => {
    const { commentId,repliedCommentId } = req.params;

    const like = await Like.aggregate([
        {
          $match: {
            $and : [
              {
                repliedComment : new mongoose.Types.ObjectId(repliedCommentId)
              },
              {
                comment : new mongoose.Types.ObjectId(commentId)
              },
              {
                LikedBy : req.user?._id
              }
            ]
          }
        }
      ]);

    return res.status(200).json(new ApiResponse(200, like, "Replied Like Fetch Successfully"));
});

const likeCountData = asyncHandler(async (req, res) => {
    const { id , type } = req.params;
    
    if (!TypeEnum.includes(type)) {
        throw new ApiError(400 , 'Invalid type. Type is of tweet, video,comment');
    }
    const matchCondition = {
        [type]: new mongoose.Types.ObjectId(id)
    };

    if(type === 'comment') {
        matchCondition.repliedComment = { $exists: false };
    }

    const LikeData = await Like.aggregate([
        {
            $match: matchCondition
        },
        {
            $count: 'liked'
        }
    ])
    return res.status(200).json(new ApiResponse(200, LikeData,`${type.charAt(0).toUpperCase() + type.slice(1)} Like Data Count Fetch Successfully` ));
})

const repliedLikeCountData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const LikeData = await Like.aggregate([
        {
          $match: {
            repliedComment : new mongoose.Types.ObjectId(id)
          }
        },
        {
          $count: 'liked'
        }
    ])

    return res.status(200).json(new ApiResponse(200, LikeData,`Replied Like Data Count Fetch Successfully` ));
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    toggleRepliedCommentLike,
    getRepliedLikeData,
    getLikedData,
    likeCountData,
    repliedLikeCountData
}