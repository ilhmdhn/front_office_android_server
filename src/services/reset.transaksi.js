var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;

class ResetTransaksi {
  constructor() { }

  deleteIhpIvc(db_, room_, kode_rcp_, kode_ivc_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kode_rcp_;
        var kode_ivc = kode_ivc_;
        var isiQuery = " " +
          " Delete From IHP_Ivc " +
          " where Kamar = '" + room + "' " +
          " and Reception='" + kode_rcp + "'" +
          " and Invoice='" + kode_ivc + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_ivc + " ResetTransaksi Gagal deleteIhpIvc");
            logger.info(kode_ivc + " ResetTransaksi Gagal deleteIhpIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_ivc + " ResetTransaksi Sukses deleteIhpIvc");
            logger.info(kode_ivc + " ResetTransaksi Sukses deleteIhpIvc");
            resolve(true);
          }
        });
      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  deleteIhpRcp(db_, room_, kode_rcp_, kode_ivc_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kode_rcp_;
        var kode_ivc = kode_ivc_;
        var isiQuery = " " +
          " Delete From IHP_Rcp " +
          " where Kamar = '" + room + "' " +
          " and Reception='" + kode_rcp + "'" +
          " and Invoice='" + kode_ivc + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " ResetTransaksi Gagal deleteIhpRcp");
            logger.info(kode_rcp + " ResetTransaksi Gagal deleteIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " ResetTransaksi Sukses deleteIhpRcp");
            logger.info(kode_rcp + " ResetTransaksi Sukses  deleteIhpRcp");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  deleteIhpRoomCheckin(db_, room_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          " Delete From IHP_RoomCheckin " +
          " where Kamar = '" + room + "' " +
          " and Reception='" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " ResetTransaksi Gagal deleteIhpRoomCheckin");
            logger.info(kode_rcp + " ResetTransaksi Gagal deleteIhpRoomCheckin");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " ResetTransaksi Sukses deleteIhpRoomCheckin");
            logger.info(kode_rcp + " ResetTransaksi Sukses deleteIhpRoomCheckin");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRoomCheckout(db_, room_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          " set dateformat dmy " +
          " update IHP_Room set " +
          " Keterangan_Connect = 2, " +
          " Status_Ready = 1, " +
          " Status_Order = 0, " +
          " Reception = NULL, " +
          " Nama_Tamu = NULL, " +
          " Keterangan_Tamu = ''," +
          " Jumlah_Tamu = NULL, " +
          " Jam_Checkin = '01/01/1900 00:00:00', " +
          " Jam_Masuk = '01/01/1900 00:00:00', " +
          " Jam_Checkout = '01/01/1900 00:00:00', " +
          " Status_Checkin = 0, " +
          " Status_10 = 0 " +
          " where Kamar = '" + room + "' " +
          " and Reception='" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " ResetTransaksi Gagal updateIhpRoomCheckout");
            logger.info(kode_rcp_ + " ResetTransaksi Gagal updateIhpRoomCheckout");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " ResetTransaksi Sukses updateIhpRoomCheckout");
            logger.info(kode_rcp_ + " ResetTransaksi Sukses updateIhpRoomCheckout");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

}
module.exports = ResetTransaksi;