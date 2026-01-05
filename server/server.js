const express = require('express');
const cors = require('cors');
const DB_CONSTS = require('./utils/env');

const { dbService } = require('./services/database.service');
const { postService } = require('./services/post.service');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const app = express();
const PORT = 5020;
const SIZE_LIMIT = '10mb';

const { FileService } = require('./services/file.service');
const fs = new FileService();

app.use(cors());

// Affichage de nouvelles requêtes dans la console à des fins de débogage
app.use((request, response, next) => {
    // eslint-disable-next-line no-console
    console.log(`New HTTP request: ${request.method} ${request.url}`);
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: SIZE_LIMIT }));

app.use('/posts', postRouter.router);
app.use('/users', userRouter.router);


const server = app.listen(PORT, () => {
    dbService.connectToServer(DB_CONSTS.DB_URL).then(() => {
        // TODO : peupler la base de données avec les données des fichiers JSON
        fs.readFile("./data/posts.json")
            .then((value) => {
                const result = JSON.parse(value);
                dbService.populateDb(DB_CONSTS.DB_COLLECTION_POSTS, result.posts);
            });

        // eslint-disable-next-line no-console
        console.log(`Listening on port ${PORT}.`);
    });
});

server.on('close', () => {
    dbService.client.close();
});

module.exports = server;