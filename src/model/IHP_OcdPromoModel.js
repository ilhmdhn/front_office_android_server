var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOcdPromo = require('./../model/variabledb/IHP_Ocd_Promo');

module.exports = {
  DeleteOcd,
  InsertOcd
};

//Digunakan untuk ambil semua data Ocd
function DeleteOcd(OcdPromoBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "DELETE " + tableOcdPromo.table + " " +
              "WHERE " +
                tableOcdPromo.OrderCancelation + " = '" + OcdPromoBean.OrderCancelation + "' AND " +
                tableOcdPromo.Inventory + " = '" + OcdPromoBean.Inventory + "' AND " +
                tableOcdPromo.Promo_Food + " = '" + OcdPromoBean.Promo_Food + "' AND " +
                tableOcdPromo.OrderPenjualan + " = '" + OcdPromoBean.OrderPenjualan + "' AND " +
                tableOcdPromo.SlipOrder + " = '" + OcdPromoBean.SlipOrder + "'";

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

//Digunakan untuk inert data Promo
function InsertOcd(OcdPromoBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOcdPromo.table + " (" +
                tableOcdPromo.OrderCancelation + ", " +
                tableOcdPromo.Inventory + ", " +
                tableOcdPromo.Promo_Food + ", " +
                tableOcdPromo.Harga_Promo + ", " +
                tableOcdPromo.OrderPenjualan + ", " +
                tableOcdPromo.SlipOrder +
              ") Values (" +
                "'" + OcdPromoBean.OrderCancelation + "', " +
                "'" + OcdPromoBean.Inventory + "', " +
                "'" + OcdPromoBean.Promo_Food + "', " +
                OcdPromoBean.Harga_Promo + ", " +
                "'" + OcdPromoBean.OrderPenjualan + "', " +
                "'" + OcdPromoBean.SlipOrder + "'" +
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
