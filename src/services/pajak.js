var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;

class Pajak {
  constructor() { }

  getNilaiPajakRoom( db_, sewa_kamar_plus_service_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var sewa_kamar_plus_service = sewa_kamar_plus_service_;
        isiQuery = "" +
          " Select isnull((" + sewa_kamar_plus_service + "/100)*Tax_Persen_Room,0) as nilai_pajak_room From IHP_Config2 where Data=1 ";

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
              var nilai = dataReturn.recordset[0].nilai_pajak_room;
              console.log("pajak room= " + nilai);
              logger.info("pajak room= " + nilai);
              resolve(nilai);
            }
            else {
              console.log("pajak Room= 0 ");
              logger.info("pajak Room= 0 ");
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
module.exports = Pajak;