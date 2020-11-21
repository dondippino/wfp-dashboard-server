var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var zHungerData = require('../models/zero-hunger');
var cors = require('cors')
var corsOptions = {
  origin: ['https://zero-hunger.troclip.com', 'http://zero-hunger.troclip.com', 'http://localhost:4200'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var db = undefined;
router.get('/', cors(corsOptions), async function(req, res, next) {
  // let client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
  // let db = client.db('wfp-dashboard');
  // let data = await db.collection('hunger-data').find().toArray();
  // res.send(data);

  ////////////////////////////////////
let y = await zHungerData.zeroHungerData();
res.send(y);
});

module.exports = router;
