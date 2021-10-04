var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOkl = require('./../model/variabledb/IHP_Okl');

module.exports = {
  UpdateOkl,
  InsertOkl
};

//Digunakan untuk ambil semua data Ocd
function UpdateOkl(OklBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "UPDATE " + tableOkl.table + " " +
              "SET " +
                tableOkl.Total + " = " + OklBean.Total + ", " +
                tableOkl.Discount + " = " + OklBean.Discount + ", " +
                tableOkl.Service + " = " + OklBean.Service + ", " +
                tableOkl.Tax + " = " + OklBean.Tax + ", " +
                tableOkl.TotalValue + " = " + OklBean.TotalValue + ", " +
                tableOkl.Chtime + " = CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8), " +
                tableOkl.CHusr + " = '" + OklBean.Chusr + "', " +
                tableOkl.Shift + " = " + OklBean.Shift + " " +
              "WHERE " + tableOkl.OrderPenjualan + " = '" + OklBean.OrderPenjualan + "'";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + query);
      resolve(false);
    }
  });
}

//Digunakan untuk ambil semua data Ocd
function InsertOkl(OklBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOkl.table + " (" +
                tableOkl.OrderPenjualan + ", " +
                tableOkl.DATE + ", " +
                tableOkl.Shift + ", " +
                tableOkl.Reception + ", " +
                tableOkl.Kamar + ", " +
                tableOkl.Member + ", " +
                tableOkl.Nama + ", " +
                tableOkl.Keterangan + ", " +
                tableOkl.Total + ", " +
                tableOkl.Discount + ", " +
                tableOkl.Service + ", " +
                tableOkl.Tax + ", " +
                tableOkl.TotalValue + ", " +
                tableOkl.Status + ", " +
                tableOkl.Chtime + ", " +
                tableOkl.CHusr + ", " +
                tableOkl.Date_Trans + ", " +
                tableOkl.Posted + ", " +
                tableOkl.Printed + ", " +
                tableOkl.Penjualan + ", " +
                tableOkl.Export +
              ") Values (" +
                "'" + OklBean.OrderPenjualan + "', " +
                "'" + OklBean.DATE + "', " +
                "'" + OklBean.Shift + "', " +
                "'" + OklBean.Reception + "', " +
                "'" + OklBean.Kamar + "', " +
                "'" + OklBean.Member + "', " +
                "'" + OklBean.Nama + "', " +
                "'', " +
                OklBean.Total + ", " +
                OklBean.Discount + ", " +
                OklBean.Service + ", " +
                OklBean.Tax + ", " +
                OklBean.TotalValue + ", " +
                "'1', " +
                "CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) , " +
                "'" + OklBean.Chusr + "', " +
                OklBean.Date_Trans + ", " +
                "''," +
                "''," +
                "''," +
                "''" +
              ")";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + query);
      resolve(false);
    }
  });
}