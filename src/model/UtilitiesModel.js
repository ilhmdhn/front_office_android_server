var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db;
var request = require('request');

module.exports = {
  getDateNow,
  getShift,
  getDateTrans,
  prosesQuery,
  execute,
  ValidateDate,
  executeWithReturn,
  getDataAnotherRestServer,
  getReservation,
  insertLokalReservation
};

//Digunakan untuk ambil data Kamar
function getDateNow(req, db) {
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;

      var query;

      //Cek jenis kamar
      query = "SELECT CONVERT(VARCHAR(10), getdate(), 103) + ' ' + CONVERT(VARCHAR(8), getdate(), 14) AS Jam_Now";
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve("");
        } else {
          if (dataReturn.recordset.length > 0) {
            resolve(dataReturn.recordset[0].Jam_Now);
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

//Digunakan untuk execute query tanpa return data
function execute(query, req, db) {
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;

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
      logger.error('Catch Error prosesQuery ' + isiQuery);
      resolve(false);
    }
  });
}

//Digunakan untuk execute query dengan return data
function executeWithReturn(query, req, db) {
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve("");
        } else {
          resolve(dataReturn.recordset);
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

//Digunakan untuk ambil data Kamar
function getShift(req, db) {
  var jam_sekarang;
  var final_shift;
  var shift1 = 6;
  var shift2 = 18;
  var shift3 = 24;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;

      var query;

      //Cek jenis kamar
      query = "SELECT substring(convert(varchar(24),getdate(),114),1,2) as jamsekarang";
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve("");
        } else {
          if (dataReturn.recordset.length > 0) {

            jam_sekarang = parseInt(dataReturn.recordset[0].jamsekarang);
            if ((jam_sekarang >= shift1) & (jam_sekarang < shift2)) {
              final_shift = 1;
            }
            else if ((jam_sekarang >= shift2) & (jam_sekarang < shift3)) {
              final_shift = 2;
            }
            else if ((jam_sekarang >= 0) & (jam_sekarang < shift1)) {
              final_shift = 3;
            }

            resolve(final_shift);
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

function getDateTrans(shift, req) {
  return new Promise((resolve, reject) => {
    try {
      sql = req.db;
      configDb = req.db_conf;
      logger = req.log;

      var date_trans_Query;
      if (shift == 1) {
        date_trans_Query = "Select getdate() as date_trans";
      } else if (shift == 2) {
        date_trans_Query = "Select getdate() as date_trans";
      } else if (shift == 3) {
        date_trans_Query = "select DATEADD(dd, -1, GETDATE()) as date_trans";
      }
      sql.close();
      sql.connect(configDb, function (err) {
        if (err) {
          logger.error(err.message);
        } else {
          var request = new sql.Request();
          request.query(date_trans_Query, function (err, dataReturn) {
            if (err) {
              logger.error(err.message);
            } else {
              var tanggal_sekarang = dataReturn.recordset[0].date_trans;
              resolve(tanggal_sekarang);
            }
          });
        }
      });
    } catch (error) {
      sql.close();
      console.log(error);
      logger.error(error);
      resolve(false);
    }
  });
}

function prosesQuery(Query, req) {
  return new Promise((resolve, reject) => {
    try {
      sql = req.db;
      configDb = req.db_conf;
      logger = req.log;

      sql.close();
      sql.connect(configDb, function (err) {
        if (err) {
          logger.error(err.message);
        } else {
          var request = new sql.Request();
          request.query(Query, function (err, dataReturn) {
            if (err) {
              sql.close();
              logger.error(err.message + ' Error prosesQuery ' + Query);
              resolve(false);
            } else {
              sql.close();
              resolve(true);
            }
          });
        }
      });
    } catch (err) {
      sql.close();
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + Query);
      resolve(false);
    }
  });
}

//fungsi untuk cek format tanggal dd/mm/yyyy
function ValidateDate(dateStr) {
  const regExp = /^(\d\d?)\/(\d\d?)\/(\d{4})$/;
  let matches = dateStr.match(regExp);
  let isValid = matches;
  let maxDate = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (matches) {
    const month = parseInt(matches[2]);
    const date = parseInt(matches[1]);
    const year = parseInt(matches[3]);

    isValid = month <= 12 && month > 0;
    isValid &= date <= maxDate[month] && date > 0;

    const leapYear = (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
    isValid &= month != 2 || leapYear || date <= 28;
  }

  return isValid;
}

//Fungsi untuk mengambil respon dari server lain
//dalam hal ini contohnya mengambil data reservasi dari nodejs membership
function getDataAnotherRestServer(Url) {
  return new Promise(function (resolve, reject) {
    request(Url, function (error, response, body) {
      if (error) reject("");
      else {
        resolve(JSON.parse(body));
      }
    });
  });
}

function getReservation(db_, reservation_) {
  return new Promise((resolve, reject) => {
    try {
      db = db_;
      var reservation = reservation_;
      var isiQuery = " " +
        "select " +
        " Reservation " +
        " from IHP_Rsv " +
        " where Reservation='" + reservation + "' ";
      db.request().query(isiQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + isiQuery);
          resolve(false);
        } else {
          if (dataReturn.recordset.length > 0) {
            //var status = dataReturn.recordset[0].Status;
            resolve(dataReturn.recordset[0]);
          }
          else {
            resolve(false);
          }
        }
      });

    } catch (err) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ');
      resolve(false);
    }
  });
}

function insertLokalReservation(db_, reservation_) {
  return new Promise((resolve, reject) => {
    try {
      db = db_;
      var reservation = reservation_;
      var kamar = reservation.Kamar;
      if (kamar == null) {
        kamar = "";
      }
      var isiQuery = " " +
        "INSERT INTO [dbo].[IHP_Rsv] " +
        " ([Reservation] " +
        " ,[DATE] " +
        " ,[Shift] " +
        " ,[Member] " +
        " ,[Nama]" +
        " ,[Telepon]" +
        " ,[Tgl_Reservasi]" +
        " ,[Jam_Sewa]" +
        " ,[Menit_Sewa]" +
        " ,[Tgl_Checkout]" +
        " ,[Jenis_Kamar]" +
        " ,[Kamar]" +
        " ,[Uang_Muka]" +
        " ,[Status]" +
        " ,[CHTime]" +
        " ,[CHusr]" +
        " ,[Posted]" +
        " ,[Keterangan_ReKonfirmasi]" +
        " ,[Jam_Rekonfirmasi]" +
        " ,[Export]" +
        " ,[Id_Payment]" +
        " ,[Date_Trans]" +
        " ,[Flag] " +
        " ,[Flag_Notif]" +
        " ,[Flag_Update_Tipe_Kamar])" +
        " VALUES" +
        " (" +
        "   '" + reservation.Reservation + "'," +
        "   '" + reservation.Date + "'," +
        "   '" + reservation.Shift + "'," +
        "   '" + reservation.Member + "'," +
        "   '" + reservation.Nama.toUpperCase() + "'," +
        "   '" + reservation.Telepon + "'," +
        "   '" + reservation.Tgl_Reservasi + "'," +
        "   " + reservation.Jam_Sewa + "," +
        "   " + reservation.Menit_Sewa + "," +
        "   '" + reservation.Tgl_Checkout + "'," +
        "   '" + reservation.Jenis_Kamar + "'," +
        "   '" + kamar + "'," +
        "   " + reservation.Uang_Muka + "," +
        "   '" + reservation.Status + "'," +
        "   '" + reservation.CHTime + "'," +
        "   '" + reservation.CHusr + "'," +
        "   '" + reservation.Posted + "'," +
        "   '" + reservation.Keterangan_ReKonfirmasi + "'," +
        "   '" + reservation.Jam_Rekonfirmasi + "'," +
        "   '" + reservation.Export + "'," +
        "   " + reservation.Id_Payment + "," +
        "   '" + reservation.Date_Trans + "'," +
        //"   '" + rsv0[(a - banyaknyaRsv)].Flag + "'" +
        "   '1'," +
        "   '1'," +
        "  '1'" +
        " )";
      db.request().query(isiQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + isiQuery);
          resolve(false);
        } else {
          resolve(true);
        }
      });

    } catch (err) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ');
      resolve(false);
    }
  });
}


