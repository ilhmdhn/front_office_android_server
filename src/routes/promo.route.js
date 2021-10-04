var express = require('express');
var router = express.Router();
var promoCtrl = require('../controller/promo.controller');

router.route('/promo-room/:jenis_kamar')
    .get(promoCtrl.getGetPromoRoom);

router.route('/promo-food/:jenis_kamar/:kamar')
    .get(promoCtrl.getGetPromoFood);

module.exports = router;