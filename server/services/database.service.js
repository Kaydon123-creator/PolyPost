const { MongoClient, ServerApiVersion } = require('mongodb');
const DB_CONSTS = require('../utils/env');

class DatabaseService {
  /**
   * TODO : Remplir la collection avec les données seulement si elle est vide
   * @param {string} collectionName nom de la collection sur MongoDB
   * @param {Array} data tableau contenant les documents à mettre dans la collection
   */
  async populateDb(collectionName, data) {
    const collection = this.db.collection(collectionName);
    // TODO : Vérifier si la collection est vide et la remplir avec les données fournies
    const count = await collection.countDocuments();

    if (count === 0) {
      await collection.insertMany(data);
    }
  }

  /**
   * Établir la connection avec la base de données MongoDB
   * @param {string} uri URI de la base de données MongoDB 
   */
  async connectToServer(uri) {
    try {
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await this.client.connect();
      this.db = this.client.db(DB_CONSTS.DB_DB);
      // eslint-disable-next-line no-console
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

const dbService = new DatabaseService();

module.exports = { dbService };