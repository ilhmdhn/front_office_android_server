var express = require('express');
var router = express.Router()
var controller = require('../controller/printer.controller');

router.route('/print-kas')
    .post(controller.printKas)

router.route('/print-tagihan')
    .post(controller.printTagihan)

router.route('/print-invoice')
    .get(controller.printInvoice);
module.exports = router;