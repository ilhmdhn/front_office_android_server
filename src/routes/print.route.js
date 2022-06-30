var express = require('express');
var router = express.Router()
var controller = require('../controller/printer.controller.js');

router.route('/test-printer')
    .get(controller.testPrinter);

module.exports = router;