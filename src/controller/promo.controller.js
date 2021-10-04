var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db;

exports.getGetPromoRoom = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var roomQuery = " " +
            " select " +
            "IHP_PromoRoom.[Promo_Room] as promo_room" +
            ",IHP_PromoRoom.[Hari] as hari" +
            ",IHP_PromoRoom.[Room] as room" +
            ",IHP_PromoRoom.[Date_Start] as date_start" +
            ",IHP_PromoRoom.[Time_Start] as time_start" +

            ",case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Start]))" +
            " else " +
            " DATEADD(day, IHP_PromoRoom.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Start])) " +
            " end as date_time_start" +

            ",IHP_PromoRoom.[Date_Finish]  as date_finish" +
            ",IHP_PromoRoom.[Time_Finish] as time_finish" +

            ", case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Finish])) " +
            " end as date_time_finish" +

            " ,case when getdate() BETWEEN  " +


            " case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Start]))" +
            " else " +
            " DATEADD(day, IHP_PromoRoom.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Start])) " +
            " end " +

            " and " +

            " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Finish])) " +
            " end " +

            " then '1'" +
            " else '0' end" +
            " as status_jam_sekarang_masuk_masa_promo" +

            " ,DATEDIFF(mi, getdate(), " +

            " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Finish])) " +
            " end " +
            " ) as wisa_waktu_promo_hari_ini_menit " +

            /* " ,DATEDIFF(hour, getdate(), "+
            " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoRoom.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoRoom.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoRoom.[Time_Finish])) " +
            " end " +
            " ) AS Sisa_Waktu_Promo_Hari_Ini_Jam " + */

            ",IHP_PromoRoom.[Diskon_Persen] as diskon_persen" +
            ",IHP_PromoRoom.[Diskon_Rp] as diskon_rp" +
            ",IHP_PromoRoom.[Khusus] as khusus" +
            " ,case when IHP_PromoRoom.[Khusus]=0  then 'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN'" +
            " when IHP_PromoRoom.[Khusus]=1  then 'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' end" +
            " as keterangan_khusus" +
            ",IHP_PromoRoom.[Status] as status_aktif" +
            " FROM IHP_PromoRoom " +
            " where (Room = '[NONE]' or Room = '" + req.params.jenis_kamar + "') " +
            " and (Hari = 0 or Hari = 5) " +
            " and Status = 1";


        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {

                logger.error(err.message);
                res.send(new ResponseFormat(false, null, err.message));
            } else {

                if (dataReturn.recordset.length > 0) {
                    res.send(new ResponseFormat(true, dataReturn.recordset));
                }
                else {
                    res.send(new ResponseFormat(false, null, "Data Not Found"));
                }
            }
        });

    } catch (err) {
        logger.error(err.message);
        res.send(new ResponseFormat(false, null, err.message));
    }
};

exports.getGetPromoFood = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var roomQuery = " " +
            " select " +
            "IHP_PromoFood.[Promo_Food] as promo_food" +
            ",IHP_PromoFood.[Syarat_Kamar] as syarat_kamar" +
            ",IHP_PromoFood.[Kamar] as  kamar" +
            ",IHP_PromoFood.[Syarat_Jenis_kamar] as syarat_jenis_kamar" +
            ",IHP_PromoFood.[Jenis_Kamar] as jenis_kamar" +
            ",IHP_PromoFood.[Syarat_Durasi] as syarat_duras" +
            ",IHP_PromoFood.[Syarat_Hari] as syarat_hari" +
            ",IHP_PromoFood.[Hari] as hari" +
            ",IHP_PromoFood.[Syarat_Jam] as syarat_jam" +
            ",IHP_PromoFood.[Date_Start] as date_start" +
            ",IHP_PromoFood.[Time_Start] as time_start" +

            ",case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoFood.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Start]))" +
            " else " +
            " DATEADD(day, IHP_PromoFood.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Start])) " +
            " end as date_time_start" +

            ",IHP_PromoFood.[Date_Finish] as date_finish" +
            ",IHP_PromoFood.[Time_Finish] as time_finish" +

            ", case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Finish])) " +
            " end as date_time_finish" +

            " ,case when getdate() BETWEEN  " +


            "case when CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoFood.[Date_Start],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Start]))" +
            " else " +
            " DATEADD(day, IHP_PromoFood.[Date_Start],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Start])) " +
            " end " +

            " and " +


            " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Finish])) " +
            " end " +

            " then '1'" +
            " else '0' end" +
            " as status_jam_sekarang_masuk_masa_promo" +

            " ,DATEDIFF(mi, getdate(), " +

            " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
            " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Finish]))" +
            " else" +
            " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Finish])) " +
            " end " +
            " ) AS sisa_waktu_promo_hari_ini_menit " +

            /*  " ,DATEDIFF(hour, getdate(), "+
             " case when  CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)>=0 and " +
             " CAST(substring(convert(varchar(24),getdate(),114),1,2)AS int)<=5 then " +
             " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),DATEADD(dd, -1, GETDATE()),23)+' '+IHP_PromoFood.[Time_Finish]))" +
             " else" +
             " DATEADD(day, IHP_PromoFood.[Date_Finish],CONVERT(DATETIME, convert(varchar(10),getdate(),23)+' '+IHP_PromoFood.[Time_Finish])) " +
             " end " +
             ") AS Sisa_Waktu_Promo_Hari_Ini_Jam " + */

            ",IHP_PromoFood.[Syarat_Inventory] as syarat_inventory" +
            ",IHP_PromoFood.[Inventory] as inventory" +
            ",IHP_PromoFood.[Syarat_Quantity] as syarat_quantity" +
            ",IHP_PromoFood.[Quantity] as quantity" +
            ",IHP_PromoFood.[Sign_Inventory] as sign_inventory" +
            ",IHP_PromoFood.[Sign_Diskon_Persen] as sign_diskon_persen" +
            ",IHP_PromoFood.[Diskon_Persen] as diskon_persen" +
            ",IHP_PromoFood.[Sign_Diskon_Rp] sign_diskon_rp" +
            ",IHP_PromoFood.[Diskon_Rp] diskon_rp" +
            ",IHP_PromoFood.[Khusus] as khusus" +

            " ,case when IHP_PromoFood.[Khusus]=0  then 'PROMO TIDAK MEMERLUKAN VERIFIKASI SPV KAPTEN'" +
            " when IHP_PromoFood.[Khusus]=1  then 'PROMO MEMERLUKAN VERIFIKASI SPV KAPTEN' end" +
            " as Khusus1" +

            ",IHP_PromoFood.[Status] as status_aktif" +
            ",IHP_PromoFood.[Global] as global" +

            " ,case when IHP_PromoFood.[Global]=0  then 'PROMO FNB PER ITEM'" +
            " when IHP_PromoFood.[Global]=1  then 'PROMO UNTUK SEMUA FNB' end" +
            " as keterangan_global" +

            " FROM IHP_PromoFood " +
            " where" +
            " (Kamar = '[NONE]' or Kamar = '" + req.params.kamar + "') " +
            " and (Hari = 0 or Hari = 5) " +
            " and (Jenis_Kamar = '[NONE]' or Jenis_Kamar = '" + req.params.jenis_kamar + "') " +
            " and Status = 1 ";


        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {

                logger.error(err.message);
                res.send(new ResponseFormat(false, null, err.message));
            } else {

                if (dataReturn.recordset.length > 0) {
                    res.send(new ResponseFormat(true, dataReturn.recordset));
                }
                else {
                    res.send(new ResponseFormat(false, null, "Data Not Found"));
                }
            }
        });

    } catch (err) {
        logger.error(err.message);
        res.send(new ResponseFormat(false, null, err.message));
    }
};