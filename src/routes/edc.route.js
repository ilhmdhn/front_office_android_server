var express = require('express');
var router = express.Router();
var edcCtrl = require('../controller/edc.controller.js');

router.route('/list-edc')
    .get(edcCtrl.getEdcMesin);

module.exports = router;
