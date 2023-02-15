# Fortune
A small, goofy site for uploading whatever text you want along with a maximum of one image. You may also read random posts that other people have created.

# How
You need to create a .env file with the entries **HOSTNAME**, **PORT**, **MONGODBURI**, **DB** and **COLLECTION** (yes this needs MongoDB, but you can modify it to save things to a json if that's what floats your boat, just modify the methods in db.js). Images are stored locally, because my trial of Amazon S3 expired and I am not paying for that, lol.

DB should be the name of your MongoDB database, and COLLECTION should be the name of the collection within that database. The HOSTNAME should be whatever IP/DNS you're using or 127.0.0.1 if using locally.
