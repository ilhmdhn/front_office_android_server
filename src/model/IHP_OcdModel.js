var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOcd = require('./../model/variabledb/IHP_Ocd');
var tableInventory = require('./../model/variabledb/IHP_Inventory');

module.exports = {
  getInfo,
  getList,
  DeleteOcd,
  InsertOcd
};

//Digunakan untuk ambil data Okd
function getInfo(OrderPenjualan, SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableOcd.table + " " +
              "WHERE " +
                tableOcd.OrderPenjualan + " = '" + OrderPenjualan + "' AND " +
                tableOcd.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableOcd.Inventory + " = '" + Inventory + "'";

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

//Digunakan untuk ambil semua data Ocd
function getList(OrderCancelation, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "SELECT " +
                tableOcd.table + ".*, " +
                tableInventory.Service + " AS " + tableOcd.Service + ", " +
                tableInventory.Pajak + " AS " + tableOcd.Tax + " " +
              "FROM " + tableOcd.table + " " +
                "LEFT JOIN " + tableInventory.table + " " +
                  "ON " + tableInventory.Inventory + " = " + tableOcd.Inventory + " " +
              "WHERE " +
                tableOcd.OrderCancelation + " = '" + OrderCancelation + "'";

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

//Digunakan untuk ambil semua data Ocd
function DeleteOcd(OcdBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "DELETE " + tableOcd.table + " " +
              "WHERE " +
                tableOcd.OrderCancelation + " = '" + OcdBean.OrderCancelation + "' AND " +
                tableOcd.Inventory + " = '" + OcdBean.Inventory + "' AND " +
                tableOcd.OrderPenjualan + " = '" + OcdBean.OrderPenjualan + "' AND " +
                tableOcd.SlipOrder + " = '" + OcdBean.SlipOrder + "'";

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
function InsertOcd(OcdBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOcd.table + " (" +
                tableOcd.OrderCancelation + ", " +
                tableOcd.Inventory + ", " +
                tableOcd.Nama + ", " +
                tableOcd.Price + ", " +
                tableOcd.Qty + ", " +
                tableOcd.Total + ", " +
                tableOcd.Status + ", " +
                tableOcd.Export + ", " +
                tableOcd.Flag + ", " +
                tableOcd.OrderPenjualan + ", " +
                tableOcd.SlipOrder +
              ") Values (" +
                "'" + OcdBean.OrderCancelation + "', " +
                "'" + OcdBean.Inventory + "', " +
                "'" + OcdBean.Nama + "', " +
                OcdBean.Price + ", " +
                OcdBean.Qty + ", " +
                OcdBean.Total + ", " +
                OcdBean.Status + ", " +
                OcdBean.Export + ", " +
                OcdBean.Flag + ", " +
                "'" + OcdBean.OrderPenjualan + "', " +
                "'" + OcdBean.SlipOrder + "'" +
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