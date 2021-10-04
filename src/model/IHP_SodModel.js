var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableSod = require('./../model/variabledb/IHP_Sod');
var tableSol = require('./../model/variabledb/IHP_Sol');

module.exports = {
  getInfo,
  getListSlipOrderFO
};

//Digunakan untuk ambil data Okd
function getInfo(SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableSod.table + " " +
              "WHERE " +
                tableSod.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableSod.Inventory + " = '" + Inventory + "'";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve("");
        } else {
          if (dataReturn.recordset.length > 0) {
            resolve(dataReturn.recordset[0]);
          } else {
            resolve("");
          }
        }
      });
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' );
      resolve("");
    }
  });
}

//Digunakan untuk ambil data Okd
function getListSlipOrderFO(Reception, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "SELECT * " +
              "FROM " + tableSod.table + " " +
              "WHERE " +
                tableSod.SlipOrder + " IN (" +
                  "SELECT " + tableSol.SlipOrder + " " +
                  "FROM " + tableSol.table + " " +
                  "WHERE " + tableSol.Reception + " = '" + Reception + "') AND " +
                tableSod.Status + " = 1 AND " +
                tableSod.Location + " = 1 AND " +
                "(" + tableSod.Printed + " = 0 OR " + tableSod.Printed + " = 2)";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve("");
        } else {
          if (dataReturn.recordset.length > 0) {
            resolve(dataReturn.recordset);
          } else {
            resolve("");
          }
        }
      });
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + query);
      resolve("");
    }
  });
}
