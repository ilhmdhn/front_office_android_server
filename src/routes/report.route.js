var express = require('express');
var router = express.Router();
var Ctrl = require('./../controller/report.controller');

router.route('/cash')
    .post(Ctrl.getCash);

router.route('/user')
    .get(Ctrl.getUser);

router.route('/getStatusReportKas')
    .get(Ctrl.getStatusReportKas)

module.exports = router;