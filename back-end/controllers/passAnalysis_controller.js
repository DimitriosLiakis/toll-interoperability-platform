const path = require('path');
const fs = require('fs');
const DbService = require('../dbService.js');
const util = require('util');
const json2csv = require('json2csv').parse;

const passAnalysis_controller = async (req, res, next) => {
    try {
        const {stationOpID, tollOpID, date_from, date_to} = req.params;
        const format = req.query.format || 'json';

        if 
    }
    catch(error) {

    }
}