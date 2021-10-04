var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableOkd = require('./../model/variabledb/IHP_Okd');
var tableOkl = require('./../model/variabledb/IHP_Okl');
var tableInventory = require('./../model/variabledb/IHP_Inventory');

module.exports = {
  getInfo,
  getList,
  getListByCode,
  getInfo4Order,
  InsertOkd
};

//Digunakan untuk ambil data Okd untuk cancel
function getInfo(OrderPenjualan, SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableOkd.table + " " +
              "WHERE " +
                tableOkd.OrderPenjualan + " = '" + OrderPenjualan + "' AND " +
                tableOkd.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableOkd.Inventory + " = '" + Inventory + "'";

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
function getInfo4Order(SlipOrder, Inventory, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableOkd.table + " " +
              "WHERE " +
                tableOkd.OrderPenjualan + " = '" + OrderPenjualan + "' AND " +
                tableOkd.SlipOrder + " = '" + SlipOrder + "' AND " +
                tableOkd.Inventory + " = '" + Inventory + "'";

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
function getList(Reception, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "SELECT " +
                tableOkd.OrderPenjualan + " AS order_penjualan, " + //entitas tidak boleh diganti
                tableOkd.Inventory + " AS inventory, " + //entitas tidak boleh diganti
                tableOkd.Nama + " AS nama, " + //entitas tidak boleh diganti
                tableOkd.Price + " AS price, " + //entitas tidak boleh diganti
                tableOkd.Qty + " AS qty, " + //entitas tidak boleh diganti
                tableOkd.Total + " AS total_setelah_diskon, " + //entitas tidak boleh diganti
                "CONVERT(varchar(10), " + tableOkd.Status + ") " + " AS order_status, " + //entitas tidak boleh diganti
                tableOkd.Location + " AS location, " + //entitas tidak boleh diganti
                "CASE WHEN " + tableOkd.Printed + " > 1 THEN 'True' ELSE 'False' END AS printed, " + //entitas tidak boleh diganti
                tableOkd.Note + " AS note, " + //entitas tidak boleh diganti
                tableOkd.SlipOrder + " AS slip_order, " + //entitas tidak boleh diganti
                tableOkd.ID_COOKER + " AS id_cooker, " + //entitas tidak boleh diganti
                tableOkd.Flag + " AS flag " + //entitas tidak boleh diganti
              "FROM " + tableOkd.table + " " +
              "WHERE " +
                tableOkd.OrderPenjualan + " IN (" +
                  "SELECT " + tableOkl.OrderPenjualan + " " +
                  "FROM " + tableOkl.table + " " +
                  "WHERE " + tableOkl.Reception + " = '" + Reception + "')";

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

//Digunakan untuk ambil data Okd
function getListByCode(OrderPenjualan, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "SELECT " +
                tableOkd.table + ".*, " +
                tableInventory.Service + " AS " + tableOkd.Service + ", " +
                tableInventory.Pajak + " AS " + tableOkd.Tax + " " +
              "FROM " + tableOkd.table + " " +
                "LEFT JOIN " + tableInventory.table + " " +
                  "ON " + tableInventory.Inventory + " = " + tableOkd.Inventory + " " +
              "WHERE " +
              tableOkd.OrderPenjualan + " = '" + OrderPenjualan + "'";

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

//Digunakan untuk ambil semua data Okd
function InsertOkd(OkdBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "INSERT INTO " + tableOkd.table + " (" +
                tableOkd.OrderPenjualan + ", " +
                tableOkd.Inventory + ", " +
                tableOkd.Nama + ", " +
                tableOkd.Price + ", " +
                tableOkd.Qty + ", " +
                tableOkd.Total + ", " +
                tableOkd.Status + ", " +
                tableOkd.Location + ", " +
                tableOkd.Printed + ", " +
                tableOkd.Note + ", " +
                tableOkd.SlipOrder +
              ") Values (" +
                "'" + OkdBean.OrderPenjualan + "', " +
                "'" + OkdBean.Inventory + "', " +
                "'" + OkdBean.Nama + "', " +
                OkdBean.Price + ", " +
                OkdBean.Qty + ", " +
                OkdBean.Total + ", " +
                OkdBean.Status + ", " +
                OkdBean.Location + ", " +
                OkdBean.Printed + ", " +
                "'" + OkdBean.Note + "', " +
                "'" + OkdBean.SlipOrder + "'" +
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
