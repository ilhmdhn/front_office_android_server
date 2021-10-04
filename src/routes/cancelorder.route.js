var express = require('express');
var router = express.Router();
var cancelCtrl = require('./../controller/cancelorder.controller');

router.route('/add')
    .post(cancelCtrl.submit);

module.exports = router;