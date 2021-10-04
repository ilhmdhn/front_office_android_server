var express = require('express');
var router = express.Router();
var QrGenerator = require('../util/barcode.generator');
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var path = require('path');
var configServer = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../setup.json")));
var versi = "V2020_09.04 Updated 02 Oktober 2020";

router.route('/setting').get(function (req, res) {


    logger = req.log;


    var filename = `setup_android.png`;

    new DBConnection().initializeConnection(function (err) {
        if (err) {
            logger.error(err);
            info = {
                message: "ERROR !!! Can not Connect Server " + configServer.db_server_ip,
                ip_server: configServer.server_ip,
                port_server: configServer.server_port,
                db_server: "Error Config DB " + configServer.db_server_ip,
                db_name: "Error Config DB " + configServer.db_name,
                ver: versi,
                errorMessege: err.message
            };
            res.render("pages/index", {
                info: info,
                page: "setting/info"
            });
        } else {
            info = {
                message: "If you see this message it means a successful connection to the server Database " + configServer.db_server_ip,
                ip_server: configServer.server_ip,
                port_server: configServer.server_port,
                db_server: configServer.db_server_ip,
                ver: versi,
                db_name: configServer.db_name,
                errorMessege: "successed",
                img_qr_code: filename
            };
            res.render("pages/index", {
                info: info,
                page: "setting/info"
            });
        }
    });


});

module.exports = router;