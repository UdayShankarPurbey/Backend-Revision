import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet).get(getAllTweet)
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router