var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var logger;
var db ;

var ReduceDuration = require('../services/reduce.duration.js');
var CatatReduce = require('../services/catat.reduce.js');

exports.reduceDuration = async function(req, res){
    db = await new DBConnection().getPoolConnection();

    try{

        var kode_rcp = req.body.rcp;
        var durasi_jam = req.body.durasi;
        let chusr = req.body.chusr;
        
            for(var i = 0; i<durasi_jam; i++){
                var reduce = await new ReduceDuration().reduceExtend(db, kode_rcp);
                if(reduce == 'move'){
                   var reduceRcp =  await new ReduceDuration().reduceRcp(db, kode_rcp);
                }
                if(reduce == true || reduceRcp == true){
                    await new ReduceDuration().reduceRoomDuration(db, kode_rcp);
                }
            }

            if(reduce == true || reduceRcp == true){
                await new CatatReduce().catatReduce(db, kode_rcp, durasi_jam, chusr);
            }

            res.send(new ResponseFormat(true, null, "Berhasil Mengurangi Durasi"));
            
    } catch(error){
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ' +  query);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
}
