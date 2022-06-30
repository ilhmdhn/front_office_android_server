const { info } = require("pdfkit");
const { loggers } = require("winston");

const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

let printerDevice = new ThermalPrinter({
    type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
    interface: '\\.\ESDPRT001',                       // Printer interface
    characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false,                           // Removes special characters - default: false
    lineCharacter: "=",                                       // Set character for lines - default: "-"
    options:{                                                 // Additional options
      timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  });

class Printer{
    constructor() { }
    
    getStatusPrinter(){
        return new Promise((resolve) => {
            try{
                let status = printerDevice.isPrinterConnected();       // Check if printer is connected, return bool of status
                let execute = printerDevice.execute();                      // Executes all the commands. Returns success or throws error
                let raw = printerDevice.raw(Buffer.from("Hello world"));  
               resolve(status);
            } catch(error){
                console.log(error + ' ' + error.message)
            }
        })
    }
}

module.exports =  Printer;