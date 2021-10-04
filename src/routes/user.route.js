var express = require('express');
var router = express.Router();
var userCtrl = require('./../controller/user.controller');

router.route('/login-fo-droid')
    .post(userCtrl.loginFo);

router.route('/login')
    .post(userCtrl.login);

router.route('/loginDekripsi')
    .post(userCtrl.loginDekripsi);

router.route('/enkripsi-1/:input')
    .get(userCtrl.test_enkripsi_dekripsi_1);

router.route('/enkripsi-2/:input')
    .get(userCtrl.test_enkripsi_dekripsi_2);

router.route('/enkripsi/:input')
    .get(userCtrl.test_enkripsi_dekripsi);

module.exports = router;