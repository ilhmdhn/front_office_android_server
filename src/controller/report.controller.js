var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var db ;

var UtilitiesModel = require('./../model/UtilitiesModel');
var InvoiceModel = require('./../model/IHP_InvoiceModel');
var report = require('../services/report');
var encryption = require('../util/encryption')
var moment = require('moment');
var dateFormat = require('dateformat');
const { Console } = require('console');
const Report = require('../services/report');


exports.getUser = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    try{

      var levelUserTemp = req.query.level_user;
      var levelUser = await encryption.enkripsi_dekripsi_1(levelUserTemp);
      levelUser = await encryption.enkripsi_dekripsi_2(levelUser, true);
      
      var isiQuery  = `SELECT * from IHP_User WHERE Level_User = ${levelUser}`;

      db.request().query(isiQuery, function (err, dataReturn) {
        if (err) {
            logger.error(err.message);
            res.send(new ResponseFormat(false, null, err.message));
        } else {
            if (dataReturn.rowsAffected>0) {
              showDataUser(dataReturn, res)
            }
            else {
                res.send(new ResponseFormat(false, null, "Data Not Found"));
            }
        }
    });

    } catch(error){
      logger.error(error);
      logger.error(error.message);
      dataResponse = new ResponseFormat(false, null, error.message);
      res.send(dataResponse);
    }
}

async function showDataUser(login_, res){
  var username = [];

  var login = login_;


  for (var a=0; login.rowsAffected > a; a++){  
  var user_id_temp = await encryption.enkripsi_dekripsi_1(login.recordset[a].User_ID);
  var user_id = await encryption.enkripsi_dekripsi_2(user_id_temp,false);
  username.push({
      username: user_id
  })      
  }
  res.send(new ResponseFormat(true, username));
}

exports.getCash = async function (req, res) {
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _getCash(req, res);
};

async function _getCash(req, res) {
  //db = await new DBConnection().getPoolConnection();
  var ErrorMsg;
  var Parameter;
  var Shift_Lap;
  var DateSeach;
  var Username;
  var TglIn;
  var TglOut;
  var DateTmp;
  var TglAwal;
  var TglAkhir;
  var lCheckIn;
  var lJam;
  var lTamu;
  var lCheckinPiutang;
  var lJamPiutang;
  var lTamuPiutng;
  var Jam_CheckIn;
  var Query;
  var dataQuery;
  var dataQuery1;
  var temp;
  var temp2;
  var temp3;
  var Sewa_Kamar;
  var Tot_Penj;
  var Uang_Muka;
  var eSewaKamar;
  var eMakMin;
  var ePiutangShift;
  var titlePiutang;
  var loopInvoiceTransfer;
  var InvoiceTransfer;
  var HutangRsv;
  var eHutangReservasi;
  var StatusProcess;
  var Hutang1;
  var Hutang2;
  var Hutang3;
  var Hutang5;
  var eHutangReservasiUangMukaCheckinSudahCheckinBelumBayar;
  var eHutangReservasiUangMukaReservasiSudahCheckinBelumBayar;
  var eHutangReservasiUangMukaReservasiBelumCheckin;
  var eHutangReservasiUangMukaReservasisudahcheckin;
  var eLain;
  var Lain;
  var Cash_TopUp;
  var NilaiTopUp;
  var Cash_FO;
  var Cash1;
  var Cash2;
  var Cash3;
  var Cash4;
  var Cash5;
  var eCancelUangMukaReservasi;
  var eUangMukaRsvSudahCheckin;
  var eUangMukaReservasi;
  var eUangMukaRsvBelumCheckin;
  var eUangMukaReservasiSudahCheckin;
  var ePembayaranCashCheckin;
  var Cash;
  var eTunai;
  var eFO_Cash;
  var eSC_Cash;
  var eTotal_Cash;
  var Tunai;
  var Selisih;
  var Credit1;
  var Credit2;
  var Credit3;
  var Credit4;
  var Credit5;
  var Credit6;
  var Credit7;
  var Jum1;
  var Jum2;
  var Jum3;
  var Jum4;
  var Jum5;
  var Jum6;
  var Jum7;
  var eCreditCancelUangMukaReservasi;
  var eCreditUangMukaRsvCheckinBelumCheckin;
  var eCreditUangMukaRevervasi;
  var eCreditUangMukaReservasiBelumCheckin;
  var eCreditUangMukaReservasiSudahCheckin;
  var eCreditPembayaranCheckin;
  var Credit_FO;
  var Jum_FO;
  var eKredit;
  var eFO_CreditCard;
  var eSC_CreditCard;
  var eTotal_CreditCard;
  var eLembarKK;
  var eFO_LembarCreditCard;
  var eSC_LembarCreditCard;
  var eTotal_LembarCreditCard;
  var Debet1;
  var Debet2;
  var Debet3;
  var Debet4;
  var Debet5;
  var Debet6;
  var Debet7;
  var eDebitCancekUangMukaReservasi;
  var eDebetUangMukaCheckinSUdahCheckin;
  var eDebetUangMukaReservasi;
  var eDebetUangMukaReservasiBelumCheckin;
  var eDebitUangMukaReservasiSudahCheckin;
  var Debet_FO;
  var eDebet;
  var eFO_DebetCard;
  var eSC_DebetCard;
  var eTotal_DebetCard;
  var eLembarKD;
  var eFO_LembarDebetCard;
  var eSC_LembarDebetCard;
  var eTotal_LembarDebetCard;
  var Voucher;
  var Jum;
  var eVoucher;
  var eLembarVCR;
  var Piutang;
  var ePiutang;
  var Comp;
  var eEntertainment;
  var NilaiSC;
  var eSmartCard;
  var eHutangSC;
  var UM;
  var eUangMuka;
  var E_Money;
  var eEMoney;
  var poinMembership;
  var ePoinMembership;
  var lTotal1;
  var lTotal2;

  ErrorMsg = "";

  Parameter = req.body;
  Shift_Lap = Parameter.shift;
  DateSeach = Parameter.date;
  Username = Parameter.username;

  //jika tidak ada shift, maka error
  if(typeof Shift_Lap == "undefined" || Shift_Lap=="") {
    ErrorMsg = "Shift tidak boleh kosong";
  }
  //jika tidak ada tanggal, maka error
  if(typeof DateSeach == "undefined" || DateSeach=="") {
    ErrorMsg = "Tanggal tidak boleh kosong";
  }
  //inisialisasi user
  if(typeof Username == "undefined" ) {
    Username = "";
  }

  //cek tanggal
  if (ErrorMsg == "") {
    if(!UtilitiesModel.ValidateDate(DateSeach)) ErrorMsg = "Taggal, format tidak sesuai (dd/mm/yyyy)";
  }

  //Menyusun tanggal mulai dan berakhir
  if (ErrorMsg == "") {
    TglIn = moment(DateSeach + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
    TglOut = moment(DateSeach + " 23:59:59", "DD/MM/YYYY HH:mm:ss");

    TglAwal = moment(DateSeach + " 08:00:00", "DD/MM/YYYY HH:mm:ss");
    DateTmp = moment(DateSeach + " 05:00:00", "DD/MM/YYYY HH:mm:ss").add(1, 'days');
    TglAkhir = DateTmp;
  }

  if (ErrorMsg == "") {
  }








  lCheckIn = 0;
  lJam = 0;
  lTamu = 0;
  lCheckinPiutang = 0;
  lJamPiutang = 0;
  lTamuPiutng = 0;

  // 2. Akumulatif Check In
  // Jumlah checkin YANG SUDAH BAYAR
  Query = "SELECT " +
            "Count(Rcp.Reception) as JumCheckIn, " +
            "isnull(sum(RCP.Pax),0) as JumTamu " +
          "FROM " +
            "IHP_Rcp Rcp, " +
            "Ihp_Room Room " +
          "WHERE "+
            "(" +
              "Rcp.CheckIn >= '" + dateFormat(TglIn, "yyyy-mm-dd HH:MM:ss") + "' and " +
              "Rcp.CheckIn <= '" + dateFormat(TglOut, "yyyy-mm-dd HH:MM:ss") + "'" +
            ") and " +
            "RCp.kamar = Room.Kamar and " +
            "(" +
              "Room.Jenis_Kamar <> 'LOBBY' and " +
              "Room.Jenis_Kamar <> 'BAR' and " +
              "Room.Jenis_Kamar <> 'LOUNGE' and " +
              "Room.Jenis_Kamar <> 'RESTO'" +
            ") and " +
            "Rcp.reception in (" +
              "SELECT reception FROM ihp_Sul " +
              "WHERE " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    lCheckIn = dataQuery[0].JumCheckIn;
    lTamu = dataQuery[0].JumTamu;
  }

  // JUMLAH JAM UDA BAYAR
  Query = "SELECT distinct " +
            "CONVERT(char,r.date_trans,103) as tanggal, " +
            "isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as JumJam, "+
            "isnull(sum(r.pax),0) as JumTamu " +
          "FROM " +
            "ihp_rcp as r " +
              "left join  ihp_ext as e " +
                "on " +
                  "r.reception = e.reception and " +
                  "e.status = 1, " +
            "IHP_room room " +
          "where " +
            "CONVERT(char,r.date_trans,103) = '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "r.kamar = room.kamar and " +
            "(" +
              "Room.Jenis_Kamar <> 'LOBBY' and " +
              "Room.Jenis_Kamar <> 'BAR' and " +
              "Room.Jenis_Kamar <> 'LOUNGE' and " +
              "Room.Jenis_Kamar <> 'RESTO'" +
            ") and " +
            "r.reception in (" +
              "select reception " +
              "from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap +
            ") " +
          "group by CONVERT(char,r.date_trans,103)";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Jam_CheckIn = 0;
  if(dataQuery.length>0) {
    lJam = Jam_CheckIn + dataQuery[0].JumJam;
  }

  temp = 0;
  temp2 = 0;
  temp3 = 0;

  // JUMLAH TRANSFER UDA BAYAR
  Query = "select " +
            "Rcp.Invoice as invoice, " +
            "Rcp.Pax as Pax, " +
            "Rcp.Jam_Sewa as Jam_Sewa " +
          "from " +
            "ihp_rcp Rcp, " +
            "IHP_Room Room " +
          "where " +
            "Rcp.SHIFT = " + Shift_Lap + " and " +
            "Rcp.kamar = Room.Kamar and " +
            "Rcp.Invoice is not null and " +
            "(" +
              "Room.Jenis_Kamar <> 'LOBBY' and " +
              "Room.Jenis_Kamar <> 'BAR' and " +
              "Room.Jenis_Kamar <> 'LOUNGE' and " +
              "Room.Jenis_Kamar <> 'RESTO' " +
            ") and " +
            "(" +
              "Rcp.CheckIn >= '" + dateFormat(TglIn, "yyyy-mm-dd HH:MM:ss") + "' and " +
              "Rcp.CheckIn <= '" + dateFormat(TglOut, "yyyy-mm-dd HH:MM:ss") + "'" +
            ") and " +
            "Rcp.SUMMARY = '' and " +
            "Rcp.status = 1";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {

      Query = "Select Invoice from IHP_Ivc " +
              "where " +
                "Transfer = '" + dataQuery[i].Invoice + "' and " +
                "Invoice in (" +
                  "select Invoice from ihp_Sul " +
                  "where " +
                    "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                    "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                    "Shift = " + Shift_Lap +
                ")";
      dataQuery1 = await UtilitiesModel.executeWithReturn(Query, req, db);
      if(dataQuery1.length>0) {
        temp = temp + 1;
        temp2 = temp2 + dataQuery[i].Pax;
        temp3 = temp3 +  dataQuery[i].Jam_Sewa;
      }
      else {
        temp = temp;
        temp2 = temp2;
        temp3 = temp3;
      }
    }

    lCheckIn = lCheckIn + temp;   // CIN uda bayar + transfer yang uda bayar
    lTamu = lTamu + temp2;
    lJam = lJam + temp3;
  }

  // Jumlah CheckInAlreadyPaid YANG BELUM BAYAR
  Query = "Select " +
            "Count(Rcp.Reception) as JumCheckIn, " +
            "isnull(sum(RCP.Pax),0) as JumTamu " +
          "from " +
            "IHP_Rcp Rcp, " +
            "Ihp_Room Room " +
          "where " +
            "(" +
              "Rcp.CheckIn >= '" + dateFormat(TglIn, "yyyy-mm-dd HH:MM:ss") + "' and " +
              "Rcp.CheckIn <= '" + dateFormat(TglOut, "yyyy-mm-dd HH:MM:ss") + "'" +
            ") and " +
            "RCp.kamar = Room.Kamar and " +
            "(" +
              "Room.Jenis_Kamar <> 'LOBBY' and " +
              "Room.Jenis_Kamar <> 'BAR' and " +
              "Room.Jenis_Kamar <> 'LOUNGE' and " +
              "Room.Jenis_Kamar <> 'RESTO'" +
            ") and " +
            "Rcp.Shift = " + Shift_Lap + " and " +
            "Rcp.reception not in (" +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    lCheckinPiutang = dataQuery[0].JumCheckIn - temp;
    lTamuPiutng = dataQuery[0].JumTamu - temp2;
  }

  Query = "select distinct " +
            "CONVERT(char,r.date_trans,103) as tanggal, " +
            "isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as JumJam, " +
            "isnull(sum(r.pax),0) as JumTamu " +
          "from " +
            "ihp_rcp as r " +
              "left join " +
                "ihp_ext as e " +
              "on " +
                "r.reception = e.reception and " +
                "e.status = 1, " +
            "IHP_room room " +
          "where " +
            "CONVERT(char,r.date_trans,103) = '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "r.kamar = room.kamar and " +
            "(" +
              "Room.Jenis_Kamar <> 'LOBBY' and " +
              "Room.Jenis_Kamar <> 'BAR' and " +
              "Room.Jenis_Kamar <> 'LOUNGE' and " +
              "Room.Jenis_Kamar <> 'RESTO'" +
            ") and " +
            "r.Shift = " + Shift_Lap + " and " +
            "r.reception not in (" +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap +
            ") " +
          "group by CONVERT(char,r.date_trans,103)";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
          
  Jam_CheckIn = 0;
  if(dataQuery.length>0) {
    lJamPiutang = Jam_CheckIn + dataQuery[0].JumJam - temp3;
  }

  //-------------------------------------------------------
  //Nilai_Invoice------------------------------------------
  //-------------------------------------------------------
  // Cari Nilai Invoice yang sudah (dibayar pada shift itu)
  Sewa_Kamar = 0;
  Tot_Penj = 0;
  Uang_Muka = 0;
  eSewaKamar = 0;
  eMakMin = 0;
  ePiutangShift = 0;
  titlePiutang = 0;

  loopInvoiceTransfer = true;

  Query = "Select " +
            "isnull(Total_Kamar,0) as Total_Kamar, " +
            "isnull(Total_Penjualan,0) as Total_Penjualan, " +
            "Reception, " +
            "Transfer " +
          "from IHP_Ivc " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status <> 0 and " +
            "reception in ( " +
              "select reception from ihp_Sul " +
              "where  " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    Sewa_Kamar = 0;
    Tot_Penj = 0;

    for(i=0; i<dataQuery.length; i++) {
      Sewa_Kamar = Sewa_Kamar + dataQuery[i].Total_Kamar;
      Tot_Penj = Tot_Penj + dataQuery[i].Total_Penjualan;

      //Mencari data transfer
      if(dataQuery[i].Transfer != "") {
        while (loopInvoiceTransfer) {
          InvoiceTransfer = await InvoiceModel.getInfoByInvoice(InvoiceCodeTransfer, req, db);
          if(InvoiceTransfer != "") {
            
            Sewa_Kamar = Sewa_Kamar + InvoiceTransfer.Total_Kamar;
            Tot_Penj = Tot_Penj + InvoiceTransfer.Total_Penjualan;

            loopInvoiceTransfer = true;
          }
          else loopInvoiceTransfer = false;
        }
      }
    }
  }

  eSewaKamar = Sewa_Kamar;
  eMakMin = Tot_Penj;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Invoice_Piutang----------------------------------
  //-------------------------------------------------------
  // Cari Nilai Invoice yang sudah (dibayar pada shift itu)
  Sewa_Kamar = 0;
  Tot_Penj = 0;
  Uang_Muka = 0;

  Query = "Select " +
            "isnull(Total_Kamar,0) as Total_Kamar, " +
            "isnull(Total_Penjualan,0) as Total_Penjualan, " +
            "isnull(Uang_Muka,0) as Uang_Muka, " +
            "Reception, " +
            "Transfer " +
          "from IHP_Ivc  " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status <> 0 and " +
            "Shift = " + Shift_Lap + " and " +
            "reception not in " +
            "( " +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    Sewa_Kamar = 0;
    Tot_Penj = 0;
    Uang_Muka = 0;

    for(i=0; i<dataQuery.length; i++) {
      Sewa_Kamar = Sewa_Kamar + dataQuery[i].Total_Kamar;
      Tot_Penj = Tot_Penj + dataQuery[i].Total_Penjualan;
      Uang_Muka = Uang_Muka + dataQuery[i].Uang_Muka;

      //Mencari data transfer
      if(dataQuery[i].Transfer != "") {
        while (loopInvoiceTransfer) {
          InvoiceTransfer = await InvoiceModel.getInfoByInvoice(InvoiceCodeTransfer, req, db);
          if(InvoiceTransfer != "") {
            
            Sewa_Kamar = Sewa_Kamar + InvoiceTransfer.Total_Kamar;
            Tot_Penj = Tot_Penj + InvoiceTransfer.Total_Penjualan;

            loopInvoiceTransfer = true;
          }
          else loopInvoiceTransfer = false;
        }
      }
    }
  }

  ePiutangShift = Sewa_Kamar + Tot_Penj - Uang_Muka;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_HutangReservasi----------------------------------
  //-------------------------------------------------------
  /*
    HUTANG RESERVASI
    01. Uang muka checkin --- yang diperiksa jam checkinnya
        01.01. Bisa uang muka dari checkin normal --> RESERVATION = ''
               01.01.01. Jika belum dibayar, (+)
        01.02. Bisa uang muka dari reservasi --> RESERVATION <> ''
               01.02.01. Cek hari reservasi sama ato ndak??
                     - Jika sama dengan hari checkin, maka cek udah bayar belum?
                     - Jika belum dibayar, (+)

    02. Uang muka reservasi -- yang diperiksa reservasi
        02.01. Reservasi udah checkin/belum
               02.01.01. Cek tanggal reservasi sama dengan hari checkin?
                         - kalo belum checkin, alias status = 1 (+)
                         - uda checkin tapi beda hari (+)
  */
  
  Query = "Update IHp_Rcp set " +
            "Uang_Muka = 0, " +
            "Id_Payment = 0 " +
          "where  " +
            "Summary = '' and " +
            "Invoice in (select transfer from ihp_ivc) and " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "'";
  StatusProcess = await UtilitiesModel.execute(Query, req, db);
  if (!StatusProcess) {
    ErrorMsg = "Gagal update data IHp_Rcp";
  }

  Query = "Update IHp_Ivc set Uang_Muka = 0 " +
          "where " +
            "Status = 0 and " +
            "Invoice in (select transfer from IHP_Ivc) and " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "'";
  StatusProcess = await UtilitiesModel.execute(Query, req, db);
  if (!StatusProcess) {
    ErrorMsg = "Gagal update data IHp_Ivc";
  }
  
  // 01.01. Bisa uang muka dari checkin normal --> RESERVATION = ''
  Query = "Select " +
            "isnull(Uang_Muka,0) as Cash_In, " +
            "Reception, " +
            "CheckIn, " +
            "CheckOut " +
          "from IHP_Rcp " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Shift = " + Shift_Lap + " and " +
            "Reservation = '' and " +
            "Reception not in (" +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Hutang1 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      Hutang1 = Hutang1 + dataQuery[i].Cash_In;
    }
  }
  eHutangReservasiUangMukaCheckinSudahCheckinBelumBayar = Hutang1;

  //01.02. Bisa uang muka dari reservasi --> RESERVATION <> ''
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from IHP_Rcp Rcp, IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.Shift = " + Shift_Lap + " and " +
            "Rcp.Reception not in ( " +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "Shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
             - Jika belum dibayar, (+) 
  */
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Hutang2 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp == dataQuery[i].Date_Rsv) {
        if (dataQuery[i].Shift_Rcp == dataQuery[i].Shift_Rsv) {
          Hutang2 = Hutang2 + dataQuery[i].Cash_In;
        }
      }
    }
  }
  eHutangReservasiUangMukaReservasiSudahCheckinBelumBayar = Hutang2;
  
  //02.01. Reservasi belum checkin
  Query = "Select isnull(sum(Uang_Muka),0) as Uang_Muka " +
          "from IHP_Rsv " +
          "where " +
            "Shift = " + Shift_Lap + " and " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Status = 1 and " +
            "Reservation not in (Select Reservation from IHP_Rcp) " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Hutang3 = 0;
  if(dataQuery.length>0) {
    Hutang3 = Hutang3 + dataQuery[0].Uang_Muka;
  }
  eHutangReservasiUangMukaReservasiBelumCheckin = Hutang3;
  
  //TAMBAHAN
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rsv.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Rsv.CHUsr = '" + Username + "'" : "");
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Hutang5 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      // 01.02.01. Cek hari reservasi sama ato ndak??  dan belum bayar
      if (dataQuery[i].Date_Rcp != dataQuery[i].Date_Rsv) {
        Hutang5 = Hutang5 + dataQuery[i].Cash_In;
      }
      // Jika hari sama tapi beda shift
      else {
        if(dataQuery[i].Shift_Rcp != dataQuery[i].Shift_Rsv) {
          Hutang5 = Hutang5 + dataQuery[i].Cash_In;
        }
      }
    }
  }
  eHutangReservasiUangMukaReservasisudahcheckin = Hutang5;

  HutangRsv = Hutang1 + Hutang2 + Hutang3 + Hutang5;
  eHutangReservasi = HutangRsv;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Lain---------------------------------------------
  //-------------------------------------------------------
  Query = "Select isnull(SUM(Uang_Muka),0) as PendLain " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status = 3 and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Lain = 0;
  if(dataQuery.length>0) {
    Lain = dataQuery[0].PendLain;
  }
  eLain = Lain;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_TopUp_Details------------------------------------
  //-------------------------------------------------------
  Query = "Select " +
            "distinct count(Topd.ID_Payment) as LembarKK, " +
            "isnull(SUM(Topd.pay_value),0) as JumTopUp " +
          "from " +
            "IHP_Top_Up Top_Up, " +
            "IHP_Top_Upd Topd " +
          "where " +
            "Top_Up.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.TopUp = Topd.TopUp and " +
            "Top_Up.Shift = " + Shift_Lap + " and " +
            "Topd.ID_Payment = 0 " +
            (Username!="" ? " and Top_Up.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  NilaiTopUp = 0;
  if(dataQuery.length>0) {
    NilaiTopUp = dataQuery[0].JumTopUp;
  }
  Cash_TopUp = NilaiTopUp;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Cash---------------------------------------------
  //-------------------------------------------------------
  // 1.1. Cash Dari UM Reservasi yang dibatalkan pada shift itu, selama
  Query = "Select isnull(SUM(Uang_Muka),0) as Cash_Rsv " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status = 3 and " +
            "ID_Payment = 0 and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Cash1 = 0;
  if(dataQuery.length>0) {
    Cash1 = dataQuery[0].Cash_Rsv;
  }
  eCancelUangMukaReservasi = Cash1;

  // 01.01. Bisa uang muka dari checkin normal --> RESERVATION = ''
  Query = "Select " +
            "isnull(Uang_Muka,0) as Cash_In, " +
            "Reception, " +
            "CheckIn, " +
            "CheckOut " +
          "from IHP_Rcp " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Shift = " + Shift_Lap +" and " +
            "Reservation = '' and " +
            "ID_Payment = 0 and " +
            "Reception not in ( " +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Cash2 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      Cash2 = Cash2 + dataQuery[i].Cash_In;
    }
  }
  eUangMukaRsvSudahCheckin = Cash2;

  //01.02. Bisa uang muka dari reservasi --> RESERVATION <> ''
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.Shift = " + Shift_Lap + " and " +
            "Rcp.ID_Payment = 0 and " +
            "Rcp.Reception not in ( " +
              "select reception from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Cash3 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp == dataQuery[i].Date_Rsv) {
        if (dataQuery[i].Shift_Rcp == dataQuery[i].Shift_Rsv) {
          Cash3 = Cash3 + dataQuery[i].Cash_In;
        }
      }
    }
  }
  eUangMukaReservasi = Cash3;

  //02.01. Reservasi belum checkin
  Query = "Select isnull(sum(Uang_Muka),0) as Uang_Muka " +
          "from IHP_Rsv " +
          "where " +
            "Shift = " + Shift_Lap + " and " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status = 1 and " +
            "ID_Payment = 0 and " +
            "Reservation not in (Select Reservation from IHP_Rcp) " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Cash4 = 0;
  if(dataQuery.length>0) {
    Cash4 = Cash4 + dataQuery[0].Uang_Muka;
  }
  eUangMukaRsvBelumCheckin = Cash4;

  //TAMBAHAN
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.ID_Payment = 0 and " +
            "Rsv.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Cash5 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp == dataQuery[i].Date_Rsv) {
        if (dataQuery[i].Shift_Rcp == dataQuery[i].Shift_Rsv) {
          Cash5 = Cash5 + dataQuery[i].Cash_In;

          // 01.02.01. Cek hari reservasi sama ato ndak??  dan belum bayar
          // 01.02.01. Cek hari reservasi sama ato ndak??  dan belum bayar
          if (dataQuery[i].Date_Rcp != dataQuery[i].Date_Rsv) {
            Cash5 = Cash5 + dataQuery[i].Cash_In;
          }
          // Jika hari sama tapi beda shift
          else {
            if(dataQuery[i].Shift_Rcp != dataQuery[i].Shift_Rsv) {
              Cash5 = Cash5 + dataQuery[i].Cash_In;
            }
          }
        }
      }
    }
  }
  eUangMukaReservasiSudahCheckin = Cash5;
  
  // 4. Pembayaran dengan Tipe Cash
  Query = "Select distinct isnull(SUM(Sud.pay_value),0) as JumCash " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.nama_payment = 'CASH' and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  if(dataQuery.length>0) {
    Cash5 = Cash5 + dataQuery[0].JumCash;
  }
  else {
    Cash5 = 0;
  }
  ePembayaranCashCheckin = Cash5;

  Cash_FO = Cash1 + Cash2 + Cash3 + Cash4 + Cash5;
  //-------------------------------------------------------

  Cash = Cash_TopUp + Cash_FO;
  eTunai = Cash;
  eFO_Cash = Cash_FO;
  eSC_Cash = Cash_TopUp;
  eTotal_Cash = eTunai;

  Tunai = Cash;
  Selisih = Cash;

  //-------------------------------------------------------
  //Nilai_Credit-------------------------------------------
  //-------------------------------------------------------
  // 1.1. Cash Dari UM Reservasi yang dibatalkan pada shift itu
  Query = "Select " +
            "count (Reservation) as LembarKK, " +
            "isnull(SUM(Uang_Muka),0) as Cash_Rsv " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status = 3 and " + //(status = 1 or status = 3)
            "ID_Payment = 1 and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Credit1 = 0;
  Jum1 = 0;
  if(dataQuery.length>0) {
    Credit1 = dataQuery[0].Cash_Rsv;
    Jum1 = dataQuery[0].LembarKK;
  }
  eCreditCancelUangMukaReservasi = Credit1;

  // 01.01. Bisa uang muka dari checkin normal --> RESERVATION = ""
  Query = "Select " +
            "isnull(Uang_Muka,0) as Cash_In, " +
            "Reception, " +
            "CheckIn, " +
            "CheckOut " +
          "from IHP_Rcp " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Shift = " + Shift_Lap + " and " +
            "Reservation = '' and " +
            "ID_Payment = 1 and " +
            "Reception not in (" +
              "select reception " +
              "from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Credit2 = 0;
  Jum2 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      Credit2 = Credit2 + dataQuery[i].Cash_In;
      Jum2 = Jum2 + 1;
    }
  }
  eCreditUangMukaRsvCheckinBelumCheckin = Credit2;
  
  //01.02. Bisa uang muka dari reservasi --> RESERVATION <> ""
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.Shift = " + Shift_Lap + " and " +
            "Rcp.ID_Payment = 1 and " +
            "Rcp.Reception not in (" +
              "select reception " +
              "from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Credit3 = 0;
  Jum3 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp == dataQuery[i].Date_Rsv) {
        if (dataQuery[i].Shift_Rcp == dataQuery[i].Shift_Rsv) {
          Credit3 = Credit3 + dataQuery[i].Cash_In;
          Jum3 = Jum3 + 1;
        }
      }
    }
  }
  eCreditUangMukaRevervasi = Credit3;

  //02.01. Reservasi belum checkin
  Query = "Select " +
            "isnull(sum(Uang_Muka),0)as Uang_Muka, " +
            "isnull(count(Reservation),0) as lembarKK " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "ID_Payment = 1 and " +
            "Reservation not in (Select Reservation from IHP_Rcp) and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Credit4 = 0;
  Jum4 = 0;
  if(dataQuery.length>0) {
    Credit4 = dataQuery[0].Uang_Muka;
    Jum4 = dataQuery[0].lembarKK;
  }
  eCreditUangMukaReservasiBelumCheckin = Credit4;

  //TAMBAHAN
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.ID_Payment = 1 and " +
            "Rsv.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Rsv.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Credit5 = 0;
  Jum5 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp != dataQuery[i].Date_Rsv) {
        Credit5 = Credit5 + dataQuery[i].Cash_In;
        Jum5 = Jum5 + 1;
      }
      // Jika hari sama tapi beda shift
      else {
        if(dataQuery[i].Shift_Rcp != dataQuery[i].Shift_Rsv) {
          Credit5 = Credit5 + dataQuery[i].Cash_In;
          Jum5 = Jum5 + 1;
        }
      }
    }
  }
  eCreditUangMukaReservasiSudahCheckin = Credit5;

  // 4. Pembayaran dengan Tipe Cash
  Query = "Select " +
            "count(Sud.ID_Payment) as LembarKK, " +
            "isnull(SUM(Sud.pay_value),0) as JumCash " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.ID_Payment = 1 and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Credit6 = 0;
  Jum6 = 0;
  if(dataQuery.length>0) {
    Credit6 = dataQuery[0].JumCash;
    Jum6 = dataQuery[0].LembarKK;
  }
  eCreditPembayaranCheckin = Credit6;

  // 7. Top Up Pembayaran
  Query = "Select " +
            "distinct isnull(count(Topd.ID_Payment),0) as LembarKK, " +
            "isnull(SUM(Topd.pay_value),0) as JumCash " +
          "from " +
            "IHP_Top_Up Top_Up, " +
            "IHP_Top_Upd Topd " +
          "where " +
            "Top_Up.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.TopUp = Topd.TopUp and " +
            "Topd.ID_Payment = 1 and " +
            "Top_Up.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Top_Up.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Credit7 = 0;
  Jum7 = 0;
  if(dataQuery.length>0) {
    Credit7 = dataQuery[0].JumCash;
    Jum7 = dataQuery[0].LembarKK;
  }

  Credit_FO = Credit1 + Credit2 + Credit3+ Credit4 + Credit5 + Credit6;
  Jum_FO = Jum1 + Jum2 + Jum3 + Jum4 + Jum5 + Jum6;

  eKredit = Credit_FO + Credit7;
  eFO_CreditCard = Credit_FO;
  eSC_CreditCard = Credit7;
  eTotal_CreditCard = eKredit;

  eLembarKK = Jum_FO + Jum7;
  eFO_LembarCreditCard = Jum_FO;
  eSC_LembarCreditCard = Jum7;
  eTotal_LembarCreditCard = eLembarKK;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Debet--------------------------------------------
  //-------------------------------------------------------
  // 1.1. Cash Dari UM Reservasi yang dibatalkan pada shift itu
  Query = "Select count " +
            "(Reservation) as LembarKD, " +
            "isnull(SUM(Uang_Muka),0) as Cash_Rsv " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "status = 3 and " + //(status = 1 or status = 3)
            "ID_Payment = 2 and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Debet1 = 0;
  Jum1 = 0;
  if(dataQuery.length>0) {
    Debet1 = dataQuery[0].Cash_Rsv;
    Jum1 = dataQuery[0].LembarKD;
  }
  eDebitCancekUangMukaReservasi = Debet1;

  // 01.01. Bisa uang muka dari checkin normal --> RESERVATION = ""
  Query = "Select " +
            "isnull(Uang_Muka,0) as Cash_In, " +
            "Reception, " +
            "CheckIn, " +
            "CheckOut " +
          "from IHP_Rcp " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Shift = " + Shift_Lap + " and " +
            "Reservation = '' and " +
            "ID_Payment = 2 and " +
            "Reception not in (" +
              "select reception " +
              "from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Debet2 = 0;
  Jum2 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      Debet2 = Debet2 + dataQuery[i].Cash_In;
      Jum2 = Jum2 + 1;
    }
  }
  eDebetUangMukaCheckinSUdahCheckin = Debet2;

  //01.02. Bisa uang muka dari reservasi --> RESERVATION <> ""
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rcp.Shift = " + Shift_Lap + " and " +
            "Rcp.ID_Payment = 2 and " +
            "Rcp.Reception not in (" +
              "select reception " +
              "from ihp_Sul " +
              "where " +
                "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
                "shift = " + Shift_Lap + " " +
                (Username!="" ? " and CHUsr = '" + Username + "'" : "") +
            ")";
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Debet3 = 0;
  Jum3 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp == dataQuery[i].Date_Rsv) {
        if (dataQuery[i].Shift_Rcp == dataQuery[i].Shift_Rsv) {
          Debet3 = Debet3 + dataQuery[i].Cash_In;
          Jum3 = Jum3 + 1;
        }
      }
    }
  }
  eDebetUangMukaReservasi = Debet3;
  
  //02.01. Reservasi belum checkin
  Query = "Select " +
            "isnull(sum(Uang_Muka),0)as Uang_Muka, " +
            "isnull(count(Reservation),0) as lembarKD " +
          "from IHP_Rsv " +
          "where " +
            "date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "ID_Payment = 2 and " +
            "Reservation not in (Select Reservation from IHP_Rcp) and " +
            "Shift = " + Shift_Lap + " " +
            (Username!="" ? " and CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Debet4 = 0;
  Jum4 = 0;
  if(dataQuery.length>0) {
    Debet4 = dataQuery[0].Uang_Muka;
    Jum4 = dataQuery[0].lembarKD;
  }
  eDebetUangMukaReservasiBelumCheckin = Debet4;

  //TAMBAHAN
  Query = "Select " +
            "isnull(Rcp.Uang_Muka,0) as Cash_In, " +
            "Rcp.Shift as Shift_Rcp, " +
            "Rsv.Shift as Shift_Rsv, " +
            "Rcp.Date_Trans as Date_Rcp, " +
            "Rsv.Date_Trans as Date_Rsv " +
          "from " +
            "IHP_Rcp Rcp, " +
            "IHP_Rsv Rsv " +
          "where " +
            "Rcp.Reservation = Rsv.Reservation and " +
            "Rcp.ID_Payment = 2 and " +
            "Rsv.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Rsv.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Rsv.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  /*
    01.02.01. Cek hari reservasi sama ato ndak??
              - Jika sama dengan hari checkin, maka cek udah bayar belum?
              - Jika belum dibayar, (+)
  */
  Debet5 = 0;
  Jum5 = 0;
  if(dataQuery.length>0) {
    for(i=0; i<dataQuery.length; i++) {
      if (dataQuery[i].Date_Rcp != dataQuery[i].Date_Rsv) {
        Debet5 = Debet5 + dataQuery[i].Cash_In;
        Jum5 = Jum5 + 1;
      }
      // Jika hari sama tapi beda shift
      else {
        if(dataQuery[i].Shift_Rcp != dataQuery[i].Shift_Rsv) {
          Debet5 = Debet5 + dataQuery[i].Cash_In;
          Jum5 = Jum5 + 1;
        }
      }
    }
  }
  eDebitUangMukaReservasiSudahCheckin = Debet5;

  // 4. Pembayaran dengan Tipe Cash
  Query = "Select " +
            "count(Sud.ID_Payment) as lembarKD, " +
            "isnull(SUM(Sud.pay_value),0) as JumCash " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.ID_Payment = 1 and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");

  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Debet6 = 0;
  Jum6 = 0;
  if(dataQuery.length>0) {
    Debet6 = dataQuery[0].JumCash;
    Jum6 = dataQuery[0].lembarKD;
  }
  eCreditPembayaranCheckin = Debet6;

  // 7. Top Up Pembayaran
  Query = "Select distinct " +
            "isnull(count(Topd.ID_Payment),0) as LembarKD, " +
            "isnull(SUM(Topd.pay_value),0) as JumCash " +
          "from " +
            "IHP_Top_Up Top_Up, " +
            "IHP_Top_Upd Topd " +
          "where " +
            "Top_Up.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.TopUp = Topd.TopUp and " +
            "Topd.ID_Payment = 2 and " +
            "Top_Up.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Top_Up.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Debet7 = 0;
  Jum7 = 0;
  if(dataQuery.length>0) {
    Debet7 = dataQuery[0].JumCash;
    Jum7 = dataQuery[0].LembarKD;
  }

  Debet_FO = Debet1 + Debet2 + Debet3 + Debet4 + Debet5 + Debet6;
  Jum_FO = Jum1 + Jum2 + Jum3 + Jum4 + Jum5 + Jum6;

  eDebet = Debet1 + Debet2 + Debet3 + Debet4 + Debet5 + Debet6 + Debet7;
  eFO_DebetCard = Debet_FO;
  eSC_DebetCard = Debet7;
  eTotal_DebetCard = eDebet;

  eLembarKD = Jum1 + Jum2 + Jum3 + Jum4 + Jum5 + Jum6 + Jum7;
  eFO_LembarDebetCard = Jum_FO;
  eSC_LembarDebetCard = Jum7;
  eTotal_LembarDebetCard = eLembarKD;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Voucher------------------------------------------
  //-------------------------------------------------------
  Query = "Select " +
            "count(Sud.nama_Payment) as LembarVCR, " +
            "isnull(SUM(Sud.Pay_Value),0) as JumVCR " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.nama_payment = 'VOUCHER' and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Voucher = 0;
  Jum = 0;
  if(dataQuery.length>0) {
    Voucher = dataQuery[0].JumVCR;
    Jum = dataQuery[0].LembarVCR;
  }

  eVoucher = Voucher;
  eLembarVCR = Jum;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Piutang------------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value), 0) as JumPiutang " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "(" +
              "Sud.nama_payment = 'CREDIT' or " +
              "Sud.nama_payment = 'PIUTANG'" +
            ") and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Piutang = 0;
  if(dataQuery.length>0) {
    Piutang = dataQuery[0].JumPiutang;
  }
  ePiutang = Piutang;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_Entertainment------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value), 0) as JumComp " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.nama_payment = 'COMPLIMENTARY' and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  Comp = 0;
  if(dataQuery.length>0) {
    Comp = dataQuery[0].JumComp;
  }
  eEntertainment = Comp;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_SmartCard----------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value),0) as JumSC " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.nama_payment = 'SMART CARD' and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  NilaiSC = 0;
  if(dataQuery.length>0) {
    NilaiSC = dataQuery[0].JumSC;
  }
  eSmartCard = NilaiSC;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_TopUp--------------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Topd.pay_value),0) as JumTopUp " +
          "from " +
            "IHP_Top_Up Top_Up, " +
            "IHP_Top_Upd Topd " +
          "where " +
            "Top_Up.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Top_Up.TopUp = Topd.TopUp and " +
            "Top_Up.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Top_Up.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  NilaiTopUp = 0;
  if(dataQuery.length>0) {
    NilaiTopUp = dataQuery[0].JumTopUp;
  }
  eHutangSC = NilaiTopUp;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_UangMuka-----------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value), 0) as UangMuka " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "Sud.nama_payment = 'UANG MUKA' and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  UM = 0;
  if(dataQuery.length>0) {
    UM = dataQuery[0].UangMuka;
  }
  eUangMuka = UM;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_EMoney-------------------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value),0) as JumEMoney " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "(" +
              "Sud.ID_Payment = 31 or " +
              "Sud.nama_payment = 'E-MONEY'" +
            ")"+ " and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  E_Money = 0;
  if(dataQuery.length>0) {
    E_Money = dataQuery[0].JumEMoney;
  }
  eEMoney = E_Money;
  //-------------------------------------------------------

  //-------------------------------------------------------
  //Nilai_PoinMembership-----------------------------------
  //-------------------------------------------------------
  Query = "Select distinct isnull(SUM(Sud.pay_value),0) as JumPoinMembership " +
          "from " +
            "IHP_Sul Sul, " +
            "IHP_Sud Sud " +
          "where " +
            "Sul.date_trans >= '" + dateFormat(TglAwal, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.date_trans <= '" + dateFormat(TglAkhir, "yyyy-mm-dd HH:MM:ss") + "' and " +
            "Sul.summary = Sud.summary and " +
            "(" +
              "Sud.ID_Payment = 9 or " +
              "Sud.nama_payment = 'POIN MEMBERSHIP'" +
            ") and " +
            "Sul.Shift = " + Shift_Lap + " " +
            (Username!="" ? " and Sul.CHUsr = '" + Username + "'" : "");
  dataQuery = await UtilitiesModel.executeWithReturn(Query, req, db);
  poinMembership = 0;
  if(dataQuery.length>0) {
    poinMembership = dataQuery[0].JumPoinMembership;
  }
  ePoinMembership = poinMembership;
  //-------------------------------------------------------

  lTotal1 = eSewaKamar + eMakMin + HutangRsv + Lain + NilaiTopUp;
  lTotal2 = Cash + eKredit + eDebet + eVoucher + ePoinMembership + eEMoney + Piutang + Comp + UM + NilaiSC;
  
  if(ErrorMsg != "") {
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

exports.getStatusReportKas = async function (req, res){
  db = await new DBConnection().getPoolConnection();
  logger = req.log;
  _getStatusReportKas(req, res);
}

async function _getStatusReportKas(req, res){
    try{
      var start = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      logger.info("-> Start proses laporan kas " + start);
      console.log("-> Start proses laporan kas " + start);

      var tanggal = req.query.tanggal;
      var shift = req.query.shift;
      var chusr = req.query.chusr;

      var tanggalIn = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
      var tanggalOut = moment(tanggal + " 23:59:59", "DD/MM/YYYY HH:mm:ss");
    
      var tanggalAwal = moment(tanggal + " 08:00:00", "DD/MM/YYYY HH:mm:ss");
      var tanggalAkhir = moment(tanggal + " 05:00:00", "DD/MM/YYYY HH:mm:ss").add(1, 'days');

      console.log(`cek  jam awal: ${tanggalIn}
                        jam akhir ${tanggalOut}
                        tanggal awal ${tanggalAwal}
                        tanggal akhir ${tanggalAkhir}`);

      var getCINPaid  = await new Report().getCINPaid(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getJumlahJamPaid = await new Report().getJumlahJamPaid(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getCINPiutang = await new Report().getCINPiutang(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getJumlahJamPiutang = await new Report().getJumlahJamPiutang(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getJumlahCash = await new Report().getJumlahCash(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahCreditCard = await new Report().getJumlahCreditCard(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahDebetCard = await new Report().getJumlahDebetCard(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahPiutang = await new Report().getJumlahPiutang(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahComplimentary = await new Report().getJumlahComplimentary(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahEmoney = await new Report().getJumlahEmoney(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahTransfer = await new Report().getJumlahTransfer(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahVoucher = await new Report().getJumlahVoucher(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahUangMuka = await new Report().getJumlahUangMuka(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahSmartCard = await new Report().getJumlahSmartCard(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahPendapatanLain = await new Report().getJumlahPendapatanLain(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahUangMukaCheckinBelumBayar = await new Report().getJumlahUangMukaCheckinBelumBayar(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahUangMukaCheckinCashAndTransfer = await new Report().getJumlahUangMukaCheckinCashAndTransfer(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahUangMukaCheckinCreditCard = await new Report().getJumlahUangMukaCheckinCreditCard(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahUangMukaCheckinDebetCard = await new Report().getJumlahUangMukaCheckinDebetCard(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahInvoice = await new Report().getJumlahInvoice(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahReservasiBelumCheckin = await new Report().getJumlahReservasiBelumCheckin(db, tanggalAwal, tanggalAkhir, shift, chusr)
      var getJumlahReservasiSudahCheckin = await new Report().getJumlahReservasiSudahCheckin(db, tanggalAwal, tanggalAkhir, shift, chusr)

      var response = {
        tanggal: getJumlahJamPaid.tanggal,
        //STATUS KAMAR
        jumlah_checkin_sudah_bayar: getCINPaid.jumlahCheckinPaid,
        jumlah_jam_sudah_bayar: getJumlahJamPaid.jumlah_jam_sudah_bayar,
        jumlah_tamu_sudah_bayar: getCINPaid.jumlahTamuPaid,
        jumlah_checkin_piutang: getCINPiutang.jumlah_checkin_piutang,
        jumlah_jam_piutang:  getJumlahJamPiutang.jumlah_jam_piutang,
        jumlah_tamu_piutang: getCINPiutang.jumlah_tamu_piutang,
        // PEMBAYARAN
        jumlah_pembayaran_cash: (getJumlahCash + getJumlahUangMukaCheckinCashAndTransfer),
        jumlah_pembayaran_credit_card: (getJumlahCreditCard + getJumlahUangMukaCheckinCreditCard),
        jumlah_pembayaran_debet_card: (getJumlahDebetCard + getJumlahUangMukaCheckinDebetCard),
        jumlah_pembayaran_piutang: getJumlahPiutang,
        jumlah_pembayaran_complimentary: getJumlahComplimentary,
        jumlah_pembayaran_emoney: getJumlahEmoney,
        jumlah_pembayaran_transfer: getJumlahTransfer,
        jumlah_pembayaran_voucher: getJumlahVoucher, 
        jumlah_pembayaran_uang_muka: getJumlahUangMuka,
        jumlah_pembayaran_smart_card: getJumlahSmartCard,
        total_pembayaran: (getJumlahCash + getJumlahUangMukaCheckinCashAndTransfer + 
                            getJumlahCreditCard + getJumlahUangMukaCheckinCreditCard +
                            getJumlahDebetCard + getJumlahUangMukaCheckinDebetCard +
                            getJumlahPiutang +
                            getJumlahComplimentary +
                            getJumlahEmoney +
                            getJumlahTransfer +
                            getJumlahVoucher +
                            getJumlahUangMuka +
                            getJumlahSmartCard),
        // PENJUALAN
        jumlah_pendapatan_lain: getJumlahPendapatanLain,
        jumlah_uang_muka_checkin_belum_bayar: getJumlahUangMukaCheckinBelumBayar,
        jumlah_nilai_kamar: getJumlahInvoice,
        jumlah_reservasi_belum_checkin: getJumlahReservasiBelumCheckin,
        jumlah_reservasi_sudah_checkin: getJumlahReservasiSudahCheckin
      }

      res.send(new ResponseFormat(true, response))
    } catch{
      res.send(new ResponseFormat(false, null, "Error"))
      logger.error(error);
      logger.error(error.message);
      dataResponse = new ResponseFormat(false, null, error.message);
      res.send(dataResponse);
    }
}