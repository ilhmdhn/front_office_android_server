var sql = require("mssql");
var logger = require ('../util/logger');
var db;
var isiQuery;
var dateFormat = require('dateformat');

class ReduceDuration{
    constructor(){ }

    reduceRcp(db_, rcp_){
        return new Promise((resolve)=>{
            try{
                db =  db_;
                var rcp = rcp_;

                var query = `
                UPDATE IHP_Rcp
                Set
                    Jam_Sewa = Jam_Sewa -1, 
                    Checkout = DATEADD(HH, - 1, Checkout)
                WHERE Reception  = '${rcp}'`

                console.log('cek query' + query);

                db.request().query(query, function  (error, dataReturn){
                    if(error){
                        sql.close();
                        logger.error(error.message + ' Error prosesQuery ' + isiQuery);
                        resolve(false);
                    } else{
                        logger.info('hasil reduce' + JSON.stringify(dataReturn))
                        sql.close();
                        if(dataReturn.rowsAffected>0){
                            console.log('berhasil loh');
                            resolve(true);
                        } else{
                            resolve('move');
                        }
                    }
                });
            }catch(error){
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ' +  query);
                resolve(false);
            }
        })

    }

    reduceExtend(db_, rcp_){
        return new Promise((resolve) =>{

            try{
                db =  db_;
                var rcp = rcp_;

                var query = `
                UPDATE IHP_Ext
                SET 
	                Jam_Extend = Jam_Extend -1,
	                End_Extend = DATEADD(HH, -1, End_Extend)
                WHERE Reception = '${rcp}' 
                AND Jam_Extend >0
                AND End_Extend = (SELECT TOP(1) End_Extend  FROM IHP_Ext WHERE Reception = '${rcp}' AND Jam_Extend >0 ORDER BY End_Extend desc)
                `
            
            db.request().query(query, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else{
                    logger.info('hasil reduce' + JSON.stringify(dataReturn))
                    sql.close();
                    if(dataReturn.rowsAffected>0){
                        console.log('berhasil loh');
                        resolve(true);
                    } else{
                        resolve('move');
                    }
                }
            });
            } catch(error){
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ' +  query);
                resolve(false);
            }
        });
    }

    reduceRoomDuration(db_, rcp_){
        return new Promise((resolve) =>{

            try{
                db =  db_;
                var rcp = rcp_;

                var query = `
                UPDATE IHP_Room
                SET 
                    Jam_Checkout = DATEADD(HH, -1, Jam_Checkout)
                WHERE Reception = '${rcp}'
                `
            
            db.request().query(query, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else{
                    sql.close();
                    if(dataReturn.rowsAffected>0){
                        console.log('berhasil loh');
                        resolve(true);
                    } else{
                        resolve(false);
                    }
                }
            });
            } catch(error){
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ' +  query);
                resolve(false);
            }
        }); 
    }
}
module.exports = ReduceDuration;