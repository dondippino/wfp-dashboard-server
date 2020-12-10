var express = require('express');
var router = express.Router();
// var MongoClient = require('mongodb').MongoClient;
var mvam = require('../models/mvam')
var cors = require('cors');
var corsOptions = {
    origin: ['https://zero-hunger.troclip.com', 'http://zero-hunger.troclip.com', 'http://localhost:4200'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var db = undefined;
/* GET users listing. */
router.get('/inadequate-diet', cors(corsOptions), async function (req, res, next) {
    let y = await mvam.mvamDataInadequateDiet(req.query.min, req.query.max);
    res.send(y);
});

router.get('/livelihood-based-coping', cors(corsOptions), async function (req, res, next) {
    let y = await mvam.mvamDataLivelihoodBasedCoping(req.query.min, req.query.max);
    res.send(y);
});

router.get('/max-date', cors(corsOptions), async function (req, res, next) {
    let y = await mvam.mvamMaxDate();
    res.send(y);
});

// router.get('/inadequate-diet-trend/', cors(corsOptions), async function (req, res, next) {
//     let y = await mvam.mvamDataInadequateDietTrend('');
//     res.send(y);
// });

router.get('/inadequate-diet-trend/:filters?', cors(corsOptions), async function (req, res, next) {
    let y = await mvam.mvamDataInadequateDietTrend(req.params.filters, req.query.min, req.query.max);
    res.send(y);
});

// router.get('/livelihood-based-coping-trend', cors(corsOptions), async function (req, res, next) {
//     let y = await mvam.mvamDataLivelihoodBasedCopingTrend('');
//     res.send(y);
// });

router.get('/livelihood-based-coping-trend/:filters?', cors(corsOptions), async function (req, res, next) {
    let y = await mvam.mvamDataLivelihoodBasedCopingTrend(req.params.filters, req.query.min, req.query.max);
    res.send(y);
});

module.exports = router;
