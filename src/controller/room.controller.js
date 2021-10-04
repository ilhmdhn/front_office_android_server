var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var url = require('url').URL;
var request = require('request');
var fs = require('fs');
var sql = require("mssql");
var logger;
var db;

var Room = require('../services/room.service.js');
var History = require('../services/history.js');
let OrderInventoryService = require('../services/order.inventory.service');
var RoomNoService = require('../services/room.no.service.js');

exports.getChekinRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var checkin_room = await new Room().getChekinRoom(db);
        if (checkin_room != false) {
            dataResponse = new ResponseFormat(true, checkin_room.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var keyword = req.query.keyword;
        var all_room = await new Room().getAllRoom(db, keyword);
        if (all_room != false) {
            dataResponse = new ResponseFormat(true, all_room.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data all room Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        logger.error(err);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var room = await new Room().getRoom(db, req.params.kamar);
        if (room != false) {
            dataResponse = new ResponseFormat(true, room.recordset[0]);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getExtendRoomList = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var extend_room_list = await new Room().getExtendRoomList(db, req.params.kamar);
        if (extend_room_list != false) {
            dataResponse = new ResponseFormat(true, extend_room_list.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomReady = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var all_room_paid = await new Room().getAllRoomReady(db);
        if (all_room_paid != false) {
            dataResponse = new ResponseFormat(true, all_room_paid.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomCheckin = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var keyword = req.query.keyword;
        var all_room_checkin = await new Room().getAllRoomCheckin(db, keyword);
        if (all_room_checkin != false) {
            dataResponse = new ResponseFormat(true, all_room_checkin.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong Belum ada Checkin");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomCheckinByType = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    let _orderInventoryService = new OrderInventoryService(logger);
    var param = {
        room_code: req.query.room_code,
        room_type: req.query.room_type,
        mbr_name: req.query.mbr_name,
        room_capacity: req.query.room_capacity
    };

    new Room().getAllRoomCheckinByType(db, param)
        .then(listRoom => {

            let arrPromises = [];
            for (room of listRoom) {
                arrPromises.push(_orderInventoryService.getAllOrderState(room));
            }

            return Promise.all(arrPromises);
        })
        .then((data) => {
            res.send(new ResponseFormat(true, data));
        })
        .catch((err) => {
            res.send(new ResponseFormat(false, null, err));
        });
};



exports.getAllRoomPaid = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var keyword = req.query.keyword;
        var all_room_paid = await new Room().getAllRoomPaid(db, keyword);
        if (all_room_paid != false) {
            dataResponse = new ResponseFormat(true, all_room_paid.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomCheckout = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var keyword = req.query.keyword;
        var all_room_checkout = await new Room().getAllRoomCheckout(db, keyword);
        if (all_room_checkout != false) {
            dataResponse = new ResponseFormat(true, all_room_checkout.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomInUse = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var all_room_in_use = await new Room().getAllRoomInUse(db);
        if (all_room_in_use != false) {
            dataResponse = new ResponseFormat(true, all_room_in_use.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getOrderRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var order_room = await new Room().getOrderRoom(db, req.params.room);
        if (order_room != false) {
            dataResponse = new ResponseFormat(true, order_room.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Order Room " + req.params.room + " Data Kosong");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
};

exports.getReceptionRoomByIpAddress = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var roomQuery = " " +
            " SELECT " +
            " IHP_Room.Kamar, " +
            " IHP_Room.Jenis_Kamar, " +
            " IHP_Room.Kapasitas, " +
            " IHP_Room.Status_Checkin, " +
            " IHP_Room.Keterangan_Connect, " +
            " IHP_Room.Reception, " +
            " IHP_Room.Nama_Tamu, " +
            " IHP_Room.IP_Address, " +
            " IHP_Ivc.Chusr, " +
            " DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin, " +
            " DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin, " +
            " IHP_Room.Jam_Checkin as jam_checkin, " +
            " IHP_Room.Jam_Checkout as jam_checkout, " +
            " Isnull(IHP_Promo_Rcp.Promo,'') as promo," +
            " Isnull(IHP_Promo_Rcp.Start_Promo,'') as start_promo," +
            " Isnull(IHP_Promo_Rcp.End_promo,'') as end_promo," +
            " Isnull(IHP_Promo_Rcp.Time_Start,'') as time_start," +
            " Isnull(IHP_Promo_Rcp.Time_Finish,'') as time_finish," +
            " Isnull(IHP_Promo_Rcp.Date_Start,'') as date_start," +
            " Isnull(IHP_Promo_Rcp.Date_Finish,'') as date_finish," +
            " Isnull(IHP_Promo_Rcp.Diskon_Persen,0) as diskon_persen," +
            " Isnull(IHP_Promo_Rcp.Diskon_Rp,0) as diskon_rp," +
            " Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu" +
            " From IHP_Room " +
            " Inner Join IHP_Ivc on IHP_Room.Reception=IHP_Ivc.Reception" +
            " Left Join IHP_Promo_Rcp on IHP_Room.Reception=IHP_Promo_Rcp.Reception" +
            " and IHP_Promo_Rcp.Status_Promo=2" +
            " WHERE " +
            " IHP_Room.Reception IS NOT NULL  " +
            " and IHP_Room.IP_Address ='" + req.body.ipAddress + "'" +
            " and Status_checkin = 1  " +
            " and IHP_Room.Reception=IHP_Ivc.Reception " +
            " and DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)>0 " +
            " and IHP_Room.Reception NOT IN (SELECT Reception FROM ihp_sul) order by Jam_Checkout desc ";

        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {

                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {

                if (dataReturn.recordset.length > 0) {
                    dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
                    res.send(dataResponse);
                } else {
                    dataResponse = new ResponseFormat(false, null, "Data Kosong");
                    res.send(dataResponse);
                }
            }
        });

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getReceptionRoomRcpByIpAddress = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var roomQuery = " " +
            " SELECT " +
            " IHP_Room.Kamar as kamar, " +
            " isnull(IHP_Room.Reception,'') as reception, " +
            " IHP_Room.IP_Address as ip_address " +
            " From IHP_Room " +
            " WHERE " +
            " IHP_Room.IP_Address ='" + req.params.ip_address + "'";


        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {

                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {

                if (dataReturn.recordset.length > 0) {
                    dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
                    res.send(dataResponse);
                } else {
                    dataResponse = new ResponseFormat(false, null, "Data Kosong");
                    res.send(dataResponse);
                }
            }
        });

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getReceptionByRoomNo = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;

        var check_ip_address = await new RoomNoService().getRoomIHPIPAddressRoomNo(db, req.params.room);
        if (check_ip_address == false) {
            await new RoomNoService().insertIHPIPAddressRoomNo(db, req.params.room, req._remoteAddress, 7081, 7082);
        }
        else {
            await new RoomNoService().updateIHPIPAddressRoomNo(db, req.params.room, req._remoteAddress, 7081, 7082);

        }
        var room_nya = await new Room().getRoomByRoomNo(db, req.params.room);
        if (room_nya != false) {
            dataResponse = new ResponseFormat(true, room_nya.recordset[0]);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }    
};

exports.getRoomDetailByRoomNo = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var room_nya = await new Room().getRoomByRoomNo(db, req.params.room);
        if (room_nya != false) {
            dataResponse = new ResponseFormat(true, room_nya.recordset[0]);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }    
};
exports.getReadyRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var order_room = await new Room().getReadyRoom(db);
        if (order_room != false) {
            dataResponse = new ResponseFormat(true, order_room.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getJenisRoom = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room = await new Room().getJenisRoom(db);
        if (jenis_room != false) {
            dataResponse = new ResponseFormat(true, jenis_room.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        logger.error(err);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getJenisRoomReady = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_ready = await new Room().getJenisRoomReady(db);
        if (jenis_room_ready != false) {
            dataResponse = new ResponseFormat(true, jenis_room_ready.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        logger.error(err);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

// TODO :: this method spesific for HP112
exports.getGroupingTypeRoomReady = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_ready = await new Room().getGroupingTypeRoomReady(db);
        if (jenis_room_ready != false) {
            dataResponse = new ResponseFormat(true, jenis_room_ready.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        logger.error(err);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getAllRoomReadyByTypeGrouping = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_ready_detail = await new Room().getAllRoomReadyByGroupingType(db, req.params.jenis_kamar);
        if (jenis_room_ready_detail != false) {
            dataResponse = new ResponseFormat(true, jenis_room_ready_detail.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getRoomByType = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_ready = await new Room().getRoomByType(db, req.params.room_type, req.params.capacity);
        if (jenis_room_ready != false) {
            dataResponse = new ResponseFormat(true, jenis_room_ready.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getJenisRoomReadyDetail = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_ready_detail = await new Room().getJenisRoomReadyDetail(
            db, req.params.jenis_kamar, req.params.capacity);
        if (jenis_room_ready_detail != false) {
            dataResponse = new ResponseFormat(true, jenis_room_ready_detail.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getJenisRoomDetail = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var jenis_room_detail = await new Room().getJenisRoomDetail(
            db, req.params.jenis_kamar, req.params.capacity);
        if (jenis_room_detail != false) {
            dataResponse = new ResponseFormat(true, jenis_room_detail.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getHistoryCheckin = async function (req, res) {
    try {
        db = await new DBConnection().getPoolConnection();
        logger = req.log;
        var keyword = req.query.keyword;
        var history_checkin_list = await new History().getHistoryCheckinRoom(db, req.params.hari, keyword);
        if (history_checkin_list != false) {
            dataResponse = new ResponseFormat(true, history_checkin_list.recordset);
            res.send(dataResponse);
        }
        else {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getRoomImage = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    pic = req.params.idImage;
    //D:\Ainul\FotoMinumanRenamed\MNHP-CT-034.jpg
    //fs.readFile('/path/to/an/image/directory/' + pic, function (err, content) {
    fs.readFile('./images/image_room/' + pic, function (err, content) {
        if (err) {
            //console.log(err);
            //res.writeHead(400, {'Content-type':'text/html'}) ; 
            //res.end("No such image"); 
            //jika gambar tidak ada
            fs.readFile('./images/noimage.png', function (err, content) {
                if (err) {
                    console.log(err);
                    res.writeHead(400, {
                        'Content-type': 'text/html'
                    });
                    res.end("No such image");

                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, {
                        'Content-type': 'image/jpg'
                    });
                    res.end(content);
                }
            });
            //end jika gambar tidak ada
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200, {
                'Content-type': 'image/jpg'
            });
            res.end(content);
        }
    });
};

exports.getVideoIklan = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    pic = req.params.idVideo;
    //read the image using fs and send the image content back in the response    
    //fs.readFile('/path/to/an/image/directory/' + pic, function (err, content) {
    fs.readFile('./images/video_iklan/' + pic, function (err, content) {
        if (err) {
            //console.log(err);
            //res.writeHead(400, {'Content-type':'text/html'}) ; 
            //res.end("No such image"); 
            //jika gambar tidak ada
            fs.readFile('./images/video_iklan/noVideo.mp4', function (err, content) {
                if (err) {
                    console.log(err);
                    res.writeHead(400, {
                        'Content-type': 'text/html'
                    });
                    res.end("No such image");

                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, {
                        'Content-type': 'video/mp4'
                    });
                    res.end(content);
                }
            });
            //end jika gambar tidak ada
        } else {
            //specify the content type in the response will be an image
            //res.writeHead(200,{'Content-type':'image/jpg'});
            res.writeHead(200, {
                'Content-type': 'video/mp4'
            });
            res.end(content);
        }
    });
};


exports.getDownloadVideoIklan = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    pic = req.params.idVideo;
    //read the image using fs and send the image content back in the response    
    //fs.readFile('/path/to/an/image/directory/' + pic, function (err, content) {
    fs.readFile('./images/video_iklan/' + pic, function (err, content) {
        if (err) {
            //console.log(err);
            //res.writeHead(400, {'Content-type':'text/html'}) ; 
            //res.end("No such image"); 
            //jika gambar tidak ada
            fs.readFile('./images/video_iklan/noVideo.mp4', function (err, content) {
                if (err) {
                    console.log(err);
                    res.writeHead(400, {
                        'Content-type': 'text/html'
                    });
                    res.end("No such image");

                } else {
                    //specify the content type in the response will be an image
                    res.setHeader('Content-disposition', 'attachment; filename=noVideo.mp4');
                    res.writeHead(200, {
                        'Content-type': 'video/mp4'
                    });
                    res.end(content);
                }
            });
            //end jika gambar tidak ada
        } else {
            //specify the content type in the response will be an image
            //res.writeHead(200,{'Content-type':'image/jpg'});
            res.setHeader('Content-disposition', 'attachment; filename=' + pic);
            res.writeHead(200, {
                'Content-type': 'video/mp4'
            });
            res.end(content);
        }
    });
};

exports.getWebReservation = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var paramOutlet = req.params.outlet;
        var param = req.params.reservation;
        //var url = "http://13.76.167.131:3011/vcr/getVocherDetail_/";        
        var url = "http://13.76.167.131:3013/rsv/detailScanBarcode_/";
        //var url = "http://13.76.167.131:4012/vcr/getVocherDetail_/";        
        var outlet = await getNomorOutlet();
        //var outlet= "HP003";        

        request.get({
            url: url + outlet + "/" + param
        },
            function optionalCallback(err, response, body) {
                if (err) {
                    console.error("Error getWebReservation -> " + err.message);
                    console.log("Error getWebReservation -> " + err.message);
                    dataResponse = new ResponseFormat(false, null, err.message);
                    res.send(dataResponse);
                } else {
                    var responya = response.body;
                    var body0 = JSON.parse(responya);
                    if (body0.length > 0) {
                        if (body0.state == true) {

                            if (body0.data[0].Status == 0) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi Valid tapi Belum Di Konfirmasi Oleh Admin Outlet Hubungi Admin Outlet untuk Konfirmasi");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 2) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi sudah dipakai checkin");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 3) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi telah di cancel");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 4) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi ditolak");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 5) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi Kadaluarsa (telat transfer)");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 6) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi Hangus (tidak datang)");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].Status == 7) {
                                dataResponse = new ResponseFormat(false, null, "Reservasi Valid tapi Belum Di Konfirmasi Oleh Admin Outlet Hubungi Admin Outlet untuk Konfirmasi");
                                res.send(dataResponse);
                            }
                            else {
                                res.send(body0);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, "");
                            res.send(dataResponse);
                        }
                    }
                }
            });
    } catch (error) {
        logger.error(`catch Error getVoucherWebMembership -> ${error}`);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
};

function getNomorOutlet() {
    return new Promise((resolve, reject) => {
        try {
            var isiQuery = " Select Outlet as outlet From IHP_Config where Data=1";
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        var outlet = dataReturn.recordset[0].outlet;
                        outlet = "HP" + outlet;
                        resolve(outlet);
                    }
                    else {
                        resolve(false);
                    }

                }
            });
        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
        }
    });
}

