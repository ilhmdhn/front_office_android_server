var express = require('express');
var router = express.Router();
var configCtrl = require('./../controller/config.controller.js');

router.route('/version')
    .get(configCtrl.getConfig);

router.route('/profile')
    .get(configCtrl.profil);

router.route('/ip-address')
    .get(configCtrl.ip_address);

module.exports = router;