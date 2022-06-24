var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db;
var sql = require("mssql");

exports.submitApproval = async function(req, res){
    db = await new DBConnection().getPoolConnection();
    try{
        var user_id = req.body.user_id;
        var level_user = req.body.level_user;
        var room = req.body.room;
        var keterangan = req.body.keterangan;
        var nama_device = req.body.device_name;

        if(user_id == undefined || level_user == undefined || room == undefined || keterangan == undefined){
            res.send(new ResponseFormat(false, null, 'Data tidak lengkap'))
        } else{
            var query = `INSERT INTO IHP_Login_History (User_ID, LoginTime, Level_User, Kamar,  Nama_Computer, Keterangan) VALUES ('${user_id}', getdate(), '${level_user}', '${room}', '${nama_device}', '${keterangan}')`
        
            db.request().query(query, function(err, response){
                if(err){
                    sql.close();
                    logger.error(err.message);
                }else{
                    sql.close();
                    if(response.rowsAffected == 1){
                        res.send(new ResponseFormat(true, null, "Berhasil"))
                    } else{
                        res.send(new ResponseFormat(false, null, "Gagal disimpan ke database"))
                    }
                }
            })
        }
    }catch(error){
        sql.close();
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.getJumlahApproval = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    try {
        var chusr = req.query.chusr;
        var query = `SELECT isnull(COUNT(User_ID), 0) as jumlah_approval FROM [IHP_Login_History] WHERE USER_ID = '${chusr}' AND CONVERT(varchar, LoginTIme,111) = CONVERT(VARCHAR,GETDATE(), 111)`;

        db.request().query(query, function (err, dataReturn) {
            if (err) {
                sql.close();
                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {
                sql.close();
                var jumlahApproval = dataReturn.recordset[0].jumlah_approval;
                logger.info("JUMLAH APPROVAL "+ jumlahApproval)
                if(jumlahApproval < 3){
                    res.send(new ResponseFormat(true, null, "Boleh Melakukan Approval"));
                } else{
                    res.send(new ResponseFormat(false, null, "Tidak Boleh Melakukan Approval"));
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