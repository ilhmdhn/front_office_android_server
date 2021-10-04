var TransferModel = require('../model/transfer.model');

class TransferService {


    constructor(logger) {
        this.log = logger;
    }

    /*
     {
           state: true,
            desc: 'Validasi Ok',
            transfer_desc: transferDesc,
            chusr: input.body.chusr,
            old_room_code: input.body.old_room_before_transfer.kamar,
            new_room_code: input.body.checkin_room.kamar,
            duration_on_hours: input.body.durasi_jam,
            duration_on_minute: input.body.durasi_jam * 60,
            member_name: input.body.visitor.nama_lengkap,
            member_code: input.body.visitor.member
        };
    */
    lobbyToRoom(validData) {
        let transferModel = new TransferModel(this.log);
        let logger = this.log;
        let newRoom, oldRoom;
        return new Promise((resolve, reject) => {
            transferModel.validateNewRoomTransfer(validData.new_room_code)
                .then((dataNewRoom) => {
                    newRoom = dataNewRoom;
                    return transferModel.detailOldRoom(validData.old_room_code);
                })
                .then((dataOldRoom) => {
                    oldRoom = dataOldRoom;
                    return transferModel.checkinTransaction(oldRoom, newRoom, validData);
                })
                .then((finalData) => {
                    resolve(finalData);
                })
                .catch((err) => {
                    logger.error(err);
                    reject(err);
                });
        });

    }

}

module.exports = TransferService;