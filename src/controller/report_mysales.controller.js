var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var SalesService = require('../services/item.sales');
var logger;
var db ;

const { resolve } = require('dns');
const { data } = require('jquery');

exports.getMySalesWeekly = async function(req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;

    try{
        var query = `
        SELECT 
            datename(dw,convert(char, Date_Trans, 111)) as display_waktu,
            SUM([Charge_Penjualan]) as charge_penjualan,
            SUM([Discount_Penjualan]) as discount_penjualan,
            SUM([Service_Penjualan]) as service_penjualan,
            SUM([Tax_Penjualan]) as tax_penjualan,
            SUM([Total_Penjualan]) as total_penjualan
        FROM IHP_Ivc
        WHERE
            convert(char, Date_Trans, 111) >= convert(char, GETDATE(), 111)
            AND
            convert(char, Date_Trans, 111) < convert(char, DATEADD(day, 7, GETDATE()), 111)
        group by convert(char, Date_Trans, 111)
        order by convert(char, Date_Trans, 111) asc
        `
        db.request().query(query, function(err, dataReturn){
            if(err){
                sql.close();
                logger.error(err);
                logger.error(err.message +  `Error Prosses Query ${query}`);
                res.send(new ResponseFormat(false, null, err.message));
            }else{
                sql.close();
                if(dataReturn.recordset.length > 0){
                    logger.info('Report weekly '+JSON.stringify(dataReturn.recordset))
                    res.send(new ResponseFormat(true, dataReturn.recordset))
                } else{
                    logger.info("weekly sales 0");
                    res.send(new ResponseFormat(false, null, "Data Kosong"));
                }
            }
        })
    } catch{
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.getMySalesToday = async function(req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;

    try{
        var query = `
        SELECT 
            convert(char, Date_Trans, 111) as display_waktu,
            SUM([Charge_Penjualan]) as charge_penjualan,
            SUM([Discount_Penjualan]) as discount_penjualan,
            SUM([Service_Penjualan]) as service_penjualan,
            SUM([Tax_Penjualan]) as tax_penjualan,
            SUM([Total_Penjualan]) as total_penjualan
        FROM IHP_Ivc
        WHERE
        convert(char, Date_Trans, 111) = CONVERT(char, GETDATE(), 111)
        group by convert(char, Date_Trans, 111)
        `
        db.request().query(query, function(err, dataReturn){
            if(err){
                sql.close();
                logger.error(err);
                logger.error(err.message +  `Error Prosses Query ${query}`);
                res.send(new ResponseFormat(false, null, err.message));
            }else{
                sql.close();
                if(dataReturn.recordset.length > 0){
                    logger.info('Report today '+JSON.stringify(dataReturn.recordset))
                    res.send(new ResponseFormat(true, dataReturn.recordset))
                } else{
                    logger.info("today sales 0");
                    res.send(new ResponseFormat(false, null, "Data Kosong"));
                }
            }
        })
    } catch{
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.getMySalesMonthly = async function(req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;

    try{
        var query = `
        SELECT 
            convert(varchar(7), Date_Trans, 111) as display_waktu,
            SUM([Charge_Penjualan]) as charge_penjualan,
            SUM([Discount_Penjualan]) as discount_penjualan,
            SUM([Service_Penjualan]) as service_penjualan,
            SUM([Tax_Penjualan]) as tax_penjualan,
            SUM([Total_Penjualan]) as total_penjualan
        FROM HP112.dbo.IHP_Ivc
        WHERE
        convert(varchar(4), Date_Trans, 111) = convert(varchar(4), GETDATE(), 111)
        group by convert(varchar(7), Date_Trans, 111)
        order by convert(varchar(7), Date_Trans, 111) asc
        `
        db.request().query(query, function(err, dataReturn){
            if(err){
                sql.close();
                logger.error(err);
                logger.error(err.message +  `Error Prosses Query ${query}`);
                res.send(new ResponseFormat(false, null, err.message));
            }else{
                sql.close();
                if(dataReturn.recordset.length > 0){
                    logger.info('Report monthly '+JSON.stringify(dataReturn.recordset))
                    res.send(new ResponseFormat(true, dataReturn.recordset))
                } else{
                    logger.info("monthly sales 0");
                    res.send(new ResponseFormat(false, null, "Data Kosong"));
                }
            }
        })
    } catch{
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.getSalesItem = async function (req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;
    
    try{
    var duration = req.query.durasi;
    var chusr = req.query.chusr;
    var time;
    var salesItem;
    var cancelItem;

    if(duration == 'dialy'){
        time = `convert(char, sol.Date_Trans, 111) = CONVERT(char, GETDATE(), 111)` 
    } else if(duration == 'weekly'){
        time = ` convert(char, sol.Date_Trans, 111) >= convert(char, GETDATE(), 111)
        AND
        convert(char, sol.Date_Trans, 111) < convert(char, DATEADD(day, 7, GETDATE()), 111)` 
    } else if(duration == 'monthly'){
        time = `convert(varchar(4), Date_Trans, 111) = convert(varchar(4), GETDATE(), 111)` 
    }

    salesItem = await new SalesService().getSales(db, time, chusr);
    cancelItem = await new SalesService().getCancelSale(db, time);

    if(cancelItem != false){
        for(var i = 0; i<cancelItem.length; i++){
            for(var j=0; j<salesItem.length; j++){
                if(salesItem[j].slip_order == cancelItem[i].slip_order  && salesItem[j].inventory == cancelItem[i].inventory){
                    salesItem[j].Qty = salesItem[j].Qty - cancelItem[i].Qty;
                    salesItem[j].Total = salesItem[j].Total-cancelItem[i].Total;
                    console.log('ketemu salesnya' +  JSON.stringify(salesItem[j]));
                    console.log('ketemu cancelnya' +  JSON.stringify(cancelItem[i]));
                }
            }
        }
    }

    res.send(
            new ResponseFormat(true, salesItem)
            )

    }catch{
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

