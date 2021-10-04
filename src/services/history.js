var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;

class History {
  constructor() { }

  insertIHPEventTransaction(db_, room_, chusr_, date_trans_Query_, keterangan_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var chusr = chusr_;
        var date_trans_Query = date_trans_Query_;
        var keterangan = keterangan_;
        var isiQuery = "" +
          " set dateformat dmy  " +
          " INSERT INTO [dbo].[IHP_EventTransaction] " +
          "  ([Tanggal] " +
          "  ,[Keterangan_Event] " +
          "  ,[Date_Trans]) " +
          "   VALUES " +
          "  (" +
          " getdate() " +
          "  ,'" + room + " : Kamar sudah di " + keterangan + " User " + chusr + "'" +
          "  ," + date_trans_Query + "" +
          ") ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(room + " gagal insertIHPEventTransaction");
            logger.info(room + " gagal insertIHPEventTransaction");
            resolve(false);
          } else {
            sql.close();
            console.log(room + " Sukses insertIHPEventTransaction");
            logger.info(room + " Sukses insertIHPEventTransaction");
            resolve(true);
          }
        });

      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIHP_EventLog(db_, room_, date_trans_Query_, keterangan_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var date_trans_Query = date_trans_Query_;
        var keterangan = keterangan_;

        var isiQuery = " " +
          " INSERT INTO IHP_EventLog " +
          "   (Tanggal " +
          "    ,Keterangan_Event " +
          "    ,Date_Trans " +
          "    )" +
          " VALUES " +
          "   (getdate() ," +
          "'" + keterangan + "'," +
          "  " + date_trans_Query + " " + ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(room + " gagal insertIHP_EventLog");
            logger.info(room + " gagal insertIHP_EventLog");
            resolve(false);
          } else {
            sql.close();
            console.log(room + " Sukses insertIHP_EventLog");
            logger.info(room + " Sukses insertIHP_EventLog");
            resolve(true);
          }
        });

      } catch (error) {
        console.log(error);
        logger.error(error.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getHistoryCheckinRoom(db_, range_,keyword_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var range = parseInt(range_);
        var range_min = range - 1;
        var keyword = keyword_;
        var likeQuery = "";
        if (keyword != undefined && keyword != '') {
          likeQuery += " and  IHP_Ivc.Kamar like '%"+keyword+"%' ";
        }

        var isiQuery = " " +
          " SELECT " +
          " IHP_Ivc.Invoice as invoice " +
          " ,IHP_Ivc.Reception as reception " +
          " ,IHP_Ivc.Date as date " +
          " ,IHP_Ivc.Date_Trans as date_trans " +
          " " +
          " ,IHP_Ivc.Member as member " +
          " ,IHP_Ivc.Nama as nama " +
          " ,IHP_Room.Kamar as kamar " +
          " ,IHP_Room.Jenis_Kamar as jenis_kamar " +
          " ,IHP_Room.Kapasitas as kapasitas " +
          " ,isnull(IHP_Rcp.PAX,0) as jumlah_tamu " +
          " ,IHP_Room.Status_Checkin as status_checkin " +
          " " +
          " ,case when IHP_Room.Keterangan_Connect=2 then 0 " +
          " when IHP_Room.Keterangan_Connect=1 then 1 " +
          " when IHP_Room.Keterangan_Connect=4 then 1 end " +
          " as status_checkout " +
          " " +
          " ,case when IHP_Room.Keterangan_Connect=4 " +
          " and IHP_Room.Status_Checkin=1 " +
          " and IHP_Room.Nama_Tamu='TESKAMAR' " +
          " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " then 1 " +
          " else 0 end " +
          " as status_checksound " +
          " " +
          " ,case " +

          " when (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
          " AND IHP_Room.Status_Checkin=0 " +
          " AND IHP_Room.Keterangan_Connect=2 " +
          " AND IHP_Rcp.Complete ='1' " +
          " then 6 " +

          " when (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
          " AND IHP_Room.Status_Checkin=0 " +
          " AND IHP_Room.Keterangan_Connect=2 " +
          " then 0 " +
          
          " " +
          " when IHP_Room.Keterangan_Connect=4 " +
          " and IHP_Room.Status_Checkin=1 " +
          " and IHP_Room.Nama_Tamu='TESKAMAR' " +
          " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " then 1 " +
          " " +
          " when IHP_Room.Keterangan_Connect=2 " +
          " and IHP_Room.Status_Checkin=1 " +
          " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
          " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') " +
          " and IHP_Sul.Summary is null " +
          " and (IHP_Ivc.Printed='0' or IHP_Ivc.Printed='-1')" +
          " then 2 " +
          " " +
          " when IHP_Ivc.Printed>0 " +
          " and IHP_Sul.Summary is null " +
          " and IHP_Room.Status_Checkin=1 " +
          " and IHP_Room.Keterangan_Connect=2 " +
          " then 3 " +
          " " +
          " when IHP_Sul.Summary is not null " +
          " and IHP_Room.Status_Checkin=1 " +
          " and IHP_Room.Keterangan_Connect=2 " +
          " then 4 " +
          " " +
          " when IHP_Room.Keterangan_Connect=1 " +
          " then 5 " +
          " " +
          " else 6 end " +
          " as status_kamar " +
          " " +
          " ,case when IHP_Sul.Summary is not null " +
          " then 1 else 0 end " +
          " as status_terbayar " +
          " " +
          " ,IHP_Room.Status_10 as status_10_menit " +
          " " +
          " ,case when IHP_Ivc.Printed='1' then 1 " +
          " else 0 end as status_tagihan_tercetak " +
          " " +
          " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'BAR' " +
          " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
          " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
          " AND (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
          " AND IHP_Room.Status_Checkin=0 " +
          " AND IHP_Room.Keterangan_Connect=2 " +
          " then 1 " +
          " else 0 end " +
          " as status_kamar_ready_untuk_checkin " +
          " " +
          " ,IHP_Room.Service_Kamar as call_service_kamar " +
          " ,IHP_Room.Keterangan_Connect as keterangan_connect " +
          " " +
          " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'BAR' " +
          " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
          " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
          " then CAST(1 AS BIT) " +
          " else CAST(0 AS BIT) end " +
          " as kamar_untuk_checkin " +
          " " +
          " " +
          " ,case when IHP_Room.Nama_Tamu ='NULL' then '' " +
          " when IHP_Room.Nama_Tamu is null then '' " +
          " else IHP_Room.Nama_Tamu " +
          " end " +
          " as nama_member " +
          " " +
          " ,IHP_Room.IP_Address as ip_address " +
          " ,isnull(IHP_Ivc.Chusr,'') as chusr " +
          " ,isnull(IHP_Ivc.Member,'') as kode_member " +
          //" ,DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin " +
          " ,DATEDIFF(mi, IHP_Rcp.Checkin, IHP_Rcp.Checkout) as durasi_checkin " +
          " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin " +
          " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)/60 as sisa_jam_checkin " +
          " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)%60 as sisa_menit_checkin " +
          " ,Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu " +
          " ,IHP_Rcp.Checkin as jam_checkin " +
          " ,IHP_Rcp.Checkout as jam_checkout " +
          " ,isnull(IHP_Sul.Summary,'') as summary " +
          " ,isnull(IHP_Sul.Total,0) as total_pembayaran " +
          " " +
          " ,IHP_Rcp.QM1 as qm1 " +
          " ,IHP_Rcp.QM2 as qm2 " +
          " ,IHP_Rcp.QM3 as qm3 " +
          " ,IHP_Rcp.QM4 as qm4 " +
          " ,IHP_Rcp.QF1 as qf1 " +
          " ,IHP_Rcp.QF2 as qf2 " +
          " ,IHP_Rcp.QF3 as qf3 " +
          " ,IHP_Rcp.QF4 as qf4 " +
          " ,IHP_Rcp.PAX as pax " +
          " ,IHP_Rcp.Keterangan as hp " +
          " ,IHP_Rcp.KMS as keterangan " +
          " " +
          " ,isnull(IHP_UangVoucher.[Voucher],'') as voucher " +
          " ,isnull(IHP_UangVoucher.[Pay_Value],'') as pay_value_voucher " +
          " " +
          " ,isnull(IHP_UangMukaNonCash.[Nama_Payment],'') as nama_payment_uang_muka " +
          " ,isnull(IHP_UangMukaNonCash.[Input1],'') as input1_jenis_kartu " +
          " ,isnull(IHP_UangMukaNonCash.[Input2],'') as input2_nama " +
          " ,isnull(IHP_UangMukaNonCash.[Input3],'') as input3_nomor_kartu " +
          " ,isnull(IHP_UangMukaNonCash.[Input3],'') as input4_nomor_approval " +
          " ,isnull(IHP_UangMukaNonCash.[Pay_Value],0) as pay_value_uang_muka " +
          " ,isnull(IHP_UangMukaNonCash.[EDC_Machine],'') as edc_machine " +
          " " +
          " FROM IHP_Ivc " +
          " Inner Join IHP_Rcp on " +
          " IHP_Ivc.Reception=IHP_Rcp.Reception " +
          " and IHP_Ivc.Invoice=IHP_Rcp.Invoice " +
          " and IHP_Ivc.Kamar=IHP_Rcp.Kamar " +
          " " +
          " left join IHP_UangVoucher " +
          " on IHP_Rcp.Reception=IHP_UangVoucher.Reception " +
          " " +
          " left join IHP_UangMukaNonCash " +
          " on IHP_Rcp.Reception=IHP_UangMukaNonCash.Reception " +
          " " +
          " left join IHP_Room " +
          " on IHP_Ivc.Kamar=IHP_Room.Kamar " +
          " " +
          " Left Join IHP_Sul on " +
          " IHP_Ivc.Reception=IHP_Sul.Reception " +
          " and IHP_Ivc.Kamar=IHP_Sul.Kamar " +
          " " +
          " Left Join IHP_Mbr on IHP_Rcp.Member=IHP_MBR.Member " +
          " " +
          " WHERE " +
          " IHP_Ivc.[Status]=1 " +          
          " AND DATEADD(day, 0, CONVERT(DATETIME, convert(varchar(10), IHP_Ivc.Date_trans, 23) ))= " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, " + range_min + ", CONVERT(DATETIME, convert(varchar(10), getdate(), 23) )) " +
          " else " +
          " DATEADD(day, " + range + ", CONVERT(DATETIME, convert(varchar(10), getdate(), 23) )) " +
          " end "+
          likeQuery;
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn);
            }
            else {
              resolve(false);
            }
          }
        });
      } catch (err) {
        sql.close();
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

}
module.exports = History;