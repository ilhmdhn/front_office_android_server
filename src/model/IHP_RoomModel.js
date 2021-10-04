var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db ;

//variable table
var tableRoom = require('./../model/variabledb/IHP_Room');

module.exports = {
  getInfo
};

//Digunakan untuk ambil data Kamar
function getInfo(roomCode, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;

      //Cek jenis kamar
      query = "SELECT " +
                tableRoom.Jenis_Kamar + ", " +
                tableRoom.Jam_Checkin + ", " +
                tableRoom.Jam_Checkout + ", " +
                "ABS(ROUND(DATEDIFF(minute, getdate(), " + tableRoom.Jam_Masuk + "), 0)) AS " + tableRoom.NDurasi + ", " +
                "ISNULL(" + tableRoom.Reception + ", '') as " + tableRoom.NReception + " " +
              "FROM " + tableRoom.table + " " +
              "WHERE " + tableRoom.Kamar + " = '" + roomCode + "'";
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
      //res.send(formDataGetToClient);  
    } catch (error) {
      console.log(err);
      logger.error(err.message);
      logger.error('Catch Error prosesQuery ' + isiQuery);
      resolve("");
    }
  });
}