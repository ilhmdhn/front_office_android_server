var io = require('socket.io');
var RoomCallService = require('../../services/roomcall.service');
var listAllClient = [];
var listAllClientConnected = [];
var rejectedCallQty = [];
var roomCallQty = [];
var userConnect;
var user_connected_data;

class SioController {
    static get NEW_ORDER() { return "NEW_ORDER"; }
    static get ROOM_CALL() { return "ROOM_CALL"; }
    static get ACCEPTED_ROOM_CALL() { return "ACCEPTED_ROOM_CALL"; }
    static get REJECTED_ROOM_CALL() { return "REJECTED_ROOM_CALL"; }
    static get HIDE_ROOM_CALL() { return "HIDE_ROOM_CALL"; }
    static get ADD_USER() { return "ADD_USER"; }


    constructor(logger, appServer) {
        if (SioController.instance instanceof SioController) {
            return SioController.instance;
        }
        SioController.instance = io(appServer);
        this.roomCallService = new RoomCallService(logger);
        this.server = appServer;
        this.log = logger;
        this.setupFoRtc();
        Object.freeze(this.roomCallService);
        //Object.freeze(this.server);
        Object.freeze(this.log);
        SioController.instance = this;


    }

    setupFoRtc() {
        this.foRtc = SioController.instance.of('/fo-rtc');

        let handleAcceptRoomCall = (data, clientId, IpAddress) => {
            //console.log(data);
            this.log.info(`Accept Call Client Id  ${clientId}`);
            rejectedCallQty = [];
            roomCallQty = [];
            this.roomCallService.setAcceptedRoomCall(data, clientId, IpAddress);
        };

        let handleRejectRoomCall = (data, clientId, IpAddress) => {
            //console.log(data);
            this.log.info(`Reject Call Client Id  ${clientId}`);
            rejectedCallQty.push(clientId);
            if (rejectedCallQty.length == roomCallQty.length) {
                rejectedCallQty = [];
                roomCallQty = [];
                this.roomCallService.setRejectedRoomCall(data, 1, clientId, IpAddress);
            }
            else {
                this.roomCallService.setRejectedRoomCall(data, 0, clientId, IpAddress);
            }
        };

        this.foRtc.on("connection", (clientSio) => {
            listAllClient.push(clientSio.id);
            this.log.info(`Connected : SocketId = ${clientSio.id} ip_address = ${clientSio.conn.remoteAddress} Client Connected = ${listAllClient.length}`);

            clientSio.on(SioController.NEW_ORDER, function (clientData) {

            });

            clientSio.on(SioController.ROOM_CALL, function (clientData) {
            });

            clientSio.on(SioController.ADD_USER, function (clientData, socketId) {
                var data = JSON.parse(clientData);
                if ((data !== null) && (socketId !== null)) {
                    userConnect = data.user_id;
                    var socket_id_ = socketId;
                    user_connected_data = {
                        user: data,
                        socket_id: socket_id_
                    };
                    listAllClientConnected.push(user_connected_data);
                    console.log(`Client User Connect : ${userConnect} Client Connected : ${listAllClientConnected.length}`);
                }
            });

            clientSio.on(SioController.ACCEPTED_ROOM_CALL, function (clientData) {
                var data = JSON.parse(clientData);
                var client_id = this.id;
                var ip_address_ = clientSio.conn.remoteAddress;
                let notification = {
                    slip_order: '',
                    notif_type: SioController.ROOM_CALL,
                    room_type: '',
                    room_code: data.room_code,
                    rcp_code: data.rcp_code,
                    accepted_chusr: data.accepted_chusr,
                    client_id: client_id,
                    ip_address: ip_address_
                };

                clientSio.broadcast.emit(SioController.HIDE_ROOM_CALL, JSON.stringify(notification));
                handleAcceptRoomCall(data, client_id, ip_address_);

            });

            clientSio.on(SioController.REJECTED_ROOM_CALL, function (clientData) {
                var data = JSON.parse(clientData);
                var client_id = this.id;
                var ip_address_ = clientSio.conn.remoteAddress;
                handleRejectRoomCall(data, client_id, ip_address_);

            });

            clientSio.on('disconnect', function () {
                console.log(`Disconnected : SocketId = ${clientSio.id} ip_address = ${clientSio.conn.remoteAddress} User : ${userConnect}`);
                var i = listAllClient.indexOf(clientSio.id);
                listAllClient.splice(i, 1);

                var k = user_connected_data.socket_id.indexOf(clientSio.id);
                listAllClientConnected.splice(k, 1);

                if (roomCallQty.length > 0) {
                    var j = roomCallQty.indexOf(clientSio.id);
                    roomCallQty.splice(j, 1);
                    rejectedCallQty.splice(j, 1);
                }

                console.log(`Client Connected=  ${listAllClient.length}`);
            });
        });

    }

    bcNotifySlipOrder(notifData) {
        /*   this.getInstance()
              .of("/fo-rtc")
              .emit(SioController.NEW_ORDER, JSON.stringify(notifData)); */

        this.foRtc.emit(SioController.NEW_ORDER, JSON.stringify(notifData));
    }

    bcNotifyCallRoom(notifData) {
        roomCallQty = listAllClient;
        rejectedCallQty = [];
        if (roomCallQty.length == 0) {
            this.log.info(`Call Room  ${notifData.room_code} Jumlah Client Connected= ${listAllClient.length}`);
            this.roomCallService.setEmptyClient(notifData);
        } else if (roomCallQty.length > 0) {
            this.roomCallService.setDeliverRoomCall(notifData, listAllClient.length);
        }
        this.foRtc.emit(SioController.ROOM_CALL, JSON.stringify(notifData));
    }

    bcNotifyCallRoomAccepted(notifData) {
        this.roRct.emit(SioController.ACCEPTED_ROOM_CALL, JSON.stringify(notifData));
    }

    bcNotifyCallRoomRejected(notifData) {
        this.roRct.emit(SioController.REJECTED_ROOM_CALL, JSON.stringify(notifData));
    }

    getServer() {
        return this.server;
    }
    getInstance() {
        return SioController.instance;
    }



}

module.exports = SioController;