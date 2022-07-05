var express = require('express');
var router = express.Router()
var controller = require('../controller/printer.controller.js');

router.route('/print-kas')
    .post(controller.printKas)

router.route('/print-invoice')
    .get(controller.printInvoice);
module.exports = router;