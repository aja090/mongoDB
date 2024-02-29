const { MongoClient } = require("mongodb");

let dbConnection;

//todo this how connect with mongoDB Atls
//? let uri = "mongodb+srv://Aseel090:Aseelal090@cluster0.38nb7ns.mongodb.net/?retryWrites=true&w=majority";

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect('mongodb://0.0.0.0:27017/Bookstore')
            .then((client) => {
                dbConnection = client.db();
                console.log("Connected to MongoDB");
                return cb();
            })
            .catch((err) => {
                console.error("Error connecting to MongoDB:", err);
                return cb(err);
            });
    },
    getDb: () => dbConnection
};

