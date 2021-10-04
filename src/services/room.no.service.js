var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;

class RoomNoService {
  constructor() { }

  insertIHPIPAddressRoomNo(db_, room_,ip_address_,server_socket_port_,server_udp_port_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var ip_address = ip_address_;
        var server_socket_port = server_socket_port_;
        var server_udp_port = server_udp_port_;
        var isiQuery = "" +
          "set dateformat dmy " +
          "INSERT INTO [dbo].[IHP_IPAddress_Room_No]" +
          "(" +
          "[Kamar]" +
          ",[IP_Address]" +
          ",[Server_Socket_Port]" +
          ",[Server_Udp_Port]" +          
          ")" +
          "VALUES" +
          "(" +
          " '" + room + "'" +
          ",'" + ip_address + "'" +
          "," + server_socket_port + "" +
          "," + server_udp_port + "" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error insertIHPIPAddressRoomNo ' + isiQuery);
            console.log( " gagal insertIHPIPAddressRoomNo");
            logger.info( " gagal insertIHPIPAddressRoomNo");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses insertIHPIPAddressRoomNo");
            logger.info(" Sukses insertIHPIPAddressRoomNo");
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

  updateIHPIPAddressRoomNo(db_, room_,ip_address_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var ip_address = ip_address_;
        var isiQuery = "" +
          "set dateformat dmy " +
          " update [dbo].[IHP_IPAddress_Room_No] "+
          " set [IP_Address]='"+ip_address+"'"+
          " where Kamar='"+room+"'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" gagal updateIHPIPAddressRoomNo");
            logger.info(" gagal updateIHPIPAddressRoomNo");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses updateIHPIPAddressRoomNo");
            logger.info(" Sukses updateIHPIPAddressRoomNo");
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

  getRoomIHPIPAddressRoomNo(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room=room_;
        var isiQuery = " Select TOP 1 * from IHP_IPAddress_Room_No where Kamar='"+room+"'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error getRoomIHPIPAddressRoomNo ' + isiQuery);
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
module.exports = RoomNoService;