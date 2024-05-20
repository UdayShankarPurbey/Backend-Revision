import { Router } from 'express';
import {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedData,
    toggleRepliedCommentLike,
    getRepliedLikeData,
} from "../controllers/like.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/cc/:repliedId").post(toggleRepliedCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/:type/:id").get(getLikedData);
router.route("/:id").get(getRepliedLikeData);


export default router