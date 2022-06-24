module.exports = function (callback) {

    var fs = require('fs');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var configServer = JSON.parse(fs.readFileSync('setup.json'));
    var express = require('express');
    var morgan = require('morgan');
    var bodyParser = require('body-parser');
    const http = require('http');
    var SioController = require('./controller/realtime/sio.controller');
    var ServerSocket = require('./controller/realtime/server.socket');
    var RoomCallController = require('./controller/schedulers/roomcall.controller');
    var DBConnection = require('./util/db.pool');
    var ModifikasiTable = require('./util/modifikasi.table');
    var TarifKamar = require('./services/tarif.kamar');
    var favicon = require('serve-favicon');
    var app = express();
    var formData = require('express-form-data');
    var CreateDirectoryFile = require('./util/create.directory.file');
    app.locals.baseURL = "http://" + configServer.server_ip + ":" + configServer.server_port;

    var logger = require('./util/logger');
    var QrGenerator = require('./util/barcode.generator');

    var configRoute = require('./routes/config.route');
    var userRoute = require('./routes/user.route');
    var voucherRoute = require('./routes/voucher.route');
    var memberRoute = require('./routes/member.route');
    var roomRoute = require('./routes/room.route');
    var inventoryRoute = require('./routes/inventory.route');
    var orderRoute = require('./routes/order.route');
    var checksoundRoute = require('./routes/checksound.route');
    var checkInRoute = require('./routes/checkin.route');
    var checkInDirectRoute = require('./routes/checkin_direct.route');
    var promoRoute = require('./routes/promo.route');
    var edcRoute = require('./routes/edc.route');
    var webRoute = require('./routes/web.route');
    var paymentRoute = require('./routes/payment.route');
    var cancelorderRoute = require('./routes/cancelorder.route');
    var neworderRoute = require('./routes/neworder.route');
    var reportRoute = require('./routes/report.route');
    var rsvRoute = require('./routes/reservation.route');
    var approvalRoute = require('./routes/submit_approval.route');

    var versi = "V2020_09.04 Updated 02 Oktober 2020";
    var cek_koneksi_internet;

    var db;

    var bc = new QrGenerator(logger);
    bc.setData(configServer.server_ip, configServer.server_port);
    var fileConfig = `setup_android.png`;
    var dirConfig = configServer.server_dir_files;
    var room_call_service = configServer.room_call_service;
    if (room_call_service === undefined) {
        room_call_service = "1";
    }
    var server_tcp_udp_service = configServer.server_tcp_udp_service;
    if (server_tcp_udp_service === undefined) {
        server_tcp_udp_service = "1";
    }

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("!!!---Attention No Internet connection---!!! Can not check Voucher and Member");
            cek_koneksi_internet = "!!!---Attention No Internet connection---!!! Can not check Voucher and Member";
        } else {
            console.log("Internet Connected");
            cek_koneksi_internet = "Internet Connected";
        }
    });

    if (dirConfig === undefined) {
        dirConfig = "c:\\server-files\\config";
    }

    app.set('port', configServer.server_port);
    const server = http.createServer(app);
    const sio = new SioController(logger, server);
    if (server_tcp_udp_service == "1") {
        new ServerSocket(logger);
    }

    app.use('/', (req, res, next) => {
        req.log = logger;
        req.bundleServer = sio;
        req.config = configServer;
        next();
    });

    app.use(morgan('common', {
        "stream": logger.stream
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    // for parsing multipart/form-data
    app.use(formData.parse());
    app.use(cookieParser());
    app.use(favicon(path.join(__dirname, '../src/views/public', 'favicon.ico')));
    app.use("/images-server",
        express.static(path.join(dirConfig, '/')));
    app.use("public",
        express.static(path.join(__dirname, '../src/views/public')));

    app.use(
        "/images",
        express.static(path.join(__dirname, "../images"))
    );
    app.use(
        "/script-adminlte",
        express.static(path.join(__dirname, "../node_modules/admin-lte/"))
    );
    app.use(
        "/io-client",
        express.static(path.join(__dirname, "../node_modules/socket.io-client/"))
    );
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use('/config', configRoute);
    app.use('/user', userRoute);
    app.use('/inventory', inventoryRoute);
    app.use('/room', roomRoute);
    app.use('/order', orderRoute);
    app.use('/voucher', voucherRoute);
    app.use('/member', memberRoute);
    app.use('/checksound', checksoundRoute);
    app.use('/checkin', checkInRoute);
    app.use('/checkin-direct', checkInDirectRoute);
    app.use('/promo', promoRoute);
    app.use('/edc', edcRoute);
    app.use('/payment', paymentRoute);
    app.use('/cancelorder', cancelorderRoute);
    app.use('/neworder', neworderRoute);
    app.use('/report', reportRoute);
    app.use('/rsv', rsvRoute);
    app.use('/approval', approvalRoute);

    app.use('/web', webRoute);

    app.get('/', (req, res) => {
        var info;

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

                const roomcallCtrl = new RoomCallController(logger, server);
                if (room_call_service == "1") {
                    roomcallCtrl.start();
                }

                db = new DBConnection().initializeConnection(async function (err) {
                    if (err) {
                        logger.error(err);
                    }
                    else {
                        db = await new DBConnection().getPoolConnection();
                        new ModifikasiTable().createTableIhpHistoryReduceDuration(db);
                        new ModifikasiTable().penambahanKolomPrintedSlipCheckinIhpRcp(db);
                        new ModifikasiTable().penambahanKolomSignIhpRcp(db);
                        new ModifikasiTable().melebarkanKolomPrintedIhpSul(db);
                        new ModifikasiTable().melebarkanKolomPrintedIhpIvc(db);
                        new ModifikasiTable().createTableIhpHistoryNotif(db);
                        new ModifikasiTable().penambahanKolomFilePhotoIhpMbr(db);
                        new ModifikasiTable().penambahanKolomTolakTerimaIHPHistoryNotif(db);
                        new ModifikasiTable().penambahanKolomClientIdIHPHistoryNotif(db);
                        new ModifikasiTable().penambahanKolomDateTerkirimIHPHistoryNotif(db);
                        new ModifikasiTable().penambahanKolomIpAddressIHPHistoryNotif(db);
                        new ModifikasiTable().penambahanKolomJumlahClientIHPHistoryNotif(db);
                        new ModifikasiTable().createTableIhpIpAddress(db);
                        new CreateDirectoryFile().createDirectoy("temp_summary_pdf");
                        new ModifikasiTable().penambahanKolomIpAddressIHPUser(db);
                        new ModifikasiTable().createTableIhpIpAddressRoomNo(db);
                        new ModifikasiTable().penambahanKolomLogin_DateIHPUser(db);
                        new ModifikasiTable().penambahanKolomNamaTamuAliasIHPRoom(db);
                        new ModifikasiTable().penambahanKolomKamarAliasIHPRoom(db);
                        new ModifikasiTable().penambahanKolomMemberRevIHPRcp(db);
                        new ModifikasiTable().penambahanKolomIdCardNikIHPMbr(db);
                        new ModifikasiTable().penambahanKolomIdCardNameIHPMbr(db);
                        new ModifikasiTable().penambahanKolomIdCardAddressIHPMbr(db);
                        new ModifikasiTable().penambahanKolomIdCardCityIHPMbr(db);
                        new ModifikasiTable().penambahanKolomIdCardUrlIHPMbr(db);
                        new ModifikasiTable().melebarkanKolomReservationIhpRcp(db);
                        var deleteProcedureJamKenaSewa = await new TarifKamar().deleteProcedureJamKenaSewa(db);
                        if (deleteProcedureJamKenaSewa == true) {
                            await new TarifKamar().getCreateProsedureTarifKamarPerjam(db);
                        }
                        new ModifikasiTable().penambahanKolomStartExtIHPExt(db);
                        new ModifikasiTable().penambahanKolomEndExtIHPExt(db);
                        new ModifikasiTable().penambahanKolomSewaKamarSebelumDiskonIHPIvc(db);
                        new ModifikasiTable().penambahanKolomDiskonSewaKamarIHPIvc(db);
                        new ModifikasiTable().penambahanKolomTotalExtendSebelumDiskonIHPIvc(db);
                        new ModifikasiTable().penambahanKolomDiskonExtendKamarIHPIvc(db);
                        new ModifikasiTable().penambahanKolomDateTimeStartIHPRcpDetailsRoom(db);
                        new ModifikasiTable().penambahanKolomDateTimeFinishIHPRcpDetailsRoom(db);
                        new ModifikasiTable().createTableIhpDetailSewaKamar(db);
                        new ModifikasiTable().createTableIhpDetailSewaKamarExtend(db);
                        new ModifikasiTable().createTableIhpDetailDiskonSewaKamar(db);
                        new ModifikasiTable().createTableIhpDetailDiskonSewaKamarExtend(db);
                        new ModifikasiTable().melebarkanKolomPrintedIhpSulHistory(db);
                        new ModifikasiTable().melebarkanKolomPrintedIhpIvcHistory(db);
                        new ModifikasiTable().penambahanKolomEmailedIhpSul(db);
                        new ModifikasiTable().penambahanKolomEmailedSuccessIhpSul(db);
                        new ModifikasiTable().penambahanKolomEmailedAddressIhpSul(db);
                        new ModifikasiTable().penambahanKolomCheckoutIHPPromoRcp(db);
                        new ModifikasiTable().penambahanKolomCheckinIHPPromoRcp(db);
                    }
                });

                info = {
                    message: "If you see this message it means server is running",
                    ip_server: configServer.server_ip,
                    port_server: configServer.server_port,
                    db_server: configServer.db_server_ip,
                    ver: versi,
                    db_name: configServer.db_name,
                    errorMessege: "successed",
                    connected: cek_koneksi_internet,
                    img_qr_code: fileConfig
                };
                res.render("pages/index", {
                    info: info,
                    page: "setting/info"
                });
            }
        });

    });

    server.listen(configServer.server_port, configServer.server_ip, function () {

        logger.info('Server app listening on' +
            ' ip ' + configServer.server_ip +
            ' Database ' + configServer.db_name +
            ' port ' + configServer.server_port);

        //callback();

    });
    server.on('error', onError);
    server.on('listening', onListening);

    process.on('uncaughtException', function (err) {
        callback(err);
        console.log(`try to shutdown gracefully ${err.message}`);
    });

    function onError(error) {
        callback(error);
        var port = configServer.server_port;
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ?
            'Pipe ' + port :
            'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                //process.exit(1);
                break;
            case 'EADDRNOTAVAIL':
                console.error(bind + ' ip wrong machine');
                //process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                //process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
        console.log(`Lsitening on ${bind}`);
        bc.generate(dirConfig, fileConfig, function (error) {
            if (error) {
                logger.error(error);
            } else {
                callback();
            }
        });
    }

};
