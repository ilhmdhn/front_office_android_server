var DBConnection = require('../util/db.pool');

class ReservationModel {

    constructor(logger) {
        this.log = logger;
    }

    async getDataReservationInUse(rsv_code, callback) {
        let db = await new DBConnection().getPoolConnection();

        var qry = `
        SELECT
            a.Reservation as rsv_code,
            a.Reception as rcp,
            a.Nama as mbr_name,
            a.Kamar as room_code
        FROM
            IHP_Rcp a
            INNER JOIN IHP_Room b ON a.Reception = b.Reception
        WHERE
        	a.Reservation = '${rsv_code}'`;

        db.request().query(qry, (errQuery, dataReturn) => {
            if (errQuery) {
                this.log.error(`${errQuery}`);
                callback(errQuery);
            } else {
                callback(null, dataReturn.recordset);
            }
        });
    }

}

module.exports = ReservationModel;