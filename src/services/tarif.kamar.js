var ResponseFormat = require('../util/response');
var sql = require("mssql");
var logger = require('../util/logger');
var db;
var isiQuery;
var dataResponse;
var a;

class TarifKamar {
   constructor() { }

   getCekAdaTidakProcedureJamKenaSewa(db_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            isiQuery = "" +
               " SELECT name FROM   sysobjects WHERE  name = 'Jam_Kena_Sewa_' AND type = 'P' ";
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
                     var jam_kena_sewa = dataReturn.recordset[0].name;
                     console.log("procedure jam kena sewa sudah ada");
                     logger.info("procedure jam kena sewa sudah ada");
                     resolve(jam_kena_sewa);
                  }
                  else {
                     console.log("procedure jam kena sewa tidak ada");
                     logger.info("procedure jam kena sewa tidak ada");
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

   deleteProcedureJamKenaSewa(db_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            isiQuery = "" +
               " IF  EXISTS (SELECT name " +
               "        FROM   sysobjects " +
               "       WHERE  name = 'Jam_Kena_Sewa_' " +
               "        AND 	  type = 'P') " +
               "   DROP PROCEDURE Jam_Kena_Sewa_ ";
            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error deleteProcedureJamKenaSewa ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  console.log("Sukses deleteProcedureJamKenaSewa");
                  logger.info("Sukses deleteProcedureJamKenaSewa");
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

   getJamOperasionalOutlet(db_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var isiQuery = "" +
               " set dateformat dmy  " +
               " SELECT" +
               " Outlet as outlet, " +
               " Nama_Outlet as nama_outlet, " +
               " Alamat_Outlet as alamat_outlet, " +
               " Tlp1 as tlp1, " +
               " Tlp2 as tlp2, " +
               " Kota as kota, " +
               " getdate() as sekarang" +
               /* " case" +
                " when" +
                " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
                " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
                " then " +
                " DATEADD(day, [IHP_Config].[Workdate_Finish], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + [IHP_Config].[Worktime_Finish])) " +
                " else" +
                " DATEADD(day, [IHP_Config].[Workdate_Finish], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + [IHP_Config].[Worktime_Finish])) " +
                " end" +
                " as date_time_outlet_tutup , " +
                " case" +
                " when" +
                " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
                " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
                " then" +
                " DATEADD(day, [IHP_Config].[Workdate_Start], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + [IHP_Config].[Worktime_Start])) " +
                " else" +
                " DATEADD(day, [IHP_Config].[Workdate_Start], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + [IHP_Config].[Worktime_Start])) " +
                " end" +
                " as date_time_outlet_buka , " +
                " case" +
                " when" +
                " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0" +
                " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
                " then" +
                " DATEADD(day, [IHP_Config].[ShiftDate], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + [IHP_Config].[Shifttime])) " +
                " else " +
                " DATEADD(day, [IHP_Config].[ShiftDate], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + [IHP_Config].[Shifttime]))" +
                " end" +
                " as date_time_pergantian_shift , " +
                " case" +
                " when" +
                " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
                " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
                " then" +
                " DATEADD(day, [IHP_Config].[GantiTarif1Date], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + [IHP_Config].[GantiTarif1Time])) " +
                " else" +
                " DATEADD(day, [IHP_Config].[GantiTarif1Date], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + [IHP_Config].[GantiTarif1Time])) " +
                " end" +
                " as date_time_pergantian_shift_pertama , " +
                " case" +
                " when" +
                " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
                " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5" +
                " then" +
                " DATEADD(day, [IHP_Config].[GantiTarif2Date], CONVERT(DATETIME, convert(varchar(10), DATEADD(dd, - 1, GETDATE()), 23) + ' ' + [IHP_Config].[GantiTarif2Time])) " +
                " else" +
                " DATEADD(day, [IHP_Config].[GantiTarif2Date], CONVERT(DATETIME, convert(varchar(10), getdate(), 23) + ' ' + [IHP_Config].[GantiTarif2Time])) " +
                " end" +
                " as date_time_pergantian_shift_kedua" +*/
               " FROM" +
               " IHP_Config " +
               " where" +
               " Data = 1";

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

   getNumberDayNow(db_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var isiQuery = "" +
               //" set  dateformat dmy " +
               " SELECT" +
               " case" +
               " when" +
               " CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) >= 0 " +
               " and CAST(substring(convert(varchar(24), getdate(), 114), 1, 2)AS int) <= 5 " +
               " then" +
               " DATEPART(dw,GETDATE()-1)" +
               " else " +
               " DATEPART(dw,GETDATE())" +
               " end" +
               " as nomor_hari_ini" +
               " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)" +
               " as sekarang" +
               ",CONVERT(VARCHAR(24),DATEADD(minute,60,GETDATE()),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),DATEADD(minute,60,GETDATE()),114),1,8)" +
               " as sekarangPlus60Menit" +
               " ,DATEADD(minute,60,GETDATE()) as tambah_60_menit";

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

   getCreateProsedureTarifKamarPerjam(db_) {
      return new Promise((resolve, reject) => {
         try {

            db = db_;
            var isiQuery = "" +
               `CREATE PROCEDURE [dbo].[Jam_Kena_Sewa_] @Type_Room nvarchar(50), @Day nvarchar(1), @Checkin smalldatetime, @Checkout smalldatetime AS 
          BEGIN
             SET
                dateformat dmy 
                DECLARE @1word int, @2word int, @3word nvarchar(8), @4word nvarchar(8), @6word nvarchar(8), @Minus int, @Plus int, @TGL nvarchar(2), @Bln nvarchar(2), @Th nvarchar(4), @Awal nvarchar(8), @Akhir nvarchar(8) 
                SET
                   @1Word = datepart(hh, @Checkin) 
                   SET
                      @2Word = datepart(hh, @Checkout) 
                      SET
                         @TGL = datepart(dd, @checkin) 
                         SET
                            @bln = datepart(mm, @checkin) 
                            SET
                               @th = datepart(yyyy, @checkin) IF @1word = 0 
                               SET
                                  @3Word = Cast(23 AS nvarchar(8)) 
                                  ELSE
                                     SET
                                        @3Word = Cast(@1word - 1 AS nvarchar(8)) IF @2word = 23 
                                        SET
                                           @2word = Cast(0 AS nvarchar(8)) 
                                           ELSE
                                              SET
                                                 @4Word = Cast(@2word + 1 AS nvarchar(8)) IF Len(@3Word) < 2 
                                                 SET
                                                    @3Word = '0' + @3word IF Len(@4Word) < 2 
                                                    SET
                                                       @4Word = '0' + @4word IF @1word > @2Word 
                                                       BEGIN
                                                          SET
                                                             @Awal = 
                                                             (
                                                                SELECT DISTINCT
                                                                   Time_Start 
                                                                FROM
                                                                   IHP_Jenis_kamar 
                                                                WHERE
                                                                   Time_Start like @3Word + '%' 
                                                             )
                                                             SET
                                                                @6word = 
                                                                (
                                                                   SELECT DISTINCT
                                                                      Time_Start 
                                                                   FROM
                                                                      IHP_Jenis_kamar 
                                                                   WHERE
                                                                      Time_Start like '00%' 
                                                                )
                                                                SET
                                                                   @akhir = 
                                                                   (
                                                                      SELECT DISTINCT
                                                                         Time_Finish 
                                                                      FROM
                                                                         IHP_Jenis_kamar 
                                                                      WHERE
                                                                         time_Finish like @4Word + '%' 
                                                                   )
                                                                   SELECT
                                                                      Nama_kamar,
                                                                      Hari,
                                                                      overpax,
                                                                      tarif,
                                                                      Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) AS Time_Start,
                                                                      CONVERT(VARCHAR(10), Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime), 103) + ' ' + convert(VARCHAR(8), Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime), 14) AS Time_Start_Dmy,
                                                                      CASE
                                                                         WHEN
                                                                            Time_Finish = '00:00:59' 
                                                                         THEN
                                                                            DATEADD(DAY, 1, Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime)) 
                                                                         ELSE
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) 
                                                                      END
                                                                      AS Time_Finish, 
                                                                      CASE
                                                                         WHEN
                                                                            Time_Finish = '00:00:59' 
                                                                         THEN
                                                                            CONVERT(VARCHAR(10), DATEADD(DAY, 1, Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime)), 103) + ' ' + convert(VARCHAR(8), DATEADD(DAY, 1, Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime)), 14) 
                                                                         ELSE
                                                                            CONVERT(VARCHAR(10), Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime), 103) + ' ' + convert(VARCHAR(8), Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime), 14) 
                                                                      END
                                                                      AS Time_Finish_Dmy, Time_Start AS Jam_Start, Time_Finish AS Jam_Finish, '<24:00-server-android' AS Keterangan 
                                                                   FROM
                                                                      IHP_Jenis_kamar 
                                                                   WHERE
                                                                      CAST(Time_Start AS smalldatetime) >= @Awal 
                                                                      AND Nama_kamar = @Type_Room 
                                                                      AND Hari = @Day 
                                                                   UNION
                                                                   SELECT
                                                                      Nama_kamar,
                                                                      Hari,
                                                                      overpax,
                                                                      tarif,
                                                                      (
                                                                         Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + 1
                                                                      )
                                                                      AS Time_Start,
                                                                      CONVERT(VARCHAR(10), 
                                                                      (
                                                                         Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + 1
                                                                      )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                      (
                                                                         Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + 1
                                                                      )
          , 14) AS Time_Start_Dmy,
                                                                      CASE
                                                                         WHEN
                                                                            Time_Finish = '00:00:59' 
                                                                         THEN
                                                                            DATEADD(DAY, 1, 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                            )
          ) 
                                                                         ELSE
          (Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1) 
                                                                      END
                                                                      AS Time_Finish, 
                                                                      CASE
                                                                         WHEN
                                                                            Time_Finish = '00:00:59' 
                                                                         THEN
                                                                            CONVERT(VARCHAR(10), DATEADD(DAY, 1, 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                            )
          ), 103) + ' ' + convert(VARCHAR(8), DATEADD(DAY, 1, 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                            )
          ), 14) 
                                                                         ELSE
                                                                            CONVERT(VARCHAR(10), 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                            )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                            )
          , 14) 
                                                                      END
                                                                      AS Time_Finish_Dmy, Time_Start AS Jam_Start, Time_Finish AS Jam_Finish, '>24:00-server-android' AS Keterangan 
                                                                   FROM
                                                                      IHP_Jenis_kamar 
                                                                   WHERE
                                                                      CAST(Time_Start AS smalldatetime) >= @6word 
                                                                      AND CAST(Time_Finish AS smalldatetime) <= @Akhir 
                                                                      AND CAST(Time_Start AS smalldatetime) <= @akhir 
                                                                      AND Nama_kamar = @Type_Room 
                                                                      AND Hari = @Day 
                                                       END
                                                       IF @1word <= @2word 
                                                       BEGIN
                                                          IF (@1Word < Cast(@3Word AS int)) 
                                                                   SET
                                                                      @Minus = 1 
                                                                      ELSE
                                                                   SET
                                                                      @Minus = 0 IF (@2Word > Cast(@4Word AS int)) 
                                                                   SET
                                                                      @Plus = 1 
                                                                      ELSE
                                                                   SET
                                                                      @Plus = 0 IF (@Minus = 1) 
                                                                      OR 
                                                                      (
                                                                         @Plus = 1
                                                                      )
                                                                      BEGIN
                                                                   SET
                                                                      @Awal = 
                                                                      (
                                                                         SELECT DISTINCT
                                                                            Time_Start 
                                                                         FROM
                                                                            IHP_Jenis_kamar 
                                                                         WHERE
                                                                            Time_Start like @3Word + '%' 
                                                                      )
                                                                   SET
                                                                      @6word = 
                                                                      (
                                                                         SELECT DISTINCT
                                                                            Time_Start 
                                                                         FROM
                                                                            IHP_Jenis_kamar 
                                                                         WHERE
                                                                            Time_Start like '00%' 
                                                                      )
                                                                   SET
                                                                      @akhir = 
                                                                      (
                                                                         SELECT DISTINCT
                                                                            Time_Finish 
                                                                         FROM
                                                                            IHP_Jenis_kamar 
                                                                         WHERE
                                                                            time_Finish like @4Word + '%' 
                                                                      )
                                                                      SELECT
                                                                         Nama_kamar,
                                                                         Hari,
                                                                         overpax,
                                                                         tarif,
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @minus
                                                                         )
                                                                         AS Time_Start,
                                                                         CONVERT(VARCHAR(10), 
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @minus
                                                                         )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @minus
                                                                         )
          , 14) AS Time_Start_Dmy,
                                                                         CASE
                                                                            WHEN
                                                                               Time_Finish = '00:00:59' 
                                                                            THEN
                                                                               DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) - @Minus
                                                                               )
          ) 
                                                                            ELSE
          (Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1) 
                                                                         END
                                                                         AS Time_Finish, 
                                                                         CASE
                                                                            WHEN
                                                                               Time_Finish = '00:00:59' 
                                                                            THEN
                                                                               CONVERT(VARCHAR(10), DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) - @Minus
                                                                               )
          ), 103) + ' ' + convert(VARCHAR(8), DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) - @Minus
                                                                               )
          ), 14) 
                                                                            ELSE
                                                                               CONVERT(VARCHAR(10), 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                               )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + 1
                                                                               )
          , 14) 
                                                                         END
                                                                         AS Time_Finish_Dmy, Time_Start AS Jam_Start, Time_Finish AS Jam_Finish, '1a if jam_checkin <= jam_checkout-server-android' AS keterangan 
                                                                      FROM
                                                                         IHP_Jenis_kamar 
                                                                      WHERE
                                                                         CAST(Time_Start AS smalldatetime) >= @Awal 
                                                                         AND Nama_kamar = @Type_Room 
                                                                         AND Hari = @Day 
                                                                      UNION
                                                                      SELECT
                                                                         Nama_kamar,
                                                                         Hari,
                                                                         overpax,
                                                                         tarif,
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + @plus
                                                                         )
                                                                         AS Time_Start,
                                                                         CONVERT(VARCHAR(10), 
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + @plus
                                                                         )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                         (
                                                                            Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) + @plus
                                                                         )
          , 14) AS Time_Start_Dmy,
                                                                         CASE
                                                                            WHEN
                                                                               Time_Finish = '00:00:59' 
                                                                            THEN
                                                                               DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus
                                                                               )
          ) 
                                                                            ELSE
          (Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus) 
                                                                         END
                                                                         AS Time_Finish, 
                                                                         CASE
                                                                            WHEN
                                                                               Time_Finish = '00:00:59' 
                                                                            THEN
                                                                               CONVERT(VARCHAR(10), DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus
                                                                               )
          ), 103) + ' ' + convert(VARCHAR(8), DATEADD(DAY, 1, 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus
                                                                               )
          ), 14) 
                                                                            ELSE
                                                                               CONVERT(VARCHAR(10), 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus
                                                                               )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                               (
                                                                                  Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @plus
                                                                               )
          , 14) 
                                                                         END
                                                                         AS Time_Finish_Dmy, Time_Start AS Jam_Start, Time_Finish AS Jam_Finish, '1b if jam_checkin <= jam_checkout-server-android' AS keterangan 
                                                                      FROM
                                                                         IHP_Jenis_kamar 
                                                                      WHERE
                                                                         CAST(Time_Start AS smalldatetime) >= @6word 
                                                                         AND CAST(Time_Finish AS smalldatetime) <= @Akhir 
                                                                         AND CAST(Time_Start AS smalldatetime) <= @akhir 
                                                                         AND Nama_kamar = @Type_Room 
                                                                         AND Hari = @Day 
                                                                      END
                                                                      ELSE
                                                                         BEGIN
                                                                      SET
                                                                         @Awal = 
                                                                         (
                                                                            SELECT DISTINCT
                                                                               Time_Start 
                                                                            FROM
                                                                               IHP_Jenis_kamar 
                                                                            WHERE
                                                                               Time_Start like @3Word + '%' 
                                                                         )
                                                                      SET
                                                                         @Akhir = 
                                                                         (
                                                                            SELECT DISTINCT
                                                                               Time_Finish 
                                                                            FROM
                                                                               IHP_Jenis_kamar 
                                                                            WHERE
                                                                               time_Finish like @4Word + '%' 
                                                                         )
                                                                         SELECT
                                                                            Nama_kamar,
                                                                            Hari,
                                                                            overpax,
                                                                            tarif,
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @Minus
                                                                            )
                                                                            AS Time_Start,
                                                                            CONVERT(VARCHAR(10), 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @Minus
                                                                            )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                            (
                                                                               Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Start AS smalldatetime) - @Minus
                                                                            )
          , 14) AS Time_Start_Dmy,
                                                                            CASE
                                                                               WHEN
                                                                                  Time_Finish = '00:00:59' 
                                                                               THEN
                                                                                  DATEADD(DAY, 1, 
                                                                                  (
                                                                                     Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus
                                                                                  )
          ) 
                                                                               ELSE
          (Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus) 
                                                                            END
                                                                            AS Time_Finish, 
                                                                            CASE
                                                                               WHEN
                                                                                  Time_Finish = '00:00:59' 
                                                                               THEN
                                                                                  CONVERT(VARCHAR(10), DATEADD(DAY, 1, 
                                                                                  (
                                                                                     Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus
                                                                                  )
          ), 103) + ' ' + convert(VARCHAR(8), DATEADD(DAY, 1, 
                                                                                  (
                                                                                     Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus
                                                                                  )
          ), 14) 
                                                                               ELSE
                                                                                  CONVERT(VARCHAR(10), 
                                                                                  (
                                                                                     Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus
                                                                                  )
          , 103) + ' ' + convert(VARCHAR(8), 
                                                                                  (
                                                                                     Cast(@tgl + '/' + @Bln + '/' + @th + ' ' + Time_Finish AS smalldatetime) + @Plus
                                                                                  )
          , 14) 
                                                                            END
                                                                            AS Time_Finish_Dmy, Time_Start AS Jam_Start, Time_Finish AS Jam_Finish, '1c if jam_checkin <= jam_checkout-server-android' AS keterangan 
                                                                         FROM
                                                                            IHP_Jenis_kamar 
                                                                         WHERE
                                                                            CAST(Time_Start AS smalldatetime) >= @Awal 
                                                                            AND CAST(Time_Finish AS smalldatetime) <= @Akhir 
                                                                            AND CAST(Time_Start AS smalldatetime) <= @Akhir 
                                                                            AND Nama_kamar = @Type_Room 
                                                                            AND Hari = @Day 
                                                                         END
                                                       END
          END`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  console.log("gagal isGetCreateProsedureTarifKamarPerjam Jam_Kena_Sewa");
                  logger.info("gagal isGetCreateProsedureTarifKamarPerjam Jam_Kena_Sewa");
                  resolve(false);
               } else {
                  sql.close();
                  console.log("Sukses isGetCreateProsedureTarifKamarPerjam Jam_Kena_Sewa");
                  logger.info("Sukses isGetCreateProsedureTarifKamarPerjam Jam_Kena_Sewa");
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

   getTarifPerjamRoom(db_, jenis_kamar_, nomor_hari_, checkin_, checkout_) {
      return new Promise((resolve, reject) => {
         try {
            /*
            1=minggu
            2=senin
            3=selasa
            4=rabu
            5=kamis
            6=jumat
            7=sabtu
            8=mbl h-1 libur
            9=libur tanggal merah
            */
            db = db_;
            var jenis_kamar = jenis_kamar_;
            var nomor_hari = nomor_hari_;
            var checkin = checkin_;
            var checkout = checkout_;

            var isiQuery = "" +
               " set dateformat dmy " +
               " exec Jam_Kena_Sewa_ " +
               "'" + jenis_kamar + "'" +
               ",'" + nomor_hari + "'" +
               ",'" + checkin + "'" +
               ",'" + checkout + "'";

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
                     console.log(jenis_kamar + " Sukses isGetTarifPerjamRoom ");
                     logger.info(jenis_kamar + " Sukses isGetTarifPerjamRoom ");
                     resolve(dataResponse);
                  }
                  else {
                     console.log(jenis_kamar + " gagal isGetTarifPerjamRoom ");
                     logger.info(jenis_kamar + " gagal isGetTarifPerjamRoom ");
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

   getTarifPerjamHargaKamarFunc(db_, kode_ivc_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_ivc = kode_ivc_;

            var isiQuery = " " +
               " set dateformat dmy  " +
               " select " +
               "IHP_Rcp_DetailsRoom.[Reception] as reception " +
               ",IHP_Rcp_DetailsRoom.[Nama_Kamar] as jenis_kamar" +
               ",IHP_Rcp_DetailsRoom.[Hari] as hari" +
               " ,case when IHP_Rcp_DetailsRoom.[Hari]=1  then 'MINGGU'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=2  then 'SENIN'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=3  then 'SELASA'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=4  then 'RABU'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=5  then 'KAMIS'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=6  then 'JUMAT'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=7  then 'SABTU'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=8  then 'MALAM BESOK LIBUR'" +
               " when IHP_Rcp_DetailsRoom.[Hari]=9  then 'TANGGAL MERAH'" +
               " end" +
               " as keterangan_hari" +
               ",IHP_Rcp_DetailsRoom.[Overpax] as overpax" +
               ",IHP_Rcp_DetailsRoom.[Tarif] as tarif" +
               ",IHP_Rcp_DetailsRoom.[Overpax]/60 as overpax_permenit" +
               ",IHP_Rcp_DetailsRoom.[Tarif]/60 as tarif_per_menit" +
               ",IHP_Rcp_DetailsRoom.[Time_Start] as time_start" +
               ",IHP_Rcp_DetailsRoom.[Time_Finish] as time_finish" +

               " ,IHP_Ivc.[kamar] as kamar" +
               " ,IHP_Ivc.[Invoice] as invoice" +
               " ,IHP_Ivc.[Transfer] as invoice_transfer" +
               " ,IHP_Ivc.[Status] as status_kamar_normal" +

               " from " +
               " IHP_Ivc" +
               " ,IHP_Rcp_DetailsRoom" +

               " where IHP_Ivc.Invoice='" + kode_ivc + "'" +
               " and IHP_Ivc.Reception=IHP_Rcp_DetailsRoom.Reception";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err.message);
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  dataResponse = new ResponseFormat(true, dataReturn.recordset);
                  if (dataReturn.recordset.length > 0) {
                     if (dataResponse.data[0].reception != null) {
                        hasilTarifPerjamHargaKamar.push(dataResponse.data);
                     }
                     if (dataResponse.data[0].invoice_transfer != "") {
                        var invoiceTransfer = dataResponse.data[0].invoice_transfer;
                        resolve(getTarifPerjamHArgaKamar(req, invoiceTransfer));
                     }
                     else {
                        dataResponse = new ResponseFormat(true, hasilTarifPerjamHargaKamar);
                        resolve(dataResponse);
                     }
                  } else {
                     dataResponse = new ResponseFormat(false, null, "Data Kosong");
                     resolve(dataResponse);
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

   getTotalTarifKamarDanOverpax(db_, rcp_, kapasitas_kamar_, pax_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var rcp = rcp_;
            var kapasitas_kamar = parseInt(kapasitas_kamar_);
            var pax = parseInt(pax_);
            var respond;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `
          set
   dateformat dmy 
   select
      [IHP_Rcp].[Reception] as reception,
      CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 114), 1, 8) as checkin,
      [IHP_Rcp].[Jam_Sewa] as jam_sewa,
      [IHP_Rcp].[Menit_Sewa] as menit_sewa,
      [IHP_Rcp].[PAX] as pax,
      [IHP_Rcp].[Checkout] as checkout,
      [IHP_Rcp_DetailsRoom].[Nama_Kamar] as nama_kamar,
      [IHP_Rcp_DetailsRoom].[Hari] as rcp_mbl_lb_normal_nomor_hari,
      [IHP_Rcp_DetailsRoom].[Overpax] as tarif_overpax,
      [IHP_Rcp_DetailsRoom].[Tarif] as tarif_kamar,
      [IHP_Rcp_DetailsRoom].[Time_Start] as time_start,
      [IHP_Rcp_DetailsRoom].[Time_Finish] as time_finish,
      case
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as checkin_in_range_time_start_and_time_finish, 
      case
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as checkout_in_range_time_start_and_time_finish, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            1 
         else
            0 
      end
      as time_start_in_range_checkin_checkout, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            1 
         else
            0 
      end
      as time_finish_in_range_checkin_checkout, DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) as different_checkin_and_time_finish, DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) as different_time_Start_and_checkout, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            2 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            4 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            3 
         else
            0 
      end
      as awal_tengah_akhir, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            60 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
         else
            0 
      end
      as menit_yang_digunakan, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            [IHP_Rcp_DetailsRoom].[Tarif] 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            [IHP_Rcp].[Checkout] >= [IHP_Rcp_DetailsRoom].[Time_Start] 
            and [IHP_Rcp].[Checkout] <= [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
         else
            0 
      end
      as tarif_kamar_yang_digunakan, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
         then
            [IHP_Rcp_DetailsRoom].[Overpax] 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
         when
            [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            [IHP_Rcp].[Checkout] >= [IHP_Rcp_DetailsRoom].[Time_Start] 
            and [IHP_Rcp].[Checkout] <= [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
         else
            0 
      end
      as tarif_overpax_yang_digunakan 
   from
      [IHP_Rcp] 
      INNER Join
         [IHP_Rcp_DetailsRoom] 
         on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
   where
      [IHP_Rcp].[Reception] = '${rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
                  var sewa_kamar = parseFloat(0);
                  var overpax = parseFloat(0);
                  var charge_overpax = parseFloat(0);
                  if (dataReturn.recordset.length > 0) {
                     for (a = 0; a < dataReturn.recordset.length; a++) {
                        var sewa_kamar_ = dataReturn.recordset[a].tarif_kamar_yang_digunakan;
                        var sewa_kamar__ = parseFloat(sewa_kamar_);
                        sewa_kamar = sewa_kamar + sewa_kamar__;

                        var overpax_ = dataReturn.recordset[a].tarif_overpax_yang_digunakan;
                        var overpax__ = parseFloat(overpax_);
                        overpax = overpax + overpax__;

                        console.log(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " tarif kamar yang berlaku=" + dataReturn.recordset[a].tarif_kamar_yang_digunakan + " tarif overpax yang berlaku=" + dataReturn.recordset[a].tarif_overpax_yang_digunakan);
                        logger.info(rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " tarif kamar yang berlaku=" + dataReturn.recordset[a].tarif_kamar_yang_digunakan + " tarif overpax yang berlaku=" + dataReturn.recordset[a].tarif_overpax_yang_digunakan);

                     }
                     if (pax > kapasitas_kamar) {
                        var kelebihan_overpax = pax - kapasitas_kamar;
                        var charge_overpax_ = kelebihan_overpax * overpax;
                        charge_overpax = parseFloat(charge_overpax_);

                        console.log(rcp + " total charge_overpax kamar " + kelebihan_overpax + " orang x " + overpax + " = " + charge_overpax);
                        logger.info(rcp + " total charge_overpax kamar " + kelebihan_overpax + " orang x " + overpax + " = " + charge_overpax);
                     }
                     else {
                        charge_overpax = parseFloat(0);
                        console.log(rcp + " total charge_overpax kamar= 0");
                        logger.info(rcp + " total charge_overpax kamar= 0");
                     }

                     console.log(rcp + " total sewa_kamar= " + sewa_kamar);
                     logger.info(rcp + " total sewa_kamar= " + sewa_kamar);
                     respond = {
                        sewa_kamar: sewa_kamar,
                        overpax: charge_overpax
                     };
                     resolve(respond);
                  }
                  else {
                     console.log(rcp + " total sewa_kamar= " + sewa_kamar);
                     logger.info(rcp + " total sewa_kamar= " + sewa_kamar);
                     respond = {
                        sewa_kamar: sewa_kamar,
                        overpax: overpax
                     };
                     resolve(respond);
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

   getTotalTarifExtendDanOverpax(db_, kode_rcp_, kapasitas_kamar_, pax_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var kapasitas_kamar = kapasitas_kamar_;
            var pax = pax_;
            var respond;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `
set
   dateformat dmy 
   select
      [IHP_Rcp].[Reception] as reception,
      CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkin], 114), 1, 8) as checkin,
      [IHP_Rcp].[Jam_Sewa] as jam_sewa,
      [IHP_Rcp].[Menit_Sewa] as menit_sewa,
      CONVERT(VARCHAR(24), [IHP_Rcp].[Checkout], 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), [IHP_Rcp].[Checkout], 114), 1, 8) as checkout,
      isnull(sum([IHP_Ext].[Jam_Extend]), 0) as [total_jam_extend],
      isnull(sum([IHP_Ext].[Menit_Extend]), 0) as [total_menit_extend],
      CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
      )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
      )
, [IHP_Rcp].[Checkin]), 114), 1, 8) as checkout_ditambah_extend,
      [IHP_Rcp_DetailsRoom].[Nama_Kamar] as nama_kamar,
      [IHP_Rcp_DetailsRoom].[Hari] as rcp_mbl_lb_normal_nomor_hari,
      [IHP_Rcp_DetailsRoom].[Overpax] as tarif_overpax,
      [IHP_Rcp_DetailsRoom].[Tarif] as tarif_kamar,
      [IHP_Rcp_DetailsRoom].[Time_Start] as time_start,
      [IHP_Rcp_DetailsRoom].[Time_Finish] as time_finish,
      case
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as start_extend_in_range_time_start_and_time_finish, 
      case
         when
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         else
            0 
      end
      as finish_extend_in_range_time_start_and_time_finish , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            1 
         else
            0 
      end
      as time_start_in_range_start_extend_and_finish_extend, 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            1 
         else
            0 
      end
      as time_finish_in_range_start_extend_and_finish_extend, DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) as different_start_extend_and_time_finish , DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
      )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
      (
         isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
      )
, [IHP_Rcp].[Checkin]), 114), 1, 8) ) as different_time_Start_and_finish_extend , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            2 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and 
            (
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            4 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            1 
         when
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            3 
         else
            0 
      end
      as awal_tengah_akhir , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            60 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and 
            (
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
            DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
         else
            0 
      end
      as menit_yang_digunakan , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            [IHP_Rcp_DetailsRoom].[Tarif] 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and 
            (
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)*(DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) )) 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
         else
            0 
      end
      as tarif_extend_kamar_yang_digunakan , 
      case
         when
            [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
            and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) 
         then
            [IHP_Rcp_DetailsRoom].[Overpax] 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            and 
            (
               CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
               (
                  isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
               )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
            )
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)*(DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) )) 
         when
            [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
         when
            CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
         then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
            (
               isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
            )
, [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
         else
            0 
      end
      as tarif_extend_overpax_yang_digunakan 
   from
      [IHP_Rcp] 
      left Join
         [IHP_Ext] 
         on [IHP_Rcp].[Reception] = [IHP_Ext].[Reception] 
      INNER Join
         [IHP_Rcp_DetailsRoom] 
         on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
   where
      [IHP_Rcp].[Reception] = '${kode_rcp}' 
   Group By
      [IHP_Rcp].[Reception], [IHP_Rcp].[Checkin], [IHP_Rcp].[Jam_Sewa], [IHP_Rcp].[Menit_Sewa], [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Nama_Kamar] , [IHP_Rcp_DetailsRoom].[Hari] , [IHP_Rcp_DetailsRoom].[Overpax] , [IHP_Rcp_DetailsRoom].[Tarif] , [IHP_Rcp_DetailsRoom].[Time_Start] , [IHP_Rcp_DetailsRoom].[Time_Finish]
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

                  var sewa_kamar = parseFloat(0);
                  var overpax = parseFloat(0);
                  var charge_overpax_extend = parseFloat(0);
                  if (dataReturn.recordset.length > 0) {
                     for (a = 0; a < dataReturn.recordset.length; a++) {
                        var sewa_kamar_ = dataReturn.recordset[a].tarif_extend_kamar_yang_digunakan;
                        var sewa_kamar__ = parseFloat(sewa_kamar_);
                        sewa_kamar = sewa_kamar + sewa_kamar__;

                        var overpax_ = dataReturn.recordset[a].tarif_extend_overpax_yang_digunakan;
                        var overpax__ = parseFloat(overpax_);
                        overpax = overpax + overpax__;

                        console.log(kode_rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " tarif kamar extend yang berlaku=" + dataReturn.recordset[a].tarif_extend_kamar_yang_digunakan + " tarif overpax extend yang berlaku=" + dataReturn.recordset[a].tarif_extend_overpax_yang_digunakan);
                        logger.info(kode_rcp + " menit " + dataReturn.recordset[a].menit_yang_digunakan + " tarif kamar extend yang berlaku=" + dataReturn.recordset[a].tarif_extend_kamar_yang_digunakan + " tarif overpax extend yang berlaku=" + dataReturn.recordset[a].tarif_extend_overpax_yang_digunakan);
                     }

                     if (pax > kapasitas_kamar) {
                        var kelebihan_overpax = pax - kapasitas_kamar;
                        var charge_overpax_extend_ = kelebihan_overpax * overpax;
                        charge_overpax_extend = parseFloat(charge_overpax_extend_);
                        console.log(kode_rcp + " total overpax kamar extend " + kelebihan_overpax + " orang x " + overpax + " = " + charge_overpax_extend);
                        logger.info(kode_rcp + " total overpax kamar extend " + kelebihan_overpax + " orang x " + overpax + " = " + charge_overpax_extend);
                     }
                     else {
                        charge_overpax_extend = parseFloat(0);
                        console.log(kode_rcp + " total charge_overpax kamar= 0");
                        logger.info(kode_rcp + " total charge_overpax kamar= 0");
                     }

                     console.log(kode_rcp + " total sewa_kamar extend= " + sewa_kamar);
                     logger.info(kode_rcp + " total sewa_kamar extend= " + sewa_kamar);

                     respond = {
                        sewa_kamar: sewa_kamar,
                        overpax: charge_overpax_extend
                     };
                     resolve(respond);
                  }
                  else {
                     console.log(kode_rcp + " sewa_kamar extend " + sewa_kamar);
                     logger.info(kode_rcp + " sewa_kamar extend " + sewa_kamar);
                     respond = {
                        sewa_kamar: sewa_kamar,
                        overpax: overpax
                     };

                     resolve(respond);
                  }
               }
            });

         } catch (err) {
            logger.error(err);
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
         }
      });
   }

   deleteIhpRcpDetailsRoom(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var isiQuery = "Delete From IHP_Rcp_DetailsRoom where Reception='" + kode_rcp + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  console.log(kode_rcp + " Gagal deleteIHPRcpDetailsRoom");
                  logger.info(kode_rcp + " Gagal deleteIHPRcpDetailsRoom");
                  resolve(false);
               } else {
                  sql.close();
                  console.log(kode_rcp + " Sukses deleteIHPRcpDetailsRoom");
                  logger.info(kode_rcp + " Sukses deleteIHPRcpDetailsRoom");
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

   insertIHPRcpDetailsRoom(db_, kode_rcp_, jenis_kamar_, nomor_hari_, overpax_tarif_, kamar_tarif_,
      date_time_start_, date_time_finish_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            var jenis_kamar = jenis_kamar_;
            var nomor_hari = nomor_hari_;
            var overpax_tarif = overpax_tarif_;
            var kamar_tarif = kamar_tarif_;
            var date_time_start = date_time_start_;
            var date_time_finish = date_time_finish_;

            var isiQuery = "" +
               " set dateformat dmy " +
               " INSERT INTO [dbo].[IHP_Rcp_DetailsRoom]" +
               " ([Reception]" +
               " ,[Nama_Kamar]" +
               " ,[Hari]" +
               " ,[Overpax]" +
               " ,[Tarif]" +
               " ,[Time_Start]" +
               " ,[Time_Finish]" +
               " ,[Date_Time_Start]" +
               " ,[Date_Time_Finish])" +
               " VALUES" +
               " (" +
               "'" + kode_rcp + "'" +
               " ,'" + jenis_kamar + "'" +
               "," + nomor_hari + "" +
               "," + overpax_tarif + "" +
               "," + kamar_tarif + "" +
               ",'" + date_time_start + "'" +
               ",'" + date_time_finish + "'" +
               ",'" + date_time_start + "'" +
               ",'" + date_time_finish + "'" +
               ")";

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  console.log(kode_rcp + " gagal insertIHPRcpDetailsRoom");
                  logger.info(kode_rcp + " gagal insertIHPRcpDetailsRoom");
                  resolve(false);
               } else {
                  sql.close();
                  console.log("Sukses date_time_start " + date_time_start);
                  console.log("Sukses date_time_finish " + date_time_finish);
                  console.log("Sukses sewa kamar " + kamar_tarif + " overpax kamar " + overpax_tarif);
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

   getDeleteInsertIhpDetailSewaKamar(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `set
   dateformat dmy 
   delete
   from
      [IHP_Detail_Sewa_Kamar] 
   where
      Reception = '${kode_rcp}' 
      insert into
         [IHP_Detail_Sewa_Kamar] 
         select
            [IHP_Rcp].[Reception] as reception,
            [IHP_Rcp_DetailsRoom].[Nama_Kamar] as Kamar,
            [IHP_Rcp_DetailsRoom].[Hari] as Hari,
            [IHP_Rcp_DetailsRoom].[Overpax] as Overpax,
            [IHP_Rcp_DetailsRoom].[Tarif] as Tarif,
            [IHP_Rcp_DetailsRoom].[Date_Time_Start] as Date_Time_Start,
            [IHP_Rcp_DetailsRoom].[Date_Time_Finish] as Date_Time_Finish,
            case
               when
                  [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  60 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                  and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
                  DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
               when
                  [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
                  DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
               else
                  0 
            end
            as Menit_Yang_Digunakan, 
            case
               when
                  [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  [IHP_Rcp_DetailsRoom].[Tarif] 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                  and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
               when
                  [IHP_Rcp].[Checkout] >= [IHP_Rcp_DetailsRoom].[Time_Start] 
                  and [IHP_Rcp].[Checkout] <= [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
               else
                  0 
            end
            as Tarif_Kamar_Yang_Digunakan, 
            case
               when
                  [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
                  and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkin] and [IHP_Rcp].[Checkout] 
               then
                  [IHP_Rcp_DetailsRoom].[Overpax] 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                  and [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp].[Checkout] ) 
               when
                  [IHP_Rcp].[Checkin] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp].[Checkin] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
               when
                  [IHP_Rcp].[Checkout] >= [IHP_Rcp_DetailsRoom].[Time_Start] 
                  and [IHP_Rcp].[Checkout] <= [IHP_Rcp_DetailsRoom].[Time_Finish] 
               then
([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], [IHP_Rcp].[Checkout]) 
               else
                  0 
            end
            as Tarif_Overpax_Yang_Digunakan 
         from
            [IHP_Rcp] 
            INNER Join
               [IHP_Rcp_DetailsRoom] 
               on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
         where
            [IHP_Rcp].[Reception] = '${kode_rcp}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
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

   getDeleteInsertIhpDetailSewaKamarExtend(db_, kode_rcp_) {
      return new Promise((resolve, reject) => {
         try {
            db = db_;
            var kode_rcp = kode_rcp_;
            //you must use set dateformat dmy
            var isiQuery = "" +
               `set
               dateformat dmy 
               delete
               from
                  [IHP_Detail_Sewa_Kamar_Extend] 
               where
                  Reception = '${kode_rcp}' 
                  insert into
                     [IHP_Detail_Sewa_Kamar_Extend] 
                     select
                        [IHP_Rcp].[Reception] as Reception,
                        [IHP_Rcp_DetailsRoom].[Nama_Kamar] as Kamar,
                        [IHP_Rcp_DetailsRoom].[Hari] as Hari,
                        [IHP_Rcp_DetailsRoom].[Overpax] as Overpax,
                        [IHP_Rcp_DetailsRoom].[Tarif] as Tarif,
                        [IHP_Rcp_DetailsRoom].[Date_Time_Start] as Date_Time_Start,
                        [IHP_Rcp_DetailsRoom].[Date_Time_Finish] as Date_Time_Finish,
                        case
                           when
                              [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                              and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                           then
                              60 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              and 
                              (
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                           then
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
                              DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
                           when
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
                              DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
                           else
                              0 
                        end
                        as Menit_Yang_Digunakan , 
                        case
                           when
                              [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                              and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                           then
                              [IHP_Rcp_DetailsRoom].[Tarif] 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              and 
                              (
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                           then
            ([IHP_Rcp_DetailsRoom].[Tarif] / 60)*(DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) )) 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            ([IHP_Rcp_DetailsRoom].[Tarif] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
                           when
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            ([IHP_Rcp_DetailsRoom].[Tarif] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
                           else
                              0 
                        end
                        as Tarif_Kamar_Yang_Digunakan , 
                        case
                           when
                              [IHP_Rcp_DetailsRoom].[Time_Start] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                              and [IHP_Rcp_DetailsRoom].[Time_Finish] between [IHP_Rcp].[Checkout] and CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) 
                           then
                              [IHP_Rcp_DetailsRoom].[Overpax] 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              and 
                              (
                                 CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                                 (
                                    isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                                 )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                              )
                           then
            ([IHP_Rcp_DetailsRoom].[Overpax] / 60)*(DATEDIFF(mi, [IHP_Rcp].[Checkout] , CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) )) 
                           when
                              [IHP_Rcp].[Checkout] between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            ([IHP_Rcp_DetailsRoom].[Overpax] / 60)*DATEDIFF(mi, [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Time_Finish] ) 
                           when
                              CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) between [IHP_Rcp_DetailsRoom].[Time_Start] and [IHP_Rcp_DetailsRoom].[Time_Finish] 
                           then
            ([IHP_Rcp_DetailsRoom].[Overpax] / 60)* DATEDIFF(mi, [IHP_Rcp_DetailsRoom].[Time_Start], CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 103) + ' ' + SUBSTRING(CONVERT(VARCHAR(24), DATEADD(minute, 
                              (
                                 isnull(sum([IHP_Ext].[Menit_Extend]), 0) + (isnull(sum([IHP_Ext].[Jam_Extend]), 0)*60) + ([IHP_Rcp].[Jam_Sewa]*60) + [IHP_Rcp].[Menit_Sewa] 
                              )
            , [IHP_Rcp].[Checkin]), 114), 1, 8) ) 
                           else
                              0 
                        end
                        as Tarif_Overpax_Yang_Digunakan 
                     from
                        [IHP_Rcp] 
                        left Join
                           [IHP_Ext] 
                           on [IHP_Rcp].[Reception] = [IHP_Ext].[Reception] 
                        INNER Join
                           [IHP_Rcp_DetailsRoom] 
                           on [IHP_Rcp].[Reception] = [IHP_Rcp_DetailsRoom].[Reception] 
                     where
                        [IHP_Rcp].[Reception] = '${kode_rcp}' 
                     Group By
                        [IHP_Rcp].[Reception], [IHP_Rcp].[Checkin], [IHP_Rcp].[Jam_Sewa], [IHP_Rcp].[Menit_Sewa], [IHP_Rcp].[Checkout] , [IHP_Rcp_DetailsRoom].[Nama_Kamar] , [IHP_Rcp_DetailsRoom].[Hari] , [IHP_Rcp_DetailsRoom].[Overpax] , [IHP_Rcp_DetailsRoom].[Tarif] , [IHP_Rcp_DetailsRoom].[Time_Start] , [IHP_Rcp_DetailsRoom].[Time_Finish], [IHP_Rcp_DetailsRoom].[Date_Time_Start], [IHP_Rcp_DetailsRoom].[Date_Time_Finish]`;

            db.request().query(isiQuery, function (err, dataReturn) {
               if (err) {
                  sql.close();
                  logger.error(err);
                  console.log(err);
                  logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                  resolve(false);
               } else {
                  sql.close();
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

}
module.exports = TarifKamar;