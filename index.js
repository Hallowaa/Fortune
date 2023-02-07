const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { save, getRandomPost } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

let mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
};

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

app.post('/', upload.single('image'), (req, res) => {
    if (req.file === undefined) save(req.body.message, null);
    else save(req.body.message, req.file.filename);
    res.send('Got it');
})

app.get('/random', async (req, res) => {
    const post = await getRandomPost();

    if(post == null || post == undefined) {
        return res.status(404).end('Not found');
    }

    res.send(post);
});

app.get('/images/*', (req, res) => {
    const file = path.join(__dirname, req.path)

    if(file.indexOf(path.join(__dirname, 'images') + path.sep) !== 0) {
        return res.status(403).end('Forbidden')
    }
    const type = mime[path.extname(file).slice(1)] || 'text/plain'
    
    const s = fs.createReadStream(file)
    s.on('open', () => {
        res.set('Content-type', type);
        s.pipe(res);
    });
    s.on('error', () => {
        res.set('Content-type', 'text/plain');
        res.status(404).end('Not found');
    })
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});