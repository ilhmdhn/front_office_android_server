var express = require('express');
var router = express.Router();
var neworderCtrl = require('./../controller/neworder.controller');

router.route('/add')
    .post(neworderCtrl.submit);

router.route('/get/:room')
    .get(neworderCtrl.getOrder);

module.exports = router;
