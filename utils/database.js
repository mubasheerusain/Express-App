const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb://localhost:27017/node-complete')
        .then(client => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No Database Found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'Atmecs@123', {
//     dialect: 'mysql',
//     host: 'localhost'
// });

// module.exports = sequelize;