var RoomCallCron = require('node-cron');
var RoomCallService = require('../../services/roomcall.service');
var SioController = require('../realtime/sio.controller');

class RoomCallController {
    /*
        # ┌────────────── second(optional)
        # │ ┌──────────── minute
        # │ │ ┌────────── hour
        # │ │ │ ┌──────── day of month
        # │ │ │ │ ┌────── month
        # │ │ │ │ │ ┌──── day of week
        # │ │ │ │ │ │
        # │ │ │ │ │ │
        # * * * * * *
    */
    constructor(logger, server) {
        this.log = logger;
        this.interval = `*/5 * * * * *`;
        this.sio = new SioController(server);
        this.roomCallService = new RoomCallService(logger);
    }

    start() {
        this.log.info(`Cron Room Call Started ${this.interval}`);
        RoomCallCron.schedule(this.interval, async () => {
            //this.log.info(`Cron Running`);

            let arrCallroom = await this.roomCallService.getRoomCall();
            if (arrCallroom) {
                arrCallroom.forEach(data => {

                    let notification = {
                        slip_order: '',
                        notif_type: SioController.ROOM_CALL,
                        room_type: '',
                        room_code: data.room_code,
                        rcp_code: data.rcp_code,
                        create_chusr: ''
                    };

                    /*  sio.getInstance()
                         .of("/fo-rtc")
                         .emit(SioController.ROOM_CALL, JSON.stringify(notification));  */
                    this
                        .sio
                        .bcNotifyCallRoom(notification);

                    //this.roomCallService.setDeliverRoomCall(data);
                    //console.log(data.room_code);
                });
            }
        });
    }

}

module.exports = RoomCallController;