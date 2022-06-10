var express = require('express');
var router = express.Router();
var checkinDirectCtrl = require('../controller/checkin_direct.controller');
var transferCtrl = require('../controller/transfer.controller');

router.route('/direct-checkin')
    .post(checkinDirectCtrl.submitDirectCheckInRoom);

router.route('/direct-checkin-member')
    .post(checkinDirectCtrl.submitDirectCheckInRoomMember);

router.route('/direct-lobby-member')
    .post(checkinDirectCtrl.submitDirectCheckInLobbyMember);

router.route('/edit-checkin')
    .post(checkinDirectCtrl.submitDirectEditCheckInRoom);

router.route('/extend-room')
    .post(checkinDirectCtrl.submitExtendRoom);

router.route('/transfer-room')
    .post(checkinDirectCtrl.submitTransferRoom);

router.route('/transfer-room-member')
    .post(checkinDirectCtrl.submitTransferRoomMember);

router.route('/transfer-lobby-to-room')
    .post(transferCtrl.transferLobbyToRoom);

router.route('/sign-image')
    .post(checkinDirectCtrl.submitSignImage);

router.route('/remove_promo')
    .delete(checkinDirectCtrl.removePromoRoom);

module.exports = router;