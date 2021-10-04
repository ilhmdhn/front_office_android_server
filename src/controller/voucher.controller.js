var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var request = require('request');
var sql = require("mssql");
var logger;
var formDataGetToClient;
var db;


exports.getVoucherFoMfo = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var roomQuery = " " +
            " SELECT " +
            " '' as outlet, " +
            " IHP_Vcr.[Voucher] as voucher, " +
            " IHP_Vcr.[DATE] as [date], " +
            " IHP_Vcr.[DATE] as active_date, " +
            " IHP_Vcr.[Expired] as expired, " +
            " IHP_Vcr.[Expired] as expired_date, " +

            " case " +
            " when " +
            " IHP_Vcr.[Expired] > getdate() " +
            " then " +
            " cast (0 as bit)" +
            " when " +
            " IHP_Vcr.[Expired] < getdate() " +
            " then " +
            " cast (1 as bit)" +
            " end " +
            " as status_voucher_expired, " +
            " IHP_Vcr.[Jenis_kamar] as jenis_kamar, IHP_Vcr.[Kamar] as kamar, IHP_Vcr.[Jam_Free] as jam_free, IHP_Vcr.[Menit_Free] as menit_free, IHP_Vcr.[Date_Start] as date_start, IHP_Vcr.[Time_Start] as time_start, " +
            " case " +
            " when " +
            " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
            " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
            " then " +
            " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
            " else " +
            " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
            " end " +
            " as date_time_start, IHP_Vcr.[Date_Finish] as date_finish, IHP_Vcr.[Time_Finish] as time_finish, " +
            " case " +
            " when " +
            " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
            " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
            " then " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " else " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " end " +
            " as date_time_finish , " +
            " case " +
            " when " +
            " getdate() BETWEEN " +
            " case " +
            " when " +
            " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
            " then " +
            " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
            " else " +
            " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
            " end " +
            " and " +
            " case " +
            " when " +
            " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
            " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
            " then " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " else " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " end " +
            " then " +
            " '1' " +
            " else " +
            " '0' " +
            " end " +
            " as status_jam_sekarang_voucher_bisa_digunakan , DATEDIFF(mi, getdate(), " +
            " case " +
            " when " +
            " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
            " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
            " then " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " else " +
            " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
            " end " +
            " ) AS sisa_waktu_voucher_hari_ini_menit , IHP_Vcr.[Nilai] as nilai, IHP_Vcr.[Jenis_Voucher] as jenis_voucher , " +
            " case " +
            " when " +
            " IHP_Vcr.[Jenis_Voucher] = 0 " +
            " then " +
            " 'FREE VOUCHER MEMOTONG RUPIAH SEWA RUANGAN SAJA' " +
            " when " +
            " IHP_Vcr.[Jenis_Voucher] = 1 " +
            " then " +
            " 'GIFT VOUCHER MEMOTONG TOTAL RUPIAH TAGIHAN ' " +
            " end " +
            " as keterangan_jenis_voucher, " +

            //" IHP_Vcr.[Status] as status_voucher_aktif , " +

            " case " +
            " when " +
            " IHP_Vcr.[Status] ='0' " +
            " then " +
            " cast (0 as bit)" +
            " when " +
            " IHP_Vcr.[Status] ='2'" +
            " then " +
            " cast (0 as bit)" +
            " when " +
            " IHP_Vcr.[Status] ='1'" +
            " then " +
            " cast (1 as bit)" +
            " end " +
            " as status_voucher_aktif, " +

            " cast(  IHP_Vcr.[Status] as int) as [status] , " +
            " case " +
            " when " +
            " IHP_Vcr.[Status] = 0 " +
            " then " +
            " 'VOUCHER SUDAH DIGUNAKAN' " +
            " when " +
            " IHP_Vcr.[Status] = 2 " +
            " then " +
            " 'VOUCHER SAAT INI SEDANG DIGUNAKAN CHECKIN' " +
            " when " +
            " IHP_Vcr.[Status] = 1 " +
            " then " +
            " 'VOUCHER BELUM DIGUNAKAN' " +
            " end " +
            " as keterangan_status_voucher_aktif, " +
            " isnull(IHP_UangVoucher.Reception, '') as voucher_sudah_digunanakan_di_reception, " +
            " 'VOUCHER GENERATE FO ' as keterangan_voucher, " +
            " '' as [description], " +
            " '' as [description_], " +
            " '' as reception , " +
            " '' as member, " +
            " 0 as member_type , " +
            " '' as name_, " +
            " 0 as category, " +
            " 0 as group_, " +
            " 0 as condition_day, " +
            " 0 as condition_tax_service, " +
            " 0 as condition_room_type_over, " +
            " 0 as condition_hour, " +
            " 0 as room_price, " +
            " 0 as condition_room_price, " +
            " 0 as room_discount, " +
            " 0 as condition_room_discount, " +
            " '' as item , " +
            " 0 as qty, " +
            " '' as condition_item , " +
            " 0 as condition_item_qty, " +
            " 0 as condition_item_price, " +
            " 0 as fnb_price, " +
            " 0 as condition_fnb_price, " +
            " 0 as fnb_discount, " +
            " 0 as condition_fnb_discount, " +
            " 0 as condition_price, " +
            " 0 as discount, " +
            " 0 as condition_discount, " +
            " 0 as reedem_poin " +
            " " +
            " FROM " +
            " IHP_Vcr " +
            " left join " +
            " IHP_UangVoucher " +
            " on IHP_UangVoucher.Voucher = IHP_Vcr.Voucher " +
            " WHERE " +
            " IHP_Vcr.Voucher = '" + req.params.voucher + "' " +
            //" and IHP_Vcr.[Status]=1 "+
            //" and IHP_Vcr.[Expired]>=getdate()";
            " and len(IHP_Vcr.[Voucher])<16 ";

        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {
                sql.close();
                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {
                sql.close();
                if (dataReturn.recordset.length > 0) {
                    if (dataReturn.recordset[0].status_voucher_expired == true) {
                        dataResponse = new ResponseFormat(false, null, "Voucher sudah Expired");
                        res.send(dataResponse);
                    }
                    else if (dataReturn.recordset[0].status_voucher_aktif == false) {
                        //dataResponse = new ResponseFormat(false, null, "Voucher sudah sudah terpakai di Reception "+dataReturn.recordset[0].voucher_sudah_digunanakan_di_reception);
                        dataResponse = new ResponseFormat(false, null, "Voucher sudah sudah terpakai");
                        res.send(dataResponse);
                    }
                    else if ((dataReturn.recordset[0].status_voucher_aktif == true) && (dataReturn.recordset[0].status_voucher_expired == false)) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
                        res.send(dataResponse);
                    }
                }
                else {
                    dataResponse = new ResponseFormat(false, null, "");
                    res.send(dataResponse);
                }
            }
        });
    } catch (err) {
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};

exports.getVoucherWebMembership = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var paramOutlet = req.params.outlet;
        var param = req.params.voucher;
        //var url = "http://13.76.167.131:3011/vcr/getVocherDetail_/";        
        var url = "http://13.76.167.131:3013/vcr/getVocherDetail_/";
        //var url = "http://13.76.167.131:4012/vcr/getVocherDetail_/";        
        var outlet = await getNomorOutlet();

        request.get({
            url: url + outlet + "/" + param
        },
            function optionalCallback(err, response, body) {
                if (err) {
                    console.error("Error getVoucherWebMembership -> " + err.message);
                    console.log("Error getVoucherWebMembership -> " + err.message);
                    dataResponse = new ResponseFormat(false, null, err.message);
                    res.send(dataResponse);
                } else {
                    var responya = response.body;
                    var body0 = JSON.parse(responya);
                    if (body0.length > 0) {
                        if (body0.state == true) {

                            if (body0.data[0].status_voucher_expired == 1) {
                                dataResponse = new ResponseFormat(false, null, "Voucher Sudah Expired");
                                res.send(dataResponse);
                            }
                            else if (body0.data[0].status_voucher_aktif == 0) {
                                dataResponse = new ResponseFormat(false, null, "Voucher Sudah Terpakai");
                                res.send(dataResponse);
                            }
                            else if ((body0.data[0].status_voucher_aktif == 1) && (body0.data[0].status_voucher_expired == 0)) {
                                insertUpdateIhpVcr(res, body0.data);
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

async function insertUpdateIhpVcr(res, body) {
    try {
        var res0 = res;
        var voucher0 = body[0].voucher;
        formDataGetToClient = [];
        var Jenis_kamar0;
        var isProsesgetCekVoucherDone;
        var isprosesQueryDone;
        var hasilVoucherLokal;

        var isiQuery = " Select Voucher From IHP_Vcr where Voucher='" + voucher0 + "'";
        isProsesgetCekVoucherDone = await getCekVoucher(isiQuery);
        if (isProsesgetCekVoucherDone != false) {
            console.log("Sukses isProsesgetCekVoucherDone: " + isProsesgetCekVoucherDone);
            logger.info("Sukses isProsesgetCekVoucherDone: " + isProsesgetCekVoucherDone);
            Jenis_kamar0 = body[0].jenis_kamar.toUpperCase();
            var updateQuery = " Update IHP_vcr set " +
                " DATE='" + body[0].active_date + "' " +
                ",Expired='" + body[0].expired + "'" +
                ",Jenis_kamar='" + Jenis_kamar0 + "'" +
                ",Kamar='[NONE]'" +
                ",Jam_Free=" + body[0].jam_free + "" +
                ",Menit_Free=" + body[0].menit_free + "" +
                ",Date_Start=" + body[0].date_start + "" +
                ",Time_Start='" + body[0].time_start + "'" +
                ",Date_Finish=" + body[0].date_finish + "" +
                ",Time_Finish='" + body[0].time_finish + "'" +
                ",Nilai=" + body[0].nilai + "" +
                ",Jenis_Voucher=" + body[0].jenis_voucher + "" +
                //",Status='" + body[0].Status + "'" +
                ",CHtime=getDate()" +
                " where Voucher='" + body[0].voucher + "'";

            isprosesQueryDone = await prosesQuery(updateQuery);
            if (isprosesQueryDone != false) {
                console.log("Sukses Update Voucher: " + body[0].voucher);
                logger.info("Sukses Update Voucher: " + body[0].voucher);

                isProsesgetCekVoucherDone = await getLokalVoucherWebMembership(body[0].voucher);
                if (isProsesgetCekVoucherDone != false) {
                    hasilVoucherLokal = isProsesgetCekVoucherDone;
                    formDataGetToClient.push({ voucher_lokal: hasilVoucherLokal });
                }
                dataResponse = new ResponseFormat(true, body[0]);
                formDataGetToClient.push({ voucher_web_wembership: dataResponse });
                //res0.send(formDataGetToClient);
                res0.send(dataResponse);
            }
            if (isprosesQueryDone == false) {
                console.log("Gagal Update Voucher: " + body[0].voucher);
                logger.info("Gagal Update Voucher: " + body[0].voucher);

                dataResponse = new ResponseFormat(true, body);
                formDataGetToClient.push({ voucherWebMembership: dataResponse });
                //res0.send(formDataGetToClient);
                res0.send(dataResponse);
            }

        }
        else if (isProsesgetCekVoucherDone == false) {
            console.log("Voucher Kosong : " + voucher0);
            logger.info("Voucher Kosong : " + voucher0);
            Jenis_kamar0 = body[0].jenis_kamar.toUpperCase();
            var insertQuery = " INSERT INTO [dbo].[IHP_Vcr]" +
                "([Voucher]" +
                ",[DATE]" +
                ",[Expired]" +
                ",[Jenis_kamar]" +
                ",[Kamar]" +
                ",[Jam_Free]" +
                ",[Menit_Free]" +
                ",[Date_Start]" +
                ",[Time_Start]" +
                ",[Date_Finish]" +
                ",[Time_Finish]" +
                ",[Nilai]" +
                ",[Jenis_Voucher]" +
                ",[Status]" +
                ",[CHtime]" +
                ",[CHUsr]" +
                ",[Export]" +
                ",[Reception]" +
                ",[Flag]" +
                ")" +
                "VALUES " +
                "(" +
                "'" + body[0].voucher + "'" +
                ",'" + body[0].active_date + "'" +
                ",'" + body[0].expired + "'" +
                ",'" + Jenis_kamar0 + "'" +
                ",'[NONE]'" +
                "," + body[0].jam_free + "" +
                "," + body[0].menit_free + "" +
                "," + body[0].date_start + "" +
                ",'" + body[0].time_start + "'" +
                "," + body[0].date_finish + "" +
                ",'" + body[0].time_finish + "'" +
                "," + body[0].nilai + "" +
                "," + body[0].jenis_voucher + "" +
                ",'" + body[0].status + "'" +
                ",getDate()" +
                ",''" +
                ",''" +
                ",''" +
                ",'1'" +
                ")";

            isprosesQueryDone = await prosesQuery(insertQuery);
            if (isprosesQueryDone != false) {
                console.log("Sukses insert Voucher: " + body[0].voucher);
                logger.info("Sukses insert Member: " + body[0].voucher);

                isProsesgetCekVoucherDone = await getLokalVoucherWebMembership(body[0].voucher);
                if (isProsesgetCekVoucherDone != false) {
                    hasilVoucherLokal = isProsesgetCekVoucherDone;
                    //formDataGetToClient.push({ voucherLokal: hasilVoucherLokal });
                }
                dataResponse = new ResponseFormat(true, body[0]);
                formDataGetToClient.push({ voucherWebMembership: dataResponse });
                //res0.send(formDataGetToClient);
                res0.send(dataResponse);
            }
            else if (isprosesQueryDone == false) {
                console.log("Gagal insert Voucher: " + body[0].voucher);
                logger.info("Gagal insert Voucher: " + body[0].voucher);
                dataResponse = new ResponseFormat(true, body);
                formDataGetToClient.push({ voucherWebMembership: dataResponse });
                //res0.send(formDataGetToClient);
                res0.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error('Error isProsesgetCekVoucherDone ' + error.message);
    }
}

function getCekVoucher(isiQuery) {
    return new Promise((resolve, reject) => {
        try {
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        var voucher = dataReturn.recordset[0].Voucher;
                        resolve(voucher);
                    }
                    else {
                        resolve(false);
                    }

                }
            });
        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ' + isiQuery);
            resolve(false);
        }
    });
}

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
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ' + isiQuery);
            resolve(false);
        }
    });
}

function getLokalVoucherWebMembership(voucher) {
    return new Promise((resolve, reject) => {
        try {
            voucher0 = voucher;
            var isiQuery = " " +
                " SELECT " +

                "IHP_Vcr.[Voucher] as voucher" +
                ",IHP_Vcr.[DATE] as date" +
                ",IHP_Vcr.[Expired] as expired" +

                " ,case when IHP_Vcr.[Expired]>getdate()  then 0" +
                " when IHP_Vcr.[Expired]<getdate() then 1 end " +
                " as status_voucher_expired" +

                ",IHP_Vcr.[Jenis_kamar] as jenis_kamar" +
                ",IHP_Vcr.[Kamar] as kamar" +
                ",IHP_Vcr.[Jam_Free] as jam_free" +
                ",IHP_Vcr.[Menit_Free] as menit_free" +
                ",IHP_Vcr.[Date_Start] as date_start" +
                ",IHP_Vcr.[Time_Start] as time_start" +

                ",case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Start]))" +
                " else " +
                " DATEADD(day, IHP_Vcr.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Start])) " +
                " end as date_time_start" +
                ",IHP_Vcr.[Date_Finish] as date_finish" +
                ",IHP_Vcr.[Time_Finish] as time_finish" +

                ", case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Finish]))" +
                " else" +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Finish])) " +
                " end as date_time_finish" +

                " ,case when getdate() BETWEEN  " +

                " case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Start]))" +
                " else " +
                " DATEADD(day, IHP_Vcr.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Start])) " +
                " end " +

                " and " +

                " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Finish]))" +
                " else" +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Finish])) " +
                " end" +

                " then '1'" +
                " else '0' end" +
                " as status_jam_sekarang_voucher_bisa_digunakan" +

                " ,DATEDIFF(mi, getdate(), " +

                " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Finish]))" +
                " else" +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Finish])) " +
                " end" +

                " ) AS sisa_waktu_voucher_hari_ini_menit " +

                /* " ,DATEDIFF(hour, getdate(), "+            
                " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
                " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_Vcr.[Time_Finish]))" +
                " else" +
                " DATEADD(day, IHP_Vcr.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_Vcr.[Time_Finish])) " +
                " end" +
                " ) AS Sisa_Waktu_Voucher_Hari_Ini_Jam " + */

                ",IHP_Vcr.[Nilai] as  nilai" +
                ",IHP_Vcr.[Jenis_Voucher] as jenis_voucher" +

                " ,case when IHP_Vcr.[Jenis_Voucher]=0  then 'FREE VOUCHER MEMOTONG RUPIAH SEWA RUANGAN SAJA'" +
                " when IHP_Vcr.[Jenis_Voucher]=1 then 'GIFT VOUCHER MEMOTONG TOTAL RUPIAH TAGIHAN ' end " +
                " as keterangan_jenis_voucher" +

                ",IHP_Vcr.[Status] as status_voucher_aktif" +

                " ,case when IHP_Vcr.[Status]=0  then 'VOUCHER SUDAH DIGUNAKAN'" +
                " when IHP_Vcr.[Status]=1 then 'VOUCHER BELUM DIGUNAKAN' end " +
                " as keterangan_status_voucher_aktif" +

                //",IHP_Vcr.[Reception] " +
                ",isnull(IHP_UangVoucher.Reception,'') as voucher_sudah_digunanakan_di_reception" +

                " FROM IHP_Vcr" +
                " left join IHP_UangVoucher on IHP_UangVoucher.Voucher=IHP_Vcr.Voucher" +
                " WHERE " +
                " IHP_Vcr.Voucher='" + voucher0 + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset);
                        resolve(dataResponse);
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