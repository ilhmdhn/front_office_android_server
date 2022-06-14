var sql = require("mssql");
var logger = require ('../util/logger');
var db;
var query;
var chusr;

class ItemSales {
    constructor() { }

    todaySale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                datename(dw,convert(char, sol.Date_Trans, 111)) as display_waktu,
                isNull(SUM(okd.Total),0) as total
                from
                ihp_sol sol,
                ihp_okl okl,
                ihp_okd okd
                where
                convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
				AND
				convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(day, -1, GETDATE()), 111)
                and
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
                and sol.CHusr = '${chusr}'
                group by convert(char, sol.Date_Trans, 111)`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    todayCancelSale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                datename(dw,convert(char, sol.Date_Trans, 111)) as display_waktu,
                isnull(SUM(ocd.Total), 0) as total
            from
                ihp_sol sol,
                ihp_ocl ocl,
                ihp_ocd ocd
            where
            convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
            AND
            convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(day, -1, GETDATE()), 111)
                and sol.SlipOrder = ocd.SlipOrder and
                sol.CHusr = '${chusr}' and
                ocl.ordercancelation = ocd.ordercancelation
                group by convert(char, sol.Date_Trans, 111)`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    weekSale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                datename(dw,convert(char, sol.Date_Trans, 111)) as display_waktu,
                isNull(SUM(okd.Total),0) as total
                from
                ihp_sol sol,
                ihp_okl okl,
                ihp_okd okd
                where
                convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
				AND
				convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(day, -7, GETDATE()), 111)
                and
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
                and sol.CHusr = '${chusr}'
                group by convert(char, sol.Date_Trans, 111)`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                            logger.info( JSON.stringify(dataReturn.recordset));
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    weekCancelSale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                datename(dw,convert(char, sol.Date_Trans, 111)) as display_waktu,
                isnull(SUM(ocd.Total), 0) as total
            from
                ihp_sol sol,
                ihp_ocl ocl,
                ihp_ocd ocd
            where
            convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
            AND
            convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(day, -7, GETDATE()), 111)
                and sol.SlipOrder = ocd.SlipOrder and
                sol.CHusr = '${chusr}' and
                ocl.ordercancelation = ocd.ordercancelation
                group by convert(char, sol.Date_Trans, 111)`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                            logger.info( JSON.stringify(dataReturn.recordset));
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    monthSale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                convert(varchar(7), sol.Date_Trans, 111) as display_waktu,
                isNull(SUM(okd.Total),0) as total
                from
                ihp_sol sol,
                ihp_okl okl,
                ihp_okd okd
                where
                convert(varchar, sol.Date_Trans, 111) <= convert(varchar, GETDATE(), 111)
				AND
				convert(varchar, sol.Date_Trans, 111) > convert(varchar, DATEADD(year, -1, GETDATE()), 111)
                and
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
                and sol.CHusr = '${chusr}'
                group by convert(varchar(7), sol.Date_Trans, 111)
                order by convert(varchar(7), sol.Date_Trans, 111) desc`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    monthCancelSale(db_, chusr_){
        return new Promise((resolve)  => {
            try{
                db = db_;
                chusr = chusr_;

                query = `SELECT
                convert(varchar(7), sol.Date_Trans, 111) as display_waktu,
                isnull(SUM(ocd.Total), 0) as total
            from
                ihp_sol sol,
                ihp_ocl ocl,
                ihp_ocd ocd
            where
            convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
            AND
            convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(year, -1, GETDATE()), 111)
                and sol.SlipOrder = ocd.SlipOrder and
                sol.CHusr = '${chusr}' and
                ocl.ordercancelation = ocd.ordercancelation
                group by convert(varchar(7), sol.Date_Trans, 111)
                order by convert(varchar(7), sol.Date_Trans, 111) desc`
                
                db.request().query(query, function(err, dataReturn){
                    if(err){
                        sql.close()
                        logger.error(err.message + 'Error Process Query' + query);
                        resolve(false)
                    } else{
                        if(dataReturn.recordset.length > 0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                        }
                    }
                })
            }catch(error){
                logger.error(error.message);
                logger.error("query "+ query);
                resolve(false);
            }
        })
    }

    getSales(db_, time_, chusr_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var time = time_;
                var chusr = chusr_;

                query =  `
                set dateformat dmy
                select distinct
                okd.inventory as inventory,
                okd.nama as nama_item,
                SUM(okd.Qty) as Qty,
                isNull(SUM(okd.Total),0) as Total
                from 
                ihp_sol sol, 
                ihp_okl okl, 
                ihp_okd okd
                where
                ${time}
                and 
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
                and sol.CHusr = '${chusr}'
                GROUP BY okd.inventory, okd.nama
                order by okd.nama asc
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

    getCancelSale(db_, time_, chusr_){
        return new Promise((resolve) => {
            try{
                var db = db_;
                var time = time_;
                var chusr = chusr_;

                query = `
                set dateformat dmy
                    select distinct
                    ocd.Inventory as inventory,
                    ocd.nama as nama_item,
                    SUM(ocd.Qty) as Qty,
                    isnull(SUM(ocd.Total), 0) as Total
                from
                    ihp_sol sol,
                    ihp_ocl ocl,
                    ihp_ocd ocd
                where 
                    ${time}
                    and sol.SlipOrder = ocd.SlipOrder and
                    sol.CHusr = '${chusr}' and
                    ocl.ordercancelation = ocd.ordercancelation
                    group by ocd.Inventory, ocd.nama
                    order by ocd.Nama asc
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