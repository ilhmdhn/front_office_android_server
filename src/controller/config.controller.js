var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var db;

exports.profil = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var qry = " " +
        "SELECT " +
        "   outlet, " +
        "   Nama_Outlet, " +
        "   Alamat_Outlet, " +
        "   Alamat_Outlet2, " +
        "   Tlp1, " +
        "   Kota " +
        "FROM IHP_Config";
    try {

        db.request().query(qry, function (err, dataReturn) {
            if (err) {
                logger.error(err.message);
            } else {
                dataResponse = new ResponseFormat(true, dataReturn.recordset);
                res.send(dataResponse);
            }
        });

    } catch (error) {
        logger.error('Error Karena #' + error);
    }
};

exports.getConfig = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _getConfigure(req, res);
};

var _getConfigure = async function (req, res) {
    try {
        var versi = await getVersi();
        var expired_date = await getExpiredDate();

        var responConfig = [];
        var resVersi = {
            'con_id': 4,
            'con_name': 'pos_version',
            'con_value': versi.con_value
        };
        var resExpired = {
            'con_id': 5,
            'con_name': 'pos_expired',
            'con_value': expired_date.con_value
        };
        responConfig.push(resVersi);
        responConfig.push(resExpired);

        dataResponse = new ResponseFormat(true, responConfig);
        res.send(dataResponse);
    } catch (error) {
        logger.error(error);
    }

};

function getVersi() {
    return new Promise((resolve, reject) => {
        var qry = "select Note as con_value from IHP_Config4 where IDSetting= 'Pgu'";
        try {
            db.request().query(qry, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message);
                } else {
                    resolve(dataReturn.recordset[0]);
                }
            });
        } catch (error) {
            logger.error(error);
        }
    });
}

function getExpiredDate() {
    return new Promise((resolve, reject) => {
        var qry = " " +
            "select  " +
            " Note as con_value  " +
            "from IHP_Config4 where IDSetting= 'Czw'";

        try {
            db.request().query(qry, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                } else {
                    resolve(dataReturn.recordset[0]);
                }
            });

        } catch (error) {
            logger.error(error);
        }
    });
}

exports.ip_address = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var qry = " " +
        " SELECT " +
        " [Aplikasi] as aplikasi, " +
        " [IP_Address] as ip_address, " +
        " [Server_Socket_Port] as server_socket_port, " +
        " [Server_Udp_Port] as server_udp_port " +
        "FROM IHP_IPAddress";
    try {

        db.request().query(qry, function (err, dataReturn) {
            if (err) {
                logger.error(err.message);
            } else {
                dataResponse = new ResponseFormat(true, dataReturn.recordset);
                res.send(dataResponse);
            }
        });

    } catch (error) {
        logger.error('Error Karena #' + error);
    }
};

