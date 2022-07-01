var ResponseFormat = require('../util/response');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const device  = new escpos.USB();

exports.testPrinter = async function (req, res){
    try{

      // const options = { encoding: "GB18030" /* default */ }
 
      // const printer = new escpos.Printer(device, options); 
      // device.open(function(error){
      //   if(error){
      //     console.log(error)
      //     console.log(error.message)
      //   } else{
      //     printer
      //     .font('a')
      //     .align('ct')
      //     .style('NORMAL')
      //     .size(1,1)
      //     .text('BLACKHOLE')
      //     .text('Lenmarc Lt.3 A11')
      //     .text('SURABAYA')
      //     .text('031 1163151')
      //     .newLine()
      //     .style('B')
      //     .text('TAGIHAN')
      //     .newLine()
      //     .newLine()
      //     .newLine()
      //     .newLine()
      //     .table(
      //       ["Kiri", "", "Kanan"]
      //     )
      //     .tableCustom(
      //       [
      //         { text:"Kiri", align:"LEFT"},
      //         { text:"Kanan", align:"RIGHT"}
      //       ],)
      //       .tableCustom(
      //         [
      //           { text:"Left", align:"LEFT", width:0.33, style: 'B' },
      //           { text:"Center", align:"CENTER", width:0.33},
      //           { text:"Right", align:"RIGHT", width:0.33 }
      //         ],
      //         { encoding: 'cp857', size: [1, 1] } // Optional
      //       )
      //     .text('telo')
      //     .newLine()
      //     .newLine()
      //     .newLine()
      //     .newLine()
      //     .cut()
      //     .close();
      //   }
      // });

        res.send(new ResponseFormat(true, null, "berhasil Print To "))
      } catch(error){
        console.log('Error')
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(false, null, error.message))
      }
}
