var ResponseFormat = require('./response');
var sql = require("mssql");
var logger= require('../util/logger');
var db;
var isiQuery;

class Shift {
  constructor() { }

  getShift(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " set " +
          " dateformat dmy  " +
          " select " +
          " substring(convert(varchar(24),getdate(),114),1,2) " +
          " as jamsekarang";

        var shift1 = 6;
        var shift2 = 18;
        var shift3 = 24;
        var final_shift;
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message);
            logger.error(err);
            resolve(false);
          } else {
            sql.close();
            var jam_sekarang = parseInt(dataReturn.recordset[0].jamsekarang);
            if ((jam_sekarang >= shift1) & (jam_sekarang < shift2)) {
              final_shift = 1;
              resolve(final_shift);
            } else if ((jam_sekarang >= shift2) & (jam_sekarang < shift3)) {
              final_shift = 2;
              resolve(final_shift);
            } else if ((jam_sekarang >= 0) & (jam_sekarang < shift1)) {
              final_shift = 3;
              resolve(final_shift);
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

  getDateTransQuery(shift_) {
    return new Promise((resolve, reject) => {
      try {
        var shift = shift_;
        var date_trans_Query;
        if (shift == 1) {
          date_trans_Query = "getdate()";
        } else if (shift == 2) {
          date_trans_Query = "getdate()";
        } else if (shift == 3) {
          date_trans_Query = "DATEADD(dd, -1, GETDATE())";
        }
        resolve(date_trans_Query);
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve("getdate()");
      }
    });
  }

  getFinalShift(shift_) {
    return new Promise((resolve, reject) => {
      var finalShift = 1;
      try {
        var shift = shift_;
        //hanya Menggunakan 2 shift
        if (shift == 1) {
          finalShift = 1;
        } else if (shift == 2) {
          finalShift = 2;
        } else if (shift == 3) {
          finalShift = 2;
        }
        resolve(finalShift);
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

}
module.exports = Shift;