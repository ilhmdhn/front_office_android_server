var express = require('express');
var router = express.Router();
var orderCtrl = require('./../controller/order.controller');

router.route('/single/room/sol/sod')
    .post(orderCtrl.submitOrderSingleRoom);

router.route('/single/room/sol/sod-android')
    .post(orderCtrl.submitSlipOrderAndroid);

router.route('/cancelOrder')
    .post(orderCtrl.pembatalanOrder);

router.route('/revisi-order')
    .post(orderCtrl.revisiOrder);

router.route('/getfo/:room')
    .get(orderCtrl.getSlipOrderFO);

router.route('/pending-order/:room_code')
    .get(orderCtrl.getInfoPendingOrder);

module.exports = router;
