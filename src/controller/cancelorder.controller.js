var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var db;
var CheckinProses = require('../services/checkin.proses.js');
var IpAddressService = require('../services/ip.address.service.js');
var dgram = require('dgram');

//variable model
var InvoiceModel = require('./../model/IHP_InvoiceModel');
var SummaryModel = require('./../model/IHP_SummaryModel');
var RoomModel = require('./../model/IHP_RoomModel');
var UtilitiesModel = require('./../model/UtilitiesModel');
var MemberModel = require('./../model/IHP_MemberModel');
var OrderDetailsModel = require('./../model/IHP_OkdModel');
var OrderDetailsPromoModel = require('./../model/IHP_OkdPromoModel');
var CancelModel = require('./../model/IHP_OclModel');
var CancelDetailsModel = require('./../model/IHP_OcdModel');
var CancelDetailsPromoModel = require('./../model/IHP_OcdPromoModel');
var Config2Model = require('./../model/IHP_Config2');
//Variable table
var tableOcl = require('./../model/variabledb/IHP_Ocl');
var tableConfig3 = require('./../model/variabledb/IHP_Config3');

exports.submit = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _procSubmit(req, res);
};

async function _procSubmit(req, res) {
  //1--------------------------------------
  //Parameter Global
  var ErrorMsg = "";
  var Tmp;
  var statusCheck;
  var QtyOrder;
  var QtyCancel;
  var Ocd;
  var Okd;
  var Okd_Promo;
  var Code1 = await GetCode1();
  var Code = "";
  //2--------------------------------------

  //1--------------------------------------
  //Parameter dari body
  var Parameter = req.body;
  var roomCode = "";
  var chusr = "";
  var Cancel = "";
  var NewCancel = [];
  var NewCancelPromo = [];

  if (ErrorMsg == "") {
    roomCode = Parameter.room;
    chusr = Parameter.chusr;
    Cancel = Parameter.order_inventory;
  }
  /*[
    {
      "inventory": "PERM04",
      "nama": "PERM04",
      "qty": 1,
      "order_penjualan": "OKL-2010240005",
      "slip_order": "SOL-20102400061"
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
  //Cek apakah semua data cancel ada isinya
  if (ErrorMsg == "") {
    //Cek Cancel
    if (Cancel.length > 0) {
      for (a = 0; a < Cancel.length; a++) {

        if (Cancel[a].inventory == "") ErrorMsg = "Inventory, tidak boleh kosong";
        else if (Cancel[a].nama == "") ErrorMsg = "Nama, tidak boleh kosong";
        else if (Cancel[a].qty == "") ErrorMsg = "Jumlah, tidak boleh kosong";
        else if (Cancel[a].order_penjualan == "") ErrorMsg = "OrderPenjualan, tidak boleh kosong";
        else if (Cancel[a].slip_order == "") ErrorMsg = "SlipOrder, tidak boleh kosong";

        if (ErrorMsg != "") break;
      }
    }
    else {
      ErrorMsg = "Belum ada item cancel";
    }
  }

  //Cek apakah ada data kembar
  if (ErrorMsg == "") {
    for (a = 0; a < Cancel.length; a++) {
      statusCheck = true;

      Tmp = Cancel[a].inventory + "" + Cancel[a].order_penjualan;
      if (a < Cancel.length - 1) {
        for (b = a + 1; b < Cancel.length; b++) {
          if (Tmp == (Cancel[b].inventory + "" + Cancel[b].order_penjualan)) {
            statusCheck = false;
            ErrorMsg = "Terdapat data kembar untuk item " + Cancel[b].inventory + " dengan Okd " + Cancel[b].order_penjualan;
            break;
          }
        }
      }

      if (!statusCheck) break;
    }
  }

  //Cek apakah qty yang di cancel tidak melebihi pesanan
  //Sekalian cek apakah ada ordernya ?? kalau tidak ada maka error
  //Sekalian ngumpulin data cancel yg baru input, digabung dengan data lama (jika ada)
  var OcdBean;
  if (ErrorMsg == "") {
    for (a = 0; a < Cancel.length; a++) {
      statusCheck = true;

      //Melengkapi data Cancel untuk kebutuhan database
      OcdBean = new Object();
      OcdBean.Inventory = Cancel[a].inventory;
      OcdBean.Nama = Cancel[a].nama;
      OcdBean.OrderPenjualan = Cancel[a].order_penjualan;
      OcdBean.SlipOrder = Cancel[a].slip_order;

      //Mendapatkan Data Order
      Okd = await OrderDetailsModel.getInfo(Cancel[a].order_penjualan,
        Cancel[a].slip_order,
        Cancel[a].inventory,
        req,
        db);
      //Sekalian cek apakah ada ordernya ??
      if (Okd == "") {
        ErrorMsg = "Order untuk item " + Cancel[a].inventory + ", tidak ditemukan";
        QtyOrder = 0;

        statusCheck = false;
        break;
      }
      else {
        QtyOrder = Okd.Qty;
        OcdBean.Price = Okd.Price;
      }

      //Mendapatkan Data cancel
      Ocd = await CancelDetailsModel.getInfo(Cancel[a].order_penjualan,
        Cancel[a].slip_order,
        Cancel[a].inventory,
        req,
        db);
      if (Ocd == "") {
        QtyCancel = 0;

        //Melengkapi data Cancel untuk kebutuhan database
        OcdBean.Qty = Cancel[a].qty;
        OcdBean.Total = OcdBean.Price * Cancel[a].qty;
        OcdBean.Status = 1;
        OcdBean.Export = 0;
        OcdBean.Flag = 0;
      }
      else {
        QtyCancel = Ocd.Qty;
        //Jika ada, sekalian isi Code Cancelnya
        Code = Ocd.OrderCancelation;

        //Melengkapi data Cancel untuk kebutuhan database
        OcdBean.Qty = Ocd.Qty + Cancel[a].qty;
        OcdBean.Total = Ocd.Price * (Ocd.Qty + Cancel[a].qty);
        OcdBean.Status = Ocd.Status;
        OcdBean.Export = Ocd.Export;
        OcdBean.Flag = Ocd.Flag;
      }

      //Cek apakah qty yang di cancel tidak melebihi pesanan
      if ((Cancel[a].qty + QtyCancel) > QtyOrder) {
        statusCheck = false;
        ErrorMsg = "Qty cancel item " + Cancel[a].inventory + ", lebih besar dari jumlah order";
      }

      NewCancel.push(OcdBean);
      if (!statusCheck) break;
    }
  }
  //2--------------------------------------

  //1--------------------------------------
  //insert data OCL, khusus jika belum ada data
  var OclBean;
  if (ErrorMsg == "") {
    OclBean = new Object();
    OclBean.DATE = await UtilitiesModel.getDateNow(req, db);
    OclBean.Member = Invoice.Member;
    OclBean.Nama = Invoice.Nama;
    OclBean.Kamar = Invoice.Kamar;
    OclBean.Charge = 0;
    OclBean.Discount = 0;
    OclBean.Service = 0;
    OclBean.Tax = 0;
    OclBean.Total = 0;
    OclBean.Chusr = chusr;
    OclBean.Reception = Invoice.Reception;
    OclBean.Shift = await UtilitiesModel.getShift(req, db);

    //isinya query sesuai shift
    if (OclBean.Shift == 1) {
      OclBean.Date_Trans = "getdate()";
    } else if (OclBean.Shift == 2) {
      OclBean.Date_Trans = "getdate()";
    } else if (OclBean.Shift == 3) {
      OclBean.Date_Trans = "DATEADD(dd, -1, GETDATE())";
    }

    //mem-fix-kan shift, jika isinya 3 maka diisi 2
    if (OclBean.Shift == 3) { OclBean.Shift = 2; }

    if (Code == "") {
      //Inisialisasi Code
      OclBean.OrderCancelation = await GetCode2(Code1);
      Code = OclBean.OrderCancelation;

      StatusProcess = await CancelModel.InsertOcl(OclBean, req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal insert data Ocl";
      }
    }
  }

  //delete dan insert Ocd
  if (ErrorMsg == "") {
    for (a = 0; a < NewCancel.length; a++) {
      //Inisialisasi Code
      NewCancel[a].OrderCancelation = Code;

      //Delete
      StatusProcess = await CancelDetailsModel.DeleteOcd(NewCancel[a], req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal delete data Ocd";
      }

      //insert
      if (StatusProcess) {
        StatusProcess = await CancelDetailsModel.InsertOcd(NewCancel[a], req, db);
        if (!StatusProcess) {
          ErrorMsg = "Gagal insert data Ocd";
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

  //Mendapatkan data Ocd terbaru setelah update / insert data
  var TotalPerItem = 0;
  var DiscountPerItem = 0;
  var ServicePerItem = 0;
  var TaxPerItem = 0;

  var TotalItem = 0;
  var TotalDiscount = 0;
  var TotalService = 0;
  var TotalTax = 0;
  if (ErrorMsg == "") {
    Ocd = await CancelDetailsModel.getList(Code,
      req,
      db);
    if (Ocd != "") {
      for (a = 0; a < Ocd.length; a++) {
        DiscountPerItem = Ocd[a].Total * DiscountFnBMember;
        TotalDiscount = TotalDiscount + DiscountPerItem;
        TotalPerItem = Ocd[a].Total - DiscountPerItem;
        TotalItem = TotalItem + TotalPerItem;

        //Menghitung service
        if (Ocd[a].Service == 1) {
          ServicePerItem = (TotalPerItem * ServicePercent) + ServiceRp;
          TotalService = TotalService + ServicePerItem;
          TotalPerItem = TotalPerItem + ServicePerItem;
        }

        //Menghitung Pajak
        if (Ocd[a].Tax == 1) {
          TaxPerItem = (TotalPerItem * TaxPercent) + TaxRp;
          TotalTax = TotalTax + TaxPerItem;
          TotalPerItem = TotalPerItem + TaxPerItem;
        }
      }

      OclBean.Charge = TotalItem;
      OclBean.Discount = TotalDiscount;
      OclBean.Service = TotalService;
      OclBean.Tax = TotalTax;
      OclBean.Total = TotalItem - TotalDiscount + TotalService + TotalTax;
    }
  }

  //Update data OCL, ada hubungannya dg nilai
  if (ErrorMsg == "") {
    StatusProcess = await CancelModel.UpdateOcl(OclBean, req, db);
    if (!StatusProcess) {
      ErrorMsg = "Gagal update data Ocl";
    }
  }

  var OcdPromoBean;
  //delete dan insert Ocd_Promo
  if (ErrorMsg == "") {
    if (Ocd != "") {
      for (a = 0; a < Ocd.length; a++) {
        //Mendapatkan Data Order Promo
        Okd_Promo = await OrderDetailsPromoModel.getList(Ocd[a].OrderPenjualan,
          Ocd[a].SlipOrder,
          Ocd[a].Inventory,
          req,
          db);
        if (Okd_Promo != "") {
          for (b = 0; b < Okd_Promo.length; b++) {
            OcdPromoBean = new Object();
            OcdPromoBean.OrderCancelation = Code;
            OcdPromoBean.Inventory = Ocd[a].Inventory;
            OcdPromoBean.Promo_Food = Okd_Promo[b].Promo_Food;
            OcdPromoBean.Harga_Promo = Okd_Promo[b].Harga_Promo_PerItem * Ocd[a].Qty;
            OcdPromoBean.OrderPenjualan = Ocd[a].OrderPenjualan;
            OcdPromoBean.SlipOrder = Ocd[a].SlipOrder;
            NewCancelPromo.push(OcdPromoBean);
          }
        }
      }
    }


    for (a = 0; a < NewCancelPromo.length; a++) {
      //Delete
      StatusProcess = await CancelDetailsPromoModel.DeleteOcd(NewCancelPromo[a], req, db);
      if (!StatusProcess) {
        ErrorMsg = "Gagal delete data Ocd Promo";
      }

      //insert
      if (StatusProcess) {
        StatusProcess = await CancelDetailsPromoModel.InsertOcd(NewCancelPromo[a], req, db);
        if (!StatusProcess) {
          ErrorMsg = "Gagal insert data Ocd Promo";
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
      await new CheckinProses().updatePrintInvoiceIhpIvcBisaPrintUlangTagihan(db, room.Reception);
      var member_client = dgram.createSocket('udp4');
      //pesan print Slip Order Pos Lorong
      pesan = "UPLOAD_DATA_ORDER_CANCELATION";
      ip_address = await new IpAddressService().getIpAddress(db, "MEMBER CLIENT");
      port = await new IpAddressService().getUdpPort(db, "MEMBER CLIENT");
      if ((ip_address !== false) && (port !== false)) {
        port = port.recordset[0].server_udp_port;
        ip_address = ip_address.recordset[0].ip_address;
        port = parseInt(port);
        panjang_pesan = pesan.length;
        panjang_pesan = parseInt(panjang_pesan);
        logger.info("UPLOAD_DATA_ORDER_CANCELATION "+ip_address);
        member_client.send(pesan, 0, panjang_pesan, port, ip_address, function (err, bytes) {
          member_client.close();
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

  query = "SELECT " + tableConfig3.OCL + " " +
    "FROM " + tableConfig3.table + " " +
    "WHERE " + tableConfig3.Data + " = '1'";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_Bukti = dataReturn.recordset[0].OCL;
          } else {
            No_Bukti = "OCA";
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

  query = "SELECT " + tableOcl.OrderCancelation + " " +
    "FROM " + tableOcl.table + " " +
    "WHERE " + tableOcl.OrderCancelation + " LIKE '" + tmpCode + "%' " +
    "ORDER BY " + tableOcl.OrderCancelation + " DESC";

  return new Promise((resolve, reject) => {
    try {
      db.request().query(query, function (err, dataReturn) {
        if (err) {
          logger.error(err.message + ' Error prosesQuery ' + query);
        } else {
          if (dataReturn.recordset.length > 0) {
            No_BuktiTmp = dataReturn.recordset[0].OrderCancelation;
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
