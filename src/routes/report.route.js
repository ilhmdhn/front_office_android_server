var express = require('express');
var router = express.Router();
var Ctrl = require('./../controller/report.controller');

router.route('/cash')
    .post(Ctrl.getCash);

module.exports = router;