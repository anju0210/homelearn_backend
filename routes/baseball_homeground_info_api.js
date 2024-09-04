const express = require('express');
const uuidAPIKey = require('uuid-apikey');
const BaseballHomeground = require('../models/baseball_homeground_info_model.js')(require('../config/db'));
const BaseballHomegroundParking = require('../models/baseball_homeground_parking_model.js')(require('../config/db'));


const router = express.Router();


const key = {
    apiKey: process.env.API_KEY,
    uuid: '36f77065-60fa-4b4a-90db-f2a02be13f34'
};

router.get('/:apikey', async (req, res) => {
    try {
        const { apikey } = req.params;

        // API 키 검증
        if (!uuidAPIKey.isAPIKey(apikey) || !uuidAPIKey.check(apikey, key.uuid)) {
            return res.status(401).send('apikey is not valid.');
        }

        const baseballHomegrounds = await BaseballHomeground.findAll();

        for (const baseballHomeground of baseballHomegrounds) {
            const baseballHomegroundParking = await BaseballHomegroundParking.findAll({ where: { homeground_id: baseballHomeground.id } });
            baseballHomeground.parking = baseballHomegroundParking;
        }

        if (baseballHomegrounds.length > 0) {
            res.status(200).json(baseballHomegrounds);
        } else {
            res.status(404).send('No homegrounds found.');
        }
    } catch (error) {
        console.error('Error fetching homegrounds:', error);
        res.status(500).send('Failed to fetch homegrounds');
    }
});


router.get('/:apikey/:id', async (req, res) => {
    try {
        const { apikey, id } = req.params;

        // API 키 검증
        if (!uuidAPIKey.isAPIKey(apikey) || !uuidAPIKey.check(apikey, key.uuid)) {
            return res.status(401).send('apikey is not valid.');
        }

        const baseballHomeground = await BaseballHomeground.findByPk(id);
        const homeground_id = id;
        const baseballHomegroundParking = await BaseballHomegroundParking.findAll({where: {homeground_id}});

        if (baseballHomeground) {
            baseballHomeground.parking = baseballHomegroundParking;
            res.status(200).json(baseballHomeground);
            
        } else {
            res.status(404).send('homeground not found.');
        }
    } catch (error) {
        console.error('Error fetching homeground:', error);
        res.status(500).send('Failed to fetch homeground');
    }
});


// app.js에서 사용할 수 있도록 내보냄
module.exports = router;