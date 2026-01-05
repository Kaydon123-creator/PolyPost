const DB_CONSTS = require("../utils/env");
const { dbService } = require('./database.service');

class UserService {

    constructor() {
        this.dbService = dbService;
    }

    /**
    * Récupère la collection des utilisateurs
    */
    get userCollection() {
        return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_USERS);
    }

    /**
     * TODO : Créer un nouvel utilisateur si le pseudonyme n'est pas déjà utilisé
     * @param {string} username 
     * @returns {Promise<{username:string}|undefined>} - L'utilisateur créé ou undefined si déjà existant
     */
    async createUser(username) {
        const exists = await this.userExists(username);
        if (!exists) {
            this.userCollection.insertOne({username: username});
            return { username };
        }
        else {
            return undefined;
        }
    }

    /**
     * Vérifie si un utilisateur existe pour se connecter
     * @param {string} username 
     * @returns {Promise<Object|null>} - L'utilisateur ou null s'il n'existe pas
     */
    async userExists(username) {
        return await this.userCollection.findOne({ username }, { projection: { _id: 0 } });
    }

    /**
     * Réinitialise la base de données des utilisateurs
     */
    async resetDatabase() {
        await this.userCollection.deleteMany({});
    }

}

const userService = new UserService();
module.exports = { userService };