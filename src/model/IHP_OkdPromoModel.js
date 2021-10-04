var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOkd = require('./../model/variabledb/IHP_Okd');
var tableOkdPromo = require('./../model/variabledb/IHP_Okd_Promo');

module.exports = {
  getList,
  InsertOkd
};

//Digunakan untuk ambil data Okd
function getList(OrderPenjualan, SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT " +
                tableOkdPromo.table + ".*, " +
                tableOkd.Qty + " AS " + tableOkdPromo.Qty + ", " +
                "(" + tableOkdPromo.Harga_Promo + " / " + tableOkd.Qty + ") AS " + tableOkdPromo.Harga_Promo_PerItem + " " +
              "FROM " + tableOkdPromo.table + " " +
                "LEFT JOIN " + tableOkd.table + " " +
                  "ON " +
                    tableOkd.OrderPenjualan + " = " + tableOkdPromo.OrderPenjualan + " AND " +
                    tableOkd.SlipOrder + " = " + tableOkdPromo.SlipOrder + " AND " +
                    tableOkd.Inventory + " = " + tableOkdPromo.Inventory + " " +
              "WHERE " +
                tableOkdPromo.OrderPenjualan + " = '" + OrderPenjualan + "' AND " +
                tableOkdPromo.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableOkdPromo.Inventory + " = '" + Inventory + "'";

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
      logger.error('Catch Error prosesQuery ');
      resolve("");
    }
  });
}

//Digunakan untuk inert data Promo
function InsertOkd(OkdPromoBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOkdPromo.table + " (" +
                tableOkdPromo.OrderPenjualan + ", " +
                tableOkdPromo.Inventory + ", " +
                tableOkdPromo.Promo_Food + ", " +
                tableOkdPromo.Harga_Promo + ", " +
                tableOkdPromo.SlipOrder +
              ") Values (" +
                "'" + OkdPromoBean.OrderPenjualan + "', " +
                "'" + OkdPromoBean.Inventory + "', " +
                "'" + OkdPromoBean.Promo_Food + "', " +
                OkdPromoBean.Harga_Promo + ", " +
                "'" + OkdPromoBean.SlipOrder + "'" +
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
