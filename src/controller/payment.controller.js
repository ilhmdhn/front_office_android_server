var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var CheckinProses = require('../services/checkin.proses.js');
var RoomService = require('../services/room.service.js');
var TarifKamar = require('../services/tarif.kamar.js');
var IpAddressService = require('../services/ip.address.service.js');

var nodemailer = require("nodemailer");
var convertRupiah = require('../util/format-rupiah.js');
var logger;
var fs = require('fs');
var db;
var dgram = require('dgram');
var PDFDocument = require('pdfkit');
var fontpath = process.cwd() + "\\images\\font-courier\\courier_normal_regular.ttf";
var fontpathBold = process.cwd() + '\\images\\font-courier\\courier_bold.ttf';
var fontpathMedium = process.cwd() + '\\images\font-courier\\courier_medium.otf';


var warna = '##0000FF';
var path2 = require('path');
var namaSendFile = "";
var fullPathSendFile = "";
//var _="&emsp;";
var _ = "&nbsp;";
var s = " ";
var tgl_pembayaran = "";
var nomor_pembayaran = "";
var hasil_order_penjualan;
var hasil_nilai_invoice;
var pesan;
var ip_address;
var port;
var panjang_pesan;

//variable model
var InvoiceModel = require('./../model/IHP_InvoiceModel');
var SummaryModel = require('./../model/IHP_SummaryModel');
var RoomModel = require('./../model/IHP_RoomModel');
var UtilitiesModel = require('./../model/UtilitiesModel');
var MemberModel = require('./../model/IHP_MemberModel');
var UMNonCashModel = require('./../model/IHP_UangMukaNonCashModel');
var AddRewardModel = require('./../model/IHP_AddRewardModel');

//Variable table
var tableRcp = require('./../model/variabledb/IHP_Rcp');
var tableSul = require('./../model/variabledb/IHP_Sul');
var tableSud = require('./../model/variabledb/IHP_Sud');
var tableSod = require('./../model/variabledb/IHP_Sod');
var tableSol = require('./../model/variabledb/IHP_Sol');
var tableConfig3 = require('./../model/variabledb/IHP_Config3');
const formatRupiah = require('../util/format-rupiah.js');

exports.submitPrint = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _procSubmitPrint(req, res);
};

async function _procSubmitPrint(req, res) {
  //pesan print Slip Invoice Pos Lorong
  var client_pos = dgram.createSocket('udp4');
  pesan = "PRINT_SUMMARY_POINT_OF_SALES_LORONG";
  ip_address = req.config.ip_address_pos;
  port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
  if ((ip_address !== false) && (port !== false)) {
    port = port.recordset[0].server_udp_port;
    port = parseInt(port);
    panjang_pesan = pesan.length;
    panjang_pesan = parseInt(panjang_pesan);
    logger.info("Send Sinyal PRINT_SUMMARY_POINT_OF_SALES_LORONG to POINT OF SALES " + ip_address);
    client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
      if (error) {
        client.close();
        dataResponse = new ResponseFormat(false, error.message);
        res.send(dataResponse);
      } else {
        client_pos.close();
        console.log('Data sent !!!');
        formResponseData = {
          room: room,
          Kamar: room
        };
        dataResponse = new ResponseFormat(true, formResponseData);
        res.send(dataResponse);

      }
    });
  }
}

//Fungsi untuk cek room
function checkRoom(room) {
  var ErrorMsg = "";

  if (room == "") ErrorMsg = "Kamar tidak terdaftar";
  else if (room.Reception == "" || room.Reception == "NULL") ErrorMsg = "Tidak bisa melakukan Pembayaran, penjualan belum ada";

  return ErrorMsg;
}

exports.submitPayment = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _procSubmitPayment(req, res);
};

async function _procSubmitPayment(req, res) {
  db = await new DBConnection().getPoolConnection();

  //1--------------------------------------
  //Parameter Global
  var ErrorMsg = "";
  var TotalPayment;
  var Cash = 0; //untuk cek karena hanya boleh ada 1 pembayaran cash
  var MemberCard = false;
  //Mencari Kode baru untuk transaksi
  var Code1 = await GetCode1();

  var StatusProcess = true;
  var paymentValue = [];
  var paymentValueDet = [];
  var Sod;
  var MemberType = "";
  //2--------------------------------------

  //1--------------------------------------
  //Parameter dari body
  var bodyParam = req.body;
  var roomCode = "";
  var chusr = "";
  var listPayment = "";

  if (ErrorMsg == "") {
    roomCode = bodyParam.room;
    chusr = bodyParam.chusr;
    listPayment = bodyParam.order_room_payment;
  }
  //2--------------------------------------

  //1--------------------------------------
  //Data dari database
  var Invoice;
  var MemberPayment;
  var Member;
  var Summary;
  var room;
  var TotalInvoice = 0;
  var TotalInvoice4Point = 0;

  if (ErrorMsg == "") {
    room = await RoomModel.getInfo(roomCode, req, db);
    ErrorMsg = await checkRoom(room);
  }

  //Cek User is exist
  if (ErrorMsg == "") {
    if (chusr == "") ErrorMsg = "User tidak boleh kosong";
  }

  //Cek Invoice is exist
  var loopInvoiceTransfer = true;
  var InvoiceTransfer;
  var InvoiceCodeTransfer;
  var Point = 0;
  if (ErrorMsg == "") {
    Invoice = await InvoiceModel.getInfo(room.Reception, req, db);
    if (Invoice == "") ErrorMsg = "Invoice tidak ditemukan";
    else {
      TotalInvoice = Invoice.Total_All;
      TotalInvoice4Point = (
        Invoice.Sewa_Kamar +
        Invoice.Total_Extend +
        Invoice.Overpax -
        Invoice.Discount_Kamar +
        Invoice.Surcharge_Kamar
      ) + (
          Invoice.Charge_Penjualan -
          Invoice.Total_Cancelation -
          Invoice.Discount_Penjualan
        ) - Invoice.Uang_Voucher;
      InvoiceCodeTransfer = Invoice.Transfer;

      //Mencari total pembayaran (loop semua invoice berkaitan dengan adanya kamar transfer)
      while (loopInvoiceTransfer) {
        InvoiceTransfer = await InvoiceModel.getInfoByInvoice(InvoiceCodeTransfer, req, db);
        if (InvoiceTransfer != "") {
          TotalInvoice = TotalInvoice + InvoiceTransfer.Total_All;
          TotalInvoice4Point = TotalInvoice4Point + (
            InvoiceTransfer.Sewa_Kamar +
            InvoiceTransfer.Total_Extend +
            InvoiceTransfer.Overpax -
            InvoiceTransfer.Discount_Kamar +
            InvoiceTransfer.Surcharge_Kamar
          ) + (
              InvoiceTransfer.Charge_Penjualan -
              InvoiceTransfer.Total_Cancelation -
              InvoiceTransfer.Discount_Penjualan
            ) - InvoiceTransfer.Uang_Voucher;
          InvoiceCodeTransfer = InvoiceTransfer.Transfer;
          loopInvoiceTransfer = true;
        }
        else loopInvoiceTransfer = false;
      }
    }
  }

  //Ambil data member dan status apakah memberCard
  if (ErrorMsg == "") {
    Member = await MemberModel.getInfo(Invoice.Member, req, db);
    if (Member != "") {
      if (Member.Smart_Card == 2 || Member.Smart_Card == 1 || Member.Smart_Card == "") {
        MemberCard = true;

        //Menghitung poin khusus member online
        if (Member.Smart_Card == 2) {
          if (TotalInvoice4Point >= 100000) {
            // Jika Member Basic
            if ((Member.Jenis_Member.toUpperCase() == "BASIC") ||
              (Member.Jenis_Member.toUpperCase() == "DASAR") ||
              (Member.Jenis_Member.toUpperCase() == "PERUNGGU") ||
              (Member.Jenis_Member.toUpperCase() == "1") ||
              (Member.Jenis_Member.toUpperCase() == "4")) {
              Point = Math.floor(TotalInvoice4Point / 10000);
            }
            //jika member SILVER
            else if ((Member.Jenis_Member.toUpperCase() == "SILVER") ||
              (Member.Jenis_Member.toUpperCase() == "PERAK") ||
              (Member.Jenis_Member.toUpperCase() == "2")) {
              Point = Math.floor(TotalInvoice4Point / 6500);
            }
            //jika member GOLD
            else if ((Member.Jenis_Member.toUpperCase() == "GOLD") ||
              (Member.Jenis_Member.toUpperCase() == "EMAS") ||
              (Member.Jenis_Member.toUpperCase() == "3")) {
              Point = Math.floor(TotalInvoice4Point / 5000);
            }
          }
        }
      }
      MemberType = Member.Jenis_Member;
    }
  }

  //Cek Summary is exist
  if (ErrorMsg == "") {
    Summary = await SummaryModel.getInfo(room.Reception, req, db);
    if (Summary != "") ErrorMsg = "Sudah terdapat pembayaran";
  }

  //Cek SOD yang mengarah ke dapur, jika belum diproses maka error
  if (ErrorMsg == "") {
    Sod = await checkSOD(room.Reception, 0);
    if (Sod.length > 0) {
      for (a = 0; a < Sod.length; a++) {
        var statusOrderan;
        if (Sod[a].Status == '1') {
          statusOrderan = "Belum Confirm";
        }
        else if (Sod[a].Status == '3') {
          statusOrderan = "Proses";
        }
        else if (Sod[a].Status == '2') {
          statusOrderan = "Cancel";
        }
        else if (Sod[a].Status == '5') {
          statusOrderan = "Terkirim";
        }
        ErrorMsg = ErrorMsg +
          "Ada pesanan yang belum di proses";
        /*"SlipOrder: " + Sod[a].SlipOrder + ", " +
        "Nama: " + Sod[a].Nama + ", " +
        "Qty: " + Sod[a].Qty + ", " +
        "Harga: " + formatMoney(Sod[a].Price, 2, ".", ",") + ", " +
        "Status Order: " + statusOrderan + "," +
        "Belum diproses Dapur. ";*/
      }
    }
  }

  //Cek SOD yang mengarah ke kasir, jika belum diproses maka error
  if (ErrorMsg == "") {
    Sod = await checkSOD(room.Reception, 1);
    if (Sod.length > 0) {
      for (a = 0; a < Sod.length; a++) {
        var statusOrderan_;
        if (Sod[a].Status == '1') {
          statusOrderan_ = "Belum Confirm";
        }
        else if (Sod[a].Status == '3') {
          statusOrderan_ = "Proses";
        }
        else if (Sod[a].Status == '2') {
          statusOrderan_ = "Cancel";
        }
        else if (Sod[a].Status == '5') {
          statusOrderan_ = "Terkirim";
        }
        ErrorMsg = ErrorMsg +
          "Ada pesanan yang belum di proses";
        /* "SlipOrder: " + Sod[a].SlipOrder + ", " +
         "Nama: " + Sod[a].Nama + ", " +
         "Qty: " + Sod[a].Qty + ", " +
         "Harga: " + formatMoney(Sod[a].Price, 2, ".", ",") + ", " +
         "Status Order: " + statusOrderan_ + "," +
         "Belum diproses Kasir. ";*/
      }
    }
  }
  //2--------------------------------------

  //1--------------------------------------
  //Mencari uang muka
  var UMNonCash;
  var UMNonCashDet = new Object();
  if (ErrorMsg == "") {
    UMNonCash = await UMNonCashModel.getInfo(Invoice.Reception, req, db);
    if (UMNonCash != "") {

      //CASH
      if (UMNonCash.Id_Payment == "0") {
        UMNonCashDet.payment_type = "CASH";
        UMNonCashDet.nominal = UMNonCash.Uang_Muka;
      }
      //CREDIT CARD
      else if (UMNonCash.Nama_Payment.toUpperCase() == "CREDIT CARD") {
        UMNonCashDet.payment_type = UMNonCash.Nama_Payment;
        UMNonCashDet.nominal = UMNonCash.Pay_Value;
        UMNonCashDet.card_credit = UMNonCash.Input1;
        UMNonCashDet.nama_user_credit = UMNonCash.Input2;
        UMNonCashDet.card_code_credit = UMNonCash.Input3;
        UMNonCashDet.approval_code_credit = UMNonCash.Input4;
        UMNonCashDet.edc_credit = UMNonCash.EDC_Machine;
      }
      //DEBET CARD
      else if (UMNonCash.Nama_Payment.toUpperCase() == "DEBET CARD") {
        UMNonCashDet.payment_type = UMNonCash.Nama_Payment;
        UMNonCashDet.nominal = UMNonCash.Pay_Value;
        UMNonCashDet.card_debet = UMNonCash.Input1;
        UMNonCashDet.nama_user_debet = UMNonCash.Input2;
        UMNonCashDet.card_code_debet = UMNonCash.Input3;
        UMNonCashDet.approval_code_debet = UMNonCash.Input4;
        UMNonCashDet.edc_debet = UMNonCash.EDC_Machine;
      }
      //COMPLIMENTARY
      else if (UMNonCash.Nama_Payment.toUpperCase() == "COMPLIMENTARY") {
        UMNonCashDet.payment_type = UMNonCash.Nama_Payment;
        UMNonCashDet.nominal = UMNonCash.Pay_Value;
        UMNonCashDet.nama_user_compliment = UMNonCash.Input1;
        UMNonCashDet.instansi_compliment = UMNonCash.Input2;
        UMNonCashDet.instruksi_compliment = UMNonCash.Input3;
      }
      //E-MONEY
      else if (UMNonCash.Nama_Payment.toUpperCase() == "E-MONEY") {
        UMNonCashDet.payment_type = UMNonCash.Nama_Payment;
        UMNonCashDet.nominal = UMNonCash.Pay_Value;
        UMNonCashDet.type_emoney = UMNonCash.Input1;
        UMNonCashDet.nama_user_emoney = UMNonCash.Input2;
        UMNonCashDet.account_emoney = UMNonCash.Input3;
        UMNonCashDet.ref_code_emoney = UMNonCash.Input4;
      }

      //UANG MUKA TRANSFER
      else if (UMNonCash.Nama_Payment.toUpperCase() == "TRANSFER") {
        UMNonCashDet.payment_type = UMNonCash.Nama_Payment;
        UMNonCashDet.nominal = UMNonCash.Pay_Value;
        UMNonCashDet.bank = UMNonCash.Input1;
        UMNonCashDet.nama_penyetor = UMNonCash.Input2;
      }

      if (UMNonCashDet.nominal > 0) listPayment.push(UMNonCashDet);
    }
  }
  //2--------------------------------------

  //1--------------------------------------
  //Cek payment value
  var TotalCash = 0;
  if (ErrorMsg == "") {
    //Cek Payment
    if (listPayment.length > 0) {
      TotalPayment = 0;
      for (a = 0; a < listPayment.length; a++) {
        paymentValueDet = [];

        //Cek Pembayaran
        if (listPayment[a].nominal <= 0) {
          if (UMNonCashDet.nominal < TotalInvoice) {
            if (TotalInvoice > 0) {
              ErrorMsg = "Nilai harus lebih besar dari 0";
            }
          }
        }
        else {
          TotalPayment = TotalPayment + listPayment[a].nominal;
        }

        //CASH, khusus cash jangan dimasukkan ke details dulu
        //hanya dihitung ada berapa total cash
        if (listPayment[a].payment_type.toUpperCase() == "CASH") {
          TotalCash = TotalCash + listPayment[a].nominal;
        }
        //CREDIT CARD
        else if (listPayment[a].payment_type.toUpperCase() == "CREDIT CARD") {
          if (listPayment[a].edc_credit == "") ErrorMsg = "EDC Machine, tidak boleh kosong";
          else if (listPayment[a].card_credit == "") ErrorMsg = "Jenis Kartu, tidak boleh kosong";
          else if (listPayment[a].nama_user_credit == "") ErrorMsg = "Name, tidak boleh kosong";
          else if (listPayment[a].card_code_credit == "") ErrorMsg = "No Kartu, tidak boleh kosong";
          else if (listPayment[a].approval_code_credit == "") ErrorMsg = "No Approval, tidak boleh kosong";
          //else if(Payment[a].ExpireDate == "") ErrorMsg = "Taggal, tidak boleh kosong";
          //else if(!ValidateDate(Payment[a].ExpireDate)) ErrorMsg = "Taggal, format tidak sesuai (dd/mm/yyyy)";
          nomor_edc = await getNomorEdc(req.body.order_room_payment[a].edc_credit);

          paymentValueDet.push(1); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama
          paymentValueDet.push(listPayment[a].card_credit); //Input1
          paymentValueDet.push(listPayment[a].nama_user_credit); //Input2
          paymentValueDet.push(listPayment[a].card_code_credit); //Input3
          paymentValueDet.push(listPayment[a].approval_code_credit); //Input4
          paymentValueDet.push("");
          paymentValueDet.push("");
          //paymentValueDet.push(listPayment[a].type_edc.nomor_edc); //EDC_Machine          
          paymentValueDet.push(listPayment[a].edc_credit); //EDC_Machine          
          paymentValueDet.push(0); //Status
        }
        //DEBET CARD
        else if (listPayment[a].payment_type.toUpperCase() == "DEBET CARD") {
          if (listPayment[a].edc_debet == "") ErrorMsg = "EDC Machine, tidak boleh kosong";
          else if (listPayment[a].card_debet == "") ErrorMsg = "Jenis Kartu, tidak boleh kosong";
          else if (listPayment[a].nama_user_debet == "") ErrorMsg = "Name, tidak boleh kosong";
          else if (listPayment[a].card_code_debet == "") ErrorMsg = "No Kartu, tidak boleh kosong";
          else if (listPayment[a].approval_code_debet == "") ErrorMsg = "No Approval, tidak boleh kosong";
          //else if(Payment[a].ExpireDate == "") ErrorMsg = "Taggal, tidak boleh kosong";
          //else if(!ValidateDate(Payment[a].ExpireDate)) ErrorMsg = "Taggal, format tidak sesuai (dd/mm/yyyy)";
          nomor_edc = await getNomorEdc(req.body.order_room_payment[a].edc_debet);

          paymentValueDet.push(2); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama

          paymentValueDet.push(listPayment[a].card_debet); //Input1
          paymentValueDet.push(listPayment[a].nama_user_debet); //Input2
          paymentValueDet.push(listPayment[a].card_code_debet); //Input3
          paymentValueDet.push(listPayment[a].approval_code_debet); //Input4
          paymentValueDet.push("");
          paymentValueDet.push("");
          //paymentValueDet.push(listPayment[a].type_edc.nomor_edc);
          paymentValueDet.push(listPayment[a].edc_debet);
          paymentValueDet.push(0); //Status
        }

        //TRANSFER
        else if (listPayment[a].payment_type.toUpperCase() == "TRANSFER") {
          if (listPayment[a].bank == "") ErrorMsg = "Bank, tidak boleh kosong";
          else if (listPayment[a].nama_penyetor == "") ErrorMsg = "Penyetor, tidak boleh kosong";

          paymentValueDet.push(32); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama

          paymentValueDet.push(listPayment[a].bank); //Input1
          paymentValueDet.push(listPayment[a].nama_penyetor); //Input2
          paymentValueDet.push(""); //Input3
          paymentValueDet.push(""); //Input4
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push(""); //EDC_Machine
          paymentValueDet.push(0); //Status
        }

        //PIUTANG
        else if (listPayment[a].payment_type.toUpperCase() == "PIUTANG") {
          if (listPayment[a].nama_user_piutang == "") ErrorMsg = "Nama User Piutang, tidak boleh kosong";
          else if (listPayment[a].id_member_piutang == "") ErrorMsg = "ID Member, tidak boleh kosong";
          else {
            MemberPayment = await MemberModel.getInfo(listPayment[a].id_member_piutang, req, db);
            if (MemberPayment == "") ErrorMsg = "ID Member, tidak ditemukan";
          }

          paymentValueDet.push(3); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          if (MemberPayment == "") {
            paymentValueDet.push(Invoice.Member); //Member
            paymentValueDet.push(Invoice.Nama); //Nama
          }
          else {
            paymentValueDet.push(MemberPayment.Member); //Member
            paymentValueDet.push(MemberPayment.Nama_Lengkap); //Nama
          }

          paymentValueDet.push(""); //Input1
          paymentValueDet.push(""); //Input2
          paymentValueDet.push(""); //Input3
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push(""); //EDC_Machine
          paymentValueDet.push(0); //Status
        }

        //COMPLIMENTARY
        else if (listPayment[a].payment_type.toUpperCase() == "COMPLIMENTARY") {
          if (listPayment[a].nama_user_compliment == "") ErrorMsg = "Nama, tidak boleh kosong";
          else if (listPayment[a].instansi_compliment == "") ErrorMsg = "Nama Instansi, tidak boleh kosong";
          else if (listPayment[a].instruksi_compliment == "") ErrorMsg = "Nama Instruksi, tidak boleh kosong";

          paymentValueDet.push(4); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama
          paymentValueDet.push(listPayment[a].nama_user_compliment); //Input1
          paymentValueDet.push(listPayment[a].instansi_compliment); //Input2
          paymentValueDet.push(listPayment[a].instruksi_compliment); //Input3
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push(""); //EDC_Machine
          paymentValueDet.push(0); //Status
        }
        //E-MONEY
        else if (listPayment[a].payment_type.toUpperCase() == "E-MONEY") {
          if (listPayment[a].type_emoney == "") ErrorMsg = "Jenis E-Money, tidak boleh kosong";
          else if (listPayment[a].nama_user_emoney == "") ErrorMsg = "Nama, tidak boleh kosong";
          else if (listPayment[a].account_emoney == "") ErrorMsg = "No Akun, tidak boleh kosong";
          else if (listPayment[a].ref_code_emoney == "") ErrorMsg = "Referensi, tidak boleh kosong";

          paymentValueDet.push(31); //ID_Payment
          paymentValueDet.push(listPayment[a].payment_type); //Nama_Payment
          paymentValueDet.push(listPayment[a].nominal); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama
          paymentValueDet.push(listPayment[a].type_emoney); //Input1
          paymentValueDet.push(listPayment[a].nama_user_emoney); //Input2
          paymentValueDet.push(listPayment[a].account_emoney); //Input3
          paymentValueDet.push(listPayment[a].ref_code_emoney); //Input4
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push(""); //EDC_Machine
          paymentValueDet.push(0); //Status
        }

        if (listPayment[a].payment_type.toUpperCase() != "CASH") paymentValue.push(paymentValueDet);
        if (ErrorMsg != "") break;
      }

      //Memasukkan nilai cash ke detail pembayaran     
      if (paymentValue.length == 0) {
        paymentValueDet = [];
        paymentValueDet.push(0); //ID_Payment
        paymentValueDet.push("CASH"); //Nama_Payment
        paymentValueDet.push(TotalCash); //Pay_Value
        paymentValueDet.push(Invoice.Member); //Member
        paymentValueDet.push(Invoice.Nama); //Nama
        paymentValueDet.push(""); //Input1
        paymentValueDet.push(""); //Input2
        paymentValueDet.push(""); //Input3
        paymentValueDet.push(""); //Input4
        paymentValueDet.push("");
        paymentValueDet.push("");
        paymentValueDet.push(""); //EDC_Machine
        paymentValueDet.push(0); //Status*/
        paymentValue.push(paymentValueDet);
      } else if (paymentValue.length > 0) {
        if (TotalCash > 0) {
          paymentValueDet = [];
          paymentValueDet.push(0); //ID_Payment
          paymentValueDet.push("CASH"); //Nama_Payment
          paymentValueDet.push(TotalCash); //Pay_Value
          paymentValueDet.push(Invoice.Member); //Member
          paymentValueDet.push(Invoice.Nama); //Nama
          paymentValueDet.push(""); //Input1
          paymentValueDet.push(""); //Input2
          paymentValueDet.push(""); //Input3
          paymentValueDet.push(""); //Input4
          paymentValueDet.push("");
          paymentValueDet.push("");
          paymentValueDet.push(""); //EDC_Machine
          paymentValueDet.push(0); //Status*/

          paymentValue.push(paymentValueDet);
        }
      }

      //if(Cash > 1) ErrorMsg = "Tidak boleh ada tipe pembayaran CASH lebih dari 1";
      if (TotalPayment < TotalInvoice)
        if ((TotalInvoice - TotalPayment) > 1) {
          if (UMNonCashDet.nominal < TotalInvoice) {
            ErrorMsg = "Jumlah pembayaran kurang";
          }
        }
    }
    else {
      ErrorMsg = "Belum ada pembayaran";
    }
  }
  //2--------------------------------------

  //1--------------------------------------
  //insert data SUL
  var SulBean;
  if (ErrorMsg == "") {
    SulBean = new Object();
    SulBean.Summary = await GetCode2(Code1);
    SulBean.DATE = await UtilitiesModel.getDateNow(req, db);
    SulBean.Shift = await UtilitiesModel.getShift(req, db);
    SulBean.Reception = room.Reception;
    SulBean.Member = Invoice.Member;
    SulBean.Nama = Invoice.Nama;
    SulBean.Kamar = Invoice.Kamar;
    SulBean.Total = TotalInvoice;
    SulBean.Chusr = chusr;
    SulBean.Invoice = Invoice.Invoice;

    //isinya query sesuai shift
    if (SulBean.Shift == 1) {
      SulBean.Date_Trans = "getdate()";
    } else if (SulBean.Shift == 2) {
      SulBean.Date_Trans = "getdate()";
    } else if (SulBean.Shift == 3) {
      SulBean.Date_Trans = "DATEADD(dd, -1, GETDATE())";
    }

    //mem-fix-kan shift, jika isinya 3 maka diisi 2
    if (SulBean.Shift == 3) { SulBean.Shift = 2; }

    SulBean.Bayar = TotalPayment;
    SulBean.Kembali = TotalPayment - TotalInvoice;

    //insert data IHP_Sul
    if (ErrorMsg == "") {
      StatusProcess = await insertSUL(SulBean);
      if (!StatusProcess) {
        ErrorMsg = "Gagal insert data IHP_Sul";
      }
    }

  }

  //Insert IHP_Sud
  StatusProcess = await insertSUD(SulBean.Summary, paymentValue);
  if (!StatusProcess) {
    ErrorMsg = "Gagal insert data IHP_Sud";
  }

  //Update data Rcp
  StatusProcess = await updateRcp(SulBean);
  if (!StatusProcess) {
    ErrorMsg = "Gagal update data Rcp";
  }

  if (UMNonCashDet.nominal > TotalInvoice) {
    await new CheckinProses().updateIhpIvcUangMuka(db, room.Reception, TotalInvoice);
    await new CheckinProses().updateIhpRcpUangMuka(db, room.Reception, TotalInvoice);
  }
  if ((TotalInvoice == 0) && (UMNonCashDet.nominal > 0)) {
    await new CheckinProses().deleteIhpUangMukaNonCash(db, Invoice.Reception);
  }

  //Jike member dan punya poin
  var AddRewardBean;
  if (ErrorMsg == "") {
    if (MemberCard && Point > 0) {
      AddRewardBean = new Object();
      AddRewardBean.AddReward = await AddRewardModel.GetCode2(req, db);
      AddRewardBean.DATE = await UtilitiesModel.getDateNow(req, db);
      AddRewardBean.Shift = await UtilitiesModel.getShift(req, db);
      AddRewardBean.Reception = room.Reception;
      AddRewardBean.Summary = SulBean.Summary;
      AddRewardBean.Member = Invoice.Member;
      AddRewardBean.Nama = Invoice.Nama;
      AddRewardBean.Jenis_Member = Member.Jenis_Member;
      AddRewardBean.Kamar = Invoice.Kamar;
      AddRewardBean.Total_All = TotalInvoice;
      AddRewardBean.Total_Point = Point;
      AddRewardBean.Masa_Aktif = "DATEADD(year, 1, getdate())";
      AddRewardBean.Status = 1;
      AddRewardBean.CHUsr = chusr;

      //isinya query sesuai shift
      if (AddRewardBean.Shift == 1) {
        AddRewardBean.Date_Trans = "getdate()";
      } else if (AddRewardBean.Shift == 2) {
        AddRewardBean.Date_Trans = "getdate()";
      } else if (AddRewardBean.Shift == 3) {
        AddRewardBean.Date_Trans = "DATEADD(dd, -1, GETDATE())";
      }

      //mem-fix-kan shift, jika isinya 3 maka diisi 2
      if (AddRewardBean.Shift == 3) { AddRewardBean.Shift = 2; }

      StatusProcess = await AddRewardModel.InsertAddReward(AddRewardBean, req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal insert data AddReward";
      }
    }
  }


  if (ErrorMsg == "") {
    //pesan print Slip Invoice Pos Lorong
    var client_pos = dgram.createSocket('udp4');
    pesan = "PRINT_SUMMARY_POINT_OF_SALES_LORONG";
    ip_address = req.config.ip_address_pos;
    port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
    if ((ip_address !== false) && (port !== false)) {
      port = port.recordset[0].server_udp_port;
      port = parseInt(port);
      panjang_pesan = pesan.length;
      panjang_pesan = parseInt(panjang_pesan);
      logger.info("Send Sinyal PRINT_SUMMARY_POINT_OF_SALES_LORONG to POINT OF SALES " + ip_address);
      client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
        client_pos.close();
      });
    }

    var member_client = dgram.createSocket('udp4');
    //pesan print Slip Order Pos Lorong
    pesan = "UPLOAD_DATA_PEMBAYARAN";
    ip_address = await new IpAddressService().getIpAddress(db, "MEMBER CLIENT");
    port = await new IpAddressService().getUdpPort(db, "MEMBER CLIENT");
    if ((ip_address !== false) && (port !== false)) {
      port = port.recordset[0].server_udp_port;
      ip_address = ip_address.recordset[0].ip_address;
      port = parseInt(port);
      panjang_pesan = pesan.length;
      panjang_pesan = parseInt(panjang_pesan);
      logger.info("Send Sinyal UPLOAD_DATA_PEMBAYARAN to MEMBER CLIENT " + ip_address);
      member_client.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
        member_client.close();
      });
    }

    var client_timer_vod2b = dgram.createSocket('udp4');
    //pesan print Slip Order Pos Lorong
    pesan = "TIMER VOD2B";
    pesan = "Room " + SulBean.Kamar + " Bayar";
    ip_address = await new IpAddressService().getIpAddress(db, "TIMER VOD2B");
    port = await new IpAddressService().getUdpPort(db, "TIMER VOD2B");
    if ((ip_address !== false) && (port !== false)) {
      port = port.recordset[0].server_udp_port;
      ip_address = ip_address.recordset[0].ip_address;
      port = parseInt(port);
      panjang_pesan = pesan.length;
      panjang_pesan = parseInt(panjang_pesan);
      logger.info("Send Sinyal TIMER VOD2B to TIMER VOD2B " + ip_address);
      client_timer_vod2b.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
        client_timer_vod2b.close();
      });
    }

    //TODO send email invoice
    let isEmailSend = false;
    var email_address;
    try {
      isEmailSend = bodyParam.is_send_email_invoice;
    } catch (err) {
      isEmailSend = false;
    }

    //if (isEmailSend) {
    hasil_order_penjualan = [];
    hasil_nilai_invoice = [];
    var email_bcc = "adm.blackholektvsub@gmail.com";
    var email_to = "adm.blackholektvsub@gmail.com";

    var nama_penerima;
    var nomor_member;
    var room__ = SulBean.Kamar;
    var total_menit_extend = parseInt(0);
    var room_ = await new RoomService().getRoom(db, room__);
    var extend = await new RoomService().getExtendRoomList(db, room__);
    if (extend != false) {
      for (n = 0; n < extend.recordset.length; n++) {
        total_menit_extend = total_menit_extend + parseInt(extend.recordset[n].total_menit_extend);
      }
    }
    var invoice = await getNilaiInvoice(room_.recordset[0].room_ivc);
    var pembayaran = await getSulSud(room_.recordset[0].room_ivc);
    var outlet = await new TarifKamar().getJamOperasionalOutlet(db);
    var order_penjualan = await getOrderPenjualan(room_.recordset[0].room_ivc);

    if (room_.recordset[0].member_rev == '') {
      if (isEmailSend) {
        email_address = room_.recordset[0].email;
      } else {
        email_address = email_to;
      }
      nama_penerima = room_.recordset[0].nama_member;
      nomor_member = room_.recordset[0].kode_member;
    }
    else {
      var cek_member = await new CheckinProses().getDataMember(db, room_.recordset[0].member_rev);
      if (cek_member !== false) {
        if (isEmailSend) {
          email_address = cek_member.recordset[0].email;
        } else {
          email_address = email_to;
        }
        nama_penerima = cek_member.recordset[0].nama_member;
        nomor_member = room_.recordset[0].member_rev;
      }
    }
    logger.info("Send email  to " + email_address);
    nomor_pembayaran = room_.recordset[0].summary;
    var total_point = await getAddRewardTambahanPoint(nomor_pembayaran);
    if (total_point == false) {
      total_point = 0;
    }
    var total_pembayaran = room_.recordset[0].total_pembayaran;
    tgl_pembayaran = room_.recordset[0].summary_date;
    var checkin = room_.recordset[0].jam_checkin;
    var hari = await harinya(tgl_pembayaran);
    var bulan = await bulannya(tgl_pembayaran);
    var jam = await formatJam(tgl_pembayaran);
    var tanggal = await formatTanggel(tgl_pembayaran);
    var jam_checkin = await formatJam(checkin);
    var tanggal_checkin = await formatTanggel(checkin);

    if (email_address == "") {
    }
    else if (room_.recordset[0].status_kamar != 4) {
      logger.info("Kamar Belum Dibayar");
      dataResponse = new ResponseFormat(true, null, "Kamar Belum Dibayar");
      res.send(dataResponse);
    }
    else if (email_address != "") {
      if ((email_address.includes("@") == false) ||
        (email_address.includes(".") == false) ||
        (email_address == email_address.toUpperCase())) {
      }
      else if ((email_address.includes("@") == true) ||
        (email_address.includes(".") == true) ||
        (email_address == email_address.toLowerCase())) {
        fullPathSendFile = process.cwd() + "\\temp_summary_pdf\\" + invoice[0][0].invoice + ".pdf";
        namaSendFile = invoice[0][0].invoice + ".pdf";

        var create_file_pdf = await createPdf(
          fullPathSendFile,
          tanggal,
          jam,
          outlet,
          room_,
          invoice,
          order_penjualan,
          pembayaran,
          total_point,
          total_menit_extend,
          tanggal_checkin,
          jam_checkin
        );

        if (create_file_pdf != false) {
          var invoice__ = invoice[0][0].invoice;
          await updateIhpSulKirimEmail(invoice__, email_address);
          let transporter = nodemailer.createTransport({
            //host: "smtp.ethereal.email",
            host: "mail.blackholektv.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "noreply.receipt@blackholektv.id", // generated ethereal user
              pass: "Masainul123", // generated ethereal password
            },
            tls: {
              rejectUnauthorized: false
            },
            logger: true,
            debug: false // include SMTP traffic in the logs
          });
          let info = await transporter.sendMail({
            from: '"Blackhole KTV Receipts " <noreply.receipt@blackholektv.id>',
            to: email_address,
            bcc: email_bcc,
            subject: "Your E-Receipt at Blackhole KTV  (" + invoice[0][0].invoice + ")",
            text:
              "Dear " + nama_penerima + "\n" +
              "Member ID : " + nomor_member + "\n\n" +
              "Thank you for visiting Blackhole KTV.\n\n" +
              "Attached e-receipt in this email is a summary of your recent visit on  " +
              tanggal + " at " + jam + " " +
              "with invoice number " + invoice[0][0].invoice + ".\n\n" +
              "Please note that it could take 24-48 hours for points to be added to your PuppyClub Account. PuppyClub app can be downloaded from the Apple App Store or Google Play Store for a better experience.\n\n" +
              "Any further information, please contact +62881-1338-833\n\n" +
              "Regards,\n" +
              "BLACKHOLE KTV\n",
            attachments: [
              {
                filename: namaSendFile,
                content: 'Some notes about this e-mail',
                path: fullPathSendFile,
                contentType: 'application/pdf' // optional, would be detected from the filename 
              }

            ]

          }, function (error) {
            if (error) {
              console.log("Email Error", error);
              logger.error(error);
            } else {
              logger.info("Send Email Sukses");

              try {
                var SulSudQuery = " " +
                  "Update IHP_Sul set Emailed_Success='1'" +
                  " where IHP_Sul.Invoice='" + invoice__ + "'";

                db.request().query(SulSudQuery, function (err, dataReturn) {
                  if (err) {
                    logger.error(err.message);
                  } else {
                    logger.info("Update IHP_Sul Emailed_Success Send Email Sukses");
                  }
                });
              } catch (err) {
                logger.error(err.message);
              }

            }
          });

        } else {
          logger.info("Gagal Create File Pdf");
        }
      }
      //send email

    }

    //} //end send email

    if ((room.Jenis_Kamar == "LOBBY") ||
      (room.Jenis_Kamar == "TABLE") ||
      (room.Jenis_Kamar == "BAR") ||
      (room.Jenis_Kamar == "LOUNGE") ||
      (room.Jenis_Kamar == "SOFA")
    ) {
      await new CheckinProses().prosesCheckout(db, SulBean.Kamar);
      await new CheckinProses().prosesDeleteIhpRoomCheckin(db, SulBean.Kamar);
      await new CheckinProses().prosesOprClean(db, SulBean.Kamar);
    }


  }
  //2--------------------------------------

  if (ErrorMsg != "") {
    console.log(ErrorMsg);
    logger.info(ErrorMsg);
    dataResponse = new ResponseFormat(false, null, ErrorMsg);
    res.send(dataResponse);
  }
  else {
    dataResponse = new ResponseFormat(true, bodyParam);
    res.send(dataResponse);
  }
}

function insertSUL(SulBean) {
  var query;

  return new Promise((resolve, reject) => {
    try {
      query = "INSERT INTO " + tableSul.table + " (" +
        tableSul.Summary + ", " +
        tableSul.DATE + ", " +
        tableSul.Shift + ", " +
        tableSul.Reception + ", " +
        tableSul.Member + ", " +
        tableSul.Nama + ", " +
        tableSul.Kamar + ", " +
        tableSul.Total + ", " +
        tableSul.Chtime + ", " +
        tableSul.Chusr + ", " +
        tableSul.INVOICE + ", " +
        tableSul.Date_Trans + ", " +
        tableSul.Bayar + ", " +
        tableSul.Kembali + ", " +
        tableSul.Number + ", " +
        tableSul.Printed + ", " +
        tableSul.Flag + ", " +
        tableSul.Posted + ", " +
        tableSul.Export +
        ") Values (" +
        "'" + SulBean.Summary + "', " +
        "'" + SulBean.DATE + "', " +
        "'" + SulBean.Shift + "', " +
        "'" + SulBean.Reception + "', " +
        "'" + SulBean.Member + "', " +
        "'" + SulBean.Nama + "', " +
        "'" + SulBean.Kamar + "', " +
        SulBean.Total + ", " +
        "CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) , " +
        "'" + SulBean.Chusr + "', " +
        "'" + SulBean.Invoice + "', " +
        SulBean.Date_Trans + ", " +
        SulBean.Bayar + ", " +
        SulBean.Kembali + ", " +
        "'', " +
        "'-1', " +
        "'', " +
        "'', " +
        "''" +
        ")";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          logger.info("Sukses Insert IHP_Sul");
          resolve(true);
        }
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

function updateRcp(SulBean) {
  var query;

  return new Promise((resolve, reject) => {
    try {
      query = "UPDATE " + tableRcp.table + " " +
        "SET " +
        tableRcp.Summary + " = '" + SulBean.Summary + "' , " +
        tableRcp.Complete + " = '1' " +
        "WHERE " +
        tableRcp.Reception + " = '" + SulBean.Reception + "' AND " +
        tableRcp.Invoice + " = '" + SulBean.Invoice + "'";

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          logger.info("Sukses updateRcp");
          resolve(true);
        }
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

function insertSUD(SummaryCode, paymentValue) {
  var query = "";

  return new Promise((resolve, reject) => {
    try {

      for (a = 0; a < paymentValue.length; a++) {

        if (query != "") query = query + "; ";
        query = query +
          "INSERT INTO " + tableSud.table + " (" +
          tableSud.Summary + ", " +
          tableSud.ID_Payment + ", " +
          tableSud.Nama_Payment + ", " +
          tableSud.Member + ", " +
          tableSud.Nama + ", " +
          tableSud.Input1 + ", " +
          tableSud.Input2 + ", " +
          tableSud.Input3 + ", " +
          tableSud.Input4 + ", " +
          tableSud.Pay_Value + ", " +
          tableSud.EDC_Machine + ", " +
          tableSud.Status +
          ") Values (" +
          "'" + SummaryCode + "', " +
          paymentValue[a][0] + ", " +
          "'" + paymentValue[a][1] + "', " +
          "'" + paymentValue[a][3] + "', " +
          "'" + paymentValue[a][4] + "', " +
          "'" + paymentValue[a][5] + "', " +
          "'" + paymentValue[a][6] + "', " +
          "'" + paymentValue[a][7] + "', " +
          "'" + paymentValue[a][8] + "', " +
          paymentValue[a][2] + ", " +
          "'" + paymentValue[a][11] + "', " +
          paymentValue[a][12] +
          ")";
      }

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          logger.info("Sukses Insert IHP_Sud");
          resolve(true);
        }
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

function GetCode1() {
  var today = new Date(); //mendapatkan tanggal sekarang
  var No_Bukti = "SUA";
  var tmpNo_Bukti;
  var Day;
  var Month;
  var Year;
  var query;

  Year = today.getFullYear().toString().substr(-2);
  Month = (today.getMonth() + 1).toString().padStart(2, "0");
  Day = today.getDate().toString().padStart(2, "0");

  query = "SELECT " + tableConfig3.SUM + " " +
    "FROM " + tableConfig3.table + " " +
    "WHERE " + tableConfig3.Data + " = '1'";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_Bukti = dataReturn.recordset[0].SUM;
          } else {
            No_Bukti = "SUA";
          }
        }

        tmpNo_Bukti = No_Bukti + "-" + Year + "" + Month + "" + Day;
        resolve(tmpNo_Bukti);
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

function GetCode2(tmpCode) {
  var query;
  var No_BuktiTmp;
  var No_Bukti;
  var numberTmp;
  var number;

  query = "SELECT " + tableSul.Summary + " " +
    "FROM " + tableSul.table + " " +
    "WHERE " + tableSul.Summary + " LIKE '" + tmpCode + "%' " +
    "ORDER BY " + tableSul.Summary + " DESC";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_BuktiTmp = dataReturn.recordset[0].Summary;
            numberTmp = Number(No_BuktiTmp.slice(-4));
            numberTmp = numberTmp + 1;

            if (numberTmp < 10) number = "000" + numberTmp;
            else if (numberTmp < 100) number = "00" + numberTmp;
            else if (numberTmp < 1000) number = "0" + numberTmp;
            else number = numberTmp;

            No_Bukti = tmpCode + "" + number;
          } else {
            No_Bukti = tmpCode + "0001";
          }
        }

        resolve(No_Bukti);
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

function getNomorEdc(bankEdc_) {
  var bankEdc = bankEdc_;
  var nomor_edc;
  query = `Select No as nomor_edc from IHP_EDC where NamaMesin='${bankEdc}'`;
  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            nomor_edc = dataReturn.recordset[0].nomor_edc;
          }
        }
        resolve(nomor_edc);
      });
    } catch (error) {
      logger.error(error);
    }
  });
}

//Digunakan untuk cek apakah ada order yang belum diproses
//Status, 0 untuk dapur/bar, 1 untuk Kasir
function checkSOD(Reception, Status) {
  var query;

  return new Promise((resolve, reject) => {
    try {
      query = "SELECT * FROM " + tableSod.table + " " +
        "WHERE " +
        tableSod.SlipOrder + " IN (" +
        "SELECT " + tableSol.SlipOrder + " FROM " + tableSol.table + " " +
        " WHERE " + tableSol.Reception + " = '" + Reception + "'" +
        //cek sod hari ini saja kalau sudah hari berikutnya abaikan
        " and " +
        " DATEADD(dd, DATEDIFF(dd, 0, IHP_Sol.DATE_TRANS), 0)=(CASE WHEN (DATEPART(HOUR, GETDATE()))>=6 AND (DATEPART(HOUR, GETDATE()))<24 " +
        " THEN DATEADD(dd, DATEDIFF(dd, 0, GETDATE()), 0)" +
        " ELSE DATEADD(dd, -1, DATEADD(dd, DATEDIFF(dd, 0, GETDATE()), 0))" +
        " END )" +
        ")";
      //"AND " +tableSod.Qty_Terima + " > 0";
      if (Status == 0) {
        query = query + "  AND " +
          " (" +
          tableSod.Status + " = 3 " +
          " or " + tableSod.Status + " = 1" +
          " ) " +
          " AND " +
          "(" + tableSod.Location + " = 2 OR " + tableSod.Location + " = 3)";
      }
      else {
        query = query + "  AND " +
          tableSod.Status + " = 1 AND " +
          tableSod.Location + " = 1";
      }

      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            resolve(dataReturn.recordset);
          } else {
            resolve("");
          }
        }
      });
    } catch (error) {
      logger.error(error);
      resolve("");
    }
  });
}

//Digunakan untuk format variable ke dalam bentuk currency
function formatMoney(number, decPlaces, decSep, thouSep) {
  decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSep = typeof decSep === "undefined" ? "." : decSep;
  thouSep = typeof thouSep === "undefined" ? "," : thouSep;
  var sign = number < 0 ? "-" : "";
  var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
  var j = (j = i.length) > 3 ? j % 3 : 0;

  return sign +
    (j ? i.substr(0, j) + thouSep : "") +
    i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
    (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}

exports.submitEmail = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _pocSubmitEmail(req, res);
};

async function _pocSubmitEmail(req, res) {
  hasil_order_penjualan = [];
  hasil_nilai_invoice = [];
  var email_address;
  var nama_penerima;
  var nomor_member;
  var total_menit_extend = parseInt(0);

  var room__ = req.params.room;
  var room_ = await new RoomService().getRoom(db, room__);
  var extend = await new RoomService().getExtendRoomList(db, room__);
  if (extend != false) {
    for (n = 0; n < extend.recordset.length; n++) {
      total_menit_extend = total_menit_extend + parseInt(extend.recordset[n].total_menit_extend);
    }
  }

  var invoice = await getNilaiInvoice(room_.recordset[0].room_ivc);
  var pembayaran = await getSulSud(room_.recordset[0].room_ivc);
  var outlet = await new TarifKamar().getJamOperasionalOutlet(db);
  var order_penjualan = await getOrderPenjualan(room_.recordset[0].room_ivc);

  if (room_.recordset[0].member_rev == '') {
    email_address = room_.recordset[0].email;
    nama_penerima = room_.recordset[0].nama_member;
    nomor_member = room_.recordset[0].kode_member;
  }
  else {
    var cek_member = await new CheckinProses().getDataMember(db, room_.recordset[0].member_rev);
    if (cek_member !== false) {
      email_address = cek_member.recordset[0].email;
      nama_penerima = cek_member.recordset[0].nama_member;
      nomor_member = room_.recordset[0].member_rev;
    }
  }
  logger.info("Send email  to " + email_address);

  nomor_pembayaran = room_.recordset[0].summary;
  var total_point = await getAddRewardTambahanPoint(nomor_pembayaran);
  if (total_point == false) {
    total_point = 0;
  }
  var total_pembayaran = room_.recordset[0].total_pembayaran;
  tgl_pembayaran = room_.recordset[0].summary_date;
  var checkin = room_.recordset[0].jam_checkin;
  var hari = await harinya(tgl_pembayaran);
  var bulan = await bulannya(tgl_pembayaran);
  var jam = await formatJam(tgl_pembayaran);
  var tanggal = await formatTanggel(tgl_pembayaran);
  var jam_checkin = await formatJam(checkin);
  var tanggal_checkin = await formatTanggel(checkin);

  if (email_address == "") {
  }
  else if (room_.recordset[0].status_kamar != 4) {
    logger.info("Kamar Belum Dibayar");
    dataResponse = new ResponseFormat(true, null, "Kamar Belum Dibayar");
    res.send(dataResponse);
  }
  else if (email_address != "") {
    if ((email_address.includes("@") == false) ||
      (email_address.includes(".") == false) ||
      (email_address == email_address.toUpperCase())) {
    }
    else if ((email_address.includes("@") == true) ||
      (email_address.includes(".") == true) ||
      (email_address == email_address.toLowerCase())) {
      fullPathSendFile = process.cwd() + "\\temp_summary_pdf\\" + invoice[0][0].invoice + ".pdf";
      namaSendFile = invoice[0][0].invoice + ".pdf";

      var create_file_pdf = await createPdf(
        fullPathSendFile,
        tanggal,
        jam,
        outlet,
        room_,
        invoice,
        order_penjualan,
        pembayaran,
        total_point,
        total_menit_extend,
        tanggal_checkin,
        jam_checkin
      );

      //----------
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing

      //let response = dialog.showMessageBox(null, options2);
      // console.log(response);

      //let testAccount = await nodemailer.createTestAccount();
      if (create_file_pdf != false) {

        let transporter = nodemailer.createTransport({
          //host: "smtp.ethereal.email",
          //host: "mail.happypuppy.id",
          host: "mail.blackholektv.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            //user: testAccount.user, // generated ethereal user
            //pass: testAccount.pass, // generated ethereal password
            user: "noreply.receipt@blackholektv.id", // generated ethereal user
            pass: "Masainul123", // generated ethereal password
          },
          tls: {
            rejectUnauthorized: false
          },
          logger: true,
          debug: false // include SMTP traffic in the logs
        });

        //_daoUpdateFlagAndData.updateEmailAddressReceipt(emailAddress, nomorReceipt);
        // send mail with defined transport object
        let info = await transporter.sendMail({
          //from: '"Fred Foo 👻" <foo@example.com>', // sender address
          from: '"Blackhole KTV Receipts " <noreply.receipt@blackholektv.id>', // sender address
          //to: "bar@example.com, baz@example.com", // list of receivers
          to: email_address, // list of receivers
          bcc: 'adm.blackholektvsub@gmail.com',
          //bcc: 'sub.lenmarc@tuttobono.id',
          //subject: "Hello ✔", // Subject line
          subject: "Your E-Receipt at Blackhole KTV  (" + invoice[0][0].invoice + ")",
          // Subject line
          text:
            //"Pelanggan Black Hole Ktv yang terhormat:\n\n" +
            //"Nama            : " + nama_penerima + "\n" +
            "Dear " + nama_penerima + "\n" +
            "Member ID : " + nomor_member + "\n\n" +
            "Thank you for visiting Blackhole KTV.\n\n" +
            "Attached e-receipt in this email is a summary of your recent visit on  " +
            //hari + ", " + day + " " + bulan + " " + tahun + " Pukul " + jam + ":" + Menit + ".\n" +
            tanggal + " at " + jam + " " +
            "with invoice number " + invoice[0][0].invoice + ".\n\n" +
            "Please note that it could take 24-48 hours for points to be added to your PuppyClub Account. PuppyClub app can be downloaded from the Apple App Store or Google Play Store for a better experience.\n\n" +
            "Any further information, please contact +62881-1338-833\n\n" +
            "Regards,\n" +
            "BLACKHOLE KTV\n",
          // plain text body
          //html: "<b>Hello world?</b>", // html body
          // An array of attachments
          attachments: [
            // String attachment
            {
              filename: namaSendFile,
              content: 'Some notes about this e-mail',
              path: fullPathSendFile,
              contentType: 'application/pdf' // optional, would be detected from the filename */
            }

          ]

        }, function (error) {
          if (error) {
            console.log("Email Error", error);
            logger.error(error);
            dataResponse = new ResponseFormat(false, null, error);
            res.send(dataResponse);
          }
          else {
            logger.info("Send Email Sukses");
            dataResponse = new ResponseFormat(true, null, "Send Email Sukses");
            res.send(dataResponse);

            //console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>        
            // Preview only available when sending through an Ethereal account
            //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...                            
            //----------
            //var suksesGagal = ("Message sent: %s " + info.messageId);
          }
        });

      }
      else {
        logger.info("Gagal Create File Pdf");
        dataResponse = new ResponseFormat(true, null, "Gagal Create File Pdf");
        res.send(dataResponse);
      }
    }
  }


}

function harinya(hari) {
  return new Promise((resolve, reject) => {
    try {
      var hari00 = hari;
      var isinya2;
      var hari0 = hari00.getUTCDay();
      if (hari0 == 0) {
        isinya2 = "Monday";
        resolve(isinya2);
      }
      else if (hari0 == 1) {
        isinya2 = "Tuesday";
        resolve(isinya2);
      }
      else if (hari0 == 2) {
        isinya2 = "Wednesday";
        resolve(isinya2);
      }
      else if (hari0 == 3) {
        isinya2 = "Thursday";
        resolve(isinya2);
      }
      else if (hari0 == 4) {
        isinya2 = "Friday";
        resolve(isinya2);
      }
      else if (hari0 == 5) {
        isinya2 = "Saturday";
        resolve(isinya2);
      }
      else if (hari0 == 6) {
        isinya2 = "Sunday";
        resolve(isinya2);
      }

    } catch (error) {
      logger.error('Error harinya ' + error.message);
    }
  });
}

function bulannya(bulan) {
  return new Promise((resolve, reject) => {
    try {
      var bulan00 = bulan;
      var isinya2;
      var bulan0 = bulan00.getUTCMonth();
      if (bulan0 == 0) {
        isinya2 = "January";
        resolve(isinya2);
      }
      else if (bulan0 == 1) {
        isinya2 = "February";
        resolve(isinya2);
      }
      else if (bulan0 == 2) {
        isinya2 = "March";
        resolve(isinya2);
      }
      else if (bulan0 == 3) {
        isinya2 = "April";
        resolve(isinya2);
      }
      else if (bulan0 == 4) {
        isinya2 = "May";
        resolve(isinya2);
      }
      else if (bulan0 == 5) {
        isinya2 = "June";
        resolve(isinya2);
      }
      else if (bulan0 == 6) {
        isinya2 = "July";
        resolve(isinya2);
      }
      else if (bulan0 == 7) {
        isinya2 = "August";
        resolve(isinya2);
      }
      else if (bulan0 == 8) {
        isinya2 = "September";
        resolve(isinya2);
      }
      else if (bulan0 == 9) {
        isinya2 = "October";
        resolve(isinya2);
      }
      else if (bulan0 == 10) {
        isinya2 = "November";
        resolve(isinya2);
      }
      else if (bulan0 == 11) {
        isinya2 = "December";
        resolve(isinya2);
      }

    } catch (error) {
      logger.error('Error bulannya ' + error.message);
    }
  });
}

function formatJam(tanggal_) {
  return new Promise((resolve, reject) => {
    try {
      var tanggal = tanggal_;
      var jam;
      var menit;
      var hasil;
      jam = tanggal.getUTCHours();
      if (jam.toString().length == 1) {
        jam = "0" + jam;
      }
      menit = tanggal.getUTCMinutes();
      if (menit.toString().length == 1) {
        menit = "0" + menit;
      }
      hasil = jam + ":" + menit;
      resolve(hasil);
    } catch (error) {
      logger.error('Error formatJam ' + error.message);
    }
  });
}

function formatTanggel(tanggal_) {
  return new Promise((resolve, reject) => {
    try {
      var tanggal = tanggal_;
      var jam;
      var menit;
      var hasil;
      var harinya;

      var hari = tanggal.getUTCDay();
      var tanggalnya = tanggal.getUTCDate();
      var bulan = tanggal.getUTCMonth();
      var tahun = tanggal.getUTCFullYear();
      var bulannya;
      if (hari == 0) {
        harinya = "Monday";
      }
      else if (hari == 1) {
        harinya = "Tuesday";
      }
      else if (hari == 2) {
        harinya = "Wednesday";
      }
      else if (hari == 3) {
        harinya = "Thursday";
      }
      else if (hari == 4) {
        harinya = "Friday";
      }
      else if (hari == 5) {
        harinya = "Saturday";
      }
      else if (hari == 6) {
        harinya = "Sunday";
      }


      if (bulan == 0) {
        bulannya = "January";
      }
      else if (bulan == 1) {
        bulannya = "February";
      }
      else if (bulan == 2) {
        bulannya = "March";
      }
      else if (bulan == 3) {
        bulannya = "April";
      }
      else if (bulan == 4) {
        bulannya = "May";
      }
      else if (bulan == 5) {
        bulannya = "June";
      }
      else if (bulan == 6) {
        bulannya = "July";
      }
      else if (bulan == 7) {
        bulannya = "August";
      }
      else if (bulan == 8) {
        bulannya = "September";
      }
      else if (bulan == 9) {
        bulannya = "October";
      }
      else if (bulan == 10) {
        bulannya = "November";
      }
      else if (bulan0 == 11) {
        bulannya = "December";
      }

      hasil = harinya + ",  " + tanggalnya + " " + bulannya + " " + tahun;
      resolve(hasil);
    } catch (error) {
      logger.error('Error formatJam ' + error.message);
    }
  });
}

function createPdf(
  fileName_,
  tanggal_,
  jam_,
  outlet_,
  room_,
  invoice_,
  order_penjualan_,
  pembayaran_,
  total_point_,
  total_menit_extend__,
  tanggal_checkin_,
  jam_checkin_
) {
  return new Promise((resolve, reject) => {
    try {
      var i;
      var m;
      var n;
      var total_point = total_point_;
      var fileName = fileName_;
      var tanggal_pembayaran = tanggal_;
      var jam_pembayaran = jam_;
      var outlet = outlet_;
      var room = room_;
      var invoice = invoice_;
      var order_penjualan = order_penjualan_;
      var pembayaran = pembayaran_;
      var total_menit_extend = total_menit_extend__;
      var total_jam_extend = parseInt(0);
      var total_menit_extend_ = parseInt(0);
      var tanggal_checkin = tanggal_checkin_;
      var jam_checkin__ = jam_checkin_;

      if (total_menit_extend > 0) {

        total_menit_extend_ = total_menit_extend % 60;
        if (total_menit_extend_ > 0) {
          total_menit_extend = total_menit_extend - total_menit_extend_;
          total_jam_extend = total_menit_extend / 60;
        } else {
          total_jam_extend = total_menit_extend / 60;
        }

        if (total_jam_extend.toString().length == 1) {
          total_jam_extend = "0" + total_jam_extend;
        }
        if (total_menit_extend_.toString().length == 1) {
          total_menit_extend_ = "0" + total_menit_extend_;
        }
      }


      var fontSize = parseInt(10);
      var fontSizeFooter = parseInt(8);
      //pengaturan gambar
      var lebar_gambar = parseInt(50);
      var batas_atas_gambar = 10;

      var top = parseInt(70);

      var batas_kiri_halaman = parseInt(10);
      var left2 = parseInt(batas_kiri_halaman + 70);

      var left3 = parseInt(left2 + 70);
      var left4 = parseInt(left3 + 70);
      var left5 = parseInt(left4 + 70);
      var left6 = parseInt(left5 + 70);

      var spasiAntarBaris = parseInt(12);
      var batasKiriKolom = parseInt(20);
      var bataskanan = parseInt(290);
      var batasPindahBaris = parseInt(30);
      var batasHeaderAtas = parseInt(8);
      var batasAtas;
      var lebarKertas = parseInt(300);
      var lebarAngka = parseInt(20);
      var lebarAngkaRupiah = parseInt(100);
      var lebarSubjectDiskon = parseInt(140);
      var tinggi_kertas = parseInt(0);

      var checkin;
      var checkout;
      var jam_checkin;
      var menit_checkin;
      var jam_checkout;
      var menit_checkout;
      var sewa_kamar;
      var total_fnb = parseInt(0);
      var total_diskon = parseInt(0);
      var total_sales = parseInt(0);
      var total_room_transfer = parseInt(0);

      //ukuran tinggi kertas
      //tinggi header invoice
      tinggi_kertas = tinggi_kertas + (17 * spasiAntarBaris);
      //tinggi pembayaran
      tinggi_kertas = tinggi_kertas + (pembayaran.length * spasiAntarBaris + 1);

      for (n = 0; n < invoice.length; n++) {
        if (n > 0) {
          total_room_transfer = total_room_transfer + invoice[n][0].total_all;
        }

        /* if (n == 0) {
          if (invoice[n][0].uang_muka > 0) {
            tinggi_kertas = tinggi_kertas + (1 * spasiAntarBaris);
          }
        } */

        tinggi_kertas = tinggi_kertas + (17 * spasiAntarBaris);

        if (order_penjualan[0][0].total_diskon_setelah_cancel > 0) {
          tinggi_kertas = tinggi_kertas + (order_penjualan[n].length * (3 * spasiAntarBaris));
        }
        else {
          tinggi_kertas = tinggi_kertas + (order_penjualan[n].length * (2 * spasiAntarBaris));
        }

      }

      // Create a document
      //const doc = new PDFDocument({size: 'A4'});      
      //const doc = new PDFDocument({width: 300,height: 3000}); 
      var doc = new PDFDocument({
        size: [300, tinggi_kertas],
        margins: { // by default, all are 72
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });

      // Pipe its output somewhere, like to a file or HTTP response
      // See below for browser usage
      doc.pipe(fs.createWriteStream(fileName));
      logger.info("fontpath " + fontpath);

      for (n = 0; n < invoice.length; n++) {
        //kamar terakhir
        if (n == 0) {

          sewa_kamar = (invoice[n][0].sewa_kamar +
            invoice[n][0].overpax +
            invoice[n][0].total_extend) -
            invoice[n][0].discount_kamar;
          sewa_kamar = convertRupiah.convert(sewa_kamar.toFixed(0));

          total_total = invoice[n][0].sewa_kamar;
          total_sales = invoice[n][0].total_all + total_room_transfer;

          checkin = invoice[0][0].jam_checkin;
          //checkout = invoice[0][0].jam_checkout;
          //ditambah langsung extend
          checkout = invoice[0][0].jam_checkout_plus_extend;

          jam_checkin = checkin.getUTCHours();
          if (jam_checkin.toString().length == 1) {
            jam_checkin = "0" + jam_checkin;
          }
          menit_checkin = checkin.getUTCMinutes();
          if (menit_checkin.toString().length == 1) {
            menit_checkin = "0" + menit_checkin;
          }
          jam_checkout = checkout.getUTCHours();
          if (jam_checkout.toString().length == 1) {
            jam_checkout = "0" + jam_checkout;
          }
          menit_checkout = checkout.getUTCMinutes();
          if (menit_checkout.toString().length == 1) {
            menit_checkout = "0" + menit_checkout;
          }

          doc.font(fontpath).fontSize(fontSize).text(outlet.data[0].nama_outlet, 0, (1 * spasiAntarBaris), { width: lebarKertas, align: 'center' });
          doc.font(fontpath).fontSize(fontSize).text(outlet.data[0].alamat_outlet, 0, (2 * spasiAntarBaris), { width: lebarKertas, align: 'center' });
          doc.font(fontpath).fontSize(fontSize).text(outlet.data[0].kota, 0, (3 * spasiAntarBaris), { width: lebarKertas, align: 'center' });
          doc.font(fontpath).fontSize(fontSize).text(outlet.data[0].tlp1, 0, (4 * spasiAntarBaris), { width: lebarKertas, align: 'center' });

          doc.font(fontpath).fontSize(fontSize).text("Room", batas_kiri_halaman, (top + (0 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Name", batas_kiri_halaman, (top + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Member", batas_kiri_halaman, (top + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Invoice No.", batas_kiri_halaman, (top + (3 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Date", batas_kiri_halaman, (top + (4 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Cashier", batas_kiri_halaman, (top + (5 * spasiAntarBaris)));

          if (invoice_[0][0].kamar_alias == "") {
            doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].kamar, left2, (top + (0 * spasiAntarBaris)));
          } else {
            doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].kamar_alias, left2, (top + (0 * spasiAntarBaris)));
          }

          doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].nama_member, left2, (top + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].member, left2, (top + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].invoice, left2, (top + (3 * spasiAntarBaris)));

          doc.font(fontpath).fontSize(fontSize).text(": " + tanggal_checkin + ",  " + jam_checkin__,
            left2, (top + (4 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(": " + room.recordset[0].chusr, left2, (top + (5 * spasiAntarBaris)));

          //horizontal atas
          doc
            .save().moveTo(batas_kiri_halaman, (top + (6 * spasiAntarBaris)))
            .lineTo(bataskanan, (top + (6 * spasiAntarBaris)))
            .fill(warna);

          if ((invoice_[0][0].jenis_kamar != 'BAR') && (invoice_[0][0].jenis_kamar != 'SOFA')) {
            doc.font(fontpath).fontSize(fontSize).text("Room Charge:", batas_kiri_halaman, (top + (7 * spasiAntarBaris)));
            doc.font(fontpath).fontSize(fontSize).text(jam_checkin + ":" + menit_checkin + " - " + jam_checkout + ":" + menit_checkout,
              batas_kiri_halaman, (top + (8 * spasiAntarBaris)));

            if (invoice[n][0].total_diskon_kamar > 0) {
              doc.font(fontpath).fontSize(fontSize).text("Promo", batas_kiri_halaman, (top + (9 * spasiAntarBaris)));
            }

            doc.font(fontpath).fontSize(fontSize).text(":", (9 * batasKiriKolom), (top + (8 * spasiAntarBaris)));
            doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert(invoice[n][0].sewa_kamar_sebelum_diskon.toFixed(0)),
              (9 * batasKiriKolom), (top + (8 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

            if (invoice[n][0].total_diskon_kamar > 0) {
              doc.font(fontpath).fontSize(fontSize).text(":", (9 * batasKiriKolom), (top + (9 * spasiAntarBaris)));
              doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert(invoice[n][0].total_diskon_kamar.toFixed(0)) + ")",
                (9 * batasKiriKolom), (top + (9 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });
            }

            batasAtas = parseInt((top + ((batasHeaderAtas + 2) * spasiAntarBaris)));
          } else {
            batasAtas = parseInt((top + ((batasHeaderAtas) * spasiAntarBaris)));
          }


          for (m = 0; m < order_penjualan.length; m++) {
            for (i = 0; i < order_penjualan[m].length; i++) {
              if (m == n) {

                if (order_penjualan[0][0].inventory != null) {
                  if (order_penjualan[m][i].qty_setelah_cancel > 0) {
                    doc.font(fontpath).fontSize(fontSize).text(order_penjualan[m][i].nama, batas_kiri_halaman, (batasAtas + 1));

                    doc.font(fontpath).fontSize(fontSize).text(order_penjualan[m][i].qty_setelah_cancel, (2 * batasKiriKolom), batasAtas + spasiAntarBaris,
                      { width: lebarAngka, align: 'right' });

                    doc.font(fontpath).fontSize(fontSize).text("x", (4 * batasKiriKolom), batasAtas + spasiAntarBaris);
                    doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((order_penjualan[m][i].price).toFixed(0)),
                      (3 * batasKiriKolom), (batasAtas + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                    doc.font(fontpath).fontSize(fontSize).text(":",
                      (9 * batasKiriKolom), (batasAtas + spasiAntarBaris));

                    doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((order_penjualan[m][i].total_sebelum_diskon_setelah_cancel).toFixed(0)),
                      (9 * batasKiriKolom), (batasAtas + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                    if (order_penjualan[m][i].total_diskon_setelah_cancel > 0) {
                      doc.font(fontpath).fontSize(fontSize).text((order_penjualan[m][i].promo_food),
                        (1 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris), { width: lebarSubjectDiskon, align: 'right' });
                      doc.font(fontpath).fontSize(fontSize).text(":",
                        (9 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris));
                      doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert((order_penjualan[m][i].total_diskon_setelah_cancel).toFixed(0)) + ")",
                        (9 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                      batasAtas = batasAtas + spasiAntarBaris + spasiAntarBaris + spasiAntarBaris;
                    }
                    else {
                      batasAtas = batasAtas + spasiAntarBaris + spasiAntarBaris;
                    }
                    total_fnb = total_fnb + order_penjualan[m][i].total_sebelum_diskon_setelah_cancel;
                    total_diskon = total_diskon + order_penjualan[m][i].total_diskon_setelah_cancel;
                  }

                }
              }
            }
          }

          doc
            .save().moveTo(batas_kiri_halaman, batasAtas)
            .lineTo(bataskanan, batasAtas)
            .fill(warna);
          doc
            .save().moveTo(batas_kiri_halaman, batasAtas + 2)
            .lineTo(bataskanan, batasAtas + 2)
            .fill(warna);

          doc.font(fontpath).fontSize(fontSize).text("Total Room", batas_kiri_halaman, (batasAtas + (1 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });
          doc.font(fontpath).fontSize(fontSize).text("Total F&B", batas_kiri_halaman, (batasAtas + (2 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });

          if (invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon > 0) {
            doc.font(fontpath).fontSize(fontSize).text("Total Disc F&B", batas_kiri_halaman, (batasAtas + (3 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });
          }

          doc.font(fontpath).fontSize(fontSize).text("Service", batas_kiri_halaman, (batasAtas + (4 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });
          doc.font(fontpath).fontSize(fontSize).text("Tax", batas_kiri_halaman, (batasAtas + (5 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });

          doc
            .save().moveTo((9 * batasKiriKolom), (batasAtas + (6 * spasiAntarBaris)))
            .lineTo(bataskanan, (batasAtas + (6 * spasiAntarBaris)))
            .fill(warna);


          doc.font(fontpathBold).fontSize(fontSize).text("Total", batas_kiri_halaman, (batasAtas + (7 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });
          if (total_room_transfer > 0) {
            doc.font(fontpathBold).fontSize(fontSize).text("Room Transfer", batas_kiri_halaman, (batasAtas + (8 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });
          }
          doc.font(fontpathBold).fontSize(fontSize).text("Total Sales", batas_kiri_halaman, (batasAtas + (9 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(sewa_kamar,
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((total_fnb).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          if (invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon > 0) {
            doc.font(fontpath).fontSize(fontSize).text(":",
              (9 * batasKiriKolom), (batasAtas + (3 * spasiAntarBaris)));
            doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert((
              invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon).toFixed(0)) + ")",
              (9 * batasKiriKolom), (batasAtas + (3 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });
          }

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (4 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((
            invoice[n][0].service_kamar + invoice[n][0].service_penjualan
          ).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (4 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (5 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((
            invoice[n][0].tax_kamar + invoice[n][0].tax_penjualan
          ).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (5 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });


          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris)));
          doc.font(fontpathBold).fontSize(fontSize).text(convertRupiah.convert(invoice[n][0].total_all.toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });

          if (total_room_transfer > 0) {
            doc.font(fontpath).fontSize(fontSize).text(":",
              (9 * batasKiriKolom), (batasAtas + (8 * spasiAntarBaris)));
            doc.font(fontpathBold).fontSize(fontSize).text(convertRupiah.convert(total_room_transfer.toFixed(0)),
              (9 * batasKiriKolom), (batasAtas + (8 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });
          }
          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (9 * spasiAntarBaris)));
          doc.font(fontpathBold).fontSize(fontSize).text(convertRupiah.convert((total_sales).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (9 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });

          batasAtas = batasAtas + (11 * spasiAntarBaris);

          for (i = 0; i < pembayaran.length; i++) {
            doc.font(fontpath).fontSize(fontSize).text(pembayaran[i].payment_type, batas_kiri_halaman, batasAtas);
            doc.font(fontpath).fontSize(fontSize).text(pembayaran[i].bank_type, left2, batasAtas);
            doc.font(fontpath).fontSize(fontSize).text(":",
              (9 * batasKiriKolom), batasAtas);

            if ((pembayaran[i].id_payment == 1) || (pembayaran[i].id_payment == 2)) {
              doc.font(fontpath).fontSize(fontSize).text("*********" + pembayaran[i].bank_akun_number,
                //"***" + pembayaran[i].bank_akun_number.substring(
                //3, 6)+"***"+
                //pembayaran[i].bank_akun_number.substring(
                //9, 12)+"****",                
                (left2 + (3 * batas_kiri_halaman)), batasAtas);
            }
            doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert(pembayaran[i].nominal.toFixed(0)),
              (9 * batasKiriKolom), batasAtas, { width: lebarAngkaRupiah, align: 'right' });
            batasAtas = batasAtas + spasiAntarBaris;
          }

          doc.font(fontpathBold).fontSize(fontSize).text("Points Earned", batas_kiri_halaman, (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpathBold).fontSize(fontSize).text("Points Balance", batas_kiri_halaman, (batasAtas + (2 * spasiAntarBaris)));

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)));

          doc.font(fontpath).fontSize(fontSize).text(total_point,
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text((room.recordset[0].point_reward + total_point),
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSizeFooter).text(tanggal_pembayaran + ",  " + jam_pembayaran +
            " " + room.recordset[0].summary_chusr,
            (7 * batasKiriKolom), (batasAtas + (4 * spasiAntarBaris)));

          batasAtas = batasAtas + (5 * spasiAntarBaris);

        }
        //kamar transfer
        else {
          total_fnb = parseInt(0);
          total_diskon = parseInt(0);
          sewa_kamar = (invoice[n][0].sewa_kamar +
            invoice[n][0].overpax +
            invoice[n][0].total_extend) -
            invoice[n][0].discount_kamar;
          sewa_kamar = convertRupiah.convert(sewa_kamar.toFixed(0));

          total_total = invoice[n][0].sewa_kamar;
          total_sales = invoice[n][0].total_all + total_room_transfer;

          checkin = invoice[n][0].jam_checkin;
          checkout = invoice[n][0].jam_checkout;
          jam_checkin = checkin.getUTCHours();
          if (jam_checkin.toString().length == 1) {
            jam_checkin = "0" + jam_checkin;
          }
          menit_checkin = checkin.getUTCMinutes();
          if (menit_checkin.toString().length == 1) {
            menit_checkin = "0" + menit_checkin;
          }
          jam_checkout = checkout.getUTCHours();
          if (jam_checkout.toString().length == 1) {
            jam_checkout = "0" + jam_checkout;
          }
          menit_checkout = checkout.getUTCMinutes();
          if (menit_checkout.toString().length == 1) {
            menit_checkout = "0" + menit_checkout;
          }

          doc
            .save().moveTo(batas_kiri_halaman, (batasAtas + spasiAntarBaris))
            .lineTo(bataskanan, (batasAtas + spasiAntarBaris))
            .fill(warna);

          batasAtas = batasAtas + spasiAntarBaris;
          doc.font(fontpath).fontSize(fontSize).text("ROOM TRANSFER BILL", batas_kiri_halaman, (batasAtas + (0 * spasiAntarBaris)));

          doc.font(fontpath).fontSize(fontSize).text("Room", batas_kiri_halaman, (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Date", batas_kiri_halaman, (batasAtas + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("Cashier", batas_kiri_halaman, (batasAtas + (3 * spasiAntarBaris)));

          //doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].kamar + " " + invoice[n][0].jenis_kamar,
          //  left2, (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(": " + invoice[n][0].kamar_alias, left2, (batasAtas + (1 * spasiAntarBaris)));

          doc.font(fontpath).fontSize(fontSize).text(": " + tanggal_pembayaran + ",  " + jam_pembayaran,
            left2, (batasAtas + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(": " + room.recordset[0].chusr, left2, (batasAtas + (3 * spasiAntarBaris)));

          doc
            .save().moveTo(batas_kiri_halaman, (batasAtas + (4 * spasiAntarBaris)))
            .lineTo(bataskanan, (batasAtas + (4 * spasiAntarBaris)))
            .fill(warna);


          doc.font(fontpath).fontSize(fontSize).text("Room Charge:", batas_kiri_halaman, (batasAtas + (5 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(jam_checkin + ":" + menit_checkin + " - " + jam_checkout + ":" + menit_checkout,
            batas_kiri_halaman, (batasAtas + (6 * spasiAntarBaris)));

          if (invoice[n][0].total_diskon_kamar > 0) {
            doc.font(fontpath).fontSize(fontSize).text("Promo", batas_kiri_halaman, (batasAtas + (7 * spasiAntarBaris)));
          }

          doc.font(fontpath).fontSize(fontSize).text(":", (9 * batasKiriKolom), (batasAtas + (6 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert(invoice[n][0].sewa_kamar_sebelum_diskon.toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (6 * spasiAntarBaris)),
            { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":", (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert(invoice[n][0].total_diskon_kamar.toFixed(0)) + ")",
            (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris)),
            { width: lebarAngkaRupiah, align: 'right' });


          batasAtas = batasAtas + (8 * spasiAntarBaris);

          for (m = 0; m < order_penjualan.length; m++) {
            for (i = 0; i < order_penjualan[m].length; i++) {
              if (m == n) {

                if (order_penjualan[0][0].inventory != null) {
                  if (order_penjualan[m][i].qty_setelah_cancel > 0) {
                    doc.font(fontpath).fontSize(fontSize).text(order_penjualan[m][i].nama, batas_kiri_halaman, (batasAtas + 1));

                    doc.font(fontpath).fontSize(fontSize).text(order_penjualan[m][i].qty_setelah_cancel, (2 * batasKiriKolom), batasAtas + spasiAntarBaris,
                      { width: lebarAngka, align: 'right' });

                    doc.font(fontpath).fontSize(fontSize).text("x", (4 * batasKiriKolom), batasAtas + spasiAntarBaris);

                    doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((order_penjualan[m][i].price).toFixed(0)),
                      (3 * batasKiriKolom), (batasAtas + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                    doc.font(fontpath).fontSize(fontSize).text(":",
                      (9 * batasKiriKolom), (batasAtas + spasiAntarBaris));

                    doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((order_penjualan[m][i].total_sebelum_diskon_setelah_cancel).toFixed(0)),
                      (9 * batasKiriKolom), (batasAtas + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                    if (order_penjualan[m][i].total_diskon_setelah_cancel > 0) {
                      doc.font(fontpath).fontSize(fontSize).text((order_penjualan[m][i].promo_food),
                        (1 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris), { width: lebarSubjectDiskon, align: 'right' });
                      doc.font(fontpath).fontSize(fontSize).text(":",
                        (9 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris));
                      doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert((order_penjualan[m][i].total_diskon_setelah_cancel).toFixed(0)) + ")",
                        (9 * batasKiriKolom), (batasAtas + spasiAntarBaris + spasiAntarBaris), { width: lebarAngkaRupiah, align: 'right' });

                      batasAtas = batasAtas + spasiAntarBaris + spasiAntarBaris + spasiAntarBaris;
                    }
                    else {
                      batasAtas = batasAtas + spasiAntarBaris + spasiAntarBaris;
                    }
                    total_fnb = total_fnb + order_penjualan[m][i].total_sebelum_diskon_setelah_cancel;
                    total_diskon = total_diskon + order_penjualan[m][i].total_diskon_setelah_cancel;

                  }
                }
              }
            }
          }

          doc
            .save().moveTo(batas_kiri_halaman, batasAtas)
            .lineTo(bataskanan, batasAtas)
            .fill(warna);

          doc
            .save().moveTo(batas_kiri_halaman, batasAtas + 2)
            .lineTo(bataskanan, batasAtas + 2)
            .fill(warna);

          doc.font(fontpath).fontSize(fontSize).text("Total Room", batas_kiri_halaman, (batasAtas + (1 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });
          doc.font(fontpath).fontSize(fontSize).text("Total F&B", batas_kiri_halaman, (batasAtas + (2 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });
          if (invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon > 0) {
            doc.font(fontpath).fontSize(fontSize).text("Total Disc F&B ", batas_kiri_halaman, (batasAtas + (3 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });
          }
          doc.font(fontpath).fontSize(fontSize).text("Service", batas_kiri_halaman, (batasAtas + (4 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });
          doc.font(fontpath).fontSize(fontSize).text("Tax", batas_kiri_halaman, (batasAtas + (5 * spasiAntarBaris)), { width: lebarSubjectDiskon, align: 'right' });

          doc
            .save().moveTo((9 * batasKiriKolom), (batasAtas + (6 * spasiAntarBaris)))
            .lineTo(bataskanan, (batasAtas + (6 * spasiAntarBaris)))
            .fill(warna);


          doc.font(fontpathBold).fontSize(fontSize).text("Total", batas_kiri_halaman, (batasAtas + (7 * spasiAntarBaris) + 1), { width: lebarSubjectDiskon, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(sewa_kamar,
            (9 * batasKiriKolom), (batasAtas + (1 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((total_fnb).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (2 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          if (invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon > 0) {
            doc.font(fontpath).fontSize(fontSize).text(":",
              (9 * batasKiriKolom), (batasAtas + (3 * spasiAntarBaris)));
            doc.font(fontpath).fontSize(fontSize).text("(" + convertRupiah.convert((
              invoice[n][0].discount_kamar + invoice[n][0].discount_penjualan + total_diskon).toFixed(0)) + ")",
              (9 * batasKiriKolom), (batasAtas + (3 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });
          }

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (4 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((
            invoice[n][0].service_kamar + invoice[n][0].service_penjualan
          ).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (4 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (5 * spasiAntarBaris)));
          doc.font(fontpath).fontSize(fontSize).text(convertRupiah.convert((
            invoice[n][0].tax_kamar + invoice[n][0].tax_penjualan
          ).toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (5 * spasiAntarBaris)), { width: lebarAngkaRupiah, align: 'right' });

          doc.font(fontpath).fontSize(fontSize).text(":",
            (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris)));
          doc.font(fontpathBold).fontSize(fontSize).text(convertRupiah.convert(invoice[n][0].total_all.toFixed(0)),
            (9 * batasKiriKolom), (batasAtas + (7 * spasiAntarBaris) + 1), { width: lebarAngkaRupiah, align: 'right' });

          batasAtas = batasAtas + (8 * spasiAntarBaris);

        }
      }

      doc.end();
      logger.info("create pdf finish");

      resolve(true);

    } catch (error) {
      logger.error('Error create pdf ' + error.message);
      resolve(false);
    }
  });
}

function getSulSud(ivc_) {
  return new Promise((resolve, reject) => {
    try {
      var ivc = ivc_;

      var SulSudQuery = " " +
        " select " +
        "[IHP_Sul].[Reception] as reception" +
        " ,[IHP_Sul].[Invoice] as invoice" +
        " ,[IHP_Sul].[Kamar] as kamar" +
        " ,[IHP_Sul].[Bayar] as bayar" +
        " ,[IHP_Sul].[Kembali] as kembali" +
        " ,[IHP_Sud].[Summary] as summary" +
        " ,[IHP_Sud].[ID_Payment] as id_payment" +
        " ,[IHP_Sud].[Nama_Payment] as payment_type" +
        " ,[IHP_Sud].[Member] as member" +
        " ,[IHP_Sud].[Nama] as nama" +
        " ,[IHP_Sud].[Input1] as bank_type" +
        " ,[IHP_Sud].[Input2] as bank_akun_name" +
        " ,[IHP_Sud].[Input3] as bank_akun_number" +
        " ,[IHP_Sud].[Input4] as bank_akun_approval" +
        " ,[IHP_Sud].[Pay_Value] as nominal" +
        " ,[IHP_Sud].[EDC_Machine] as edc_machine" +

        " from " +
        " IHP_Sul" +
        " " +

        " Inner join IHP_Sud" +
        " on IHP_Sul.Summary=IHP_Sud.Summary " +
        " where IHP_Sul.Invoice='" + ivc + "'";

      db.request().query(SulSudQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message);
          reject(err.message);
        } else {
          if (dataReturn.recordset.length > 0) {
            resolve(dataReturn.recordset);
          } else {
            resolve(false);
          }
        }
      });
    } catch (err) {
      logger.error(err.message);
      reject(err.message);
    }
  });
}

function getAddRewardTambahanPoint(summary_) {
  return new Promise((resolve, reject) => {
    try {
      var summary = summary_;

      var isiQuery = " " +
        " select " +
        " [Total_Point] " +

        " from " +
        " [IHP_AddReward]" +
        " where IHP_AddReward.Summary='" + summary + "'";

      db.request().query(isiQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message);
          reject(err.message);
        } else {
          if (dataReturn.recordset.length > 0) {
            var total_point = dataReturn.recordset[0].Total_Point;
            resolve(total_point);
          } else {
            resolve(false);
          }
        }
      });
    } catch (err) {
      logger.error(err.message);
      reject(err.message);
    }
  });
}

function getOrderPenjualan(ivc_) {
  return new Promise((resolve, reject) => {
    try {
      var ivc = ivc_;

      var cekOrderPenjualanQuery = " select " +
        " IHP_Okd.[OrderPenjualan] as order_penjualan" +
        " , IHP_Okd.[Inventory] as inventory" +
        " , IHP_Okd.[Nama] as nama" +
        " , IHP_Okd.[Price] as harga_per_item_setelah_diskon" +
        " , IHP_Okd.[Price] + (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty]) as price" +
        " , (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty]) as diskon" +
        " , IHP_Okd.[Qty] as qty" +
        " , IHP_Okd.[Total] as total_setelah_diskon" +
        " , IHP_Okd.[Location] as location" +

        " ,case when IHP_Okd.[Location] = 1  then 'KASIR'" +
        " when IHP_Okd.[Location] = 2 then 'DAPUR'" +
        " when IHP_Okd.[Location] = 3  then 'BAR' end" +
        " as keterangan_location" +
        " , CAST(IHP_Okd.[Printed] as BIT) as printed" +
        " , IHP_Okd.[Note] as note" +
        " , IHP_Okd.[SlipOrder] as slip_order" +
        " , isnull(IHP_Okd.[ID_COOKER], '') as id_cooker" +

        " , isnull(IHP_Okd_Promo.[Promo_Food], '') as promo_food" +
        " , isnull(IHP_Okd_Promo.[Harga_Promo], 0) as total_diskon" +

        " , IHP_Ivc.[kamar] as kamar" +
        " , IHP_Ivc.[Invoice] as invoice" +
        " , IHP_Ivc.[Transfer] as invoice_transfer" +
        " , CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +

        " , IHP_Ocd.[OrderCancelation] as order_cancelation" +
        " , sum(isnull(IHP_Ocd.[Qty], 0)) as qty_cancel " +
        " ,IHP_Okd.[Qty] - sum(isnull(IHP_Ocd.[Qty], 0)) as qty_setelah_cancel " +
        " ,(IHP_Okd.[Qty] - sum(isnull(IHP_Ocd.[Qty], 0)))*IHP_Okd.[Price] as total_setelah_diskon_cancel " +
        " ,(IHP_Okd.[Qty] - sum(isnull(IHP_Ocd.[Qty], 0)))*(IHP_Okd.[Price] + (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty])) as total_sebelum_diskon_setelah_cancel " +
        " ,(isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty]) * (IHP_Okd.[Qty] - sum(isnull(IHP_Ocd.[Qty], 0))) as total_diskon_setelah_cancel " +
        " ,(sum(isnull(IHP_Ocd.[Qty], 0)))*IHP_Okd.[Price] as total_cancel_setelah_diskon " +
        " ,(isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty])*( sum(isnull(IHP_Ocd.[Qty], 0))) as total_diskon_cancel " +
        " ,(sum(isnull(IHP_Ocd.[Qty], 0)))*(IHP_Okd.[Price] + (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty])) as total_cancel " +

        " from" +
        " IHP_Ivc" +

        " left join IHP_Okl" +
        " on IHP_Ivc.Reception = IHP_Okl.Reception" +
        " And IHP_Ivc.Kamar = IHP_Okl.Kamar" +

        " left join IHP_Okd" +
        " on IHP_Okl.OrderPenjualan = IHP_Okd.OrderPenjualan" +

        " left join IHP_Okd_Promo" +
        " on IHP_Okd.OrderPenjualan = IHP_Okd_Promo.OrderPenjualan" +
        " and IHP_Okd.Inventory = IHP_Okd_Promo.Inventory" +

        " left join IHP_Ocd" +
        " on IHP_Okd.OrderPenjualan = IHP_Ocd.OrderPenjualan" +
        " and IHP_Okd.Inventory = IHP_Ocd.Inventory" +
        " and IHP_Okd.SlipOrder = IHP_Ocd.SlipOrder" +

        " where IHP_Ivc.Invoice = '" + ivc + "'" +
        " group by" +
        " IHP_Okd.OrderPenjualan" +
        " , IHP_Okd.Inventory" +
        " , IHP_Okd.Nama" +
        " , IHP_Okd.Price" +
        " , IHP_Okd_Promo.Harga_Promo" +
        " , IHP_Okd.Qty" +
        " , IHP_Okd.Total" +
        " , IHP_Okd.Location" +
        " , IHP_Okd.Printed" +
        " , IHP_Okd.Note" +
        " , IHP_Okd.SlipOrder" +
        " , IHP_Okd.ID_COOKER" +
        " , IHP_Okd_Promo.Promo_Food" +
        " , IHP_Ivc.Kamar" +
        " , IHP_Ivc.Invoice" +
        " , IHP_Ivc.[Transfer]" +
        " , IHP_Ivc.[Status]" +
        " , IHP_Ocd.[OrderCancelation]" +
        " order by IHP_Okd.Nama asc";


      db.request().query(cekOrderPenjualanQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message);
          reject(err.message);
        } else {
          if (dataReturn.recordset.length > 0) {
            hasil_order_penjualan.push(dataReturn.recordset);

            if (dataReturn.recordset[0].invoice_transfer != "") {
              var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
              resolve(getOrderPenjualan(invoiceTransfer));
            }
            else {
              resolve(hasil_order_penjualan);
            }
          } else {
            resolve(hasil_order_penjualan);
          }
        }
      });

    } catch (err) {
      logger.error(err.message);
      reject(err.message);
    }
  });
}

function getNilaiInvoice(ivc_) {
  return new Promise((resolve, reject) => {
    try {
      var ivc = ivc_;

      var isiQuery = "" +
        `
        set
   dateformat dmy 
   SELECT
      [IHP_Ivc].[Invoice] as invoice,
      [IHP_Ivc].[DATE] as date,
      [IHP_Ivc].[Shift] as shift,
      [IHP_Ivc].[Reception] as reception,
      [IHP_Ivc].[Member] as member,
      [IHP_Ivc].[Nama] as nama,
      [IHP_Ivc].[Kamar] as kamar,
      [IHP_Ivc].[Sewa_Kamar] as sewa_kamar,
      [IHP_Ivc].[Total_Extend] as total_extend,
      [IHP_Ivc].[Overpax] as overpax,
      [IHP_Ivc].[Discount_Kamar] as discount_kamar,
      [IHP_Ivc].[Surcharge_Kamar] as surcharge_kamar,
      [IHP_Ivc].[Service_Kamar] as service_kamar,
      [IHP_Ivc].[Tax_Kamar] as tax_kamar,
      [IHP_Ivc].[Total_Kamar] as total_kamar,
      [IHP_Ivc].[Charge_Penjualan] as charge_penjualan,
      [IHP_Ivc].[Total_Cancelation] as total_cancelation,
      [IHP_Ivc].[Discount_Penjualan] as discount_penjualan,
      [IHP_Ivc].[Service_Penjualan] as service_penjualan,
      [IHP_Ivc].[Tax_Penjualan] as tax_penjualan,
      [IHP_Ivc].[Total_Penjualan] as total_penjualan,
      [IHP_Ivc].[Charge_Lain] as charge_lain,
      [IHP_Ivc].[Uang_Muka] as uang_muka,
      [IHP_Ivc].[Uang_Voucher] as uang_voucher,
      [IHP_Ivc].[Total_All] as total_all,
      [IHP_Ivc].[Transfer] as invoice_transfer,
      [IHP_Ivc].[Status] as status,
      [IHP_Ivc].[Chtime] as chtime,
      [IHP_Ivc].[Chusr] as chusr,
      [IHP_Ivc].[Printed] as printed,
      [IHP_Ivc].[Date_Trans] as date_trans,

      isnull([IHP_Ivc].[Sewa_Kamar_Sebelum_Diskon], 0)+isnull([IHP_Ivc].[Total_Extend_Sebelum_Diskon], 0) as sewa_kamar_sebelum_diskon,
      isnull([IHP_Ivc].[Diskon_Sewa_Kamar], 0)+isnull([IHP_Ivc].[Diskon_Extend_Kamar], 0) as total_diskon_kamar,

      IHP_Ivc.Jenis_Kamar as jenis_kamar,
      IHP_Rcp.[Member] as kode_member,
      IHP_Rcp.[Nama] as nama_member,
      IHP_Rcp.[Checkin] as checkin,
      IHP_Rcp.[Jam_Sewa] as jam_sewa,
      IHP_Rcp.[Menit_Sewa] as menit_sewa,
      IHP_Rcp.[Checkout] as checkout,
      IHP_Rcp.Checkin as jam_checkin,
      IHP_Rcp.Checkout as jam_checkout,
      IHP_Rcp.[QM1] as qm1,
      IHP_Rcp.[QM2] as qm2,
      IHP_Rcp.[QM3] as qm3,
      IHP_Rcp.[QM4] as qm4,
      IHP_Rcp.[QF1] as qf1,
      IHP_Rcp.[QF2] as qf2,
      IHP_Rcp.[QF3] as qf3,
      IHP_Rcp.[QF4] as qf4,
      IHP_Rcp.[PAX] as pax,
      IHP_Rcp.[Keterangan] as hp,
      IHP_Rcp.[Chtime] as chtime,
      IHP_Rcp.[MBL] as malam_besok_libur,
      IHP_Rcp.[Surcharge] as surcharge,
      IHP_Rcp.[Reservation] as reservation,
      IHP_Rcp.[Summary] as summary,
      IHP_Rcp.[KMS] as Keterangan,
      IHP_Rcp.[Date_Trans] as date_trans,
      IHP_Rcp.[Status_Promo] as status_promo,
      case
         when
            IHP_Rcp.[Status_Promo] = 1 
         then
            'NORMAL DISKON MEMBER' 
         when
            IHP_Rcp.[Status_Promo] = 2 
         then
            'PROMOSI NON MEMBER' 
         when
            IHP_Rcp.[Status_Promo] = 3 
         then
            'PROMOSI + DISKON MEMBER' 
      end
      as keterangan_status_promo , IHP_Rcp.[Id_Payment] as id_payment_uang_muka , 
      case
         when
            IHP_Rcp.[Id_Payment] = 0 
         then
            'CASH' 
         when
            IHP_Rcp.[Id_Payment] = 1 
         then
            'CREDIT' 
         when
            IHP_Rcp.[Id_Payment] = 2 
         then
            'DEBET' 
      end
      as keterangan_payment_uang_muka , isnull(IHP_Room.Kamar_Alias, '') as kamar_alias , sum(Jam_Extend*60) + (Menit_Extend) as jam_extend, 
      DATEADD(mi, isnull(sum(Jam_Extend*60) + (Menit_Extend),0), IHP_Rcp.Checkout) as jam_checkout_plus_extend 
   FROM
      [dbo].[IHP_Ivc] , [dbo].[IHP_Rcp] 
      left Join
         IHP_Ext 
         on [IHP_Ext].[Reception] = [IHP_Rcp].[Reception] , [dbo].[IHP_Room] 
   where
      [IHP_Ivc].[Invoice] = '${ivc}' 
      and [IHP_Ivc].[Invoice] = [IHP_Rcp].[Invoice] 
      and [IHP_Ivc].[Reception] = [IHP_Rcp].[Reception] 
      and [IHP_Ivc].[Kamar] = [IHP_Rcp].[Kamar] 
      and [IHP_Ivc].[Kamar] = [IHP_Room].[Kamar] 
   group by
      [IHP_Ivc].[Invoice], [IHP_Ivc].[DATE], [IHP_Ivc].[Shift] , [IHP_Ivc].[Reception] , [IHP_Ivc].[Member] , [IHP_Ivc].[Nama], [IHP_Ivc].[Kamar], [IHP_Ivc].[Sewa_Kamar] , [IHP_Ivc].[Total_Extend], [IHP_Ivc].[Overpax] , [IHP_Ivc].[Discount_Kamar] , [IHP_Ivc].[Surcharge_Kamar] , [IHP_Ivc].[Service_Kamar], [IHP_Ivc].[Tax_Kamar] , [IHP_Ivc].[Total_Kamar] , [IHP_Ivc].[Charge_Penjualan] , [IHP_Ivc].[Total_Cancelation] , [IHP_Ivc].[Discount_Penjualan] , [IHP_Ivc].[Service_Penjualan] , [IHP_Ivc].[Tax_Penjualan] , [IHP_Ivc].[Total_Penjualan] , [IHP_Ivc].[Charge_Lain] , [IHP_Ivc].[Uang_Muka] , [IHP_Ivc].[Uang_Voucher] , [IHP_Ivc].[Total_All] , [IHP_Ivc].[Transfer] , [IHP_Ivc].[Status] , [IHP_Ivc].[Chtime] , [IHP_Ivc].[Chusr] , [IHP_Ivc].[Printed] , [IHP_Ivc].[Date_Trans] , IHP_Ivc.Jenis_Kamar , IHP_Rcp.[Member] , IHP_Rcp.[Nama] , IHP_Rcp.[Checkin] , IHP_Rcp.[Jam_Sewa] , IHP_Rcp.[Menit_Sewa] , IHP_Rcp.[Checkout] , IHP_Rcp.Checkin , IHP_Rcp.Checkout , IHP_Rcp.[QM1] , IHP_Rcp.[QM2] , IHP_Rcp.[QM3] , IHP_Rcp.[QM4] , IHP_Rcp.[QF1] , IHP_Rcp.[QF2] , IHP_Rcp.[QF3] , IHP_Rcp.[QF4] , IHP_Rcp.[PAX] , IHP_Rcp.[Keterangan], IHP_Rcp.[Chtime] , IHP_Rcp.[MBL] , IHP_Rcp.[Surcharge], IHP_Rcp.[Reservation] , IHP_Rcp.[Summary] , IHP_Rcp.[KMS] , IHP_Rcp.[Date_Trans] , IHP_Rcp.[Status_Promo] , IHP_Rcp.Id_Payment, IHP_Room.Kamar_Alias, IHP_Ext.Menit_Extend,
      [IHP_Ivc].[Sewa_Kamar_Sebelum_Diskon],
      [IHP_Ivc].[Total_Extend_Sebelum_Diskon],
      [IHP_Ivc].[Diskon_Sewa_Kamar],
      [IHP_Ivc].[Diskon_Extend_Kamar]
        `;

      db.request().query(isiQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message);
          reject(err.message);
        } else {
          if (dataReturn.recordset.length > 0) {
            hasil_nilai_invoice.push(dataReturn.recordset);

            if (dataReturn.recordset[0].invoice_transfer != "") {
              var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
              resolve(getNilaiInvoice(invoiceTransfer));
            }
            else {
              resolve(hasil_nilai_invoice);
            }
          } else {
            resolve(hasil_nilai_invoice);
          }
        }
      });

    } catch (err) {
      logger.error(err.message);
      reject(err.message);
    }
  });
}

function updateIhpSulKirimEmail(ivc_, email_) {
  return new Promise((resolve, reject) => {
    try {
      var ivc = ivc_;
      var email = email_;

      var SulSudQuery = " " +
        "Update IHP_Sul set Emailed='1', Emailed_Address='" + email + "'" +
        " where IHP_Sul.Invoice='" + ivc + "'";

      db.request().query(SulSudQuery, function (err, dataReturn) {
        if (err) {
          logger.error(err.message);
          reject(err.message);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      logger.error(err.message);
      reject(err.message);
    }
  });
}