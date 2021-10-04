//console.log(bufferImage); 
const QRCode = require('qrcode');
const fs = require('fs')
var CreateDirectoryFile = require('./create.directory.file');

class BarcodeGenerator {

    constructor(log) {
        this.logger = log;
        this.qrOption = {
            width: 500,
            type: 'image/png',
            quality: 0.3,
            margin: 1,
            color: {
                dark: "#010599FF", // Blue dots
                light: '#0000' // Transparent background
            }
        };
        this.createDirectoy = new CreateDirectoryFile();
    }

    setData(server_ip, server_port) {
        this.gambarBarcode = `{"server":"${server_ip}","port":"${server_port}","print":"${server_ip}"}`;
    }

    async deleteExistFile(pathfile) {
        try {
            fs.unlinkSync(pathfile);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }

    }

    generate(dir, file, callback) {
        this.logger.info(this.gambarBarcode);
        this.createDirectoy.createDirectoy(dir);
        QRCode.toFile(`${dir}/${file}`, this.gambarBarcode, this.qrOption, callback);
    }
}


module.exports = BarcodeGenerator;