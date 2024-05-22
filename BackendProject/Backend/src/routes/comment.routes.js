import { Router } from 'express';
import {
    addComment,
    addRepliedComment,
    deleteComment,
    deleteRepliedComment,
    editRepliedComment,
    getAllComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/:type/:id").get(getAllComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/comment/reply/:commentId").post(addRepliedComment);
router.route("/comment/reply/:commentId/:repliedCommentId").patch(editRepliedComment);
router.route("/comment/reply/:commentId/:repliedCommentId").delete(deleteRepliedComment);


export default router