var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;

class IpAddressService {
  constructor() { }
  
  getIpAddress(db_, aplikasi_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var aplikasi = aplikasi_;
        var isiQuery = " " +
          " SELECT " +
          " [IP_Address] as ip_address " +
          " from [IHP_IPAddress] " +
          " WHERE " +
          " Aplikasi='" + aplikasi + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (err) {
        sql.close();
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getIpAddressPos(db_, slip_order_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var slip_order = slip_order_;
        var isiQuery = " " +
          " SELECT " +
          " POS as ip_address " +
          " from [IHP_Sol] " +
          " WHERE " +
          " SlipOrder='" + slip_order + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (err) {
        sql.close();
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getUdpPort(db_, aplikasi_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var aplikas = aplikasi_;
        var isiQuery = " " +
          " SELECT " +
          " [Server_Udp_Port] as server_udp_port " +
          " from [IHP_IPAddress] " +
          " WHERE " +
          " Aplikasi='" + aplikas + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (err) {
        sql.close();
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }
}
module.exports = IpAddressService;