var sql = require("mssql");
var logger = require ('../util/logger');
var db;

class CatatReduce{
    constructor() { }

    catatReduce(db_, rcp_, durasi_, chusr_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var rcp = rcp_;
                var durasi  = durasi_;
                var chusr = chusr_;

                var query = `
                INSERT INTO [IHP_History_Reduce_Duration]
                ([Reception], [Durasi_Minus], [Kamar], [Chusr] ,[Date_Trans]) VALUES
                ('${rcp}', ${durasi}, (SELECT [Kamar] FROM IHP_Rcp WHERE Reception = '${rcp}'), '${chusr}', getdate())
                `
                db.request().query(query, function(err, response){
                    if(err){
                        sql.close();
                        logger.error(err.message);
                        resolve(false);
                    }else{
                        sql.close();
                        if(response.rowsAffected >0){
                            logger.info('Berhasil catat reduce ke database');
                            resolve(true);
                        } else{
                            logger.error('Gagal catat reduce ke database');
                            resolve(false);
                        }
                    }
                })
            } catch(error){
                console.log(error);
                logger.error(error + error.message);
                resolve(false);
            }
        });
    }
}

module.exports = CatatReduce;