var express = require('express');
var router = express.Router();
var roomCtrl = require('./../controller/room.controller.js');
var roomChecksound = require('./../controller/checksound.controller');
var roomCheckinDirect = require('./../controller/checkin_direct.controller');

//Poin Of Sales lama
router.route('/checkin')
    .get(roomCtrl.getChekinRoom);

router.route('/ready')
    .get(roomCtrl.getReadyRoom);

router.route('/:room/order')
    .get(roomCtrl.getOrderRoom);

//Room No HP112
router.route('/Reception')
    .post(roomCtrl.getReceptionRoomByIpAddress);

router.route('/room-ip-address/:ip_address')
    .get(roomCtrl.getReceptionRoomRcpByIpAddress);

router.route('/room-detail-room-sign/:room')
    .get(roomCtrl.getReceptionByRoomNo);

router.route('/room-detail-pos-lorong/:room')
    .get(roomCtrl.getRoomDetailByRoomNo);

router.route('/image/:idImage')
    .get(roomCtrl.getRoomImage);

router.route('/video/:idVideo')
    .get(roomCtrl.getVideoIklan);

router.route('/download-video/:idVideo')
    .post(roomCtrl.getDownloadVideoIklan);

//Poin of Sales HP112
router.route('/all-room')
    .get(roomCtrl.getAllRoom);

router.route('/room-detail/:kamar')
    .get(roomCtrl.getRoom);

router.route('/room-extend/:kamar')
    .get(roomCtrl.getExtendRoomList);

router.route('/all-room-ready')
    .get(roomCtrl.getAllRoomReady);

router.route('/all-room-by-type/:room_type/:capacity')
    .get(roomCtrl.getRoomByType);

router.route('/all-room-checkin')
    .get(roomCtrl.getAllRoomCheckin);

router.route('/all-room-checkin-by-type')
    .get(roomCtrl.getAllRoomCheckinByType);

router.route('/all-room-paid')
    .get(roomCtrl.getAllRoomPaid);

router.route('/all-room-checkout')
    .get(roomCtrl.getAllRoomCheckout);

router.route('/all-room-in-use')
    .get(roomCtrl.getAllRoomInUse);

router.route('/jenis-kamar')
    .get(roomCtrl.getJenisRoom);

router.route('/all-room-type-ready')
    .get(roomCtrl.getJenisRoomReady);

router.route('/all-room-ready-by-type/:jenis_kamar/:capacity')
    .get(roomCtrl.getJenisRoomReadyDetail);

// TODO :: this method spesific for HP112
router.route('/all-room-type-ready-grouping')
    .get(roomCtrl.getGroupingTypeRoomReady);

router.route('/all-room-ready-by-type-grouping/:jenis_kamar')
    .get(roomCtrl.getAllRoomReadyByTypeGrouping);






router.route('/rsv/:reservation')
    .get(roomCtrl.getWebReservation);

router.route('/print-tagihan/:roomcode')
    .get(roomCheckinDirect.submitPrintTagihanRoom);

router.route('/checksound')
    .post(roomChecksound.submitCheckSoundRoom);

router.route('/clean')
    .post(roomCheckinDirect.submitOprDibersihkanRoom);




router.route('/checkout')
    .post(roomCheckinDirect.submiCheckOutRoom);

router.route('/jenis-kamar-ready/:jenis_kamar')
    .get(roomCtrl.getJenisRoomReadyDetail);

router.route('/jenis-kamar/:jenis_kamar')
    .get(roomCtrl.getJenisRoomDetail);

router.route('/history-checkin/:hari')
    .get(roomCtrl.getHistoryCheckin);

module.exports = router;

