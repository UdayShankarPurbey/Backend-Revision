import mongoose from "mongoose"
import {Comment} from "../models/comment.modles.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.models.js"
import { Video } from "../models/video.models.js"
import { TypeEnum } from "../utils/TypeEnum.js"

// const commentTypeEnum = ['comment', 'video', 'tweet'];


const getAllComments = asyncHandler(async (req, res) => {
    const { id , type } = req.params;
    
    if (!TypeEnum.includes(type)) {
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
                $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'result'
                }
            },
            {
                $unwind: {
                path: "$repliedComment",
                preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                from: 'users',
                localField: 'repliedComment.commentBy',
                foreignField: '_id',
                as: 'repliedComment.ownerDetails'
                }
            },
            {
                $unwind: {
                path: "$repliedComment.ownerDetails",
                preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                _id: "$_id",
                content: { $first: "$content" },
                owner: { $first: "$owner" },
                comment: { $first: "$comment" },
                [type]: { $first: `$${type}` }, // Dynamically project the field based on [type]
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                __v: { $first: "$__v" },
                ownerName: { $first: { $arrayElemAt: ["$result.fullName", 0] } },
                ownerAvatar: { $first: { $arrayElemAt: ["$result.avatar", 0] } },
                ownerUserName: { $first: { $arrayElemAt: ["$result.username", 0] } },
                repliedComments: { 
                    $push: { 
                    _id: "$repliedComment._id",
                    commentBy: "$repliedComment.commentBy",
                    commentText: "$repliedComment.content",
                    createdAt: "$repliedComment.createdAt",
                    updatedAt: "$repliedComment.updatedAt",
                    ownerDetails: {
                        _id: "$repliedComment.ownerDetails._id",
                        fullName: "$repliedComment.ownerDetails.fullName",
                        avatar: "$repliedComment.ownerDetails.avatar",
                        // username: "$repliedComment.ownerDetails.username"
                        username: {
                            $cond: {
                                if: { $eq: ["$repliedComment.ownerDetails", []] }, // Check if ownerDetails array is empty
                                then: "$ownerUserName", // If empty, keep the username as is
                                else: { $concat: ["@", "$repliedComment.ownerDetails.username"] } // If not empty, add "@" before username
                            }
                        }

                    }
                    }
                }
                }
            },
            {
                $project: {
                _id: 1,
                content: 1,
                video: 1,
                owner: 1,
                comment: 1,
                repliedComment: {
                    $cond: { if: { $eq: ["$repliedComments", [{}]] }, then: [], else: "$repliedComments" }
                },
                createdAt: 1,
                updatedAt: 1,
                ownerName: 1,
                ownerAvatar: 1,
                ownerUserName: 1,
                __v: 1,
                [type]: 1 // Dynamically project the field based on [type]

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
        new ApiResponse(200 ,comment , `${type.charAt(0).toUpperCase() + type.slice(1)} comments Fetched`)
    )
})

const addComment = asyncHandler(async (req, res) => {

    const { content } = req.body;
    const { id , type } = req.params;
    
    if (!TypeEnum.includes(type)) {
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

    const { commentId } = req.params
    await Comment.findByIdAndDelete(commentId)

    return res.status(200)
    .json(new ApiResponse( 200 , {} , "Comment deleted Successfully" ))
})

const addRepliedComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    comment.repliedComment.push({
        content : content,
        commentBy : req.user?._id,
    });

    await comment.save();

    return res.status(200)
    .json(new ApiResponse( 200 , comment , "Replied comment Successfully" ))    
})

const editRepliedComment = asyncHandler(async (req, res) => {
    const { commentId, repliedCommentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(repliedCommentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const repliedComment = comment.repliedComment.id(commentId);
    if (!repliedComment) {
        throw new ApiError(404, "Replied comment not found");
    }

    repliedComment.content = content;

    await comment.save();

    return res.status(200)
        .json(new ApiResponse(200, repliedComment, "Replied comment edited successfully"));
});

const deleteRepliedComment = asyncHandler(async (req, res) => {
    const { commentId, repliedCommentId } = req.params;

    const comment = await Comment.findById(repliedCommentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const repliedComment = comment.repliedComment.id(commentId);
    if (!repliedComment) {
        throw new ApiError(404, "Replied comment not found");
    }

    comment.repliedComment.pull(commentId);

    await comment.save();

    return res.status(200)
        .json(new ApiResponse(200, repliedCommentId, "Replied comment deleted successfully"));
});

export {
    getAllComments, 
    addComment, 
    updateComment,
    deleteComment,
    addRepliedComment,
    editRepliedComment,
    deleteRepliedComment,
    }