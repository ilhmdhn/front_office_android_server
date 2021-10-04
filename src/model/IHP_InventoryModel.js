var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db ;

//variable table
var tableInventory = require('./../model/variabledb/IHP_Inventory');

module.exports = {
  getInfo
};

//Digunakan untuk ambil data Kamar
function getInfo(Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableInventory.table + " " +
              "WHERE " + tableInventory.Inventory + " = '" + Inventory + "'";
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
      logger.error('Catch Error prosesQuery ' + isiQuery);
      resolve("");
    }
  });
}
