var ResponseFormat = require('../util/response');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

exports.testPrinter = async function (req, res){
    try{
      var printerName = req.query.printer;
        let printer = new ThermalPrinter({
          type: PrinterTypes.EPSON,
          interface: 'printer:'+printerName,
          driver: require('@thiagoelg/node-printer')
        });
        
        await printer.raw(Buffer.from("Hello world"));
        await printer.raw(Buffer.from("Hello world"));
        await printer.raw(Buffer.from("Hello world"));

        console.log('tes koneksi ' + await printer.isPrinterConnected())
        res.send(new ResponseFormat(true, null, "beerhasil Print To " +printerName))
      } catch(error){
        console.log('Error')
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(false, null, error.message))
      }
}
