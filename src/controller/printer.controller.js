var ResponseFormat = require('../util/response');
var toRupiah = require('@develoka/angka-rupiah-js');
var DBConnection = require('../util/db.pool');
var printService = require('../services/print.js');
const Report = require('../services/report');
var moment = require('moment');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const options = {
  encoding: "GB18030",
  width: 32 /* default */
}
var db;


exports.printKas = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  try {
    var tanggal = req.body.tanggal;
    var shift = req.body.shift;
    var chusr = req.body.chusr;
    var dataOutlet = await new printService().getOutletInfo(db);
    const device = new escpos.USB();
    const printer = new escpos.Printer(device, options);

    var start = moment(Date.now()).format('DD/MM/YYYY HH:mm');

    // Ngitung
    var totalKamar = 0
    var totalPenjualan = 0;
    var invoicePiutang = {
      totalKamar: 0, 
      totalFnB: 0,
      uangMuka: 0
    }

    var jamMulai = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
    var jamAkhir = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss").add(1, 'days');
    
    // pembayaran
    
    var getJumlahCash = await new Report().getJumlahCash(db, jamMulai, jamAkhir, shift)
    var getJumlahCreditCard = await new Report().getJumlahCreditCard(db, jamMulai, jamAkhir, shift)
    var getJumlahDebetCard = await new Report().getJumlahDebetCard(db, jamMulai, jamAkhir, shift)
    var getJumlahPiutang = await new Report().getJumlahPiutang(db, jamMulai, jamAkhir, shift)
    var getJumlahComplimentary = await new Report().getJumlahComplimentary(db, jamMulai, jamAkhir, shift)
    var getJumlahEmoney = await new Report().getJumlahEmoney(db, jamMulai, jamAkhir, shift);
    var getJumlahPoinMembership = await new Report().getJumlahPoinMembership(db, jamMulai, jamAkhir, shift);
    var getJumlahTransfer = await new Report().getJumlahTransfer(db, jamMulai, jamAkhir, shift)
    var getJumlahVoucher = await new Report().getJumlahVoucher(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMuka = await new Report().getJumlahUangMuka(db, jamMulai, jamAkhir, shift)
    var getJumlahSmartCard = await new Report().getJumlahSmartCard(db, jamMulai, jamAkhir, shift)
    
    
    // penjualan
    var getJumlahPendapatanLain = await new Report().getJumlahPendapatanLain(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMukaCheckinBelumBayar = await new Report().getJumlahUangMukaCheckinBelumBayar(db, jamMulai, jamAkhir, shift)
    var getJumlahReservasiSudahCheckinBelumBayar = await new Report().getJumlahReservasiSudahCheckinBelumBayar(db, jamMulai, jamAkhir, shift)
    var getJumlahReservasiBelumCheckin = await new Report().getJumlahReservasiBelumCheckin(db, jamMulai, jamAkhir, shift);
    var getJumlahReservasiSudahCheckin = await new Report().getJumlahReservasiSudahCheckin(db, jamMulai, jamAkhir, shift)
    var getJumlahInvoice = await new Report().getJumlahInvoice(db, jamMulai, jamAkhir, shift);
    var getJumlahInvoicePiutang = await new Report().getJumlahInvoicePiutang(db, jamMulai, jamAkhir,shift)

    var getJumlahUangMukaCheckinCash = await new Report().getJumlahUangMukaCheckinCash(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMukaCheckinTransfer = await new Report().getJumlahUangMukaCheckinTransfer(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMukaCheckinCreditCard = await new Report().getJumlahUangMukaCheckinCreditCard(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMukaCheckinDebetCard = await new Report().getJumlahUangMukaCheckinDebetCard(db, jamMulai, jamAkhir, shift)
    var getJumlahUangMukaReservasiBelumCheckinCash = await new Report().getJumlahUangMukaReservasiBelumCheckin(db, jamMulai, jamAkhir, shift, 0);
    var getJumlahUangMukaReservasiBelumCheckinKredit = await new Report().getJumlahUangMukaReservasiBelumCheckin(db, jamMulai, jamAkhir, shift, 1);
    var getJumlahUangMukaReservasiBelumCheckinDebit = await new Report().getJumlahUangMukaReservasiBelumCheckin(db, jamMulai, jamAkhir, shift, 2);
    var getJumlahUangMukaReservasiSudahCheckinCash = await new Report().getJumlahUangMukaReservasiSudahCheckin(db, jamMulai, jamAkhir, shift, 0);
    var getJumlahUangMukaReservasiSudahCheckinKredit = await new Report().getJumlahUangMukaReservasiSudahCheckin(db, jamMulai, jamAkhir, shift, 1);
    var getJumlahUangMukaReservasiSudahCheckinDebit = await new Report().getJumlahUangMukaReservasiSudahCheckin(db, jamMulai, jamAkhir, shift, 2);
    var getJumlahUangMukaReservasiSudahCheckinBelumBayarCash = await new Report().getJumlahUangMukaReservasiSudahCheckinBelumBayar(db, jamMulai, jamAkhir, shift, 0);
    var getJumlahUangMukaReservasiSudahCheckinBelumBayarKredit = await new Report().getJumlahUangMukaReservasiSudahCheckinBelumBayar(db, jamMulai, jamAkhir, shift, 1);
    var getJumlahUangMukaReservasiSudahCheckinBelumBayarDebit = await new Report().getJumlahUangMukaReservasiSudahCheckinBelumBayar(db, jamMulai, jamAkhir, shift, 2);
    var getJumlahUangPendapatanLainCash = await new Report().getJumlahUangPendapatanLain(db, jamMulai, jamAkhir, shift, 0);
    var getJumlahUangPendapatanLainKredit = await new Report().getJumlahUangPendapatanLain(db, jamMulai, jamAkhir, shift, 1);
    var getJumlahUangPendapatanLainDebit = await new Report().getJumlahUangPendapatanLain(db, jamMulai, jamAkhir, shift, 2);
    
    if(getJumlahInvoice != false){
      var invoice = "";
      var penjualan = 0;
        for (let i = 0; i < getJumlahInvoice.length; i++) {
          totalKamar = totalKamar + getJumlahInvoice[i].Total_Kamar;
          invoice = getJumlahInvoice[i].Transfer;
             if(getJumlahInvoice[i].Total_Penjualan == undefined){
          penjualan = 0;
        } else{
          penjualan = getJumlahInvoice[i].Total_Penjualan;
        }
        totalPenjualan = totalPenjualan + penjualan;
         
         if(invoice != ""){
           do{
            var transfer = await new Report().getTransferKamar(db, invoice);
            totalKamar = totalKamar + transfer[0].total_transfer;
            if(transfer[0].total_penjualan == undefined){
              penjualan = 0;
            } else{
              penjualan = transfer[0].total_penjualan;
            }
            totalPenjualan = totalPenjualan + penjualan;
            invoice = transfer[0].Transfer;
           } while(invoice != "")
          }
       }
      }

      if(getJumlahInvoicePiutang != false){
        var invoice = "";
        var penjualan = 0;
        for (let i = 0; i < getJumlahInvoicePiutang.length; i++) {
          invoicePiutang.uangMuka = invoicePiutang.uangMuka +  getJumlahInvoicePiutang[i].Uang_Muka;
          invoicePiutang.totalKamar = invoicePiutang.totalKamar + getJumlahInvoicePiutang[i].Total_Kamar;
        
        if(getJumlahInvoicePiutang[i].Total_Penjualan == undefined){
          penjualan = 0;
        } else{
          penjualan = getJumlahInvoicePiutang[i].Total_Penjualan;
        }
        invoicePiutang.totalPenjualan = invoicePiutang.totalPenjualan + penjualan;
        
        invoice = getJumlahInvoicePiutang[i].Transfer;
         if(invoice != ""){
           do{
            var transfer = await new Report().getTransferKamar(db, invoice);
            invoicePiutang.totalKamar = invoicePiutang.totalKamar + transfer[0].total_transfer;
            
            if(transfer[0].total_penjualan == undefined){
              penjualan = 0;
            } else{
              penjualan = transfer[0].total_penjualan;
            }
            invoicePiutang.totalPenjualan = invoicePiutang.totalPenjualan + penjualan;
            
            invoice = transfer[0].Transfer;
           } while(invoice != "")
          }
       }
      }


      // PEMBAYARAN
      var jumlah_pembayaran_transfer = ( getJumlahTransfer + 
                                    getJumlahUangMukaCheckinTransfer)
      var jumlah_pembayaran_poin_membership = getJumlahPoinMembership
      var jumlah_pembayaran_emoney = getJumlahEmoney
      var jumlah_pembayaran_cash = (getJumlahCash + 
                              getJumlahUangMukaCheckinCash + 
                              getJumlahUangMukaReservasiBelumCheckinCash + 
                              getJumlahUangMukaReservasiSudahCheckinCash + 
                              getJumlahUangMukaReservasiSudahCheckinBelumBayarCash +
                              getJumlahUangPendapatanLainCash)
      var jumlah_pembayaran_credit_card = (getJumlahCreditCard + 
                                      getJumlahUangMukaCheckinCreditCard + 
                                      getJumlahUangMukaReservasiBelumCheckinKredit + 
                                      getJumlahUangMukaReservasiSudahCheckinKredit + 
                                      getJumlahUangMukaReservasiSudahCheckinBelumBayarKredit +
                                      getJumlahUangPendapatanLainKredit)
      var jumlah_pembayaran_debet_card = ( getJumlahDebetCard + 
                                      getJumlahUangMukaCheckinDebetCard + 
                                      getJumlahUangMukaReservasiBelumCheckinDebit + 
                                      getJumlahUangMukaReservasiSudahCheckinDebit + 
                                      getJumlahUangMukaReservasiSudahCheckinBelumBayarDebit +
                                      getJumlahUangPendapatanLainDebit)
      var jumlah_pembayaran_voucher = getJumlahVoucher
      var jumlah_pembayaran_piutang = getJumlahPiutang
      var jumlah_pembayaran_complimentary = getJumlahComplimentary
      var jumlah_pembayaran_uang_muka = getJumlahUangMuka
      var jumlah_pembayaran_smart_card = getJumlahSmartCard
      var total_pembayaran = (getJumlahCash + 
                        getJumlahUangMukaCheckinCash + 
                        getJumlahUangMukaCheckinTransfer + 
                        getJumlahCreditCard + 
                        getJumlahUangMukaCheckinCreditCard +
                        getJumlahDebetCard + 
                        getJumlahUangMukaCheckinDebetCard +
                        getJumlahPiutang +
                        getJumlahComplimentary +
                        getJumlahEmoney +
                        getJumlahTransfer +
                        getJumlahVoucher +
                        getJumlahUangMuka +
                        getJumlahSmartCard + 
                        getJumlahPoinMembership+
                        getJumlahUangMukaReservasiBelumCheckinCash + 
                        getJumlahUangMukaReservasiSudahCheckinCash + 
                        getJumlahUangMukaReservasiSudahCheckinBelumBayarCash +
                        getJumlahUangMukaReservasiBelumCheckinKredit + 
                        getJumlahUangMukaReservasiSudahCheckinKredit + 
                        getJumlahUangMukaReservasiSudahCheckinBelumBayarKredit +
                        getJumlahUangMukaReservasiBelumCheckinDebit + 
                        getJumlahUangMukaReservasiSudahCheckinDebit + 
                        getJumlahUangMukaReservasiSudahCheckinBelumBayarDebit +
                        getJumlahUangPendapatanLainCash +
                        getJumlahUangPendapatanLainKredit +
                        getJumlahUangPendapatanLainDebit
                        )

      // PENJUALAN
      var jumlah_pendapatan_lain = getJumlahPendapatanLain
      
      var total_hutang_reservasi = (
                                getJumlahUangMukaCheckinBelumBayar + 
                                getJumlahReservasiSudahCheckinBelumBayar+ 
                                getJumlahReservasiBelumCheckin + 
                                getJumlahReservasiSudahCheckin)
      var jumlah_nilai_kamar = totalKamar
      var makanan_minuman = totalPenjualan
      var total_penjualan = (getJumlahPendapatanLain + 
                        getJumlahUangMukaCheckinBelumBayar + 
                        getJumlahReservasiBelumCheckin + 
                        getJumlahReservasiSudahCheckin + 
                        getJumlahReservasiSudahCheckinBelumBayar +
                        totalKamar + 
                        totalPenjualan)

    device.open(function (error) {
      if (error) {
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(true, null, error.message));
      } else {
        printer
          .font('a')
          .align('CT')
          .style('NORMAL')
          .size(0.5, 0.5)
          .text(dataOutlet.nama_outlet)
          .text(dataOutlet.alamat_outlet)
          .text(dataOutlet.kota)
          .text(dataOutlet.telepon)
          .newLine()
          .align('LT')
          .table(['Shift: ' + shift, '', tanggal])
          .tableCustom(
            [{
                text: "Kamar",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_nilai_kamar, {symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Makanan& Minuman",
                align: "LEFT"
              },
              {
                text: toRupiah(makanan_minuman,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "UM Reservasi",
                align: "LEFT"
              },
              {
                text: toRupiah(total_hutang_reservasi,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Pendapatan Lain",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pendapatan_lain,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
              text: '----------',
              align: "RIGHT"
            }], )
          .tableCustom(
            [{
                text: "Total",
                align: "LEFT"
              },
              {
                text: toRupiah(total_penjualan,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
              text: '==========',
              align: "RIGHT"
            }], )
          .newLine()
          .tableCustom(
            [{
                text: "Poin Membership",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_poin_membership,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "E-Money",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_emoney,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Transfer",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_transfer,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Tunai",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_cash,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Kartu Kredit",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_credit_card,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Kartu  Debet",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_debet_card,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Voucher",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_voucher,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Piutang",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_piutang,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
          .tableCustom(
            [{
                text: "Entertainment",
                align: "LEFT"
              },
              {
                text: toRupiah(jumlah_pembayaran_complimentary,{symbol: null, floatingPoint: 0}),
                align: "RIGHT"
              }
            ], )
            .tableCustom(
              [
                {
                  text: '------------',
                  align: "RIGHT"
                }
              ],)
              .tableCustom(
                [{
                    text: "Setoran",
                    align: "LEFT"
                  },
                  {
                    text: toRupiah(total_pembayaran,{symbol: null, floatingPoint: 0}),
                    align: "RIGHT"
                  }
                ], )
                .tableCustom(
                  [{
                      text: "Total",
                      align: "LEFT"
                    },
                    {
                      text: toRupiah(total_penjualan,{symbol: null, floatingPoint: 0}),
                      align: "RIGHT"
                    }
                  ], )
                  
              .tableCustom(
                [
                  {
                    text: '==============',
                    align: "RIGHT"
                  }
                ], )
              .newLine()
              .align('RT')
              .text(start + ' ' + chusr)
              .newLine()
              .newLine()
          .cut()
          .close();
        res.send(new ResponseFormat(true, null, "Cetak kas"))
      }
    });
  } catch (error) {
    console.log(error)
    console.log(error.message)
    res.send(new ResponseFormat(true, null, error.message));
  }
}

exports.printTagihan = async function (req, res) {
  try {

  } catch (error) {

  }
}

exports.printInvoice = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  try {
    var dataOutlet = await new printService().getOutletInfo(db);

    const device = new escpos.USB();
    const printer = new escpos.Printer(device, options);

    device.open(function (error) {
      if (error) {
        console.log(error)
        console.log(error.message)
      } else {
        printer
          .font('a')
          .align('CT')
          .style('NORMAL')
          .size(0.5, 0.5)
          .text(dataOutlet.nama_outlet)
          .text(dataOutlet.alamat_outlet)
          .text(dataOutlet.kota)
          .text(dataOutlet.telepon)
          .newLine()
          .style('B')
          .text('INVOICE')
          .newLine()
          .style('NORMAL')
          .align('LT')
          .tableCustom(
            [{
                text: "Ruangan",
                cols: 7,
                align: "LEFT"
              },
              {
                text: " : ",
                align: "LEFT"
              },
              {
                text: "BAMBANG WAHYU SAIFUDIN",
                align: "LEFT"
              }
            ], )
          .tableCustom(
            [{
                text: "Nama",
                cols: 7,
                align: "LEFT"
              },
              {
                text: " : ",
                align: "LEFT"
              },
              {
                text: "BAMBANG WAHYU SAIFUDIN",
                align: "LEFT"
              }
            ], )
          .tableCustom(
            [{
                text: "Tanggal",
                cols: 7,
                align: "LEFT"
              },
              {
                text: " : ",
                align: "LEFT"
              },
              {
                text: "BAMBANG WAHYU SAIFUDIN",
                align: "LEFT"
              }
            ], )
          .newLine()
          .drawLine()
          .newLine()
          .newLine()
          .cut()
          .close();
      }
    });

    res.send(new ResponseFormat(true, null, "berhasil Print To "))
  } catch (error) {

  }
}