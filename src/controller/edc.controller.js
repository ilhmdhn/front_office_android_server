var ResponseFormat = require('../util/response');
var sql = require("mssql");
var DBConnection = require('../util/db.pool');
var logger, db, io;


exports.getEdcMesin = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    io = req.io;
    logger = req.log;
    try {
        var roomQuery = " " +
            " select [No] as nomor_edc" +
            " ,[NamaMesin] as nama_mesin" +
            " ,[Status] as status_aktif" +
            " FROM [IHP_EDC] where Status=1";
        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {
                sql.close();
                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {
                sql.close();
                if (dataReturn.recordset.length > 0) {
                    dataResponse = new ResponseFormat(true, dataReturn.recordset);
                    res.send(dataResponse);
                } else {
                    res.send(new ResponseFormat(false, null, "Data Not Found"));
                    res.send(dataResponse);
                    
                }
            }
        });
    } catch (err) {
        sql.close();
        logger.error(err.message);
        dataResponse = new ResponseFormat(false, null, err.message);
        res.send(dataResponse);
    }
};
