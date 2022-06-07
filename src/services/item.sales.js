var sql = require("mssql");
var logger = require ('../util/logger');
var db;
var query;

class ItemSales {
    constructor() { }

    getSales(db_, time_, chusr_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var time = time_;
                var chusr = chusr_;

                query =  `
                set dateformat dmy
                select distinct
                CONVERT (char, sol.Date_Trans, 120) as DATE,
                sol.SlipOrder as slip_order,
                okd.inventory as inventory,
                okd.nama as nama_item, 
                okd.Qty as Qty, 
                okd.Total as Total
                from 
                hp112.dbo.ihp_sol sol, 
                hp112.dbo.ihp_okl okl, 
                hp112.dbo.ihp_okd okd
                where
                ${time}
                and 
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
--                and sol.CHusr = '${chusr}'
                `
            db.request().query(query, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err.message +  `Error Prosses Query ${query}`);
                } else{
                    if(dataReturn.recordset.length > 0){
                        resolve(dataReturn.recordset);
                    } else{
                        resolve(false);
                    }
                }
            })
            } catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    getCancelSale(db_, time_){
        return new Promise((resolve) => {
            try{
                var db = db_;
                var time = time_;

                query = `
                set dateformat dmy
                    select distinct
                    sol.SlipOrder as slip_order,
                    ocd.Inventory as inventory,
                    ocd.nama as nama_item,
                    ocd.Qty as Qty,
                    ocd.Total as Total
                from
                    hp112.dbo.ihp_sol sol,
                    hp112.dbo.ihp_ocl ocl,
                    hp112.dbo.ihp_ocd ocd
                where 
                    ${time}
                    and sol.SlipOrder = ocd.SlipOrder and 
                    ocl.ordercancelation = ocd.ordercancelation
            `
            db.request().query(query, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err.message +  `Error Prosses Query ${query}`);
                } else{
                    if(dataReturn.recordset.length > 0){
                        resolve(dataReturn.recordset);
                    } else{
                        resolve(false);
                    }
                }
            })
            }catch (error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }
}

module.exports = ItemSales;