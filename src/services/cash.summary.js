var sql = require("mssql");
var logger = require ('../util/logger');
var dateFormat = require('dateformat');
var db;

class CashSummary{
    constructor() {

    }

    sumCash(db_, date, shift){
        return new Promise((resolve)  => {
            try{
                db = db_;

                var query = `SELECT
                isnull([Seratus_Ribu] * 100000, 0) as seratus_ribu
                ,isnull([Lima_Puluh_Ribu] * 50000, 0) as limapupuh_ribu
                ,isnull([Dua_Puluh_Ribu] * 20000, 0) as duapuluh_ribu
                ,isnull([Sepuluh_Ribu] * 10000, 0) as sepuluh_ribu
                ,isnull([Lima_Ribu] * 5000, 0) as lima_ribu
                ,isnull([Dua_Ribu] * 2000 , 0) as dua_ribu
                ,isnull([Seribu] * 1000, 0) as seribu
                ,isnull([Lima_Ratus] * 500 , 0) as lima_ratus
                ,isnull([Dua_Ratus] * 200, 0) as  dua_ratus
                ,isnull([Seratus] * 100, 0) as seratus
                ,isnull([Lima_Puluh] * 50, 0) as lima_puluh
                ,isnull([Dua_Puluh_Lima] * 25, 0) as dualima
            FROM [IHP_CASH_Summary_Detail]
            WHERE [DATE] = '${dateFormat(date, "dd/mm/yyyy HH:MM:ss")}'
            and [SHIFT] = ${shift}
            `
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(0)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(
                                dataReturn.recordset[0].seratus_ribu+
                                dataReturn.recordset[0].limapupuh_ribu+
                                dataReturn.recordset[0].duapuluh_ribu+
                                dataReturn.recordset[0].sepuluh_ribu+
                                dataReturn.recordset[0].lima_ribu+
                                dataReturn.recordset[0].dua_ribu+
                                dataReturn.recordset[0].seribu+
                                dataReturn.recordset[0].lima_ratus+
                                dataReturn.recordset[0].dua_ratus+
                                dataReturn.recordset[0].seratus+
                                dataReturn.recordset[0].lima_puluh+
                                dataReturn.recordset[0].dualima
                                );
                        } else{
                            resolve(0);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(0);
            }
        })
    }

}

module.exports = CashSummary;