var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var Shift = require('../util/shift');
var KodeTransaksi = require('../util/kode.transaksi');
var TarifKamar = require('../services/tarif.kamar');
var PromoRoom = require('../services/promo.room');
var PromoFood = require('../services/promo.food');
var Service = require('../services/service');
var Pajak = require('../services/pajak');
var Voucher = require('../services/voucher');
var TglMerah = require('../services/tgl.merah.js');
var Room = require('../services/room.service.js');
var History = require('../services/history.js');
var CheckinProses = require('../services/checkin.proses.js');
var ResetTransaksi = require('../services/reset.transaksi.js');
var IpAddressService = require('../services/ip.address.service.js');
var RoomNoService = require('../services/room.no.service.js');
var ConfigPos = require('../services/config.pos.js');

var moment = require('moment');
var fs = require('fs');
var logger;
var formResponseData;
var db;
//var multer, storage, path;
//multer = require('multer');
var path = require('path');
var shift;
var dgram = require('dgram');
var pesan;
var ip_address;
var port;
var panjang_pesan;

exports.submitDirectCheckInRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procDirectCheckInRoom(req, res);
};

async function _procDirectCheckInRoom(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses checkin " + start);
        console.log("-> Start proses checkin " + start);

        var room = req.body.room;
        var reservasi = req.body.member_reservasi_code;
        if (reservasi === undefined) {
            reservasi = "";
        }
        var jenis_kamar;
        var kapasitas_kamar;
        var mbl;
        var nomor_hari;
        var nomor_hari_;
        var date_trans_Query;
        var finalShift;
        var isGetCekAktifKondisiVoucher = false;

        var nilai_uang_voucher = parseFloat(0);
        var uang_voucher = parseFloat(0);

        var charge_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);
        var total_tarif_kamar = parseFloat(0);

        var kode_member_ = req.body.kode_member;
        var kode_member = kode_member_.toUpperCase();
        if (kode_member.length >= 16) {
            kode_member = kode_member.substr(0, 14);
        }
        kode_member = await new CheckinProses().menghapusCharPetik(kode_member);
        var kode_member__ = kode_member;
        var apakah_nomor_member = parseInt(kode_member__);

        if (isNaN(apakah_nomor_member) == true) {
            apakah_nomor_member = false;
        }
        else {
            apakah_nomor_member = true;
        }

        var nama_member_ = req.body.nama_member;
        var nama_member = nama_member_.toUpperCase();
        nama_member = await new CheckinProses().menghapusCharPetik(nama_member);
        var chusr = req.body.chusr;

        var durasi_jam_ = req.body.durasi_jam;
        var durasi_jam = parseInt(durasi_jam_);

        if (durasi_jam_ === undefined) {
            durasi_jam_ = '0';
        }
        else if (durasi_jam_ == '') {
            durasi_jam_ = '0';
        }

        var durasi_menit_ = req.body.durasi_menit;
        if (durasi_menit_ === undefined) {
            durasi_menit_ = '0';
        }
        else if (durasi_menit_ == '') {
            durasi_menit_ = '0';
        }
        var durasi_menit = parseInt(durasi_menit_);

        var totalDurasiCekinMenit = (durasi_jam * 60) + durasi_menit;
        var dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())";
        var voucher = req.body.voucher;
        voucher = voucher.toUpperCase();

        var promo_ = req.body.promo;

        var status_promo;
        if (promo_ == '') {
            promo_ = '';
            status_promo = '1';
        }
        else if (promo_ === undefined) {
            promo_ = '';
            status_promo = '1';
        }
        if (promo_ != '') {
            promo = promo_;
            status_promo = '2';
        }

        var qm1_ = req.body.qm1;
        if (qm1_ == '') {
            qm1_ = '0';
        }
        else if (qm1_ === undefined) {
            qm1_ = '0';
        }
        var qm1 = parseInt(qm1_);

        var qm2_ = req.body.qm2;
        if (qm2_ == '') {
            qm2_ = '0';
        }
        else if (qm2_ === undefined) {
            qm2_ = '0';
        }
        var qm2 = parseInt(qm2_);

        var qm3_ = req.body.qm3;
        if (qm3_ == '') {
            qm3_ = '0';
        }
        else if (qm3_ === undefined) {
            qm3_ = '0';
        }
        var qm3 = parseInt(qm3_);

        var qm4_ = req.body.qm4;
        if (qm4_ == '') {
            qm4_ = '0';
        }
        else if (qm4_ === undefined) {
            qm4_ = '0';
        }
        var qm4 = parseInt(qm4_);

        var qf1_ = req.body.qf1;
        if (qf1_ == '') {
            qf1_ = '0';
        }
        else if (qf1_ === undefined) {
            qf1_ = '0';
        }
        var qf1 = parseInt(qf1_);

        var qf2_ = req.body.qf2;
        if (qf2_ == '') {
            qf2_ = '0';
        }
        else if (qf2_ === undefined) {
            qf2_ = '0';
        }
        var qf2 = parseInt(qf2_);

        var qf3_ = req.body.qf3;
        if (qf3_ == '') {
            qf3_ = '0';
        }
        else if (qf3_ === undefined) {
            qf3_ = '0';
        }
        var qf3 = parseInt(qf3_);

        var qf4_ = req.body.qf4;
        if (qf4_ == '') {
            qf4_ = '0';
        }
        else if (qf4_ === undefined) {
            qf4_ = '0';
        }
        var qf4 = parseInt(qf4_);

        var pax = qm1 + qm2 + qm3 + qm4 + qf1 + qf2 + qf3 + qf4;
        var hp_ = req.body.hp;
        if (hp_ == '') {
            hp_ = '';
        }
        else if (hp_ === undefined) {
            hp_ = '';
        }
        var hp = hp_.toUpperCase();
        hp = await new CheckinProses().menghapusCharPetik(hp);

        var keterangan_ = req.body.keterangan;
        if (keterangan_ == '') {
            keterangan_ = '';
        }
        else if (keterangan_ === undefined) {
            keterangan_ = '';
        }
        var keterangan = keterangan_.toUpperCase();
        keterangan = await new CheckinProses().menghapusCharPetik(keterangan);

        var uang_muka_ = req.body.uang_muka;
        if (uang_muka_ == '') {
            uang_muka_ = 0;
        }
        else if (uang_muka_ === undefined) {
            uang_muka_ = 0;
        }
        var uang_muka = parseFloat(uang_muka_);
        var keterangan_payment_uang_muka_ = req.body.keterangan_payment_uang_muka;
        keterangan_payment_uang_muka_ = keterangan_payment_uang_muka_.toUpperCase();
        keterangan_payment_uang_muka_ = await new CheckinProses().menghapusCharPetik(keterangan_payment_uang_muka_);

        var id_payment_uang_muka = parseInt(0);
        var input1_jenis_kartu = req.body.input1_jenis_kartu;
        input1_jenis_kartu = input1_jenis_kartu.toUpperCase();

        var input2_nama = req.body.input2_nama;
        input2_nama = input2_nama.toUpperCase();
        input2_nama = await new CheckinProses().menghapusCharPetik(input2_nama);

        var input3_nomor_kartu = req.body.input3_nomor_kartu;
        var input4_nomor_approval = req.body.input4_nomor_approval;
        var edc_machine = req.body.edc_machine;

        var eventAcara = req.body.event_acara;
        eventAcara = eventAcara.toUpperCase();
        eventAcara = await new CheckinProses().menghapusCharPetik(eventAcara);

        if (keterangan_payment_uang_muka_ == "CASH") {
            id_payment_uang_muka = parseInt(0);
        } else if (keterangan_payment_uang_muka_ == "CREDIT CARD") {
            id_payment_uang_muka = parseInt(1);
        } else if (keterangan_payment_uang_muka_ == "DEBET CARD") {
            id_payment_uang_muka = parseInt(2);
        } else if (keterangan_payment_uang_muka_ == "TRANSFER") {
            id_payment_uang_muka = parseInt(32);
        }

        if ((voucher != '') && (voucher !== undefined)) {
            isGetCekAktifKondisiVoucher = await new Voucher().getCekAktifKondisiVoucher(db, voucher);
        }
        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);
        if (isgetPengecekanRoomReady != false) {
            jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
            kapasitas_kamar = isgetPengecekanRoomReady.data[0].kapasitas;
            kapasitas_kamar = parseInt(kapasitas_kamar);
        }

        if (kode_member == '') {
            console.log(room + " Kode member Tidak Boleh Kosong");
            logger.info(room + " Kode member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Kode member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member == '') {
            console.log(room + " Nama Member Tidak Boleh Kosong");
            logger.info(room + " Nama Member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member.length > 50) {
            console.log(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (eventAcara.length > 50) {
            console.log(room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (hp.length > 60) {
            console.log(room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (keterangan.length > 60) {
            console.log(room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        /* else if (pax == 0) {
            console.log(room + " Jumlah tamu Tidak Boleh Nol");
            logger.info(room + " Jumlah tamu Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Jumlah tamu Tidak Boleh Nol");
            res.send(dataResponse);
        } */
        else if (totalDurasiCekinMenit == 0) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Nol");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Nol");
            res.send(dataResponse);
        }
        else if (totalDurasiCekinMenit > 720) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Melebihi 12 Jam");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Melebihi 12 Jam");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Tidak Boleh Melebihi 12 Jam");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == "1")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah expired");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "2")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sedang digunakan checkin di reception " + isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah digunakan checkin di reception " + isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit < 60)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif waktu penggunaan kurang dari 60 menit, tersisa menit " + isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) && (totalDurasiCekinMenit < 120)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif penggunaan voucher minimal Checkin 2 jam");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_jam_sekarang_voucher_bisa_digunakan == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher baru bisa digunakan mulai jam " + isGetCekAktifKondisiVoucher.data[0].time_start +
                " sampai dengan jam " + isGetCekAktifKondisiVoucher.data[0].time_finish);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher == false)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher tidak terdaftar");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {

                if (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1) {

                    if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                        if (isgetPengecekanRoomReady.data[0].status_checksound == 1) {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan CheckSound");
                            res.send(dataResponse);
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, room + "Sedang digunakan Checkin");
                            res.send(dataResponse);
                        }
                    }

                    else if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                        dataResponse = new ResponseFormat(false, null, room + " Sedang Opr Dibersihkan");
                        res.send(dataResponse);
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_kamar_ready_untuk_checkin == 1) {
                        console.log(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");
                        logger.info(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");

                        shift = await new Shift().getShift(db);
                        date_trans_Query = await new Shift().getDateTransQuery(shift);
                        finalShift = await new Shift().getFinalShift(shift);

                        var kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
                        var kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);
                        var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                        var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                        if (apakah_sekarang_malam_besok_libur.state == true) {
                            mbl = '1';
                        }
                        else {
                            mbl = '0';
                        }
                        if ((kode_rcp != false) && (kode_ivc != false)) {
                            var isGetCekReceptionIhp_rcp = await new KodeTransaksi().getCekReceptionIhp_rcp(db, kode_rcp, room);
                            if (isGetCekReceptionIhp_rcp == false) {

                                var isGetCekInvoiceIhp_Ivc = await new KodeTransaksi().getCekInvoiceIhp_Ivc(db, kode_ivc, room);
                                if (isGetCekInvoiceIhp_Ivc == false) {

                                    var isprosesQuery = await
                                        new CheckinProses().insertIhpRcp(db,
                                            kode_rcp,
                                            finalShift,
                                            kode_member,
                                            nama_member,
                                            room,
                                            durasi_jam,
                                            durasi_menit,
                                            dateTambahan,
                                            qm1,
                                            qm2,
                                            qm3,
                                            qm4,
                                            qf1,
                                            qf2,
                                            qf3,
                                            qf4,
                                            pax,
                                            hp,
                                            uang_muka,
                                            id_payment_uang_muka,
                                            uang_voucher,
                                            chusr,
                                            mbl,
                                            "1",
                                            kode_ivc,
                                            keterangan,
                                            date_trans_Query,
                                            status_promo,
                                            "-1",
                                            reservasi);
                                    if (isprosesQuery == true) {

                                        isprosesQuery = await new CheckinProses().insertIhpIvc(db,
                                            kode_ivc,
                                            finalShift,
                                            kode_rcp,
                                            kode_member,
                                            nama_member,
                                            room,
                                            uang_muka,
                                            "",
                                            chusr,
                                            date_trans_Query,
                                            jenis_kamar);
                                        if (isprosesQuery == true) {

                                            await new CheckinProses().updateInvoiceIhpRcp(db, kode_ivc, kode_rcp, room);

                                            isprosesQuery = await new CheckinProses().insertIhpRoomCheckin(db, room, kode_rcp);
                                            if (isprosesQuery == true) {

                                                isprosesQuery = await new CheckinProses().updateIhpRoomCheckIn(db, kode_rcp, nama_member, pax, dateTambahan, eventAcara, room);

                                                if (isprosesQuery == true) {

                                                    var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                    if (isDeleteIHP_Rcp_DetailsRoomQuery != false) {

                                                        var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                                                        if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                                            if (apakah_sekarang_malam_besok_libur.state == true) {
                                                                nomor_hari = '8';
                                                            }
                                                            else if (apakah_sekarang_tanggal_libur.state == true) {
                                                                nomor_hari = '9';
                                                            }
                                                            else {
                                                                nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                                            }
                                                            console.log(kode_rcp + " nomor hari " + nomor_hari);
                                                            logger.info(kode_rcp + " nomor hari " + nomor_hari);

                                                            nomor_hari_ = parseInt(nomor_hari);
                                                            var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                                            var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                                            var isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                            if (isGetTarifPerjamRoom.state == true) {
                                                                for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                    var overpax_tarif = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                    var kamar_tarif = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                                                    await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                        nomor_hari_, overpax_tarif, kamar_tarif,
                                                                        isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                }
                                                            }

                                                            //cek validitas ihp_rcp_details_room
                                                            var cek_valid_insert_ihp_rcp_details_room = await new CheckinProses().getCekValidIHPRcpDetailsRoom(db, kode_rcp);
                                                            if (cek_valid_insert_ihp_rcp_details_room == false) {
                                                                await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                                isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                                if (isGetTarifPerjamRoom.state == true) {
                                                                    for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                        var overpax_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                        var kamar_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                                                        await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                            nomor_hari_, overpax_tarif_, kamar_tarif_,
                                                                            isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                    }
                                                                }
                                                            }
                                                            if (isGetTarifPerjamRoom.state == true) {
                                                                if (promo_ != '') {
                                                                    for (a = 0; a < promo.length; a++) {
                                                                        promo_ = promo[a];
                                                                        var isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(db, promo_, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                        var isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                        if (isgetPromoRoom.state == true) {

                                                                            if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(db, promo_, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                            }
                                                                        }

                                                                        if (isgetPromoFood.state == true) {
                                                                            if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                if ((uang_muka > 0) && (keterangan_payment_uang_muka_ == "CREDIT CARD" ||
                                                                    keterangan_payment_uang_muka_ == "DEBET CARD" ||
                                                                    keterangan_payment_uang_muka_ == "TRANSFER")) {
                                                                    await new CheckinProses().insertIhpUangMukaNonCash(db,
                                                                        kode_rcp,
                                                                        keterangan_payment_uang_muka_,
                                                                        kode_member,
                                                                        nama_member,
                                                                        input1_jenis_kartu,
                                                                        input2_nama,
                                                                        input3_nomor_kartu,
                                                                        input4_nomor_approval,
                                                                        uang_muka,
                                                                        edc_machine);
                                                                }

                                                                var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                                                if (isgetTotalTarifKamarDanOverpax != false) {

                                                                    if (isGetCekAktifKondisiVoucher != false) {
                                                                        if (
                                                                            (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == 0) &&
                                                                            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "1") &&
                                                                            (isGetCekAktifKondisiVoucher.data[0].status_jam_sekarang_voucher_bisa_digunakan == 1) &&
                                                                            (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit >= 60)
                                                                        ) {
                                                                            //free voucher                                                                         
                                                                            if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                nilai_uang_voucher = await new Voucher().getTotalNilaiPotonganVoucher(db, kode_rcp, voucher);
                                                                                uang_voucher = nilai_uang_voucher;
                                                                            }
                                                                            //gift voucher
                                                                            else if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                uang_voucher = isGetCekAktifKondisiVoucher.data[0].nilai;
                                                                            }
                                                                            await new CheckinProses().updateIhpVcrSedangDipakaiCheckin(db, voucher, 2);
                                                                        }
                                                                    }
                                                                    await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                                                                    var tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                                                                    total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                                                                    await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);

                                                                    charge_overpax = tarif_overpax;

                                                                    var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);
                                                                    if (isgetTotalPromoRoom != false) {
                                                                        await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                                                        await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                                                        await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, kode_rcp);
                                                                        total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;
                                                                        console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                        logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                    }
                                                                    else {
                                                                        await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, kode_rcp);
                                                                        await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, 0);
                                                                    }

                                                                    if (apakah_nomor_member == true) {
                                                                        discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                    }

                                                                    var kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                    console.log(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                    logger.info(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);

                                                                    var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(db, total_tarif_kamar + charge_overpax - nilai_uang_voucher - discount_member_kamar);
                                                                    if (isgetNilaiServiceRoom != false) {
                                                                        nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                                                                    }

                                                                    var sewa_kamar_plus_service = parseFloat(isgetNilaiServiceRoom + total_tarif_kamar + charge_overpax - nilai_uang_voucher - discount_member_kamar);

                                                                    var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(db, sewa_kamar_plus_service);

                                                                    if (isgetNilaiPajakRoom != false) {
                                                                        nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                                                                    }

                                                                    total_tarif_kamar = parseFloat(total_tarif_kamar);
                                                                    var total_kamar = parseFloat(total_tarif_kamar +
                                                                        charge_overpax +
                                                                        nilai_service_room +
                                                                        nilai_pajak_room -
                                                                        nilai_uang_voucher -
                                                                        discount_member_kamar);

                                                                    total_kamar = total_kamar.toFixed(0);

                                                                    var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                                        db,
                                                                        total_tarif_kamar,
                                                                        0,
                                                                        charge_overpax,
                                                                        discount_member_kamar,
                                                                        nilai_service_room,
                                                                        nilai_pajak_room,
                                                                        total_kamar,
                                                                        total_kamar,
                                                                        kode_rcp,
                                                                        uang_muka,
                                                                        nilai_uang_voucher
                                                                    );
                                                                    if (isProsesQueryUpdateIhp_ivc != false) {

                                                                        if (nilai_uang_voucher > 0) {
                                                                            //simpan free voucher jam di ihp_uangVoucher
                                                                            if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, nilai_uang_voucher);
                                                                                await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, kode_rcp, nilai_uang_voucher);
                                                                            }
                                                                        }
                                                                        else if (uang_voucher > 0) {
                                                                            if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                //simpan gift voucher di ihp_uangVoucher
                                                                                await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, uang_voucher);
                                                                            }
                                                                        }

                                                                        var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "checkin");
                                                                        if (isProsesinsertHistory != false) {
                                                                            var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                                            // TODO : finish proses checkin
                                                                            logger.info("-> Start " + start + "-> Finish proses checkin " + finish + "->");
                                                                            console.log("-> Start " + start + "-> Finish proses checkin " + finish + "->");
                                                                            //disable reservasi
                                                                            var disableReservation = await new CheckinProses().disableReservation(db, reservasi, room, 2, kode_member);
                                                                            if (disableReservation.state == true) {
                                                                                await new CheckinProses().updateIhpRsv(db, reservasi, room, 2);
                                                                            }

                                                                            var client_pos = dgram.createSocket('udp4');
                                                                            pesan = "FRONT_OFFICE_ROOM_CHECKIN";
                                                                            ip_address = await new IpAddressService().getIpAddress(db, "POINT OF SALES");
                                                                            port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                                                            if ((ip_address !== false) && (port !== false)) {
                                                                                port = port.recordset[0].server_udp_port;
                                                                                ip_address = ip_address.recordset[0].ip_address;
                                                                                port = parseInt(port);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal FRONT_OFFICE_ROOM_CHECKIN to POINT OF SALES");
                                                                                client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    client_pos.close();
                                                                                });
                                                                            }


                                                                            var client_timer_vod2b = dgram.createSocket('udp4');
                                                                            pesan = "TIMER VOD2B";
                                                                            ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                                                            port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                                                            if ((ip_address !== false) && (port !== false)) {
                                                                                port = port.recordset[0].server_udp_port;
                                                                                ip_address = ip_address.recordset[0].ip_address;
                                                                                port = parseInt(port);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B");
                                                                                client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    client_timer_vod2b.close();
                                                                                });
                                                                            }

                                                                            var server_udp_room_sign = dgram.createSocket('udp4');
                                                                            pesan = "Room " + room + " Checkin";
                                                                            ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                                                            if ((ip_address !== false)) {
                                                                                ip_address = ip_address.recordset[0].IP_Address;
                                                                                port = parseInt(7082);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                                                                server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    server_udp_room_sign.close();
                                                                                });
                                                                            }

                                                                            formResponseData = {
                                                                                room: room,
                                                                                kode_rcp: kode_rcp
                                                                            };
                                                                            dataResponse = new ResponseFormat(true, formResponseData);
                                                                            res.send(dataResponse);
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    //gagal Checkin RoomHarus di reset
                                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                    dataResponse = new ResponseFormat(false, null, room + " gagal isgetTotalTarifKamarDanOverpax");
                                                                    res.send(dataResponse);
                                                                }
                                                            }
                                                            else {
                                                                //gagal Checkin RoomHarus di reset
                                                                await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                dataResponse = new ResponseFormat(false, null, room + " gagal isGetTarifPerjamRoom");
                                                                res.send(dataResponse);
                                                            }
                                                        }
                                                        else {
                                                            //gagal Checkin RoomHarus di reset
                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                            dataResponse = new ResponseFormat(false, null, room + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                                            res.send(dataResponse);
                                                        }
                                                    }
                                                    else {
                                                        //gagal Checkin RoomHarus di reset
                                                        await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                        dataResponse = new ResponseFormat(false, null, room + " gagal Delete From IHP_Rcp_DetailsRoom");
                                                        res.send(dataResponse);
                                                    }
                                                }
                                                else {
                                                    //gagal Checkin RoomHarus di reset
                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery reset checkOutRoomQuery");
                                                    res.send(dataResponse);
                                                }
                                            }
                                            else {
                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RoomCheckinQuery");
                                                res.send(dataResponse);
                                            }
                                        }
                                        else {
                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                            dataResponse = new ResponseFormat(false, null, kode_ivc + " gagal isprosesQuery insertIHP_IvcQuery");
                                            res.send(dataResponse);
                                        }
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_ivc + " sudah pernah dipakai ");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, kode_rcp + " sudah pernah dipakai ");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal get kode_rcp kode_ivc ");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, room + " Kamar Tidak Ready Checkin");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Bukan Kamar Untuk Checkin");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

exports.submitDirectEditCheckInRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procDirectEditCheckInRoom(req, res);
};

async function _procDirectEditCheckInRoom(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses edit checkin " + start);
        console.log("-> Start proses edit checkin " + start);

        var date_trans_Query;
        var isGetCekAktifKondisiVoucher = false;

        var room = req.body.room;
        var chusr = req.body.chusr;
        var jenis_kamar;
        var kapasitas_kamar;
        var kode_rcp;
        var kode_ivc;
        var totalDurasiCekinMenit;
        var totalDurasiCekinMenitRcp;
        var kode_member;
        var nama_member;
        var apakah_nomor_member;

        var nilai_uang_voucher = parseFloat(0);
        var charge_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var total_tarif_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);

        var total_tarif_kamar_extend = parseFloat(0);
        var tarif_overpax_extend_kamar = parseFloat(0);
        var charge_overpax_extend = parseFloat(0);
        var discount_member_kamar_extend = parseFloat(0);
        var nilai_ivc_sewa_kamar = parseFloat(0);
        var nilai_ivc_surcharge_kamar = parseFloat(0);
        var nilai_ivc_total_penjualan = parseFloat(0);
        var nilai_ivc_charge_lain = parseFloat(0);
        var nilai_ivc_uang_muka = parseFloat(0);
        var nilai_ivc_uang_voucher = parseFloat(0);

        var d = new Date();
        var hariKe = d.getDay();

        var qm1_ = req.body.qm1;
        if (qm1_ == '') {
            qm1_ = '0';
        }
        else if (qm1_ === undefined) {
            qm1_ = '0';
        }

        var member_ref = req.body.member_ref;
        var qm1 = parseInt(qm1_);

        var qm2_ = req.body.qm2;
        if (qm2_ == '') {
            qm2_ = '0';
        }
        else if (qm2_ === undefined) {
            qm2_ = '0';
        }
        var qm2 = parseInt(qm2_);

        var qm3_ = req.body.qm3;
        if (qm3_ == '') {
            qm3_ = '0';
        }
        else if (qm3_ === undefined) {
            qm3_ = '0';
        }
        var qm3 = parseInt(qm3_);

        var qm4_ = req.body.qm4;
        if (qm4_ == '') {
            qm4_ = '0';
        }
        else if (qm4_ === undefined) {
            qm4_ = '0';
        }
        var qm4 = parseInt(qm4_);

        var qf1_ = req.body.qf1;
        if (qf1_ == '') {
            qf1_ = '0';
        }
        else if (qf1_ === undefined) {
            qf1_ = '0';
        }
        var qf1 = parseInt(qf1_);

        var qf2_ = req.body.qf2;
        if (qf2_ == '') {
            qf2_ = '0';
        }
        else if (qf2_ === undefined) {
            qf2_ = '0';
        }
        var qf2 = parseInt(qf2_);

        var qf3_ = req.body.qf3;
        if (qf3_ == '') {
            qf3_ = '0';
        }
        else if (qf3_ === undefined) {
            qf3_ = '0';
        }
        var qf3 = parseInt(qf3_);

        var qf4_ = req.body.qf4;
        if (qf4_ == '') {
            qf4_ = '0';
        }
        else if (qf4_ === undefined) {
            qf4_ = '0';
        }
        var qf4 = parseInt(qf4_);

        var pax = qm1 + qm2 + qm3 + qm4 + qf1 + qf2 + qf3 + qf4;

        var voucher = req.body.voucher;
        voucher = voucher.toUpperCase();

        var uang_voucher = parseFloat(0);
        var promo_ = req.body.promo;
        var promo = req.body.promo;

        var status_promo;
        if (promo_ == '') {
            promo_ = '';
            status_promo = '1';
        }
        else if (promo_ === undefined) {
            promo_ = '';
            status_promo = '1';
        }
        if (promo_ != '') {
            promo = promo_;
            status_promo = '2';
        }

        var hp_ = req.body.hp;
        if (hp_ == '') {
            hp_ = '';
        }
        else if (hp_ === undefined) {
            hp_ = '';
        }
        var hp = hp_.toUpperCase();
        hp = await new CheckinProses().menghapusCharPetik(hp);

        var keterangan_ = req.body.keterangan;
        if (keterangan_ == '') {
            keterangan_ = '';
        }
        else if (keterangan_ === undefined) {
            keterangan_ = '';
        }
        var keterangan = keterangan_.toUpperCase();
        keterangan = await new CheckinProses().menghapusCharPetik(keterangan);

        var uang_muka_ = req.body.uang_muka;
        if (uang_muka_ == '') {
            uang_muka_ = 0;
        }
        else if (uang_muka_ === undefined) {
            uang_muka_ = 0;
        }
        var uang_muka = parseFloat(uang_muka_);
        var keterangan_payment_uang_muka_ = req.body.keterangan_payment_uang_muka;
        keterangan_payment_uang_muka_ = keterangan_payment_uang_muka_.toUpperCase();
        keterangan_payment_uang_muka_ = await new CheckinProses().menghapusCharPetik(keterangan_payment_uang_muka_);

        var id_payment_uang_muka = parseInt(0);
        var input1_jenis_kartu = req.body.input1_jenis_kartu;
        input1_jenis_kartu = input1_jenis_kartu.toUpperCase();

        var input2_nama = req.body.input2_nama;
        input2_nama = input2_nama.toUpperCase();
        input2_nama = await new CheckinProses().menghapusCharPetik(input2_nama);

        var input3_nomor_kartu = req.body.input3_nomor_kartu;
        var input4_nomor_approval = req.body.input4_nomor_approval;
        var edc_machine = req.body.edc_machine;

        var eventAcara = req.body.event_acara;
        var eventOwner = req.body.event_owner;
        eventAcara = eventAcara.toUpperCase();
        eventAcara = await new CheckinProses().menghapusCharPetik(eventAcara);

        if (keterangan_payment_uang_muka_ == "CASH") {
            id_payment_uang_muka = parseInt(0);
        } else if (keterangan_payment_uang_muka_ == "CREDIT CARD") {
            id_payment_uang_muka = parseInt(1);
        } else if (keterangan_payment_uang_muka_ == "DEBET CARD") {
            id_payment_uang_muka = parseInt(2);
        } else if (keterangan_payment_uang_muka_ == "TRANSFER") {
            id_payment_uang_muka = parseInt(32);
        }

        var check_apakah_sudah_extend;

        if ((voucher != '') && (voucher !== undefined)) {
            isGetCekAktifKondisiVoucher = await new Voucher().getCekAktifKondisiVoucher(db, voucher);
        }
        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);
        if (isgetPengecekanRoomReady != false) {

            jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
            kapasitas_kamar = isgetPengecekanRoomReady.data[0].kapasitas;
            kapasitas_kamar = parseInt(kapasitas_kamar);
            totalDurasiCekinMenit = isgetPengecekanRoomReady.data[0].durasi_checkin;
            totalDurasiCekinMenitRcp = isgetPengecekanRoomReady.data[0].durasi_checkin_rcp;
            kode_rcp = isgetPengecekanRoomReady.data[0].reception;
            kode_ivc = isgetPengecekanRoomReady.data[0].invoice;
            kode_member = isgetPengecekanRoomReady.data[0].kode_member;
            nama_member = isgetPengecekanRoomReady.data[0].nama_member;

            apakah_nomor_member = parseInt(kode_member);

            if (isNaN(apakah_nomor_member) == true) {
                apakah_nomor_member = false;
            }
            else {
                apakah_nomor_member = true;
            }
            check_apakah_sudah_extend = await new CheckinProses().getInfoExtendRoom(db, kode_rcp);
        }

        if (eventAcara.length > 50) {
            console.log(room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Event Acara Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (hp.length > 60) {
            console.log(room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Nomor HP Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (keterangan.length > 60) {
            console.log(room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Keterangan Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if (pax == 0) {
            console.log(room + " Jumlah tamu Tidak Boleh Nol");
            logger.info(room + " Jumlah tamu Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Jumlah tamu Tidak Boleh Nol");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == "1")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah expired");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "2")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sedang digunakan checkin di reception " + isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah digunakan checkin di reception " + isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit < 60)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif waktu penggunaan kurang dari 60 menit, tersisa menit " + isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) &&
            (totalDurasiCekinMenit < 120)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif penggunaan voucher minimal Checkin 2 jam");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_jam_sekarang_voucher_bisa_digunakan == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher baru bisa digunakan mulai jam " + isGetCekAktifKondisiVoucher.data[0].time_start +
                " sampai dengan jam " + isGetCekAktifKondisiVoucher.data[0].time_finish);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher == false)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher tidak terdaftar");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {

                //if (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1) {
                if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                    dataResponse = new ResponseFormat(false, null, room + " Sedang Opr Dibersihkan");
                    res.send(dataResponse);
                }
                else if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                    console.log(room + " Kamar Sudah di Checkin, sisa checkin " + isgetPengecekanRoomReady.data[0].sisa_checkin + " Menit");
                    logger.info(room + " Kamar Sudah di Checkin, sisa checkin " + isgetPengecekanRoomReady.data[0].sisa_checkin + " Menit");

                    shift = await new Shift().getShift(db);
                    date_trans_Query = await new Shift().getDateTransQuery(shift);
                    finalShift = await new Shift().getFinalShift(shift);

                    await new CheckinProses().updateEditIhpRoomCheckIn(db, pax, eventAcara, eventOwner, room);

                    var isprosesQuery = await
                        new CheckinProses().updateIhpRcp(db,
                            kode_rcp,
                            qm1,
                            qm2,
                            qm3,
                            qm4,
                            qf1,
                            qf2,
                            qf3,
                            qf4,
                            pax,
                            hp,
                            id_payment_uang_muka,
                            uang_muka,
                            uang_voucher,
                            keterangan,
                            member_ref);

                    if (isprosesQuery == true) {

                        //pemberian promo checkin utama
                        if (promo_ != '') {
                            for (a = 0; a < promo.length; a++) {
                                promo_ = promo[a];
                                var isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(
                                    db, promo_, totalDurasiCekinMenitRcp, jenis_kamar, kode_rcp);
                                if (isgetPromoRoom.state == true) {
                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(db, promo_, totalDurasiCekinMenitRcp, jenis_kamar, kode_rcp);
                                    }
                                }
                            }
                        }

                        //pemberian room checkin durasi extend
                        if (promo_ != '') {
                            for (a = 0; a < promo.length; a++) {
                                promo_ = promo[a];

                                if (check_apakah_sudah_extend != false) {
                                    for (a = 0; a < check_apakah_sudah_extend.length; a++) {
                                        var isgetPromoRoomExtend = await new PromoRoom().getPromoRoomExtendByJamStartExtendIhpExt(db,
                                            promo_,
                                            check_apakah_sudah_extend.data[a].total_menit_extend,
                                            kode_rcp,
                                            jenis_kamar,
                                            check_apakah_sudah_extend.data[a].start_extend);
                                        if (isgetPromoRoomExtend.state == true) {
                                            if ((isgetPromoRoomExtend.data[0].hasil_start_promo !== null) && (isgetPromoRoomExtend.data[0].hasil_end_promo !== null)) {
                                                await new PromoRoom().getInsertIhpPromoRcpRoomByStartExtendIhpExt(db,
                                                    promo_,
                                                    check_apakah_sudah_extend.data[a].total_menit_extend,
                                                    jenis_kamar,
                                                    kode_rcp,
                                                    check_apakah_sudah_extend.data[a].start_extend);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        //promo food extend
                        if (check_apakah_sudah_extend != false) {
                            var check_apakah_sudah_dapat_promo_rcp_food_extend = await new PromoFood().getPromoRcpFood(db, kode_rcp, 1);
                            if (check_apakah_sudah_dapat_promo_rcp_food_extend != false) {
                                console.log(kode_rcp + " Sudah Di beri Promo Food Extend");
                                logger.info(kode_rcp + " Sudah Di beri Promo Food Extend");
                            } else if (check_apakah_sudah_dapat_promo_rcp_food_extend == false) {
                                if (promo_ != '') {
                                    for (a = 0; a < promo.length; a++) {
                                        promo_ = promo[a];
                                        var isgetPromoFood_extend = await new PromoFood().getPromoFoodMultipleExtendByJamStartExtend(db, promo_, jenis_kamar, room, kode_rcp);
                                        if (isgetPromoFood_extend.state == true) {
                                            if ((isgetPromoFood_extend.data[0].hasil_start_promo !== null) && (isgetPromoFood_extend.data[0].hasil_end_promo !== null)) {
                                                await new PromoFood().getDeleteInsertIhpPromoRcpFoodMultipleExtendRoomByStartExtendIhpExt(db, promo_, jenis_kamar, room, kode_rcp);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        var check_apakah_sudah_dapat_promo_rcp_food = await new PromoFood().getPromoRcpFood(db, kode_rcp, 0);
                        if (check_apakah_sudah_dapat_promo_rcp_food != false) {
                            console.log(kode_rcp + " Sudah Di beri Promo Food");
                            logger.info(kode_rcp + " Sudah Di beri Promo Food");
                        } else if (check_apakah_sudah_dapat_promo_rcp_food == false) {
                            if (promo_ != '') {
                                for (a = 0; a < promo.length; a++) {
                                    promo_ = promo[a];
                                    var status_berlaku_promo;
                                    var isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);
                                    if (isgetPromoFood.state == true) {
                                        if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                            await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);
                                            status_berlaku_promo = await new PromoFood().getRequirementPromoFood(db, promo_);
                                        }
                                        var slip_order_insert = await new CheckinProses().getStatusSolSod(db, kode_rcp);
                                        if (slip_order_insert.state == true) {
                                            if (status_berlaku_promo == true) {

                                                for (a = 0; a < slip_order_insert.data.length; a++) {

                                                    var final_Potongan_Promo = await new PromoFood().getPotonganPromoFood(
                                                        db,
                                                        slip_order_insert.data[a].inventory_price,
                                                        promo_,
                                                        slip_order_insert.data[a].order_inventory,
                                                        slip_order_insert.data[a].order_qty_diterima,
                                                        room,
                                                        jenis_kamar,
                                                        totalDurasiCekinMenit,
                                                        hariKe);
                                                    var final_price_after_potongan = await new PromoFood().getFinalPriceAfterPotonganPromoFood(
                                                        db,
                                                        slip_order_insert.data[a].inventory_price,
                                                        promo_,
                                                        slip_order_insert.data[a].order_inventory,
                                                        slip_order_insert.data[a].order_qty_diterima,
                                                        room,
                                                        jenis_kamar,
                                                        totalDurasiCekinMenit,
                                                        hariKe);
                                                    if (final_Potongan_Promo > 0) {
                                                        await new PromoFood().updateIhpSodAfterEditPromoFood(
                                                            db,
                                                            slip_order_insert.data[a].order_sol,
                                                            slip_order_insert.data[a].order_inventory,
                                                            slip_order_insert.data[a].order_quantity,
                                                            final_price_after_potongan);

                                                        await new PromoFood().insertIhpSodPromoAfterEditPromoFoo(
                                                            db,
                                                            slip_order_insert.data[a].order_sol,
                                                            slip_order_insert.data[a].order_inventory,
                                                            slip_order_insert.data[a].order_quantity,
                                                            final_Potongan_Promo,
                                                            promo_);

                                                        if (slip_order_insert.data[a].order_qty_terkirim > 0) {
                                                            await new PromoFood().updateIhpOkdAfterEditPromoFood(
                                                                db,
                                                                slip_order_insert.data[a].order_sol,
                                                                slip_order_insert.data[a].order_inventory,
                                                                slip_order_insert.data[a].order_qty_terkirim,
                                                                final_price_after_potongan);

                                                            await new PromoFood().insertIhpOkdPromoAfterEditPromoFood(
                                                                db,
                                                                slip_order_insert.data[a].order_sol,
                                                                slip_order_insert.data[a].order_inventory,
                                                                slip_order_insert.data[a].order_qty_terkirim,
                                                                final_Potongan_Promo,
                                                                promo_);
                                                        }

                                                        if (slip_order_insert.data[a].order_qty_cancel > 0) {
                                                            await new PromoFood().updateIhpOcdAfterEditPromoFood(
                                                                db,
                                                                slip_order_insert.data[a].order_sol,
                                                                slip_order_insert.data[a].order_inventory,
                                                                slip_order_insert.data[a].order_qty_cancel,
                                                                final_price_after_potongan);

                                                            await new PromoFood().insertIhpOcdPromoAfterEditPromoFood(
                                                                db,
                                                                slip_order_insert.data[a].order_sol,
                                                                slip_order_insert.data[a].order_inventory,
                                                                slip_order_insert.data[a].order_qty_cancel,
                                                                final_Potongan_Promo,
                                                                promo_);
                                                        }
                                                    }
                                                }
                                                //update OKL
                                                var get_order_penjualan = await new PromoFood().getOrderPenjualanAfterEditPromoFood(db, kode_rcp);
                                                if (get_order_penjualan != false) {
                                                    for (a = 0; a < get_order_penjualan.recordset.length; a++) {
                                                        await new PromoFood().updateIhpOklAfterEditPromoFood(db, get_order_penjualan.recordset[a].order_penjualan);
                                                    }
                                                }

                                                //update OCL
                                                var get_order_cancelation = await new PromoFood().getOrderCancelationAfterEditPromoFood(db, kode_rcp);
                                                if (get_order_cancelation != false) {
                                                    for (a = 0; a < get_order_cancelation.recordset.length; a++) {
                                                        await new PromoFood().updateIhpOclAfterEditPromoFood(db, get_order_cancelation.recordset[a].order_cancelation);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if ((uang_muka > 0) && (keterangan_payment_uang_muka_ == "CREDIT CARD" ||
                            keterangan_payment_uang_muka_ == "DEBET CARD" ||
                            keterangan_payment_uang_muka_ == "TRANSFER")) {
                            await new CheckinProses().deleteIhpUangMukaNonCash(db, kode_rcp);
                            await new CheckinProses().insertIhpUangMukaNonCash(db,
                                kode_rcp,
                                keterangan_payment_uang_muka_,
                                kode_member,
                                nama_member,
                                input1_jenis_kartu,
                                input2_nama,
                                input3_nomor_kartu,
                                input4_nomor_approval,
                                uang_muka,
                                edc_machine);
                        }

                        //mengambil nilai sewa kamar
                        var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                        if (isgetTotalTarifKamarDanOverpax != false) {

                            if (isGetCekAktifKondisiVoucher != false) {
                                if (
                                    (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == 0) &&
                                    (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "1") &&
                                    (isGetCekAktifKondisiVoucher.data[0].status_jam_sekarang_voucher_bisa_digunakan == 1) &&
                                    (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit >= 60)
                                ) {
                                    //free voucher                                                                         
                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                        nilai_uang_voucher = await new Voucher().getTotalNilaiPotonganVoucher(db, kode_rcp, voucher);
                                        uang_voucher = nilai_uang_voucher;
                                        logger.info(kode_rcp + " free voucher uang_voucher " + uang_voucher);
                                    }
                                    //gift voucher
                                    else if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                        uang_voucher = isGetCekAktifKondisiVoucher.data[0].nilai;
                                        logger.info(kode_rcp + "gift voucher uang_voucher " + uang_voucher);
                                    }
                                    await new CheckinProses().updateIhpVcrSedangDipakaiCheckin(db, voucher, 2);
                                }
                            }

                            await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                            var tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                            total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                            await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);

                            charge_overpax = tarif_overpax;

                            //mengambil nilai promo sewa kamar
                            var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);
                            if (isgetTotalPromoRoom != false) {
                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, kode_rcp);
                                total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;

                                console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                            }
                            else {
                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, kode_rcp);
                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, 0);
                            }

                            //mengambil nilai sewa kamar extend
                            var final_charge_overpax;
                            var isgetTotalTarifExtendDanOverpax = await new TarifKamar().getTotalTarifExtendDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                            if (isgetTotalTarifExtendDanOverpax != false) {
                                await new TarifKamar().getDeleteInsertIhpDetailSewaKamarExtend(db, kode_rcp);
                                tarif_overpax_extend_kamar = parseFloat(isgetTotalTarifExtendDanOverpax.overpax);
                                total_tarif_kamar_extend = parseFloat(isgetTotalTarifExtendDanOverpax.sewa_kamar);
                                charge_overpax_extend = tarif_overpax_extend_kamar;
                                await new CheckinProses().updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon(db, total_tarif_kamar_extend, kode_rcp);

                                final_charge_overpax = charge_overpax_extend + charge_overpax;
                                final_charge_overpax = parseFloat(final_charge_overpax);

                                console.log(kode_rcp + " total overpax " + final_charge_overpax);
                                logger.info(kode_rcp + " total overpax " + final_charge_overpax);

                                //mengambil nilai promo sewa kamar extend
                                var isgetTotalPromoRoomExtend = await new PromoRoom().getTotalPromoExtendRoom(db, kode_rcp);
                                if (isgetTotalPromoRoomExtend != false) {
                                    await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, isgetTotalPromoRoomExtend, kode_rcp);
                                    await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom + isgetTotalPromoRoomExtend);
                                    await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamarExtend(db, kode_rcp);
                                    total_tarif_kamar_extend = total_tarif_kamar_extend - isgetTotalPromoRoomExtend;
                                    console.log(kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                    logger.info(kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                }
                                else {
                                    await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, 0, kode_rcp);
                                }
                            }
                            //end extend

                            if (apakah_nomor_member == true) {
                                discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                            }
                            if (apakah_nomor_member == true) {
                                discount_member_kamar_extend = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar_extend);
                            }
                            discount_member_kamar = discount_member_kamar + discount_member_kamar_extend;

                            var isgetNilaiInvoice = await new CheckinProses().getNilaiInvoice(db, kode_rcp, room);
                            if (isgetNilaiInvoice.state == true) {
                                nilai_ivc_sewa_kamar = parseFloat(isgetNilaiInvoice.data[0].sewa_kamar);
                                nilai_ivc_discount_kamar = parseFloat(isgetNilaiInvoice.data[0].discount_kamar);
                                nilai_ivc_surcharge_kamar = parseFloat(isgetNilaiInvoice.data[0].surcharge_kamar);
                                nilai_ivc_total_penjualan = parseFloat(isgetNilaiInvoice.data[0].total_penjualan);
                                nilai_ivc_charge_lain = parseFloat(isgetNilaiInvoice.data[0].charge_lain);
                                nilai_ivc_uang_muka = parseFloat(isgetNilaiInvoice.data[0].uang_muka);
                                nilai_ivc_uang_voucher = parseFloat(isgetNilaiInvoice.data[0].uang_voucher);
                            }

                            var total_sewa_kamar_plus_extend_plus_overpax = (
                                total_tarif_kamar +
                                charge_overpax +
                                total_tarif_kamar_extend +
                                charge_overpax_extend +
                                nilai_ivc_surcharge_kamar
                            ) -
                                nilai_ivc_uang_voucher -
                                discount_member_kamar;

                            console.log(kode_rcp + " total_tarif_kamar+charge_overpax " + total_sewa_kamar_plus_extend_plus_overpax);
                            logger.info(kode_rcp + " total_tarif_kamar+charge_overpax " + total_sewa_kamar_plus_extend_plus_overpax);

                            var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(
                                db,
                                total_sewa_kamar_plus_extend_plus_overpax);

                            if (isgetNilaiServiceRoom != false) {
                                nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                            }

                            var sewa_kamar_plus_service = parseFloat(
                                isgetNilaiServiceRoom +
                                total_sewa_kamar_plus_extend_plus_overpax);

                            var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(
                                db, sewa_kamar_plus_service);
                            if (isgetNilaiPajakRoom != false) {
                                nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                            }

                            var total_kamar_ = parseFloat(
                                total_sewa_kamar_plus_extend_plus_overpax +
                                nilai_service_room +
                                nilai_pajak_room);

                            var total_All_ =
                                total_kamar_ +
                                nilai_ivc_total_penjualan +
                                nilai_ivc_charge_lain;

                            var total_All = total_All_.toFixed(0);

                            total_tarif_kamar = parseFloat(total_tarif_kamar);
                            var total_kamar = parseFloat(
                                total_tarif_kamar +
                                charge_overpax +
                                nilai_service_room +
                                nilai_pajak_room -
                                nilai_uang_voucher -
                                discount_member_kamar);
                            total_kamar = total_kamar.toFixed(0);

                            var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(
                                db,
                                total_tarif_kamar,
                                total_tarif_kamar_extend,
                                final_charge_overpax,
                                discount_member_kamar,
                                nilai_service_room,
                                nilai_pajak_room,
                                total_kamar,
                                total_All,
                                kode_rcp,
                                uang_muka,
                                nilai_uang_voucher);
                            if (isProsesQueryUpdateIhp_ivc != false) {

                                if (nilai_uang_voucher > 0) {
                                    //simpan voucher di ihp_uangVoucher
                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, uang_voucher);
                                        await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, kode_rcp, nilai_uang_voucher);
                                    }
                                }
                                else if (uang_voucher > 0) {
                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                        //simpan gift voucher di ihp_uangVoucher
                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, uang_voucher);
                                    }
                                }

                                await new CheckinProses().updateRecountIhpIvc(db, kode_rcp);
                                await new CheckinProses().updateRecountIhpIvcTotalAll(db, kode_rcp);

                                var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "edit checkin");
                                if (isProsesinsertHistory != false) {
                                    var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                    // TODO : finish proses checkin
                                    logger.info("-> Start " + start + "-> Finish proses edit checkin " + finish + "->");
                                    console.log("-> Start " + start + "-> Finish proses edit checkin " + finish + "->");
                                    var hasil_checkin_room = await new Room().getRoom(db, room);
                                    hasil_checkin_room = hasil_checkin_room.recordset[0];

                                    if (hasil_checkin_room !== false) {
                                        var cetak_slip_checkin_pos = await new ConfigPos().getCetakSlipCheckinDiPos(db);
                                        if (cetak_slip_checkin_pos == 1) {
                                            var client_pos = dgram.createSocket('udp4');
                                            pesan = "PRINT_SLIP_CHECKIN_POINT_OF_SALES_LORONG";
                                            ip_address = req.config.ip_address_pos;
                                            port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal PRINT_SLIP_CHECKIN_POINT_OF_SALES_LORONG to POINT OF SALES " + ip_address);
                                                client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_pos.close();
                                                });
                                            }
                                        }
                                    }

                                    if (hasil_checkin_room !== false) {
                                        var member_client = dgram.createSocket('udp4');
                                        pesan = "UPLOAD_DATA_CHECKIN_RCP_PROMO";
                                        ip_address = await new IpAddressService().getIpAddress(db, "MEMBER CLIENT");
                                        port = await new IpAddressService().getUdpPort(db, "MEMBER CLIENT");
                                        if ((ip_address !== false) && (port !== false)) {
                                            port = port.recordset[0].server_udp_port;
                                            ip_address = ip_address.recordset[0].ip_address;
                                            port = parseInt(port);
                                            panjang_pesan = pesan.length;
                                            panjang_pesan = parseInt(panjang_pesan);
                                            logger.info("Send Sinyal UPLOAD_DATA_CHECKIN_RCP_PROM to MEMBER CLIENT " + ip_address);
                                            member_client.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                member_client.close();
                                            });
                                        }
                                    }
                                    if (hasil_checkin_room !== false) {
                                        var server_udp_room_sign = dgram.createSocket('udp4');
                                        pesan = "Room " + room + " Checkin";
                                        ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                        if ((ip_address !== false)) {
                                            ip_address = ip_address.recordset[0].IP_Address;
                                            port = parseInt(7082);
                                            panjang_pesan = pesan.length;
                                            panjang_pesan = parseInt(panjang_pesan);
                                            logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                            server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                server_udp_room_sign.close();
                                            });
                                        }
                                    }

                                    formResponseData = {
                                        checkin_room: hasil_checkin_room
                                    };
                                    dataResponse = new ResponseFormat(true, formResponseData);
                                    res.send(dataResponse);
                                }
                            }
                        }
                        else {
                            //gagal Checkin RoomHarus di reset
                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                            dataResponse = new ResponseFormat(false, null, room + " gagal isgetTotalTarifKamarDanOverpax");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Kamar Belum Checkin");
                    res.send(dataResponse);
                }
                /* }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Bukan Kamar Untuk Checkin");
                    res.send(dataResponse);
                } */
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

exports.submitDirectCheckInRoomMember = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procDirectCheckInRoomMember(req, res);
};

async function _procDirectCheckInRoomMember(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses checkin " + start);
        console.log("-> Start proses checkin " + start);

        var mbl;
        var nomor_hari;
        var nomor_hari_;
        var date_trans_Query;
        var finalShift;

        var nilai_uang_voucher = parseFloat(0);
        var uang_voucher = parseFloat(0);
        var uang_muka = parseFloat(0);

        var charge_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);

        var kapasitas_kamar = req.body.checkin_room_type.kapasitas;
        var jenis_kamar = req.body.checkin_room_type.jenis_kamar;
        var kamar_untuk_checkin = req.body.checkin_room_type.kamar_untuk_checkin;
        if (kamar_untuk_checkin == false) {
            jenis_kamar = "LOBBY";
            kapasitas_kamar = 0;
        }
        var room = req.body.checkin_room;
        if ((room === undefined) || (room == '')) {
            room = await new Room().getJenisRoomReadyDetail(db, jenis_kamar, kapasitas_kamar);
            if (room != false) {
                room = room.recordset[0].kamar;
            }
        }
        else {
            room = req.body.checkin_room.kamar;
        }
        var kode_member_ = req.body.visitor.member;
        var kode_member = kode_member_.toUpperCase();
        if (kode_member.length >= 16) {
            kode_member = kode_member.substr(0, 14);
        }
        kode_member = await new CheckinProses().menghapusCharPetik(kode_member);
        var kode_member__ = kode_member;
        var apakah_nomor_member = parseInt(kode_member__);

        if (isNaN(apakah_nomor_member) == true) {
            apakah_nomor_member = false;
        }
        else {
            apakah_nomor_member = true;
        }

        var nama_member_ = req.body.visitor.nama_lengkap;
        var nama_member = nama_member_.toUpperCase();
        nama_member = await new CheckinProses().menghapusCharPetik(nama_member);

        var chusr = req.body.chusr;

        var durasi_jam_ = req.body.durasi_jam;
        if (durasi_jam_ === undefined) {
            durasi_jam_ = '0';
        }
        else if (durasi_jam_ == '') {
            durasi_jam_ = '0';
        }
        var durasi_jam = parseInt(durasi_jam_);

        var durasi_menit_ = req.body.durasi_menit;
        if (durasi_menit_ === undefined) {
            durasi_menit_ = '0';
        }
        else if (durasi_menit_ == '') {
            durasi_menit_ = '0';
        }
        var durasi_menit = parseInt(durasi_menit_);

        var totalDurasiCekinMenit = (durasi_jam * 60) + durasi_menit;
        var dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())";
        var pax = parseInt(0);

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);

        if (room == false) {
            dataResponse = new ResponseFormat(false, null, "Jenis Kamar " + jenis_kamar + " kapasitas " + kapasitas_kamar + " orang penuh terpakai semua");
            res.send(dataResponse);
        }
        else if (kode_member == '') {
            console.log(room + " Kode member Tidak Boleh Kosong");
            logger.info(room + " Kode member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Kode member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member == '') {
            console.log(room + " Nama Member Tidak Boleh Kosong");
            logger.info(room + " Nama Member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member.length > 50) {
            console.log(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if ((totalDurasiCekinMenit == 0) && (kamar_untuk_checkin == true)) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Nol");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Nol");
            res.send(dataResponse);
        }
        else if ((totalDurasiCekinMenit > 720) && (kamar_untuk_checkin == true)) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Melebihi 12 Jam");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Melebihi 12 Jam");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Tidak Boleh Melebihi 12 Jam");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {
                jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
                var kapasitas_kamar_ = isgetPengecekanRoomReady.data[0].kapasitas;
                kapasitas_kamar = parseInt(kapasitas_kamar_);

                if (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1) {

                    if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                        if (isgetPengecekanRoomReady.data[0].status_checksound == 1) {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan CheckSound");
                            res.send(dataResponse);
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan Checkin");
                            res.send(dataResponse);
                        }
                    }

                    else if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                        dataResponse = new ResponseFormat(false, null, room + " Sedang Opr Dibersihkan");
                        res.send(dataResponse);
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_kamar_ready_untuk_checkin == 1) {
                        console.log(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");
                        logger.info(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");

                        shift = await new Shift().getShift(db);
                        date_trans_Query = await new Shift().getDateTransQuery(shift);
                        finalShift = await new Shift().getFinalShift(shift);

                        var kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
                        var kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);
                        var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                        var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                        if (apakah_sekarang_malam_besok_libur.state == true) {
                            mbl = '1';
                        }
                        else {
                            mbl = '0';
                        }
                        if ((kode_rcp != false) && (kode_ivc != false)) {
                            var isGetCekReceptionIhp_rcp = await new KodeTransaksi().getCekReceptionIhp_rcp(db, kode_rcp, room);
                            if (isGetCekReceptionIhp_rcp == false) {

                                var isGetCekInvoiceIhp_Ivc = await new KodeTransaksi().getCekInvoiceIhp_Ivc(db, kode_ivc, room);
                                if (isGetCekInvoiceIhp_Ivc == false) {

                                    var isprosesQuery = await
                                        new CheckinProses().insertIhpRcp(db,
                                            kode_rcp,
                                            finalShift,
                                            kode_member,
                                            nama_member,
                                            room,
                                            durasi_jam,
                                            durasi_menit,
                                            dateTambahan,
                                            0,
                                            0,
                                            0,
                                            0,
                                            0,
                                            0,
                                            0,
                                            0,
                                            0,
                                            "",
                                            0,
                                            0,
                                            0,
                                            chusr,
                                            mbl,
                                            "1",
                                            kode_ivc,
                                            "",
                                            date_trans_Query,
                                            "1",
                                            "-1",
                                            "");
                                    if (isprosesQuery == true) {
                                        isprosesQuery = await new CheckinProses().insertIhpIvc(db,
                                            kode_ivc,
                                            finalShift,
                                            kode_rcp,
                                            kode_member,
                                            nama_member,
                                            room,
                                            0,
                                            "",
                                            chusr,
                                            date_trans_Query,
                                            jenis_kamar);
                                        if (isprosesQuery == true) {

                                            await new CheckinProses().updateInvoiceIhpRcp(db, kode_ivc, kode_rcp, room);

                                            isprosesQuery = await new CheckinProses().insertIhpRoomCheckin(db, room, kode_rcp);
                                            if (isprosesQuery == true) {

                                                isprosesQuery = await new CheckinProses().updateIhpRoomCheckIn(db, kode_rcp, nama_member, pax, dateTambahan, "", room);
                                                if (isprosesQuery == true) {

                                                    var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                    if (isDeleteIHP_Rcp_DetailsRoomQuery != false) {

                                                        var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                                                        if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                                            if (apakah_sekarang_malam_besok_libur.state == true) {
                                                                nomor_hari = '8';
                                                            }
                                                            else if (apakah_sekarang_tanggal_libur.state == true) {
                                                                nomor_hari = '9';
                                                            }
                                                            else {
                                                                nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                                            }
                                                            console.log(kode_rcp + " nomor hari " + nomor_hari);
                                                            logger.info(kode_rcp + " nomor hari " + nomor_hari);

                                                            nomor_hari_ = parseInt(nomor_hari);
                                                            var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                                            var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                                            var isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                            if (isGetTarifPerjamRoom.state == true) {
                                                                for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                    var overpax_tarif = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                    var kamar_tarif = parseFloat(isGetTarifPerjamRoom.data[a].tarif);

                                                                    await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                        nomor_hari_, overpax_tarif, kamar_tarif,
                                                                        isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                }
                                                            }

                                                            //cek validitas ihp_rcp_details_room
                                                            var cek_valid_insert_ihp_rcp_details_room = await new CheckinProses().getCekValidIHPRcpDetailsRoom(db, kode_rcp);
                                                            if (cek_valid_insert_ihp_rcp_details_room == false) {
                                                                await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                                isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                                if (isGetTarifPerjamRoom.state == true) {
                                                                    for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                        var overpax_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                        var kamar_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].tarif);

                                                                        await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                            nomor_hari_, overpax_tarif_, kamar_tarif_,
                                                                            isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                    }
                                                                }
                                                            }

                                                            if (isGetTarifPerjamRoom.state == true) {
                                                                var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                                                if (isgetTotalTarifKamarDanOverpax != false) {
                                                                    await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                                                                    var tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                                                                    var total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                                                                    await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);

                                                                    charge_overpax = tarif_overpax;

                                                                    var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);
                                                                    if (isgetTotalPromoRoom != false) {
                                                                        await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                                                        await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                                                        await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, kode_rcp);
                                                                        total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;
                                                                        console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                        logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                    }

                                                                    if (apakah_nomor_member == true) {
                                                                        discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                    }

                                                                    var kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                    console.log(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                    logger.info(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);


                                                                    var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(
                                                                        db, total_tarif_kamar + charge_overpax - nilai_uang_voucher - discount_member_kamar);
                                                                    if (isgetNilaiServiceRoom != false) {
                                                                        nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                                                                    }

                                                                    var sewa_kamar_plus_service = parseFloat(
                                                                        isgetNilaiServiceRoom + total_tarif_kamar + charge_overpax -
                                                                        nilai_uang_voucher - discount_member_kamar);

                                                                    var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(db, sewa_kamar_plus_service);

                                                                    if (isgetNilaiPajakRoom != false) {
                                                                        nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                                                                    }

                                                                    total_tarif_kamar = parseFloat(total_tarif_kamar);
                                                                    var total_kamar = parseFloat(total_tarif_kamar +
                                                                        charge_overpax +
                                                                        nilai_service_room +
                                                                        nilai_pajak_room -
                                                                        nilai_uang_voucher -
                                                                        discount_member_kamar);
                                                                    total_kamar = total_kamar.toFixed(0);

                                                                    var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(db,
                                                                        total_tarif_kamar, 0, charge_overpax, discount_member_kamar,
                                                                        nilai_service_room, nilai_pajak_room,
                                                                        total_kamar, total_kamar, kode_rcp, uang_muka, uang_voucher);
                                                                    if (isProsesQueryUpdateIhp_ivc != false) {

                                                                        var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "checkin");
                                                                        var hasil_checkin_room = await new Room().getRoom(db, room);
                                                                        hasil_checkin_room = hasil_checkin_room.recordset[0];
                                                                        //otp checkin
                                                                        //var otp_generated=await new CheckinProses().submitOtp( db, kode_rcp,kode_member,nama_member, room);

                                                                        if (hasil_checkin_room !== false) {
                                                                            var client_pos = dgram.createSocket('udp4');
                                                                            pesan = "FRONT_OFFICE_ROOM_CHECKIN";
                                                                            ip_address = req.config.ip_address_pos;
                                                                            port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                                                            if ((ip_address !== false) && (port !== false)) {
                                                                                port = port.recordset[0].server_udp_port;
                                                                                port = parseInt(port);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal FRONT_OFFICE_ROOM_CHECKIN to POINT OF SALES " + ip_address);
                                                                                client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    client_pos.close();
                                                                                });
                                                                            }
                                                                        }

                                                                        if (hasil_checkin_room !== false) {
                                                                            var client_timer_vod2b = dgram.createSocket('udp4');
                                                                            pesan = "Room " + room + " Checkin";
                                                                            ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                                                            port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                                                            if ((ip_address !== false) && (port !== false)) {
                                                                                port = port.recordset[0].server_udp_port;
                                                                                ip_address = ip_address.recordset[0].ip_address;
                                                                                port = parseInt(port);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B " + ip_address);
                                                                                client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    client_timer_vod2b.close();
                                                                                });
                                                                            }
                                                                        }

                                                                        if (hasil_checkin_room !== false) {
                                                                            var server_udp_room_sign = dgram.createSocket('udp4');
                                                                            pesan = "Room " + room + " Checkin";
                                                                            ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                                                            if ((ip_address !== false)) {
                                                                                ip_address = ip_address.recordset[0].IP_Address;
                                                                                port = parseInt(7082);
                                                                                panjang_pesan = pesan.length;
                                                                                panjang_pesan = parseInt(panjang_pesan);
                                                                                logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                                                                server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                    server_udp_room_sign.close();
                                                                                });
                                                                            }
                                                                        }


                                                                        if (isProsesinsertHistory != false) {
                                                                            var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                                            // TODO : finish proses checkin
                                                                            logger.info("-> Start " + start + "-> Finish proses checkin " + finish + "->");
                                                                            console.log("-> Start " + start + "-> Finish proses checkin " + finish + "->");

                                                                            formResponseData = {
                                                                                //otp_generated:otp_generated,
                                                                                checkin_room_type: req.body.checkin_room_type,
                                                                                visitor: req.body.visitor,
                                                                                chusr: req.body.chusr,
                                                                                durasi_jam: req.body.durasi_jam,
                                                                                durasi_menit: req.body.durasi_menit,
                                                                                checkin_room: hasil_checkin_room
                                                                            };
                                                                            dataResponse = new ResponseFormat(true, formResponseData);
                                                                            res.send(dataResponse);
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    //gagal Checkin RoomHarus di reset
                                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                    dataResponse = new ResponseFormat(false, null, room + " gagal isgetTotalTarifKamarDanOverpax");
                                                                    res.send(dataResponse);
                                                                }
                                                            }
                                                            else {
                                                                //gagal Checkin RoomHarus di reset
                                                                await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                dataResponse = new ResponseFormat(false, null, room + " gagal isGetTarifPerjamRoom");
                                                                res.send(dataResponse);
                                                            }
                                                        }
                                                        else {
                                                            //gagal Checkin RoomHarus di reset
                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                            dataResponse = new ResponseFormat(false, null, room + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                                            res.send(dataResponse);
                                                        }
                                                    }
                                                    else {
                                                        //gagal Checkin RoomHarus di reset
                                                        await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                        dataResponse = new ResponseFormat(false, null, room + " gagal Delete From IHP_Rcp_DetailsRoom");
                                                        res.send(dataResponse);
                                                    }
                                                }
                                                else {
                                                    //gagal Checkin RoomHarus di reset
                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery reset checkOutRoomQuery");
                                                    res.send(dataResponse);
                                                }
                                            }
                                            else {
                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RoomCheckinQuery");
                                                res.send(dataResponse);
                                            }
                                        }
                                        else {
                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                            dataResponse = new ResponseFormat(false, null, kode_ivc + " gagal isprosesQuery insertIHP_IvcQuery");
                                            res.send(dataResponse);
                                        }
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_ivc + " sudah pernah dipakai ");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, kode_rcp + " sudah pernah dipakai ");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal get kode_rcp kode_ivc ");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, room + " Kamar Tidak Ready Checkin");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Bukan Kamar Untuk Checkin");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.submitDirectCheckInLobbyMember = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procDirectCheckInLobbyMember(req, res);
};

async function _procDirectCheckInLobbyMember(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses checkin " + start);
        console.log("-> Start proses checkin " + start);

        var mbl;
        var nomor_hari;
        var date_trans_Query;
        var finalShift;

        var nilai_uang_voucher = parseFloat(0);
        var uang_voucher = parseFloat(0);
        var uang_muka = parseFloat(0);
        var charge_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);

        var kapasitas_kamar = 1;
        //var jenis_kamar = req.body.checkin_room_type.jenis_kamar;
        var jenis_kamar = req.body.checkin_room.jenis_kamar;

        var kamar_untuk_checkin = req.body.checkin_room_type.kamar_untuk_checkin;
        if (kamar_untuk_checkin == false) {
            jenis_kamar = "LOBBY";
            kapasitas_kamar = 1;
        }
        /*var room = req.body.checkin_room_type.room;
        if ((room === undefined) || (room == '')) {
            room = await new Room().getJenisRoomReadyDetail(db, jenis_kamar, kapasitas_kamar);
            if (room != false) {
                room = room.recordset[0].kamar;
            }
        }
        else {
            room = req.body.checkin_room.kamar;
        }*/

        room = req.body.checkin_room.kamar;

        var promo_ = req.body.promo;

        var status_promo;
        if (promo_ == '') {
            promo_ = '';
            status_promo = '1';
        }
        else if (promo_ === undefined) {
            promo_ = '';
            status_promo = '1';
        }
        if (promo_ != '') {
            promo = promo_;
            status_promo = '2';
        }

        var kode_member_ = req.body.visitor.member;
        var kode_member = kode_member_.toUpperCase();
        if (kode_member.length >= 16) {
            kode_member = kode_member.substr(0, 14);
        }
        kode_member = await new CheckinProses().menghapusCharPetik(kode_member);
        var kode_member__ = kode_member;
        var apakah_nomor_member = parseInt(kode_member__);

        if (isNaN(apakah_nomor_member) == true) {
            apakah_nomor_member = false;
        }
        else {
            apakah_nomor_member = true;
        }

        var nama_member_ = req.body.visitor.nama_lengkap;
        var nama_member = nama_member_.toUpperCase();
        nama_member = await new CheckinProses().menghapusCharPetik(nama_member);

        var chusr = req.body.chusr;

        var durasi_jam_ = req.body.durasi_jam;
        if (durasi_jam_ === undefined) {
            durasi_jam_ = '0';
        }
        else if (durasi_jam_ == '') {
            durasi_jam_ = '0';
        }
        var durasi_jam = parseInt(durasi_jam_);

        var durasi_menit_ = req.body.durasi_menit;
        if (durasi_menit_ === undefined) {
            durasi_menit_ = '0';
        }
        else if (durasi_menit_ == '') {
            durasi_menit_ = '0';
        }
        var durasi_menit = parseInt(durasi_menit_);

        var totalDurasiCekinMenit = 0;
        var dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())";
        var pax = parseInt(0);

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);

        if (room == false) {
            dataResponse = new ResponseFormat(false, null, "Jenis Kamar " + jenis_kamar + " kapasitas " + kapasitas_kamar + " orang penuh terpakai semua");
            res.send(dataResponse);
        }
        else if (kode_member == '') {
            console.log(room + " Kode member Tidak Boleh Kosong");
            logger.info(room + " Kode member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Kode member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member == '') {
            console.log(room + " Nama Member Tidak Boleh Kosong");
            logger.info(room + " Nama Member Tidak Boleh Kosong");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Kosong");
            res.send(dataResponse);
        }
        else if (nama_member.length > 50) {
            console.log(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            logger.info(room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            dataResponse = new ResponseFormat(false, null, room + " Nama Member Tidak Boleh Lebih dari 50 huruf");
            res.send(dataResponse);
        }
        else if ((totalDurasiCekinMenit == 0) && (kamar_untuk_checkin == true)) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Nol");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Nol");
            res.send(dataResponse);
        }
        else if ((totalDurasiCekinMenit > 360) && (kamar_untuk_checkin == true)) {
            console.log(room + " Durasi Jam / Menit Tidak Boleh Melebihi 6 Jam");
            logger.info(room + " Durasi Jam / Menit Tidak Boleh Melebihi 6 Jam");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Tidak Boleh Melebihi 6 Jam");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {
                jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
                var kapasitas_kamar_ = isgetPengecekanRoomReady.data[0].kapasitas;
                kapasitas_kamar = parseInt(kapasitas_kamar_);

                if ((isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 0) ||
                    (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1)) {
                    console.log(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");
                    logger.info(room + " Ready untuk Checkin, Durasi checkin " + totalDurasiCekinMenit + " Menit");

                    shift = await new Shift().getShift(db);
                    date_trans_Query = await new Shift().getDateTransQuery(shift);
                    finalShift = await new Shift().getFinalShift(shift);

                    var kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
                    var kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);
                    var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                    var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                    if (apakah_sekarang_malam_besok_libur.state == true) {
                        mbl = '1';
                    }
                    else {
                        mbl = '0';
                    }
                    if ((kode_rcp != false) && (kode_ivc != false)) {
                        var isGetCekReceptionIhp_rcp = await new KodeTransaksi().getCekReceptionIhp_rcp(db, kode_rcp, room);
                        if (isGetCekReceptionIhp_rcp == false) {

                            var isGetCekInvoiceIhp_Ivc = await new KodeTransaksi().getCekInvoiceIhp_Ivc(db, kode_ivc, room);
                            if (isGetCekInvoiceIhp_Ivc == false) {

                                var isprosesQuery = await
                                    new CheckinProses().insertIhpRcp(db,
                                        kode_rcp,
                                        finalShift,
                                        kode_member,
                                        nama_member,
                                        room,
                                        durasi_jam,
                                        durasi_menit,
                                        dateTambahan,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        "",
                                        0,
                                        0,
                                        0,
                                        chusr,
                                        mbl,
                                        "1",
                                        kode_ivc,
                                        "",
                                        date_trans_Query,
                                        "1",
                                        "-1",
                                        "");
                                if (isprosesQuery == true) {
                                    isprosesQuery = await new CheckinProses().insertIhpIvc(db,
                                        kode_ivc,
                                        finalShift,
                                        kode_rcp,
                                        kode_member,
                                        nama_member,
                                        room,
                                        0,
                                        "",
                                        chusr,
                                        date_trans_Query,
                                        jenis_kamar);
                                    if (isprosesQuery == true) {

                                        await new CheckinProses().updateInvoiceIhpRcp(db, kode_ivc, kode_rcp, room);

                                        isprosesQuery = await new CheckinProses().insertIhpRoomCheckin(db, room, kode_rcp);
                                        if (isprosesQuery == true) {

                                            isprosesQuery = await new CheckinProses().updateIhpRoomCheckIn(db, kode_rcp, nama_member, pax, dateTambahan, "", room);
                                            if (isprosesQuery == true) {

                                                var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                if (isDeleteIHP_Rcp_DetailsRoomQuery != false) {

                                                    var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                                                    if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                                        if (apakah_sekarang_malam_besok_libur.state == true) {
                                                            nomor_hari = '8';
                                                        }
                                                        else if (apakah_sekarang_tanggal_libur.state == true) {
                                                            nomor_hari = '9';
                                                        }
                                                        else {
                                                            nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                                        }
                                                        console.log(kode_rcp + " nomor hari " + nomor_hari);
                                                        logger.info(kode_rcp + " nomor hari " + nomor_hari);

                                                        nomor_hari_ = parseInt(nomor_hari);
                                                        var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                                        var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                                        if (promo_ != '') {
                                                            for (a = 0; a < promo.length; a++) {
                                                                promo_ = promo[a];
                                                                var isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                if (isgetPromoFood.state == true) {
                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                    }
                                                                }
                                                            }
                                                        }

                                                        /*var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(db,
                                                            total_tarif_kamar, 0, charge_overpax, discount_member_kamar,
                                                            nilai_service_room, nilai_pajak_room,
                                                            total_kamar, total_kamar, kode_rcp, uang_muka, uang_voucher);*/
                                                        var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                            db,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        );
                                                        if (isProsesQueryUpdateIhp_ivc != false) {

                                                            var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "checkin");
                                                            var hasil_checkin_room = await new Room().getRoom(db, room);
                                                            hasil_checkin_room = hasil_checkin_room.recordset[0];
                                                            //otp checkin
                                                            //var otp_generated=await new CheckinProses().submitOtp( db, kode_rcp,kode_member,nama_member, room);

                                                            if (hasil_checkin_room !== false) {
                                                                var client_pos = dgram.createSocket('udp4');
                                                                pesan = "FRONT_OFFICE_ROOM_CHECKIN";
                                                                ip_address = req.config.ip_address_pos;
                                                                port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                                                if ((ip_address !== false) && (port !== false)) {
                                                                    port = port.recordset[0].server_udp_port;
                                                                    port = parseInt(port);
                                                                    panjang_pesan = pesan.length;
                                                                    panjang_pesan = parseInt(panjang_pesan);
                                                                    logger.info("Send Sinyal FRONT_OFFICE_ROOM_CHECKIN to POINT OF SALES");
                                                                    client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                        client_pos.close();
                                                                    });
                                                                }
                                                            }

                                                            if (hasil_checkin_room !== false) {
                                                                var client_timer_vod2b = dgram.createSocket('udp4');
                                                                pesan = "Lobby " + room + " Checkin";
                                                                ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                                                port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                                                if ((ip_address !== false) && (port !== false)) {
                                                                    port = port.recordset[0].server_udp_port;
                                                                    ip_address = ip_address.recordset[0].ip_address;
                                                                    port = parseInt(port);
                                                                    panjang_pesan = pesan.length;
                                                                    panjang_pesan = parseInt(panjang_pesan);
                                                                    logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B");
                                                                    client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                        client_timer_vod2b.close();
                                                                    });
                                                                }
                                                            }

                                                            if (isProsesinsertHistory != false) {
                                                                var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                                // TODO : finish proses checkin
                                                                logger.info("-> Start " + start + "-> Finish proses checkin " + finish + "->");
                                                                console.log("-> Start " + start + "-> Finish proses checkin " + finish + "->");

                                                                formResponseData = {
                                                                    //otp_generated:otp_generated,
                                                                    checkin_room_type: req.body.checkin_room_type,
                                                                    visitor: req.body.visitor,
                                                                    chusr: req.body.chusr,
                                                                    durasi_jam: req.body.durasi_jam,
                                                                    durasi_menit: req.body.durasi_menit,
                                                                    checkin_room: hasil_checkin_room
                                                                };
                                                                dataResponse = new ResponseFormat(true, formResponseData);
                                                                res.send(dataResponse);
                                                            }
                                                        }

                                                    }
                                                    else {
                                                        //gagal Checkin RoomHarus di reset
                                                        await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                        dataResponse = new ResponseFormat(false, null, room + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                                        res.send(dataResponse);
                                                    }
                                                }
                                                else {
                                                    //gagal Checkin RoomHarus di reset
                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                    dataResponse = new ResponseFormat(false, null, room + " gagal Delete From IHP_Rcp_DetailsRoom");
                                                    res.send(dataResponse);
                                                }
                                            }
                                            else {
                                                //gagal Checkin RoomHarus di reset
                                                await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery reset checkOutRoomQuery");
                                                res.send(dataResponse);
                                            }
                                        }
                                        else {
                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RoomCheckinQuery");
                                            res.send(dataResponse);
                                        }
                                    }
                                    else {
                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                        dataResponse = new ResponseFormat(false, null, kode_ivc + " gagal isprosesQuery insertIHP_IvcQuery");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, kode_ivc + " sudah pernah dipakai ");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, kode_rcp + " sudah pernah dipakai ");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal get kode_rcp kode_ivc ");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + "Kamar Untuk Checkin");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.submitExtendRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procExtendRoom(req, res);
};

async function _procExtendRoom(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses extend " + start);
        console.log("-> Start proses extend " + start);

        var date_trans_Query;
        var status_promo;
        var kode_member;
        var apakah_nomor_member;
        var nomor_hari;
        var nomor_hari_;
        var kapasitas_kamar;
        var kode_rcp;
        var kode_ivc;
        var pax;

        var total_tarif_kamar_extend = parseFloat(0);
        var tarif_overpax_extend_kamar = parseFloat(0);
        var charge_overpax_extend = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var discount_member_kamar_extend = parseFloat(0);
        var nilai_ivc_sewa_kamar = parseFloat(0);
        var nilai_ivc_surcharge_kamar = parseFloat(0);
        var nilai_ivc_total_penjualan = parseFloat(0);
        var nilai_ivc_charge_lain = parseFloat(0);
        var nilai_ivc_uang_muka = parseFloat(0);
        var nilai_ivc_uang_voucher = parseFloat(0);

        var room = req.body.room;
        var chusr = req.body.chusr;
        var durasi_jam_ = req.body.durasi_jam;
        var durasi_jam = parseInt(durasi_jam_);
        var durasi_menit_ = req.body.durasi_menit;
        var durasi_menit = parseInt(durasi_menit_);
        var totalDurasiCekinMenit = (durasi_jam * 60) + durasi_menit;
        var totalDurasiCekinMenitRcp;
        var dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())";

        var check_apakah_sudah_dapat_promo_rcp_room;
        var check_apakah_sudah_dapat_promo_rcp_room_extend;

        var promo_ = req.body.promo;
        var promo = req.body.promo;
        if (promo_ == '') {
            promo_ = '';
            status_promo = '1';
        }
        else if (promo_ === undefined) {
            promo_ = '';
            status_promo = '1';
        }
        if (promo_ != '') {
            promo = promo_;
            status_promo = '2';
        }

        shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);

        var check_apakah_sudah_extend;

        if (isgetPengecekanRoomReady != false) {
            jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
            kapasitas_kamar = isgetPengecekanRoomReady.data[0].kapasitas;
            kode_rcp = isgetPengecekanRoomReady.data[0].reception;
            kode_ivc = isgetPengecekanRoomReady.data[0].invoice;
            kapasitas_kamar = parseInt(kapasitas_kamar);
            kode_member = isgetPengecekanRoomReady.data[0].kode_member;
            totalDurasiCekinMenitRcp = isgetPengecekanRoomReady.data[0].durasi_checkin_rcp;
            apakah_nomor_member = parseInt(kode_member);

            if (isNaN(apakah_nomor_member) == true) {
                apakah_nomor_member = false;
            }
            else {
                apakah_nomor_member = true;
            }

            check_apakah_sudah_extend = await new CheckinProses().getInfoExtendRoom(db, kode_rcp);
            check_apakah_sudah_dapat_promo_rcp_room = await new PromoRoom().getPromoRcpRoom(db, kode_rcp, 0);
            check_apakah_sudah_dapat_promo_rcp_room_extend = await new PromoRoom().getPromoRcpRoom(db, kode_rcp, 1);

        }
        if ((isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == true) && (isgetPengecekanRoomReady.data[0].jumlah_tamu == 0)) {
            console.log(room + " Data kamar informasi checkin belum di lengkapi");
            logger.info(room + " Data kamar informasi checkin belum di lengkapi");
            dataResponse = new ResponseFormat(false, null, room + " Data kamar informasi checkin belum di lengkapi");
            res.send(dataResponse);
        }
        else if (totalDurasiCekinMenit == 0) {
            console.log(room + " Durasi Jam / Menit Extend Tidak Boleh Nol");
            logger.info(room + " Durasi Jam / Menit Extend Tidak Boleh Nol");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Nol");
            res.send(dataResponse);
        }
        else if (totalDurasiCekinMenit > 360) {
            console.log(room + " Durasi Jam / Menit Extend Tidak Boleh Melebihi 6 Jam");
            logger.info(room + " Durasi Jam / Menit Extend Tidak Boleh Melebihi 6 Jam");
            dataResponse = new ResponseFormat(false, null, room + " Durasi Jam / Menit Tidak Boleh Melebihi 6 Jam");
            res.send(dataResponse);
        }
        else if (isgetPengecekanRoomReady != false) {

            if (isgetPengecekanRoomReady.data[0].sisa_checkin < 0) {
                dataResponse = new ResponseFormat(false, null, room + "  Kamar Durasi Checkin Sudah habis");
                res.send(dataResponse);
            }
            else if (isgetPengecekanRoomReady.data[0].status_terbayar == 1) {
                dataResponse = new ResponseFormat(false, null, room + "  Tagihan kamar Sudah dibayar");
                res.send(dataResponse);
            }
            else if (isgetPengecekanRoomReady.data[0].status_checkin == 0) {
                dataResponse = new ResponseFormat(false, null, room + " Belum di Checkin");
                res.send(dataResponse);
            }
            else if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                dataResponse = new ResponseFormat(false, null, room + "  Kamar sudah di checkout");
                res.send(dataResponse);
            }
            else if (isgetPengecekanRoomReady.data[0].sisa_checkin > 0) {
                console.log(room + " Ready untuk Extend, Durasi Extend " + totalDurasiCekinMenit + " Menit");
                logger.info(room + " Ready untuk  Extend, Durasi Extend " + totalDurasiCekinMenit + " Menit");

                dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",'" + isgetPengecekanRoomReady.data[0].jam_checkout_ + "')";
                var isprosesQueryInsertIHP_Ext = await
                    new CheckinProses().insertIhpExt(db, kode_rcp, durasi_jam, durasi_menit, chusr, date_trans_Query, status_promo,
                        isgetPengecekanRoomReady.data[0].jam_checkout_, dateTambahan);
                if (isprosesQueryInsertIHP_Ext != false) {

                    var isgetJamCheckoutExtend = await new CheckinProses().getJamCheckoutExtend(db, kode_rcp);
                    if (isgetJamCheckoutExtend.state == true) {
                        pax = isgetJamCheckoutExtend.data[0].jumlah_tamu;
                        pax = parseInt(pax);

                        var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                        var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                        if (apakah_sekarang_malam_besok_libur.state == true) {
                            mbl = '1';
                        }
                        else {
                            mbl = '0';
                        }

                        var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                        if (isDeleteIHP_Rcp_DetailsRoomQuery == true) {
                            var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                            if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                if (apakah_sekarang_malam_besok_libur.state == true) {
                                    nomor_hari = '8';
                                }
                                else if (apakah_sekarang_tanggal_libur.state == true) {
                                    nomor_hari = '9';
                                }
                                else {
                                    nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                }

                                nomor_hari_ = parseInt(nomor_hari);
                                var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                var isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                if (isGetTarifPerjamRoom.state == true) {
                                    for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                        var overpax_tarif = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                        var kamar_tarif = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                        await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                            nomor_hari_, overpax_tarif, kamar_tarif,
                                            isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                    }
                                }

                                //cek validitas ihp_rcp_details_room
                                var cek_valid_insert_ihp_rcp_details_room = await new CheckinProses().getCekValidIHPRcpDetailsRoom(db, kode_rcp);
                                if (cek_valid_insert_ihp_rcp_details_room == false) {
                                    await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                    isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                    if (isGetTarifPerjamRoom.state == true) {
                                        for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                            var overpax_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                            var kamar_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                            await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                nomor_hari_, overpax_tarif_, kamar_tarif_,
                                                isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                        }
                                    }
                                }

                                //Pemberian Promo untuk masing masing checkin dan extend
                                if (isGetTarifPerjamRoom.state == true) {
                                    //Pemberian promo extend yang sedang dilakukan
                                    if (promo_ != '') {
                                        for (a = 0; a < promo.length; a++) {
                                            promo_ = promo[a];
                                            var isgetPromoFood = await new PromoFood().getPromoFoodExtendByJamCheckoutIhpRoom(db, promo_, totalDurasiCekinMenit, kode_rcp, jenis_kamar, room);
                                            if (isgetPromoFood.state == true) {
                                                if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                    await new PromoFood().getInsertIhpPromoRcpFoodExtendRoomByIhpRoomCheckout(db, promo_, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);
                                                }
                                            }
                                        }
                                    }

                                    var isgetPromoRoom;
                                    //jika saat extend checkin utama sudah di promo
                                    if (check_apakah_sudah_dapat_promo_rcp_room != false) {
                                        promo_ = check_apakah_sudah_dapat_promo_rcp_room.data[0].promo;
                                        isgetPromoRoom = await new PromoRoom().getPromoRoomExtendByJamCheckoutIhpRoom(db, promo_, totalDurasiCekinMenit, kode_rcp, jenis_kamar);
                                        if (isgetPromoRoom.state == true) {
                                            if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                await new PromoRoom().getInsertIhpPromoRcpRoomByJamCheckoutIhpRoom(db, promo_, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                            }
                                        }
                                    } else {

                                        //Pemberian promo extend dilakukan saat extend
                                        if (promo_ != '') {

                                            for (a = 0; a < promo.length; a++) {
                                                promo_ = promo[a];
                                                isgetPromoRoom = await new PromoRoom().getPromoRoomExtendByJamCheckoutIhpRoom(db, promo_, totalDurasiCekinMenit, kode_rcp, jenis_kamar);
                                                if (isgetPromoRoom.state == true) {
                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                        await new PromoRoom().getInsertIhpPromoRcpRoomByJamCheckoutIhpRoom(db, promo_, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                    }
                                                }
                                            }

                                            //Pemberian promo extend dilakukan saat extend
                                            //dan jika saat extend checkin utama belum di beri promo
                                            if (check_apakah_sudah_dapat_promo_rcp_room == false) {
                                                //promo checkin utama
                                                if (promo_ != '') {
                                                    for (a = 0; a < promo.length; a++) {
                                                        promo_ = promo[a];
                                                        isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(
                                                            db, promo_, totalDurasiCekinMenitRcp, jenis_kamar, kode_rcp);
                                                        if (isgetPromoRoom.state == true) {
                                                            if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(db, promo_, totalDurasiCekinMenitRcp, jenis_kamar, kode_rcp);
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            //Pemberian promo extend dilakukan saat extend
                                            //dan jika saat extend, extend sebelum nya tidak di beri promo
                                            if (check_apakah_sudah_dapat_promo_rcp_room_extend == false) {
                                                if (promo_ != '') {
                                                    for (a = 0; a < promo.length; a++) {
                                                        promo_ = promo[a];

                                                        if (check_apakah_sudah_extend != false) {
                                                            for (a = 0; a < check_apakah_sudah_extend.length; a++) {
                                                                var isgetPromoRoomExtend = await new PromoRoom().getPromoRoomExtendByJamStartExtendIhpExt(db,
                                                                    promo_,
                                                                    check_apakah_sudah_extend.data[a].total_menit_extend,
                                                                    kode_rcp,
                                                                    jenis_kamar,
                                                                    check_apakah_sudah_extend.data[a].start_extend);
                                                                if (isgetPromoRoomExtend.state == true) {
                                                                    if ((isgetPromoRoomExtend.data[0].hasil_start_promo !== null) && (isgetPromoRoomExtend.data[0].hasil_end_promo !== null)) {
                                                                        await new PromoRoom().getInsertIhpPromoRcpRoomByStartExtendIhpExt(db,
                                                                            promo_,
                                                                            check_apakah_sudah_extend.data[a].total_menit_extend,
                                                                            jenis_kamar,
                                                                            kode_rcp,
                                                                            check_apakah_sudah_extend.data[a].start_extend);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    var isprosesQueryUpdateExtend = await new CheckinProses().updateIhpRoomExtend(db, kode_rcp, room, isgetJamCheckoutExtend.data[0].checkout_ditambah_extend);
                                    if (isprosesQueryUpdateExtend == false) {
                                        dataResponse = new ResponseFormat(false, null, room + " Gagal isprosesQueryUpdateExtend");
                                        res.send(dataResponse);
                                    }
                                    //menghitung sewa kamar utama
                                    var charge_overpax = parseFloat(0);
                                    var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                    if (isgetTotalTarifKamarDanOverpax != false) {
                                        await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                                        var tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                                        total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                                        await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);
                                        charge_overpax = tarif_overpax;
                                    }

                                    //menghitung promo sewa kamar utama
                                    var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);

                                    if (isgetTotalPromoRoom != false) {
                                        await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                        await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                        total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;
                                        console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                        logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                    }
                                    if (apakah_nomor_member == true) {
                                        discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                    }

                                    //menghitung sewa kamar extend 
                                    var isgetTotalTarifExtendDanOverpax = await new TarifKamar().getTotalTarifExtendDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                    if (isgetTotalTarifExtendDanOverpax != false) {
                                        await new TarifKamar().getDeleteInsertIhpDetailSewaKamarExtend(db, kode_rcp);
                                        tarif_overpax_extend_kamar = parseFloat(isgetTotalTarifExtendDanOverpax.overpax);
                                        total_tarif_kamar_extend = parseFloat(isgetTotalTarifExtendDanOverpax.sewa_kamar);
                                        charge_overpax_extend = tarif_overpax_extend_kamar;
                                        await new CheckinProses().updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon(db, total_tarif_kamar_extend, kode_rcp);

                                        var final_charge_overpax = charge_overpax_extend + charge_overpax;
                                        console.log(kode_rcp + " total overpax " + final_charge_overpax);
                                        logger.info(kode_rcp + " total overpax " + final_charge_overpax);

                                        //menghitung promo sewa kamar extend 
                                        var isgetTotalPromoRoomExtend = await new PromoRoom().getTotalPromoExtendRoom(db, kode_rcp);
                                        if (isgetTotalPromoRoomExtend != false) {
                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, isgetTotalPromoRoomExtend, kode_rcp);
                                            await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom + isgetTotalPromoRoomExtend);
                                            await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamarExtend(db, kode_rcp);
                                            total_tarif_kamar_extend = total_tarif_kamar_extend - isgetTotalPromoRoomExtend;
                                            console.log(kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                            logger.info(kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                        }
                                        else {
                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, 0, kode_rcp);
                                        }

                                        if (apakah_nomor_member == true) {
                                            discount_member_kamar_extend = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar_extend);
                                        }
                                        discount_member_kamar = discount_member_kamar + discount_member_kamar_extend;

                                        var isgetNilaiInvoice = await new CheckinProses().getNilaiInvoice(db, kode_rcp, room);
                                        if (isgetNilaiInvoice.state == true) {
                                            nilai_ivc_sewa_kamar = parseFloat(isgetNilaiInvoice.data[0].sewa_kamar);
                                            nilai_ivc_discount_kamar = parseFloat(isgetNilaiInvoice.data[0].discount_kamar);
                                            nilai_ivc_surcharge_kamar = parseFloat(isgetNilaiInvoice.data[0].surcharge_kamar);
                                            nilai_ivc_total_penjualan = parseFloat(isgetNilaiInvoice.data[0].total_penjualan);
                                            nilai_ivc_charge_lain = parseFloat(isgetNilaiInvoice.data[0].charge_lain);
                                            nilai_ivc_uang_muka = parseFloat(isgetNilaiInvoice.data[0].uang_muka);
                                            nilai_ivc_uang_voucher = parseFloat(isgetNilaiInvoice.data[0].uang_voucher);
                                        }

                                        var total_sewa_kamar_plus_extend_plus_overpax = (
                                            total_tarif_kamar +
                                            charge_overpax +
                                            total_tarif_kamar_extend +
                                            charge_overpax_extend +
                                            nilai_ivc_surcharge_kamar
                                        ) -
                                            nilai_ivc_uang_voucher -
                                            discount_member_kamar;

                                        console.log(kode_rcp + " total_sewa_kamar_plus_extend_plus_overpax  " + total_sewa_kamar_plus_extend_plus_overpax);
                                        logger.info(kode_rcp + " total_sewa_kamar_plus_extend_plus_overpax  " + total_sewa_kamar_plus_extend_plus_overpax);

                                        var nilai_service_room = parseFloat(0);
                                        var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(
                                            db, total_sewa_kamar_plus_extend_plus_overpax);
                                        if (isgetNilaiServiceRoom != false) {
                                            nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                                        }
                                        var sewa_kamar_plus_service = parseFloat(
                                            isgetNilaiServiceRoom +
                                            total_sewa_kamar_plus_extend_plus_overpax);

                                        var nilai_pajak_room = parseFloat(0);
                                        var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(
                                            db, sewa_kamar_plus_service);
                                        if (isgetNilaiPajakRoom != false) {
                                            nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                                        }

                                        total_sewa_kamar_plus_extend_plus_overpax = parseFloat(
                                            total_sewa_kamar_plus_extend_plus_overpax);
                                        var total_kamar_ = parseFloat(
                                            total_sewa_kamar_plus_extend_plus_overpax +
                                            nilai_service_room +
                                            nilai_pajak_room);

                                        var total_All_ =
                                            total_kamar_ +
                                            nilai_ivc_total_penjualan +
                                            nilai_ivc_charge_lain;

                                        var total_All = total_All_.toFixed(0);

                                        var total_kamar = total_kamar_.toFixed(0);

                                        var isProsesQueryUpdateIhp_ivc = await
                                            new CheckinProses().updateIhpIvcNilaiInvoice(
                                                db,
                                                total_tarif_kamar,
                                                total_tarif_kamar_extend,
                                                final_charge_overpax,
                                                discount_member_kamar,
                                                nilai_service_room,
                                                nilai_pajak_room,
                                                total_kamar,
                                                total_All,
                                                kode_rcp,
                                                nilai_ivc_uang_muka,
                                                nilai_ivc_uang_voucher);

                                        if (isProsesQueryUpdateIhp_ivc != false) {

                                            var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "extend");
                                            if (isProsesinsertHistory != false) {

                                                var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                logger.info("-> Start " + start + "-> Finish proses extend " + finish + "->");
                                                console.log("-> Start " + start + "-> Finish proses extend " + finish + "->");

                                                var server_udp_room_sign = dgram.createSocket('udp4');
                                                pesan = "Room " + room + " Extend";
                                                ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                                if ((ip_address !== false)) {
                                                    ip_address = ip_address.recordset[0].IP_Address;
                                                    port = parseInt(7082);
                                                    panjang_pesan = pesan.length;
                                                    panjang_pesan = parseInt(panjang_pesan);
                                                    logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                                    server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                        server_udp_room_sign.close();
                                                    });
                                                }

                                                formResponseData = {
                                                    room: room,
                                                    kode_rcp: kode_rcp
                                                };
                                                dataResponse = new ResponseFormat(true, formResponseData);
                                                res.send(dataResponse);
                                            }
                                        }
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isgetTotalTarifExtendDanOverpax ");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isGetTarifPerjamRoom ");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal Delete From IHP_Rcp_DetailsRoom");
                            res.send(dataResponse);
                        }
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, kode_rcp + " Gagal isprosesQueryInsertIHP_Ext");
                    res.send(dataResponse);
                }
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

exports.submitTransferRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procTransferRoom(req, res);
};

async function _procTransferRoom(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses transfer " + start);
        console.log("-> Start proses transfer " + start);

        var jenis_kamar;
        var old_jenis_kamar;
        var kapasitas_kamar;
        var room = req.body.room;
        var old_room = req.body.old_room;
        var kode_member;
        var nama_member;
        var chusr = req.body.chusr;
        var durasi_jam;
        var durasi_menit;
        var dateTambahan;
        var status_promo;
        var promo;
        var hp;
        var keterangan;
        var uang_muka;
        var date_trans_Query;
        var finalShift;
        var totalDurasiCekinMenit;
        var old_id_payment_uang_muka;
        var old_kode_ivc;
        var old_kode_rcp;
        var old_pax;
        var old_promo_rcp;
        var old_promo_rcp_room_ext;
        var apakah_nomor_member;
        var eventAcara;
        var mbl;
        var nomor_hari;
        var nomor_hari_;
        var sisa_checkin;
        var rcp_sisa_checkin;
        var rcp_sedang_berjalan;
        var rcp_sedang_berjalan_jam;
        var checkin_ditambah_rcp_sedang_berjalan;
        var old_kapasitas_kamar;
        var rcp_sedang_berjalan_menit;
        var rcp_ext_sedang_berjalan;
        var rcp_ext_sedang_berjalan_sebelum_di_reset;
        var isgetPromoRoom;
        var isgetPromoFood;
        var total_All;

        var nilai_uang_voucher = parseFloat(0);
        uang_muka = parseFloat(0);
        var charge_overpax = parseFloat(0);
        var total_tarif_kamar = parseFloat(0);
        var tarif_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);
        var kamar_plus_overpax = parseFloat(0);

        var total_tarif_kamar_extend = parseFloat(0);
        var tarif_overpax_extend_kamar = parseFloat(0);
        var charge_overpax_extend = parseFloat(0);
        var discount_member_kamar_extend = parseFloat(0);

        var nilai_ivc_total_penjualan = parseFloat(0);
        var nilai_ivc_charge_lain = parseFloat(0);
        var nilai_ivc_surcharge_kamar = parseFloat(0);
        var nilai_ivc_uang_muka = parseFloat(0);
        var nilai_ivc_uang_voucher = parseFloat(0);

        var total_sewa_kamar_extend_plus_overpax = parseFloat(0);
        var sewa_kamar_plus_service = parseFloat(0);
        var final_charge_overpax = parseFloat(0);

        var isGetCekAktifKondisiVoucher = false;
        var alasan_transfer_ = req.body.alasan_transfer;
        var alasan_transfer = alasan_transfer_.toUpperCase();

        var voucher = req.body.voucher;
        voucher = voucher.toUpperCase();
        var uang_voucher = parseFloat(0);

        var qm1_ = req.body.qm1;
        if (qm1_ == '') {
            qm1_ = '0';
        }
        else if (qm1_ === undefined) {
            qm1_ = '0';
        }
        var qm1 = parseInt(qm1_);

        var qm2_ = req.body.qm2;
        if (qm2_ == '') {
            qm2_ = '0';
        }
        else if (qm2_ === undefined) {
            qm2_ = '0';
        }
        var qm2 = parseInt(qm2_);

        var qm3_ = req.body.qm3;
        if (qm3_ == '') {
            qm3_ = '0';
        }
        else if (qm3_ === undefined) {
            qm3_ = '0';
        }
        var qm3 = parseInt(qm3_);

        var qm4_ = req.body.qm4;
        if (qm4_ == '') {
            qm4_ = '0';
        }
        else if (qm4_ === undefined) {
            qm4_ = '0';
        }
        var qm4 = parseInt(qm4_);

        var qf1_ = req.body.qf1;
        if (qf1_ == '') {
            qf1_ = '0';
        }
        else if (qf1_ === undefined) {
            qf1_ = '0';
        }
        var qf1 = parseInt(qf1_);
        var qf2_ = req.body.qf2;
        if (qf2_ == '') {
            qf2_ = '0';
        }
        else if (qf2_ === undefined) {
            qf2_ = '0';
        }
        var qf2 = parseInt(qf2_);

        var qf3_ = req.body.qf3;
        if (qf3_ == '') {
            qf3_ = '0';
        }
        else if (qf3_ === undefined) {
            qf3_ = '0';
        }
        var qf3 = parseInt(qf3_);

        var qf4_ = req.body.qf4;
        if (qf4_ == '') {
            qf4_ = '0';
        }
        else if (qf4_ === undefined) {
            qf4_ = '0';
        }
        var qf4 = parseInt(qf4_);

        var pax = qm1 + qm2 + qm3 + qm4 + qf1 + qf2 + qf3 + qf4;

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);
        var isgetPengecekanOldRoom = await new Room().getPengecekanRoomReady(db, old_room);
        if ((voucher == '') || (voucher === undefined)) {
            voucher = isgetPengecekanOldRoom.data[0].voucher;
        }

        if ((voucher != '') && (voucher !== undefined)) {
            isGetCekAktifKondisiVoucher = await new Voucher().getCekAktifKondisiVoucher(db, voucher);
        }

        if (isgetPengecekanOldRoom != false) {
            sisa_checkin = parseInt(isgetPengecekanOldRoom.data[0].sisa_checkin);

            if (sisa_checkin > 0) {

                if (sisa_checkin > 0) {
                    var durasi_menit_old_room = isgetPengecekanOldRoom.data[0].sisa_menit_checkin;
                    var durasi_jam_old_room = isgetPengecekanOldRoom.data[0].sisa_jam_checkin;

                    durasi_jam = durasi_jam_old_room;
                    durasi_menit = durasi_menit_old_room;

                    totalDurasiCekinMenit = sisa_checkin;
                    dateTambahan = "DATEADD(minute," + sisa_checkin + ",GETDATE())";

                    old_kode_rcp = isgetPengecekanOldRoom.data[0].reception;
                    old_kode_ivc = isgetPengecekanOldRoom.data[0].invoice;
                    old_id_payment_uang_muka = isgetPengecekanOldRoom.data[0].id_payment;
                    rcp_sedang_berjalan = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan);
                    rcp_sedang_berjalan_jam = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan_jam);
                    rcp_sedang_berjalan_menit = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan_menit);
                    rcp_sisa_checkin = parseInt(isgetPengecekanOldRoom.data[0].rcp_sisa_checkin);
                    old_kapasitas_kamar = isgetPengecekanOldRoom.data[0].kapasitas;
                    old_pax = isgetPengecekanOldRoom.data[0].pax;
                    old_jenis_kamar = isgetPengecekanOldRoom.data[0].jenis_kamar;
                    checkin_ditambah_rcp_sedang_berjalan = isgetPengecekanOldRoom.data[0].checkin_ditambah_rcp_sedang_berjalan;

                    rcp_ext_sedang_berjalan = parseInt(isgetPengecekanOldRoom.data[0].rcp_ext_sedang_berjalan);
                    rcp_ext_sedang_berjalan_sebelum_di_reset = parseInt(isgetPengecekanOldRoom.data[0].rcp_ext_sedang_berjalan);

                    uang_muka = isgetPengecekanOldRoom.data[0].uang_muka;
                    hp = isgetPengecekanOldRoom.data[0].hp;
                    keterangan = isgetPengecekanOldRoom.data[0].keterangan;
                    kode_member = isgetPengecekanOldRoom.data[0].kode_member;
                    nama_member = isgetPengecekanOldRoom.data[0].nama_member;
                    status_promo = isgetPengecekanOldRoom.data[0].status_promo;
                    eventAcara = isgetPengecekanOldRoom.data[0].keterangan_tamu;

                    apakah_nomor_member = parseInt(kode_member);
                    if (isNaN(apakah_nomor_member) == true) {
                        apakah_nomor_member = false;
                    }
                    else {
                        apakah_nomor_member = true;
                    }

                    if (rcp_sisa_checkin >= 0) {
                        old_promo_rcp = await new CheckinProses().getPromoRcp(db, old_kode_rcp, 0);
                        promo = old_promo_rcp;
                    }
                    else if ((rcp_sisa_checkin < 0) && (sisa_checkin > 0)) {
                        old_promo_rcp_room_ext = await new CheckinProses().getPromoRcp(db, old_kode_rcp, 1);
                        promo = old_promo_rcp_room_ext;
                    }
                }
            }
        }

        if ((isgetPengecekanOldRoom.data[0].kamar_untuk_checkin == true) && (isgetPengecekanOldRoom.data[0].jumlah_tamu == 0)) {
            console.log(room + " Data kamar belum di lengkapi");
            logger.info(room + " Data kamar belum di lengkapi");
            dataResponse = new ResponseFormat(false, null, room + " Data kamar belum di lengkapi");
            res.send(dataResponse);
        }
        else if (alasan_transfer_ == '') {
            console.log(room + " alasan_transfer_ Tidak Boleh Kosong");
            logger.info(room + " alasan_transfer_ Tidak Boleh Kosong");
            formResponseData = { keterangan: room + " alasan_transfer_ Tidak Boleh Kosong" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if (pax == 0) {
            console.log(room + " Jumlah tamu Tidak Boleh Nol");
            logger.info(room + " Jumlah tamu Tidak Boleh Nol");
            formResponseData = { keterangan: room + " Jumlah tamu Tidak Boleh Nol" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if (totalDurasiCekinMenit == 0) {
            console.log(old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol");
            logger.info(old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol");
            formResponseData = { keterangan: old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == "1")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah expired");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "2") &&
            (isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception != old_kode_rcp)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sedang digunakan checkin di reception " +
                isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher +
                " non aktif sudah digunakan checkin di reception " +
                isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher == false)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher tidak terdaftar");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {
                jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
                kapasitas_kamar = isgetPengecekanRoomReady.data[0].kapasitas;
                kapasitas_kamar = parseInt(kapasitas_kamar);

                if (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1) {

                    if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                        if (isgetPengecekanRoomReady.data[0].status_checksound == 1) {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan CheckSound");
                            res.send(dataResponse);
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan Checkin");
                            res.send(dataResponse);
                        }
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                        dataResponse = new ResponseFormat(false, null, room + " Sedang Opr Dibersihkan");
                        res.send(dataResponse);
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_kamar_ready_untuk_checkin == 1) {
                        console.log(room + " Ready untuk Checkin, Durasi checkin " + sisa_checkin + " Menit");
                        logger.info(room + " Ready untuk Checkin, Durasi checkin " + sisa_checkin + " Menit");

                        if (isgetPengecekanOldRoom != false) {

                            if (sisa_checkin > 0) {

                                shift = await new Shift().getShift(db);
                                date_trans_Query = await new Shift().getDateTransQuery(shift);
                                finalShift = await new Shift().getFinalShift(shift);

                                var kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
                                var kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);
                                var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                                var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                                if (apakah_sekarang_malam_besok_libur.state == true) {
                                    mbl = '1';
                                }
                                else {
                                    mbl = '0';
                                }

                                if ((kode_rcp != false) && (kode_ivc != false)) {
                                    var isGetCekReceptionIhp_rcp = await new KodeTransaksi().getCekReceptionIhp_rcp(db, kode_rcp, room);
                                    if (isGetCekReceptionIhp_rcp == false) {

                                        var isGetCekInvoiceIhp_Ivc = await new KodeTransaksi().getCekInvoiceIhp_Ivc(db, kode_ivc, room);
                                        if (isGetCekInvoiceIhp_Ivc == false) {

                                            var isprosesQuery = await
                                                new CheckinProses().insertIhpRcp(db,
                                                    kode_rcp,
                                                    finalShift,
                                                    kode_member,
                                                    nama_member,
                                                    room,
                                                    durasi_jam,
                                                    durasi_menit,
                                                    dateTambahan,
                                                    qm1,
                                                    qm2,
                                                    qm3,
                                                    qm4,
                                                    qf1,
                                                    qf2,
                                                    qf3,
                                                    qf4,
                                                    pax,
                                                    hp,
                                                    uang_muka,
                                                    old_id_payment_uang_muka,
                                                    uang_voucher,
                                                    chusr,
                                                    mbl, "1",
                                                    kode_ivc,
                                                    keterangan,
                                                    date_trans_Query,
                                                    status_promo,
                                                    "-1",
                                                    "");

                                            if (isprosesQuery == true) {
                                                isprosesQuery = await new CheckinProses().insertIhpIvc(db,
                                                    kode_ivc,
                                                    finalShift,
                                                    kode_rcp,
                                                    kode_member,
                                                    nama_member,
                                                    room,
                                                    uang_muka,
                                                    old_kode_ivc,
                                                    chusr,
                                                    date_trans_Query,
                                                    jenis_kamar);
                                                if (isprosesQuery == true) {

                                                    await new CheckinProses().updateInvoiceIhpRcp(db, kode_ivc, kode_rcp, room);

                                                    isprosesQuery = await new CheckinProses().insertIhpRoomCheckin(db, room, kode_rcp);
                                                    if (isprosesQuery == true) {

                                                        isprosesQuery = await new CheckinProses().updateIhpRoomCheckIn(db, kode_rcp, nama_member, pax, dateTambahan, eventAcara, room);
                                                        if (isprosesQuery == true) {

                                                            var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                            if (isDeleteIHP_Rcp_DetailsRoomQuery != false) {

                                                                var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                                                                if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                                                    if (apakah_sekarang_malam_besok_libur.state == true) {
                                                                        nomor_hari = '8';
                                                                    }
                                                                    else if (apakah_sekarang_tanggal_libur.state == true) {
                                                                        nomor_hari = '9';
                                                                    }
                                                                    else {
                                                                        nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                                                    }
                                                                    console.log(kode_rcp + " nomor hari " + nomor_hari);
                                                                    logger.info(kode_rcp + " nomor hari " + nomor_hari);

                                                                    nomor_hari_ = parseInt(nomor_hari);
                                                                    var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                                                    var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                                                    var isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                                    if (isGetTarifPerjamRoom.state == true) {
                                                                        for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                            var overpax_tarif = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                            var kamar_tarif = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                                                            await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                                nomor_hari_, overpax_tarif, kamar_tarif,
                                                                                isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                        }
                                                                    }

                                                                    //cek validitas ihp_rcp_details_room
                                                                    var cek_valid_insert_ihp_rcp_details_room = await new CheckinProses().getCekValidIHPRcpDetailsRoom(db, kode_rcp);
                                                                    if (cek_valid_insert_ihp_rcp_details_room == false) {
                                                                        await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                                        isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                                        if (isGetTarifPerjamRoom.state == true) {
                                                                            for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                                var overpax_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                                var kamar_tarif_ = parseFloat(isGetTarifPerjamRoom.data[a].tarif);
                                                                                await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                                    nomor_hari_, overpax_tarif_, kamar_tarif_,
                                                                                    isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                            }
                                                                        }
                                                                    }

                                                                    //get promo kamar baru                                                                            
                                                                    if (isGetTarifPerjamRoom.state == true) {
                                                                        if (promo != false) {
                                                                            for (a = 0; a < promo.length; a++) {
                                                                                isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                                isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                                if (isgetPromoRoom.state == true) {
                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(
                                                                                            db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                                    }
                                                                                }

                                                                                if (isgetPromoFood.state == true) {
                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(
                                                                                            db, romo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }

                                                                        if ((old_id_payment_uang_muka != 0) && (uang_muka > 0)) {
                                                                            await new CheckinProses().updateIhpUangMukaNonCash(db, old_kode_rcp, kode_rcp);
                                                                        }

                                                                        var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                                                        if (isgetTotalTarifKamarDanOverpax != false) {

                                                                            if (isGetCekAktifKondisiVoucher != false) {
                                                                                if (
                                                                                    (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == 0) &&
                                                                                    (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit > 60)
                                                                                ) {
                                                                                    //free voucher                                                                         
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                        nilai_uang_voucher = await new Voucher().getTotalNilaiPotonganVoucher(db, kode_rcp, voucher);
                                                                                        uang_voucher = nilai_uang_voucher;
                                                                                    }
                                                                                    //gift voucher
                                                                                    else if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                        uang_voucher = isGetCekAktifKondisiVoucher.data[0].nilai;
                                                                                    }
                                                                                    await new CheckinProses().updateIhpVcrSedangDipakaiCheckin(db, voucher, 2);
                                                                                }
                                                                            }
                                                                            await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                                                                            tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                                                                            total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);
                                                                            charge_overpax = tarif_overpax;

                                                                            var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);

                                                                            if (isgetTotalPromoRoom != false) {
                                                                                total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;
                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                                                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                                                                await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, kode_rcp);
                                                                                console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                            }
                                                                            else {
                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, kode_rcp);
                                                                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, 0);
                                                                            }
                                                                            if (apakah_nomor_member == true) {
                                                                                discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                            }

                                                                            kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                            console.log(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                            logger.info(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);

                                                                            var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(
                                                                                db,
                                                                                total_tarif_kamar +
                                                                                charge_overpax -
                                                                                nilai_uang_voucher -
                                                                                discount_member_kamar);

                                                                            if (isgetNilaiServiceRoom != false) {
                                                                                nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                                                                            }

                                                                            sewa_kamar_plus_service = parseFloat(
                                                                                isgetNilaiServiceRoom +
                                                                                total_tarif_kamar +
                                                                                charge_overpax -
                                                                                nilai_uang_voucher -
                                                                                discount_member_kamar);

                                                                            var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(db, sewa_kamar_plus_service);
                                                                            if (isgetNilaiPajakRoom != false) {
                                                                                nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                                                                            }

                                                                            total_tarif_kamar = parseFloat(total_tarif_kamar);
                                                                            var total_kamar = parseFloat(total_tarif_kamar +
                                                                                charge_overpax +
                                                                                nilai_service_room +
                                                                                nilai_pajak_room -
                                                                                nilai_uang_voucher -
                                                                                discount_member_kamar);
                                                                            total_kamar = total_kamar.toFixed(0);

                                                                            var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                                                db,
                                                                                total_tarif_kamar,
                                                                                0,
                                                                                charge_overpax,
                                                                                discount_member_kamar,
                                                                                nilai_service_room,
                                                                                nilai_pajak_room,
                                                                                total_kamar,
                                                                                total_kamar,
                                                                                kode_rcp,
                                                                                uang_muka,
                                                                                nilai_uang_voucher
                                                                            );
                                                                            if (isProsesQueryUpdateIhp_ivc != false) {

                                                                                if (nilai_uang_voucher > 0) {
                                                                                    //simpan free voucher jam di ihp_uangVoucher
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, nilai_uang_voucher);
                                                                                        await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, kode_rcp, nilai_uang_voucher);
                                                                                    }
                                                                                }
                                                                                else if (uang_voucher > 0) {
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                        //simpan gift voucher di ihp_uangVoucher
                                                                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, uang_voucher);
                                                                                    }
                                                                                }

                                                                                var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "checkin from transfer");
                                                                                console.log(kode_rcp + " End proses new room");
                                                                                logger.info(kode_rcp + " End proses new room");

                                                                                if (isProsesinsertHistory != false) {
                                                                                    console.log(old_kode_rcp + " Start Edit Rcp dan Ivc Old Room");
                                                                                    logger.info(old_kode_rcp + " Start Edit Rcp dan Ivc Old Room");

                                                                                    //jika saat transfer masih menggunakan awal durasi Rcp  tanpa extend
                                                                                    if (rcp_sisa_checkin >= 0) {
                                                                                        var prosesUpdateDurasiIhpRcp = await new CheckinProses().updateDurasiIhpRcp(db, rcp_sedang_berjalan_jam, rcp_sedang_berjalan_menit,
                                                                                            checkin_ditambah_rcp_sedang_berjalan, old_kode_rcp, old_room,
                                                                                            old_kode_ivc);

                                                                                        if (prosesUpdateDurasiIhpRcp != false) {
                                                                                            await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 0);
                                                                                            //promo rcp kamar extend
                                                                                            await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 1);
                                                                                            await new CheckinProses().deleteIhpExtOldRoomTransfer(db, old_kode_rcp);
                                                                                        }

                                                                                        //edit promo rcp room lama sebelum extend
                                                                                        if (promo != false) {
                                                                                            for (a = 0; a < promo.length; a++) {
                                                                                                isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(
                                                                                                    db, promo.data[a].promo, rcp_sedang_berjalan, old_jenis_kamar, old_kode_rcp);
                                                                                                isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(
                                                                                                    db, promo.data[a].promo, rcp_sedang_berjalan, old_jenis_kamar, old_room, old_kode_rcp);

                                                                                                if (isgetPromoRoom.state == true) {
                                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(
                                                                                                            db, promo.data[a].promo, rcp_sedang_berjalan, old_jenis_kamar, old_kode_rcp);
                                                                                                    }
                                                                                                }

                                                                                                if (isgetPromoFood.state == true) {
                                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(
                                                                                                            db, promo.data[a].promo, rcp_sedang_berjalan, old_jenis_kamar, old_room, old_kode_rcp);
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    //jika saat transfer sudah menggunakan durasi extend room
                                                                                    else if ((rcp_sisa_checkin < 0) && (sisa_checkin > 0)) {

                                                                                        var isgetInfoExtendRoom = await new CheckinProses().getInfoExtendRoom(db, old_kode_rcp);
                                                                                        if (isgetInfoExtendRoom != false) {
                                                                                            rcp_ext_sedang_berjalan = parseInt(rcp_ext_sedang_berjalan);
                                                                                            for (a = 0; a < isgetInfoExtendRoom.length; a++) {
                                                                                                console.log(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                logger.info(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);

                                                                                                var sisa_durasi_extend = parseInt(isgetInfoExtendRoom.data[a].total_menit_extend);

                                                                                                if (rcp_ext_sedang_berjalan < sisa_durasi_extend) {

                                                                                                    if ((sisa_durasi_extend > 0) && (rcp_ext_sedang_berjalan == 0)) {
                                                                                                        //sisa durasi extend tidak terpakai di delete
                                                                                                        await new CheckinProses().deleteIhpExtOldRoomTransferBerjalan(db, isgetInfoExtendRoom.data[a].tanggal_extend);
                                                                                                        console.log(old_kode_rcp + " sisa durasi extend tidak terpakai di delete " + sisa_durasi_extend);
                                                                                                        logger.info(old_kode_rcp + " sisa durasi extend tidak terpakai di delete " + sisa_durasi_extend);
                                                                                                    }
                                                                                                    if ((rcp_ext_sedang_berjalan < sisa_durasi_extend) && (rcp_ext_sedang_berjalan > 0)) {
                                                                                                        //durasi extend yang sudah dipakai di edit
                                                                                                        console.log(old_kode_rcp + " sisa rcp_ext_sedang_berjalan di edit " + sisa_durasi_extend + " menjadi " + rcp_ext_sedang_berjalan);
                                                                                                        logger.info(old_kode_rcp + " sisa rcp_ext_sedang_berjalan di edit " + sisa_durasi_extend + " menjadi " + rcp_ext_sedang_berjalan);
                                                                                                        var sisa_menit = rcp_ext_sedang_berjalan % 60;
                                                                                                        var sisa_jam = rcp_ext_sedang_berjalan / 60;
                                                                                                        sisa_jam = Math.floor(sisa_jam);
                                                                                                        await new CheckinProses().updateIhpExtOldRoomTransfer(db, isgetInfoExtendRoom.data[a].tanggal_extend, sisa_jam, sisa_menit);
                                                                                                        rcp_ext_sedang_berjalan = 0;
                                                                                                    }
                                                                                                    //delete promo rcp extend
                                                                                                    await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 1);
                                                                                                }
                                                                                                else if (rcp_ext_sedang_berjalan >= sisa_durasi_extend) {
                                                                                                    rcp_ext_sedang_berjalan = rcp_ext_sedang_berjalan - sisa_durasi_extend;
                                                                                                    console.log(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                    logger.info(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                }

                                                                                            }
                                                                                        }

                                                                                        //get promo room  extend lama sebelum nya
                                                                                        if (promo != false) {
                                                                                            for (a = 0; a < promo.length; a++) {
                                                                                                isgetPromoRoom = await new PromoRoom().getPromoExtendRoomOldTransferByRcpCheckOut(
                                                                                                    db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_jenis_kamar, old_kode_rcp);
                                                                                                isgetPromoFood = await new PromoFood().getPromoFoodExtendRoomOldTranferByRcpCheckOut(
                                                                                                    db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_kode_rcp, old_jenis_kamar, old_room);
                                                                                                if (isgetPromoRoom.state == true) {
                                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomExtendOldTransferByRcpCheckOut(
                                                                                                            adb, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_jenis_kamar, old_kode_rcp);
                                                                                                    }
                                                                                                }

                                                                                                if (isgetPromoFood.state == true) {
                                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodExtendRoomOldTranferByRcpCheckOut(
                                                                                                            db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset,
                                                                                                            old_jenis_kamar, old_room, old_kode_rcp);
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //checkout edit Room lama                                                                                

                                                                                    var isgetTotalTarifKamarDanOverpaxOldRoom = await new TarifKamar().getTotalTarifKamarDanOverpax(db, old_kode_rcp, old_kapasitas_kamar, old_pax);
                                                                                    if (isgetTotalTarifKamarDanOverpaxOldRoom != false) {
                                                                                        await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, old_kode_rcp);
                                                                                        tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpaxOldRoom.overpax);
                                                                                        total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpaxOldRoom.sewa_kamar);
                                                                                        await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, old_kode_rcp);
                                                                                        charge_overpax = tarif_overpax;

                                                                                        var isgetTotalPromoRoomOldRoom = await new PromoRoom().getTotalPromoRoom(db, old_kode_rcp);

                                                                                        if (isgetTotalPromoRoomOldRoom != false) {
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoomOldRoom, old_kode_rcp);
                                                                                            await new PromoRoom().insertIhpDetailPromo(db, old_kode_rcp, old_kode_ivc, isgetTotalPromoRoomOldRoom);
                                                                                            await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, old_kode_rcp);
                                                                                            total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoomOldRoom;
                                                                                            console.log(old_kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                            logger.info(old_kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                        }
                                                                                        else {
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, old_kode_rcp);
                                                                                        }

                                                                                        if (apakah_nomor_member == true) {
                                                                                            discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                                        }

                                                                                        kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                                        console.log(old_kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                                        logger.info(old_kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);

                                                                                        var isgetTotalTarifExtendDanOverpax = await new TarifKamar().getTotalTarifExtendDanOverpax(db, old_kode_rcp, old_kapasitas_kamar, old_pax);
                                                                                        if (isgetTotalTarifExtendDanOverpax != false) {
                                                                                            await new TarifKamar().getDeleteInsertIhpDetailSewaKamarExtend(db, old_kode_rcp);
                                                                                            tarif_overpax_extend_kamar = parseFloat(isgetTotalTarifExtendDanOverpax.overpax);
                                                                                            total_tarif_kamar_extend = parseFloat(isgetTotalTarifExtendDanOverpax.sewa_kamar);
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon(db, total_tarif_kamar_extend, old_kode_rcp);
                                                                                            charge_overpax_extend = tarif_overpax_extend_kamar;

                                                                                            final_charge_overpax = charge_overpax_extend + charge_overpax;
                                                                                            console.log(kode_rcp + " total charge_overpax+charge_overpax_extend " + final_charge_overpax);
                                                                                            logger.info(kode_rcp + " total charge_overpax+charge_overpax_extend " + final_charge_overpax);

                                                                                            var isgetTotalPromoRoomExtend = await new PromoRoom().getTotalPromoExtendRoom(db, old_kode_rcp);
                                                                                            if (isgetTotalPromoRoomExtend != false) {
                                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, isgetTotalPromoRoomExtend, old_kode_rcp);
                                                                                                await new PromoRoom().insertIhpDetailPromo(db, old_kode_rcp, old_kode_ivc, isgetTotalPromoRoom + isgetTotalPromoRoomExtend);
                                                                                                await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamarExtend(db, old_kode_rcp);
                                                                                                total_tarif_kamar_extend = total_tarif_kamar_extend - isgetTotalPromoRoomExtend;
                                                                                                console.log(old_kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                                                                                logger.info(old_kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                                                                            }
                                                                                            else {
                                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, 0, old_kode_rcp);
                                                                                            }
                                                                                        }
                                                                                        if (apakah_nomor_member == true) {
                                                                                            discount_member_kamar_extend = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar_extend);
                                                                                        }
                                                                                        discount_member_kamar = discount_member_kamar + discount_member_kamar_extend;

                                                                                        var isgetNilaiInvoice = await new CheckinProses().getNilaiInvoice(db, old_kode_rcp, old_room);
                                                                                        if (isgetNilaiInvoice.state == true) {
                                                                                            nilai_ivc_total_penjualan = parseFloat(isgetNilaiInvoice.data[0].total_penjualan);
                                                                                            nilai_ivc_charge_lain = parseFloat(isgetNilaiInvoice.data[0].charge_lain);
                                                                                            nilai_ivc_surcharge_kamar = parseFloat(isgetNilaiInvoice.data[0].surcharge_kamar);
                                                                                            nilai_ivc_uang_muka = parseFloat(isgetNilaiInvoice.data[0].uang_muka);
                                                                                            nilai_ivc_uang_voucher = parseFloat(isgetNilaiInvoice.data[0].uang_voucher);
                                                                                        }

                                                                                        total_sewa_kamar_extend_plus_overpax = total_tarif_kamar +
                                                                                            total_tarif_kamar_extend +
                                                                                            final_charge_overpax +
                                                                                            nilai_ivc_surcharge_kamar -
                                                                                            nilai_ivc_uang_voucher -
                                                                                            discount_member_kamar;

                                                                                        console.log(old_kode_rcp + " total_sewa_kamar_extend_plus_overpax  " + total_sewa_kamar_extend_plus_overpax);
                                                                                        logger.info(old_kode_rcp + " total_sewa_kamar_extend_plus_overpax  " + total_sewa_kamar_extend_plus_overpax);

                                                                                        var isgetNilaiServiceRoomOldRoom = await new Service().getNilaiServiceRoom(db, total_sewa_kamar_extend_plus_overpax);
                                                                                        if (isgetNilaiServiceRoomOldRoom != false) {
                                                                                            nilai_service_room = parseFloat(isgetNilaiServiceRoomOldRoom);
                                                                                        }

                                                                                        sewa_kamar_plus_service = parseFloat(isgetNilaiServiceRoomOldRoom + total_sewa_kamar_extend_plus_overpax);

                                                                                        var isgetNilaiPajakRoomOldPajak = await new Pajak().getNilaiPajakRoom(db, sewa_kamar_plus_service);
                                                                                        if (isgetNilaiPajakRoomOldPajak != false) {
                                                                                            nilai_pajak_room = parseFloat(isgetNilaiPajakRoomOldPajak);
                                                                                        }

                                                                                        total_tarif_kamar = parseFloat(total_tarif_kamar);
                                                                                        total_kamar = parseFloat(
                                                                                            total_sewa_kamar_extend_plus_overpax +
                                                                                            nilai_service_room +
                                                                                            nilai_pajak_room);

                                                                                        var total_All_ = total_kamar +
                                                                                            nilai_ivc_total_penjualan +
                                                                                            nilai_ivc_charge_lain;

                                                                                        total_All = total_All_.toFixed(0);
                                                                                    }

                                                                                    await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                                                        db,
                                                                                        total_tarif_kamar,
                                                                                        total_tarif_kamar_extend,
                                                                                        final_charge_overpax,
                                                                                        discount_member_kamar,
                                                                                        nilai_service_room,
                                                                                        nilai_pajak_room,
                                                                                        total_kamar,
                                                                                        total_All,
                                                                                        old_kode_rcp,
                                                                                        uang_muka,
                                                                                        0
                                                                                    );

                                                                                    if (uang_voucher > 0) {
                                                                                        await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, old_kode_rcp, 0);
                                                                                        await new CheckinProses().deleteIhpUangVoucher(db, old_kode_rcp, voucher);
                                                                                    }

                                                                                    await new History().insertIHPEventTransaction(db, old_room, chusr, date_trans_Query, "transfer karena " + alasan_transfer);

                                                                                    console.log(old_kode_rcp + " Finish Edit Rcp dan Ivc Old Room");
                                                                                    logger.info(old_kode_rcp + " Finish Edit Rcp dan Ivc Old Room");

                                                                                    //await new ResetTransaksi().updateIhpRoomCheckout(db, old_room, old_kode_rcp);
                                                                                    await new CheckinProses().prosesCheckout(db, old_room);
                                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, old_room, old_kode_rcp);
                                                                                    await new CheckinProses().updateIhpRcpKamarTransfer(db, old_kode_rcp, old_room, old_kode_ivc);
                                                                                    await new CheckinProses().updateIhpIvcKamarTransfer(db, old_kode_rcp, old_room, old_kode_ivc);
                                                                                    //end checkout edit Room lama

                                                                                    var server_udp_room_sign = dgram.createSocket('udp4');
                                                                                    pesan = "Room " + room + " Checkin";
                                                                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                                                                    if ((ip_address !== false)) {
                                                                                        ip_address = ip_address.recordset[0].IP_Address;
                                                                                        port = parseInt(7082);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal Checkin to Room Sign");
                                                                                        server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            server_udp_room_sign.close();
                                                                                        });
                                                                                    }

                                                                                    var server_udp_room_sign_new = dgram.createSocket('udp4');
                                                                                    pesan = "Room " + room + " Checkin";
                                                                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, old_room);
                                                                                    if ((ip_address !== false)) {
                                                                                        ip_address = ip_address.recordset[0].IP_Address;
                                                                                        port = parseInt(7082);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal Checkin to Room Sign");
                                                                                        server_udp_room_sign_new.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            server_udp_room_sign_new.close();
                                                                                        });
                                                                                    }

                                                                                    var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                                                    logger.info("-> Start " + start + "-> Finish proses transfer " + finish + "->");
                                                                                    console.log("-> Start " + start + "-> Finish proses transfer " + finish + "->");

                                                                                    formResponseData = {
                                                                                        room: room,
                                                                                        kode_rcp: kode_rcp
                                                                                    };
                                                                                    dataResponse = new ResponseFormat(true, formResponseData);
                                                                                    res.send(dataResponse);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            //gagal Checkin RoomHarus di reset
                                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                            dataResponse = new ResponseFormat(false, null, kode_rcp + "  gagal isgetTotalTarifKamarDanOverpax");
                                                                            res.send(dataResponse);
                                                                        }
                                                                    }
                                                                    else {
                                                                        //gagal Checkin RoomHarus di reset
                                                                        await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                        await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                        dataResponse = new ResponseFormat(false, null, kode_rcp + "  gagal isGetTarifPerjamRoom");
                                                                        res.send(dataResponse);
                                                                    }
                                                                }
                                                                else {
                                                                    //gagal Checkin RoomHarus di reset
                                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, oom, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                                                    res.send(dataResponse);
                                                                }
                                                            }
                                                            else {
                                                                //gagal Checkin RoomHarus di reset
                                                                await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal Delete From IHP_Rcp_DetailsRoom");
                                                                res.send(dataResponse);
                                                            }
                                                        }
                                                        else {
                                                            //gagal Checkin RoomHarus di reset
                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery reset checkOutRoomQuery");
                                                            res.send(dataResponse);
                                                        }
                                                    }
                                                    else {
                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RoomCheckinQuery");
                                                        res.send(dataResponse);
                                                    }
                                                }
                                                else {
                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                    dataResponse = new ResponseFormat(false, null, kode_ivc + " gagal isprosesQuery insertIHP_IvcQuery");
                                                    res.send(dataResponse);
                                                }
                                            }
                                            else {
                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                                                res.send(dataResponse);
                                            }
                                        }
                                        else {
                                            dataResponse = new ResponseFormat(false, null, kode_ivc + " sudah pernah dipakai ");
                                            res.send(dataResponse);
                                        }
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " sudah pernah dipakai ");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal get kode_rcp kode_ivc ");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, old_room + " tidak bisa transfer durasi Checkin habis");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, old_room + " Room Tidak Terdaftar");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, room + " Kamar Tidak Ready Checkin");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Bukan Kamar Untuk Checkin");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

exports.submitTransferRoomMember = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procTransferRoomMember(req, res);
};

async function _procTransferRoomMember(req, res) {
    try {
        var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        logger.info("-> Start proses transfer " + start);
        console.log("-> Start proses transfer " + start);

        var jenis_kamar;
        var old_jenis_kamar;
        var kapasitas_kamar;
        var old_room;
        var kode_member;
        var nama_member;
        var durasi_jam;
        var durasi_menit;
        var dateTambahan;
        var status_promo;
        var promo;
        var hp;
        var keterangan;
        var date_trans_Query;
        var finalShift;
        var totalDurasiCekinMenit;
        var old_id_payment_uang_muka;
        var old_kode_ivc;
        var old_kode_rcp;
        var old_pax;
        var old_promo_rcp;
        var old_promo_rcp_room_ext;
        var apakah_nomor_member;
        var eventAcara;
        var mbl;
        var pax;
        var nomor_hari;
        var nomor_hari_;
        var sisa_checkin;
        var rcp_sisa_checkin;
        var rcp_sedang_berjalan;
        var rcp_sedang_berjalan_jam;
        var checkin_ditambah_rcp_sedang_berjalan;
        var old_kapasitas_kamar;
        var rcp_sedang_berjalan_menit;
        var rcp_ext_sedang_berjalan;
        var rcp_ext_sedang_berjalan_sebelum_di_reset;
        var isgetPromoRoom;
        var isgetPromoFood;
        var old_jumlah_tamu;
        var total_All;
        var qm1;
        var qm2;
        var qm3;
        var qm4;
        var qf1;
        var qf2;
        var qf3;
        var qf4;
        var voucher;

        var nilai_uang_voucher = parseFloat(0);
        var uang_voucher = parseFloat(0);
        var uang_muka = parseFloat(0);
        var charge_overpax = parseFloat(0);
        var total_tarif_kamar = parseFloat(0);
        var tarif_overpax = parseFloat(0);
        var discount_member_kamar = parseFloat(0);
        var nilai_service_room = parseFloat(0);
        var nilai_pajak_room = parseFloat(0);
        var kamar_plus_overpax = parseFloat(0);

        var total_tarif_kamar_extend = parseFloat(0);
        var tarif_overpax_extend_kamar = parseFloat(0);
        var charge_overpax_extend = parseFloat(0);
        var discount_member_kamar_extend = parseFloat(0);

        var nilai_ivc_total_penjualan = parseFloat(0);
        var nilai_ivc_charge_lain = parseFloat(0);
        var nilai_ivc_surcharge_kamar = parseFloat(0);

        var total_sewa_kamar_extend_plus_overpax = parseFloat(0);
        var sewa_kamar_plus_service = parseFloat(0);
        var final_charge_overpax = parseFloat(0);
        var isGetCekAktifKondisiVoucher = false;

        var alasan_transfer_ = req.body.transfer_reason;
        var alasan_transfer = alasan_transfer_.toUpperCase();

        if (alasan_transfer == 'OVERPAX') {
            alasan_transfer = '1';
        } else if (alasan_transfer == 'PERMINTAAN TAMU') {
            alasan_transfer = '2';
        } if (alasan_transfer == 'VOD BERMASALAH') {
            alasan_transfer = '3';
        } else {
            alasan_transfer = alasan_transfer;
        }

        var chusr = req.body.chusr;
        old_room = req.body.old_room_before_transfer.kamar;

        var kamar_untuk_checkin = req.body.checkin_room_type.kamar_untuk_checkin;
        if (kamar_untuk_checkin == false) {
            jenis_kamar = "LOBBY";
            kapasitas_kamar = 0;
        }
        jenis_kamar = req.body.checkin_room_type.jenis_kamar;
        kapasitas_kamar = req.body.checkin_room_type.kapasitas;
        var room = req.body.checkin_room;
        if ((room === undefined) || (room == '')) {
            room = await new Room().getJenisRoomReadyDetail(db, jenis_kamar, kapasitas_kamar);
            if (room != false) {
                room = room.recordset[0].kamar;
            }
        }
        else {
            room = req.body.checkin_room.kamar;
        }

        var kode_member_ = req.body.visitor.member;
        kode_member = kode_member_.toUpperCase();
        if (kode_member.length >= 16) {
            kode_member = kode_member.substr(0, 14);
        }
        kode_member = await new CheckinProses().menghapusCharPetik(kode_member);
        var kode_member__ = kode_member;
        apakah_nomor_member = parseInt(kode_member__);

        if (isNaN(apakah_nomor_member) == true) {
            apakah_nomor_member = false;
        }
        else {
            apakah_nomor_member = true;
        }

        var nama_member_ = req.body.visitor.nama_lengkap;
        nama_member = nama_member_.toUpperCase();
        nama_member = await new CheckinProses().menghapusCharPetik(nama_member);

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, room);
        var isgetPengecekanOldRoom = await new Room().getPengecekanRoomReady(db, old_room);

        if (isgetPengecekanOldRoom != false) {
            sisa_checkin = parseInt(isgetPengecekanOldRoom.data[0].sisa_checkin);

            if (sisa_checkin > 0) {

                if (sisa_checkin > 0) {
                    var durasi_menit_old_room = isgetPengecekanOldRoom.data[0].sisa_menit_checkin;
                    var durasi_jam_old_room = isgetPengecekanOldRoom.data[0].sisa_jam_checkin;

                    durasi_jam = durasi_jam_old_room;
                    durasi_menit = durasi_menit_old_room;

                    totalDurasiCekinMenit = sisa_checkin;
                    dateTambahan = "DATEADD(minute," + sisa_checkin + ",GETDATE())";

                    old_kode_rcp = isgetPengecekanOldRoom.data[0].reception;
                    old_kode_ivc = isgetPengecekanOldRoom.data[0].invoice;
                    old_id_payment_uang_muka = isgetPengecekanOldRoom.data[0].id_payment;
                    rcp_sedang_berjalan = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan);
                    rcp_sedang_berjalan_jam = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan_jam);
                    rcp_sedang_berjalan_menit = parseInt(isgetPengecekanOldRoom.data[0].rcp_sedang_berjalan_menit);
                    rcp_sisa_checkin = parseInt(isgetPengecekanOldRoom.data[0].rcp_sisa_checkin);
                    old_kapasitas_kamar = isgetPengecekanOldRoom.data[0].kapasitas;
                    old_pax = isgetPengecekanOldRoom.data[0].pax;
                    old_jenis_kamar = isgetPengecekanOldRoom.data[0].jenis_kamar;
                    checkin_ditambah_rcp_sedang_berjalan = isgetPengecekanOldRoom.data[0].checkin_ditambah_rcp_sedang_berjalan;

                    rcp_ext_sedang_berjalan = parseInt(isgetPengecekanOldRoom.data[0].rcp_ext_sedang_berjalan);
                    rcp_ext_sedang_berjalan_sebelum_di_reset = parseInt(isgetPengecekanOldRoom.data[0].rcp_ext_sedang_berjalan);

                    uang_muka = isgetPengecekanOldRoom.data[0].uang_muka;
                    hp = isgetPengecekanOldRoom.data[0].hp;
                    keterangan = isgetPengecekanOldRoom.data[0].keterangan;
                    kode_member = isgetPengecekanOldRoom.data[0].kode_member;
                    nama_member = isgetPengecekanOldRoom.data[0].nama_member;
                    status_promo = isgetPengecekanOldRoom.data[0].status_promo;
                    eventAcara = isgetPengecekanOldRoom.data[0].keterangan_tamu;
                    voucher = isgetPengecekanOldRoom.data[0].voucher;

                    if ((voucher != '') && (voucher !== undefined)) {
                        isGetCekAktifKondisiVoucher = await new Voucher().getCekAktifKondisiVoucher(db, voucher);
                    }
                    qm1 = isgetPengecekanOldRoom.data[0].qm1;
                    qm2 = isgetPengecekanOldRoom.data[0].qm2;
                    qm3 = isgetPengecekanOldRoom.data[0].qm3;
                    qm4 = isgetPengecekanOldRoom.data[0].qm4;
                    qf1 = isgetPengecekanOldRoom.data[0].qf1;
                    qf2 = isgetPengecekanOldRoom.data[0].qf2;
                    qf3 = isgetPengecekanOldRoom.data[0].qf3;
                    qf4 = isgetPengecekanOldRoom.data[0].qf4;
                    pax = qm1 + qm2 + qm3 + qm4 + qf1 + qf2 + qf3 + qf4;

                    apakah_nomor_member = parseInt(kode_member);
                    if (isNaN(apakah_nomor_member) == true) {
                        apakah_nomor_member = false;
                    }
                    else {
                        apakah_nomor_member = true;
                    }

                    if (rcp_sisa_checkin >= 0) {
                        old_promo_rcp = await new CheckinProses().getPromoRcp(db, old_kode_rcp, 0);
                        promo = old_promo_rcp;
                    }
                    else if ((rcp_sisa_checkin < 0) && (sisa_checkin > 0)) {
                        old_promo_rcp_room_ext = await new CheckinProses().getPromoRcp(db, old_kode_rcp, 1);
                        promo = old_promo_rcp_room_ext;
                    }
                }
            }
        }

        if ((isgetPengecekanOldRoom.data[0].kamar_untuk_checkin == true) && (isgetPengecekanOldRoom.data[0].jumlah_tamu == 0)) {
            console.log(room + " Data kamar informasi checkin belum di lengkapi");
            logger.info(room + " Data kamar informasi checkin belum di lengkapi");
            dataResponse = new ResponseFormat(false, null, room + " Data kamar informasi checkin belum di lengkapi");
            res.send(dataResponse);
        }
        else if (alasan_transfer_ == '') {
            console.log(room + " alasan_transfer_ Tidak Boleh Kosong");
            logger.info(room + " alasan_transfer_ Tidak Boleh Kosong");
            formResponseData = { keterangan: room + " alasan_transfer_ Tidak Boleh Kosong" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if (old_jumlah_tamu == 0) {
            console.log(old_room + " Kamar Lama Belum di lengkapi data");
            logger.info(old_room + " Kamar Lama Belum di lengkapi data");
            formResponseData = { keterangan: old_room + "Kamar Lama Belum di lengkapi data" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if (totalDurasiCekinMenit == 0) {
            console.log(old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol");
            logger.info(old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol");
            formResponseData = { keterangan: old_room + " Sisa Durasi Jam / Menit Tidak Boleh Nol" };
            dataResponse = new ResponseFormat(false, null, formResponseData);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == "1")) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah expired");
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == "2") &&
            (isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception != old_kode_rcp)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sedang digunakan checkin di reception " +
                isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher != false) &&
            (isGetCekAktifKondisiVoucher.data[0].status_voucher_aktif == 0)) {
            dataResponse = new ResponseFormat(false, null, voucher + " non aktif sudah digunakan checkin di reception " + isGetCekAktifKondisiVoucher.data[0].voucher_sudah_digunanakan_di_reception);
            res.send(dataResponse);
        }
        else if ((voucher != '') && (voucher !== undefined) &&
            (isGetCekAktifKondisiVoucher == false)) {
            dataResponse = new ResponseFormat(false, null, voucher + " voucher tidak terdaftar");
            res.send(dataResponse);
        }
        else {
            if (isgetPengecekanRoomReady != false) {
                jenis_kamar = isgetPengecekanRoomReady.data[0].jenis_kamar;
                kapasitas_kamar = isgetPengecekanRoomReady.data[0].kapasitas;
                kapasitas_kamar = parseInt(kapasitas_kamar);

                if (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == 1) {

                    if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                        if (isgetPengecekanRoomReady.data[0].status_checksound == 1) {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan CheckSound");
                            res.send(dataResponse);
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, room + " Sedang digunakan Checkin");
                            res.send(dataResponse);
                        }
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_checkout == 1) {
                        dataResponse = new ResponseFormat(false, null, room + " Sedang Opr Dibersihkan");
                        res.send(dataResponse);
                    }
                    else if (isgetPengecekanRoomReady.data[0].status_kamar_ready_untuk_checkin == 1) {
                        console.log(room + " Ready untuk Checkin, Durasi checkin " + sisa_checkin + " Menit");
                        logger.info(room + " Ready untuk Checkin, Durasi checkin " + sisa_checkin + " Menit");

                        if (isgetPengecekanOldRoom != false) {

                            if (sisa_checkin > 0) {

                                shift = await new Shift().getShift(db);
                                date_trans_Query = await new Shift().getDateTransQuery(shift);
                                finalShift = await new Shift().getFinalShift(shift);

                                var kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
                                var kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);
                                var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
                                var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);

                                if (apakah_sekarang_malam_besok_libur.state == true) {
                                    mbl = '1';
                                }
                                else {
                                    mbl = '0';
                                }

                                if ((kode_rcp != false) && (kode_ivc != false)) {
                                    var isGetCekReceptionIhp_rcp = await new KodeTransaksi().getCekReceptionIhp_rcp(db, kode_rcp, room);
                                    if (isGetCekReceptionIhp_rcp == false) {

                                        var isGetCekInvoiceIhp_Ivc = await new KodeTransaksi().getCekInvoiceIhp_Ivc(db, kode_ivc, room);
                                        if (isGetCekInvoiceIhp_Ivc == false) {

                                            var isprosesQuery = await
                                                new CheckinProses().insertIhpRcp(db,
                                                    kode_rcp,
                                                    finalShift,
                                                    kode_member,
                                                    nama_member,
                                                    room,
                                                    durasi_jam,
                                                    durasi_menit,
                                                    dateTambahan,
                                                    qm1,
                                                    qm2,
                                                    qm3,
                                                    qm4,
                                                    qf1,
                                                    qf2,
                                                    qf3,
                                                    qf4,
                                                    pax,
                                                    hp,
                                                    uang_muka,
                                                    old_id_payment_uang_muka,
                                                    uang_voucher,
                                                    chusr,
                                                    mbl,
                                                    "1",
                                                    kode_ivc,
                                                    keterangan,
                                                    date_trans_Query,
                                                    status_promo,
                                                    "-1",
                                                    "");

                                            if (isprosesQuery == true) {
                                                isprosesQuery = await new CheckinProses().insertIhpIvc(db,
                                                    kode_ivc,
                                                    finalShift,
                                                    kode_rcp,
                                                    kode_member,
                                                    nama_member,
                                                    room,
                                                    0,
                                                    old_kode_ivc,
                                                    chusr,
                                                    date_trans_Query,
                                                    jenis_kamar);
                                                if (isprosesQuery == true) {

                                                    await new CheckinProses().updateInvoiceIhpRcp(db, kode_ivc, kode_rcp, room);

                                                    isprosesQuery = await new CheckinProses().insertIhpRoomCheckin(db, room, kode_rcp);
                                                    if (isprosesQuery == true) {

                                                        isprosesQuery = await new CheckinProses().updateIhpRoomCheckIn(db, kode_rcp, nama_member, pax, dateTambahan, eventAcara, room);
                                                        if (isprosesQuery == true) {

                                                            var isDeleteIHP_Rcp_DetailsRoomQuery = await new TarifKamar().deleteIhpRcpDetailsRoom(db, kode_rcp);
                                                            if (isDeleteIHP_Rcp_DetailsRoomQuery != false) {

                                                                var isGetRcpCheckinCheckoutPlusExtend = await new CheckinProses().getRcpCheckinCheckoutPlusExtend(db, kode_rcp);
                                                                if (isGetRcpCheckinCheckoutPlusExtend.state == true) {

                                                                    if (apakah_sekarang_malam_besok_libur.state == true) {
                                                                        nomor_hari = '8';
                                                                    }
                                                                    else if (apakah_sekarang_tanggal_libur.state == true) {
                                                                        nomor_hari = '9';
                                                                    }
                                                                    else {
                                                                        nomor_hari = isGetRcpCheckinCheckoutPlusExtend.data[0].nomor_hari_ini;
                                                                    }
                                                                    console.log(kode_rcp + " nomor hari " + nomor_hari);
                                                                    logger.info(kode_rcp + " nomor hari " + nomor_hari);

                                                                    nomor_hari_ = parseInt(nomor_hari);
                                                                    var checkin = isGetRcpCheckinCheckoutPlusExtend.data[0].checkin;
                                                                    var checkout = isGetRcpCheckinCheckoutPlusExtend.data[0].checkout_ditambah_extend;

                                                                    var isGetTarifPerjamRoom = await new TarifKamar().getTarifPerjamRoom(db, jenis_kamar, nomor_hari, checkin, checkout);
                                                                    if (isGetTarifPerjamRoom.state == true) {
                                                                        for (a = 0; a < isGetTarifPerjamRoom.length; a++) {
                                                                            var overpax_tarif = parseFloat(isGetTarifPerjamRoom.data[a].overpax);
                                                                            var kamar_tarif = parseFloat(isGetTarifPerjamRoom.data[a].tarif);

                                                                            await new TarifKamar().insertIHPRcpDetailsRoom(db, kode_rcp, jenis_kamar,
                                                                                nomor_hari_, overpax_tarif, kamar_tarif,
                                                                                isGetTarifPerjamRoom.data[a].Time_Start_Dmy, isGetTarifPerjamRoom.data[a].Time_Finish_Dmy);
                                                                        }
                                                                    }

                                                                    //get promo kamar baru                                                                            
                                                                    if (isGetTarifPerjamRoom.state == true) {
                                                                        if (promo != false) {
                                                                            for (a = 0; a < promo.length; a++) {
                                                                                isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                                isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                                if (isgetPromoRoom.state == true) {
                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, kode_rcp);
                                                                                    }
                                                                                }

                                                                                if (isgetPromoFood.state == true) {
                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(db, promo.data[a].promo, totalDurasiCekinMenit, jenis_kamar, room, kode_rcp);

                                                                                    }
                                                                                }
                                                                            }
                                                                        }

                                                                        if ((old_id_payment_uang_muka != 0) && (uang_muka > 0)) {
                                                                            await new CheckinProses().updateIhpUangMukaNonCash(db, old_kode_rcp, kode_rcp);
                                                                        }

                                                                        //Mengambil nilai sewa kamar baru
                                                                        var isgetTotalTarifKamarDanOverpax = await new TarifKamar().getTotalTarifKamarDanOverpax(db, kode_rcp, kapasitas_kamar, pax);
                                                                        if (isgetTotalTarifKamarDanOverpax != false) {

                                                                            if (isGetCekAktifKondisiVoucher != false) {
                                                                                if (
                                                                                    (isGetCekAktifKondisiVoucher.data[0].status_voucher_expired == 0) &&
                                                                                    (isGetCekAktifKondisiVoucher.data[0].sisa_waktu_voucher_hari_ini_menit > 60)
                                                                                ) {
                                                                                    //free voucher                                                                         
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                        nilai_uang_voucher = await new Voucher().getTotalNilaiPotonganVoucher(db, kode_rcp, voucher);
                                                                                        uang_voucher = nilai_uang_voucher;
                                                                                    }
                                                                                    //gift voucher
                                                                                    else if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                        uang_voucher = isGetCekAktifKondisiVoucher.data[0].nilai;
                                                                                    }
                                                                                    await new CheckinProses().updateIhpVcrSedangDipakaiCheckin(db, voucher, 2);
                                                                                }
                                                                            }
                                                                            await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, kode_rcp);
                                                                            tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpax.overpax);
                                                                            total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpax.sewa_kamar);
                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, kode_rcp);
                                                                            charge_overpax = tarif_overpax;

                                                                            //Mengambil nilai promo kamar sewa kamar baru
                                                                            var isgetTotalPromoRoom = await new PromoRoom().getTotalPromoRoom(db, kode_rcp);

                                                                            if (isgetTotalPromoRoom != false) {
                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoom, kode_rcp);
                                                                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, isgetTotalPromoRoom);
                                                                                await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, kode_rcp);
                                                                                total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoom;
                                                                                console.log(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                logger.info(kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                            }
                                                                            else {
                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, kode_rcp);
                                                                                await new PromoRoom().insertIhpDetailPromo(db, kode_rcp, kode_ivc, 0);
                                                                            }

                                                                            if (apakah_nomor_member == true) {
                                                                                discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                            }

                                                                            kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                            console.log(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                            logger.info(kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);

                                                                            var isgetNilaiServiceRoom = await new Service().getNilaiServiceRoom(db, total_tarif_kamar + charge_overpax);
                                                                            if (isgetNilaiServiceRoom != false) {
                                                                                nilai_service_room = parseFloat(isgetNilaiServiceRoom);
                                                                            }

                                                                            sewa_kamar_plus_service = parseFloat(isgetNilaiServiceRoom + total_tarif_kamar + charge_overpax);

                                                                            var isgetNilaiPajakRoom = await new Pajak().getNilaiPajakRoom(db, sewa_kamar_plus_service);
                                                                            if (isgetNilaiPajakRoom != false) {
                                                                                nilai_pajak_room = parseFloat(isgetNilaiPajakRoom);
                                                                            }

                                                                            total_tarif_kamar = parseFloat(total_tarif_kamar);
                                                                            var total_kamar = parseFloat(
                                                                                total_tarif_kamar +
                                                                                charge_overpax +
                                                                                nilai_service_room +
                                                                                nilai_pajak_room -
                                                                                nilai_uang_voucher -
                                                                                discount_member_kamar);
                                                                            total_kamar = total_kamar.toFixed(0);

                                                                            var isProsesQueryUpdateIhp_ivc = await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                                                db,
                                                                                total_tarif_kamar,
                                                                                0,
                                                                                charge_overpax,
                                                                                discount_member_kamar,
                                                                                nilai_service_room,
                                                                                nilai_pajak_room,
                                                                                total_kamar,
                                                                                total_kamar,
                                                                                kode_rcp,
                                                                                uang_muka,
                                                                                nilai_uang_voucher
                                                                            );

                                                                            if (isProsesQueryUpdateIhp_ivc != false) {

                                                                                if (nilai_uang_voucher > 0) {
                                                                                    //simpan free voucher jam di ihp_uangVoucher
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 0) {
                                                                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, nilai_uang_voucher);
                                                                                        await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, kode_rcp, nilai_uang_voucher);
                                                                                    }
                                                                                }
                                                                                else if (uang_voucher > 0) {
                                                                                    if (isGetCekAktifKondisiVoucher.data[0].jenis_voucher == 1) {
                                                                                        //simpan gift voucher di ihp_uangVoucher
                                                                                        await new CheckinProses().insertIhpUangVoucher(db, kode_rcp, voucher, uang_voucher);
                                                                                    }
                                                                                }

                                                                                var isProsesinsertHistory = await new History().insertIHPEventTransaction(db, room, chusr, date_trans_Query, "checkin from transfer");
                                                                                console.log(kode_rcp + " End proses new room");
                                                                                logger.info(kode_rcp + " End proses new room");

                                                                                if (isProsesinsertHistory != false) {
                                                                                    console.log(old_kode_rcp + " Start Edit Rcp dan Ivc Old Room");
                                                                                    logger.info(old_kode_rcp + " Start Edit Rcp dan Ivc Old Room");

                                                                                    //jika saat transfer masih menggunakan awal durasi Rcp  tanpa extend
                                                                                    if (rcp_sisa_checkin >= 0) {
                                                                                        var prosesUpdateDurasiIhpRcp = await new CheckinProses().updateDurasiIhpRcp(
                                                                                            db,
                                                                                            rcp_sedang_berjalan_jam,
                                                                                            rcp_sedang_berjalan_menit,
                                                                                            checkin_ditambah_rcp_sedang_berjalan,
                                                                                            old_kode_rcp, old_room,
                                                                                            old_kode_ivc);

                                                                                        if (prosesUpdateDurasiIhpRcp != false) {
                                                                                            await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 0);
                                                                                            //promo rcp kamar extend
                                                                                            await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 1);
                                                                                            await new CheckinProses().deleteIhpExtOldRoomTransfer(db, old_kode_rcp);
                                                                                        }

                                                                                        //edit promo rcp room lama sebelum extend
                                                                                        if (promo != false) {
                                                                                            for (a = 0; a < promo.length; a++) {
                                                                                                isgetPromoRoom = await new PromoRoom().getPromoRoomByRcpCheckin(
                                                                                                    db,
                                                                                                    promo.data[a].promo,
                                                                                                    rcp_sedang_berjalan,
                                                                                                    old_jenis_kamar,
                                                                                                    old_kode_rcp);
                                                                                                isgetPromoFood = await new PromoFood().getPromoFoodByRcpCheckin(
                                                                                                    db,
                                                                                                    promo.data[a].promo,
                                                                                                    rcp_sedang_berjalan,
                                                                                                    old_jenis_kamar,
                                                                                                    old_room,
                                                                                                    old_kode_rcp);

                                                                                                if (isgetPromoRoom.state == true) {

                                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomByRcpCheckin(
                                                                                                            db,
                                                                                                            promo.data[a].promo,
                                                                                                            rcp_sedang_berjalan,
                                                                                                            old_jenis_kamar,
                                                                                                            old_kode_rcp);
                                                                                                    }
                                                                                                }

                                                                                                if (isgetPromoFood.state == true) {
                                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodByRcpChekin(
                                                                                                            db,
                                                                                                            promo.data[a].promo,
                                                                                                            rcp_sedang_berjalan,
                                                                                                            old_jenis_kamar,
                                                                                                            old_room,
                                                                                                            old_kode_rcp);
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                    //jika saat transfer sudah menggunakan durasi extend room
                                                                                    else if ((rcp_sisa_checkin < 0) && (sisa_checkin > 0)) {

                                                                                        var isgetInfoExtendRoom = await new CheckinProses().getInfoExtendRoom(db, old_kode_rcp);
                                                                                        if (isgetInfoExtendRoom != false) {
                                                                                            rcp_ext_sedang_berjalan = parseInt(rcp_ext_sedang_berjalan);
                                                                                            for (a = 0; a < isgetInfoExtendRoom.length; a++) {
                                                                                                console.log(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                logger.info(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);

                                                                                                var sisa_durasi_extend = parseInt(isgetInfoExtendRoom.data[a].total_menit_extend);

                                                                                                if (rcp_ext_sedang_berjalan < sisa_durasi_extend) {

                                                                                                    if ((sisa_durasi_extend > 0) && (rcp_ext_sedang_berjalan == 0)) {
                                                                                                        //sisa durasi extend tidak terpakai di delete
                                                                                                        await new CheckinProses().deleteIhpExtOldRoomTransferBerjalan(
                                                                                                            db, isgetInfoExtendRoom.data[a].tanggal_extend);
                                                                                                        console.log(old_kode_rcp + " sisa durasi extend tidak terpakai di delete " + sisa_durasi_extend);
                                                                                                        logger.info(old_kode_rcp + " sisa durasi extend tidak terpakai di delete " + sisa_durasi_extend);
                                                                                                    }
                                                                                                    if ((rcp_ext_sedang_berjalan < sisa_durasi_extend) && (rcp_ext_sedang_berjalan > 0)) {
                                                                                                        //durasi extend yang sudah dipakai di edit
                                                                                                        console.log(old_kode_rcp + " sisa rcp_ext_sedang_berjalan di edit " + sisa_durasi_extend + " menjadi " + rcp_ext_sedang_berjalan);
                                                                                                        logger.info(old_kode_rcp + " sisa rcp_ext_sedang_berjalan di edit " + sisa_durasi_extend + " menjadi " + rcp_ext_sedang_berjalan);
                                                                                                        var sisa_menit = rcp_ext_sedang_berjalan % 60;
                                                                                                        var sisa_jam = rcp_ext_sedang_berjalan / 60;
                                                                                                        sisa_jam = Math.floor(sisa_jam);
                                                                                                        await new CheckinProses().updateIhpExtOldRoomTransfer(
                                                                                                            db, isgetInfoExtendRoom.data[a].tanggal_extend, sisa_jam, sisa_menit);
                                                                                                        rcp_ext_sedang_berjalan = 0;
                                                                                                    }
                                                                                                    //delete promo rcp extend
                                                                                                    await new CheckinProses().deleteIhpPromoRcp(db, old_kode_rcp, 1);
                                                                                                }
                                                                                                else if (rcp_ext_sedang_berjalan >= sisa_durasi_extend) {
                                                                                                    rcp_ext_sedang_berjalan = rcp_ext_sedang_berjalan - sisa_durasi_extend;
                                                                                                    console.log(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                    logger.info(old_kode_rcp + " rcp_ext_sedang_berjalan " + rcp_ext_sedang_berjalan);
                                                                                                }

                                                                                            }
                                                                                        }

                                                                                        //get promo room  extend lama sebelum nya
                                                                                        if (promo != false) {
                                                                                            for (a = 0; a < promo.length; a++) {
                                                                                                isgetPromoRoom = await new PromoRoom().getPromoExtendRoomOldTransferByRcpCheckOut(
                                                                                                    db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_jenis_kamar, old_kode_rcp);
                                                                                                isgetPromoFood = await new PromoFood().getPromoFoodExtendRoomOldTranferByRcpCheckOut(
                                                                                                    db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_kode_rcp, old_jenis_kamar, old_room);

                                                                                                if (isgetPromoRoom.state == true) {
                                                                                                    if ((isgetPromoRoom.data[0].hasil_start_promo !== null) && (isgetPromoRoom.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoRoom().getDeleteInsertIhpPromoRcpRoomExtendOldTransferByRcpCheckOut(
                                                                                                            db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_jenis_kamar, old_kode_rcp);
                                                                                                    }
                                                                                                }

                                                                                                if (isgetPromoFood.state == true) {
                                                                                                    if ((isgetPromoFood.data[0].hasil_start_promo !== null) && (isgetPromoFood.data[0].hasil_end_promo !== null)) {
                                                                                                        await new PromoFood().getDeleteInsertIhpPromoRcpFoodExtendRoomOldTranferByRcpCheckOut(
                                                                                                            db, promo.data[a].promo, rcp_ext_sedang_berjalan_sebelum_di_reset, old_jenis_kamar, old_room, old_kode_rcp);
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //checkout edit Room lama                                                                                

                                                                                    //mengambil nilai sewa kamar sebelum nya
                                                                                    var isgetTotalTarifKamarDanOverpaxOldRoom = await new TarifKamar().getTotalTarifKamarDanOverpax(
                                                                                        db, old_kode_rcp, old_kapasitas_kamar, old_pax);
                                                                                    if (isgetTotalTarifKamarDanOverpaxOldRoom != false) {
                                                                                        await new TarifKamar().getDeleteInsertIhpDetailSewaKamar(db, old_kode_rcp);
                                                                                        tarif_overpax = parseFloat(isgetTotalTarifKamarDanOverpaxOldRoom.overpax);
                                                                                        total_tarif_kamar = parseFloat(isgetTotalTarifKamarDanOverpaxOldRoom.sewa_kamar);
                                                                                        await new CheckinProses().updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db, total_tarif_kamar, old_kode_rcp);

                                                                                        charge_overpax = tarif_overpax;

                                                                                        //mengambil nilai promo kamar sewa kamar sebelum nya
                                                                                        var isgetTotalPromoRoomOldRoom = await new PromoRoom().getTotalPromoRoom(db, old_kode_rcp);

                                                                                        if (isgetTotalPromoRoomOldRoom != false) {
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, isgetTotalPromoRoomOldRoom, old_kode_rcp);
                                                                                            await new PromoRoom().insertIhpDetailPromo(db, old_kode_rcp, old_kode_ivc, isgetTotalPromoRoomOldRoom);
                                                                                            await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamar(db, old_kode_rcp);
                                                                                            total_tarif_kamar = total_tarif_kamar - isgetTotalPromoRoomOldRoom;
                                                                                            console.log(old_kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                            logger.info(old_kode_rcp + " total_tarif_kamar " + total_tarif_kamar);
                                                                                        }
                                                                                        else {
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonSewaKamar(db, 0, old_kode_rcp);
                                                                                            await new PromoRoom().insertIhpDetailPromo(db, old_kode_rcp, old_kode_ivc, 0);
                                                                                        }

                                                                                        if (apakah_nomor_member == true) {
                                                                                            discount_member_kamar = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar);
                                                                                        }

                                                                                        kamar_plus_overpax = total_tarif_kamar + charge_overpax;
                                                                                        console.log(old_kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);
                                                                                        logger.info(old_kode_rcp + " total_tarif_kamar+charge_overpax " + kamar_plus_overpax);

                                                                                        //mengambil nilai sewa kamar extend sebelum nya
                                                                                        var isgetTotalTarifExtendDanOverpax = await new TarifKamar().getTotalTarifExtendDanOverpax(db, old_kode_rcp, old_kapasitas_kamar, old_pax);
                                                                                        if (isgetTotalTarifExtendDanOverpax != false) {
                                                                                            await new TarifKamar().getDeleteInsertIhpDetailSewaKamarExtend(db, old_kode_rcp);
                                                                                            tarif_overpax_extend_kamar = parseFloat(isgetTotalTarifExtendDanOverpax.overpax);
                                                                                            total_tarif_kamar_extend = parseFloat(isgetTotalTarifExtendDanOverpax.sewa_kamar);
                                                                                            await new CheckinProses().updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon(db, total_tarif_kamar_extend, old_kode_rcp);

                                                                                            charge_overpax_extend = tarif_overpax_extend_kamar;

                                                                                            final_charge_overpax = charge_overpax_extend + charge_overpax;
                                                                                            console.log(kode_rcp + " total charge_overpax+charge_overpax_extend " + final_charge_overpax);
                                                                                            logger.info(kode_rcp + " total charge_overpax+charge_overpax_extend " + final_charge_overpax);

                                                                                            //mengambil nilai promo kamar extend sebelum nya
                                                                                            var isgetTotalPromoRoomExtend = await new PromoRoom().getTotalPromoExtendRoom(db, old_kode_rcp);
                                                                                            if (isgetTotalPromoRoomExtend != false) {
                                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, isgetTotalPromoRoomExtend, old_kode_rcp);
                                                                                                await new PromoRoom().insertIhpDetailPromo(db, old_kode_rcp, old_kode_ivc, isgetTotalPromoRoom + isgetTotalPromoRoomExtend);
                                                                                                await new PromoRoom().getDeleteInsertIhpDetailDiskonSewaKamarExtend(db, old_kode_rcp);
                                                                                                total_tarif_kamar_extend = total_tarif_kamar_extend - isgetTotalPromoRoomExtend;
                                                                                                console.log(old_kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                                                                                logger.info(old_kode_rcp + " total_tarif_kamar_extend " + total_tarif_kamar_extend);
                                                                                            }
                                                                                            else {
                                                                                                await new CheckinProses().updateIhpIvcNilaiInvoiceDiskonExtendKamar(db, 0, old_kode_rcp);
                                                                                            }

                                                                                        }
                                                                                        if (apakah_nomor_member == true) {
                                                                                            discount_member_kamar_extend = await new CheckinProses().getDiskonRoomMember(db, kode_member, total_tarif_kamar_extend);
                                                                                        }
                                                                                        discount_member_kamar = discount_member_kamar + discount_member_kamar_extend;

                                                                                        var isgetNilaiInvoice = await new CheckinProses().getNilaiInvoice(db, old_kode_rcp, old_room);
                                                                                        if (isgetNilaiInvoice.state == true) {
                                                                                            nilai_ivc_total_penjualan = parseFloat(isgetNilaiInvoice.data[0].total_penjualan);
                                                                                            nilai_ivc_charge_lain = parseFloat(isgetNilaiInvoice.data[0].charge_lain);
                                                                                            nilai_ivc_surcharge_kamar = parseFloat(isgetNilaiInvoice.data[0].surcharge_kamar);
                                                                                        }

                                                                                        total_sewa_kamar_extend_plus_overpax =
                                                                                            (total_tarif_kamar +
                                                                                                total_tarif_kamar_extend +
                                                                                                final_charge_overpax +
                                                                                                nilai_ivc_surcharge_kamar) -
                                                                                            0 -
                                                                                            discount_member_kamar;

                                                                                        console.log(old_kode_rcp + " total_sewa_kamar_extend_plus_overpax  " + total_sewa_kamar_extend_plus_overpax);
                                                                                        logger.info(old_kode_rcp + " total_sewa_kamar_extend_plus_overpax  " + total_sewa_kamar_extend_plus_overpax);

                                                                                        var isgetNilaiServiceRoomOldRoom = await new Service().getNilaiServiceRoom(
                                                                                            db, total_sewa_kamar_extend_plus_overpax);
                                                                                        if (isgetNilaiServiceRoomOldRoom != false) {
                                                                                            nilai_service_room = parseFloat(isgetNilaiServiceRoomOldRoom);
                                                                                        }

                                                                                        sewa_kamar_plus_service = parseFloat(
                                                                                            isgetNilaiServiceRoomOldRoom +
                                                                                            total_sewa_kamar_extend_plus_overpax);

                                                                                        var isgetNilaiPajakRoomOldPajak = await new Pajak().getNilaiPajakRoom(
                                                                                            db, sewa_kamar_plus_service);
                                                                                        if (isgetNilaiPajakRoomOldPajak != false) {
                                                                                            nilai_pajak_room = parseFloat(isgetNilaiPajakRoomOldPajak);
                                                                                        }

                                                                                        total_tarif_kamar = parseFloat(total_tarif_kamar);

                                                                                        total_kamar = parseFloat(
                                                                                            total_sewa_kamar_extend_plus_overpax +
                                                                                            nilai_service_room + nilai_pajak_room);
                                                                                        var total_All_ =
                                                                                            total_kamar +
                                                                                            nilai_ivc_total_penjualan +
                                                                                            nilai_ivc_charge_lain;

                                                                                        total_All = total_All_.toFixed(0);
                                                                                    }

                                                                                    await new CheckinProses().updateIhpIvcNilaiInvoice(
                                                                                        db,
                                                                                        total_tarif_kamar,
                                                                                        total_tarif_kamar_extend,
                                                                                        final_charge_overpax,
                                                                                        discount_member_kamar,
                                                                                        nilai_service_room,
                                                                                        nilai_pajak_room,
                                                                                        total_kamar,
                                                                                        total_All,
                                                                                        old_kode_rcp,
                                                                                        uang_muka,
                                                                                        0
                                                                                    );

                                                                                    if (uang_voucher > 0) {
                                                                                        await new CheckinProses().updateIhpRcpNilaiUangVoucher(db, old_kode_rcp, 0);
                                                                                        await new CheckinProses().deleteIhpUangVoucher(db, old_kode_rcp, voucher);
                                                                                    }

                                                                                    await new History().insertIHPEventTransaction(db, old_room, chusr, date_trans_Query, "transfer karena " + alasan_transfer);

                                                                                    console.log(old_kode_rcp + " Finish Edit Rcp dan Ivc Old Room");
                                                                                    logger.info(old_kode_rcp + " Finish Edit Rcp dan Ivc Old Room");

                                                                                    //await new ResetTransaksi().updateIhpRoomCheckout(db, old_room, old_kode_rcp);
                                                                                    await new CheckinProses().prosesCheckout(db, old_room);
                                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, old_room, old_kode_rcp);
                                                                                    await new CheckinProses().updateIhpRcpKamarTransfer(db, old_kode_rcp, old_room, old_kode_ivc, alasan_transfer);
                                                                                    await new CheckinProses().updateIhpIvcKamarTransfer(db, old_kode_rcp, old_room, old_kode_ivc);
                                                                                    //end checkout edit Room lama

                                                                                    //edit Sol Status Input/terima belum terkirim kamar lama ke kamar baru
                                                                                    var old_slip_order_status_input = await new CheckinProses().getSlipOrderOldRoomStatusInputTerima(db, old_kode_rcp);
                                                                                    if (old_slip_order_status_input != false) {
                                                                                        for (a = 0; a < +old_slip_order_status_input.length; a++) {
                                                                                            if (kode_rcp, old_slip_order_status_input[a].order_qty_terkirim == 0) {
                                                                                                await new CheckinProses().updateSlipOrderStatusInputTerima(db, kode_rcp, old_slip_order_status_input[a].slip_order, room);
                                                                                            }
                                                                                            if (old_slip_order_status_input[a].order_qty_terkirim > 0) {
                                                                                                var kode_sol = await new KodeTransaksi().getSolCode(db, finalShift);
                                                                                                var old_slip_order = await new CheckinProses().getSlipOrderOldRoomStatusProsesSebagian(db, old_slip_order_status_input[a].slip_order);
                                                                                                var b;
                                                                                                for (b = 0; b < +old_slip_order.length; b++) {
                                                                                                    //jika orderan  diterima dapur tapi sama sekali belum di  DO ke  room
                                                                                                    if (old_slip_order[b].order_qty_terkirim == 0) {
                                                                                                        await new CheckinProses().updateSodStatusInputTerima(db, old_slip_order[b].slip_order, kode_sol, old_slip_order[b].inventory);
                                                                                                        await new CheckinProses().updateSodPromoStatusInputTerima(db, old_slip_order[b].slip_order, kode_sol, old_slip_order[b].inventory);

                                                                                                    }
                                                                                                    //jika orderan  diterima dapur tapi sudah di  do sebagian ke  room
                                                                                                    if (old_slip_order[b].order_qty_belum_terkirim != 0) {
                                                                                                        await new CheckinProses().insertNewSodTerkirimSebagianRoomTransfer(db, old_slip_order[b].slip_order, kode_sol, old_slip_order[b].inventory, old_slip_order[b].order_qty_belum_terkirim, old_slip_order[b].price);
                                                                                                        await new CheckinProses().insertNewSodPromoTerkirimSebagianRoomTransfer(db, old_slip_order[b].slip_order, kode_sol, old_slip_order[b].inventory, old_slip_order[b].quantity, old_slip_order[b].order_qty_belum_terkirim);

                                                                                                        await new CheckinProses().updateOldSodStatusProsesSebagian(db, old_slip_order[b].slip_order, old_slip_order[b].order_qty_terkirim, old_slip_order[b].inventory, old_slip_order[b].price);
                                                                                                        if (old_slip_order[b].harga_promo > 0) {
                                                                                                            await new CheckinProses().updateOldSodPromoStatusProsesSebagian(db, old_slip_order_status_input[a].slip_order, (old_slip_order[b].order_qty_terkirim * old_slip_order[b].harga_promo_per_item), old_slip_order[b].inventory);
                                                                                                        }

                                                                                                    }
                                                                                                }
                                                                                                await new CheckinProses().insertNewSolRoomTransfer(db, old_slip_order_status_input[a].slip_order, kode_sol, kode_rcp, room);
                                                                                            }
                                                                                        }

                                                                                    }

                                                                                    var client_pos = dgram.createSocket('udp4');
                                                                                    pesan = "FRONT_OFFICE_ROOM_CHECKIN";
                                                                                    ip_address = req.config.ip_address_pos;
                                                                                    port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                                                                    if ((ip_address !== false) && (port !== false)) {
                                                                                        port = port.recordset[0].server_udp_port;
                                                                                        //ip_address = ip_address.recordset[0].ip_address;
                                                                                        port = parseInt(port);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal FRONT_OFFICE_ROOM_CHECKIN to POINT OF SALES " + ip_address);
                                                                                        client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            client_pos.close();
                                                                                        });
                                                                                    }

                                                                                    var client_timer_vod2b = dgram.createSocket('udp4');
                                                                                    pesan = "TIMER VOD2B";
                                                                                    pesan = "Room " + old_room + " Transfer Ke Room " + room;
                                                                                    ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                                                                    port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                                                                    if ((ip_address !== false) && (port !== false)) {
                                                                                        port = port.recordset[0].server_udp_port;
                                                                                        ip_address = ip_address.recordset[0].ip_address;
                                                                                        port = parseInt(port);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B " + ip_address);
                                                                                        client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            client_timer_vod2b.close();
                                                                                        });
                                                                                    }

                                                                                    var server_udp_room_sign = dgram.createSocket('udp4');
                                                                                    pesan = "Room " + room + " Checkin";
                                                                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                                                                    if ((ip_address !== false)) {
                                                                                        ip_address = ip_address.recordset[0].IP_Address;
                                                                                        port = parseInt(7082);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                                                                        server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            server_udp_room_sign.close();
                                                                                        });
                                                                                    }

                                                                                    var server_udp_room_sign_new = dgram.createSocket('udp4');
                                                                                    pesan = "Room " + old_room + " Checkout";
                                                                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, old_room);
                                                                                    if ((ip_address !== false)) {
                                                                                        ip_address = ip_address.recordset[0].IP_Address;
                                                                                        port = parseInt(7082);
                                                                                        panjang_pesan = pesan.length;
                                                                                        panjang_pesan = parseInt(panjang_pesan);
                                                                                        logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                                                                        server_udp_room_sign_new.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                                                            server_udp_room_sign_new.close();
                                                                                        });
                                                                                    }


                                                                                    var finish = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                                                                                    logger.info("-> Start " + start + "-> Finish proses transfer " + finish + "->");
                                                                                    console.log("-> Start " + start + "-> Finish proses transfer " + finish + "->");

                                                                                    formResponseData = {
                                                                                        room: room,
                                                                                        kode_rcp: kode_rcp
                                                                                    };
                                                                                    dataResponse = new ResponseFormat(true, formResponseData);
                                                                                    res.send(dataResponse);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            //gagal Checkin RoomHarus di reset
                                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                            dataResponse = new ResponseFormat(false, null, kode_rcp + "  gagal isgetTotalTarifKamarDanOverpax");
                                                                            res.send(dataResponse);
                                                                        }
                                                                    }
                                                                    else {
                                                                        //gagal Checkin RoomHarus di reset
                                                                        await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                        await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                        dataResponse = new ResponseFormat(false, null, kode_rcp + "  gagal isGetTarifPerjamRoom");
                                                                        res.send(dataResponse);
                                                                    }
                                                                }
                                                                else {
                                                                    //gagal Checkin RoomHarus di reset
                                                                    await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpRoomCheckin(db, oom, kode_rcp);
                                                                    await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isGetRcpCheckinCheckoutPlusExtend get data checkin checkout");
                                                                    res.send(dataResponse);
                                                                }
                                                            }
                                                            else {
                                                                //gagal Checkin RoomHarus di reset
                                                                await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                                await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                                await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal Delete From IHP_Rcp_DetailsRoom");
                                                                res.send(dataResponse);
                                                            }
                                                        }
                                                        else {
                                                            //gagal Checkin RoomHarus di reset
                                                            await new ResetTransaksi().updateIhpRoomCheckout(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpRoomCheckin(db, room, kode_rcp);
                                                            await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                            await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                            dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery reset checkOutRoomQuery");
                                                            res.send(dataResponse);
                                                        }
                                                    }
                                                    else {
                                                        await new ResetTransaksi().deleteIhpIvc(db, room, kode_rcp, kode_ivc);
                                                        await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RoomCheckinQuery");
                                                        res.send(dataResponse);
                                                    }
                                                }
                                                else {
                                                    await new ResetTransaksi().deleteIhpRcp(db, room, kode_rcp, kode_ivc);
                                                    dataResponse = new ResponseFormat(false, null, kode_ivc + " gagal isprosesQuery insertIHP_IvcQuery");
                                                    res.send(dataResponse);
                                                }
                                            }
                                            else {
                                                dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal isprosesQuery insertIHP_RcpQuery");
                                                res.send(dataResponse);
                                            }
                                        }
                                        else {
                                            dataResponse = new ResponseFormat(false, null, kode_ivc + " sudah pernah dipakai ");
                                            res.send(dataResponse);
                                        }
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, kode_rcp + " sudah pernah dipakai ");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    dataResponse = new ResponseFormat(false, null, kode_rcp + " gagal get kode_rcp kode_ivc ");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, old_room + " tidak bisa transfer durasi Checkin habis");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, old_room + " Room Tidak Terdaftar");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, room + " Kamar Tidak Ready Checkin");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " Bukan Kamar Untuk Checkin");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, room + " Room Tidak Terdaftar");
                res.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

exports.submitSignImage = async function (req, res) {
    try {
        logger = req.log;
        //var file = req.files.sign;
        var file = req.files;
        db = await new DBConnection().getPoolConnection();
        logger = req.log;

        var dir = './images';
        var dir_sign = './images/sign_checkin_rcp';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(dir_sign)) {
            fs.mkdirSync(dir_sign);
        }
        var kode_rcp = file.files.originalFilename.substring(0, 14);
        //var filename = file.files.originalFilename.split('.').slice(0, -1).join('.');

        // File destination.txt will be created or overwritten by default.
        //fs.copyFile(file.files.path, "./images/sign_checkin_rcp/" + file.files.originalFilename, (err) => {
        fs.copyFile(file.files.path, "./images/sign_checkin_rcp/" + kode_rcp + ".jpg", (err) => {
            if (err) {
                console.log("Error " + err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            }
            else {
                console.log(file.files.path + ' was copied to images/sign_checkin_rcp/' + file.files.originalFilename);
            }
        });

        var prosesPpdateIhpRcpPathSign = await new CheckinProses().updateIhpRcpPathSign(db, kode_rcp, "images/sign_checkin_rcp/" + kode_rcp + ".jpg");
        if (prosesPpdateIhpRcpPathSign != false) {
            dataResponse = new ResponseFormat(true, null, "images/sign_checkin_rcp/" + file.files.originalFilename);
            res.send(dataResponse);

        }

        /* var storage_option = multer.diskStorage({
             destination: function (req, file, cb) {
                 //cb(null, path.join(__dirname, "./images"));
                 //cb(null, path.join(__dirname, "./images"));
                 //cb(null, __dirname);
                 cb(null, "D:/ainul/ProjectPOS/serverfrontoffice_ainul_pc_branch/images/");
             },
             // konfigurasi penamaan file yang unik
             filename: function (req, file, cb) {
                 cb(
                     null,
                     //file.originalFilename.toLowerCase() + "-" + Date.now() + path.extname(file.originalname)
                     //file.originalFilename.toLowerCase() + "-" + Date.now() + path.extname(file.originalFilename)
                     //Date.now() + file.originalFilename.toLowerCase();
                     file.originalFilename.toLowerCase()
                 );
             },
         });
 
         //var upload = multer({ storage: storage });
         //var upload = multer({ storage: storage_option }).single('file');
         var upload = multer({ storage: storage_option }).single( file.originalFilename.toLowerCase());
         dataResponse = new ResponseFormat(false, null, upload);
         res.send(dataResponse);  */

    } catch (err) {
        console.log(err);
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.submiCheckOutRoom = async function (req, res) {
    // TODO : checkout room
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procCheckOutRoom(req, res);
};

async function _procCheckOutRoom(req, res) {
    try {
        var room = req.body.room;
        var chusr = req.body.chusr;
        var date_trans_Query;

        var shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);

        var isProsesGetReception = await new CheckinProses().getReception(db, room);
        if (isProsesGetReception != false) {
            var isProsesGetSummary = await new CheckinProses().getSummary(db, room, isProsesGetReception);
            if (isProsesGetSummary != false) {
                var isProsesDeleteRoomCheckIn = await new CheckinProses().prosesDeleteIhpRoomCheckin(db, room);
                if (isProsesDeleteRoomCheckIn == true) {
                    console.log(room + " Sukses DeleteRoomCheckIn ");
                    logger.info(room + " Sukses DeleteRoomCheckIn ");

                    var isProsesDeleteRoomCheckIn2 = await new CheckinProses().prosesDeleteIhpRoomCheckinKedua(db);
                    if (isProsesDeleteRoomCheckIn2 == true) {
                        console.log(room + " Sukses DeleteRoomCheckIn2 ");
                        logger.info(room + " Sukses DeleteRoomCheckIn2 ");

                        var isProsesDeleteRoom10Menit = await new CheckinProses().prosesDeleteIhpRoom10Menit(db, room);
                        if (isProsesDeleteRoom10Menit == true) {
                            console.log(room + " Sukses DeleteRoom10Menit ");
                            logger.info(room + " Sukses DeleteRoom10Menit ");

                            var isProsesCheckOutRoomQuery = await new CheckinProses().prosesCheckout(db, room);
                            if (isProsesCheckOutRoomQuery == true) {
                                console.log(room + " Sukses CheckOutRoomQuery ");
                                logger.info(room + " Sukses CheckOutRoomQuery ");

                                var isInsert_IHP_EventLog_query = await new History().insertIHP_EventLog(
                                    db, room, date_trans_Query,
                                    "Checkout Room " + room + " User " + chusr
                                );
                                if (isInsert_IHP_EventLog_query == true) {
                                    console.log(room + " Sukses isInsert_IHP_EventLog_query ");
                                    logger.info(room + " Sukses isInsert_IHP_EventLog_query ");

                                    var client_pos = dgram.createSocket('udp4');
                                    pesan = "CHECKIN_ANDROID_FRONT_OFFICE";
                                    ip_address = await new IpAddressService().getIpAddress(db, "FRONT OFFICE");
                                    port = await new IpAddressService().getUdpPort(db, "FRONT OFFICE");
                                    if ((ip_address !== false) && (port !== false)) {
                                        port = port.recordset[0].server_udp_port;
                                        ip_address = ip_address.recordset[0].ip_address;
                                        port = parseInt(port);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal CHECKIN_ANDROID_FRONT_OFFICE to FRONT OFFICE " + ip_address);
                                        client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            client_pos.close();
                                        });
                                    }

                                    var client_timer_vod2b = dgram.createSocket('udp4');
                                    pesan = "TIMER VOD2B";
                                    pesan = "Room " + room + " Checkout";
                                    ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                    port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                    if ((ip_address !== false) && (port !== false)) {
                                        port = port.recordset[0].server_udp_port;
                                        ip_address = ip_address.recordset[0].ip_address;
                                        port = parseInt(port);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B " + ip_address);
                                        client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            client_timer_vod2b.close();
                                        });
                                    }

                                    var server_udp_room_sign = dgram.createSocket('udp4');
                                    pesan = "Room " + room + " Checkout";
                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                    if ((ip_address !== false)) {
                                        ip_address = ip_address.recordset[0].IP_Address;
                                        port = parseInt(7082);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                        server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            server_udp_room_sign.close();
                                        });
                                    }

                                    formResponseData = {
                                        room: room,
                                        Kamar: room
                                    };
                                    // TODO :: success checkout
                                    dataResponse = new ResponseFormat(true, formResponseData);
                                    res.send(dataResponse);
                                }
                                else {
                                    console.log(room + " Gagal isInsert_IHP_EventLog_query");
                                    logger.info(room + " Gagal isInsert_IHP_EventLog_query");
                                    dataResponse = new ResponseFormat(false, null, room + " Gagal isInsert_IHP_EventLog_query");
                                    res.send(dataResponse);
                                }
                            }
                            else {
                                console.log(room + " Gagal CheckOutRoomQuery");
                                logger.info(room + " Gagal CheckOutRoomQuery");
                                dataResponse = new ResponseFormat(false, null, room + " Gagal CheckOutRoomQuery");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            console.log(room + " Gagal DeleteRoom10Menit");
                            logger.info(room + " Gagal DeleteRoom10Menit");
                            dataResponse = new ResponseFormat(false, null, room + " Gagal DeleteRoom10Menit");
                            res.send(dataResponse);
                        }
                    }
                }
                else {
                    console.log(room + " Gagal DeleteRoomCheckIn");
                    logger.info(room + " Gagal DeleteRoomCheckIn");
                    dataResponse = new ResponseFormat(false, null, room + " Gagal DeleteRoomCheckIn");
                    res.send(dataResponse);
                }
            } else if (isProsesGetSummary == false) {
                dataResponse = new ResponseFormat(false, null, " Room Belum Dibayar");
                res.send(dataResponse);
            }

        } else {
            dataResponse = new ResponseFormat(false, null, room + " Room Belum di Checkin");
            res.send(dataResponse);
        }

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.submitPrintTagihanRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procPrintTagihanRoom(req, res);
};

async function _procPrintTagihanRoom(req, res) {
    try {

        var room = req.params.roomcode;
        var chusr = req.body.chusr;
        var date_trans_Query;
        var shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);
        var isProsesGetReception = await new CheckinProses().getReception(db, room);
        var isgetPengecekanRoom = await new Room().getPengecekanRoomReady(db, room);
        var slip_order_nggantung = await new CheckinProses().getSlipOrderBelumDiProses(db, isProsesGetReception);

        if (slip_order_nggantung != false) {
            dataResponse = new ResponseFormat(false, null, "Ada pesanan yang belum di proses!");
            logger.info("Ada Slip Order Yang belum di proses");
            res.send(dataResponse);
        }
        else if (isgetPengecekanRoom.data[0].pax == 0) {
            dataResponse = new ResponseFormat(false, null, "Data Checkin Belum Dilengkapi");
            logger.info("Data Checkin Belum Dilengkapi");
            res.send(dataResponse);
        }
        else if (isgetPengecekanRoom.data[0].status_kamar == 3) {
            dataResponse = new ResponseFormat(false, null, "Tagihan Sudah pernah tercetak, Untuk Cetak Ulang menggunakan Aplikasi Pos Lorong Komputer");
            logger.info("Tagihan Sudah pernah tercetak, Untuk Cetak Ulang menggunakan Aplikasi Pos Lorong Komputer");
            res.send(dataResponse);
        }
        else if (isProsesGetReception != false) {
            var isProsesUpdateIhpIvc = await new CheckinProses().updatePrintInvoiceIhpIvc(db, isProsesGetReception);

            if (isProsesUpdateIhpIvc != false) {
                var client_pos = dgram.createSocket('udp4');
                //pesan print
                pesan = "PRINT_INVOICE_POINT_OF_SALES_LORONG";
                ip_address = req.config.ip_address_pos;
                port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                if ((ip_address !== false) && (port !== false)) {
                    port = port.recordset[0].server_udp_port;
                    port = parseInt(port);
                    panjang_pesan = pesan.length;
                    panjang_pesan = parseInt(panjang_pesan);
                    logger.info("Send Sinyal PRINT_INVOICE_POINT_OF_SALES_LORONG to POINT OF SALES");

                    client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (error, bytes) {
                        if (error) {
                            client.close();
                            dataResponse = new ResponseFormat(false, error.message);
                            res.send(dataResponse);
                        } else {
                            console.log('Data sent !!!');
                            formResponseData = {
                                room: room,
                                Kamar: room
                            };
                            // TODO :: print tagihan
                            dataResponse = new ResponseFormat(true, formResponseData);
                            res.send(dataResponse);

                        }
                    });
                }
            } else if (isProsesUpdateIhpIvc == false) {
                dataResponse = new ResponseFormat(false, null, " Room Gagal isProsesUpdateIhpIvc");
                res.send(dataResponse);
            }

        } else {
            dataResponse = new ResponseFormat(false, null, room + " Room Belum di Checkin");
            res.send(dataResponse);
        }

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.submitOprDibersihkanRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procOprDibersihkanRoom(req, res);

};

async function _procOprDibersihkanRoom(req, res) {
    try {
        var room = req.body.room;
        var chusr = req.body.chusr;
        var date_trans_Query;

        var shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);

        var isGetCekRoom = await new Room().getCekRoom(db, room);
        if (isGetCekRoom != false) {
            console.log(room + " Sukses isGetCekRoom ");
            logger.info(room + " Sukses isGetCekRoom ");
            var status_checkin = parseInt(isGetCekRoom.data[0].Status_Checkin);
            var keterangan_connect = parseInt(isGetCekRoom.data[0].Keterangan_Connect);
            var nama_tamu = isGetCekRoom.data[0].Nama_Tamu;
            var reception = isGetCekRoom.data[0].Reception;

            if ((status_checkin == 0) && (keterangan_connect == 2)) {
                console.log(room + " Kamar Belum Di Checkin");
                logger.info(room + " Kamar Belum Di Checkin");
                dataResponse = new ResponseFormat(false, null, room + " Kamar Belum Di Checkin");
                res.send(dataResponse);
            }

            else if ((reception != null) && (status_checkin == 1)) {
                console.log(room + " Kamar belum Di bayar atau belum di checkout");
                logger.info(room + " Kamar belum Di bayar atau belum di checkout");
                dataResponse = new ResponseFormat(false, null, room + " Kamar belum Di bayar atau belum di checkout");
                res.send(dataResponse);
            }
            else
                if (((keterangan_connect == 4) & (nama_tamu == "TESKAMAR")) //checksound
                    | ((keterangan_connect == 4) & (status_checkin == 1)) //checksound
                    | ((keterangan_connect == 1) & (status_checkin == 2)) //Checkout
                    | (keterangan_connect == 1)) { //Checkout
                    var isOprRoomQueryDone = await new CheckinProses().prosesOprClean(db, room);
                    if (isOprRoomQueryDone != false) {
                        console.log(room + " Sukses oprRoomQuery ");
                        logger.info(room + " Sukses oprRoomQuery ");

                        isOprRoomQueryDone = await new CheckinProses().prosesDeleteIhpRoomCheckin(db, room);
                        if (isOprRoomQueryDone != false) {
                            console.log(room + " Sukses deleteRoomCheckin ");
                            logger.info(room + " Sukses deleteRoomCheckin ");

                            isOprRoomQueryDone = await new CheckinProses().prosesDeleteIhpRoom10Menit(db, room);
                            if (isOprRoomQueryDone != false) {
                                console.log(room + " Sukses deleteRoomIHP_Room10mnt ");
                                logger.info(room + " Sukses deleteRoomIHP_Room10mnt ");

                                var isInsert_IHP_EventLog_query = await new History().insertIHP_EventLog(
                                    db, room, date_trans_Query,
                                    "Opr-Dibersihkan Room " + room + " User " + chusr
                                );

                                if (isInsert_IHP_EventLog_query != false) {
                                    //TODO :: clean succsess
                                    console.log(room + " Sukses insert_IHP_EventLog_query ");
                                    logger.info(room + " Sukses insert_IHP_EventLog_query ");

                                    var client_pos = dgram.createSocket('udp4');
                                    pesan = "CHECKIN_ANDROID_FRONT_OFFICE";
                                    ip_address = await new IpAddressService().getIpAddress(db, "FRONT OFFICE");
                                    port = await new IpAddressService().getUdpPort(db, "FRONT OFFICE");
                                    if ((ip_address !== false) && (port !== false)) {
                                        port = port.recordset[0].server_udp_port;
                                        ip_address = ip_address.recordset[0].ip_address;
                                        port = parseInt(port);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal CHECKIN_ANDROID_FRONT_OFFICE to FRONT OFFICE " + ip_address);
                                        client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            client_pos.close();
                                        });
                                    }

                                    var client_timer_vod2b = dgram.createSocket('udp4');
                                    pesan = "TIMER VOD2B";
                                    pesan = "Room " + room + " Clean";
                                    ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
                                    port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
                                    if ((ip_address !== false) && (port !== false)) {
                                        port = port.recordset[0].server_udp_port;
                                        ip_address = ip_address.recordset[0].ip_address;
                                        port = parseInt(port);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B " + ip_address);
                                        client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            client_timer_vod2b.close();
                                        });
                                    }

                                    var server_udp_room_sign = dgram.createSocket('udp4');
                                    pesan = "Room " + room + " Opr Dibersihkan";
                                    ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, room);
                                    if ((ip_address !== false)) {
                                        ip_address = ip_address.recordset[0].IP_Address;
                                        port = parseInt(7082);
                                        panjang_pesan = pesan.length;
                                        panjang_pesan = parseInt(panjang_pesan);
                                        logger.info("Send Sinyal Checkin to Room Sign " + ip_address);
                                        server_udp_room_sign.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                            server_udp_room_sign.close();
                                        });
                                    }

                                    formResponseData = {
                                        room: room,
                                        Kamar: room,
                                        kamar: room
                                    };
                                    dataResponse = new ResponseFormat(true, formResponseData);
                                    res.send(dataResponse);
                                }
                            }
                        }
                    }

                }
        }
        else {
            console.log(room + " gagal isGetCekRoom");
            logger.info(room + " gagal isGetCekRoom");
            dataResponse = new ResponseFormat(false, null, room + " gagal isGetCekRoom");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}
