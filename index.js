const https = require('https');
const express = require('express');
const fs = require('mz/fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { handleNewpost, handleGetRandom, handleGetPost, handleGetImage, handleGetTotal } = require('./request-handle');
require('dotenv').config();

/*
async function getCerts() {
    const certdir = (await fs.readdir("/etc/letsencrypt/live"))[0];

    return {
        key: await fs.readFile(`/etc/letsencrypt/live/fortune.cyuucat.moe/privkey.pem`),
        cert: await fs.readFile(`/etc/letsencrypt/live/fortune.cyuucat.moe/fullchain.pem`)
    }
}

const {key, cert} = getCerts();

*/

const app = express();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './images');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'front')));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.post('/newpost', upload.single('image'), (req, res) => {
    handleNewpost(req, res);
});

app.get('/random', async (req, res) => {
    handleGetRandom(req, res);
});

app.get('/post', async (req, res) => {
    handleGetPost(req, res);
});

app.get('/images/*', (req, res) => {
    handleGetImage(req, res);
});

app.get('/total', async (req, res) => {
    handleGetTotal(req, res);
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//const httpsServer = https.createServer({key, cert}, app).listen(process.env.PORT);