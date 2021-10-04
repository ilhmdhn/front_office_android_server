var express = require('express');
var router = express.Router();
var rsvCtrl = require('./../controller/reservation.controller');

router.route('/getRsv/:reservation')
    .get(rsvCtrl.getWebReservation);

module.exports = router;