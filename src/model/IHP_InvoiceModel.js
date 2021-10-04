var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db ;

//variable table
var tableIvc = require('./../model/variabledb/IHP_Ivc');
var tableOkl = require('./../model/variabledb/IHP_Okl');
var tableOcl = require('./../model/variabledb/IHP_Ocl');

module.exports = {
  getInfo,
  getInfoByInvoice,
  recountPenjualan
};

//Digunakan untuk ambil data
function getInfo(Reception, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableIvc.table + " " +
              "WHERE " + tableIvc.Reception + " = '" + Reception + "'";

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

//Digunakan untuk ambil data
function getInfoByInvoice(Invoice, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT * " +
              "FROM " + tableIvc.table + " " +
              "WHERE " + tableIvc.Invoice + " = '" + Invoice + "'";

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

//Digunakan untuk hitung ulang invoice
function recountPenjualan(Reception, req, db){
  return new Promise((resolve, reject) => {
    var query;
    var query1;
    var query2;
    try {
      logger = req.log;

      //Update 1, penjualan
      query1 = "UPDATE " + tableIvc.table + " " +
               "SET " +
                 tableIvc.Charge_Penjualan + " = ISNULL(Okl.Charge_Penjualan, 0), " +
                 tableIvc.Total_Cancelation + " = ISNULL(Ocl.Total_Cancelation, 0), " +
                 tableIvc.Discount_Penjualan + " = ROUND(ISNULL(Okl.Discount, 0) - ISNULL(Ocl.Discount, 0), 2), " +
                 tableIvc.Service_Penjualan + " = ROUND(ISNULL(Okl.Service, 0) - ISNULL(Ocl.Service, 0), 2), " +
                 tableIvc.Tax_Penjualan + " = ROUND(ISNULL(Okl.Tax, 0) - ISNULL(Ocl.Tax, 0), 2) " +
               "FROM " + tableIvc.table + " " +
                 "LEFT JOIN (" +
                   "SELECT " +
                     tableOkl.Reception + ", " +
                     "SUM(" + tableOkl.Total + ") AS Charge_Penjualan, " +
                     "SUM(" + tableOkl.Discount + ") AS Discount, " +
                     "SUM(" + tableOkl.Service + ") AS Service, " +
                     "SUM(" + tableOkl.Tax + ") AS Tax " +
                   "FROM " + tableOkl.table + " " +
                   "WHERE " + tableOkl.Reception + " = '" + Reception + "' " +
                   "GROUP BY " + tableOkl.Reception +
                 ") Okl " +
                   "ON Okl.Reception = " + tableIvc.Reception + " " +
                 "LEFT JOIN (" +
                   "SELECT " +
                     "Reception, " +
                     "SUM(" + tableOcl.Charge + ")AS Total_Cancelation, " +
                     "SUM(" + tableOcl.Discount + ") AS Discount, " +
                     "SUM(" + tableOcl.Service + ") AS Service, " +
                     "SUM(" + tableOcl.Tax + ") AS Tax " +
                   "FROM " + tableOcl.table + " " +
                   "WHERE " + tableOcl.Reception + " = '" + Reception + "' " +
                   "GROUP BY " + tableOcl.Reception +
                 ") Ocl " +
                   "ON Ocl.Reception = " + tableIvc.Reception + " " +
               "WHERE " + tableIvc.Reception + " = '" + Reception + "';";

      //Update 2, total penjualan
      query2 = "UPDATE " + tableIvc.table + " " +
               "SET " +
                 tableIvc.Total_Penjualan + " = (" +
                   tableIvc.Charge_Penjualan + " - " +
                   tableIvc.Total_Cancelation + " - " +
                   tableIvc.Discount_Penjualan + " + " +
                   tableIvc.Service_Penjualan + " + " +
                   tableIvc.Tax_Penjualan +
                 "), " +
                 tableIvc.Total_All + " = (" +
                   "(" +
                     tableIvc.Sewa_Kamar + " + " +
                     tableIvc.Total_Extend + " + " +
                     tableIvc.Overpax + " - " +
                     tableIvc.Discount_Kamar + " + " +
                     tableIvc.Surcharge_Kamar + " + " +
                     tableIvc.Service_Kamar + " + " +
                     tableIvc.Tax_Kamar +
                   ") + (" +
                     tableIvc.Charge_Penjualan + " - " +
                     tableIvc.Total_Cancelation + " - " +
                     tableIvc.Discount_Penjualan + " + " +
                     tableIvc.Service_Penjualan + " + " +
                     tableIvc.Tax_Penjualan +
                   ") - " +
                   tableIvc.Uang_Voucher +
                 ") " +
                 "FROM " + tableIvc.table + " " +
                 "LEFT JOIN (" +
                   "SELECT " +
                     tableOkl.Reception + ", " +
                     "SUM(" + tableOkl.Total + ") AS Charge_Penjualan, " +
                     "SUM(" + tableOkl.Discount + ") AS Discount, " +
                     "SUM(" + tableOkl.Service + ") AS Service, " +
                     "SUM(" + tableOkl.Tax + ") AS Tax " +
                   "FROM " + tableOkl.table + " " +
                   "WHERE " + tableOkl.Reception + " = '" + Reception + "' " +
                   "GROUP BY " + tableOkl.Reception +
                 ") Okl " +
                   "ON Okl.Reception = " + tableIvc.Reception + " " +
                 "LEFT JOIN (" +
                   "SELECT " +
                     "Reception, " +
                     "SUM(" + tableOcl.Charge + ")AS Total_Cancelation, " +
                     "SUM(" + tableOcl.Discount + ") AS Discount, " +
                     "SUM(" + tableOcl.Service + ") AS Service, " +
                     "SUM(" + tableOcl.Tax + ") AS Tax " +
                   "FROM " + tableOcl.table + " " +
                   "WHERE " + tableOcl.Reception + " = '" + Reception + "' " +
                   "GROUP BY " + tableOcl.Reception +
                 ") Ocl " +
                   "ON Ocl.Reception = " + tableIvc.Reception + " " +
               "WHERE " + tableIvc.Reception + " = '" + Reception + "';";
  
      //Cek jenis kamar
      query = query1 + query2;
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + isiQuery);
      resolve(false);
    }
  });
}
