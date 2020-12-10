var MongoClient = require('mongodb').MongoClient
var db = require('./db-connection');
require('dotenv').config();
var maxFromEnv = process.env.MAX_DATE;


(async () => {
    if (db === undefined) {
        let client = await MongoClient.connect('mongodb://localhost:27017/wfp-dashboard', { useUnifiedTopology: true });
        console.log('Database client connected')
        db = client.db('wfp-dashboard');
    }
})();

mvamDataInadequateDiet = async (min, max) => {
    // let data = await db.collection('mvam_data').find({ Indicator: 'FCG', Aggregation: 'ADM1_NAME', "Food Assistance": '<=2' }).toArray();
    let maxDate = undefined;
    if (min !== undefined && max !== undefined) {
        // maxDate = { $gte: new Date(min), $lte: new Date(max) };
        maxDate = new Date(max);
    } else if ( maxFromEnv.length > 0 ){
        maxDate = new Date(maxFromEnv);
        console.log(maxFromEnv);
    } else {
        var dt = await mvamMaxDate();
        maxDate = new Date(dt);
    }
    let data = await db.collection('mvam_data').aggregate(
        [
            { "$match": { Indicator: 'FCG', Aggregation: 'ADM1_NAME', Date: maxDate, "Food Assistance": '<=2' } },
            { "$sort": { Date: -1 } },
            {
                "$group": {
                    "_id": "$Dmgrph",
                    "State": { "$first": "$Dmgrph" },
                    "Date": { "$max": "$Date" },
                    "Indicator": { "$first": "$Indicator" },
                    "Food Assistance": { "$first": "$Food Assistance" },
                    "Mean crrnt": { "$first": "$Mean crrnt" }
                }
            }
        ]).toArray();
    return data;
}

mvamDataLivelihoodBasedCoping = async (min, max) => {
    // let data = await db.collection('mvam_data').find({ Indicator: 'FCG', Aggregation: 'ADM1_NAME', "Food Assistance": '<=2' }).toArray();
    let maxDate = undefined;
    if (min !== undefined && max !== undefined) {
        // maxDate = { $gte: new Date(min), $lte: new Date(max) };
        maxDate = new Date(max);
    } else if (maxFromEnv.length > 0) {
        console.log(maxFromEnv);
        maxDate = new Date(maxFromEnv);
    } else {
        var dt = await mvamMaxDate();
        maxDate = new Date(dt);
    }
    let data = await db.collection('mvam_data').aggregate(
        [
            { "$match": { Indicator: 'LhCSICat', Aggregation: 'ADM1_NAME', Date: maxDate, $or: [{ "Food Assistance": 3 }, { "Food Assistance": 4 }] } },
            { "$sort": { Date: -1 } },
            {
                "$group": {
                    "_id": "$Dmgrph",
                    "State": { "$first": "$Dmgrph" },
                    "Date": { "$max": "$Date" },
                    "Indicator": { "$first": "$Indicator" },
                    "Food Assistance": { "$first": "$Food Assistance" },
                    "Mean crrnt": { "$sum": "$Mean crrnt" }
                }
            }
        ]).toArray();
    return data;
}

mvamMaxDate = async () => {
    //db.mvam_data.aggregate({ $group : { _id: null, max: { $max : "$Date" }}});
    let data = await db.collection('mvam_data').aggregate([
        {
            $group: {
                _id: null,
                maxDate: { $max: "$Date" }
            }
        }
    ]).toArray();
    return data[0]['maxDate'];
}

mvamDataInadequateDietTrend = async (states, min, max) => {
    var match;
    if (states === undefined) {
        match = { Indicator: 'FCG', Aggregation: 'ADM1_NAME', "Food Assistance": '<=2' };
    } else {
        var filters = states.split('|');
        match = { Indicator: 'FCG', Aggregation: 'ADM1_NAME', 'Dmgrph': { $in: filters }, "Food Assistance": '<=2' };
    }
    if (maxFromEnv.length > 0) {
        match['Date'] = { $lte: new Date(maxFromEnv) };
    }
    if ( min !== undefined && max !== undefined ){
        match['Date'] = { $gte: new Date(min), $lte: new Date(max) };
    }
    
    let data = await db.collection('mvam_data').aggregate(
        [
            { "$match": match},
            {
                "$group": {
                    "_id": "$Date",
                    "Mean crrnt": { "$avg": "$Mean crrnt" }
                }
            },
            { "$sort": { _id: 1 } }
        ]
    ).toArray();
    return data.reduce((o,c)=>{
        let dateFormatted = new Date(c._id);
        let month = (dateFormatted.getMonth() + '').padStart(2, '0');
        let day = (dateFormatted.getDate() + '').padStart(2, '0');
        let year = dateFormatted.getFullYear() + '';
        // let res = `${dateFormatted.getDate()}/${dateFormatted.getMonth()}/${dateFormatted.getFullYear()}`;
        let res = `${year}-${month}-${day}`;
        // let res = [dateFormatted.getFullYear(), dateFormatted.getMonth(), dateFormatted.getDate()];
        o[res] = c['Mean crrnt'];
        return o;
    },{});
}

mvamDataLivelihoodBasedCopingTrend = async (states, min, max) => {
    
    var match;
    if (states === undefined) {
        match = { Indicator: 'LhCSICat', Aggregation: 'ADM1_NAME', $or: [{ "Food Assistance": 3 }, { "Food Assistance": 4 }] };
    } else {
        var filters = states.split('|');
        match = { Indicator: 'LhCSICat', Aggregation: 'ADM1_NAME', 'Dmgrph': { $in: filters }, $or: [{ "Food Assistance": 3 }, { "Food Assistance": 4 }] };
    }
    if (maxFromEnv.length > 0) {
        match['Date'] = { $lte: new Date(maxFromEnv) };
    }
    if (min !== undefined && max !== undefined) {
        match['Date'] = { $gte: new Date(min), $lte: new Date(max) };
    }
    
    let data = await db.collection('mvam_data').aggregate(
        [
            { "$match": match },
            {
                "$group": {
                    "_id": "$Date",
                    "Mean crrnt": { "$avg": "$Mean crrnt" }
                }
            },
            { "$sort": { _id: 1 } }
        ]
    ).toArray();
    return data.reduce((o, c) => {
        let dateFormatted = new Date(c._id);
        let month = (dateFormatted.getMonth()+'').padStart(2, '0');
        let day = (dateFormatted.getDate() + '').padStart(2, '0');
        let year = dateFormatted.getFullYear()+'';
        // let res = `${dateFormatted.getDate()}/${dateFormatted.getMonth()}/${dateFormatted.getFullYear()}`;
        let res = `${year}-${month}-${day}`;
        // let res = [dateFormatted?.getFullYear(), dateFormatted.getMonth(), dateFormatted.getDate()];
        o[res] = c['Mean crrnt'];
        return o;
    }, {});
}

module.exports = { mvamDataInadequateDiet, mvamDataLivelihoodBasedCoping, mvamMaxDate, mvamDataInadequateDietTrend, mvamDataLivelihoodBasedCopingTrend };