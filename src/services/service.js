var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;

class Service {
  constructor() { }

  getNilaiServiceRoom(db_, sewa_kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var sewa_kamar = sewa_kamar_;
        isiQuery = "" +
          " Select isnull((" + sewa_kamar + "/100)*Service_Persen_Room,0) as nilai_service_room From IHP_Config2 where Data=1 ";

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
              var nilai = dataReturn.recordset[0].nilai_service_room;
              console.log("service kamar= " + nilai);
              logger.info("service kamar= " + nilai);
              resolve(nilai);

            }
            else {
              console.log("service= Room 0 ");
              logger.info("service= Room 0 ");
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
module.exports = Service;