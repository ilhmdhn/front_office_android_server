var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOcl = require('./../model/variabledb/IHP_Ocl');

module.exports = {
  UpdateOcl,
  InsertOcl
};

//Digunakan untuk ambil semua data Ocd
function UpdateOcl(OclBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "UPDATE " + tableOcl.table + " " +
              "SET " +
                tableOcl.Charge + " = " + OclBean.Charge + ", " +
                tableOcl.Discount + " = " + OclBean.Discount + ", " +
                tableOcl.Service + " = " + OclBean.Service + ", " +
                tableOcl.Tax + " = " + OclBean.Tax + ", " +
                tableOcl.Total + " = " + OclBean.Total + ", " +
                tableOcl.Chtime + " = CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8), " +
                tableOcl.CHusr + " = '" + OclBean.Chusr + "', " +
                tableOcl.Shift + " = " + OclBean.Shift + " " +
              "WHERE " + tableOcl.OrderCancelation + " = '" + OclBean.OrderCancelation + "'";

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
function InsertOcl(OclBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOcl.table + " (" +
                tableOcl.OrderCancelation + ", " +
                tableOcl.DATE + ", " +
                tableOcl.Member + ", " +
                tableOcl.Nama + ", " +
                tableOcl.Kamar + ", " +
                tableOcl.Charge + ", " +
                tableOcl.Discount + ", " +
                tableOcl.Service + ", " +
                tableOcl.Tax + ", " +
                tableOcl.Total + ", " +
                tableOcl.Chtime + ", " +
                tableOcl.CHusr + ", " +
                tableOcl.Reception + ", " +
                tableOcl.Shift + ", " +
                tableOcl.Date_Trans + ", " +
                tableOcl.Export +
              ") Values (" +
                "'" + OclBean.OrderCancelation + "', " +
                "'" + OclBean.DATE + "', " +
                "'" + OclBean.Member + "', " +
                "'" + OclBean.Nama + "', " +
                "'" + OclBean.Kamar + "', " +
                OclBean.Charge + ", " +
                OclBean.Discount + ", " +
                OclBean.Service + ", " +
                OclBean.Tax + ", " +
                OclBean.Total + ", " +
                "CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) , " +
                "'" + OclBean.Chusr + "', " +
                "'" + OclBean.Reception + "', " +
                "'" + OclBean.Shift + "', " +
                OclBean.Date_Trans + ", " +
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