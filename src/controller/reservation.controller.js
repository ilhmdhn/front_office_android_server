var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var url = require('url').URL;
var fs = require('fs');
var sql = require("mssql");
var logger;
var db;
var cek_koneksi_internet;


var UtilitiesModel = require('../model/UtilitiesModel');
var Room = require('../services/room.service.js');
var ReservationService = require('../services/reservation.service');

exports.getWebReservation = async function (req, res) {
    logger = req.log;
    getWebReservation_(req, res);
};

async function getWebReservation_(req, res) {
    db = await new DBConnection().getPoolConnection();
    var configServer = JSON.parse(fs.readFileSync('setup.json'));

    let reservationService = new ReservationService(req.log);

    var OutletKode = configServer.outlet;
    var ServerIP = configServer.server_ip;
    var ServerPort = configServer.server_port;
    var RsvCode = req.params.reservation;

    var UrlRsv = "http://13.76.167.131:3013/rsv/detailScanBarcode_/" + OutletKode + "/" + RsvCode;
    var UrlMbr = "http://13.76.167.131:3013/mbr/detail_/";
    var UrlRoom = "https://adm.happypuppy.id/MasterRoomType/getInfo/" + OutletKode + "/";
    var ErrorMsg = "";
    var dataRsv = "";
    var dataMbr = "";

    if (typeof OutletKode === 'undefined') {
        ErrorMsg = "Kode outlet belum dilengkapi pada sistem";
    }

    if (typeof RsvCode === 'undefined' || RsvCode === "") {
        ErrorMsg = "Parameter kode reservasi belum ada";
    }

    cek_koneksi_internet = false;
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("!!!---Attention No Internet connection---!!! Can not check Voucher and Member");
            cek_koneksi_internet = false;
            ErrorMsg="!!!---Attention No Internet connection---!!! Can not check Voucher and Member";
        } else {    
            console.log("Internet Connected");
            cek_koneksi_internet = true;
        }
    });

    //TODO : ambil data reservasi
    /*
    0 = pending (menunggu pembayaran)
    1 = approve (berhasil)
    2 = done (selesai) sudah diapakai checkin
    3 = cancel (batal)
    4 = reject
    5 = menunggu Konfirmasi (setelah bayar)
    6 = Kadaluarsa (telat transfer)
    7 = Hangus (tidak datang)

    */
    if (ErrorMsg === "") {
        dataRsv = await UtilitiesModel.getDataAnotherRestServer(UrlRsv);

        if (dataRsv === "" || dataRsv.data === "Data Kosong") {
            ErrorMsg = "Data reservasi tidak ditemukan";
        } else {
            if (dataRsv.data[0].Status == 0) {
                ErrorMsg = "Reservasi Belum Dibayar";
            }
            else if (dataRsv.data[0].Status == 2) {
                ErrorMsg = await reservationService.getReservationInUse(RsvCode);
            }
            else if (dataRsv.data[0].Status == 3) {
                ErrorMsg = "Reservasi telah di cancel";
            }
            else if (dataRsv.data[0].Status == 4) {
                ErrorMsg = "Reservasi ditolak";
            }
            else if (dataRsv.data[0].Status == 5) {
                ErrorMsg = "Reservasi Telah Terbayar Mohon Dikonfirmasi Admin";
            }
            else if (dataRsv.data[0].Status == 6) {
                ErrorMsg = "Reservasi Kadaluarsa (telat transfer)";
            }
            else if (dataRsv.data[0].Status == 7) {
                ErrorMsg = "Reservasi Hangus (tidak datang)";
            }
            else if (dataRsv.data[0].rsv_checkin == 0) {
                ErrorMsg = "Hari Ini " + dataRsv.data[0].Date +
                    " Tanggal Reservasi " + dataRsv.data[0].Date_Trans +
                    " tidak sama dengan tanggal Checkin " + dataRsv.data[0].Tgl_Reservasi;
            }
            else if (dataRsv.data[0].Status == 1) {
                var cek_data_lokal_reservasi = await UtilitiesModel.getReservation(db, req.params.reservation);
                if (cek_data_lokal_reservasi == false) {
                    await UtilitiesModel.insertLokalReservation(db, dataRsv.data[0]);
                }

            }
        }
    }

    //ambil data member
    if (ErrorMsg === "") {
        UrlMbr = UrlMbr + dataRsv.data[0].Member + "/" + ServerIP + "/" + ServerPort;
        dataMbr = await UtilitiesModel.getDataAnotherRestServer(UrlMbr);

        if (dataMbr === "" || dataMbr.data === "Data Kosong") ErrorMsg = "Data reservasi tidak ditemukan";
    }

    //mencari jumlah kamar yang available
    var jenis_room_ready_detail = "";
    if (ErrorMsg === "") {
        jenis_room_ready_detail = await new Room().getJenisRoomReadyDetail(db, dataRsv.data[0].Jenis_Kamar, '');
        if (jenis_room_ready_detail == false) {
            ErrorMsg = "Kamar tidak ditemukan";
        }
    }

    //Mencari data kamar
    var RoomDetails = "";
    if (ErrorMsg === "") {
        UrlRoom = UrlRoom + dataRsv.data[0].RoomTypeID;
        RoomDetails = await UtilitiesModel.getDataAnotherRestServer(UrlRoom);
        if (RoomDetails === "" || RoomDetails === "") ErrorMsg = "Data jenis kamar tidak ditemukan";
    }

    //menyusun parameter

    if (ErrorMsg === "") {
        dataMbr.data[0]["member_reservasi_code"] = RsvCode;
        var reservasi = new Object();
        reservasi.jenis_kamar = dataRsv.data[0].Jenis_Kamar;
        reservasi.jumlah_available = jenis_room_ready_detail.recordset.length;
        reservasi.kapasitas = parseInt(RoomDetails.Pax);
        reservasi.reservasi_hour_duration = dataRsv.data[0].Jam_Sewa;
        reservasi.reservasi_minute_duration = dataRsv.data[0].Menit_Sewa;
        reservasi.reservasi_checkin_time = dataRsv.data[0].Tgl_Reservasi;
        reservasi.reservasi_checkout_time = dataRsv.data[0].Tgl_Checkout;
        /*  reservasi.id_payment_uang_muka = 2;
         reservasi.keterangan_payment_uang_muka = "DEBET";
         reservasi.uang_muka = dataRsv.data[0].Uang_Muka; */
        let payment_reservasi = {
            payment_type: "TRANSFER",
            nominal: dataRsv.data[0].Uang_Muka.toFixed(0),
            bank_name_tf: dataRsv.data[0].Bank_Name,
            bank_account_name_tf: dataRsv.data[0].Bank_Account_Name
        };
        dataMbr.data[0]["reservasi"] = reservasi;
        dataMbr.data[0]["payment_reservasi"] = payment_reservasi;
    }


    if (ErrorMsg != "") {
        console.log(ErrorMsg);
        logger.info(ErrorMsg);
        dataResponse = new ResponseFormat(false, null, ErrorMsg);
        res.send(dataResponse);
    }
    else {


        dataResponse = new ResponseFormat(true, dataMbr.data[0]);
        res.send(dataResponse);
    }
}
