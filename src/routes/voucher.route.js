var express = require('express');
var router = express.Router();
var voucherCtrl = require('../controller/voucher.controller');

router.route('/get-voucher/:voucher')
    .get(voucherCtrl.getVoucherFoMfo);

router.route('/get-voucher-web-membership/:outlet/:voucher')
    .get(voucherCtrl.getVoucherWebMembership);

module.exports = router;