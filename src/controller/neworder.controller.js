var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var db;
var dgram = require('dgram');
var CheckinProses = require('../services/checkin.proses.js');

//variable model
var InvoiceModel = require('./../model/IHP_InvoiceModel');
var SummaryModel = require('./../model/IHP_SummaryModel');
var RoomModel = require('./../model/IHP_RoomModel');
var UtilitiesModel = require('./../model/UtilitiesModel');
var MemberModel = require('./../model/IHP_MemberModel');
var SlipOrderDetailsModel = require('./../model/IHP_SodModel');
var SlipOrderDetailsPromoModel = require('./../model/IHP_SodPromoModel');
var OrderModel = require('./../model/IHP_OklModel');
var OrderDetailsModel = require('./../model/IHP_OkdModel');
var OrderDetailsPromoModel = require('./../model/IHP_OkdPromoModel');
var Config2Model = require('./../model/IHP_Config2');
//Variable table
var tableSod = require('./../model/variabledb/IHP_Sod');
var tableOkl = require('./../model/variabledb/IHP_Okl');
var tableConfig3 = require('./../model/variabledb/IHP_Config3');
var IpAddressService = require('../services/ip.address.service.js');
var ConfigPos = require('../services/config.pos.js');

exports.submit = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _procSubmit(req, res);
};

exports.getOrder = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _procGetOrder(req, res);
};

async function _procSubmit(req, res) {
  //1--------------------------------------
  //Parameter Global
  var ErrorMsg = "";
  var Tmp;
  var statusCheck;
  var Okd;
  var Sod;
  var Sod_Promo;
  var Code1 = await GetCode1();
  var Code = "";
  var query;
  //2--------------------------------------

  //1--------------------------------------
  //Parameter dari body
  var Parameter = req.body;
  var roomCode = "";
  var chusr = "";
  var Order = "";
  var NewOrder = [];
  var NewOrderPromo = [];
  var slip_order = "";
  var qty_finish = "";
  var fnb_finish = "";

  if (ErrorMsg == "") {
    roomCode = Parameter.room;
    chusr = Parameter.chusr;
    Order = Parameter.order_inventory;
  }
  /*[
    {
      "Inventory": "PERM04",
      "Name": "PERM04",
      "Qty": 1,
      "SlipOrder": "SOL-20102400061"
    }
  ]*/
  //2--------------------------------------

  //1--------------------------------------
  //Data dari database
  var Invoice;
  var Member;
  var DiscountFnBMember;

  //Ambil data Room
  if (ErrorMsg == "") {
    room = await RoomModel.getInfo(roomCode, req, db);
    ErrorMsg = await checkRoom(room);
  }

  //Cek User is exist
  if (ErrorMsg == "") {
    if (chusr == "") ErrorMsg = "User tidak boleh kosong";
  }

  //Cek Invoice is exist
  if (ErrorMsg == "") {
    Invoice = await InvoiceModel.getInfo(room.Reception, req, db);
    if (Invoice == "") ErrorMsg = "Invoice tidak ditemukan";
  }

  //Ambil data member
  if (ErrorMsg == "") {
    Member = await MemberModel.getInfo(Invoice.Member, req, db);
    if (Member == "") DiscountFnBMember = 0;
    else DiscountFnBMember = Member.Diskon_Food / 100;
  }

  //Cek Summary is exist
  if (ErrorMsg == "") {
    Summary = await SummaryModel.getInfo(room.Reception, req, db);
    if (Summary != "") ErrorMsg = "Sudah terdapat pembayaran";
  }
  //2--------------------------------------

  //1--------------------------------------
  //Cek apakah semua data order ada isinya
  if (ErrorMsg == "") {
    //Cek Order
    if (Order.length > 0) {
      for (a = 0; a < Order.length; a++) {

        if (Order[a].inventory == "") ErrorMsg = "Inventory, tidak boleh kosong";
        else if (Order[a].nama == "") ErrorMsg = "Nama, tidak boleh kosong";
        else if (Order[a].qty == "") ErrorMsg = "Jumlah, tidak boleh kosong";
        else if (Order[a].slip_order == "") ErrorMsg = "SlipOrder, tidak boleh kosong";

        if (ErrorMsg != "") break;
      }
    }
    else {
      ErrorMsg = "Belum ada item order";
    }
  }

  //Cek apakah ada data kembar
  if (ErrorMsg == "") {
    for (a = 0; a < Order.length; a++) {
      statusCheck = true;

      Tmp = Order[a].inventory + "" + Order[a].slip_order;
      if (a < Order.length - 1) {
        for (b = a + 1; b < Order.length; b++) {
          if (Tmp == (Order[b].inventory + "" + Order[b].slip_order)) {
            statusCheck = false;
            ErrorMsg = "Terdapat data kembar untuk item " + Order[b].inventory + " dengan Sod " + Order[b].slip_order;
            break;
          }
        }
      }

      if (!statusCheck) break;
    }
  }

  //cek apakah ada slipordernya ??
  //kalau tidak ada maka error
  //kalau ada, cek apakah sudah di DO
  var OkdBean;
  if (ErrorMsg == "") {
    for (a = 0; a < Order.length; a++) {
      statusCheck = true;

      //Melengkapi data Order untuk kebutuhan database
      OkdBean = new Object();
      OkdBean.Inventory = Order[a].inventory;
      OkdBean.Nama = Order[a].nama;
      OkdBean.SlipOrder = Order[a].slip_order;
      OkdBean.Location = 1;
      OkdBean.Status = 5;
      OkdBean.Export = 0;
      OkdBean.Printed = -1;
      OkdBean.Note = '';

      slip_order = Order[a].slip_order;
      qty_finish = Order[a].qty;
      fnb_finish = Order[a].nama;

      //Mendapatkan Data SlipOrder
      Sod = await SlipOrderDetailsModel.getInfo(Order[a].slip_order,
        Order[a].inventory,
        req,
        db);
      //Sekalian cek apakah ada slipordernya ?? kalau tidak ada maka error
      if (Sod == "") {
        ErrorMsg = "Slip order untuk item " + Order[a].inventory + ", tidak ditemukan";

        statusCheck = false;
        break;
      }
      else { // kalau ada, cek apakah statusnya sudah 5 (DO)
        if (Sod.Status == 5) {
          ErrorMsg = "Slip order untuk item " + Order[a].inventory + ", sudah di kirim";
        }
        OkdBean.Price = Sod.Price;
      }

      OkdBean.Qty = Order[a].qty;
      OkdBean.Total = OkdBean.Price * Order[a].qty;

      NewOrder.push(OkdBean);
      if (!statusCheck) break;
    }
  }
  //2--------------------------------------

  //1--------------------------------------
  //insert data OKL, khusus jika belum ada data
  var OklBean;
  if (ErrorMsg == "") {
    OklBean = new Object();
    OklBean.DATE = await UtilitiesModel.getDateNow(req, db);
    OklBean.Member = Invoice.Member;
    OklBean.Nama = Invoice.Nama;
    OklBean.Kamar = Invoice.Kamar;
    OklBean.Total = 0;
    OklBean.Discount = 0;
    OklBean.Service = 0;
    OklBean.Tax = 0;
    OklBean.TotalValue = 0;
    OklBean.Chusr = chusr;
    OklBean.Reception = Invoice.Reception;
    OklBean.Shift = await UtilitiesModel.getShift(req, db);
    OklBean.Status = 1;

    //isinya query sesuai shift
    if (OklBean.Shift == 1) {
      OklBean.Date_Trans = "getdate()";
    } else if (OklBean.Shift == 2) {
      OklBean.Date_Trans = "getdate()";
    } else if (OklBean.Shift == 3) {
      OklBean.Date_Trans = "DATEADD(dd, -1, GETDATE())";
    }

    //mem-fix-kan shift, jika isinya 3 maka diisi 2
    if (OklBean.Shift == 3) { OklBean.Shift = 2; }

    if (Code == "") {
      //Inisialisasi Code
      OklBean.OrderPenjualan = await GetCode2(Code1);
      Code = OklBean.OrderPenjualan;

      StatusProcess = await OrderModel.InsertOkl(OklBean, req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal insert data Okl";
      }
    }
  }

  //insert Okd
  if (ErrorMsg == "") {
    for (a = 0; a < NewOrder.length; a++) {
      //Inisialisasi Code
      NewOrder[a].OrderPenjualan = Code;

      //insert
      StatusProcess = await OrderDetailsModel.InsertOkd(NewOrder[a], req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal insert data Okd";
      }

      //jika tidak ada error, maka update status SOD menjadi 5 (sudah DO)
      //dan update Qty_Diterima sesuai dengan yg mau di DO
      if (StatusProcess) {
        query = "UPDATE " + tableSod.table + " " +
          "SET " +
          tableSod.Status + " = 5, " +
          tableSod.Qty_Terima + " = " + NewOrder[a].Qty + " " +
          "WHERE " +
          tableSod.SlipOrder + " = '" + NewOrder[a].SlipOrder + "' AND " +
          tableSod.Inventory + " = '" + NewOrder[a].Inventory + "'";
        StatusProcess = await UtilitiesModel.execute(query, req, db);
        if (!StatusProcess) {
          ErrorMsg = "Gagal update data Sod";
        }
      }
    }
  }

  //Cari dulu nilai service dan pajaknya
  var ServicePercent = 0;
  var TaxPercent = 0;
  var ServiceRp = 0;
  var TaxRp = 0;
  var Config2;
  //Mendapatkan data service dan pajak
  if (ErrorMsg == "") {
    Config2 = await Config2Model.getInfo(req, db);
    if (Config2 != "") {
      ServicePercent = Config2.Service_Persen_Food / 100;
      TaxPercent = Config2.Tax_Persen_Food / 100;
      ServiceRp = Config2.Service_Rp_Food;
      TaxRp = Config2.Tax_Rp_Food;
    }
  }

  //Mendapatkan data Okd terbaru setelah update / insert data
  var TotalPerItem = 0;
  var DiscountPerItem = 0;
  var ServicePerItem = 0;
  var TaxPerItem = 0;

  var TotalItem = 0;
  var TotalDiscount = 0;
  var TotalService = 0;
  var TotalTax = 0;
  if (ErrorMsg == "") {
    Okd = await OrderDetailsModel.getListByCode(Code,
      req,
      db);
    if (Okd != "") {
      for (a = 0; a < Okd.length; a++) {
        DiscountPerItem = Okd[a].Total * DiscountFnBMember;
        TotalDiscount = TotalDiscount + DiscountPerItem;
        TotalPerItem = Okd[a].Total - DiscountPerItem;
        TotalItem = TotalItem + TotalPerItem;

        //Menghitung service
        if (Okd[a].Service == 1) {
          ServicePerItem = (TotalPerItem * ServicePercent) + ServiceRp;
          TotalService = TotalService + ServicePerItem;
          TotalPerItem = TotalPerItem + ServicePerItem;
        }

        //Menghitung Pajak
        if (Okd[a].Tax == 1) {
          TaxPerItem = (TotalPerItem * TaxPercent) + TaxRp;
          TotalTax = TotalTax + TaxPerItem;
          TotalPerItem = TotalPerItem + TaxPerItem;
        }
      }

      OklBean.Total = TotalItem;
      OklBean.Discount = TotalDiscount;
      OklBean.Service = TotalService;
      OklBean.Tax = TotalTax;
      OklBean.TotalValue = TotalItem - TotalDiscount + TotalService + TotalTax;
    }
  }

  //Update data OKL, ada hubungannya dg nilai
  if (ErrorMsg == "") {
    StatusProcess = await OrderModel.UpdateOkl(OklBean, req, db);
    if (!StatusProcess) {
      ErrorMsg = "Gagal update data Okl";
    }
  }

  var OkdPromoBean;
  //insert Okd_Promo
  if (ErrorMsg == "") {
    if (Okd != "") {
      for (a = 0; a < Okd.length; a++) {
        //Mendapatkan Data Slip Order Promo
        Sod_Promo = await SlipOrderDetailsPromoModel.getList(Okd[a].SlipOrder,
          Okd[a].Inventory,
          req,
          db);
        if (Sod_Promo != "") {
          for (b = 0; b < Sod_Promo.length; b++) {
            OkdPromoBean = new Object();
            OkdPromoBean.OrderPenjualan = Code;
            OkdPromoBean.Inventory = Okd[a].Inventory;
            OkdPromoBean.Promo_Food = Sod_Promo[b].Promo_Food;
            OkdPromoBean.Harga_Promo = Sod_Promo[b].Harga_Promo_PerItem * Okd[a].Qty;
            OkdPromoBean.SlipOrder = Okd[a].SlipOrder;
            NewOrderPromo.push(OkdPromoBean);
          }
        }
      }
    }


    for (a = 0; a < NewOrderPromo.length; a++) {
      //insert
      if (StatusProcess) {
        StatusProcess = await OrderDetailsPromoModel.InsertOkd(NewOrderPromo[a], req, db);
        if (!StatusProcess) {
          ErrorMsg = "Gagal insert data Okd Promo";
        }
      }
    }
  }
  //2--------------------------------------

  //Hitung ulang invoice penjualan
  if (ErrorMsg == "") {
    StatusProcess = await InvoiceModel.recountPenjualan(room.Reception, req, db);
    if (!StatusProcess) {
      ErrorMsg = "Gagal hitung ulang invoice";
    }
    else {
      //bisa print ulang tagihan karena ada penambahan order
      await new CheckinProses().updatePrintInvoiceIhpIvcBisaPrintUlangTagihan(db, room.Reception);
      
      var cetak_order_penjualan_di_pos = await new ConfigPos().getCetakOrderPenjualanDiPos(db);
      if (cetak_order_penjualan_di_pos == 1) {
      //pesan print Order penjualan Pos Lorong
       var client_pos = dgram.createSocket('udp4');
      pesan = "PRINT_ORDER_PENJUALAN_POINT_OF_SALES_LORONG";
      ip_address = req.config.ip_address_pos;
      port = await new IpAddressService().getUdpPort(db, "POINT OF SALES");
      if ((ip_address !== false) && (port !== false)) {
        port = port.recordset[0].server_udp_port;
        port = parseInt(port);
        panjang_pesan = pesan.length;
        panjang_pesan = parseInt(panjang_pesan);
        logger.info("Send Sinyal PRINT_ORDER_PENJUALAN_POINT_OF_SALES_LORONG to POINT OF SALES");
        client_pos.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
          client_pos.close();
        });
      } 
    }

      var member_client = dgram.createSocket('udp4');
      pesan = "UPLOAD_DATA_ORDER_PENJUALAN";
      ip_address = await new IpAddressService().getIpAddress(db, "MEMBER CLIENT");
      port = await new IpAddressService().getUdpPort(db, "MEMBER CLIENT");
      if ((ip_address !== false) && (port !== false)) {
        port = port.recordset[0].server_udp_port;
        ip_address = ip_address.recordset[0].ip_address;
        port = parseInt(port);
        panjang_pesan = pesan.length;
        panjang_pesan = parseInt(panjang_pesan);
        logger.info("Send Sinyal UPLOAD_DATA_ORDER_PENJUALAN to MEMBER CLIENT");
        member_client.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
          member_client.close();
        });
      }

      //kirim sinyal to Pos Lorong android
      var client_pos_lorong_android = dgram.createSocket('udp4');
      pesan = "Order Front Office Android Finish " + qty_finish + " X " + fnb_finish;
      ip_address = await new IpAddressService().getIpAddressPos(db, slip_order);
      port = 7072;
      if ((ip_address !== false)) {
        ip_address = ip_address.recordset[0].ip_address;
        port = parseInt(port);
        panjang_pesan = pesan.length;
        panjang_pesan = parseInt(panjang_pesan);
        logger.info("Send SinyalOrder Front Office Android Finish to Pos Lorong android");
        client_pos_lorong_android.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
          client_pos_lorong_android.close();
        });
      }

    }
  }

  if (ErrorMsg != "") {
    console.log(ErrorMsg);
    logger.info(ErrorMsg);
    dataResponse = new ResponseFormat(false, null, ErrorMsg);
    res.send(dataResponse);
  }
  else {
    dataResponse = new ResponseFormat(true, Parameter);
    res.send(dataResponse);
  }
}

//Fungsi untuk cek room
function checkRoom(room) {
  var ErrorMsg = "";

  if (room == "") ErrorMsg = "Kamar tidak terdaftar";
  else if (room.Reception == "" || room.Reception == "NULL") ErrorMsg = "Tidak bisa melanjutkan proses, belum ada penjualan";

  return ErrorMsg;
}

function GetCode1() {
  var today = new Date(); //mendapatkan tanggal sekarang
  var No_Bukti;
  var tmpNo_Bukti;
  var Day;
  var Month;
  var Year;
  var query;

  Year = today.getFullYear().toString().substr(-2);
  Month = (today.getMonth() + 1).toString().padStart(2, "0");
  Day = today.getDate().toString().padStart(2, "0");

  query = "SELECT " + tableConfig3.OKL + " " +
    "FROM " + tableConfig3.table + " " +
    "WHERE " + tableConfig3.Data + " = '1'";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_Bukti = dataReturn.recordset[0].OKL;
          } else {
            No_Bukti = "OKA";
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

  query = "SELECT " + tableOkl.OrderPenjualan + " " +
    "FROM " + tableOkl.table + " " +
    "WHERE " + tableOkl.OrderPenjualan + " LIKE '" + tmpCode + "%' " +
    "ORDER BY " + tableOkl.OrderPenjualan + " DESC";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_BuktiTmp = dataReturn.recordset[0].OrderPenjualan;
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

async function _procGetOrder(req, res) {
  //1--------------------------------------
  //Parameter Global
  var ErrorMsg = "";
  var Okd = "";
  var room;
  //2--------------------------------------

  //1--------------------------------------
  //Parameter dari body
  var roomCode = req.params.room;
  //2--------------------------------------

  //1--------------------------------------
  //Data dari database
  var Invoice;

  //Ambil data Room
  if (ErrorMsg == "") {
    room = await RoomModel.getInfo(roomCode, req, db);
    ErrorMsg = await checkRoom(room);
  }

  //Cek Invoice is exist
  if (ErrorMsg == "") {
    Invoice = await InvoiceModel.getInfo(room.Reception, req, db);
    if (Invoice == "") ErrorMsg = "Invoice tidak ditemukan";
  }

  //Cek Summary is exist
  if (ErrorMsg == "") {
    Summary = await SummaryModel.getInfo(room.Reception, req, db);
    if (Summary != "") ErrorMsg = "Sudah terdapat pembayaran";
  }
  //2--------------------------------------

  //1--------------------------------------
  //Mendapatkan data order
  if (ErrorMsg == "") {
    Okd = await OrderDetailsModel.getList(room.Reception,
      req,
      db);

    if (Okd == "") ErrorMsg = "Tidak ada data order";
  }

  if (ErrorMsg != "") {
    console.log(ErrorMsg);
    logger.info(ErrorMsg);
    dataResponse = new ResponseFormat(false, null, ErrorMsg);
    res.send(dataResponse);
  }
  else {
    dataResponse = new ResponseFormat(true, Okd);
    res.send(dataResponse);
  }
}
