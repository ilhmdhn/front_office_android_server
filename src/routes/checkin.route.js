var express = require('express');
var router = express.Router();
var checkinCtrl = require('./../controller/checkin.controller');

router.route('/checkin-result/:room')
    .get(checkinCtrl.getCheckinResult);

router.route('/checkin-history/:reception/:room')
    .get(checkinCtrl.getCheckinHistory);

router.route('/checkin-fo')
    .post(checkinCtrl.submitCheckInRoomViaFo);

module.exports = router;