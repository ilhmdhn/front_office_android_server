var fs = require('fs');
var sql = require("mssql");
var logger = require('./logger.js');

class DbPool {

    constructor() {
        this.configServer = JSON.parse(fs.readFileSync('setup.json'));
        this.dbUser = this.configServer.db_user;
        this.dbPsswd = this.configServer.db_password;
        this.dbServer = this.configServer.db_server_ip;
        this.dbName = this.configServer.db_name;
        this.dbInstance = this.configServer.db_instance_name;
        this.dbVersion = this.configServer.db_version;

        this.ipServer = this.configServer.server_ip;
        this.portServer = this.configServer.server_port;
        this.outlet = this.configServer.outlet;
        
        if (this.dbVersion === "2000") {
            this.configDb = {
                user: this.dbUser,
                password: this.dbPsswd,
                server: this.dbServer,
                port: 1433,
                database: this.dbName,
                options: {
                    driver: 'SQL Server Native Client 10.0',
                    tdsVersion: '7_1',
                    encrypt: false,
                    enableArithAbort: true
                },
                dialectOptions: {
                    instanceName: this.dbInstance
                },
                connectionTimeout: 0,
                requestTimeout: 0,
                pool: {
                    idleTimeoutMillis: 300000,
                    min: 0,
                    max: 10,
                    log: true
                }
            };
        } else {
            this.configDb = {
                user: this.dbUser,
                password: this.dbPsswd,
                server: this.dbServer,
                port: 1433,
                database: this.dbName,
                dialectOptions: {
                    instanceName: this.dbInstance
                },
                options: {
                    encrypt: false,
                    enableArithAbort: true
                },
                connectionTimeout: 0,
                requestTimeout: 0,
                pool: {
                    idleTimeoutMillis: 300000,
                    min: 0,
                    max: 10,
                    log: true
                }
            };
        }

    }

    getConfig() {
        return this.configDb;
    }

    getIpServer() {
        return this.ipServer;
    }

    getPortServer() {
        return this.portServer;
    }

    getOutlet() {
        return this.outlet;
    }

    async getPoolConnection() {

        if (DbPool.instancePoolConnection && DbPool.instancePoolConnection._connected) {
            return DbPool.instancePoolConnection;
        }
        try {
            DbPool.instancePoolConnection = new sql.ConnectionPool(this.configDb);

            this.initializeConnection(err => {
                if (err) {
                    return "Init Database Error " + err.message;
                }
                return DbPool.instancePoolConnection;
            });
        }
        catch (error) {
            console.log("Init Database Error " + error.message);
            logger.info("Init Database Error " + error.message);
            return "Init Database Error " + error.message;
        }
    }

    initializeConnection(callback) {
        if (DbPool.instancePoolConnection && DbPool.instancePoolConnection._connected) {
            callback();
        } else {
            DbPool.instancePoolConnection = new sql.ConnectionPool(this.configDb);
            DbPool.instancePoolConnection.connect(function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        }
    }

}



module.exports = DbPool;