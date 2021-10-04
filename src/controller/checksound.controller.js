var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger;
var DBConnection = require('../util/db.pool');
var History = require('../services/history');
var db;

var Shift = require('../util/shift');
var Room = require('../services/room.service.js');

/* status=0 ready
status=1 checksound
status=2 checkin=not paid
status=3 invoice printed=ditagihkan=claimed
status=4 terbayar=paid
status=5 checkout=repaired
*/

var getRoomQuery = "" +
    " SELECT " +
    " IHP_Room.Kamar as kamar" +
    " ,IHP_Room.Jenis_Kamar as jenis_kamar" +
    " ,IHP_Room.Kapasitas as kapasitas" +
    " ,isnull(IHP_Room.Jumlah_Tamu,0) as jumlah_tamu" +
    " ,IHP_Room.Status_Checkin as status_checkin " +

    " ,case when IHP_Room.Keterangan_Connect=2  then 0 " +
    " when IHP_Room.Keterangan_Connect=1  then 1 " +
    " when IHP_Room.Keterangan_Connect=4  then 1 end" +
    " as status_checkout" +

    " ,case when IHP_Room.Keterangan_Connect=4 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Nama_Tamu='TESKAMAR' " +
    " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
    " then 1 " +
    " else 0 end" +
    " as status_checksound" +

    " ,case " +
    " when (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
    " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
    " AND IHP_Room.Status_Checkin=0 " +
    " AND IHP_Room.Keterangan_Connect=2 " +
    " then 0" +

    " when IHP_Room.Keterangan_Connect=4 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Nama_Tamu='TESKAMAR' " +
    " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
    " then 1" +

    " when IHP_Room.Keterangan_Connect=2 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
    " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') " +
    " and IHP_Sul.Summary is null " +
    " and (IHP_Ivc.Printed='0' or IHP_Ivc.Printed='-1')" +
    " then 2" +

    " when IHP_Ivc.Printed>0 " +
    " and IHP_Sul.Summary is null " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Keterangan_Connect=2 " +
    " then 3" +

    " when IHP_Sul.Summary is not null " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Keterangan_Connect=2 " +
    " then 4" +

    " when IHP_Room.Keterangan_Connect=1  " +
    " then 5" +

    " else  6 end" +
    " as status_kamar" +

    " ,case when IHP_Sul.Summary is not null  " +
    " then 1 else  0 end" +
    " as status_terbayar" +

    " ,IHP_Room.Status_10 as status_10_menit " +

    " ,case when IHP_Ivc.Printed='1' then 1 " +
    " else 0 end as status_tagihan_tercetak " +

    " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'BAR' " +
    " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
    " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
    " AND (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
    " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
    " AND IHP_Room.Status_Checkin=0 " +
    " AND IHP_Room.Keterangan_Connect=2 " +
    " then 1 " +
    " else 0 end" +
    " as status_kamar_ready_untuk_checkin" +

    " ,IHP_Room.Service_Kamar as call_service_kamar " +
    " ,IHP_Room.Keterangan_Connect as keterangan_connect " +

    " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'BAR' " +
    " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
    " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
    " then CAST(1 AS BIT) " +
    " else CAST(0 AS BIT) end" +
    " as kamar_untuk_checkin" +

    " ,case when IHP_Room.Reception ='NULL'  then ''" +
    " when IHP_Room.Reception is null  then ''" +
    " else IHP_Room.Reception " +
    " end" +
    " as reception" +

    " ,case when IHP_Room.Nama_Tamu ='NULL'  then ''" +
    " when IHP_Room.Nama_Tamu is null  then ''" +
    " else IHP_Room.Nama_Tamu " +
    " end" +
    " as nama_member" +

    " ,IHP_Room.IP_Address as ip_address" +
    " ,isnull(IHP_Ivc.Chusr,'') as chusr " +
    " ,isnull(IHP_Ivc.Member,'') as kode_member " +
    //" ,isnull(IHP_Ivc.Nama,'') as nama " +

    " ,DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin " +
    " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin " +
    " , DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)/60 as sisa_jam_checkin" +
    " , DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)%60 as sisa_menit_checkin" +
    " ,Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu" +
    " ,IHP_Room.Jam_Checkin as jam_checkin " +
    " ,IHP_Room.Jam_Checkout as jam_checkout " +
    " ,isnull(IHP_Sul.Summary,'') as summary " +
    " ,isnull(IHP_Sul.Total,0) as total_pembayaran " +

    " FROM IHP_Room " +
    " Left Join IHP_Ivc on IHP_Room.Reception=IHP_Ivc.Reception" +
    " and IHP_Room.Kamar=IHP_Ivc.Kamar" +

    " Left Join IHP_RoomCheckin on IHP_Room.Kamar=IHP_RoomCheckin.Kamar" +
    " and IHP_Room.Kamar=IHP_RoomCheckin.Kamar" +

    " Left Join IHP_Sul on IHP_RoomCheckin.Reception=IHP_Sul.Reception" +
    " and IHP_Room.Kamar=IHP_Sul.Kamar";

exports.submitCheckSoundRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procCheckSoundRoom(req, res);

};

async function _procCheckSoundRoom(req, res) {
    try {
        var WorkdateStart = await getWorkDateStart();
        var WorkdateFinish = await getWorkFinish();
        var chusr = req.body.chusr;
        var room = req.body.room;
        var jumlah_checksound_ = parseInt(0);

        var UpdateIhpRoomQuery = " " +
            " update IHP_Room set Nama_Tamu='TESKAMAR', " +
            " Status_Checkin=1, Jumlah_Tamu=1, Keterangan_Connect=4, " +
            " Jam_Checkin=GETDATE() ,Jam_Masuk=GETDATE(), Jam_Checkout=DATEADD(minute,10,GETDATE())" +
            " Where Kamar='" + room + "'";
        var cekJumlahCekSoundQuery = " " +
            "SELECT isnull([Jumlah_Checksound],0) as [jumlah_checksound] FROM IHP_Checksound WHERE Kamar='" + room +
            "' AND Workdate_Start='" + WorkdateStart + "'";

        var isCekRoom = await new Room().getCekRoom(db, room);
        if (isCekRoom != false) {
            if (isCekRoom.data[0].Keterangan_Connect == 4) {
                console.log(room + " Sedang dipakai  Checksound ");
                logger.info(room + " Sedang dipakai  Checksound ");
                dataResponse = new ResponseFormat(true, null, room + " Sedang dipakai  Checksound ");
                res.send(dataResponse);
            }
            else if (isCekRoom.data[0].Keterangan_Connect == 1) {
                console.log(room + " Sedang Repaired Opr dibersihkan ");
                logger.info(room + " Sedang Repaired Opr dibersihkan ");
                dataResponse = new ResponseFormat(true, null, room + " Sedang Repaired Opr dibersihkan ");
                res.send(dataResponse);
            }
            else if (isCekRoom.data[0].Status_Checkin == 1) {
                console.log(room + " Sedang dipakai  Checkin ");
                logger.info(room + " Sedang dipakai  Checkin ");
                dataResponse = new ResponseFormat(true, null, room + " Sedang dipakai  Checkin ");
                res.send(dataResponse);
            }
            else {
                var jumlah_checksound = await getJumlahChecksound(cekJumlahCekSoundQuery);
                if (jumlah_checksound !== false) {
                    jumlah_checksound = parseInt(jumlah_checksound);
                    if (jumlah_checksound < 3) {
                        jumlah_checksound_ = jumlah_checksound + 1;
                        var updateIhpRoom = await prosesQuery(UpdateIhpRoomQuery);
                        if (updateIhpRoom != false) {
                            console.log(room + " Sukses updateIhpRoom ");
                            logger.info(room + " Sukses updateIhpRoom ");
                            var insert_ihp_checksound = " " +
                                " INSERT INTO [IHP_Checksound] " +
                                " ([Kamar] " +
                                " ,[Status_Checksound] " +
                                " ,[Jam_Checksound] " +
                                " ,[Jam_Selesai] " +
                                " ,[Workdate_Start] " +
                                " ,[Workdate_Finish] " +
                                " ,[Jumlah_Checksound] " +
                                " ,[User_ID] " +
                                " ,[Kasir]) " +
                                " VALUES " +
                                " ('" + room + "'," +
                                "   '0'," +
                                "   GETDATE()," +
                                "   DATEADD(minute,10,GETDATE())," +
                                "   '" + WorkdateStart + "'," +
                                "   '" + WorkdateFinish + "'," +
                                "   '" + jumlah_checksound_ + "'," +
                                "   '" + chusr + "'," +
                                "   '" + chusr + "')";

                            var insertIhpRoomChecksound = await prosesQuery(insert_ihp_checksound);
                            if (insertIhpRoomChecksound != false) {
                                console.log(room + " Sukses insertIhpRoomChecksound ");
                                logger.info(room + " Sukses insertIhpRoomChecksound ");
                                dataResponse = new ResponseFormat(true, null, room + " checksound ke " + jumlah_checksound_ + " Maksimal 3 kali checksound dalam 1 hari selama 10 menit");
                                res.send(dataResponse);
                            }
                            else {
                                dataResponse = new ResponseFormat(false, null, room + " gagal insert IhpRoom Checksound");
                                res.send(dataResponse);
                            }
                        }
                        else {
                            dataResponse = new ResponseFormat(false, null, room + " gagal update ihp room");
                            res.send(dataResponse);
                        }
                    }
                    else if (jumlah_checksound >= 3) {
                        dataResponse = new ResponseFormat(false, null, room + " Checksound tidak boleh melebihi 3 kali dalam 1 hari");
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, room + " gagal get jumlah checksound");
                    res.send(dataResponse);
                }
            }
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

function getWorkDateStart() {
    return new Promise((resolve, reject) => {
        try {
            var workDateStart = "select CONVERT(VARCHAR(24),GETDATE(),103) as Workdate_start";
            db.request().query(workDateStart, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                } else {
                    sql.close();
                    var nilaiWorkdateStart = dataReturn.recordset[0].Workdate_start;
                    resolve(nilaiWorkdateStart);
                }
            });
        } catch (error) {
            sql.close();
            logger.error(error);
            resolve(false);
        }
    });
}

function getWorkFinish() {
    return new Promise((resolve, reject) => {
        try {
            var workDateFinish = "select Workdate_Finish from IHP_Config";
            var workDateFinish0 = "select CONVERT(VARCHAR(24),GETDATE(),103) as Workdate_Finish";
            var workDateFinish1 = "select CONVERT(VARCHAR(24),DATEADD(dd, 1, GETDATE()),103) as Workdate_Finish";

            db.request().query(workDateFinish, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                } else {
                    var nilaiWorkdateFinish = parseInt(dataReturn.recordset[0].Workdate_Finish);
                    if (nilaiWorkdateFinish == 0) {
                        db.request().query(workDateFinish0, function (err, dataReturn) {
                            if (err) {
                                sql.close();
                                logger.error(err.message);
                                resolve(false);
                            } else {
                                sql.close();
                                var nilaiTanggalWorkdateFinish = dataReturn.recordset[0].Workdate_Finish;
                                resolve(nilaiTanggalWorkdateFinish);
                            }
                        });
                    } else if (nilaiWorkdateFinish == 1) {
                        db.request().query(workDateFinish1, function (err, dataReturn) {
                            if (err) {
                                sql.close();
                                logger.error(err.message);
                                resolve(false);
                            } else {
                                sql.close();
                                var nilaiTanggalWorkdateFinish = dataReturn.recordset[0].Workdate_Finish;
                                resolve(nilaiTanggalWorkdateFinish);
                            }
                        });
                    }
                }
            });
        } catch (error) {
            logger.error(error);
            resolve(false);
        }
    });
}

function prosesQuery(isiQuery) {
    return new Promise((resolve, reject) => {
        try {
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    resolve(true);
                }
            });
        } catch (err) {
            sql.close();
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
        }
    });
}



function getJumlahChecksound(isiQuery_) {
    return new Promise((resolve, reject) => {
        try {
            var isiQuery = isiQuery_;
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        resolve(dataReturn.recordset.length);
                    }
                    else {
                        resolve(0);
                    }
                }
            });
        } catch (error) {
            sql.close();
            logger.error(error);
            resolve(false);
        }
    });
}

