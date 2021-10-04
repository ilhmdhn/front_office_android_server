var ResponseFormat = require('./response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;

class KodeTransaksi {
  constructor() { }

  getReceptionCode(shift_, db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var shift = shift_;
        var master_kode_rcp_query = " " +
          "select " +
          " RCP " +
          "from " +
          " IHP_Config3 " +
          "where data='1'";
        var kode_last_rcp_query;
        if (shift == 1) {
          kode_last_rcp_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 2) {
          kode_last_rcp_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 3) {
          kode_last_rcp_query = " " +
            "select " +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 1, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 4, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 7, 2)" +
            " as nomor";
        }
        db.request().query(master_kode_rcp_query, function (err, dataKode) {
          if (err) {
            logger.error(err.message);
            resolve(false);
          } else {
            var kodercp = dataKode.recordset[0].RCP;
            db.request().query(kode_last_rcp_query, function (err, dataReturn) {
              if (err) {
                logger.error(err.message);
                resolve(false);
              } else {
                var kodefullrcp = kodercp + "-" + dataReturn.recordset[0].nomor;
                var isiQuery3 = "select Reception from IHP_Rcp where Reception like '" + kodefullrcp + "%'";
                db.request().query(isiQuery3, function (err, dataReturn) {
                  if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                  } else {
                    sql.close();
                    var kodefullrcpbaru = kodefullrcp + "0001";
                    if (dataReturn.recordset.length > 0) {
                      var lasrcp = parseInt(dataReturn.recordset[dataReturn.recordset.length - 1].Reception.substring(4, 15));
                      var angkanewrcp = lasrcp + 1;
                      var newrcp = kodercp + "-" + angkanewrcp;
                      resolve(newrcp);
                    } else {
                      resolve(kodefullrcpbaru);
                    }
                  }
                });
              }
            });
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

  getinvoiceCode(shift_, db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var shift = shift_;

        var master_kode_ivc_query = " " +
          "select " +
          " IVC " +
          "from " +
          " IHP_Config3 " +
          "where data='1'";
        var kode_last_ivc_query;

        if (shift == 1) {
          kode_last_ivc_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 2) {
          kode_last_ivc_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 3) {
          kode_last_ivc_query = " " +
            "select " +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 1, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 4, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 7, 2)" +
            " as nomor";
        }

        db.request().query(master_kode_ivc_query, function (err, dataKode) {
          if (err) {
            logger.error(err.message);
            logger.error(err);
            resolve(false);
          } else {
            var kodeivc = dataKode.recordset[0].IVC;
            db.request().query(kode_last_ivc_query, function (err, dataReturn) {
              if (err) {
                logger.error(err.message);
                logger.error(err);
                resolve(false);
              } else {
                var kodefullivc = kodeivc + "-" + dataReturn.recordset[0].nomor;
                var isiQuery3 = "select Invoice from IHP_Ivc where Invoice like '" + kodefullivc + "%'";
                db.request().query(isiQuery3, function (err, dataReturn) {
                  if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                  } else {
                    var kodefullivcbaru = kodefullivc + "0001";
                    if (dataReturn.recordset.length > 0) {
                      var lasivc = parseInt(dataReturn.recordset[dataReturn.recordset.length - 1].Invoice.substring(4, 15));
                      var angkanewivc = lasivc + 1;
                      var newivc = kodeivc + "-" + angkanewivc;
                      resolve(newivc);
                    }
                    else {
                      resolve(kodefullivcbaru);
                    }
                  }
                });
              }
            });
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

  getCekReceptionIhp_rcp(db_, rcp0, room0) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room0;
        var rcp = rcp0;
        var isiQuery = " " +
          " select " +
          " Reception as reception" +
          " From IHP_Rcp " +
          " where " +
          " IHP_Rcp.Kamar ='" + room + "'" +
          " and IHP_Rcp.Reception='" + rcp + "'";

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
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              console.log(rcp + " sudah pernah dipakai ");
              logger.info(rcp + " sudah pernah dipakai ");
              resolve(dataResponse);
            }
            else {
              console.log(rcp + " belum pernah dipakai ");
              logger.info(rcp + " belum pernah dipakai ");
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

  getCekInvoiceIhp_Ivc(db_, ivc0, room0) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room0;
        var ivc = ivc0;
        var isiQuery = " " +
          " select " +
          " Invoice as invoice" +
          " From IHP_Ivc " +
          " where " +
          " IHP_Ivc.Kamar ='" + room + "'" +
          " and IHP_Ivc.Invoice='" + ivc + "'";

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
              console.log(ivc + " sudah pernah dipakai ");
              logger.info(ivc + " sudah pernah dipakai ");
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              resolve(dataResponse);
            }
            else {
              console.log(ivc + " belum pernah dipakai ");
              logger.info(ivc + " belum pernah dipakai ");
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

  getSolCode(db_, shift_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var shift = shift_;
        var master_kode_sol_query = " " +
          "select " +
          " SOL " +
          "from " +
          " IHP_Config3 " +
          "where data='1'";
        var kode_last_sol_query;
        if (shift == 1) {
          kode_last_sol_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 2) {
          kode_last_sol_query = "" +
            "select " +
            " substring(convert(nvarchar, getdate(), 2), 1, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 4, 2)+" +
            " substring(convert(nvarchar, getdate(), 2), 7, 2)" +
            " as nomor";
        } else if (shift == 3) {
          kode_last_sol_query = " " +
            "select " +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 1, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 4, 2)+" +
            " substring(convert(nvarchar, dateadd(dd, -1, getdate()), 2), 7, 2)" +
            " as nomor";
        }

        db.request().query(master_kode_sol_query, function (err, dataKode) {
          if (err) {
            sql.close();
            logger.error(err.message);
            resolve(false);
          } else {
            var kodesol = dataKode.recordset[0].SOL;
            db.request().query(kode_last_sol_query, function (err, dataReturn) {
              if (err) {
                sql.close();
                logger.error(err.message);
                resolve(false);
              } else {
                var kodefullsol = kodesol + "-" + dataReturn.recordset[0].nomor;
                var isiQuery3 = "select SlipOrder from ihp_sol where slipOrder like '" + kodefullsol + "%'";
                db.request().query(isiQuery3, function (err, dataReturn) {
                  if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                  } else {
                    sql.close();
                    var kodefullsolbaru = kodefullsol + "00001";
                    var ukuran = dataReturn.recordset.length;
                    var ukuran1 = ukuran - 1;
                    if (ukuran > 0) {
                      var lassol = parseInt(dataReturn.recordset[ukuran1].SlipOrder.substring(4, 15));
                      var angkanewsol = lassol + 1;
                      var newsol = kodesol + "-" + angkanewsol;
                      resolve(newsol);
                    } else {
                      resolve(kodefullsolbaru);
                    }
                  }
                });
              }
            });
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
module.exports = KodeTransaksi;