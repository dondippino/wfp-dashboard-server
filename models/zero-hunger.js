var MongoClient = require('mongodb').MongoClient
var db = require('./db-connection');

(async () => {
    if (db === undefined) {
        let client = await MongoClient.connect('mongodb://localhost:27017/wfp-dashboard', { useUnifiedTopology: true });
        console.log('Database client connected')
        db = client.db('wfp-dashboard');
    }
})();

zeroHungerData = async () => {
    let data = await db.collection('hunger_data').find().toArray();
    return data;
}

module.exports = { zeroHungerData };