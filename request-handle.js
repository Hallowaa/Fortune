const { save, getRandomPosts, getCollectionSize, getPost } = require('./db');
const path = require('path');
const fs = require('fs');

function handleNewpost(req, res) {
    const message = req.body.message;
    const file = req.file;
    let response = "";
    let valid = true;

    if(message == null || message.length == 0) {
        if (response != "") response += '\n';
        response += 'There is no message XD';
        valid = false;
    }

    if(message != null && message.length > 4000) {
        if (response != "") response += '\n';
        response += 'Message is over 4000 characters long';
        valid = false;
    }

    if(file != null && file.size > 5242880) {
        if (response != "") response += '\n';
        response += 'Image is over 5MiB in size';
        valid = false;
    }

    if (valid == true) {
        if(file == null) save(message, null);
        else save(message, file.filename);
        
        res.send({
            message: 'Uploaded!',
            valid: true
        })
    } else {
        res.send({ 
            message: response,
            valid: false
        });
    }
}

async function handleGetRandom(req, res) {
    if(await getCollectionSize() == 0) {
        return res.send({
            success: false,
            message: 'There are no posts!'
        });
    }

    const post = await getRandomPosts(1, req.query.id);

    if(post == null) {
        return res.status(404).end('Not found');
    }

    res.send({
        success: true,
        post: post
    });
}

async function handleGetPost(req, res) {
    let collectionSize = await getCollectionSize();

    if(collectionSize == 0) {
        return res.send({
            success: false,
            message: 'There are no posts!'
        });
    }
    
    if (collectionSize < req.query.postNumber) {
        return res.send({
            success: false,
            message: 'Post number is too high'
        });
    }

    if (req.query.postNumber <= 0) {
        return res.send({
            success: false,
            message: 'Post number should be over 0'
        })
    }

    const post = await getPost(Number.parseInt(req.query.postNumber));

    if(post == null) {
        return res.send({
            success: false,
            message: 'Post not found'
        });
    }

    return res.send({
        success: true,
        post: post
    });
}

async function handleGetTotal(req, res) {
    const total = await getCollectionSize();
    
    res.send({
        total: total
    });
}

let mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
};

function handleGetImage(req, res) {
    const file = path.join(__dirname, req.path)

    if(file.indexOf(path.join(__dirname, 'images') + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }

    const type = mime[path.extname(file).slice(1)] || 'text/plain';
    
    const s = fs.createReadStream(file)
    s.on('open', () => {
        res.set('Content-type', type);
        s.pipe(res);
    });
    s.on('error', () => {
        res.set('Content-type', 'text/plain');
        res.status(404).end('Not found');
    });
}

module.exports = { handleNewpost, handleGetRandom, handleGetPost, handleGetImage, handleGetTotal }