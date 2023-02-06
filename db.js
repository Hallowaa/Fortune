const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const client = new MongoClient(process.env.MONGODBURI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    console.error(err);
});

const dbo = client.db(process.env.DB);
const collection = dbo.collection(process.env.COLLECTION);

function save(message, imageName) {
    const post = { message: message, image: imageName || null};
    collection.insertOne(post, function(err, res) {
        if (err) throw err;
    });
}

async function getRandomPost() {
    const result = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    return result[0];
}

module.exports = { save, getRandomPost }