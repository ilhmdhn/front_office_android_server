var express = require('express');
var router = express.Router();
var Ctrl = require('./../controller/report.controller');
var mysalesController = require('./../controller/report_mysales.controller');

router.route('/user')
    .get(Ctrl.getUser);

router.route('/getStatusReportKas')
    .get(Ctrl.getStatusReportKas);

router.route('/getCashDetail')
    .get(Ctrl.getCashDetail);

router.route('/cashdetail')
    .post(Ctrl.postCashDetail);

router.route('/cashdetail/:tanggal/:shift')
    .put(Ctrl.updateCashDetail);

router.route('/mysales/weekly')
    .get(mysalesController.getMySalesWeekly);

router.route('/mysales/today')
    .get(mysalesController.getMySalesToday);

router.route('/mysales/monthly')
    .get(mysalesController.getMySalesMonthly);

router.route('/salesitem')
    .get(mysalesController.getSalesItem);

router.route('/cancelitems')
    .get(mysalesController.getCancelSalesItem);

router.route('/salesbyitemname')
    .get(mysalesController.getSalesByItemName);

module.exports = router;