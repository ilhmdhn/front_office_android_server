var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var sql = require("mssql");
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
const { ppid } = require('process');


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
      var totalKamar = 0
      var totalPenjualan = 0;
      var invoicePiutang = {
        totalKamar: 0, 
        totalFnB: 0,
        uangMuka: 0
      }

      var tanggalIn = moment(tanggal + " 08:00:00", "DD/MM/YYYY HH:mm:ss");
      var tanggalOut = moment(tanggal + " 05:00:00", "DD/MM/YYYY HH:mm:ss").add(1, 'days');
    
      var tanggalAwal = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
      var tanggalAkhir = moment(tanggal + " 23:59:59", "DD/MM/YYYY HH:mm:ss");

      var jamMulai = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
      var jamAkhir = moment(tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss").add(1, 'days');

      // Status Kamar
      var getCINPaid  = await new Report().getCINPaid(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getJumlahJamPaid = await new Report().getJumlahJamPaid(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getCINPiutang = await new Report().getCINPiutang(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      var getJumlahJamPiutang = await new Report().getJumlahJamPiutang(db, tanggalIn, tanggalOut, tanggalAwal, tanggalAkhir, shift, chusr);
      
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
        jumlah_pembayaran_transfer: Math.round(( getJumlahTransfer + 
                                      getJumlahUangMukaCheckinTransfer)),
                                      
        jumlah_pembayaran_poin_membership: Math.round(getJumlahPoinMembership),
        jumlah_pembayaran_emoney: Math.round(getJumlahEmoney),
        jumlah_pembayaran_cash: Math.round((getJumlahCash + 
                                getJumlahUangMukaCheckinCash + 
                                getJumlahUangMukaReservasiBelumCheckinCash + 
                                getJumlahUangMukaReservasiSudahCheckinCash + 
                                getJumlahUangMukaReservasiSudahCheckinBelumBayarCash +
                                getJumlahUangPendapatanLainCash)),
        jumlah_pembayaran_credit_card: Math.round((getJumlahCreditCard + 
                                        getJumlahUangMukaCheckinCreditCard + 
                                        getJumlahUangMukaReservasiBelumCheckinKredit + 
                                        getJumlahUangMukaReservasiSudahCheckinKredit + 
                                        getJumlahUangMukaReservasiSudahCheckinBelumBayarKredit +
                                        getJumlahUangPendapatanLainKredit)),
        jumlah_pembayaran_debet_card: Math.round(( getJumlahDebetCard + 
                                        getJumlahUangMukaCheckinDebetCard + 
                                        getJumlahUangMukaReservasiBelumCheckinDebit + 
                                        getJumlahUangMukaReservasiSudahCheckinDebit + 
                                        getJumlahUangMukaReservasiSudahCheckinBelumBayarDebit +
                                        getJumlahUangPendapatanLainDebit)),
        jumlah_pembayaran_voucher: Math.round(getJumlahVoucher),

        jumlah_pembayaran_piutang: Math.round(getJumlahPiutang),
        
        jumlah_pembayaran_complimentary: Math.round(getJumlahComplimentary),

        jumlah_pembayaran_uang_muka: Math.round(getJumlahUangMuka),

        jumlah_pembayaran_smart_card: Math.round(getJumlahSmartCard),

        total_pembayaran: Math.round((getJumlahCash + 
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
//                          getJumlahUangMuka +
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
                          )),

        // PENJUALAN
        jumlah_pendapatan_lain: Math.round(getJumlahPendapatanLain),

        jumlah_uang_muka_checkin_sudah_belum_bayar: Math.round(getJumlahUangMukaCheckinBelumBayar),

        jumlah_reservasi_sudah_checkin_belum_bayar: Math.round(getJumlahReservasiSudahCheckinBelumBayar),

        jumlah_reservasi_belum_checkin: Math.round(getJumlahReservasiBelumCheckin),

        jumlah_reservasi_sudah_checkin: Math.round(getJumlahReservasiSudahCheckin),
        
        total_hutang_reservasi: Math.round(( getJumlahPendapatanLain + 
                                  getJumlahUangMukaCheckinBelumBayar + 
                                  getJumlahReservasiSudahCheckinBelumBayar+ 
                                  getJumlahReservasiBelumCheckin + 
                                  getJumlahReservasiSudahCheckin)),

        jumlah_nilai_kamar: Math.round(totalKamar),
        makanan_minuman: Math.round(totalPenjualan),

        hutang_smart_card: 0,

        total_penjualan: Math.round((getJumlahPendapatanLain + 
                          getJumlahUangMukaCheckinBelumBayar + 
                          getJumlahReservasiBelumCheckin + 
                          getJumlahReservasiSudahCheckin + 
                          getJumlahReservasiSudahCheckinBelumBayar +
                          totalKamar + 
                          totalPenjualan)),

        piutang_room: Math.round(invoicePiutang.totalKamar),

        piutang_fnb: Math.round(invoicePiutang.totalFnB),

        uang_muka: Math.round(invoicePiutang.uangMuka)
      }

      res.send(new ResponseFormat(true, response))

    } catch(error){
      logger.error(error);
      logger.error(error.message);
      dataResponse = new ResponseFormat(false, null, error.message);
      res.send(dataResponse);
    }
}

exports.postCashDetail = async function(req, res){
  db = await new DBConnection().getPoolConnection();
  logger = req.log;

  try{

    var tanggal = moment(req.body.tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
    tanggal = dateFormat(tanggal, "dd/mm/yyyy HH:MM:ss")
    var shift = req.body.shift;
    var seratusRibu = req.body.seratus_ribu;
    var limaPuluhRibu = req.body.lima_puluh_ribu;
    var duaPuluhRibu = req.body.dua_puluh_ribu;
    var sepuluhRibu = req.body.sepuluh_ribu;
    var limaRibu = req.body.lima_ribu;
    var duaRibu = req.body.dua_ribu;
    var seribu = req.body.seribu;
    var limaRatus = req.body.lima_ratus;
    var duaRatus = req.body.dua_ratus;
    var seratus = req.body.seratus;
    var limaPuluh = req.body.lima_puluh;
    var duaLima = req.body.dua_lima;

    var query = `
    INSERT INTO [IHP_CASH_Summary_Detail] (DATE
      ,SHIFT
      ,Seratus_Ribu
      ,Lima_Puluh_Ribu
      ,Dua_Puluh_Ribu
      ,Sepuluh_Ribu
      ,Lima_Ribu
      ,Dua_Ribu
      ,Seribu
      ,Lima_Ratus
      ,Dua_Ratus
      ,Seratus
      ,Lima_Puluh
      ,Dua_Puluh_Lima
      ,Status)

      VALUES (
        '${tanggal}',
        '${shift}',
        ${seratusRibu},
        ${limaPuluhRibu},
        ${duaPuluhRibu},
        ${sepuluhRibu},
        ${limaRibu},
        ${duaRibu},
        ${seribu},
        ${limaRatus},
        ${duaRatus},
        ${seratus},
        ${limaPuluh},
        ${duaLima},
        0
      )
    `

    db.request().query(query,function (err, response){
      if(err){
        logger.error(err.message)
        logger.error(err.message + ' Error prosesQuery ' + query);
        res.send(new ResponseFormat(false, null, "Gagal insert data pecahan"));
      } else{
        if(response.rowsAffected == 1){
          res.send(new ResponseFormat(true, null, "Berhasil"))
        } else{
          res.send(new ResponseFormat(false, null, "Gagal insert data pecahan"))
        }
      }
    })
  } catch(error){
    logger.error(error);
    logger.error(error.message);
    dataResponse = new ResponseFormat(false, null, error.message);
    res.send(dataResponse);
  }
}

exports.updateCashDetail = async function(req, res){
  db = await new DBConnection().getPoolConnection();
  logger = req.log;

  try{

    var tanggal = moment(req.params.tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss")
    tanggal = dateFormat(tanggal, "dd/mm/yyyy HH:MM:ss")
    var shift = req.params.shift;
    var seratusRibu = req.query.seratus_ribu;
    var limaPuluhRibu = req.query.lima_puluh_ribu;
    var duaPuluhRibu = req.query.dua_puluh_ribu;
    var sepuluhRibu = req.query.sepuluh_ribu;
    var limaRibu = req.query.lima_ribu;
    var duaRibu = req.query.dua_ribu;
    var seribu = req.query.seribu;
    var limaRatus = req.query.lima_ratus;
    var duaRatus = req.query.dua_ratus;
    var seratus = req.query.seratus;
    var limaPuluh = req.query.lima_puluh;
    var duaLima = req.query.dua_lima;

    var query = `
    UPDATE [IHP_CASH_Summary_Detail] SET 
      Seratus_Ribu = ${seratusRibu}
      ,Lima_Puluh_Ribu = ${limaPuluhRibu}
      ,Dua_Puluh_Ribu = ${duaPuluhRibu}
      ,Sepuluh_Ribu = ${sepuluhRibu}
      ,Lima_Ribu = ${limaRibu}
      ,Dua_Ribu = ${duaRibu}
      ,Seribu = ${seribu}
      ,Lima_Ratus = ${limaRatus}
      ,Dua_Ratus = ${duaRatus}
      ,Seratus = ${seratus}
      ,Lima_Puluh = ${limaPuluh}
      ,Dua_Puluh_Lima = ${duaLima}

      WHERE

      DATE = '${tanggal}' and
      shift = '${shift}'
    `

    db.request().query(query,function (err, response){
      if(err){
        logger.error(err.message)
        logger.error(err.message + ' Error prosesQuery ' + query);
        res.send(new ResponseFormat(false, null, "Gagal insert data pecahan"));
      } else{
        if(response.rowsAffected = 1){
          res.send(new ResponseFormat(true, null, "Berhasil"))
        } else{
          res.send(new ResponseFormat(false, null, "Gagal update data"))
        }
      }
    })
  } catch(error){
    logger.error(error);
    logger.error(error.message);
    dataResponse = new ResponseFormat(false, null, error.message);
    res.send(dataResponse);
  }
}

exports.getCashDetail =  async function(req, res){
  db = await  new  DBConnection().getPoolConnection();
  logger = req.log;

  try{
    var tanggal = moment(req.query.tanggal + " 00:00:00", "DD/MM/YYYY HH:mm:ss");
    tanggal = dateFormat(tanggal, "dd/mm/yyyy HH:MM:ss")
    var shift = req.query.shift;
    
    var query = `
    SELECT isnull([DATE], 0) as tanggal
      ,isnull([SHIFT], 0) as shift
      ,isnull([Seratus_Ribu], 0) as seratus_ribu
      ,isnull([Lima_Puluh_Ribu], 0) as lima_puluh_ribu
      ,isnull([Dua_Puluh_Ribu], 0) as dua_puluh_ribu
      ,isnull([Sepuluh_Ribu], 0) as sepuluh_ribu
      ,isnull([Lima_Ribu], 0) as lima_ribu
      ,isnull([Dua_Ribu], 0) as dua_ribu
      ,isnull([Seribu], 0) as seribu
      ,isnull([Lima_Ratus], 0) as lima_ratus
      ,isnull([Dua_Ratus], 0) as dua_ratus
      ,isnull([Seratus], 0) as seratus
      ,isnull([Lima_Puluh], 0) as lima_puluh
      ,isnull([Dua_Puluh_Lima], 0)  as dua_puluh_lima
      ,isnull([Status], 0) as status
  FROM [IHP_CASH_Summary_Detail]
  WHERE 
  DATE = '${tanggal}'
  AND SHIFT = '${shift}'
    `
    db.request().query(query, function(err, dataReturn){
      if(err){
          sql.close();
          logger.error(err);
          console.log(err);
          logger.error(err.message + ' Error prosesQuery ' + query);
          resolve(false);    
      } else{
          sql.close();
          if(dataReturn.recordset.length > 0){
              var nilai = {
                  tanggal: dataReturn.recordset[0].tanggal,
                  shift: dataReturn.recordset[0].shift,
                  seratus_ribu: dataReturn.recordset[0].seratus_ribu,
                  lima_puluh_ribu: dataReturn.recordset[0].lima_puluh_ribu,
                  dua_puluh_ribu: dataReturn.recordset[0].dua_puluh_ribu,
                  sepuluh_ribu: dataReturn.recordset[0].sepuluh_ribu,
                  lima_ribu: dataReturn.recordset[0].lima_ribu,
                  dua_ribu: dataReturn.recordset[0].dua_ribu,
                  seribu: dataReturn.recordset[0].seribu,
                  lima_ratus: dataReturn.recordset[0].lima_ratus,
                  dua_ratus: dataReturn.recordset[0].dua_ratus,
                  seratus: dataReturn.recordset[0].seratus,
                  lima_puluh: dataReturn.recordset[0].lima_puluh,
                  dua_puluh_lima: dataReturn.recordset[0].dua_puluh_lima,
                  status: dataReturn.recordset[0].status
                }
              console.log("Pecahan CASH " + nilai);
              logger.info("Pecahan CASH " + nilai);
              res.send(new ResponseFormat(true, nilai, "Berhasil"))
          } else{
              console.log("Pecahan Cash 0");
              logger.info("Pecahan Cash 0");
              res.send(new ResponseFormat(true, null, "Data Kosong")); 
          }
      }
  })

  } catch(error){
    logger.error(error);
    logger.error(error.message);
    dataResponse = new ResponseFormat(false, null, error.message);
    res.send(dataResponse);
  }
}