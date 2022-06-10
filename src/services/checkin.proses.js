var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var dataResponse;
var otpGenerator = require('otp-generator');
var request = require('request');

class CheckinProses {
  constructor() { }

  deleteIhpExtOldRoomTransfer(db_, old_kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var old_kode_rcp = old_kode_rcp_;
        var isiQuery = " " +
          " Delete From IHP_Ext where Reception='" + old_kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_kode_rcp + " Gagal deleteIhpExtOldRoomTransfer");
            logger.info(old_kode_rcp + " Gagal deleteIhpExtOldRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(old_kode_rcp + " Sukses deleteIhpExtOldRoomTransfer");
            logger.info(old_kode_rcp + " Sukses deleteIhpExtOldRoomTransfer");
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

  deleteIhpExtOldRoomTransferBerjalan(db_, tgl_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var tgl_extend = tgl_extend_;
        var isiQuery = " " +
          " set dateformat dmy " +
          " Delete From [IHP_Ext] " +
          " where " +
          " CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 114), 1, 8) = '" + tgl_extend + "' ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal deleteIhpExtOldRoomTransfer");
            logger.info(" Gagal deleteIhpExtOldRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses deleteIhpExtOldRoomTransfer");
            logger.info(" Sukses  deleteIhpExtOldRoomTransfer");
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

  deleteIhpPromoRcp(db_, kode_rcp_, flag_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var flag_extend = flag_extend_;
        var isiQuery = "Delete From IHP_Promo_Rcp where Reception='" + kode_rcp + "' and FlagExtend=" + flag_extend;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " Gagal deleteIhpPromoRcp flag_extend " + flag_extend);
            logger.info(kode_rcp + " Gagal deleteIhpPromoRcp flag_extend " + flag_extend);
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses deleteIhpPromoRcp flag_extend " + flag_extend);
            logger.info(kode_rcp + " Sukses deleteIhpPromoRcp flag_extend " + flag_extend);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  deleteIhpUangVoucher(db_, kode_rcp_, voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var voucher = voucher_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "Delete From [IHP_UangVoucher] where [Reception]='" + kode_rcp + "' and Voucher='" + voucher + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal deleteIhpUangVoucher");
            logger.info(kode_rcp + " gagal deleteIhpUangVoucher");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses deleteIhpUangVoucher");
            logger.info(kode_rcp + " Sukses deleteIhpUangVoucher");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getDiskonRoomMember(db_, member_, sewa_kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var member = member_;
        var sewa_kamar = sewa_kamar_;
        var isiQuery = "" +
          " Select isnull((" + sewa_kamar + "/100)*Diskon_Room,0) as nilai_diskon_room From IHP_Mbr where Member='" + member + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            var nilai = parseFloat(0);
            if (dataReturn.recordset.length > 0) {
              nilai = dataReturn.recordset[0].nilai_diskon_room;
              console.log(member + " Diskon Member Room " + nilai);
              logger.info(member + " Diskon Member Room " + nilai);
              resolve(nilai);

            }
            else {
              console.log(member + " Diskon Member Room 0 ");
              logger.info(member + " Diskon Member Room 0 ");
              resolve(nilai);
            }

          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getInfoExtendRoom(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = "" +
          `
          SELECT  [IHP_Ext].[Reception] as reception  
          ,[IHP_Ext].[Tgl_Extend] as tanggal_extend_
          ,[IHP_Ext].[Jam_Extend] as jam_extend 
          ,[IHP_Ext].[Menit_Extend] as menit_extend 
          ,([IHP_Ext].[Jam_Extend]*60)+[IHP_Ext].[Menit_Extend] as total_menit_extend
          ,[IHP_Ext].[Date_Trans] as date_trans
          ,CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 114), 1, 8) as tanggal_extend  
          ,[IHP_Ext].[Start_Extend] as start_extend_
           ,[IHP_Ext].[Start_Extend] as start_extend__
          ,CONVERT(VARCHAR(30), [IHP_Ext].[Start_Extend], 121) as start_extend
          ,CONVERT(VARCHAR(24), [IHP_Ext].[Start_Extend], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Ext].[Start_Extend], 114), 1, 8) as start_extend__
          ,[IHP_Ext].[End_Extend] as end_extend_
          ,CONVERT(VARCHAR(30), [IHP_Ext].[End_Extend], 121) as end_extend
          ,CONVERT(VARCHAR(24), [IHP_Ext].[End_Extend], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Ext].[End_Extend], 114), 1, 8) as end_extend__  
          FROM [IHP_Ext]    
          where Reception='${kode_rcp}'
          Order by [Tgl_Extend] asc
          `
          ;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              for (var a = 0; a < dataReturn.recordset.length; a++) {
                console.log(kode_rcp + " tanggal_extend " + dataReturn.recordset[0].tanggal_extend +
                  " jam_extend " + dataReturn.recordset[0].jam_extend +
                  " menit_extend " + dataReturn.recordset[0].menit_extend
                );
                logger.info(kode_rcp + " tanggal_extend " + dataReturn.recordset[0].tanggal_extend +
                  " jam_extend " + dataReturn.recordset[0].jam_extend +
                  " menit_extend " + dataReturn.recordset[0].menit_extend
                );
              }
              resolve(dataResponse);
            }
            else {
              resolve(false);
            }

          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getJamCheckoutExtend(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = "" +
          `
          set
   dateformat dmy 
   select
(isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + isnull(sum([IHP_Ext].[Menit_Extend]), 0) as [total_menit_extend],
      DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60
      )
       + isnull(sum([IHP_Ext].[Menit_Extend]), 0) , [IHP_Rcp] .[Checkout]) as checkout_ditambah_extend_,
      CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60
      )
       + isnull(sum([IHP_Ext].[Menit_Extend]), 0) , [IHP_Rcp] .[Checkout]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60
      )
       + isnull(sum([IHP_Ext].[Menit_Extend]), 0) , [IHP_Rcp] .[Checkout]), 114), 1, 12) as checkout_ditambah_extend,
      isnull([IHP_Room].[Jumlah_Tamu], 0) as jumlah_tamu,
      isnull([IHP_Room].[Kapasitas], 0) as kapasitas_kamar,
      CONVERT(VARCHAR(24), [IHP_Room].[Jam_Checkout], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Room].[Jam_Checkout], 114), 1, 12) as jam_checkout 
   FROM
      [IHP_Ext],
      [IHP_Room],
      [IHP_Rcp] 
   where
      [IHP_Ext].[Reception] = '${kode_rcp}' 
      and [IHP_Room].[Reception] = [IHP_Ext] .[Reception] 
      and [IHP_Room].[Reception] = [IHP_Rcp] .[Reception] 
   group by
      [IHP_Room].[Jam_Checkout],
      [IHP_Room].[Jumlah_Tamu],
      [IHP_Room].[Kapasitas],
      [IHP_Rcp] .[Checkout]
          `;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              console.log(kode_rcp + " checkout " + dataReturn.recordset[0].checkout_ditambah_extend);
              logger.info(kode_rcp + " checkout " + dataReturn.recordset[0].checkout_ditambah_extend);
              resolve(dataResponse);
            }
            else {
              resolve(false);
            }

          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getNilaiInvoice(db_, rcp_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var rcp = rcp_;
        var room = room_;
        var isiQuery = "" +
          " set dateformat dmy  " +
          " SELECT [Invoice] as invoice " +
          "  ,[DATE] as date" +
          "  ,[Shift] as shift" +
          "  ,[Reception] as reception" +
          "  ,[Member] as member" +
          "  ,[Nama] as nama" +
          "  ,[Kamar] as kamar" +
          "  ,[Sewa_Kamar] as sewa_kamar" +
          "  ,[Total_Extend] as total_extend" +
          "  ,[Overpax] as overpax" +
          "  ,[Discount_Kamar] as discount_kamar" +
          "  ,[Surcharge_Kamar] as surcharge_kamar" +
          "  ,[Service_Kamar] as service_kamar" +
          "  ,[Tax_Kamar] as tax_kamar" +
          "  ,[Total_Kamar] as total_kamar" +
          "  ,[Charge_Penjualan] as charge_penjualan" +
          "  ,[Total_Cancelation] as total_cancelation" +
          "  ,[Discount_Penjualan] as discount_penjualan" +
          "  ,[Service_Penjualan] as service_penjualan" +
          "  ,[Tax_Penjualan] as tax_penjualan" +
          "  ,[Total_Penjualan] as total_penjualan" +
          "  ,[Charge_Lain] as charge_lain" +
          "  ,[Uang_Muka] as uang_muka" +
          "  ,[Uang_Voucher] as uang_voucher" +
          "  ,[Total_All] as total_all" +
          "  ,[Transfer] as transfer" +
          "  ,[Status] as status" +
          "  ,[Chtime] as chtime" +
          "  ,[Chusr] as chusr" +
          "  ,[Printed] as printed" +
          "  ,[Date_Trans] as date_trans" +
          "   FROM [dbo].[IHP_Ivc] " +
          " where " +
          "[IHP_Ivc].[Reception]='" + rcp + "'" +
          " and  [IHP_Ivc].[Kamar]='" + room + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);

              console.log("nilai_ivc_sewa kamar " + dataReturn.recordset[0].sewa_kamar);
              console.log("nilai_ivc_total_extend " + dataReturn.recordset[0].total_extend);
              console.log("nilai_ivc_overpax " + dataReturn.recordset[0].overpax);
              console.log("nilai_ivc_discount_kamar " + dataReturn.recordset[0].discount_kamar);
              console.log("nilai_ivc_surcharge_kamar " + dataReturn.recordset[0].surcharge_kamar);
              console.log("nilai_ivc_service_kamar " + dataReturn.recordset[0].service_kamar);
              console.log("nilai_ivc_tax_kamar " + dataReturn.recordset[0].tax_kamar);
              console.log("nilai_ivc_total_kamar " + dataReturn.recordset[0].total_kamar);
              console.log("nilai_ivc_charge_penjualan " + dataReturn.recordset[0].charge_penjualan);
              console.log("nilai_ivc_total_cancelation " + dataReturn.recordset[0].total_cancelation);
              console.log("nilai_ivc_discount_penjualan " + dataReturn.recordset[0].discount_penjualan);
              console.log("nilai_ivc_service_penjualan " + dataReturn.recordset[0].service_penjualan);
              console.log("nilai_ivc_tax_penjualan " + dataReturn.recordset[0].tax_penjualan);
              console.log("nilai_ivc_total_penjualan " + dataReturn.recordset[0].total_penjualan);
              console.log("nilai_ivc_charge_lain " + dataReturn.recordset[0].charge_lain);
              console.log("nilai_ivc_uang_muka " + dataReturn.recordset[0].uang_muka);
              console.log("nilai_ivc_uang_voucher " + dataReturn.recordset[0].uang_voucher);
              console.log("nilai_ivc_uang_total_all " + dataReturn.recordset[0].total_all);

              logger.info("nilai_ivc_sewa kamar " + dataReturn.recordset[0].sewa_kamar);
              logger.info("nilai_ivc_total_extend " + dataReturn.recordset[0].total_extend);
              logger.info("nilai_ivc_overpax " + dataReturn.recordset[0].overpax);
              logger.info("nilai_ivc_discount_kamar " + dataReturn.recordset[0].discount_kamar);
              logger.info("nilai_ivc_surcharge_kamar " + dataReturn.recordset[0].surcharge_kamar);
              logger.info("nilai_ivc_service_kamar " + dataReturn.recordset[0].service_kamar);
              logger.info("nilai_ivc_tax_kamar " + dataReturn.recordset[0].tax_kamar);
              logger.info("nilai_ivc_total_kamar " + dataReturn.recordset[0].total_kamar);
              logger.info("nilai_ivc_charge_penjualan " + dataReturn.recordset[0].charge_penjualan);
              logger.info("nilai_ivc_total_cancelation " + dataReturn.recordset[0].total_cancelation);
              logger.info("nilai_ivc_discount_penjualan " + dataReturn.recordset[0].discount_penjualan);
              logger.info("nilai_ivc_service_penjualan " + dataReturn.recordset[0].service_penjualan);
              logger.info("nilai_ivc_tax_penjualan " + dataReturn.recordset[0].tax_penjualan);
              logger.info("nilai_ivc_total_penjualan " + dataReturn.recordset[0].total_penjualan);
              logger.info("nilai_ivc_charge_lain " + dataReturn.recordset[0].charge_lain);
              logger.info("nilai_ivc_uang_muka " + dataReturn.recordset[0].uang_muka);
              logger.info("nilai_ivc_uang_voucher " + dataReturn.recordset[0].uang_voucher);
              logger.info("nilai_ivc_uang_total_all " + dataReturn.recordset[0].total_all);

              resolve(dataResponse);
            }
            else {
              resolve(false);
            }

          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getPromoRcp(db_, kode_rcp_, flag_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var flag_extend = flag_extend_;
        var isiQuery = "" +
          " select distinct Promo as promo from IHP_Promo_Rcp where Reception='" + kode_rcp + "' and FlagExtend=" + flag_extend;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              if ((dataReturn.recordset[0].hasil_start_promo !== null) && (dataReturn.recordset[0].hasil_end_promo !== null)) {
                console.log("promo rcp " + dataReturn.recordset[0].promo);
                logger.info("promo rcp " + dataReturn.recordset[0].promo);
              }
              resolve(dataResponse);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getRcpCheckinCheckoutPlusExtend(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = "" +
          " set dateformat dmy  " +
          " select" +
          " [IHP_Rcp].[Reception] as reception," +
          " [IHP_Rcp].[Checkin] as checkin_," +
          " CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 114), 1, 8) as checkin," +
          " [IHP_Rcp].[Jam_Sewa] as jam_sewa," +
          " [IHP_Rcp].[Menit_Sewa] as menit_sewa," +
          " [IHP_Rcp].[Checkout] as checkout," +
          " [IHP_Room].[Jam_Checkin] as jam_checkin," +
          " [IHP_Room].[Jam_Checkout] as jam_checkout," +
          " [IHP_Room].[Jenis_Kamar] as jenis_kamar," +
          " isnull(sum([IHP_Ext].[Jam_Extend]), 0) as [total_jam_extend]," +
          " isnull(sum([IHP_Ext].[Menit_Extend]), 0) as [total_menit_extend]," +
          "  DATEADD(minute, " +
          " (" +
          " isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] " +
          " )" +
          " ,[IHP_Rcp].[Checkin]) as checkout_ditambah_extend_," +
          " CONVERT(VARCHAR(24), DATEADD(minute, " +
          " (" +
          " isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] " +
          " )" +
          " , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, " +
          " (" +
          " isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] " +
          " )" +
          " , [IHP_Rcp].[Checkin]), 114), 1, 8) as checkout_ditambah_extend," +

          " case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw, GETDATE() - 1) " +
          " else" +
          " DATEPART(dw, GETDATE()) " +
          " end" +
          " as nomor_hari_ini " +

          " ,case " +
          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=1" +
          " then 'minggu' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=2" +
          " then 'senin' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=3" +
          " then 'selasa' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=4" +
          " then 'rabu' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=5" +
          " then 'kamis' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=6" +
          " then 'jumat' " +

          " when" +
          " (case" +
          " when" +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then" +
          " DATEPART(dw,GETDATE()-1)" +
          " else " +
          " DATEPART(dw,GETDATE())" +
          " end)=7" +
          " then 'sabtu' " +

          " end " +
          " as hari" +

          " from" +
          " [IHP_Rcp] " +
          " left Join" +
          " [IHP_Ext] " +
          " on [IHP_Rcp].[Reception] = [IHP_Ext].[Reception] " +
          " left Join" +
          " [IHP_Room] " +
          " on [IHP_Rcp].[Reception] = [IHP_Room].[Reception] " +
          " where" +
          " [IHP_Rcp].[Reception] = '" + kode_rcp + "' " +
          " Group By" +
          " [IHP_Rcp].[Reception], [IHP_Rcp].[Checkin], [IHP_Rcp].[Jam_Sewa], [IHP_Rcp].[Menit_Sewa], [IHP_Rcp].[Checkout], [IHP_Room].[Jam_Checkin], [IHP_Room].[Jam_Checkout], [Jenis_Kamar]";


        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              console.log(kode_rcp + " Sukses " +
                " checkin " + dataReturn.recordset[0].checkin +
                " checkout+extend " + dataReturn.recordset[0].checkout_ditambah_extend
              );
              logger.info(kode_rcp + " Sukses " +
                " checkin " + dataReturn.recordset[0].checkin +
                " checkout+extend " + dataReturn.recordset[0].checkout_ditambah_extend
              );

              console.log(kode_rcp + " Sukses " +
                "nomor hari ini " + dataReturn.recordset[0].nomor_hari_ini +
                " hari " + dataReturn.recordset[0].hari
              );
              logger.info(kode_rcp + " Sukses " +
                "nomor hari ini " + dataReturn.recordset[0].nomor_hari_ini +
                " hari " + dataReturn.recordset[0].hari
              );
              resolve(dataResponse);
            }
            else {
              console.log(kode_rcp + " data kosong isGetRcpCheckinCheckoutPlusExtend ");
              logger.info(kode_rcp + " data kosong isGetRcpCheckinCheckoutPlusExtend ");
              resolve(false);
            }
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  menghapusCharPetik(input_) {
    return new Promise((resolve, reject) => {
      try {
        var input = input_;
        var panjang = input.length;
        var karakter;
        var a;
        var tmpNama = '';
        for (a = 0; a < panjang; a++) {
          karakter = input.charAt(a);
          if (
            (karakter != ',') &&
            (karakter != '.') &&
            (karakter != '`') &&
            (karakter != '~') &&
            (karakter != ';') &&
            (karakter != "'") &&
            (karakter != "\n") &&
            (karakter != '"')
          ) {
            tmpNama = tmpNama + karakter;
          }
        }
        resolve(tmpNama);
      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpExt(db_, kode_rcp_, durasi_jam_, durasi_menit_, chusr_, date_trans_Query_, status_promo_, start_extend_, end_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var durasi_jam = durasi_jam_;
        var durasi_menit = durasi_menit_;
        var chusr = chusr_;
        var date_trans_Query = date_trans_Query_;
        var status_promo = status_promo_;
        var start_extend = start_extend_;
        var end_extend = end_extend_;

        var isiQuery = "" +
          " set dateformat dmy  " +
          " INSERT INTO [dbo].[IHP_Ext] " +
          "  ([Reception] " +
          "  ,[Tgl_Extend] " +
          "  ,[Jam_Extend] " +
          "  ,[Menit_Extend] " +
          "  ,[Chtime] " +
          "  ,[Chusr] " +
          "  ,[Date_Trans] " +
          "  ,[status] " +
          "  ,[Status_Promo] " +
          "  ,[Start_extend] " +
          "  ,[End_extend]) " +
          "  VALUES " +
          "  (" +
          "  '" + kode_rcp + "'" +
          "  ,getdate() " +
          "  ," + durasi_jam + "" +
          "  ," + durasi_menit + "" +
          " ,CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
          "  ,'" + chusr + "'" +
          " ," + date_trans_Query + "" +
          "  ,'1' " +
          "  ,'" + status_promo + "'" +
          "  ,'" + start_extend + "'" +
          "  ," + end_extend + "" +
          ") ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpExt");
            logger.info(kode_rcp + " gagal insertIhpExt");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpExt");
            logger.info(kode_rcp + " Sukses insertIhpExt");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpIvc(db_, kode_ivc_, finalShift_, kode_rcp_, kode_member_, nama_member_, room_,
    uangMuka_, invoice_transfer_, chusr_, date_trans_Query_, jenis_kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_ivc = kode_ivc_;
        var finalShift = finalShift_;
        var kode_rcp = kode_rcp_;
        var kode_member = kode_member_;
        var nama_member = nama_member_;
        var room = room_;
        var uangMuka = uangMuka_;
        var invoice_transfer = invoice_transfer_;
        var chusr = chusr_;
        var date_trans_Query = date_trans_Query_;
        var jenis_kamar = jenis_kamar_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "INSERT INTO [dbo].[IHP_Ivc]" +
          "(" +
          "[Invoice]" +
          ",[DATE]" +
          ",[Shift]" +
          ",[Reception]" +
          ",[Member]" +
          ",[Nama]" +
          ",[Kamar]" +
          ",[Sewa_Kamar]" +
          ",[Total_Extend]" +
          ",[Overpax]" +
          ",[Discount_Kamar]" +
          ",[Surcharge_Kamar]" +
          ",[Service_Kamar]" +
          ",[Tax_Kamar]" +
          ",[Total_Kamar]" +
          ",[Charge_Penjualan]" +
          ",[Total_Cancelation]" +
          ",[Discount_Penjualan]" +
          ",[Service_Penjualan]" +
          ",[Tax_Penjualan]" +
          ",[Total_Penjualan]" +
          ",[Charge_Lain]" +
          ",[Uang_Muka]" +
          ",[Uang_Voucher]" +
          ",[Total_All]" +
          ",[Transfer]" +
          ",[Status]" +
          ",[Chtime]" +
          ",[Chusr]" +
          ",[Printed]" +
          ",[Flag]" +
          ",[Posted]" +
          ",[Date_Trans]" +
          ",[Jenis_Kamar]" +
          ")" +
          " VALUES" +
          "(" +
          "'" + kode_ivc + "'" +
          " ,CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
          " ,'" + finalShift + "'" +
          ",'" + kode_rcp + "'" +
          " ,'" + kode_member + "'" +
          " ,'" + nama_member + "'" +
          " ,'" + room + "'" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ," + uangMuka + "" +
          " ," + "0" + "" +
          " ," + "0" + "" +
          " ,'" + invoice_transfer + "'" +
          " ,'" + "1" + "'" +
          " ,CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
          " ,'" + chusr + "'" +
          " ,'" + "0" + "'" +
          " ,'" + "" + "'" +
          " ,'" + "" + "'" +
          " ," + date_trans_Query + "" +
          " ,'" + jenis_kamar + "'" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_ivc + " gagal insertIhpIvc");
            logger.info(kode_ivc + " gagal insertIhpIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_ivc + " Sukses insertIhpIvc");
            logger.info(kode_ivc + " Sukses insertIhpIvc");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpPromoRcpFood(db_, kode_rcp_, promo_food_, hasil_start_promo_, hasil_end_promo_, syarat_kamar_, kamar_, syarat_jenis_kamar_,
    jenis_kamar_, syarat_durasi_, durasi_, syarat_hari_, hari_, syarat_jam_, date_start_, time_start_, date_finish_, time_finish_,
    syarat_quantity_, quantity_, diskon_persen_, diskon_rp_, syarat_inventory_, inventory_, sign_inventory_,
    sign_diskon_persen_, sign_diskon_rp_, flag_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var promo_food = promo_food_;
        var hasil_start_promo = hasil_start_promo_;
        var hasil_end_promo = hasil_end_promo_;
        var syarat_kamar = syarat_kamar_;
        var kamar = kamar_;
        var syarat_jenis_kamar = syarat_jenis_kamar_;
        var jenis_kamar = jenis_kamar_;
        var syarat_durasi = syarat_durasi_;
        var durasi = durasi_;
        var syarat_hari = syarat_hari_;
        var hari = hari_;
        var syarat_jam = syarat_jam_;
        var date_start = date_start_;
        var time_start = time_start_;
        var date_finish = date_finish_;
        var time_finish = time_finish_;
        var syarat_quantity = syarat_quantity_;
        var quantity = quantity_;
        var diskon_persen = diskon_persen_;
        var diskon_rp = diskon_rp_;
        var syarat_inventory = syarat_inventory_;
        var inventory = inventory_;
        var sign_inventory = sign_inventory_;
        var sign_diskon_persen = sign_diskon_persen_;
        var sign_diskon_rp = sign_diskon_rp_;
        var flag_extend = flag_extend_;

        var isiQuery = "" +
          " set dateformat dmy" +
          " INSERT INTO [dbo].[IHP_Promo_Rcp] " +
          "  ([Reception] " +
          "  ,[Promo] " +
          "  ,[Start_Promo] " +
          "  ,[End_promo] " +
          "  ,[Status_Promo] " +
          "  ,[Syarat_Kamar] " +
          "  ,[Kamar] " +
          "  ,[Syarat_Jenis_kamar] " +
          "  ,[Jenis_Kamar] " +
          "  ,[Syarat_Durasi] " +
          "  ,[Durasi] " +
          "  ,[Syarat_Hari] " +
          "  ,[Hari] " +
          "  ,[Syarat_Jam] " +
          "  ,[Date_Start] " +
          "  ,[Time_Start] " +
          "  ,[Date_Finish] " +
          "  ,[Time_Finish] " +
          "  ,[Syarat_Quantity] " +
          "  ,[Quantity] " +
          "  ,[Diskon_Persen] " +
          "  ,[Diskon_Rp] " +
          "  ,[Syarat_Inventory] " +
          "  ,[Inventory] " +
          "  ,[Sign_Inventory] " +
          "  ,[Sign_Diskon_Persen] " +
          "  ,[Sign_Diskon_Rp] " +
          "  ,[FlagExtend]) " +
          "      VALUES " +
          "  (" +
          " '" + kode_rcp + "'" +
          ",'" + promo_food + "'" +
          ",'" + hasil_start_promo + "'" +
          ",'" + hasil_end_promo + "'" +
          "  ,2" +
          "  ," + syarat_kamar + "" +
          "  ,'" + kamar + "'" +
          "  ,'" + syarat_jenis_kamar + "'" +
          "  ,'" + jenis_kamar + "'" +
          "  ," + syarat_durasi + "" +
          "  ," + durasi + "" +
          "  ," + syarat_hari + "" +
          "  ," + hari + "" +
          "  ," + syarat_jam + "" +
          "  ," + date_start + "" +
          "  ,'" + time_start + "'" +
          "  ," + date_finish + "" +
          "  ,'" + time_finish + "'" +
          "  ," + syarat_quantity + "" +
          "  ," + quantity + "" +
          "  ," + diskon_persen + "" +
          "  ," + diskon_rp + "" +
          "  ," + syarat_inventory + "" +
          "  ,'" + inventory + "'" +
          "  ," + sign_inventory + "" +
          "  ," + sign_diskon_persen + "" +
          "  ," + sign_diskon_rp + "" +
          "  ," + flag_extend + "" +
          ") ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpPromoRcpFood");
            logger.info(kode_rcp + " gagal insertIhpPromoRcpFood");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpPromoRcpFood " + promo_food);
            logger.info(kode_rcp + " Sukses insertIhpPromoRcpFood " + promo_food);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpPromoRcpRoom(db_, kode_rcp_, promo_room_, hasil_start_promo_, hasil_end_promo_,
    kamar_, date_start_, time_start_, date_finish_, time_finish_,
    diskon_persen_, diskon_rp_, flag_extend_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var promo_room = promo_room_;
        var hasil_start_promo = hasil_start_promo_;
        var hasil_end_promo = hasil_end_promo_;
        var kamar = kamar_;
        var date_start = date_start_;
        var time_start = time_start_;
        var date_finish = date_finish_;
        var time_finish = time_finish_;
        var diskon_persen = diskon_persen_;
        var diskon_rp = diskon_rp_;
        var flag_extend = flag_extend_;

        var isiQuery = "" +
          " set dateformat dmy" +
          " INSERT INTO [dbo].[IHP_Promo_Rcp] " +
          "  ([Reception] " +
          "  ,[Promo] " +
          "  ,[Start_Promo] " +
          "  ,[End_promo] " +
          "  ,[Status_Promo] " +
          "  ,[Jenis_Kamar] " +
          " ,[Date_Start]" +
          " ,[Time_Start]" +
          " ,[Date_Finish]" +
          " ,[Time_Finish]" +
          "  ,[Diskon_Persen] " +
          "  ,[Diskon_Rp] " +
          "  ,[FlagExtend]) " +
          "      VALUES " +
          "  ('" + kode_rcp + "'" +
          "  ,'" + promo_room + "'" +
          "  ,'" + hasil_start_promo + "'" +
          "  ,'" + hasil_end_promo + "'" +
          "  ,1 " +
          "  ,'" + kamar + "'" +
          "  ," + date_start + "" +
          "  ,'" + time_start + "'" +
          "  ," + date_finish + "" +
          "  ,'" + time_finish + "'" +
          "  ," + diskon_persen + "" +
          "  ," + diskon_rp + "" +
          "  ," + flag_extend + " )";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpPromoRcpRoom");
            logger.info(kode_rcp + " gagal insertIhpPromoRcpRoom");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpPromoRcpRoom " + promo_room);
            logger.info(kode_rcp + " Sukses insertIhpPromoRcpRoom " + promo_room);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpRcp(db_, kode_rcp_, finalShift_, kode_member_, nama_member_, room_, durasi_jam_, durasi_menit_, dateTambahan_, qm1_,
    qm2_, qm3_, qm4_, qf1_, qf2_, qf3_, qf4_, pax_, hp_, uangMuka_, id_payment_uang_muka_, uang_voucher_, chusr_, mbl_, status_transfer_,
    kode_ivc_, keterangan_, date_trans_Query_, status_promo_, printed_slip_checkin_, reservation_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var printed_slip_checkin = printed_slip_checkin_;
        var kode_rcp = kode_rcp_;
        var finalShift = finalShift_;
        var kode_member = kode_member_;
        var nama_member = nama_member_;
        var room = room_;
        var durasi_jam = durasi_jam_;
        var durasi_menit = durasi_menit_;
        var dateTambahan = dateTambahan_;
        var qm1 = qm1_;
        var qm2 = qm2_;
        var qm3 = qm3_;
        var qm4 = qm4_;
        var qf1 = qf1_;
        var qf2 = qf2_;
        var qf3 = qf3_;
        var qf4 = qf4_;
        var pax = pax_;
        var hp = hp_;
        var uangMuka = uangMuka_;
        var id_payment_uang_muka = id_payment_uang_muka_;
        var uang_voucher = uang_voucher_;
        var chusr = chusr_;
        var mbl = mbl_;
        var status_transfer = status_transfer_;
        var kode_ivc = kode_ivc_;
        var keterangan = keterangan_;
        var date_trans_Query = date_trans_Query_;
        var status_promo = status_promo_;
        var reservation = reservation_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "INSERT INTO [dbo].[IHP_Rcp]" +
          "([Reception]" +
          ",[DATE]" +
          ",[SHIFT]" +
          ",[Member]" +
          ",[Nama]" +
          ",[Kamar]" +
          ",[Checkin]" +
          ",[Jam_Sewa]" +
          ",[Menit_Sewa]" +
          ",[Checkout]" +
          ",[QM1]" +
          ",[QM2]" +
          ",[QM3]" +
          ",[QM4]" +
          ",[QF1]" +
          ",[QF2]" +
          ",[QF3]" +
          ",[QF4]" +
          ",[PAX]" +
          ",[Keterangan]" +
          ",[Uang_Muka]" +
          ",[Id_Payment]" +
          ",[Uang_Voucher]" +
          ",[Chtime]" +
          ",[Chusr]" +
          ",[MBL]" +
          ",[Status]" +
          ",[Posted]" +
          ",[Surcharge]" +
          ",[Flag]" +
          ",[Export]" +
          ",[Reservation]" +
          ",[Invoice]" +
          ",[Summary]" +
          ",[KMS]" +
          ",[Date_Trans]" +
          ",[Reception_Lama]" +
          ",[Status_Promo]" +
          ",[FlagStep]" +
          ",[Complete]" +
          ",[Printed_Slip_Checkin]" +
          ",[Member_Rev]" +
          ")" +
          "VALUES" +
          "(" +
          "'" + kode_rcp + "'" +
          " ,CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
          " ,'" + finalShift + "'" +
          " ,'" + kode_member + "'" +
          " ,'" + nama_member + "'" +
          " ,'" + room + "'" +
          " ,getdate()" +
          " ," + durasi_jam + "" +
          " ," + durasi_menit + "" +
          " ," + dateTambahan + "" +
          " ," + qm1 + "" +
          " ," + qm2 + "" +
          " ," + qm3 + "" +
          " ," + qm4 + "" +
          " ," + qf1 + "" +
          " ," + qf2 + "" +
          " ," + qf3 + "" +
          " ," + qf4 + "" +
          " ," + pax + "" +
          " ,'" + hp + "'" +
          " ," + uangMuka + "" +
          " ," + id_payment_uang_muka + "" +
          " ," + uang_voucher + "" +
          " ,CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
          " ,'" + chusr + "'" +
          " ,'" + mbl + "'" +
          " ,'" + status_transfer + "'" +
          " ,'" + "" + "'" +
          ",'" + "N" + "'" +
          " ,'" + "" + "'" +
          " ,'" + "" + "'" +
          " ,'" + reservation + "'" +
          " ,'" + kode_ivc + "'" +
          " ,'" + "" + "'" +
          " ,'" + keterangan + "'" +
          " ," + date_trans_Query + "" +
          " ,'" + "" + "'" +
          " ,'" + status_promo + "'" +
          " ,'" + "" + "'" +
          " ,'" + "0" + "'" +
          " ,'" + printed_slip_checkin + "'" +
          " ,'" + kode_member + "'" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpRcp");
            logger.info(kode_rcp + " gagal insertIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpRcp");
            logger.info(kode_rcp + " Sukses insertIhpRcp");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRcp(db_, kode_rcp_,
    qm1_, qm2_, qm3_, qm4_, qf1_, qf2_, qf3_, qf4_, pax_, hp_, status_promo_,
    id_payment_uang_muka_, uang_muka_, uang_voucher_, keterangan_, member_ref) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var kode_rcp = kode_rcp_;
        var qm1 = qm1_;
        var qm2 = qm2_;
        var qm3 = qm3_;
        var qm4 = qm4_;
        var qf1 = qf1_;
        var qf2 = qf2_;
        var qf3 = qf3_;
        var qf4 = qf4_;
        var pax = pax_;
        var hp = hp_;
        var status_promo = status_promo_;
        var id_payment_uang_muka = id_payment_uang_muka_;
        var uang_voucher = uang_voucher_;
        var uang_muka = uang_muka_;
        var keterangan = keterangan_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "Update [dbo].[IHP_Rcp] " +
          " set [QM1]=" + qm1 + "" +
          ",[QM2]=" + qm2 + "" +
          ",[QM3]=" + qm3 + "" +
          ",[QM4]=" + qm4 + "" +
          ",[QF1]=" + qf1 + "" +
          ",[QF2]=" + qf2 + "" +
          ",[QF3]=" + qf3 + "" +
          ",[QF4]=" + qf4 + "" +
          ",[PAX]=" + pax + "" +
          ",[Status_Promo]=" + status_promo + "" +
          ",[Keterangan]='" + hp + "'" +
          ",[KMS]='" + keterangan + "'" +
          ",[Uang_Muka]=" + uang_muka + "" +
          ",[Id_Payment]=" + id_payment_uang_muka + "" +
          ",[Uang_Voucher]=" + uang_voucher + "" +
          ",[Member_Rev]='" + member_ref + "'" +
          " where Reception='" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal updateIhpRcp");
            logger.info(kode_rcp + " gagal updateIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses updateIhpRcp");
            logger.info(kode_rcp + " Sukses updateIhpRcp");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpRoomCheckin(db_, room_, kodercp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kodercp_;
        var isiQuery = "" +
          "set dateformat dmy " +
          "INSERT INTO [dbo].[IHP_RoomCheckin]" +
          "(" +
          "[Kamar]" +
          ",[Reception]" +
          ")" +
          "VALUES" +
          "(" +
          " '" + room + "'" +
          ",'" + kode_rcp + "'" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpRoomCheckin");
            logger.info(kode_rcp + " gagal insertIhpRoomCheckin");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpRoomCheckin");
            logger.info(kode_rcp + " Sukses insertIhpRoomCheckin");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpUangMukaNonCash(db_, kode_rcp_, keterangan_payment_uang_muka_,
    kode_member_, nama_member_, input1_jenis_kartu_, input2_nama_, input3_nomor_kartu_,
    input4_nomor_approval_, uangMuka_, edc_machine_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var keterangan_payment_uang_muka = keterangan_payment_uang_muka_;
        var kode_member = kode_member_;
        var nama_member = nama_member_;
        var input1_jenis_kartu = input1_jenis_kartu_;
        var input2_nama = input2_nama_;
        var input3_nomor_kartu = input3_nomor_kartu_;
        var input4_nomor_approval = input4_nomor_approval_;
        var uangMuka = uangMuka_;
        var edc_machine = edc_machine_;
        var isiQuery = "" +
          " set dateformat dmy " +
          " INSERT INTO [dbo].[IHP_UangMukaNonCash] " +
          "  ([Reception] " +
          "  ,[Nama_Payment] " +
          "  ,[Member] " +
          "  ,[Nama] " +
          "  ,[Input1] " +
          "  ,[Input2] " +
          "  ,[Input3] " +
          "  ,[Input4] " +
          "  ,[Pay_Value] " +
          "  ,[EDC_Machine]) " +
          "      VALUES " +
          "  (" +
          " '" + kode_rcp + "'" +
          " ,'" + keterangan_payment_uang_muka + "'" +
          " ,'" + kode_member + "'" +
          " ,'" + nama_member + "'" +
          " ,'" + input1_jenis_kartu + "'" +
          " ,'" + input2_nama + "'" +
          " ,'" + input3_nomor_kartu + "'" +
          " ,'" + input4_nomor_approval + "'" +
          " ," + uangMuka + "" +
          " ,'" + edc_machine + "'" +
          ") ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insert insertIhpUangMukaNonCash " + keterangan_payment_uang_muka);
            logger.info(kode_rcp + " gagal insert insertIhpUangMukaNonCash" + keterangan_payment_uang_muka);
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " sukses insert insertIhpUangMukaNonCash " + keterangan_payment_uang_muka);
            logger.info(kode_rcp + " sukses insert insertIhpUangMukaNonCash" + keterangan_payment_uang_muka);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  deleteIhpUangMukaNonCash(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " delete from  [dbo].[IHP_UangMukaNonCash] where Reception= '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insert deleteIhpUangMukaNonCash");
            logger.info(kode_rcp + " gagal insert deleteIhpUangMukaNonCash");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " sukses insert deleteIhpUangMukaNonCash");
            logger.info(kode_rcp + " sukses insert deleteIhpUangMukaNonCash");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertIhpUangVoucher(db_, kode_rcp_, voucher_, nilai_voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var voucher = voucher_;
        var nilai_voucher = nilai_voucher_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "INSERT INTO [dbo].[IHP_UangVoucher]" +
          "([Reception]" +
          ",[Voucher]" +
          ",[Pay_Value]" +
          ")" +
          "VALUES" +
          "(" +
          " '" + kode_rcp + "'" +
          " ,'" + voucher + "'" +
          " ," + nilai_voucher + "" +
          ")";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal insertIhpUangVoucher");
            logger.info(kode_rcp + " gagal insertIhpUangVoucher");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses insertIhpUangVoucher");
            logger.info(kode_rcp + " Sukses insertIhpUangVoucher");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateDurasiIhpRcp(db_, rcp_sedang_berjalan_jam_, rcp_sedang_berjalan_menit_,
    checkin_ditambah_rcp_sedang_berjalan_, old_kode_rcp_, old_room_, old_kode_ivc_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var rcp_sedang_berjalan_jam = rcp_sedang_berjalan_jam_;
        var rcp_sedang_berjalan_menit = rcp_sedang_berjalan_menit_;
        var checkin_ditambah_rcp_sedang_berjalan = checkin_ditambah_rcp_sedang_berjalan_;
        var old_kode_rcp = old_kode_rcp_;
        var old_room = old_room_;
        var old_kode_ivc = old_kode_ivc_;
        var isiQuery = "" +
          "set dateformat dmy" +
          " Update IHP_Rcp set " +
          " Jam_Sewa=" + rcp_sedang_berjalan_jam + "" +
          " ,Menit_Sewa=" + rcp_sedang_berjalan_menit + "" +
          " ,Checkout='" + checkin_ditambah_rcp_sedang_berjalan + "'" +
          " where Reception='" + old_kode_rcp + "'" +
          " and Kamar='" + old_room + "'" +
          " and Invoice='" + old_kode_ivc + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_kode_rcp + " Gagal updateDurasiIhpRcp");
            logger.info(old_kode_rcp + " Gagal updateDurasiIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(old_kode_rcp + " Sukses updateDurasiIhpRcp");
            logger.info(old_kode_rcp + " Sukses updateDurasiIhpRcp");
            console.log(old_kode_rcp + " Jam_Sewa=" + rcp_sedang_berjalan_jam);
            logger.info(old_kode_rcp + " Jam_Sewa=" + rcp_sedang_berjalan_jam);
            console.log(old_kode_rcp + " Menit_Sewa=" + rcp_sedang_berjalan_menit);
            logger.info(old_kode_rcp + " Menit_Sewa=" + rcp_sedang_berjalan_menit);
            console.log(old_kode_rcp + " Checkout=" + checkin_ditambah_rcp_sedang_berjalan);
            logger.info(old_kode_rcp + " Checkout=" + checkin_ditambah_rcp_sedang_berjalan);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpExtOldRoomTransfer(db_, tgl_extend_, sisa_jam_, sisa_menit_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var tgl_extend = tgl_extend_;
        var sisa_jam = sisa_jam_;
        var sisa_menit = sisa_menit_;
        var sisa_all_menit = parseInt(sisa_menit) + (parseInt(sisa_jam) * 60);
        var isiQuery = " " +
          " set dateformat dmy " +
          " Update [IHP_Ext] " +
          " set [Jam_Extend]=" + sisa_jam + "" +
          " ,[Menit_Extend]=" + sisa_menit + "" +
          " ,[End_Extend]=DATEADD(minute," + sisa_all_menit + ",[Start_Extend])" +
          " where " +
          " CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Ext].[Tgl_Extend], 114), 1, 8) = '" + tgl_extend + "' ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(tgl_extend + " Gagal updateIhpExtOldRoomTransfer");
            logger.info(tgl_extend + " Gagal updateIhpExtOldRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(tgl_extend + " Sukses updateIhpExtOldRoomTransfer");
            logger.info(tgl_extend + " Sukses  updateIhpExtOldRoomTransfer");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcKamarTransfer(db_, old_kode_rcp_, old_room_, old_kode_ivc_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var old_kode_rcp = old_kode_rcp_;
        var old_room = old_room_;
        var old_kode_ivc = old_kode_ivc_;
        var isiQuery = " " +
          " set dateformat dmy " +
          " update IHP_Ivc set " +
          " [Status] = 0 " +
          " ,[Uang_Muka]=0" +
          " where Kamar = '" + old_room + "' " +
          " and Invoice='" + old_kode_ivc + "'" +
          " and Reception='" + old_kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_kode_ivc + " Gagal updateIhpIvcKamarTransfer");
            logger.info(old_kode_ivc + " Gagal updateIhpIvcKamarTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(old_kode_ivc + " Sukses updateIhpIvcKamarTransfer");
            logger.info(old_kode_ivc + " Sukses updateIhpIvcKamarTransfer");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiInvoice(db_, total_tarif_kamar_, total_extend_, charge_overpax_,
    discount_kamar_,
    nilai_service_room_, nilai_pajak_room_, total_kamar_, total_all_, kode_rcp_, uang_muka_, uang_voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var total_tarif_kamar = total_tarif_kamar_;
        var total_extend = total_extend_;
        var charge_overpax = charge_overpax_;
        var discount_kamar = discount_kamar_;
        var nilai_service_room = nilai_service_room_;
        var nilai_pajak_room = nilai_pajak_room_;
        var total_kamar = total_kamar_;
        var total_all = total_all_;
        var kode_rcp = kode_rcp_;
        var uang_voucher = uang_voucher_;
        var uang_muka = uang_muka_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Sewa_Kamar = " + total_tarif_kamar + "" +
          " ,Total_Extend = " + total_extend + "" +
          " ,Overpax = " + charge_overpax + "" +
          " ,Discount_Kamar = " + discount_kamar + "" +
          " ,Service_Kamar = " + nilai_service_room + "" +
          " ,Tax_Kamar = " + nilai_pajak_room + "" +
          //aktifin bawah ini
          " ,Total_Kamar = " + total_kamar + "" +
          " ,Uang_Voucher = " + uang_voucher + "" +
          " ,Uang_Muka = " + uang_muka + "" +
          " ,Total_All = " + total_all + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoice");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoice");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoice ");
            console.log(kode_rcp_ + " total kamar " + total_kamar + " total all " + total_all);

            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoice ");
            logger.info(kode_rcp_ + " Sewa_Kamar = " + total_tarif_kamar);
            logger.info(kode_rcp_ + " Total_Extend = " + total_extend);
            logger.info(kode_rcp_ + " Overpax = " + charge_overpax);
            logger.info(kode_rcp_ + " Discount_Kamar = " + discount_kamar);
            logger.info(kode_rcp_ + " Service_Kamar = " + nilai_service_room);
            logger.info(kode_rcp_ + " Tax_Kamar = " + nilai_pajak_room);
            logger.info(kode_rcp_ + " Total_Kamar = " + total_kamar);
            logger.info(kode_rcp_ + " Uang_Voucher = " + uang_voucher);
            logger.info(kode_rcp_ + " Uang_Muka = " + uang_muka);
            logger.info(kode_rcp_ + " Total_All = " + total_all);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon(db_, total_tarif_kamar_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var total_tarif_kamar = total_tarif_kamar_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Sewa_Kamar_Sebelum_Diskon = " + total_tarif_kamar + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon");
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceSewaKamarSebelumDiskon ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon(db_, total_extend_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var total_extend = total_extend_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Total_Extend_Sebelum_Diskon = " + total_extend + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon");
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceTotalExtendSebelumDiskon ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiInvoiceDiskonSewaKamar(db_, diskon_sewa_kamar_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var diskon_sewa_kamar = diskon_sewa_kamar_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Diskon_Sewa_Kamar = " + diskon_sewa_kamar + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceDiskonSewaKamar");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceDiskonSewaKamar");
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceDiskonSewaKamar ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceDiskonSewaKamar ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiInvoiceDiskonExtendKamar(db_, diskon_extend_kamar_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var diskon_extend_kamar = diskon_extend_kamar_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Diskon_Extend_Kamar = " + diskon_extend_kamar + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceDiskonExtendKamar");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiInvoiceDiskonExtendKamar");
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceDiskonExtendKamar ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiInvoiceDiskonExtendKamar ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcNilaiUangVoucher(db_, kode_rcp_, uang_voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var uang_voucher = uang_voucher_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " [Uang_Voucher] = " + uang_voucher + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcNilaiUangVoucher");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcNilaiUangVoucher");
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcNilaiUangVoucher ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcNilaiUangVoucher ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRcpKamarTransfer(db_, old_kode_rcp_, old_room_, old_kode_ivc_, status_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var old_kode_rcp = old_kode_rcp_;
        var old_room = old_room_;
        var old_kode_ivc = old_kode_ivc_;
        var status = status_;
        var isiQuery = "" +
          "set dateformat dmy" +
          " Update IHP_Rcp set " +
          " [Status]='" + status + "'" +
          " ,[Complete]='1'" +
          " ,[Uang_Muka]=0" +
          " ,[Id_Payment]=0" +
          " where Reception='" + old_kode_rcp + "'" +
          " and Kamar='" + old_room + "'" +
          " and Invoice='" + old_kode_ivc + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_kode_rcp + " Gagal updateIhpRcpKamarTransfer");
            logger.info(old_kode_rcp + " Gagal updateIhpRcpKamarTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(old_kode_rcp + " Sukses updateIhpRcpKamarTransfer");
            logger.info(old_kode_rcp + " Sukses updateIhpRcpKamarTransfer");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRcpNilaiUangVoucher(db_, kode_rcp_, uang_voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var uang_voucher = uang_voucher_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Rcp " +
          " Set " +
          " [Uang_Voucher] = " + uang_voucher + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpRcpNilaiUangVoucher");
            logger.info(kode_rcp_ + " Gagal updateIhpRcpNilaiUangVoucher");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpRcpNilaiUangVoucher ");
            logger.info(kode_rcp_ + " Sukses updateIhpRcpNilaiUangVoucher ");
            console.log(kode_rcp_ + " voucher " + uang_voucher);
            logger.info(kode_rcp_ + " voucher " + uang_voucher);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRcpPathSign(db_, kode_rcp_, path_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var path = path_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Rcp " +
          " Set " +
          " [Sign] = '" + path + "'" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " Gagal updateIhpRcpPathSign");
            logger.info(kode_rcp + " Gagal updateIhpRcpPathSign");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses updateIhpRcpPathSign ");
            logger.info(kode_rcp + " Sukses updateIhpRcpPathSign ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRoomCheckIn(db_, kode_rcp_, nama_member_, pax_, dateTambahan_, eventAcara_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var nama_member = nama_member_;
        var pax = pax_;
        var dateTambahan = dateTambahan_;
        var eventAcara = eventAcara_;
        var room = room_;
        var isiQuery = "" +
          "set dateformat dmy " +
          "Update IHP_Room " +
          "Set " +
          "Reception = '" + kode_rcp + "'" +
          ",Nama_Tamu = '" + nama_member + "'" +
          ",Jumlah_Tamu = '" + pax + "'" +
          ",Jam_Checkin = " + "getdate()" + "" +
          ",Jam_Masuk = " + "getdate()" + "" +
          ",Jam_Checkout = " + dateTambahan + "" +
          ",Status_Checkin = " + "1" + "" +
          ",Keterangan_Tamu = '" + eventAcara + "'" +
          "where Kamar = '" + room + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal isprosesQuery updateIhpRoomCheckIn");
            logger.info(kode_rcp + " gagal isprosesQuery updateIhpRoomCheckIn");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses isprosesQuery updateIhpRoomCheckIn");
            logger.info(kode_rcp + " Sukses isprosesQuery updateIhpRoomCheckIn");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateEditIhpRoomCheckIn(db_, pax_, eventAcara_, eventOwner_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = `
        set dateformat dmy
        Update IHP_Room
        Set Jumlah_Tamu = '${pax_}',
          Keterangan_Tamu = '${eventAcara_}',
          Nama_Tamu_Alias = '${eventOwner_}'
        where Kamar = '${room_}'`;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(room + " gagal isprosesQuery updateEditIhpRoomCheckIn");
            logger.info(room + " gagal isprosesQuery updateEditIhpRoomCheckIn");
            resolve(false);
          } else {
            sql.close();
            console.log(room + " Sukses isprosesQuery updateEditIhpRoomCheckIn");
            logger.info(room + " Sukses isprosesQuery updateEditIhpRoomCheckIn");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRoomExtend(db_, kode_rcp_, room_, jam_checkout_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var room = room_;
        var jam_checkout = jam_checkout_;
        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Room " +
          " Set " +
          " Status_CheckOut = " + "0" + "" +
          " ,Status_10 = " + "0" + "" +
          " ,Jam_Checkout = '" + jam_checkout + "'" +
          " ,Status_Checkin = " + "1" + "" +
          " where Kamar = '" + room + "'" +
          " and Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " gagal updateIhpRoomExtend");
            logger.info(kode_rcp + " gagal updateIhpRoomExtend");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses updateIhpRoomExtend");
            logger.info(kode_rcp + " Sukses updateIhpRoomExtend");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  updateIhpUangMukaNonCash(db_, old_kode_rcp_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var old_kode_rcp = old_kode_rcp_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          " set dateformat dmy " +
          " update IHP_UangMukaNonCash set " +
          " Reception = '" + kode_rcp + "'" +
          " where Reception='" + old_kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp + " Gagal updateIhpUangMukaNonCash");
            logger.info(kode_rcp + " Gagal updateIhpUangMukaNonCash");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp + " Sukses updateIhpUangMukaNonCash");
            logger.info(kode_rcp + " Sukses updateIhpUangMukaNonCash");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateStatusIhpVcrDisableEnableSedangDipakaiCheckin(db_, voucher_, status_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var voucher = voucher_;
        var status = status_;
        var isiQuery = "" +
          "set dateformat dmy " +
          "Update [dbo].[IHP_Vcr]  set Status=" + status + " where [Voucher]='" + voucher + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(voucher + " gagal updateStatusIhpVcrDisableEnableSedangDipakaiCheckin " + status);
            logger.info(voucher + " gagal updateStatusIhpVcrDisableEnableSedangDipakaiCheckin " + status);
            resolve(false);
          } else {
            sql.close();
            console.log(voucher + " Sukses updateStatusIhpVcrDisableEnableSedangDipakaiCheckin " + status);
            logger.info(voucher + " Sukses updateStatusIhpVcrDisableEnableSedangDipakaiCheckin " + status);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateInvoiceIhpRcp(db_, kode_ivc_, kode_rcp_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_ivc = kode_ivc_;
        var kode_rcp = kode_rcp_;
        var room = room_;
        var isiQuery = "" +
          " Update IHP_Rcp set Invoice='" + kode_ivc + "'" +
          " where Reception='" + kode_rcp + "'" +
          " and Kamar='" + room + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateInvoiceIhpRcp");
            logger.info(kode_rcp_ + " Gagal updateInvoiceIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateInvoiceIhpRcp");
            logger.info(kode_rcp_ + " Sukses  updateInvoiceIhpRcp");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updatePrintInvoiceIhpIvc(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = "" +
          " Update IHP_Ivc set Printed='-1'" +
          " where Reception='" + kode_rcp + "'" +
          " and (Printed='0' or Printed='-1')";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updatePrintInvoiceIhpIvc");
            logger.info(kode_rcp_ + " Gagal updatePrintInvoiceIhpIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updatePrintInvoiceIhpIvc");
            logger.info(kode_rcp_ + " Sukses  updatePrintInvoiceIhpIvc");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  updatePrintInvoiceIhpIvcBisaPrintUlangTagihan(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = "" +
          " Update IHP_Ivc set Printed='0'" +
          " where Reception='" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updatePrintInvoiceIhpIvcBisaPrintUlangTagihan");
            logger.info(kode_rcp_ + " Gagal updatePrintInvoiceIhpIvcBisaPrintUlangTagihan");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updatePrintInvoiceIhpIvcBisaPrintUlangTagihan");
            logger.info(kode_rcp_ + " Sukses  updatePrintInvoiceIhpIvcBisaPrintUlangTagihan");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getReception(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = " " +
          " select " +
          " isnull(IHP_Room.Reception,'') as reception " +
          " from IHP_Room " +
          " where Kamar = '" + room + "' ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              var reception = dataReturn.recordset[0].reception;
              console.log(room + " Sukses GetReception ");
              logger.info(room + " Sukses GetReception ");
              resolve(reception);
            } else {
              console.log(room + " gagal GetReception From IHP_Room");
              logger.info(room + " gagal GetReception From IHP_Room");
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getCekValidIHPRcpDetailsRoom(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          `
          select case when Date_Time_Start is null then 'false' else 'true' end
          as date_time_start 
          FROM [IHP_Rcp_DetailsRoom]  where reception='${kode_rcp}'
          `
          ;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            console.log(kode_rcp + " Sukses getCekIhpDetailRoom ");
            logger.info(kode_rcp + " Sukses getCekIhpDetailRoom ");
            if (dataReturn.recordset.length > 0) {
              var hasil = dataReturn.recordset[0].date_time_start;
              if (hasil == 'true') {
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              console.log(kode_rcp + " gagal getCekIhpDetailRoom From IHP_Room");
              logger.info(kode_rcp + " gagal getCekIhpDetailRoom From IHP_Room");
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getSummary(db_, room_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          " select " +
          " Summary, " +
          " Reception, " +
          " Kamar, " +
          " Invoice " +
          " from IHP_Sul " +
          " where Kamar = '" + room + "'" +
          " and Reception='" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {

            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {

            if (dataReturn.recordset.length > 0) {
              var summary = dataReturn.recordset[0].Summary;
              console.log(kode_rcp + " Sukses GetSummary ");
              logger.info(kode_rcp + " Sukses GetSummary ");
              resolve(summary);
            } else {
              console.log(kode_rcp + " Gagal GetSummary Room Belum Dibayar");
              logger.info(kode_rcp + " Gagal GetSummary Room Belum Dibayar");
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getDataMember(db_, member_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var member = member_;
        var isiQuery = " " +
          " select " +
          " Member as member, " +
          " Nama_Lengkap as nama_member, " +
          " Email as email " +
          " from IHP_Mbr " +
          " where Member = '" + member + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message);
            resolve(false);
          } else {

            if (dataReturn.recordset.length > 0) {
              console.log(" Sukses getDataMember ");
              logger.info(" Sukses getDataMember ");
              resolve(dataReturn);
            } else {
              console.log(" Gagal getDataMember");
              logger.info(" Gagal getDataMember");
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  prosesQuery(db_, isiQuery) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ' + isiQuery);
        resolve(false);
      }
    });
  }

  prosesCheckout(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = " " +
          " set dateformat dmy update IHP_Room set " +
          " Keterangan_Connect = 1, " +
          " Status_Ready = 1, " +
          " Status_Order = 0, " +
          " Reception = NULL, " +
          " Nama_Tamu = NULL, " +
          " Keterangan_Tamu = ''," +
          " Nama_Tamu_Alias = ''," +
          " Jumlah_Tamu = Null, " +
          " Jam_Checkin = '01/01/1900 00:00:00', " +
          " Jam_Masuk = '01/01/1900 00:00:00', " +
          " Jam_Checkout = '01/01/1900 00:00:00', " +
          " Status_Checkin = 0, " +
          " Status_10 = 0 " +
          " where Kamar = '" + room + "' ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  prosesOprClean(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = " " +
          " set dateformat dmy update IHP_Room set " +
          " Keterangan_Connect = 2, " +
          " Nama_Tamu = NULL, " +
          " Jumlah_Tamu = Null, " +
          " Jam_Checkin = '01/01/1900 00:00:00', " +
          " Jam_Masuk = '01/01/1900 00:00:00', " +
          " Jam_Checkout = '01/01/1900 00:00:00', " +
          " Status_Checkin = 0, " +
          " Status_10 = 0 " +
          " where Kamar = '" + room + "' ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  prosesDeleteIhpRoomCheckin(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = "delete IHP_RoomCheckin " +
          " where Kamar = '" + room + "' ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  prosesDeleteIhpRoom10Menit(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = "delete IHP_Room10mnt " +
          " where ROOM = '" + room + "' ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  prosesDeleteIhpRoomCheckinKedua(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = "DELETE FROM IHP_RoomCheckin " +
          " WHERE Kamar NOT IN(SELECT kAMAR FROM IHP_Room WHERE Reception IS NOT NULL) ";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getStatusSolSod(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var isiQuery = " " +
          " SELECT " +
          " IHP_Sol.sliporder AS order_sol, " +
          " IHP_Sol.CHusr AS order_user, " +
          " ISNULL(IHP_Sol.Mobile_Pos,'') AS order_device, " +
          " CONVERT(datetime, IHP_Sol.DATE, 103) AS order_date, " +
          " IHP_Room.Kamar AS order_room_rcp, " +
          " IHP_Sod.Qty AS order_quantity, " +
          " IHP_Sod.Qty AS order_quantity_temp, " +
          " ISNULL(IHP_Sod.Qty_Terima,0) AS order_qty_diterima, " +
          " IHP_Sod.Printed AS order_printed, " +
          " IHP_Sod.Status AS order_state, " +
          " IHP_Sod.inventory AS order_inventory, " +
          " IHP_Sod.Urut AS order_urutan, " +
          " IHP_Inventory.InventoryID_Global AS order_inventory_id_global, " +
          " IHP_Sod.nama AS order_inventory_nama, " +
          " IHP_Sod.Note AS order_notes, " +
          " ( " +
          " SELECT " +
          " ISNULL(SUM(ocd.qty), 0)  " +
          " FROM " +
          " IHP_Ocd ocd  " +
          " WHERE " +
          " ocd.OrderCancelation IN  " +
          " ( " +
          " SELECT " +
          " ocl.OrderCancelation  " +
          " FROM " +
          " ihp_Ocl ocl  " +
          " WHERE " +
          " ocl.Reception = IHP_Sol.Reception " +
          " ) " +
          " AND ocd.SlipOrder = IHP_Sol.slipOrder  " +
          " AND ocd.Inventory = IHP_Sod.inventory " +
          " ) " +
          " AS order_qty_cancel, " +
          " IHP_Sod.Price AS order_price, " +
          " IHP_Inventory.Price AS inventory_price, " +
          " isnull([IHP_Sod_Promo].[Harga_Promo],0) AS order_total_diskon," +
          " isnull([IHP_Sod_Promo].[Harga_Promo]/IHP_Sod.Qty,0) AS order_diskon_per_item," +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price / 100)* IHP_Config2.Service_Persen_Food  " +
          " else " +
          " IHP_Config2.Service_Rp_Food  " +
          " end " +
          " as order_nilai_service,  " +
          " case " +
          " when " +
          " IHP_Config2.Tax_Persen_Food > 0  " +
          " and Pajak = 1  " +
          " then " +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price + ((IHP_Sod.Price / 100)*IHP_Config2.Service_Persen_Food)) / 100*IHP_Config2.Tax_Persen_Food  " +
          " else " +
          " (IHP_Sod.Price + IHP_Config2.Service_Rp_Food) / 100*IHP_Config2.Tax_Persen_Food  " +
          " end " +
          " else " +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price + ((IHP_Sod.Price / 100)*IHP_Config2.Service_Persen_Food)) + IHP_Config2.Tax_Rp_Food  " +
          " else " +
          " (IHP_Sod.Price + IHP_Config2.Service_Rp_Food) + IHP_Config2.Tax_Rp_Food  " +
          " end " +
          " end " +
          " as order_nilai_pajak, IHP_Sod.Price +  " +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price / 100)* IHP_Config2.Service_Persen_Food  " +
          " else " +
          " IHP_Config2.Service_Rp_Food  " +
          " end " +
          " +  " +
          " case " +
          " when " +
          " IHP_Config2.Tax_Persen_Food > 0  " +
          " and Pajak = 1  " +
          " then " +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price + ((IHP_Sod.Price / 100)*IHP_Config2.Service_Persen_Food)) / 100*IHP_Config2.Tax_Persen_Food  " +
          " else " +
          " (IHP_Sod.Price + IHP_Config2.Service_Rp_Food) / 100*IHP_Config2.Tax_Persen_Food  " +
          " end " +
          " else " +
          " case " +
          " when " +
          " IHP_Config2.Service_Persen_Food > 0  " +
          " and IHP_Inventory.[Service] = 1  " +
          " then " +
          " (IHP_Sod.Price + ((IHP_Sod.Price / 100)*IHP_Config2.Service_Persen_Food)) + IHP_Config2.Tax_Rp_Food  " +
          " else " +
          " (IHP_Sod.Price + IHP_Config2.Service_Rp_Food) + IHP_Config2.Tax_Rp_Food  " +
          " end " +
          " end " +
          " as order_price_include_service_pajak,  " +

          " CONVERT(datetime, isnull(max(IHP_Sod.[Tgl_Terima]),getdate()), 103) as order_date_diterima," +
          " CONVERT(datetime, isnull(max(IHP_Okl.DATE),getdate()), 103) as order_date_terkirim," +
          " DATEDIFF(mi, CONVERT(datetime, isnull(max(IHP_Sol.DATE),getdate()), 103), getdate()) as order_durasi_awal, " +
          " DATEDIFF(mi,  CONVERT(datetime, isnull(max(IHP_Sol.DATE),getdate()), 103), CONVERT(datetime, isnull(max(IHP_Okl.DATE),getdate()), 103)) as order_total_durasi,   " +
          " DATEDIFF(mi, CONVERT(datetime, isnull(max(IHP_Sol.DATE),getdate()), 103),  isnull(max(IHP_Sod.[Tgl_Terima]),getdate())) as order_durasi_diterima,  " +
          " DATEDIFF(mi, isnull(max(IHP_Sod.[Tgl_Terima]),getdate()),  CONVERT(datetime, isnull(max(IHP_Okl.DATE),getdate()), 103)) as order_durasi_terkirim," +
          //" IHP_Okd.[OrderPenjualan] as order_penjualan, " +  
          " sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_terkirim, " +
          " IHP_Sod.[Qty] - sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_belum_terkirim, " +
          " IHP_Config2.[Service_Persen_Food] as service_persen_food, " +
          " IHP_Config2.[Tax_Persen_Food] as tax_persen_food " +


          " FROM" +
          " IHP_Sol AS IHP_Sol" +
          " Inner Join IHP_Sod " +
          " on IHP_Sod.slipOrder = IHP_Sol.slipOrder " +

          " left join" +
          " IHP_Sod_Promo " +
          " on IHP_Sol.SlipOrder = IHP_Sod_Promo.SlipOrder " +
          " and IHP_Sod.Inventory = IHP_Sod_Promo.Inventory " +

          " Inner Join IHP_Room " +
          " on IHP_Sol.Kamar = IHP_Room.Kamar " +
          " AND IHP_Room.Reception = IHP_Sol.Reception " +

          " Inner Join IHP_Inventory " +
          " on IHP_Inventory.Inventory = IHP_Sod.Inventory " +

          " left join IHP_Okd" +
          " on IHP_Sod.SlipOrder=IHP_Okd.SlipOrder " +
          " and IHP_Sod.Inventory=IHP_Okd.Inventory" +

          " left join IHP_Okl " +
          " on IHP_Room.Reception = IHP_Okl.Reception " +
          " and IHP_Okl.OrderPenjualan=IHP_Okd.OrderPenjualan " +

          " ,IHP_Config2 " +
          " WHERE " +
          " IHP_Config2.Data = '1' " +
          " AND IHP_Sol.Reception ='" + kode_rcp + "' " +
          " group by " +
          " IHP_Sol.SlipOrder " +
          " ,IHP_Sol.DATE " +
          " ,IHP_Sol.Mobile_Pos " +
          " ,IHP_Room.Kamar " +
          " ,IHP_Sod.Qty " +
          " ,IHP_Sod.Status " +
          " ,IHP_Sod.Inventory " +
          " ,IHP_Sod.Qty_Terima " +
          " ,IHP_Sod.Printed " +
          " ,IHP_Sod.Nama " +
          " ,IHP_Sod.Note " +
          " ,IHP_Sod.Urut " +
          " ,IHP_Sol.Reception " +
          " ,IHP_Sod.Price " +
          " ,IHP_Config2.Service_Persen_Food " +
          " ,IHP_Inventory.Service " +
          " ,IHP_Config2.Service_Rp_Food " +
          " ,IHP_Config2.Tax_Persen_Food " +
          " ,IHP_Inventory.Pajak " +
          " ,IHP_Config2.Tax_Persen_Food " +
          " ,IHP_Config2.Tax_Persen_Food " +
          " ,IHP_Config2.Tax_Rp_Food " +
          " ,IHP_Config2.Tax_Rp_Food " +
          " ,IHP_Inventory.InventoryID_Global" +
          //" ,IHP_Okd.OrderPenjualan "+
          " ,IHP_Okd.Qty" +
          " ,IHP_Sol.Date_trans" +
          " ,IHP_Sol.CHusr" +
          //" ,IHP_Okl.DATE" +
          " ,[IHP_Sod_Promo].[Harga_Promo]" +
          " ,IHP_Sod.[Tgl_Terima]" +
          " ,IHP_Inventory.[Price]" +
          ",IHP_Config2.[Service_Persen_Food]" +
          ",IHP_Config2.[Tax_Persen_Food]" +
          " Order By IHP_Sod.Status asc";


        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              resolve(dataResponse);
            } else {
              dataResponse = new ResponseFormat(false, null, "Data Kosong");
              resolve(dataResponse);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getStatusSlipOrder(db_, sliporder_, orderInventory_, quantity_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var sliporder = sliporder_;
        var orderInventory = orderInventory_;
        var quantity = quantity_;
        var isiQuery = " " +
          "select " +
          " Status, " +
          " Price, " +
          " Location " +
          " from IHP_Sod " +
          " where SlipOrder='" + sliporder + "' " +
          " and Inventory='" + orderInventory + "'" +
          " and Qty=" + quantity;
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              //var status = dataReturn.recordset[0].Status;
              resolve(dataReturn.recordset[0]);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getStatusSlipOrderPromo(db_, sliporder_, orderInventory_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var sliporder = sliporder_;
        var orderInventory = orderInventory_;
        var isiQuery = " " +
          "select " +
          " [Inventory] as inventory, " +
          " [Promo_Food] as promo_food, " +
          " [Harga_Promo] as harga_promo " +
          " from [IHP_Sod_Promo] " +
          " where SlipOrder='" + sliporder + "' " +
          " and Inventory='" + orderInventory + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              //var status = dataReturn.recordset[0].Status;
              resolve(dataReturn.recordset[0]);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getSlipOrderBelumDiProses(db_, reception_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var reception = reception_;
        var isiQuery = " " +
          "select * from IHP_Sod " +
          " where (Status='1' or Status='3') " +
          " and SlipOrder in (Select SlipOrder from IHP_Sol Where Reception='" + reception + "')";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn.recordset);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getSlipOrderOldRoomStatusInputTerima(db_, reception_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var reception = reception_;
        var isiQuery = " " +
          "SELECT Distinct " +
          "IHP_SOL.SlipOrder  as slip_order, " +
          //",IHP_Sod.[Inventory] as inventory "+
          "sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_terkirim " +
          //" , IHP_Sod.[Qty] - sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_belum_terkirim"+
          "FROM " +
          "IHP_SOL, " +
          "IHP_Sod  " +
          "left join " +
          "IHP_Okd  " +
          "on IHP_Sod.SlipOrder = IHP_Okd.SlipOrder  " +
          "and IHP_Sod.Inventory = IHP_Okd.Inventory  " +
          "where " +
          "Reception = '" + reception + "'  " +
          " and IHP_Sod.Status!=2" +
          " and IHP_Sod.Status<>2" +
          "and IHP_Sol.SlipOrder = IHP_Sod.SlipOrder " +
          "group by " +
          "IHP_SOL.SlipOrder ";
        //",IHP_Sod.Inventory"+
        //",IHP_Sod.[Qty]"+
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn.recordset);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  getSlipOrderOldRoomStatusProsesSebagian(db_, slip_order_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var slip_order = slip_order_;
        var isiQuery = " " +
          "SELECT Distinct " +
          "IHP_SOL.SlipOrder  as slip_order, " +
          "IHP_Sod.[Inventory] as inventory, " +
          " IHP_Sod.[Price] as price, " +
          " IHP_Sod.[Qty] as quantity, " +
          " isnull(IHP_Sod_Promo.[Harga_Promo],0) as harga_promo, " +
          " isnull(IHP_Sod_Promo.[Harga_Promo],0)/IHP_Sod.[Qty] as harga_promo_per_item, " +
          "sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_terkirim, " +
          "IHP_Sod.[Qty] - sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_belum_terkirim 	 " +
          "FROM " +
          "IHP_SOL, " +
          "IHP_Sod  " +
          "left join    " +
          "IHP_Sod_Promo  " +
          "on IHP_Sod.SlipOrder = IHP_Sod_Promo.SlipOrder  " +
          "and IHP_Sod.Inventory = IHP_Sod_Promo.Inventory  " +
          "left join " +
          "IHP_Okd  " +
          "on IHP_Sod.SlipOrder = IHP_Okd.SlipOrder  " +
          "and IHP_Sod.Inventory = IHP_Okd.Inventory  " +
          "where " +
          "IHP_Sol.SlipOrder = '" + slip_order + "'  " +
          "and IHP_Sol.SlipOrder = IHP_Sod.SlipOrder  " +
          "group by " +
          "IHP_SOL.SlipOrder, " +
          "IHP_Sod.Inventory, " +
          "IHP_Sod.[Qty], " +
          "IHP_Sod.[Inventory]," +
          "IHP_Sod.[Price]," +
          "IHP_Sod_Promo.[Harga_Promo]";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn.recordset);
            }
            else {
              resolve(false);
            }
          }
        });

      } catch (err) {
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  submitOtp(db_, kode_rcp_, kode_member_, nama_member_, room_) {
    return new Promise((resolve, reject) => {
      try {

        var keteranganError0 = "Koneksi to Server Membership Error0 " +
          "Hubungi IT Pusat untuk #Cek Error Program Server Membership Berhenti# Error0 Karena ";
        var keteranganError1 = "Koneksi to Server to Server Membership Error0 " +
          "Cek Koneksi Internet Anda Error0 Karena ";
        var keteranganError2 = "Koneksi to Server to Server Membership Error0 Karena ";

        db = db_;
        //var kode_rcp = kode_rcp_;
        var kode_member = kode_member_;
        //var nama_member = nama_member_;
        var room = room_;
        var otp_generated = otpGenerator.generate(6, {
          digits: true,
          alphabets: false,
          upperCase: false,
          specialChars: false
        });
        var serverMembership0 = "13.76.167.131";
        //serverMembership0 = "192.168.1.80";
        var portServerMembership = "3013";
        //portServerMembership = "3014";
        var urlnya0 = "/room/insertOtpCheckinNotifikasi";
        urlnya0 = urlnya0 + "/" + kode_member + "/" + room + "/" + otp_generated;
        var serverMembership = "http://" + serverMembership0 + ":" + portServerMembership;

        logger.info('Start Post to ' + serverMembership + urlnya0);
        request.post({
          url: serverMembership + urlnya0
        },
          function optionalCallback(err, response, body) {
            if (err) {
              if (err.message == "read ECONNRESET") {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError0 + err.message);
                resolve(false);
              }
              else if (err.message == "connect EHOSTUNREACH " + serverMembership0 + ":" + portServerMembership) {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError1 + err.message);
                resolve(false);
              }
              else if (err.message == "connect ECONNREFUSED " + serverMembership0 + ":" + portServerMembership) {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError0 + err.message);
                resolve(false);
              }
              else {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError2 + err.message);
                resolve(false);
              }
            } else {
              resolve(otp_generated);
            }
          });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  disableReservation(db_, reservation_, room_, status_, member_,) {
    return new Promise((resolve, reject) => {
      try {

        var keteranganError0 = "Koneksi to Server Membership Error0 " +
          "Hubungi IT Pusat untuk #Cek Error Program Server Membership Berhenti# Error0 Karena ";
        var keteranganError1 = "Koneksi to Server to Server Membership Error0 " +
          "Cek Koneksi Internet Anda Error0 Karena ";
        var keteranganError2 = "Koneksi to Server to Server Membership Error0 Karena ";

        db = db_;
        var reservation = reservation_;
        var member = member_;
        var status = status_;
        var room = room_;

        var serverMembership0 = "13.76.167.131";
        //serverMembership0 = "192.168.1.80";
        var portServerMembership = "3013";
        //portServerMembership = "3014";
        var urlnya0 = "/rsv/updateStatusCheckinReservasi_";
        urlnya0 = urlnya0 + "/" + reservation + "/" + room + "/" + status + "/" + member;
        var serverMembership = "http://" + serverMembership0 + ":" + portServerMembership;

        logger.info('Start Post to ' + serverMembership + urlnya0);
        request.post({
          url: serverMembership + urlnya0
        },
          function optionalCallback(err, response, body) {
            if (err) {
              if (err.message == "read ECONNRESET") {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError0 + err.message);
                resolve(false);
              }
              else if (err.message == "connect EHOSTUNREACH " + serverMembership0 + ":" + portServerMembership) {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError1 + err.message);
                resolve(false);
              }
              else if (err.message == "connect ECONNREFUSED " + serverMembership0 + ":" + portServerMembership) {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError0 + err.message);
                resolve(false);
              }
              else {
                logger.error("postNotif_IHP_RoomToServer " + keteranganError2 + err.message);
                resolve(false);
              }
            } else {
              if (body != "") {
                body = JSON.parse(body);
                resolve(body);
              }
            }
          });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpRsv(db_, reservation_, room_, status_,) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var reservation = reservation_;
        var status = status_;
        var room = room_;

        var isiQuery = "" +
          "set dateformat dmy " +
          "Update [dbo].[IHP_Rsv] " +
          " set [Kamar]='" + room + "'" +
          ",[Status]='" + status + "'" +
          ",[Flag_Checkin]='1'" +
          " where Reservation='" + reservation + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" gagal updateIhpRsv");
            logger.info(" gagal updateIhpRsv");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses updateIhpRsv");
            logger.info(" Sukses updateIhpRsv");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateIhpIvcUangMuka(db_, kode_rcp_, total_all_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var total_all = total_all_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Ivc " +
          " Set " +
          " Uang_Muka = " + total_all + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpIvcUangMuka");
            logger.info(kode_rcp_ + " Gagal updateIhpIvcUangMuka");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpIvcUangMuka ");
            logger.info(kode_rcp_ + " Sukses updateIhpIvcUangMuka ");
            console.log(kode_rcp_ + " total all " + total_all);
            logger.info(kode_rcp_ + " total all " + total_all);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateSlipOrderStatusInputTerima(db_, kode_rcp_, slip_order_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var slip_order = slip_order_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Sol " +
          " Set " +
          " Reception = '" + kode_rcp + "'," +
          " Kamar = '" + room + "'" +
          " where SlipOrder = '" + slip_order + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(slip_order + " Gagal updateSlipOrderStatusInput");
            logger.info(slip_order + " Gagal updateSlipOrderStatusInput");
            resolve(false);
          } else {
            sql.close();
            console.log(slip_order + " Sukses updateSlipOrderStatusInput ");
            logger.info(slip_order + " Sukses updateSlipOrderStatusInput ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateSodStatusInputTerima(db_, old_slip_order_, slip_order_, inventory_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var inventory = inventory_;
        var slip_order = slip_order_;
        var old_slip_order = old_slip_order_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Sod " +
          " Set " +
          " SlipOrder = '" + slip_order + "'" +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory = '" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_slip_order + " Gagal updateSodStatusInputTerima");
            logger.info(old_slip_order + " Gagal updateSodStatusInputTerima");
            resolve(false);
          } else {
            sql.close();
            console.log(old_slip_order + " Sukses updateSodStatusInputTerima ");
            logger.info(old_slip_order + " Sukses updateSodStatusInputTerima ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateOldSodStatusProsesSebagian(db_, old_slip_order_, quantity_, inventory_, price_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var inventory = inventory_;
        var quantity = quantity_;
        var old_slip_order = old_slip_order_;
        var price = price_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Sod " +
          " Set " +
          " Qty = " + quantity + "," +
          " Qty_Terima = " + quantity + "," +
          " Total = " + quantity * price + "," +
          " Tgl_Kirim =Getdate() " +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory = '" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_slip_order + " Gagal updateOldSodStatusProsesSebagian");
            logger.info(old_slip_order + " Gagal updateOldSodStatusProsesSebagian");
            resolve(false);
          } else {
            sql.close();
            console.log(old_slip_order + " Sukses updateOldSodStatusProsesSebagian ");
            logger.info(old_slip_order + " Sukses updateOldSodStatusProsesSebagian ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateSodPromoStatusInputTerima(db_, old_slip_order_, slip_order_, inventory_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var inventory = inventory_;
        var slip_order = slip_order_;
        var old_slip_order = old_slip_order_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Sod_Promo " +
          " Set " +
          " SlipOrder = '" + slip_order + "'" +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory = '" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_slip_order + " Gagal updateSodPromoStatusInputTerima");
            logger.info(old_slip_order + " Gagal updateSodPromoStatusInputTerima");
            resolve(false);
          } else {
            sql.close();
            console.log(old_slip_order + " Sukses updateSodPromoStatusInputTerima ");
            logger.info(old_slip_order + " Sukses updateSodPromoStatusInputTerima ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateOldSodPromoStatusProsesSebagian(db_, old_slip_order_, harga_promo_, inventory_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var inventory = inventory_;
        var harga_promo = harga_promo_;
        var old_slip_order = old_slip_order_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Sod_Promo " +
          " Set " +
          " Harga_Promo = " + harga_promo + "" +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory = '" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(old_slip_order + " Gagal updateOldSodPromoStatusProsesSebagian");
            logger.info(old_slip_order + " Gagal updateOldSodPromoStatusProsesSebagian");
            resolve(false);
          } else {
            sql.close();
            console.log(old_slip_order + " Sukses updateOldSodPromoStatusProsesSebagian ");
            logger.info(old_slip_order + " Sukses updateOldSodPromoStatusProsesSebagian ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  insertNewSolRoomTransfer(db_, old_slip_order_, slip_order_, kode_rcp_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var slip_order = slip_order_;
        var old_slip_order = old_slip_order_;
        var kode_rcp = kode_rcp_;
        var room = room_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " insert into IHP_Sol " +
          " Select " +
          " '" + slip_order + "'" +
          ",[DATE] " +
          ",[Shift] " +
          //",[Reception] " +
          ",'" + kode_rcp + "'" +
          //",[Kamar] " +
          ",'" + room + "'" +
          ",[Status] " +
          ",[Chtime] " +
          ",[CHusr] " +
          ",[POS] " +
          ",[Date_Trans] " +
          ",isnull([Mobile_POS],'') as Mobile_POS" +
          " from IHP_Sol " +
          " where SlipOrder = '" + old_slip_order + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(slip_order + " Gagal insertNewSolRoomTransfer");
            logger.info(slip_order + " Gagal insertNewSolRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(slip_order + " Sukses insertNewSolRoomTransfer ");
            logger.info(slip_order + " Sukses insertNewSolRoomTransfer ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  insertNewSodTerkirimSebagianRoomTransfer(db_, old_slip_order_, slip_order_, inventory_, quantity_, price_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var slip_order = slip_order_;
        var old_slip_order = old_slip_order_;
        var inventory = inventory_;
        var quantity = quantity_;
        var price = price_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " insert into IHP_Sod " +
          " Select " +
          " '" + slip_order + "'" +
          " ,[Inventory] " +
          ",[Nama] " +
          "," + price + " " +
          "," + quantity + " " +
          "," + quantity + " " +
          "," + price * quantity + " " +
          ",[Status] " +
          ",[Location] " +
          ",[Printed] " +
          ",[Note] " +
          ",[CHUsr] " +
          ",[Tgl_Terima] " +
          " ,[Tgl_Kirim] " +
          ",isnull([Urut],'') as Urut" +
          " from IHP_Sod " +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory='" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(slip_order + " Gagal insertNewSodTerkirimSebagianRoomTransfer");
            logger.info(slip_order + " Gagal insertNewSodTerkirimSebagianRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(slip_order + " Sukses insertNewSodTerkirimSebagianRoomTransfer ");
            logger.info(slip_order + " Sukses insertNewSodTerkirimSebagianRoomTransfer ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  insertNewSodPromoTerkirimSebagianRoomTransfer(db_, old_slip_order_, slip_order_, inventory_, old_quantity_, quantity_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var slip_order = slip_order_;
        var old_slip_order = old_slip_order_;
        var inventory = inventory_;
        var quantity = quantity_;
        var old_quantity = old_quantity_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " insert into IHP_Sod_Promo " +
          " Select " +
          " '" + slip_order + "'" +
          " ,[Inventory] " +
          ",[Promo_Food] " +
          ",([Harga_Promo]/" + old_quantity + ")*" + quantity +
          " from IHP_Sod_Promo " +
          " where SlipOrder = '" + old_slip_order + "'" +
          " and  Inventory='" + inventory + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(slip_order + " Gagal insertNewSodPromoTerkirimSebagianRoomTransfer");
            logger.info(slip_order + " Gagal insertNewSodPromoTerkirimSebagianRoomTransfer");
            resolve(false);
          } else {
            sql.close();
            console.log(slip_order + " Sukses insertNewSodPromoTerkirimSebagianRoomTransfer ");
            logger.info(slip_order + " Sukses insertNewSodPromoTerkirimSebagianRoomTransfer ");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  updateIhpRcpUangMuka(db_, kode_rcp_, total_all_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var total_all = total_all_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          " set dateformat dmy " +
          " Update IHP_Rcp " +
          " Set " +
          " Uang_Muka = " + total_all + "" +
          " where Reception = '" + kode_rcp + "'";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(kode_rcp_ + " Gagal updateIhpRcpUangMuka");
            logger.info(kode_rcp_ + " Gagal updateIhpRcpUangMuka");
            resolve(false);
          } else {
            sql.close();
            console.log(kode_rcp_ + " Sukses updateIhpRcpUangMuka ");
            logger.info(kode_rcp_ + " Sukses updateIhpRcpUangMuka ");
            console.log(kode_rcp_ + " total all " + total_all);
            logger.info(kode_rcp_ + " total all " + total_all);
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }


  updateRecountIhpIvcTotalAll(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          `
             UPDATE
 IHP_Ivc_ 
SET
 IHP_Ivc_.Total_All = 
 (
    IHP_Ivc__.Total_Kamar
 )
  + IHP_Ivc__.Total_Penjualan + IHP_Ivc__.Charge_Lain 
FROM
 IHP_Ivc AS IHP_Ivc_ 
 Inner JOIN
    (
       SELECT
          Reception,
          Total_Kamar,
          Total_Penjualan,
          Charge_Lain,
          Uang_Voucher 
       FROM
          IHP_Ivc 
       where
          Reception = '${kode_rcp}' 
       GROUP BY
          Reception,
          Total_Kamar,
          Total_Penjualan,
          Charge_Lain,
          Uang_Voucher 
    )
    IHP_Ivc__ 
    ON IHP_Ivc__.Reception = IHP_Ivc_.Reception 
WHERE
 IHP_Ivc_.Reception = '${kode_rcp}'`;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            logger.info(kode_rcp + " sukses updateRecountIhpIvcTotalAll");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }

  updateRecountIhpIvc(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          `
           UPDATE
   IHP_Ivc_ 
SET
IHP_Ivc_.Charge_Penjualan = isnull(IHP_Okl_.total_penjualan, 0)
,IHP_Ivc_.Total_Cancelation = isnull(IHP_Ocl_.total_cancelation, 0)
,IHP_Ivc_.Discount_Penjualan = isnull(IHP_Okl_.total_discount_penjualan, 0) - isnull(IHP_Ocl_.total_discount_penjualan_cancelation, 0)
,IHP_Ivc_.Service_Penjualan = ( (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0) - (isnull(IHP_Okl_.total_discount_penjualan, 0) - isnull(IHP_Ocl_.total_discount_penjualan_cancelation, 0))) / 100 ) * IHP_Config2.Service_Persen_Food
,IHP_Ivc_.Tax_Penjualan = ((isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0)) + ( (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0) - (isnull(IHP_Okl_.total_discount_penjualan, 0) - isnull(IHP_Ocl_.total_discount_penjualan_cancelation, 0))) / 100 ) * IHP_Config2.Service_Persen_Food)/ 100 * IHP_Config2.Tax_Persen_Food
,IHP_Ivc_.Total_Penjualan = (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0)) +( (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0) - (isnull(IHP_Okl_.total_discount_penjualan, 0) - isnull(IHP_Ocl_.total_discount_penjualan_cancelation, 0))) / 100 ) * IHP_Config2.Service_Persen_Food + ( (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0)) + ( (isnull(IHP_Okl_.total_penjualan, 0) - isnull(IHP_Ocl_.total_cancelation, 0) - (isnull(IHP_Okl_.total_discount_penjualan, 0) - isnull(IHP_Ocl_.total_discount_penjualan_cancelation, 0))) / 100 ) * IHP_Config2.Service_Persen_Food ) / 100 * IHP_Config2.Tax_Persen_Food
,IHP_Ivc_.Total_Kamar = isnull(IHP_Ivc_.Sewa_Kamar, 0) + isnull(IHP_Ivc_.Total_Extend, 0) + isnull(IHP_Ivc_.Service_Kamar, 0) + isnull(IHP_Ivc_.Tax_Kamar, 0) + isnull(IHP_Ivc_.Overpax, 0) - isnull(IHP_Ivc_.Uang_Voucher, 0)
--,IHP_Ivc_.Sewa_Kamar_Sebelum_Diskon = isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) 
--,IHP_Ivc_.Diskon_Sewa_Kamar = isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0)
--,IHP_Ivc_.Total_Extend_Sebelum_Diskon = isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0)
--,IHP_Ivc_.Diskon_Extend_Kamar = isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0)
--,IHP_Ivc_.Sewa_Kamar = isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0)
--,IHP_Ivc_.Total_Extend = isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0)
--,IHP_Ivc_.Discount_Kamar =  (isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher) / 100*(isnull(IHP_Mbr.Diskon_Room, 0))
--,IHP_Ivc_.Service_Kamar = (( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + IHP_Ivc_.Surcharge_Kamar)/ 100*IHP_Config2.Service_Persen_Room
--,IHP_Ivc_.Tax_Kamar = (( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + ( ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + IHP_Ivc_.Surcharge_Kamar) / 100*IHP_Config2.Service_Persen_Room )/ 100*IHP_Config2.Tax_Persen_Room
--,IHP_Ivc_.Total_Kamar =(isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + ( ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + IHP_Ivc_.Surcharge_Kamar) / 100*IHP_Config2.Service_Persen_Room + ( ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + ( ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) - ( isnull(IHP_Detail_Sewa_Kamar_.total_tarif_kamar_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_.total_promo_kamar, 0) + isnull(IHP_Detail_Sewa_Kamar_Extend_.total_tarif_kamar_extend_sebelum_diskon, 0) - isnull(IHP_Detail_Diskon_Sewa_Kamar_Extend_.total_promo_kamar_extend, 0) + IHP_Ivc_.Overpax - IHP_Ivc_.Uang_Voucher ) / 100*(isnull(IHP_Mbr.Diskon_Room, 0)) + IHP_Ivc_.Surcharge_Kamar) / 100*IHP_Config2.Service_Persen_Room ) / 100*IHP_Config2.Tax_Persen_Room 
FROM
   IHP_Ivc AS IHP_Ivc_ 
   Left Join
      IHP_Mbr 
      On IHP_Ivc_.Member = IHP_Mbr.Member 
   Left JOIN
      (
         SELECT
            Reception,
            SUM(Total) total_penjualan,
            SUM(Discount) total_discount_penjualan 
         FROM
            IHP_Okl 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Okl_ 
      ON IHP_Okl_.Reception = IHP_Ivc_.Reception 
   Left JOIN
      (
         SELECT
            Reception,
            SUM(Charge) total_cancelation,
            SUM(Discount) total_discount_penjualan_cancelation 
         FROM
            IHP_Ocl 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Ocl_ 
      ON IHP_Ocl_.Reception = IHP_Ivc_.Reception 
   Inner JOIN
      (
         SELECT
            Reception,
            SUM(Tarif_Kamar_Yang_Digunakan) total_tarif_kamar_sebelum_diskon 
         FROM
            IHP_Detail_Sewa_Kamar 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Detail_Sewa_Kamar_ 
      ON IHP_Detail_Sewa_Kamar_.Reception = IHP_Ivc_.Reception 
   Left JOIN
      (
         SELECT
            Reception,
            SUM(Promo_Yang_Didapatkan) total_promo_kamar 
         FROM
            IHP_Detail_Diskon_Sewa_Kamar 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Detail_Diskon_Sewa_Kamar_ 
      ON IHP_Detail_Diskon_Sewa_Kamar_.Reception = IHP_Ivc_.Reception 
   Left JOIN
      (
         SELECT
            Reception,
            SUM(Tarif_Kamar_Yang_Digunakan) total_tarif_kamar_extend_sebelum_diskon 
         FROM
            IHP_Detail_Sewa_Kamar_Extend 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Detail_Sewa_Kamar_Extend_ 
      ON IHP_Detail_Sewa_Kamar_Extend_.Reception = IHP_Ivc_.Reception 
   Left JOIN
      (
         SELECT
            Reception,
            SUM(Promo_Yang_Didapatkan) total_promo_kamar_extend 
         FROM
            IHP_Detail_Diskon_Sewa_Kamar_Extend 
         where
            Reception = '${kode_rcp}' 
         GROUP BY
            Reception 
      )
      IHP_Detail_Diskon_Sewa_Kamar_Extend_ 
      ON IHP_Detail_Diskon_Sewa_Kamar_Extend_.Reception = IHP_Ivc_.Reception,
      IHP_Config2 
WHERE
   IHP_Ivc_.Reception = '${kode_rcp}' 
   and IHP_Config2.Data = '1'`;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            logger.info(kode_rcp + " sukses updateRecountIhpIvc");
            resolve(true);
          }
        });

      } catch (err) {
        sql.close();
        logger.error(err);
        console.log(err);
        logger.error(err.message);
        logger.error('Catch Error prosesQuery ');
        resolve(false);
      }
    });
  }



  getNomorVoucher(db_, kode_rcp_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;

        var isiQuery = "" +
          `
        select Voucher from IHP_UangVoucher where Reception= '${kode_rcp}' 
        `;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            logger.error(err.message);
            reject(err.message);
          } else {
            if (dataReturn.recordset.length > 0) {
              var voucher = dataReturn.recordset[0].Voucher;
              resolve(voucher);
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

}
module.exports = CheckinProses;