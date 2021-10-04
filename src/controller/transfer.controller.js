var ResponseFormat = require('../util/response');
var moment = require('moment');
var logger;
var dgram = require('dgram');

const InputValidation = require('../util/input.validation');
const TransferService = require('../services/transfer.services');
const valid = new InputValidation();


exports.transferLobbyToRoom = async function (req, res) {

    logger = req.log;
    var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    logger.info("-> Start proses transfer " + start);
    console.log("-> Start proses transfer " + start);

    let transferService = new TransferService(logger);

    let validData = validasiDataLobby(req)//TODO : kurang parameter durasi jam checkin;
    if (validData.state) {
        transferService.lobbyToRoom(validData)
            .then((finalDataCheckin) => {
                res.send(new ResponseFormat(false, null, err));
            })
            .catch((err) => {
                logger.error(err);
                res.send(new ResponseFormat(false, null, err));
            });
    } else {
        logger.error(validData.desc);
        res.send(new ResponseFormat(false, null, validData.desc));
    }

};

function validasiDataLobby(input) {

    if (valid.isEmpty(input.body.transfer_reason)) {
        return { state: false, desc: 'Alasan Transfer Belum Terisi' };
    } else if (valid.isEmpty(input.body.chusr)) {
        return { state: false, desc: 'User Petugas Tidak Ada' };
    } else if (valid.isEmpty(input.body.old_room_before_transfer.kamar)) {
        return { state: false, desc: 'Kode Ruangan Lama Tidak Ada' };
    } else if (valid.isEmpty(input.body.checkin_room_type.jenis_kamar)) {
        return { state: false, desc: 'Jenis Kamar Tidak Ada' };
    } else if (valid.isEmpty(input.body.checkin_room.kamar)) {
        return { state: false, desc: 'Kamar Tujuan Tidak Ada' };
    } else if (valid.isEmpty(input.body.visitor.member)) {
        return { state: false, desc: 'Kode Member Tidak Ada' };
    } else if (valid.isEmpty(input.body.visitor.nama_lengkap)) {
        return { state: false, desc: 'Nama Pengunjung Tidak Ada' };
    } else if (input.body.durasi_jam < 1) {
        return { state: false, desc: 'Durasi Checkin belum terisi' };
    } else {
        var transferDesc;
        if (input.body.transfer_reason == 'OVERPAX') {
            transferDesc = '1';
        } else if (input.body.transfer_reason == 'PERMINTAAN TAMU') {
            transferDesc = '2';
        } else if (input.body.transfer_reason == 'VOD BERMASALAH') {
            transferDesc = '3';
        }


        return {
            state: true,
            desc: 'Validasi Ok',
            transfer_desc: transferDesc,
            chusr: input.body.chusr,
            old_room_code: input.body.old_room_before_transfer.kamar,
            new_room_code: input.body.checkin_room.kamar,
            duration_on_hours: input.body.durasi_jam,
            duration_on_minute: input.body.durasi_jam * 60,
            member_name: input.body.visitor.nama_lengkap,
            member_code: input.body.visitor.member
        };
    }

}
