import express from "express";
import { addComment, deleteComment, getComments } from "../controllers/comment.js";
import { verifyToken } from "../verifyToken.js";
const router = express.Router()

router.post("/comments/:id/addComment",verifyToken, addComment);
router.delete("/:id", deleteComment)
router.get("/comments/:id/getComment", getComments)

export default router;