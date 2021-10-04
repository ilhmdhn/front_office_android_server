var ReservationModel = require('../model/reservation.model');

class ReservationService {


    constructor(logger) {
        this.log = logger;
        this.model = new ReservationModel(logger);
    }

    async getReservationInUse(rsv_code) {
        return new Promise((resolve, reject) => {
            this.model.getDataReservationInUse(rsv_code, (err, data) => {
                if (err) {
                    resolve(err.message);
                } else {
                    if (data.length > 0) {
                        resolve(`Reservasi atas nama ${data[0].mbr_name} digunakan di kamar ${data[0].room_code}`);
                    } else {
                        resolve("Reservasi sudah dipakai checkin");
                    }
                }
            })
        })

    }


}

module.exports = ReservationService;