var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableSod = require('./../model/variabledb/IHP_Sod');
var tableSodPromo = require('./../model/variabledb/IHP_Sod_Promo');

module.exports = {
  getList
};

//Digunakan untuk ambil data Okd
function getList(SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT " +
                tableSodPromo.table + ".*, " +
                tableSod.Qty + " AS " + tableSodPromo.Qty + ", " +
                "(" + tableSodPromo.Harga_Promo + " / " + tableSod.Qty + ") AS " + tableSodPromo.Harga_Promo_PerItem + " " +
              "FROM " + tableSodPromo.table + " " +
                "LEFT JOIN " + tableSod.table + " " +
                  "ON " +
                    tableSod.SlipOrder + " = " + tableSodPromo.SlipOrder + " AND " +
                    tableSod.Inventory + " = " + tableSodPromo.Inventory + " " +
              "WHERE " +
                tableSodPromo.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableSodPromo.Inventory + " = '" + Inventory + "'";

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
      logger.error('Catch Error prosesQuery ' );
      resolve("");
    }
  });
}