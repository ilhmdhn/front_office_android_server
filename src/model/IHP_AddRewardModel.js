var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;

//variable table
var tableAddReward = require('./../model/variabledb/IHP_AddReward');

module.exports = {
  InsertAddReward,
  GetCode2
};


//Digunakan untuk ambil semua data Ocd
function InsertAddReward(AddRewardBean, req, db){
  var query;

  return new Promise((resolve, reject) => {
    try {
      logger = req.log;
      
      query = "Set Dateformat DMY " +
              "Insert into " + tableAddReward.table + " (" +
                tableAddReward.AddReward + ", " +
                tableAddReward.Date + ", " +
                tableAddReward.Shift + ", " +
                tableAddReward.Reception + ", " +
                tableAddReward.Summary + ", " +
                tableAddReward.Member + ", " +
                tableAddReward.Nama + ", " +
                tableAddReward.Jenis_Member + ", " +
                tableAddReward.Kamar + ", " +
                tableAddReward.Total_All + ", " +
                tableAddReward.Total_Point + ", " +
                tableAddReward.Masa_Aktif + ", " +
                tableAddReward.Status + ", " +
                tableAddReward.CHTime + ", " +
                tableAddReward.CHUsr + ", " +
                tableAddReward.Date_Trans +
              ") Values (" +
                "'" + AddRewardBean.AddReward + "', " +
                "'" + AddRewardBean.DATE + "', " +
                "'" + AddRewardBean.Shift + "', " +
                "'" + AddRewardBean.Reception + "', " +
                "'" + AddRewardBean.Summary + "', " +
                "'" + AddRewardBean.Member + "', " +
                "'" + AddRewardBean.Nama + "', " +
                "'" + AddRewardBean.Jenis_Member + "', " +
                "'" + AddRewardBean.Kamar + "', " +
                AddRewardBean.Total_All + ", " +
                AddRewardBean.Total_Point + ", " +
                AddRewardBean.Masa_Aktif + ", " +
                "'" + AddRewardBean.Status + "', " +
                "CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) , " +
                "'" + AddRewardBean.CHUsr + "', " +
                AddRewardBean.Date_Trans +
              ")";

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
      logger.error('Catch Error prosesQuery ' + query);
      resolve(false);
    }
  });
}

function GetCode2(req, db){
  var today = new Date(); //mendapatkan tanggal sekarang
  var query;
  var No_BuktiTmp;
  var No_Bukti;
  var numberTmp;
  var number;

  var Day   = today.getDate().toString().padStart(2, "0");
  var Month = (today.getMonth() + 1).toString().padStart(2, "0");
  var Year  = today.getFullYear().toString().substr(-2);
  var tmpCode = "ADR-" + Year + "" + Month + "" + Day;

  query = "SELECT " + tableAddReward.AddReward + " " +
          "FROM " + tableAddReward.table + " " +
          "WHERE " + tableAddReward.AddReward + " LIKE '" + tmpCode + "%' " +
          "ORDER BY " + tableAddReward.AddReward + " DESC";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_BuktiTmp = dataReturn.recordset[0].AddReward;
            numberTmp = Number(No_BuktiTmp.slice(-4));
            numberTmp = numberTmp + 1;

            if(numberTmp<10) number = "000" + numberTmp;
            else if(numberTmp<100) number = "00" + numberTmp;
            else if(numberTmp<1000) number = "0" + numberTmp;
            else number = numberTmp;

            No_Bukti = tmpCode + "" + number;
          } else {
            No_Bukti = tmpCode + "0001";
          }
        }

        resolve(No_Bukti);
      });
    } catch (error) {
      logger.error(error);
      resolve("");
    }
  });
}