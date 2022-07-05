var sql = require('mssql');
const { resolveContent } = require('nodemailer/lib/shared');
var db;
var logger = require ('../util/logger');
var isiQuery;

class PrintService{
    constructor() { }

    getOutletInfo(db_){
        return new Promise((resolve) => {

        try{
            db = db_;

            isiQuery = `
                SELECT 
                [Nama_Outlet] as nama_outlet
               ,[Alamat_Outlet] as alamat_outlet
               ,[Tlp1] as telepon
               ,[Kota] as kota
                FROM [IHP_Config]
                `
            db.request().query(isiQuery, function (error, dataReturn){
                if(error){
                    sql.close();
                    console.log(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                    logger.error(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                    resolve(false)
                } else{
                    sql.close();
                    if(dataReturn.recordset.length>0){
                        resolve(dataReturn.recordset[0]);
                    } else{
                        resolve(false);
                        console.log('data  outlet belum ada di config');
                        logger.warn('data  outlet belum ada di config');
                    }
                }
            })
            } catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                resolve(false)
            }
        })
    }
}
module.exports = PrintService;