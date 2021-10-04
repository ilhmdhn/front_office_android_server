var express = require('express');
var router = express.Router();
var paymentCtrl = require('./../controller/payment.controller');

router.route('/add')
    .post(paymentCtrl.submitPayment);

router.route('/email-invoice/:room')
    .get(paymentCtrl.submitEmail);

module.exports = router;