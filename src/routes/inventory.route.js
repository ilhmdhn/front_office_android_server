var express = require('express');
var router = express.Router();
var invCtrl = require('./../controller/inventory.controller.js');

router.route('/list')
    .get(invCtrl.getInventoryWaiters);

router.route('/list-front-office')
    .get(invCtrl.getInventoryKasir);

    router.route('/image/:idImage')
    .get(invCtrl.getInventoryImage);

module.exports = router;
