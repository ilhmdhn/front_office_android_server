var DBConnection = require('../util/db.pool');

class OrderRoomModel {

    constructor(logger) {
        this.log = logger;
    }


    async getReceptionCodeByCodeRoom(room_code) {
        let db = await new DBConnection().getPoolConnection();

        return new Promise(async (resolve, reject) => {
            let logger = this.log;
            var qry = `
                      select 
                     isnull(IHP_Room.Reception,'') as reception 
                     from IHP_Room
                     where Kamar = '${room_code}' `;

            db.request().query(qry, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message + ' Error prosesQuery ' + qry);
                    resolve(false);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        var reception = dataReturn.recordset[0].reception;
                        console.log(room_code + " Sukses GetReception ");
                        logger.info(room_code + " Sukses GetReception ");
                        resolve(reception);
                    } else {
                        console.log(room_code + " gagal GetReception From IHP_Room");
                        logger.info(room_code + " gagal GetReception From IHP_Room");
                        resolve(false);
                    }
                }
            });
        });
    }



}

module.exports = OrderRoomModel;