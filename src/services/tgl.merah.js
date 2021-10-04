var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var dataResponse;

class TglMerah {
  constructor() { 
  }

  getApakahSekarangMalamBesokLibur(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        //warning do not use set dateformat dmy
        var isiQuery = "" +
          " select " +
          " [Nama_Libur] as nama_libur" +
          " ,[Date_Libur] as date_libur" +
          " from [IHP_MBL]" +
          " where [Date_Libur] in(" +
          " SELECT" +
          " case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0" +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5" +
          " then" +
          " DATEADD(day, -1, CONVERT(DATETIME, convert(varchar(10), getdate(), 23)))" +
          " else " +
          " DATEADD(day, 0, CONVERT(DATETIME, convert(varchar(10), getdate(), 23)))" +
          " end" +
          " as pengecekan_apakah_sekarang_tgl_libur " +
          " FROM" +
          " IHP_Config" +
          " where" +
          " Data = 1" +
          " ) ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              console.log("Sekarang tanggal Libur nomor_hari=9 " +
                dataReturn.recordset[0].nama_libur + " " +
                dataReturn.recordset[0].date_libur);
              logger.info("Sekarang tanggal Libur nomor_hari=9 " +
                dataReturn.recordset[0].nama_libur + " " +
                dataReturn.recordset[0].date_libur);
              resolve(dataResponse);
            }
            else {
              console.log("Sekarang Bukan tanggal Libur ");
              logger.info("Sekarang Bukan tanggal Libur ");
              resolve(false);
            }

          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getApakahSekarangTanggalLibur( db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        //warning do not use set dateformat dmy
        var isiQuery = "" +
          " select " +
          " [Nama_Libur] as nama_libur" +
          " ,[Date_Libur] as date_libur" +
          " from [IHP_MBL]" +
          " where [Date_Libur] in(" +
          " SELECT" +
          " case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEADD(day, 0, CONVERT(DATETIME, convert(varchar(10), getdate(), 23)))" +
          " else" +
          " DATEADD(day, 1, CONVERT(DATETIME, convert(varchar(10), getdate(), 23)))" +
          " end" +
          " as pengecekan_apakah_besok_libur_mbl" +
          " FROM" +
          " IHP_Config" +
          " where" +
          " Data = 1" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              console.log("Sekarang Malam Besok Libur mbl=1 nomor hari=8 " +
                dataReturn.recordset[0].nama_libur + " " +
                dataReturn.recordset[0].date_libur);
              logger.info("Sekarang Malam Besok Libur mbl=1 nomor hari=8 " +
                dataReturn.recordset[0].nama_libur + " " +
                dataReturn.recordset[0].date_libur);
              resolve(dataResponse);
            }
            else {
              console.log("Sekarang Bukan Malam Besok Libur mbl=0");
              logger.info("Sekarang Bukan Malam Besok Libur mbl=0");
              resolve(false);
            }

          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

}
module.exports = TglMerah;