const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const client = new MongoClient(process.env.MONGODBURI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    console.error(err);
});

const dbo = client.db(process.env.DB);
const collection = dbo.collection(process.env.COLLECTION);

async function save(message, imageName) {
    const postNumber = await getCollectionSize() + 1;
    const post = { message: message, image: imageName || null, postNumber: postNumber};
    collection.insertOne(post, function(err, res) {
        if (err) throw err;
    });
}

async function getRandomPosts(count, discard) {
    let result;
    if(discard != null && await getCollectionSize() > 1) {
        const excluded = new ObjectId(discard);
        result = await collection.aggregate([
            { $match : { _id: { $ne: excluded }} }, 
            { $sample: { size: count } }]).toArray();
    } else {
        result = await collection.aggregate([
            { $sample: { size: count } }]).toArray();
    }
    return result[0];
}

async function getCollectionSize() {
    return await collection.countDocuments();
}

async function getPost(number) {
    return await collection.findOne({ 'postNumber': number });
}

module.exports = { save, getRandomPosts, getCollectionSize, getPost }