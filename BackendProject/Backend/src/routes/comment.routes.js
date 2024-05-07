import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/:videoId").get(getVideoComments);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/:id/:type").post(addComment);


export default router