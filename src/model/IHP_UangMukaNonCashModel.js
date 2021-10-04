var tableUMNonCash = require('./../model/variabledb/IHP_UangMukaNonCash');
var tableRcp = require('./../model/variabledb/IHP_Rcp');

module.exports = {
  getInfo
};

//Digunakan untuk ambil data Okd untuk cancel
function getInfo(Reception, req, db){
  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      var query;
  
      //Cek jenis kamar
      query = "SELECT " +
                tableRcp.Id_Payment + ", " +
                tableRcp.Uang_Muka + ", " +
                "ISNULL(" + tableUMNonCash.Reception + ", '') AS Reception, " +
                "ISNULL(" + tableUMNonCash.Nama_Payment + ", '') AS Nama_Payment, " +
                "ISNULL(" + tableUMNonCash.Member + ", '') AS Member, " +
                "ISNULL(" + tableUMNonCash.Nama + ", '') AS Nama, " +
                "ISNULL(" + tableUMNonCash.Input1 + ", '') AS Input1, " +
                "ISNULL(" + tableUMNonCash.Input2 + ", '') AS Input2, " +
                "ISNULL(" + tableUMNonCash.Input3 + ", '') AS Input3, " +
                "ISNULL(" + tableUMNonCash.Input4 + ", '') AS Input4, " +
                "ISNULL(" + tableUMNonCash.Pay_Value + ", '') AS Pay_Value, " +
                "ISNULL(" + tableUMNonCash.EDC_Machine + ", '') AS EDC_Machine " +
              "FROM " + tableRcp.table + " " +
                "LEFT JOIN " + tableUMNonCash.table + " ON " + tableUMNonCash.Reception + " = " + tableRcp.Reception + " " +
              "WHERE " + tableRcp.Reception + " = '" + Reception + "'";

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
      logger.error('Catch Error prosesQuery ');
      resolve("");
    }
  });
}