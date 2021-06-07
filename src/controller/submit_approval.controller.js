var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db;

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
                    logger.error(err.message);
                }else{
                    if(response.rowsAffected = 1){
                        res.send(new ResponseFormat(true, null, "Berhasil"))
                    } else{
                        res.send(new ResponseFormat(false, null, "Gagal disimpan ke database"))
                    }
                }
            })
        }
    }catch(error){
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}