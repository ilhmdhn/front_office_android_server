var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;

class ConfigPos {
  constructor() { }

  getCetakSlipOrderDiPos(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con26'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCetakSlipOrderDiFo(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con27'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCetakOrderPenjualanDiPos(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con30'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCetakPembayaranDiPos(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con31'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCetakTagihanDiPos(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con32'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCetakSlipCheckinDiPos(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        isiQuery = "" +
          " Select Status From IHP_Config4 where IDSetting='Con33'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              var nilai = dataReturn.recordset[0].Status;
              resolve(nilai);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

}
module.exports = ConfigPos;