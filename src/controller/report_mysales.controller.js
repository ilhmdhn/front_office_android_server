var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var SalesService = require('../services/item.sales');

var logger;
var db;

const { resolve } = require('dns');
const { data } = require('jquery');


exports.getMySalesToday = async function(req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;

    try{
        var chusr = req.query.chusr;
        
        var salesItem = await new SalesService().todaySale(db, chusr);
        var cancelItem  = await new SalesService().todayCancelSale(db, chusr);

        if(cancelItem != false){
            for(var i = 0; i<cancelItem.length; i++){
                for(var j=0; j<salesItem.length;  j++){
                    if(salesItem[j].display_waktu == cancelItem[i].display_waktu){
                        salesItem[j].total = salesItem[j].total - cancelItem[i].total
                    } 
                }
            }
        }
        
        if(salesItem != false){
            res.send(new ResponseFormat(true,  salesItem))
        } else{
            res.send(new ResponseFormat(false, null, "Data Kosong"))
        }

    } catch(error){
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

exports.getMySalesWeekly = async function(req, res){
    db =  await new DBConnection().getPoolConnection();
    logger = req.log;

    try{
        var chusr = req.query.chusr;
        
        var salesItem = await new SalesService().weekSale(db, chusr);
        var cancelItem  = await new SalesService().weekCancelSale(db, chusr);

        if(cancelItem != false){
            for(var i = 0; i<cancelItem.length; i++){
                for(var j=0; j<salesItem.length;  j++){
                    if(salesItem[j].display_waktu == cancelItem[i].display_waktu){
                        salesItem[j].total = salesItem[j].total - cancelItem[i].total
                    } 
                }
            }
        }
        
        if(salesItem != false){
            res.send(new ResponseFormat(true,  salesItem))
        } else{
            res.send(new ResponseFormat(false, null, "Data Kosong"))
        }
    } catch(error){
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
        var chusr = req.query.chusr;
        
        var salesItem = await new SalesService().monthSale(db, chusr);
        var cancelItem  = await new SalesService().monthCancelSale(db, chusr);

        if(cancelItem != false){
            for(var i = 0; i<cancelItem.length; i++){
                for(var j=0; j<salesItem.length;  j++){
                    if(salesItem[j].display_waktu == cancelItem[i].display_waktu){
                        salesItem[j].total = salesItem[j].total - cancelItem[i].total
                    } 
                }
            }
        }
        
        if(salesItem != false){
            for(var i = 0; i<salesItem.length; i++){
            switch(salesItem[i].display_waktu.substring(5, 7)){
                case "01":
                    salesItem[i].display_waktu = "Jan";
                    break;
                case "02":
                    salesItem[i].display_waktu = "Feb";
                    break;
                case "03":
                    salesItem[i].display_waktu = "Mar";
                    break;
                case "04":
                    salesItem[i].display_waktu = "Apr";
                    break;
                case "05":
                    salesItem[i].display_waktu = "Mei";
                    break;
                case "06":
                    salesItem[i].display_waktu = "Jun";
                break;
                case "07":
                    salesItem[i].display_waktu = "Jul";
                    break;
                case "08":
                    salesItem[i].display_waktu = "Aug";
                    break;
                case "09":
                    salesItem[i].display_waktu = "Sep";
                    break;
                case "10":
                    salesItem[i].display_waktu = "Nov";
                    break;
                case "11":
                    salesItem[i].display_waktu = "Okt";
                    break;
                case "12":
                    salesItem[i].display_waktu = "Des";
                    break;
                }
            }
            res.send(new ResponseFormat(true,  salesItem))
        } else{
            res.send(new ResponseFormat(false, null, "Data Kosong"))
        }
    } catch(error){
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
        time = 
        `convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
        AND
        convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(day, -7, GETDATE()), 111)` 
    } else if(duration == 'monthly'){
        time = 
        `convert(char, sol.Date_Trans, 111) <= convert(char, GETDATE(), 111)
        AND
        convert(char, sol.Date_Trans, 111) > convert(char, DATEADD(year, -1, GETDATE()), 111)`  
    }

    salesItem = await new SalesService().getSales(db, time, chusr);
    cancelItem = await new SalesService().getCancelSale(db, time, chusr);

    if(cancelItem != false){
        for(var i = 0; i<cancelItem.length; i++){
            for(var j=0; j<salesItem.length; j++){
                if(salesItem[j].nama_item == cancelItem[i].nama_item  && salesItem[j].inventory == cancelItem[i].inventory){
                    salesItem[j].Qty = salesItem[j].Qty - cancelItem[i].Qty;
                    salesItem[j].Total = salesItem[j].Total-cancelItem[i].Total;
                }
            }
        }
    }

    if(salesItem != false){
        res.send(new ResponseFormat(true, salesItem));
    } else{
        res.send(new ResponseFormat(false, null,  "Data Kosong"));
    }

    }catch(error){
        logger.error(error);
        logger.error(error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}

