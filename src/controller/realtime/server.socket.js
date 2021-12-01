var net = require('net');
// creates the server socket tcp
var tcp_ip_server = net.createServer();
const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');
var pesan;
var portUdp;
var panjang_pesan;
var ip_address;
var a;
var pesan_tertunda = "";
var listAllClient = [];

class Socket {

    constructor(logger) {
        this.logger = logger;
        this.startServerSockeTcp(logger);
        this.startServerSocketUdp(logger);
    }

    startServerSockeTcp(logger) {

        // emitted when new client connects
        tcp_ip_server.on('connection', function (socket) {

            console.log('Buffer size : ' + socket.bufferSize);
            var rport = socket.remotePort;
            var raddr = socket.remoteAddress;
            var rfamily = socket.remoteFamily;

            //logger.info('Client Remote socket tcp is listening at port' + rport);
            logger.info('server_socket_tcp start Client Remote ip :' + raddr);
            logger.info('server_socket_tcp start Client Remote ip :' + socket.remoteAddress.substring(7, 20));
            listAllClient.push(socket.remoteAddress.substring(7, 20));
            //logger.info('Client Remote socket tcp is IP4/IP6 : ' + rfamily);
            //var no_of_connections =  server.getConnections(); // sychronous version
            tcp_ip_server.getConnections(function (error, count) {
                logger.info('server_socket_tcp number of concurrent connections to this server : ' + count);
                if (count > 0) {
                    if (pesan_tertunda !== "") {
                        socket.write(pesan_tertunda);
                        pesan_tertunda = "";
                    }
                }
            });

            socket.setEncoding('utf8');

            socket.on('data', function (data) {
                var bread = socket.bytesRead;
                var bwrite = socket.bytesWritten;
                logger.info('server_socket_tcp  Bytes read : ' + bread);
                logger.info('server_socket_tcp  Bytes written : ' + bwrite);
                logger.info('server_socket_tcp client : ' + socket._peername.address.substring(7, 20) + ":" + socket._peername.port);
                logger.info('server_socket_tcp Data sent to server socket_tcp : ' + data);
                //echo data
                var is_kernel_buffer_full = socket.write("Server: " + data);
                if (is_kernel_buffer_full) {
                    console.log('server_socket_tcp Data was flushed successfully from kernel buffer i.e written successfully!');
                    logger.info('server_socket_tcp Data was flushed successfully from kernel buffer i.e written successfully!');
                } else {
                    socket.pause();
                }

            });

            socket.on('drain', function () {
                console.log('server_socket_tcp on drain write buffer is empty now .. u can resume the writable stream');
                socket.resume();
            });

            socket.on('error', function (error) {
                console.log('server_socket_tcp on Error : ' + error);
                logger.info('server_socket_tcp on Error : ' + error);
            });

            socket.on('timeout', function () {
                socket.end('Timed out!');
                logger.info('server_socket_tcp  socket.on Socket timed out !');
                // can call socket.destroy() here too.
            });

            // koneksi di disconnect oleh client
            socket.on('end', function (data) {
                logger.info('server_socket_tcp socket.on end ended by client data '+ data);
                console.log('server_socket_tcp socket.on end ended by client data  '+ data);
            });

            // koneksi client terputus
            socket.on('close', function (error) {
                var bread = socket.bytesRead;
                var bwrite = socket.bytesWritten;
                //logger.info('Bytes read : ' + bread);
                //logger.info('Bytes written : ' + bwrite);
                logger.info('server_socket_tcp closed client : ' + socket.remoteAddress +' error '+error);
                logger.info('server_socket_tcp closed client :' + socket.remoteAddress.substring(7, 20)+' error '+error);
                var i = listAllClient.indexOf(socket.remoteAddress.substring(7, 20));
                listAllClient.splice(i, 1);
                if (error) {
                    console.log('server_socket_tcp was closed coz of transmission error');
                    logger.info('server_socket_tcp was closed coz of transmission error');
                }
            });

        });

        //emitted when server closes ...not emitted until all connections closes.
        tcp_ip_server.on('close', function (data) {
            console.log('server_socket_tcp closed ! '+data);
        });

        // emits when any error occurs -> calls closed event immediately after this.
        tcp_ip_server.on('error', function (error) {
            console.log('server_socket_tcp on Error: ' + error);
            logger.info('server_socket_tcp on Error: ' + error);
        });

        //emits when server is bound with server.listen
        tcp_ip_server.on('listening', function () {
            logger.info('server_socket_tcp is on listening at port 7081');
        });

        tcp_ip_server.maxConnections = 1000;

        //static port allocation
        tcp_ip_server.listen(7081);

        var islistening = tcp_ip_server.listening;

        if (islistening) {
            logger.info('server_socket_tcp is listening at port 7081');
        } else {
            logger.info('server_socket_tcp is not listening');
        }

    }

    startServerSocketUdp(logger) {

        var net_client = require('net');
        var client = net_client.Socket();


        udp_server.on('error', (err) => {
            //console.log(`udp_server error:\n${err.stack}`);
            logger.info(`udp_server error:\n${err.stack}`);
            udp_server.close();
        });

        udp_server.on('close', function () {
            //console.log('udp_server on close');
            logger.info('udp_server on close');
        });

        udp_server.on('message', (msg, rinfo) => {
            //console.log(`udp_server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            logger.info(`udp_server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            pesan = msg.toString();

            if (listAllClient.length > 0) {
                for (a = 0; a < listAllClient.length; a++) {
                    var client_fo = dgram.createSocket('udp4');
                    portUdp = parseInt(7072);
                    ip_address = listAllClient[a];
                    panjang_pesan = pesan.length;
                    panjang_pesan = parseInt(panjang_pesan);
                    logger.info("udp_server send Sinyal " + pesan + " to pos lorong android " + listAllClient[a]);
                    client_fo.send(pesan, 0, panjang_pesan, portUdp, ip_address, function (error, bytes) {
                        if (error) {
                            client.close();
                        } else {
                            console.log('Data sent !!!');
                        }
                    });
                }

                /*client.connect(7081, '192.168.43.164', function () {
                    console.log("Client Connected!\n");
                    client.emit('adduser', "UserName");
                });

                client.on('data', function (data) {
                    console.log("" + data);
                });

                client.on('close', function () {
                    console.log('Connection closed');
                }); */

            }
            else {
                logger.info("udp_server no Client Connected Send Sinyal " + pesan + " to pos lorong android");
                pesan_tertunda = pesan_tertunda + " " + pesan;
            }
        });

        udp_server.on('listening', () => {
            const address = udp_server.address();
            //console.log(`udp_server listening ${address.address}:${address.port}`);
            logger.info(`udp_server listening ${address.address}:${address.port}`);
        });

        udp_server.bind(7082);
        // Prints: server listening 0.0.0.0:7052
    }


}

module.exports = Socket;