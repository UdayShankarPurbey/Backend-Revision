import { Router } from 'express';
import {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedData,
    toggleRepliedCommentLike,
    getRepliedLikeData,
    likeCountData,
    repliedLikeCountData,
} from "../controllers/like.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/:type/:id").get(getLikedData);
router.route("/toggle/reply/:commentId/:repliedCommentId").get(getRepliedLikeData).post(toggleRepliedCommentLike);
router.route("/toggle/data/:type/:id").post(likeCountData);
router.route("/toggle/data/:id").post(repliedLikeCountData);



export default router