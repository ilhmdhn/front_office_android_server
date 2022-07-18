var ResponseFormat = require('../util/response');
var toRupiah = require('@develoka/angka-rupiah-js');
var DBConnection = require('../util/db.pool');
var PrintService = require('../services/print');
var CashService = require('../services/cash.summary.js')
const Report = require('../services/report');
var moment = require('moment');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
var totalPayment = 0;
let options = {
  encoding: "GB18030",
  width: 40 /* default */
}
var db;


exports.printKas = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  try {
    var tanggal = req.body.tanggal;
    var shift = req.body.shift;
    var chusr = req.body.chusr;
    var dataOutlet = await new PrintService().getOutletInfo(db);
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
    var getJumlahInvoicePiutang = await new Report().getJumlahInvoicePiutang(db, jamMulai, jamAkhir, shift)

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

    if (getJumlahInvoice != false) {
      var invoice = "";
      var penjualan = 0;
      for (let i = 0; i < getJumlahInvoice.length; i++) {
        totalKamar = totalKamar + getJumlahInvoice[i].Total_Kamar;
        invoice = getJumlahInvoice[i].Transfer;
        if (getJumlahInvoice[i].Total_Penjualan == undefined) {
          penjualan = 0;
        } else {
          penjualan = getJumlahInvoice[i].Total_Penjualan;
        }
        totalPenjualan = totalPenjualan + penjualan;

        if (invoice != "") {
          do {
            var transfer = await new Report().getTransferKamar(db, invoice);
            totalKamar = totalKamar + transfer[0].total_transfer;
            if (transfer[0].total_penjualan == undefined) {
              penjualan = 0;
            } else {
              penjualan = transfer[0].total_penjualan;
            }
            totalPenjualan = totalPenjualan + penjualan;
            invoice = transfer[0].Transfer;
          } while (invoice != "")
        }
      }
    }

    if (getJumlahInvoicePiutang != false) {
      var invoice = "";
      var penjualan = 0;
      for (let i = 0; i < getJumlahInvoicePiutang.length; i++) {
        invoicePiutang.uangMuka = invoicePiutang.uangMuka + getJumlahInvoicePiutang[i].Uang_Muka;
        invoicePiutang.totalKamar = invoicePiutang.totalKamar + getJumlahInvoicePiutang[i].Total_Kamar;

        if (getJumlahInvoicePiutang[i].Total_Penjualan == undefined) {
          penjualan = 0;
        } else {
          penjualan = getJumlahInvoicePiutang[i].Total_Penjualan;
        }
        invoicePiutang.totalPenjualan = invoicePiutang.totalPenjualan + penjualan;

        invoice = getJumlahInvoicePiutang[i].Transfer;
        if (invoice != "") {
          do {
            var transfer = await new Report().getTransferKamar(db, invoice);
            invoicePiutang.totalKamar = invoicePiutang.totalKamar + transfer[0].total_transfer;

            if (transfer[0].total_penjualan == undefined) {
              penjualan = 0;
            } else {
              penjualan = transfer[0].total_penjualan;
            }
            invoicePiutang.totalPenjualan = invoicePiutang.totalPenjualan + penjualan;

            invoice = transfer[0].Transfer;
          } while (invoice != "")
        }
      }
    }


    // PEMBAYARAN
    var jumlah_pembayaran_transfer = (getJumlahTransfer +
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
    var jumlah_pembayaran_debet_card = (getJumlahDebetCard +
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
      getJumlahPoinMembership +
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
      getJumlahReservasiSudahCheckinBelumBayar +
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

      var jumlahUang = await new CashService().sumCash(db,jamMulai, shift)

      var selisih = jumlahUang - jumlah_pembayaran_cash;
      console.log('selisih  '+selisih)
    if(selisih > 1000 || selisih < 0){
      res.send(new ResponseFormat(false, null, "Cek pecahan uang"))
      return
    }

    device.open(function (error) {
      if (error) {
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(true, null, error.message));
      } else {
        printer
          .font('b')
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
            [{text: "Kamar", align: "LEFT"},
            {text: toRupiah(jumlah_nilai_kamar, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ],)
          .tableCustom(
            [{text: "Makanan& Minuman", align: "LEFT"},
            {text: toRupiah(makanan_minuman, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ],)
          .tableCustom(
            [
              {text: "UM Reservasi",align: "LEFT"},
              {text: toRupiah(total_hutang_reservasi, {symbol: null,floatingPoint: 0}), align: "RIGHT"}
            ],)
          .tableCustom([
            {text: "Pendapatan Lain", align: "LEFT"},
            {text: toRupiah(jumlah_pendapatan_lain, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ],)
          .tableCustom(
            [{text: '----------', align: "RIGHT"}],)
          .tableCustom([
            {text: "Total", align: "LEFT"},
            {text: toRupiah(total_penjualan, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ],)
          .tableCustom([
            {text: '==========', align: "RIGHT"}
          ])
          .newLine()
          .tableCustom([
            {text: "Poin Membership", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_poin_membership, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
          ])
          .tableCustom([
            {text: "E-Money", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_emoney, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Transfer", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_transfer, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Tunai", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_cash, {symbol: null, floatingPoint: 0}),align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Kartu Kredit", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_credit_card, {symbol: null, floatingPoint: 0}),align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Kartu  Debet", align: "LEFT" },
            {text: toRupiah(jumlah_pembayaran_debet_card, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Voucher", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_voucher, {symbol: null, floatingPoint: 0}), align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Piutang", align: "LEFT"},
              {text: toRupiah(jumlah_pembayaran_piutang, {symbol: null, floatingPoint: 0}),align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Entertainment", align: "LEFT"},
            {text: toRupiah(jumlah_pembayaran_complimentary, {symbol: null,  floatingPoint: 0}),align: "RIGHT"}
            ])
          .tableCustom([
            {text: '------------', align: "RIGHT"}
          ])
          .tableCustom([
            {text: "Setoran", align: "LEFT"},
            {text: toRupiah(total_pembayaran, {symbol: null, floatingPoint: 0}),align: "RIGHT"}
            ])
          .tableCustom([
            {text: "Total", align: "LEFT"},
            {text: toRupiah(total_penjualan, {symbol: null, floatingPoint: 0}),align: "RIGHT"}
            ])

          .tableCustom([
            {text: '==============', align: "RIGHT"}
          ])
          .newLine()
          .align('RT')
          .text(start + ' ' + chusr)
          .newLine()
          .newLine()
          .cut()
          .close();
        res.send(new ResponseFormat(true, null, "Berhasil Cetak"))
      }
    });
  } catch (error) {
    console.log(error)
    console.log(error.message)
    res.send(new ResponseFormat(false, null, "Gagal Cetak " + error.message));
  }
}

exports.printTagihan = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  try {
    var chusr = req.body.chusr;
    var rcp = req.body.rcp;
    const device = new escpos.USB();
    const printer = new escpos.Printer(device, options);

    var ivc = await new PrintService().getInvoiceCode(db, rcp);
    var start = moment(Date.now()).format('DD/MM/YYYY HH:mm');
    var dataOutlet = await new PrintService().getOutletInfo(db);
    var dataInvoice = await new PrintService().getBillInvoice(db, ivc);
    var dataRoom = await new PrintService().getRoomInfo(db, ivc);
    var orderData = await new PrintService().getOrder(db, rcp);
    var cancelOrderData = await new PrintService().getCancelOrder(db, rcp);
    var promoOrder = await new PrintService().getPromoOrder(db, rcp);

    device.open(async function (error) {
      if (error) {
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(true, null, error.message));
      } else {
        printer
          .font('B')
          .align('CT')
          .style('NORMAL')
          .size(0.5, 0.5)
          .text(dataOutlet.nama_outlet)
          .text(dataOutlet.alamat_outlet)
          .text(dataOutlet.kota)
          .text(dataOutlet.telepon)
          .newLine()
          .style('B')
          .text('Tagihan')
          .newLine()
          .style('NORMAL')
          .align('LT')
          .tableCustom([
            {text: 'Ruangan', cols: 7, align: 'LEFT'},
            {text: ':', cols: 2, align: 'LEFT'},
            {text: dataRoom.ruangan, cols: 32, align: 'LEFT'}
          ])
          .tableCustom([
            {text: 'Nama', cols: 7, align: 'LEFT'},
            {text: ':', cols: 2, align: 'LEFT'},
            {text: dataRoom.nama, cols: 32, align: 'LEFT'}
          ])
          .tableCustom([
            {text: 'Tanggal', cols: 7, align: 'LEFT'},
            {text: ':', cols : 2, align: 'LEFT'},
            {text: dataRoom.tanggal,cols: 32,align: 'LEFT'}
          ])
          .newLine()
          .text('Sewa Ruangan')
          .tableCustom([
            {text: dataRoom.Checkin + ' - ' + dataRoom.Checkout,align: 'LEFT'},
            {text: toRupiah(dataInvoice.sewa_ruangan, {symbol: null,floatingPoint: 0}),align: 'RIGHT'}
          ])

          .tableCustom([
            {text: 'Promo', align: 'LEFT'},
            {text: toRupiah(dataInvoice.promo, {symbol: null,floatingPoint: 0}), align: 'RIGHT'},
          ])

          .newLine()

          if(cancelOrderData.length > 0 ){
            for (let i = 0; i<cancelOrderData.length;  i++){
              for(let j = 0; j<orderData.length;  j++){
                if(cancelOrderData[i].nama_item == orderData[j].nama_item){
                    orderData[j].jumlah = orderData[j].jumlah - cancelOrderData[i].jumlah;
                    orderData[j].total = orderData[j].total - cancelOrderData[i].total;
                }
              }
            }
          }

          if(orderData.length > 0){
            printer
            .text('Rincian Penjualan')
            for(var i = 0; i<orderData.length; i++){
              if(orderData[i].jumlah>0){
                printer
                .tableCustom([
                  {text:orderData[i].nama_item, align:"LEFT"},
                ])
                .tableCustom([
                  {text: `   ${orderData[i].jumlah} x ${toRupiah(orderData[i].harga, {symbol: null, floatingPoint: 0})}`, align:"LEFT"},
                  {text:toRupiah(orderData[i].total, {symbol: null, floatingPoint: 0}), align:"RIGHT"}
                ])
              }
            }
          }

          // if(cancelOrderData.length > 0){
          //   for(var i = 0; i<cancelOrderData.length; i++){
          //     printer
          //     .tableCustom([
          //       {text:'RETURN '+cancelOrderData[i].nama_item, align:"LEFT"},
          //     ])
          //     .tableCustom([
          //       {text: `   ${cancelOrderData[i].jumlah} x ${toRupiah(cancelOrderData[i].harga, {symbol: null, floatingPoint: 0})}`, align:"LEFT"},
          //       {text:toRupiah(cancelOrderData[i].total, {symbol: null, floatingPoint: 0}), align:"RIGHT"}
          //     ])
          //   }
          // }

          if(promoOrder != false){
            printer
            .newLine()
            .tableCustom([
              {text: promoOrder.promo, align: "LEFT"},
              //{text: toRupiah(promoOrder.total_promo, {symbol: null,floatingPoint: 0}),align: 'RIGHT'}
            ])
          }

          printer
          .drawLine()
          .tableCustom([
            {text: 'Jumlah Ruangan',align: "LEFT"},
            {text: toRupiah(dataInvoice.jumlah_ruangan, {symbol: null,floatingPoint: 0}), align: 'RIGHT'}
          ])
          .tableCustom([
            {text: 'Jumlah Penjualan', align: "LEFT"},
            {text: toRupiah(dataInvoice.jumlah_penjualan, {symbol: null,floatingPoint: 0}), align: 'RIGHT'}
          ])

          .drawLine()
          
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
          ])
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah Service', cols: 15,align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah_service, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
          ])
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah Pajak', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah_pajak, {symbol: null,  floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])

        if (dataInvoice.overpax > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Overpax', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.overpax, {symbol: null, floatingPoint: 0}), cols: 11,align: 'RIGHT'}
          ])
        }

        if (dataInvoice.diskon_kamar > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Diskon Kamar', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.diskon_kamar, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.surcharge_kamar > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Surcharge Kamar', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.surcharge_kamar, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.diskon_penjualan > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Diskon Penjualan', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.diskon_penjualan, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.voucher > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Voucher', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.voucher, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.charge_lain > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Charge Lain', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.charge_lain, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

      printer
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: '------------', align: 'RIGHT'}
          ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Jumlah Total',cols: 15,align: "RIGHT"},
          {text: toRupiah(dataInvoice.jumlah_total, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
        ])
        .newLine()
        var jumlah_bersih = dataInvoice.jumlah_bersih;
        var isTransfer = dataInvoice.transfer
        if(isTransfer != ''){
          printer
              .tableCustom([
                {text: '', align: "LEFT"},
                {text: 'Transfer Ruangan', cols:16, align:"LEFT"},
                {text: '',cols:11, align:"RIGHT"}
                ])
          do{
            var transferData = await new PrintService().getTransfer(db, isTransfer);
            isTransfer = transferData.transfer
            printer
              .tableCustom([
                {text: '', align: "LEFT"},
                {text: '   Room ' + transferData.kamar, cols:15, align:"RIGHT"},
                {text: toRupiah(transferData.total, {symbol: null,floatingPoint: 0}),cols:11, align:"RIGHT"}
              ])
              jumlah_bersih = jumlah_bersih + transferData.total;
          } while(isTransfer != '')
        }

        printer
        .newLine()
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Uang Muka', cols: 15, align: "RIGHT"},
          {text: toRupiah(dataInvoice.uang_muka, {symbol: null, floatingPoint: 0}), cols: 11,align: 'RIGHT'}
        ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: '------------', align: 'RIGHT'}
          ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Jumlah Bersih', cols: 15, align: "RIGHT"},
          {text: toRupiah(jumlah_bersih, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
        ])
        .newLine()
        .size(1,0.5)
        .align('LT')
        .text(toRupiah(jumlah_bersih, {
          symbol: 'Rp',
          floatingPoint: 0
        }))
        .newLine()
        .size(0.5, 0.5)
        .font('B')
        .tableCustom([
          {text:start + ' ' + chusr, align: "RIGHT"}
        ])
          .cut()
          .close();
        res.send(new ResponseFormat(true, null, "Berhasil Cetak Bill " +dataRoom.ruangan))
        await new PrintService().updateStatusPrintedIvc(db, rcp, "1");
      }
    });
  } catch (error) {
    console.log(error)
    console.log(error.message)
    res.send(new ResponseFormat(false, null, error.message));
  }
}

exports.printInvoice = async function (req, res) {
    try {
    db = await new DBConnection().getPoolConnection();
    var rcp = req.body.rcp;
    const device = new escpos.USB();
    const printer = new escpos.Printer(device, options);
    totalPayment = 0;
    var ivc = await new PrintService().getInvoiceCode(db, rcp);
    var start = moment(Date.now()).format('DD/MM/YYYY HH:mm');
    var dataOutlet = await new PrintService().getOutletInfo(db);
    var dataInvoice = await new PrintService().getInvoice(db, ivc);
    var dataRoom = await new PrintService().getRoomInfo(db, ivc);
    var orderData = await new PrintService().getOrder(db, rcp);
    var cancelOrderData = await new PrintService().getCancelOrder(db, rcp);
    var promoOrder = await new PrintService().getPromoOrder(db, rcp);
    var payment = await new PrintService().getSud(db, rcp);

    device.open(async function (error) {
      if (error) {
        console.log(error)
        console.log(error.message)
        res.send(new ResponseFormat(true, null, error.message));
      } else {
        printer
          .font('B')
          .align('CT')
          .style('NORMAL')
          .size(0.5, 0.5)
          .text(dataOutlet.nama_outlet)
          .text(dataOutlet.alamat_outlet)
          .text(dataOutlet.kota)
          .text(dataOutlet.telepon)
          .newLine()
          .style('B')
          .text('Invoice')
          .newLine()
          .style('NORMAL')
          .align('LT')
          .tableCustom([
            {text: 'Ruangan', cols: 7, align: 'LEFT'},
            {text: ':', cols: 2, align: 'LEFT'},
            {text: dataRoom.ruangan, cols: 32, align: 'LEFT'}
          ])
          .tableCustom([
            {text: 'Nama', cols: 7, align: 'LEFT'},
            {text: ':', cols: 2, align: 'LEFT'},
            {text: dataRoom.nama, cols: 32, align: 'LEFT'}
          ])
          .tableCustom([
            {text: 'Tanggal', cols: 7, align: 'LEFT'},
            {text: ':', cols : 2, align: 'LEFT'},
            {text: dataRoom.tanggal,cols: 32,align: 'LEFT'}
          ])
          .newLine()
          .text('Sewa Ruangan')
          .tableCustom([
            {text: dataRoom.Checkin + ' - ' + dataRoom.Checkout,align: 'LEFT'},
            {text: toRupiah(dataInvoice.sewa_ruangan, {symbol: null,floatingPoint: 0}),align: 'RIGHT'}
          ])

          .tableCustom([
            {text: 'Promo', align: 'LEFT'},
            {text: toRupiah(dataInvoice.promo, {symbol: null,floatingPoint: 0}), align: 'RIGHT'},
          ])

          .newLine()

          if(cancelOrderData.length > 0 ){
            for (let i = 0; i<cancelOrderData.length;  i++){
              for(let j = 0; j<orderData.length;  j++){
                if(cancelOrderData[i].nama_item == orderData[j].nama_item){
                    orderData[j].jumlah = orderData[j].jumlah - cancelOrderData[i].jumlah;
                    orderData[j].total = orderData[j].total - cancelOrderData[i].total;
                }
              }
            }
          }

          if(orderData.length > 0){
            printer
            .text('Rincian Penjualan')
            for(var i = 0; i<orderData.length; i++){
              if(orderData[i].jumlah>0){
                printer
                .tableCustom([
                  {text:orderData[i].nama_item, align:"LEFT"},
                ])
                .tableCustom([
                  {text: `   ${orderData[i].jumlah} x ${toRupiah(orderData[i].harga, {symbol: null, floatingPoint: 0})}`, align:"LEFT"},
                  {text:toRupiah(orderData[i].total, {symbol: null, floatingPoint: 0}), align:"RIGHT"}
                ])
              }
            }
          }

          // if(cancelOrderData.length > 0){
          //   for(var i = 0; i<cancelOrderData.length; i++){
          //     printer
          //     .tableCustom([
          //       {text:'RETURN '+cancelOrderData[i].nama_item, align:"LEFT"},
          //     ])
          //     .tableCustom([
          //       {text: `   ${cancelOrderData[i].jumlah} x ${toRupiah(cancelOrderData[i].harga, {symbol: null, floatingPoint: 0})}`, align:"LEFT"},
          //       {text:toRupiah(cancelOrderData[i].total, {symbol: null, floatingPoint: 0}), align:"RIGHT"}
          //     ])
          //   }
          // }

          if(promoOrder != false){
            printer
            .newLine()
            .tableCustom([
              {text: promoOrder.promo, align: "LEFT"},
              //{text: toRupiah(promoOrder.total_promo, {symbol: null,floatingPoint: 0}),align: 'RIGHT'}
            ])
          }

          printer
          .drawLine()
          .tableCustom([
            {text: 'Jumlah Ruangan',align: "LEFT"},
            {text: toRupiah(dataInvoice.jumlah_ruangan, {symbol: null,floatingPoint: 0}), align: 'RIGHT'}
          ])
          .tableCustom([
            {text: 'Jumlah Penjualan', align: "LEFT"},
            {text: toRupiah(dataInvoice.jumlah_penjualan, {symbol: null,floatingPoint: 0}), align: 'RIGHT'}
          ])

          .drawLine()
          
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
          ])
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah Service', cols: 15,align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah_service, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
          ])
          .tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Jumlah Pajak', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.jumlah_pajak, {symbol: null,  floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])

        if (dataInvoice.overpax > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Overpax', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.overpax, {symbol: null, floatingPoint: 0}), cols: 11,align: 'RIGHT'}
          ])
        }

        if (dataInvoice.diskon_kamar > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Diskon Kamar', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.diskon_kamar, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.surcharge_kamar > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Surcharge Kamar', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.surcharge_kamar, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.diskon_penjualan > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Diskon Penjualan', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.diskon_penjualan, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.voucher > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Voucher', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.voucher, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

        if (dataInvoice.charge_lain > 0) {
          printer.tableCustom([
            {text: '', align: "LEFT"},
            {text: 'Charge Lain', cols: 15, align: "RIGHT"},
            {text: toRupiah(dataInvoice.charge_lain, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
          ])
        }

      printer
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: '------------', align: 'RIGHT'}
          ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Jumlah Total',cols: 15,align: "RIGHT"},
          {text: toRupiah(dataInvoice.jumlah_total, {symbol: null,floatingPoint: 0}),cols: 11,align: 'RIGHT'}
        ])
        .newLine()
        var jumlah_bersih = dataInvoice.jumlah_bersih;
        var isTransfer = dataInvoice.transfer
        if(isTransfer != ''){
          printer
              .tableCustom([
                {text: '', align: "LEFT"},
                {text: 'Transfer Ruangan', cols:16, align:"LEFT"},
                {text: '',cols:11, align:"RIGHT"}
                ])
          do{
            var transferData = await new PrintService().getTransfer(db, isTransfer);
            isTransfer = transferData.transfer
            printer
              .tableCustom([
                {text: '', align: "LEFT"},
                {text: '   Room ' + transferData.kamar, cols:15, align:"RIGHT"},
                {text: toRupiah(transferData.total, {symbol: null,floatingPoint: 0}),cols:11, align:"RIGHT"}
              ])
              jumlah_bersih = jumlah_bersih + transferData.total;
          } while(isTransfer != '')
        }

        printer
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: '------------', align: 'RIGHT'}
          ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Jumlah Bersih', cols: 15, align: "RIGHT"},
          {text: toRupiah(jumlah_bersih, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
        ])
        if(payment.length>0){
          for(let i =0;  i<payment.length; i++){
            printer
            .tableCustom([
              {text: '', align: "LEFT"},
              {text: payment[i].nama_payment, cols: 15, align: "RIGHT"},
              {text: toRupiah(payment[i].total, {symbol: null, floatingPoint: 0}), cols: 11, align: 'RIGHT'}
            ])
            totalPayment = totalPayment + payment[i].total;
          }
        }
        console.log('uangnya ' + totalPayment + ' ' + jumlah_bersih)
        printer
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: '------------', align: 'RIGHT'}
          ])
        .tableCustom([
          {text: '', align: "LEFT"},
          {text: 'Kembali', cols: 15, align: "RIGHT"},
          {text: toRupiah(totalPayment - jumlah_bersih, {symbol:null, floatingPoint:0}), cols: 11, align: 'RIGHT'}
          ])
        .newLine()
          .cut()
          .close();
        res.send(new ResponseFormat(true, null, "Berhasil Cetak Invoice " +dataRoom.ruangan))
      }
    });
  } catch (error) {
    sql.close();
    console.log(error + '\n' + error.message + '\n error get data payment \n' + isiQuery);
    logger.error(error + '\n' + error.message + '\n error get data payment \n' + isiQuery);
    res.send(new ResponseFormat(false, null, "Gagal Invoice " +dataRoom.ruangan))
  }
}

exports.cekPrintStatus = async function(req, res){

    try{
      db = await new DBConnection().getPoolConnection();
      var rcp = req.query.rcp;

      var printStatus = await new PrintService().getPrintStatus(db, rcp);
      if(printStatus != false){
        res.send(new ResponseFormat(true, printStatus));
      } else{
        res.send(new ResponseFormat(false, null, "Gagal cek print status"))
      }

    } catch(error){
      sql.close();
      console.log(error + '\n' + error.message + '\n error get data print \n' + isiQuery);
      logger.error(error + '\n' + error.message + '\n error get data print \n' + isiQuery);
      res.send(new ResponseFormat(false, null, "Gagal  cek print status "))
    }
}