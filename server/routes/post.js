/* eslint-disable no-console */
const { HTTP_STATUS } = require("../utils/http");
const router = require("express").Router();
const { postService } = require("../services/post.service");

// Fonction fournie pour la réinitialisation de la base de données
router.delete("/reset", async (request, response) => {
    try {
        await postService.resetDatabase();
        response.sendStatus(HTTP_STATUS.SUCCESS);
    } catch (error) {
        console.log(error);
        response.sendStatus(HTTP_STATUS.SERVER_ERROR);
    }
});

/**
 * Récupère toutes les publications, sans les commentaires (juste le commentCount)
 */
router.get("/", async (request, response) => {
    try {
        const posts = await postService.getAllPosts();
        response.status(HTTP_STATUS.SUCCESS).json(posts);
    } catch (error) {
        response.status(HTTP_STATUS.SERVER_ERROR).json(error);
    }
});

/**
 * Récupère une publication par id, avec ses commentaires correspondants
 */
router.get("/:id", async (request, response) => {
    try {
        const post = await postService.getPost(request.params.id);
        if (post) {
            response.status(HTTP_STATUS.SUCCESS).json(post);
        }
        else {
            response.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post not found" });
        }
    } catch (error) {
        response.status(HTTP_STATUS.SERVER_ERROR).json(error);
    }
});

/**
 * Ajoute une nouvelle publication
 */
router.post("/", async (request, response) => {
    try {
        const newPost = await postService.createPost(request.body);
        if (!newPost) return response.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid or duplicate post data" });

        response.status(HTTP_STATUS.CREATED).json(newPost);
    } catch (error) {
        console.log(error);
        response.status(HTTP_STATUS.SERVER_ERROR).json({ message: error.message });
    }
});

/**
 * Ajouter un commentaire
 */
router.post("/:id/comments", async (request, response) => {
    try {
        const postId = request.params.id;
        const commentData = request.body;

        const newComment = await postService.addComment(postId, commentData);

        if (!newComment) {
            return response.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post not found" });
        }
        response.status(HTTP_STATUS.CREATED).json(newComment);
    } catch (error) {
        const status = error.message === "Missing required fields" ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.SERVER_ERROR;
        response.status(status).json({ message: error.message });
  }
});

/**
 * Gère une réaction sur une publication
 */
router.patch("/:id/reactions", async (request, result) => {
    const { value } = request.body;

    try {
        const updated = await postService.toggleReactionOnPost(request.params.id, parseInt(value));
        if (!updated) return result.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post not found" });

        result.status(HTTP_STATUS.SUCCESS).json(updated);

    } catch (error) {
        console.error(error);
        result.status(HTTP_STATUS.SERVER_ERROR).json({ message: error.message });
    }
});


/**
 * Gère une réaction sur un commentaire d'une publication
 */
router.patch("/:postId/comments/:commentId/reactions", async (request, result) => {
    const { value } = request.body;
    const { postId, commentId } = request.params;

    try {
        const updated = await postService.toggleReactionOnComment(postId, commentId, parseInt(value));
        if (!updated) return result.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post or comment not found" });

        result.status(HTTP_STATUS.SUCCESS).json(updated);

    } catch (error) {
        console.error(error);
        result.status(HTTP_STATUS.SERVER_ERROR).json({ message: error.message });
    }
});

/**
 * Supprime une publication par ID
 */
router.delete("/:id", async (request, response) => {
    try {
        const { author } = request.body;
        const result = await postService.deletePost(request.params.id, author);
        if (result.deletedCount === 1) {
            response.status(HTTP_STATUS.SUCCESS).json({ message: "Post cancelled successfully" });
        } else {
            response.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post not found" });
        }
    } catch (error) {
        const status = error.message.includes("Unauthorized") ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.SERVER_ERROR;
        response.status(status).json({ message: error.message });
    }
});

/**
 * Supprime un commentaire d'une publication
 */
router.delete("/:postId/comments/:commentId", async (request, response) => {
    try {
        const { postId, commentId } = request.params;
        const { author } = request.body;

        const deleted = await postService.deleteComment(postId, commentId, author);

        if (deleted) {
            response.status(HTTP_STATUS.SUCCESS).json({ message: "Comment deleted successfully" });
        } else {
            response.status(HTTP_STATUS.NOT_FOUND).json({ message: "Post or comment not found" });
        }

    } catch (error) {
        const status = error.message.includes("Unauthorized") ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.SERVER_ERROR;
        response.status(status).json({ message: error.message });
    }
});

module.exports = { router };