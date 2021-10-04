var RoomCallModel = require('../model/roomcall.model');

class RoomCallService {


    constructor(logger) {
        this.log = logger;
        this.model = new RoomCallModel(logger);
    }

    getRoomCall() {
        return new Promise((resolve, reject) => {
            this.model.getCall((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.length > 0) {
                        resolve(data);
                    } else {
                        resolve(false);
                    }
                }

            });
        });
    }

    setDeliverRoomCall(data, JumlahClient) {
        this.model.setDeliverCall(data, JumlahClient);
    }

    setAcceptedRoomCall(data, client_id, IpAddress) {
        this.model.setAcceptCallAndHistory(data, client_id, IpAddress);
    }

    setRejectedRoomCall(data, repeat, clientId, IpAddress) {
        this.model.setRejectCallAndHistory(data, repeat, clientId, IpAddress);
    }

    setEmptyClient(data) {
        this.model.setReDeliverCall(data);
    }

}

module.exports = RoomCallService;