var express = require('express');
var router = express.Router();
var orderCtrl = require('./../controller/checksound.controller');
var roomCheckinDirect = require('./../controller/checkin_direct.controller');

router.route('/checksound')
    .post(orderCtrl.submitCheckSoundRoom);

router.route('/opr-dibersihkan')
    .post(roomCheckinDirect.submitOprDibersihkanRoom);

router.route('/WorkdateStart')
    .get(orderCtrl.submitCheckSoundRoom);

router.route('/WorkdateFinish')
    .get(orderCtrl.submitCheckSoundRoom);

module.exports = router;