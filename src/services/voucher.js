var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var dataResponse;

class Voucher {
  constructor() { }

  getTotalNilaiPotonganVoucher(db_, kode_rcp_, voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kode_rcp = kode_rcp_;
        var voucher = voucher_;
        //you must use set dateformat dmy
        var isiQuery = "" +
          " set dateformat dmy " +
          " SELECT " +
          " case " +
          " when " +
          " [IHP_Rcp_DetailsRoom].[Time_Start] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " and " +
          " [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " then " +
          " 2 " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " 4 " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " 1 " +
          " when " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " 3 " +
          " else " +
          " 0 " +
          " end " +
          " as awal_tengah_akhir, " +
          " case " +
          " when " +
          " [IHP_Rcp_DetailsRoom].[Time_Start] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " and " +
          " [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " then " +
          " 60 " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " DATEDIFF(mi,[IHP_Rcp].[Checkin],DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin)) " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " DATEDIFF(mi,[IHP_Rcp].[Checkin],[IHP_Rcp_DetailsRoom].[Time_Finish]) " +
          " when " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " DATEDIFF(mi,[IHP_Rcp_DetailsRoom].[Time_Start],DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin)) " +
          " else " +
          " 0 " +
          " end " +
          " as menit_yang_digunakan, " +
          " case " +
          " when " +
          " [IHP_Rcp_DetailsRoom].[Time_Start] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " and " +
          " [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " between [IHP_Rcp].[Checkin] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " then " +
          " ([IHP_Rcp_DetailsRoom].[Tarif]/60)*60 " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " and " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " ([IHP_Rcp_DetailsRoom].[Tarif]/60)*DATEDIFF(mi,[IHP_Rcp].[Checkin],DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin)) " +
          " when " +
          " [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " ([IHP_Rcp_DetailsRoom].[Tarif]/60)*DATEDIFF(mi,[IHP_Rcp].[Checkin],[IHP_Rcp_DetailsRoom].[Time_Finish]) " +
          " when " +
          " DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin) " +
          " between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] " +
          " then " +
          " ([IHP_Rcp_DetailsRoom].[Tarif]/60)*DATEDIFF(mi,[IHP_Rcp_DetailsRoom].[Time_Start],DATEADD(minute, " +
          " ( " +
          " IHP_Vcr.Jam_Free*60 " +
          " ) " +
          " + IHP_Vcr.Menit_Free, [IHP_Rcp].Checkin)) " +
          " else " +
          " 0 " +
          " end " +
          " as tarif_voucher_yang_didapatkan " +
          " " +
          " FROM " +
          " IHP_Vcr " +
          " left join " +
          " IHP_UangVoucher " +
          " on IHP_UangVoucher.Voucher = IHP_Vcr.Voucher , [IHP_Rcp] , [IHP_Rcp_DetailsRoom] " +
          " WHERE " +
          " IHP_Vcr.Voucher = '" + voucher + "' " +
          " and IHP_Vcr.Jenis_Voucher=0 " +
          " and [IHP_Rcp].[Reception] = '" + kode_rcp + "' " +
          " and [IHP_Rcp_DetailsRoom] .[Reception] = [IHP_Rcp].[Reception] ";


        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            var voucher = parseFloat(0);
            if (dataReturn.recordset.length > 0) {
              for (var a = 0; a < dataReturn.recordset.length; a++) {
                var voucher_ = dataReturn.recordset[a].tarif_voucher_yang_didapatkan;
                voucher_ = parseFloat(voucher_);
                voucher = voucher + voucher_;
              }
              console.log(kode_rcp + " voucher " + voucher);
              logger.info(kode_rcp + " voucher " + voucher);
              resolve(voucher);
            }
            else {
              console.log(kode_rcp + " voucher 0");
              logger.info(kode_rcp + " voucher 0");
              resolve(voucher);
            }
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

  getCekAktifKondisiVoucher(db_, voucher_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var voucher = voucher_;
        var isiQuery = "" +
          " SELECT " +
          " IHP_Vcr.[Voucher] as voucher, " +
          " IHP_Vcr.[DATE] as date, " +
          " IHP_Vcr.[Expired] as expired, " +
          " case " +
          " when  IHP_Vcr.[Expired] >= DATEADD(dd, 0, DATEDIFF(dd, 0, getdate()))   then  0   " +
          " when  IHP_Vcr.[Expired] < DATEADD(dd, 0, DATEDIFF(dd, 0, getdate()))  then  1  " +
          " end " +
          " as status_voucher_expired, IHP_Vcr.[Jenis_kamar] as jenis_kamar, IHP_Vcr.[Kamar] as kamar, IHP_Vcr.[Jam_Free] as jam_free, IHP_Vcr.[Menit_Free] as menit_free, IHP_Vcr.[Date_Start] as date_start, IHP_Vcr.[Time_Start] as time_start, " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
          " else " +
          " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
          " end " +
          " as date_time_start, IHP_Vcr.[Date_Finish] as date_finish, IHP_Vcr.[Time_Finish] as time_finish, " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " else " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " end " +
          " as date_time_finish , " +
          " case " +
          " when " +
          " getdate() BETWEEN " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
          " else " +
          " DATEADD(day, IHP_Vcr.[Date_Start], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Start])) " +
          " end " +
          " and " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " else " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " end " +
          " then " +
          " '1' " +
          " else " +
          " '0' " +
          " end " +
          " as status_jam_sekarang_voucher_bisa_digunakan , DATEDIFF(mi, getdate(), " +
          " case " +
          " when " +
          " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
          " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
          " then " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " else " +
          " DATEADD(day, IHP_Vcr.[Date_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + IHP_Vcr.[Time_Finish])) " +
          " end " +
          " ) AS sisa_waktu_voucher_hari_ini_menit , IHP_Vcr.[Nilai] as nilai, IHP_Vcr.[Jenis_Voucher] as jenis_voucher , " +
          " case " +
          " when " +
          " IHP_Vcr.[Jenis_Voucher] = 0 " +
          " then " +
          " 'FREE VOUCHER MEMOTONG RUPIAH SEWA RUANGAN SAJA' " +
          " when " +
          " IHP_Vcr.[Jenis_Voucher] = 1 " +
          " then " +
          " 'GIFT VOUCHER MEMOTONG TOTAL RUPIAH TAGIHAN ' " +
          " end " +
          " as keterangan_jenis_voucher, IHP_Vcr.[Status] as status_voucher_aktif , " +
          " case " +
          " when " +
          " IHP_Vcr.[Status] = 0 " +
          " then " +
          " 'VOUCHER SUDAH DIGUNAKAN' " +
          " when " +
          " IHP_Vcr.[Status] = 2 " +
          " then " +
          " 'VOUCHER SEDANG DIGUNAKAN' " +
          " when  " +
          " IHP_Vcr.[Status] = 1 " +
          " then " +
          " 'VOUCHER BELUM DIGUNAKAN' " +
          " end " +
          " as keterangan_status_voucher_aktif, isnull(IHP_UangVoucher.Reception, '') as voucher_sudah_digunanakan_di_reception " +
          " FROM " +
          " IHP_Vcr " +
          " left join " +
          " IHP_UangVoucher " +
          " on IHP_UangVoucher.Voucher = IHP_Vcr.Voucher " +
          " WHERE " +
          " IHP_Vcr.Voucher = '" + voucher + "' ";


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
              if (dataReturn.recordset[0].status_voucher_expired == 1) {
                console.log(dataReturn.recordset[0].voucher + " non aktif sudah expired ");
                logger.info(dataReturn.recordset[0].voucher + " non aktif sudah expired ");
              }
              if (dataReturn.recordset[0].status_voucher_aktif == 2) {
                console.log(dataReturn.recordset[0].voucher + " non aktif sedang digunakan checkin di reception " + dataReturn.recordset[0].voucher_sudah_digunanakan_di_reception);
                logger.info(dataReturn.recordset[0].voucher + " non aktif sedang digunakan checkin di reception " + dataReturn.recordset[0].voucher_sudah_digunanakan_di_reception);
              }
              if (dataReturn.recordset[0].status_voucher_aktif == 0) {
                console.log(dataReturn.recordset[0].voucher + " non aktif sudah digunakan checkin di reception " + dataReturn.recordset[0].voucher_sudah_digunanakan_di_reception);
                logger.info(dataReturn.recordset[0].voucher + " non aktif sudah digunakan checkin di reception " + dataReturn.recordset[0].voucher_sudah_digunanakan_di_reception);
              }
              if (dataReturn.recordset[0].sisa_waktu_voucher_hari_ini_menit < 60) {
                console.log(dataReturn.recordset[0].voucher + " non aktif waktu aktif kurang dari 60 menit, tersisa menit " + dataReturn.recordset[0].sisa_waktu_voucher_hari_ini_menit);
                logger.info(dataReturn.recordset[0].voucher + " non aktif waktu aktif kurang dari 60 menit, tersisa menit " + dataReturn.recordset[0].sisa_waktu_voucher_hari_ini_menit);
              }
              resolve(dataResponse);
            }
            else {
              resolve(false);
            }

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

}
module.exports = Voucher;