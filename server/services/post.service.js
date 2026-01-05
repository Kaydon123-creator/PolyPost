const DB_CONSTS = require("../utils/env");
const { FileService } = require("./file.service");
const path = require("path");
const { dbService } = require('./database.service');
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} Post
 * @property {number} id - Identifiant unique de la publication.
 * @property {string} title - Titre de la publication.
 * @property {string} content - Contenu de la publication.
 * @property {string} author - Auteur de la publication (pseudonyme).
 * @property {string} category - Catégorie de la publication.
 * @property {number} reactions - Nombre total de réactions.
 * @property {Object[Comment]} comments - Liste des commentaires associés.
 * @property {string} date - Date de création de la publication.
 */

/**
 * @typedef {Object} Comment
 * @property {number} id - Identifiant unique du commentaire.
 * @property {string} author - Auteur du commentaire.
 * @property {string} content - Contenu du commentaire.
 * @property {number} reactions - Nombre total de réactions.
 * @property {string} date - Date de création de la publication.
 */

class PostService {

    constructor() {
        this.JSON_PATH_POSTS = path.join(__dirname, "../data/posts.json");
        this.FileService = new FileService();
        this.dbService = dbService;
    }

    /**
     * Récupère la collection des publications
     */
    get postCollection() {
        return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_POSTS);
    }

    /**
     * TODO : Récupérer les publications de la base de données dans un format réduit : id, titre, auteur, categorie, date, réactions et nombre de commentaires
     * @returns {Promise<{id:string, title:string, author:string, category:string, date:string, reactions:number, commentCount:number}[]>} - Toutes les publications, sans les commentaires
     */
    async getAllPosts() {
        const posts = await this.postCollection.find({}).toArray();

        const filteredPosts = posts.map(({id, title, author, category, date, reactions, comments}) => { return { id, title, author, category, date, reactions, commentCount: comments.length}; });
        return filteredPosts;
    }

    /**
     * TODO : Récupérer une publication par son identifiant
     */
    async getPost(id) {
        const post = await this.postCollection.findOne({id: id}, {projection: {_id: 0}});

        return post;
    }

    /**
     * Fonction fournie pour remplir la base de données à partir du fichier JSON avec des données de départ
     */
    async populateDb() {
        const posts = JSON.parse(
            await this.FileService.readFile(this.JSON_PATH_POSTS)
        ).posts;
        await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_POSTS, posts);
    }

    /**
     * TODO : Supprimer une publication par son identifiant
     * @param {string} id identifiant du post
     * @returns {Promise<import("mongodb").DeleteResult>} - Résultat de la suppression
     */
    async deletePost(id, author) {
        const post = await this.getPost(id);
        if (!post) return;
        if (post.author !== author) throw new Error("Unauthorized: only the author can delete this post");

        return this.postCollection.deleteOne(post);
    }

    /**
     * TODO : Supprimer un commentaire d'une publication
     * @param {string} postId - id du post
     * @param {string} commentId - id du commentaire
     * @param {string} author - Auteur tentant la suppression
     */
    async deleteComment(postId, commentId, author) {
        const post = await this.getPost(postId);
        if (!post) return;

        const comments = post.comments;
        const comment = comments.find((comment) => comment.id === commentId);

        if (!comment) return;
        if (comment.author !== author) throw new Error("Unauthorized: only the author can delete this comment");

        const newComments = comments.filter((comment) => comment.id !== commentId);

        await this.postCollection.updateOne({id: postId}, {$set: {comments: newComments}});

        return true;
    }


    /**
    * TODO : Ajouter une nouvelle publication. 
    * @param {{title:string, content:string, author:string, category:string}} postData - Les données de la publication
    */
    async createPost(postData) {
        const {
            title,
            content,
            author,
            category
        } = postData;

        // TODO : Valider les champs de la publication

        if ((!title || title === "") || (!category || category === "")) return;
        
        // TODO : Vérifier l'absence de discussion active avec le même titre et auteur
        const posts = await this.getAllPosts();
        if (posts.some((post) => post.title === title && post.author === author)) return;
        
        // TODO : Créer l'objet post avec les champs requis
        const newPost = {
            id: uuidv4(),
            date: new Date().toISOString(),
            title,
            content,
            author,
            category,
            reactions: 0,
            comments: []
        };

        await this.postCollection.insertOne(newPost);

        // TODO : Insérer le nouveau post dans la base de donnée
        return newPost;
    }

    /**
     * TODO : Ajouter un commentaire à une publication
     * @param {number} postId - identifiant de la publication
     * @param {{author:string, content:string}} commentData - Les données du commentaire
     */
    async addComment(postId, commentData) {
        const {
            author,
            content
        } = commentData;

        // TODO : Valider que les informations fournies sont valides
        if (!content || content === "") throw new Error("Missing required fields");

        const post = await this.getPost(postId);
        if (!post) return;

        // TODO : Valider les champs du commentaire
        const newComment = {
            id: uuidv4(),
            date: new Date().toISOString(),
            author,
            content,
            reactions: 0
        };

        // TODO : Insérer le nouveau commentaire dans la base de données
        const newComments = post.comments;
        newComments.push(newComment);
        await this.postCollection.updateOne({id: postId}, {$set: {comments: newComments}});
        return newComment;
    }

    /**
     * TODO : Ajouter ou retirer une réaction sur une publication
     * @param {string} postId identifiant de la publication
     * @param {number} value valeur à incrémenter ou décrémenter
     */
    async toggleReactionOnPost(postId, value) {
        const post = await this.getPost(postId);
        if (!post) return;

        const newValue = post.reactions + value;

        // TODO : Mettre à jour le nombre de réactions dans la base de données
        await this.postCollection.updateOne(post, {$set: {reactions: newValue}});

        post.reactions = newValue;
        return post;
    }

    /**
     * TODO : Ajoute ou retire une réaction sur un commentaire d'une publication
     * @param {string} postId identifiant de la publication
     * @param {string} commentId identifiant du commentaire
     * @param {number} value valeur à incrémenter ou décrémenter
     */
    async toggleReactionOnComment(postId, commentId, value) {
        const post = await this.getPost(postId);
        if (!post) return;

        if (!post.comments.some((comment) => comment.id === commentId)) return;

        post.comments.map((comment) => { if (comment.id === commentId) {comment.reactions += value} });

        // TODO : Mettre à jour le nombre de réactions dans la base de données

        await this.postCollection.updateOne({id: postId}, {$set: {comments: post.comments}});
        return { commentId, reactions: post.comments.find((comment) => comment && comment.id === commentId).reactions};
    }

    /**
     * Réinitialiser la base de données en supprimant toutes les collections et en les remplissant à nouveau
     * Fonction fournie à des fins de débogage durant le développement
     */
    async resetDatabase() {
        await this.postCollection.deleteMany({});
        await this.populateDb();
    }

}

const postService = new PostService();
module.exports = { postService };