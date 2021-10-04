var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var async = require('async');

class CallRoomModel {

    static get ACCEPTED_CALL() { return 0; }
    static get REJECTED_CALL() { return 0; }
    static get ON_CALL() { return 1; }
    static get DELIVERY_CALL() { return 2; }

    constructor(logger) {
        this.log = logger;
    }


    async getCall(callback) {
        let db = await new DBConnection().getPoolConnection();

        var qryIhpRoom = `
            SELECT 
             TOP 1 
             IHP_Room.Kamar as room_code, 
             IHP_Room.Reception as rcp_code 
             FROM 
             IHP_Room 
             WHERE IHP_Room.Reception IS NOT NULL
             AND DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) >0 
             AND [Status_Checkin]='1' 
             AND IHP_Room.Service_Kamar = ${CallRoomModel.ON_CALL} 
             Order By [Jam_Checkin] asc `;

        db.request().query(qryIhpRoom, (errQuery, dataReturn) => {
            if (errQuery) {
                this.log.error(`${errQuery}`);
                callback(errQuery);
            } else {
                callback(null, dataReturn.recordset);
            }
        });
    }

    async setDeliverCall(param, JumlahClient) {
        let db = await new DBConnection().getPoolConnection();

        let handleErrorLoger = (desc, error) => {
            this.log.error(desc + ':' + error);
        };

        var qryIhpRoom = `
             UPDATE IHP_Room SET 
             Service_Kamar = ${CallRoomModel.DELIVERY_CALL}
             WHERE Kamar = '${param.room_code}'`;

        var qryIhpHistoryNotif = `` +
            ` INSERT INTO IHP_History_Notif (Reception, Date, Kamar, Chusr,Terima_Tolak,Jumlah_Client)` +
            ` VALUES ('${param.rcp_code}',GETDATE(),'${param.room_code}', 'TAMU', '-1','${JumlahClient}' )`;

        const transaction = new sql.Transaction(db);
        transaction.begin(function (err) {
            if (err) {
                return handleErrorLoger('Error in transaction begin', err);
            }

            var request = new sql.Request(transaction);

            async.series({
                one: function (callback) {
                    request.query(qryIhpRoom, callback);
                },
                two: function (callback) {
                    request.query(qryIhpHistoryNotif, callback);
                }
            },
                function (err, results) {
                    // results is now equal to: {one: [{a: 1}], two: [{b: 2}]}
                    if (err) {
                        handleErrorLoger('Error in queries, rolling back', err);
                        return transaction.rollback();
                    }
                    transaction.commit(function (err) {
                        if (err) {
                            return handleErrorLoger('Error in commit', err);
                        }
                        console.log(`db transaction success`);
                    });
                });
        });

    }

    async setReDeliverCall(param) {
        let db = await new DBConnection().getPoolConnection();

        var qryIhpRoom = `` +
            ` UPDATE IHP_Room SET  ` +
            ` Service_Kamar = ${CallRoomModel.ON_CALL}` +
            ` WHERE Kamar = '${param.room_code}'`;

        db.request().query(qryIhpRoom, (errQuery, dataReturn) => {
            if (errQuery) {
                this.log.error(`${errQuery}`);
            }
        });

    }

    async setAcceptCallAndHistory(param, clientId, IpAddress) {
        let db = await new DBConnection().getPoolConnection();

        let handleErrorLoger = (desc, error) => {
            this.log.error(desc + ':' + error);
        };

        var qryIhpRoom = `` +
            ` UPDATE IHP_Room SET  ` +
            ` Service_Kamar = ${CallRoomModel.ACCEPTED_CALL}` +
            ` WHERE Kamar = '${param.room_code}'`;

        var qryIhpHistoryNotif = `` +
            ` INSERT INTO IHP_History_Notif (Reception, Date, Kamar, Chusr,Terima_Tolak,Client_Id,Ip_Address)` +
            ` VALUES ('${param.rcp_code}',GETDATE(),'${param.room_code}', '${param.accepted_chusr}', '1','${clientId}','${IpAddress}' )`;

        const transaction = new sql.Transaction(db);
        transaction.begin(function (err) {
            if (err) {
                return handleErrorLoger('Error in transaction begin', err);
            }

            var request = new sql.Request(transaction);

            async.series({
                one: function (callback) {
                    request.query(qryIhpRoom, callback);
                },
                two: function (callback) {
                    request.query(qryIhpHistoryNotif, callback);
                }
            }, function (err, results) {
                // results is now equal to: {one: [{a: 1}], two: [{b: 2}]}
                if (err) {
                    handleErrorLoger('Error in queries, rolling back', err);
                    return transaction.rollback();
                }
                transaction.commit(function (err) {
                    if (err) {
                        return handleErrorLoger('Error in commit', err);
                    }
                    console.log(`db transaction success`);
                });
            });
        });
    }

    async setRejectCallAndHistory(param, repeat_, clientId, IpAddress) {
        let db = await new DBConnection().getPoolConnection();
        var repeat = repeat_;
        var qry;
        if (repeat == 1) {
            qry = ` Service_Kamar ='1'`;
        }
        else {
            qry = ` Service_Kamar = ${CallRoomModel.REJECTED_CALL}`;
        }

        let handleErrorLoger = (desc, error) => {
            this.log.error(desc + ':' + error);
        };

        var qryIhpRoom = `` +
            ` UPDATE IHP_Room SET  ` +
            qry +
            ` WHERE Kamar = '${param.room_code}'`;

        var qryIhpHistoryNotif = `` +
            ` INSERT INTO IHP_History_Notif (Reception, Date, Kamar, Chusr,Terima_Tolak,Client_Id,Ip_Address)` +
            ` VALUES ('${param.rcp_code}',GETDATE(),'${param.room_code}', '${param.accepted_chusr}', '0','${clientId}','${IpAddress}' )`;

        const transaction = new sql.Transaction(db);
        transaction.begin(function (err) {
            if (err) {
                return handleErrorLoger('Error in transaction begin', err);
            }

            var request = new sql.Request(transaction);

            async.series({
                one: function (callback) {
                    request.query(qryIhpRoom, callback);
                },
                two: function (callback) {
                    request.query(qryIhpHistoryNotif, callback);
                }
            },
                function (err, results) {
                    // results is now equal to: {one: [{a: 1}], two: [{b: 2}]}
                    if (err) {
                        handleErrorLoger('Error in queries, rolling back', err);
                        return transaction.rollback();
                    }
                    transaction.commit(function (err) {
                        if (err) {
                            return handleErrorLoger('Error in commit', err);
                        }
                        console.log(`db transaction success`);
                    });
                });
        });
    }


}

module.exports = CallRoomModel;