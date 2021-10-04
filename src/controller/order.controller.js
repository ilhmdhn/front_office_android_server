var ResponseFormat = require('../util/response');
var sql = require("mssql");
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var db;
var SioController = require('./realtime/sio.controller');
//npm install printer --build-from-source
//var printer = require('printer');
var dgram = require('dgram');
var configServer = JSON.parse(fs.readFileSync('setup.json'));

var Shift = require('../util/shift');
var KodeTransaksi = require('../util/kode.transaksi');
var History = require('../services/history');
var CheckinProses = require('../services/checkin.proses.js');
var IpAddressService = require('../services/ip.address.service.js');
var ConfigPos = require('../services/config.pos.js');
var Room = require('../services/room.service.js');
let OrderInventoryService = require('../services/order.inventory.service');
var PromoFood = require('../services/promo.food');
var ip_address_printer = configServer.app_printer_ip_fo;
var pesan;
var ip_address;
var port;
var panjang_pesan;

if (ip_address_printer === undefined) {
    ip_address_printer = configServer.server_ip;
}

exports.getInfoPendingOrder = async function (req, res) {
    logger = req.log;
    let orderInventoryService = new OrderInventoryService(logger);
    orderInventoryService.getUnprocessedOrderInventory(req.params.room_code, (hasUnprocessed) => {
        if (hasUnprocessed) {
            res.send(new ResponseFormat(true, null, "Ada pesanan yang belum di proses!"));
        } else {
            res.send(new ResponseFormat(false, ""));
        }
    });
};

exports.submitOrderSingleRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procOrderSingleRoom(req, res);
};

function simpan(kode_sol, isiPrint) {
    return new Promise((resolve, reject) => {
        try {
            fs.writeFile("./images/tmp_print/" + kode_sol + ".txt", isiPrint, function (err) {
                if (err) {
                    console.log(err);
                    resolve(false);
                }
                else {
                    console.log("File Berhasil Disimpan");
                    resolve(true);
                }
            });
        } catch (err) {
            sql.close();
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error print ' + isiQuery);
            resolve(false);
        }
    });
}

async function _procOrderSingleRoom(req, res) {
    try {
        //TODO : 01 init sio
        let sio = new SioController(req.bundleServer.getServer());

        var chusr = req.body.order_user_name;
        var android = req.body.order_model_android;
        var posIp = req.body.order_pos_ip;
        var roomCode = req.body.order_room_code;
        var roomType = req.body.order_room_type;
        var roomDurasiCheckin = req.body.order_room_durasi_checkin;
        var durasi_cekin1 = parseInt(roomDurasiCheckin);
        var rcp = req.body.order_room_rcp;
        var d = new Date();
        var hariKe = d.getDay();
        var date_trans_Query;

        var arrOrderInv = req.body.arr_order_inv;
        var arrOrderQty = req.body.arr_order_qty;
        var arrOrderNotes = req.body.arr_order_notes;
        var arrOrderPrice = req.body.arr_order_price;
        var arrOrderInvName = req.body.arr_order_nama_item;
        var arrOrderInvLocation = req.body.arr_order_location_item;
        var arrFinal_Potongan_Promo = [];
        var status_promo;
        var harga_asli;
        var a;

        var shift = await new Shift().getShift(db);
        var kode_sol = await new KodeTransaksi().getSolCode(db, shift);
        var nama_promo = await new PromoFood().getNamePromoFood(db, rcp);
        date_trans_Query = await new Shift().getDateTransQuery(shift);
        var apakah_ada_barang_kasir = false;
        var apakah_ada_barang_dapur = false;
        var apakah_ada_barang_bar = false;

        for (a = 0; a < arrOrderInv.length; a++) {
            for (b = a + 1; b < arrOrderInv.length; b++) {
                if ((a != b) && (arrOrderInv[a] == arrOrderInv[b])) {
                    arrOrderNotes[a] = "# " + arrOrderQty[a] + " " + arrOrderNotes[a] + " # " + arrOrderQty[b] + " " + arrOrderNotes[b];
                    arrOrderQty[a] = parseInt(arrOrderQty[a]) + parseInt(arrOrderQty[b]);

                    var removed = arrOrderNotes.splice(b, 1);
                    removed = arrOrderQty.splice(b, 1);
                    removed = arrOrderInv.splice(b, 1);
                    removed = arrOrderPrice.splice(b, 1);
                    removed = arrOrderInvName.splice(b, 1);
                    removed = arrOrderInvLocation.splice(b, 1);
                }
            }
        }

        if (nama_promo != false) {
            status_promo = await new PromoFood().getRequirementPromoFood(db, nama_promo);
            if (status_promo == true) {
                for (a = 0; a < arrOrderPrice.length; a++) {
                    harga_asli = parseInt(arrOrderPrice[a]);
                    var final_Potongan_Promo = await new PromoFood().getPotonganPromoFood(db, arrOrderPrice[a], nama_promo, arrOrderInv[a], arrOrderQty[a], roomCode, roomType, durasi_cekin1, hariKe);
                    arrFinal_Potongan_Promo.push(parseInt(final_Potongan_Promo));
                }
            } else if (status_promo == false) {
                for (a = 0; a < arrOrderPrice.length; a++) {
                    arrFinal_Potongan_Promo.push(parseInt(0));
                }
            }
        }

        if (nama_promo != false) {
            status_promo = await new PromoFood().getRequirementPromoFood(db, nama_promo);
            if (status_promo == true) {
                for (a = 0; a < arrOrderPrice.length; a++) {
                    var start_index = a;
                    var number_of_elements_to_remove = 1;
                    harga_asli = parseInt(arrOrderPrice[a]);
                    var final_price_after_potongan = await new PromoFood().getFinalPriceAfterPotonganPromoFood(db,arrOrderPrice[a], nama_promo, arrOrderInv[a], arrOrderQty[a], roomCode, roomType, durasi_cekin1, hariKe);
                    var removed_elements = arrOrderPrice.splice(start_index, number_of_elements_to_remove, final_price_after_potongan);
                }
            }
        }

        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, roomCode);
        if (isgetPengecekanRoomReady != false) {
            if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                if (isgetPengecekanRoomReady.data[0].summary == '') {
                    if (
                        (isgetPengecekanRoomReady.data[0].jumlah_tamu > 0 &&
                            isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == true) ||
                        isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == false) {
                        if (
                            ((isgetPengecekanRoomReady.data[0].sisa_checkin > 0) &&
                                (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == true)) ||
                            (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == false)
                        ) {
                            if (arrOrderInv.length > 0) {

                                var insert_sol_query = " " +
                                    " INSERT INTO ihp_sol " +
                                    " (sliporder, " +
                                    " date, " +
                                    " shift, " +
                                    " reception, " +
                                    " kamar, " +
                                    " status, " +
                                    " chtime, " +
                                    " chusr, " +
                                    " pos, " +
                                    " date_trans, " +
                                    " mobile_pos)" +
                                    " VALUES " +
                                    " ('" + kode_sol + "'," +
                                    " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)," +
                                    " '" + shift + "'," +
                                    " '" + rcp + "'," +
                                    " '" + roomCode + "'," +
                                    " '1'," +
                                    " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)," +
                                    " '" + chusr + "'," +
                                    " '" + req._remoteAddress + "'," +
                                    " " + date_trans_Query + "," +
                                    //"   '" + date_trans + "'," + 
                                    //"   CONVERT(VARCHAR(24),"+date_trans+",114)," +      
                                    " '" + android + "')";

                                var isProsesInsertSol = await new CheckinProses().prosesQuery(db, insert_sol_query);
                                if (isProsesInsertSol == true) {
                                    console.log("Sukses Insert Sol " + kode_sol + " Room  " + roomCode);
                                    logger.info("Sukses Insert Sol " + kode_sol + " Room  " + roomCode);

                                    for (a = 0; a < arrOrderInv.length; a++) {
                                        if (arrOrderQty[a] > 0) {
                                            var insert_sod_query = " " +
                                                " INSERT INTO IHP_Sod " +
                                                " (SlipOrder, " +
                                                " Inventory, " +
                                                " Nama, " +
                                                " Price, " +
                                                " Qty, " +
                                                " Total, " +
                                                " Status, " +
                                                " Location, " +
                                                " Printed, " +
                                                " Note, " +
                                                " CHusr, " +
                                                " Urut) " +
                                                " VALUES " +
                                                " ('" + kode_sol + "'," +
                                                " '" + arrOrderInv[a] + "'," +
                                                " '" + arrOrderInvName[a] + "'," +
                                                " '" + parseFloat(arrOrderPrice[a]) + "'," +
                                                " '" + arrOrderQty[a] + "'," +
                                                " '" + parseFloat((arrOrderPrice[a] * arrOrderQty[a])) + "'," +
                                                " '1'," +
                                                " '" + arrOrderInvLocation[a] + "'," +
                                                " '2'," +
                                                " '" + arrOrderNotes[a] + "'," +
                                                " '" + chusr + "'," +
                                                " " + parseInt(a) + ")";

                                            var isProsesInsertSod = await new CheckinProses().prosesQuery(db, insert_sod_query);
                                            if (isProsesInsertSod == true) {
                                                if (arrOrderInvLocation[a] == "1") {
                                                    apakah_ada_barang_kasir = true;
                                                }
                                                if (arrOrderInvLocation[a] == "2") {
                                                    apakah_ada_barang_dapur = true;
                                                }
                                                if (arrOrderInvLocation[a] == "3") {
                                                    apakah_ada_barang_bar = true;
                                                }

                                                console.log("Sukses Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                                logger.info("Sukses Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                            }
                                            else {
                                                console.log("Gagal Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                                logger.info("Gagal Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                            }
                                        }
                                    }

                                    if (nama_promo != false) {
                                        for (a = 0; a < arrOrderInv.length; a++) {
                                            var insert_sod_promo_query = " " +
                                                " INSERT INTO IHP_Sod_Promo " +
                                                " (SlipOrder, " +
                                                " Inventory, " +
                                                " Promo_Food, " +
                                                " Harga_Promo) " +
                                                " VALUES " +
                                                " ('" + kode_sol + "'," +
                                                " '" + arrOrderInv[a] + "'," +
                                                " '" + nama_promo + "'," +
                                                " '" + parseFloat((arrFinal_Potongan_Promo[a] * arrOrderQty[a])) + "')";

                                            var isProsesInsertSodPromo = await new CheckinProses().prosesQuery(db, insert_sod_promo_query);
                                            if (isProsesInsertSodPromo == true) {

                                                console.log("Sukses Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                                logger.info("Sukses Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                            }
                                            else {
                                                console.log("Gagal Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                                logger.info("Gagal Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                            }
                                        }
                                    }

                                    var status = await new CheckinProses().getStatusSolSod(db, rcp);
                                    var cetak_slip_order_pos = await new ConfigPos().getCetakSlipOrderDiPos(db);
                                    var cetak_slip_order_fo = await new ConfigPos().getCetakSlipOrderDiFo(db);

                                    //untuk cetak print  slip order di FO
                                    if (status != false) {
                                        if (cetak_slip_order_fo == 1) {
                                            var client_fo = dgram.createSocket('udp4');
                                            //pesan print Slip Order Office Front
                                            pesan = "PRINT_SLIP_ORDER_FRONT_OFFICE";
                                            //ip_address = await new IpAddressService().getIpAddress(db, "FRONT OFFICE");
                                            ip_address = req.config.ip_address_fo;
                                            port = await new IpAddressService().getUdpPort(db, "FRONT OFFICE");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                //ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal PRINT_SLIP_ORDER_FRONT_OFFICE to FRONT OFFICE " + ip_address);
                                                client_fo.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_fo.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        if (cetak_slip_order_pos == 1) {
                                            var client_pos = dgram.createSocket('udp4');
                                            //pesan print Slip Order Pos Lorong
                                            pesan = "PRINT_SLIP_ORDER_POINT_OF_SALES_LORONG";
                                            //ip_address = await new IpAddressService().getIpAddress(db, "POINT OF SALES");
                                            ip_address = req.config.ip_address_pos;
                                            port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                //ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal PRINT_SLIP_ORDER_POINT_OF_SALES_LORONG to POINT OF SALES " + ip_address);
                                                client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_pos.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        if (apakah_ada_barang_dapur == true) {
                                            var client_pop = dgram.createSocket('udp4');
                                            //pesan print Slip Order Pos Lorong
                                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                                            ip_address = await new IpAddressService().getIpAddress(db, "KITCHEN");
                                            port = await new IpAddressService().getUdpPort(db, "KITCHEN");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to KITCHEN " + ip_address);
                                                client_pop.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_pop.close();
                                                });
                                            }
                                        }
                                        if (apakah_ada_barang_bar == true) {
                                            var client_bar = dgram.createSocket('udp4');
                                            //pesan print Slip Order Pos Lorong
                                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                                            ip_address = await new IpAddressService().getIpAddress(db, "BAR");
                                            port = await new IpAddressService().getUdpPort(db, "BAR");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to BAR " + ip_address);
                                                client_bar.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_bar.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        //TODO : 02 exec sio
                                        if (apakah_ada_barang_kasir == true) {
                                            let notif_data = {
                                                slip_order: kode_sol,
                                                notif_type: SioController.NEW_ORDER,
                                                room_type: roomType,
                                                room_code: roomCode,
                                                create_chusr: chusr
                                            };
                                            /* sio.getInstance()
                                           .of("/fo-rtc")
                                           .emit(SioController.NEW_ORDER, JSON.stringify(notification));  */
                                            sio.bcNotifySlipOrder(notif_data);

                                        }
                                        res.send(status);
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, "Data Kosong");
                                        res.send(dataResponse);
                                    }

                                }
                                else {
                                    console.log("Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    logger.info("Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    dataResponse = new ResponseFormat(false, null, "Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    res.send(dataResponse);
                                }

                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, roomCode + " Data Slip Order Kosong");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, roomCode + " Waktu Checkin Sudah Habis");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, roomCode + " Data kamar informasi checkin belum di lengkapi");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, roomCode + " Tidak bisa Order karena sudah dibayar");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, roomCode + " Belum Checkin");
                res.send(dataResponse);
            }
        }
        else {
            dataResponse = new ResponseFormat(false, null, roomCode + " Tidak Terdaftar");
            res.send(dataResponse);
        }

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.pembatalanOrder = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procPembatalanOrder(req, res);
};

async function _procPembatalanOrder(req, res) {
    try {
        var sliporder = req.body.order_slip_order;
        var orderInventory = req.body.order_inventory;
        var quantity = req.body.order_qty;
        var quantity1 = parseInt(quantity);
        var rcp = req.body.order_room_rcp;
        var userPos = req.body.order_room_user;
        var device = req.body.order_model_android;
        var date_trans_Query;

        var shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);

        var updateCancelSod = " " +
            "Update IHP_Sod " +
            " set status=2 , " +
            " Qty_Terima=0 , " +
            " Printed=1 , " +
            " Tgl_Terima=" + date_trans_Query + " " +
            " where SlipOrder='" + sliporder + "' " +
            " and status=1 " +
            " and Inventory='" + orderInventory + "'" +
            " and Qty=" + quantity1;

        var revisiSolQuery = " " +
            "Update IHP_Sol " +
            " set " +
            " CHusr='" + userPos + "', " +
            " Date=CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) ," +
            " Date_Trans=" + date_trans_Query + ", " +
            " Mobile_POS='" + device + "' " +
            " where SlipOrder='" + sliporder + "' ";

        var isGetStatusSlipOrder = await new CheckinProses().getStatusSlipOrder(db, sliporder, orderInventory, quantity1);
        if (isGetStatusSlipOrder != false) {
            console.log("Sukses isGetStatusSlipOrder ");
            logger.info("Sukses isGetStatusSlipOrder ");

            if (isGetStatusSlipOrder.Status == '1') {
                var isProsesInsertSol = await new CheckinProses().prosesQuery(db, updateCancelSod);
                if (isProsesInsertSol == true) {
                    console.log("Sukses Update Cancel Sod ");
                    logger.info("Sukses Update Cancel Sod ");

                    var isProsesUpdateSol = await new CheckinProses().prosesQuery(db, revisiSolQuery);
                    if (isProsesUpdateSol == true) {
                        console.log("Sukses Update Revisi Sol ");
                        logger.info("Sukses Update Revisi Sol ");

                        if (isGetStatusSlipOrder.Location == '2') {
                            var client_pop = dgram.createSocket('udp4');
                            //pesan print Slip Order Pos Lorong
                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                            ip_address = await new IpAddressService().getIpAddress(db, "KITCHEN");
                            port = await new IpAddressService().getUdpPort(db, "KITCHEN");
                            if ((ip_address !== false) && (port !== false)) {
                                port = port.recordset[0].server_udp_port;
                                ip_address = ip_address.recordset[0].ip_address;
                                port = parseInt(port);
                                panjang_pesan = pesan.length;
                                panjang_pesan = parseInt(panjang_pesan);
                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to KITCHEN " + ip_address);
                                client_pop.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                    client_pop.close();
                                });
                            }
                        }
                        else if (isGetStatusSlipOrder.Location == '3') {
                            var client_bar = dgram.createSocket('udp4');
                            //pesan print Slip Order Pos Lorong
                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                            ip_address = await new IpAddressService().getIpAddress(db, "BAR");
                            port = await new IpAddressService().getUdpPort(db, "BAR");
                            if ((ip_address !== false) && (port !== false)) {
                                port = port.recordset[0].server_udp_port;
                                ip_address = ip_address.recordset[0].ip_address;
                                port = parseInt(port);
                                panjang_pesan = pesan.length;
                                panjang_pesan = parseInt(panjang_pesan);
                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to BAR " + ip_address);
                                client_bar.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                    client_bar.close();
                                });
                            }
                        }

                        var isProsesInsertEventLog = await new History().insertIHP_EventLog(
                            db, rcp, date_trans_Query,
                            "Android " + device + " " + userPos +
                            " Membatalkan SlipOrder " + sliporder +
                            " " + orderInventory + " Qty:" + quantity1
                        );
                        if (isProsesInsertEventLog == true) {
                            console.log("Sukses insert IHP_EventLog ");
                            logger.info("Sukses insert IHP_EventLog ");
                            var status = await new CheckinProses().getStatusSolSod(db, rcp);

                            if (status !== false) {
                                res.send(status);
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, "Data Kosong");
                                res.send(dataResponse);
                            }
                        }

                    }
                    else {
                        console.log("Gagal Update Cancel Sol ");
                        logger.info("Gagal Update Cancel Sol ");
                        dataResponse = new ResponseFormat(false, null, "Gagal Update Cancel Sol ");
                        res.send(dataResponse);
                    }

                }
                else {
                    console.log("Gagal Update Cancel Sod ");
                    logger.info("Gagal Update Cancel Sod ");
                }

            }
            else if (isGetStatusSlipOrder == '3') {
                dataResponse = new ResponseFormat(false, " Status Order Sudah Diterima dan tidak bisa dibatalkan");
                res.send(dataResponse);
            }
            else if (isGetStatusSlipOrder == '5') {
                dataResponse = new ResponseFormat(false, " Status Order Pesanan Sudah Dikirim dan tidak bisa dibatalkan");
                res.send(dataResponse);
            }
            else if (isGetStatusSlipOrder == '2') {
                dataResponse = new ResponseFormat(false, " Status Order sudah Ditolak/Dibatalkan");
                res.send(dataResponse);
            }
        }

    } catch (error) {
        sql.close();
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.revisiOrder = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procRevisiOrder(req, res);
};

async function _procRevisiOrder(req, res) {
    try {
        var sliporder = req.body.order_slip_order;
        var orderInventory = req.body.order_inventory;
        var quantity = req.body.order_qty;
        var quantity_ = parseInt(quantity);
        var rcp = req.body.order_room_rcp;
        var userPos = req.body.order_room_user;
        var device = req.body.order_model_android;
        var date_trans_Query;
        var quantity_temp = req.body.order_qty_temp;
        var quantity_temp_ = parseInt(quantity_temp);
        var note = req.body.order_note;

        var shift = await new Shift().getShift(db);
        date_trans_Query = await new Shift().getDateTransQuery(shift);

        var isGetStatusSlipOrder = await new CheckinProses().getStatusSlipOrder(db, sliporder, orderInventory, quantity_);
        var isGetStatusSlipOrderPromo = await new CheckinProses().getStatusSlipOrderPromo(db, sliporder, orderInventory);

        if (isGetStatusSlipOrder != false) {
            console.log("Sukses isGetStatusSlipOrder ");
            logger.info("Sukses isGetStatusSlipOrder ");

            var revisiSodQuery = " " +
                "Update IHP_Sod " +
                " set " +
                " Qty=" + quantity_temp_ + ", " +
                " Note='" + note + "', " +
                " Total=" + quantity_temp_ * isGetStatusSlipOrder.Price + " " +
                " where SlipOrder='" + sliporder + "' " +
                " and status=1 " +
                " and Inventory='" + orderInventory + "'" +
                " and Qty=" + quantity_;

            var revisiSolQuery = " " +
                "Update IHP_Sol " +
                " set " +
                " CHusr='" + userPos + "', " +
                " Date=CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) ," +
                " Date_Trans=" + date_trans_Query + ", " +
                " Mobile_POS='" + device + "' " +
                " where SlipOrder='" + sliporder + "' ";

            if (isGetStatusSlipOrder.Status == '1') {
                var isProsesInsertSol = await new CheckinProses().prosesQuery(db, revisiSodQuery);
                if (isProsesInsertSol == true) {
                    console.log("Sukses Update Revisi Sod ");
                    logger.info("Sukses Update Revisi Sod ");

                    if (isGetStatusSlipOrderPromo != false) {
                        if (isGetStatusSlipOrder.Status == '1') {
                            var promo_satuan = isGetStatusSlipOrderPromo.harga_promo / quantity_;
                            var revisiSodPromoQuery = " " +
                                "Update IHP_Sod_Promo " +
                                " set " +
                                " [Harga_Promo]=" + quantity_temp_ * promo_satuan + " " +
                                " where SlipOrder='" + sliporder + "' " +
                                " and Inventory='" + orderInventory + "'";
                            await new CheckinProses().prosesQuery(db, revisiSodPromoQuery);
                        }
                    }

                    var isProsesUpdateSol = await new CheckinProses().prosesQuery(db, revisiSolQuery);
                    if (isProsesUpdateSol == true) {
                        console.log("Sukses Update Revisi Sol ");
                        logger.info("Sukses Update Revisi Sol ");
                        if (isGetStatusSlipOrder.Location == '2') {
                            var client_pop = dgram.createSocket('udp4');
                            //pesan print Slip Order Pos Lorong
                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                            ip_address = await new IpAddressService().getIpAddress(db, "KITCHEN");
                            port = await new IpAddressService().getUdpPort(db, "KITCHEN");
                            if ((ip_address !== false) && (port !== false)) {
                                port = port.recordset[0].server_udp_port;
                                ip_address = ip_address.recordset[0].ip_address;
                                port = parseInt(port);
                                panjang_pesan = pesan.length;
                                panjang_pesan = parseInt(panjang_pesan);
                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to KITCHEN");
                                client_pop.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                    client_pop.close();
                                });
                            }
                        }
                        else if (isGetStatusSlipOrder.Location == '3') {
                            var client_bar = dgram.createSocket('udp4');
                            //pesan print Slip Order Pos Lorong
                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                            ip_address = await new IpAddressService().getIpAddress(db, "BAR");
                            port = await new IpAddressService().getUdpPort(db, "BAR");
                            if ((ip_address !== false) && (port !== false)) {
                                port = port.recordset[0].server_udp_port;
                                ip_address = ip_address.recordset[0].ip_address;
                                port = parseInt(port);
                                panjang_pesan = pesan.length;
                                panjang_pesan = parseInt(panjang_pesan);
                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to BAR");
                                client_bar.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                    client_bar.close();
                                });
                            }
                        }

                        var isProsesInsertEventLog = await new History().insertIHP_EventLog(
                            db, rcp, date_trans_Query,
                            "Android " + device + " " + userPos +
                            " Revisi SlipOrder " + sliporder +
                            " " + orderInventory + " Qty:" + quantity_temp_
                        );
                        if (isProsesInsertEventLog == true) {
                            console.log("Sukses insert IHP_EventLog ");
                            logger.info("Sukses insert IHP_EventLog ");
                            var status = await new CheckinProses().getStatusSolSod(db, rcp);
                            if (status != false) {
                                res.send(status);
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, "Data Kosong");
                                res.send(dataResponse);
                            }
                        }

                    }
                    else {
                        console.log("Gagal Update Sol ");
                        logger.info("Gagal Update Sol ");
                        dataResponse = new ResponseFormat(false, null, "Gagal Update Cancel Sol ");
                        res.send(dataResponse);
                    }

                }
                else {
                    console.log("Gagal Update Sod ");
                    logger.info("Gagal Update Sod ");
                    dataResponse = new ResponseFormat(false, null, "Gagal Update Cancel Sod ");
                    res.send(dataResponse);
                }

            }
            else if (isGetStatusSlipOrder == '3') {
                dataResponse = new ResponseFormat(false, " Status Order Sudah Diterima dan tidak bisa dibatalkan");
                res.send(dataResponse);
            }
            else if (isGetStatusSlipOrder == '5') {
                dataResponse = new ResponseFormat(false, " Status Order Pesanan Sudah Dikirim dan tidak bisa dibatalkan");
                res.send(dataResponse);
            }
            else if (isGetStatusSlipOrder == '2') {
                dataResponse = new ResponseFormat(false, " Status Order sudah Ditolak/Dibatalkan");
                res.send(dataResponse);
            }
        }

    } catch (error) {
        sql.close();
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.submitSlipOrderAndroid = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procSlipOrderAndroid(req, res);
};

async function _procSlipOrderAndroid(req, res) {
    try {
        //TODO : 01 init sio
        let sio = new SioController(req.bundleServer.getServer());

        var chusr = req.body.chusr;
        var android = req.body.model_android;
        var posIp = req.body.ip_address;
        var roomCode = req.body.room;
        var slip_order = req.body.slip_order;

        var roomType;
        var roomDurasiCheckin;
        var rcp;
        var durasi_cekin1;
        var isgetPengecekanRoomReady = await new Room().getPengecekanRoomReady(db, roomCode);
        if (isgetPengecekanRoomReady != false) {
            if (isgetPengecekanRoomReady.data[0].status_checkin == 1) {
                if (isgetPengecekanRoomReady.data[0].summary == '') {
                    if (
                        (isgetPengecekanRoomReady.data[0].jumlah_tamu > 0 &&
                            isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == true) ||
                        isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == false) {
                        if (
                            ((isgetPengecekanRoomReady.data[0].sisa_checkin > 0) &&
                                (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == true)) ||
                            (isgetPengecekanRoomReady.data[0].kamar_untuk_checkin == false)
                        ) {
                            if (slip_order.length > 0) {

                                roomType = isgetPengecekanRoomReady.data[0].jenis_kamar;
                                roomDurasiCheckin = isgetPengecekanRoomReady.data[0].durasi_checkin;
                                durasi_cekin1 = parseInt(roomDurasiCheckin);
                                rcp = isgetPengecekanRoomReady.data[0].reception;

                                var d = new Date();
                                var hariKe = d.getDay();
                                var date_trans_Query;

                                var arrOrderInv = [];
                                var arrOrderQty = [];
                                var arrOrderNotes = [];
                                var arrOrderPrice = [];
                                var arrOrderInvName = [];
                                var arrOrderInvLocation = [];

                                var arrFinal_Potongan_Promo = [];
                                var status_promo;
                                var harga_asli;
                                var a;

                                for (a = 0; a < slip_order.length; a++) {
                                    arrOrderInv.push(slip_order[a].inventory);
                                    arrOrderQty.push(slip_order[a].qty);
                                    var note = slip_order[a].notes;
                                    note = await new CheckinProses().menghapusCharPetik(note);
                                    arrOrderNotes.push(note);
                                    arrOrderPrice.push(parseFloat(slip_order[a].price));
                                    arrOrderInvName.push(slip_order[a].nama);
                                    arrOrderInvLocation.push(parseInt(slip_order[a].location));

                                }

                                var shift = await new Shift().getShift(db);
                                var kode_sol = await new KodeTransaksi().getSolCode(db, shift);
                                var nama_promo = await new PromoFood().getNamePromoFood(db, rcp);
                                date_trans_Query = await new Shift().getDateTransQuery(shift);
                                var apakah_ada_barang_kasir = false;
                                var apakah_ada_barang_dapur = false;
                                var apakah_ada_barang_bar = false;

                                for (a = 0; a < arrOrderInv.length; a++) {
                                    for (b = a + 1; b < arrOrderInv.length; b++) {
                                        if ((a != b) && (arrOrderInv[a] == arrOrderInv[b])) {
                                            arrOrderNotes[a] = "# " + arrOrderQty[a] + " " + arrOrderNotes[a] + " # " + arrOrderQty[b] + " " + arrOrderNotes[b];
                                            arrOrderQty[a] = parseInt(arrOrderQty[a]) + parseInt(arrOrderQty[b]);

                                            var removed = arrOrderNotes.splice(b, 1);
                                            removed = arrOrderQty.splice(b, 1);
                                            removed = arrOrderInv.splice(b, 1);
                                            removed = arrOrderPrice.splice(b, 1);
                                            removed = arrOrderInvName.splice(b, 1);
                                            removed = arrOrderInvLocation.splice(b, 1);
                                        }
                                    }
                                }

                                if (nama_promo != false) {
                                    status_promo = await new PromoFood().getRequirementPromoFood(db, nama_promo);
                                    if (status_promo == true) {
                                        for (a = 0; a < arrOrderPrice.length; a++) {
                                            harga_asli = parseInt(arrOrderPrice[a]);
                                            var final_Potongan_Promo = await new PromoFood().getPotonganPromoFood(db, arrOrderPrice[a], nama_promo, arrOrderInv[a], arrOrderQty[a], roomCode, roomType, durasi_cekin1, hariKe);
                                            arrFinal_Potongan_Promo.push(parseInt(final_Potongan_Promo));
                                        }
                                    } else if (status_promo == false) {
                                        for (a = 0; a < arrOrderPrice.length; a++) {
                                            arrFinal_Potongan_Promo.push(parseInt(0));
                                        }
                                    }
                                }

                                if (nama_promo != false) {
                                    status_promo = await new PromoFood().getRequirementPromoFood(db, nama_promo);
                                    if (status_promo == true) {
                                        for (a = 0; a < arrOrderPrice.length; a++) {
                                            var start_index = a;
                                            var number_of_elements_to_remove = 1;
                                            harga_asli = parseInt(arrOrderPrice[a]);
                                            var final_price_after_potongan = await new PromoFood().getFinalPriceAfterPotonganPromoFood(db,arrOrderPrice[a], nama_promo, arrOrderInv[a], arrOrderQty[a], roomCode, roomType, durasi_cekin1, hariKe);
                                            var removed_elements = arrOrderPrice.splice(start_index, number_of_elements_to_remove, final_price_after_potongan);
                                        }
                                    }
                                }

                                var insert_sol_query = " " +
                                    " INSERT INTO ihp_sol " +
                                    " (sliporder, " +
                                    " date, " +
                                    " shift, " +
                                    " reception, " +
                                    " kamar, " +
                                    " status, " +
                                    " chtime, " +
                                    " chusr, " +
                                    " pos, " +
                                    " date_trans, " +
                                    " mobile_pos)" +
                                    " VALUES " +
                                    " ('" + kode_sol + "'," +
                                    " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)," +
                                    " '" + shift + "'," +
                                    " '" + rcp + "'," +
                                    " '" + roomCode + "'," +
                                    " '1'," +
                                    " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)," +
                                    " '" + chusr + "'," +
                                    " '" + req._remoteAddress + "'," +
                                    " " + date_trans_Query + "," +
                                    //"   '" + date_trans + "'," + 
                                    //"   CONVERT(VARCHAR(24),"+date_trans+",114)," +      
                                    " '" + android + "')";

                                var isProsesInsertSol = await new CheckinProses().prosesQuery(db, insert_sol_query);
                                if (isProsesInsertSol == true) {
                                    console.log("Sukses Insert Sol " + kode_sol + " Room  " + roomCode);
                                    logger.info("Sukses Insert Sol " + kode_sol + " Room  " + roomCode);

                                    for (a = 0; a < arrOrderInv.length; a++) {
                                        if (arrOrderQty[a] > 0) {
                                            var insert_sod_query = " " +
                                                " INSERT INTO IHP_Sod " +
                                                " (SlipOrder, " +
                                                " Inventory, " +
                                                " Nama, " +
                                                " Price, " +
                                                " Qty, " +
                                                " Total, " +
                                                " Status, " +
                                                " Location, " +
                                                " Printed, " +
                                                " Note, " +
                                                " CHusr, " +
                                                " Urut) " +
                                                " VALUES " +
                                                " ('" + kode_sol + "'," +
                                                " '" + arrOrderInv[a] + "'," +
                                                " '" + arrOrderInvName[a] + "'," +
                                                " '" + parseFloat(arrOrderPrice[a]) + "'," +
                                                " '" + arrOrderQty[a] + "'," +
                                                " '" + parseFloat((arrOrderPrice[a] * arrOrderQty[a])) + "'," +
                                                " '1'," +
                                                " '" + arrOrderInvLocation[a] + "'," +
                                                " '2'," +
                                                " '" + arrOrderNotes[a] + "'," +
                                                " '" + chusr + "'," +
                                                " " + parseInt(a) + ")";
                                            var isProsesInsertSod = await new CheckinProses().prosesQuery(db, insert_sod_query);
                                            if (isProsesInsertSod == true) {
                                                if (arrOrderInvLocation[a] == "1") {
                                                    apakah_ada_barang_kasir = true;
                                                }
                                                if (arrOrderInvLocation[a] == "2") {
                                                    apakah_ada_barang_dapur = true;
                                                }
                                                if (arrOrderInvLocation[a] == "3") {
                                                    apakah_ada_barang_bar = true;
                                                }
                                                console.log("Sukses Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                                logger.info("Sukses Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                            }
                                            else {
                                                console.log("Gagal Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                                logger.info("Gagal Insert Sod " + kode_sol + " Nama  " + arrOrderInvName[a]);
                                            }
                                        }
                                    }

                                    if (nama_promo != false) {
                                        for (a = 0; a < arrOrderInv.length; a++) {
                                            var insert_sod_promo_query = " " +
                                                " INSERT INTO IHP_Sod_Promo " +
                                                " (SlipOrder, " +
                                                " Inventory, " +
                                                " Promo_Food, " +
                                                " Harga_Promo) " +
                                                " VALUES " +
                                                " ('" + kode_sol + "'," +
                                                " '" + arrOrderInv[a] + "'," +
                                                " '" + nama_promo + "'," +
                                                " '" + parseFloat((arrOrderPrice[a] * arrOrderQty[a])) + "')";

                                            var isProsesInsertSodPromo = await new CheckinProses().prosesQuery(db, insert_sod_promo_query);
                                            if (isProsesInsertSodPromo == true) {

                                                console.log("Sukses Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                                logger.info("Sukses Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                            }
                                            else {
                                                console.log("Gagal Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                                logger.info("Gagal Insert Sod_promo " + kode_sol + " Nama  " + arrOrderInvName[a] + " nama_promo " + nama_promo);
                                            }
                                        }
                                    }

                                    var status = await new CheckinProses().getStatusSolSod(db, rcp);
                                    var cetak_slip_order_pos = await new ConfigPos().getCetakSlipOrderDiPos(db);
                                    var cetak_slip_order_fo = await new ConfigPos().getCetakSlipOrderDiFo(db);

                                    var pesan;
                                    var ip_address;
                                    var port;
                                    var panjang_pesan;

                                    //untuk cetak print  slip order di FO
                                    if (status != false) {
                                        if (cetak_slip_order_fo == 1) {
                                            //pesan print Slip Order Office Front                                 
                                            var client_fo = dgram.createSocket('udp4');
                                            pesan = "PRINT_SLIP_ORDER_FRONT_OFFICE";
                                            //ip_address = await new IpAddressService().getIpAddress(db, "FRONT OFFICE");
                                            ip_address = req.config.ip_address_fo;
                                            port = await new IpAddressService().getUdpPort(db, "FRONT OFFICE");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                //ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal PRINT_SLIP_ORDER_FRONT_OFFICE to FRONT OFFICE " + ip_address);
                                                client_fo.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_fo.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        if (cetak_slip_order_pos == 1) {
                                            //pesan print Slip Order Pos Lorong
                                            var client_pos = dgram.createSocket('udp4');
                                            pesan = "PRINT_SLIP_ORDER_POINT_OF_SALES_LORONG";
                                            //ip_address = await new IpAddressService().getIpAddress(db, "POINT OF SALES");
                                            ip_address = req.config.ip_address_pos;
                                            port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                //ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal PRINT_SLIP_ORDER_POINT_OF_SALES_LORONG to POINT OF SALES " + ip_address);
                                                client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_pos.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        if (apakah_ada_barang_dapur == true) {
                                            var client_pop = dgram.createSocket('udp4');
                                            //pesan print Slip Order Pos Lorong
                                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                                            ip_address = await new IpAddressService().getIpAddress(db, "KITCHEN");
                                            port = await new IpAddressService().getUdpPort(db, "KITCHEN");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to KITCHEN " + ip_address);
                                                client_pop.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_pop.close();
                                                });
                                            }
                                        }
                                        if (apakah_ada_barang_bar == true) {
                                            var client_bar = dgram.createSocket('udp4');
                                            //pesan print Slip Order Pos Lorong
                                            pesan = "SLIP_ORDER_FRONT_OFFICE";
                                            ip_address = await new IpAddressService().getIpAddress(db, "BAR");
                                            port = await new IpAddressService().getUdpPort(db, "BAR");
                                            if ((ip_address !== false) && (port !== false)) {
                                                port = port.recordset[0].server_udp_port;
                                                ip_address = ip_address.recordset[0].ip_address;
                                                port = parseInt(port);
                                                panjang_pesan = pesan.length;
                                                panjang_pesan = parseInt(panjang_pesan);
                                                logger.info("Send Sinyal SLIP_ORDER_FRONT_OFFICE to BAR " + ip_address);
                                                client_bar.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
                                                    client_bar.close();
                                                });
                                            }
                                        }
                                    }

                                    if (status != false) {
                                        //TODO : 02 exec sio
                                        if (apakah_ada_barang_kasir == true) {
                                            let notif_data = {
                                                slip_order: kode_sol,
                                                notif_type: SioController.NEW_ORDER,
                                                room_type: roomType,
                                                room_code: roomCode,
                                                create_chusr: chusr
                                            };
                                            /* sio.getInstance()
                                            .of("/fo-rtc")
                                            .emit(SioController.NEW_ORDER, JSON.stringify(notification));  */
                                            sio.bcNotifySlipOrder(notif_data);

                                        }
                                        res.send(status);
                                    }
                                    else {
                                        dataResponse = new ResponseFormat(false, null, "Data Kosong");
                                        res.send(dataResponse);
                                    }
                                }
                                else {
                                    console.log("Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    logger.info("Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    dataResponse = new ResponseFormat(false, null, "Gagal Insert Sol " + kode_sol + " Room  " + roomCode);
                                    res.send(dataResponse);
                                }

                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, roomCode + " Data Slip Order Kosong");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, roomCode + " Waktu Checkin Sudah Habis");
                            res.send(dataResponse);
                        }
                    }
                    else {
                        dataResponse = new ResponseFormat(false, null, roomCode + " Data kamar informasi checkin belum di lengkapi");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, roomCode + " Sudah Dibayar");
                    res.send(dataResponse);
                }
            }
            else {
                dataResponse = new ResponseFormat(false, null, roomCode + " Belum Checkin");
                res.send(dataResponse);
            }
        }
        else {
            dataResponse = new ResponseFormat(false, null, roomCode + " Tidak Terdaftar");
            res.send(dataResponse);
        }

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}


//variable model
var RoomModel = require('./../model/IHP_RoomModel');
var InvoiceModel = require('./../model/IHP_InvoiceModel');
var SummaryModel = require('./../model/IHP_SummaryModel');
var SlipOrderDetailsModel = require('./../model/IHP_SodModel');

exports.getSlipOrderFO = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procGetSlipOrderFO(req, res);
};

async function _procGetSlipOrderFO(req, res) {
    //1--------------------------------------
    //Parameter Global
    var ErrorMsg = "";
    var Sod = "";
    var room;
    //2--------------------------------------

    //1--------------------------------------
    //Parameter dari body
    var roomCode = req.params.room;
    //2--------------------------------------

    //1--------------------------------------
    //Data dari database
    var Invoice;

    //Ambil data Room
    if (ErrorMsg == "") {
        room = await RoomModel.getInfo(roomCode, req, db);
        ErrorMsg = await checkRoom(room);
    }

    //Cek Invoice is exist
    if (ErrorMsg == "") {
        Invoice = await InvoiceModel.getInfo(room.Reception, req, db);
        if (Invoice == "") ErrorMsg = "Invoice tidak ditemukan";
    }

    //Cek Summary is exist
    if (ErrorMsg == "") {
        Summary = await SummaryModel.getInfo(room.Reception, req, db);
        if (Summary != "") ErrorMsg = "Sudah terdapat pembayaran";
    }
    //2--------------------------------------

    //1--------------------------------------
    //Mendapatkan data SlipOrder
    if (ErrorMsg == "") {
        Sod = await SlipOrderDetailsModel.getListSlipOrderFO(room.Reception,
            req,
            db);
    }

    if (ErrorMsg != "") {
        console.log(ErrorMsg);
        logger.info(ErrorMsg);
        dataResponse = new ResponseFormat(false, null, ErrorMsg);
        res.send(dataResponse);
    }
    else {
        dataResponse = new ResponseFormat(true, Sod);
        res.send(dataResponse);
    }
}

//Fungsi untuk cek room
function checkRoom(room) {
    var ErrorMsg = "";

    if (room == "") ErrorMsg = "Kamar tidak terdaftar";
    else if (room.Reception == "" || room.Reception == "NULL") ErrorMsg = "Tidak bisa melanjutkan proses, belum ada penjualan";

    return ErrorMsg;
}
