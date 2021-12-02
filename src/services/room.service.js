var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var logger = require('../util/logger');

var db;
var dataResponse;
var tambahan_query_room = "";
var ip_server = new DBConnection().getIpServer();
var port_server = new DBConnection().getPortServer();
tambahan_query_room = " ,'http://" + ip_server + ":" + port_server +
  "/member/membership/foto/'+isnull(IHP_MBR.[File_Photo],'') as photo_url_lokal";


/* status=0 ready
status=1 checksound
status=2 checkin=not paid
status=3 invoice printed=ditagihkan=claimed
status=4 terbayar=paid
status=5 checkout=repaired
*/

var getRoomQuery = `
SET DATEFORMAT DMY
  SELECT IHP_Room.Kamar as kamar
   ,IHP_Ivc.Reception as room_rcp
   ,IHP_Ivc.Invoice as room_ivc
   ,IHP_Room.Jenis_Kamar as jenis_kamar
   ,IHP_Room.Kapasitas as kapasitas
   ,isnull(IHP_Room.Jumlah_Tamu,0) as jumlah_tamu
   ,IHP_Room.Status_Checkin as status_checkin
   ,isnull(IHP_Room.Nama_Tamu_Alias,'') as event_owner
   ,isnull(IHP_Room.Kamar_Alias,'') as kamar_alias

   ,case when IHP_Room.Keterangan_Connect=2  then 0
   when IHP_Room.Keterangan_Connect=1  then 1
   when IHP_Room.Keterangan_Connect=4  then 1 end
   as status_checkout

   ,case when IHP_Room.Keterangan_Connect=4
   and IHP_Room.Status_Checkin=1
   and IHP_Room.Nama_Tamu='TESKAMAR'
   and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL')
   then 1
   else 0 end
   as status_checksound

   ,case
   when (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL')
   AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL')
   AND IHP_Room.Status_Checkin=0
   AND IHP_Room.Keterangan_Connect=2
   then 0

   when IHP_Room.Keterangan_Connect=4
   and IHP_Room.Status_Checkin=1
   and IHP_Room.Nama_Tamu='TESKAMAR'
   and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL')
   then 1

   when IHP_Room.Keterangan_Connect=2
   and IHP_Room.Status_Checkin=1
   and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL')
   and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL')
   and IHP_Sul.Summary is null
   and (IHP_Ivc.Printed='0' or IHP_Ivc.Printed='-1')
   then 2

   when IHP_Ivc.Printed>0
   and IHP_Sul.Summary is null
   and IHP_Room.Status_Checkin=1
   and IHP_Room.Keterangan_Connect=2
   then 3

   when IHP_Sul.Summary is not null
   and IHP_Room.Status_Checkin=1
   and IHP_Room.Keterangan_Connect=2
   then 4

   when IHP_Room.Keterangan_Connect=1
   then 5

   else  6 end
   as status_kamar

   ,case when IHP_Sul.Summary is not null
   then 1 else  0 end
   as status_terbayar

   ,IHP_Room.Status_10 as status_10_menit

   ,case when IHP_Ivc.Printed='1' then 1
   else 0 end as status_tagihan_tercetak

   ,case when IHP_Room.Jenis_Kamar<>'LOBBY'
   AND IHP_Room.Jenis_Kamar<>'LOBBY'
   AND IHP_Room.Jenis_Kamar<>'BAR'
   AND IHP_Room.Jenis_Kamar<>'SOFA'
   AND IHP_Room.Jenis_Kamar<>'LOUNGE'
   AND IHP_Room.Jenis_Kamar<>'RESTO'
   AND (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL')
   AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL')
   AND IHP_Room.Status_Checkin=0
   AND IHP_Room.Keterangan_Connect=2
   then 1
   else 0 end
   as status_kamar_ready_untuk_checkin

   ,IHP_Room.Service_Kamar as call_service_kamar
   ,IHP_Room.Keterangan_Connect as keterangan_connect

   ,case when IHP_Room.Service_Kamar = 1 
   OR IHP_Room.Service_Kamar = 2
   then CAST(1 AS BIT)
   else CAST(0 AS BIT) end
   as room_call

   ,case when IHP_Room.Jenis_Kamar<>'LOBBY'
   AND IHP_Room.Jenis_Kamar<>'BAR'
   AND IHP_Room.Jenis_Kamar<>'SOFA'
   AND IHP_Room.Jenis_Kamar<>'LOUNGE'
   AND IHP_Room.Jenis_Kamar<>'RESTO'
   AND IHP_Room.Jenis_Kamar<>'SOFA'
   then CAST(1 AS BIT)
   else CAST(0 AS BIT) end
   as kamar_untuk_checkin

   ,case when IHP_Room.Reception ='NULL'  then ''
   when IHP_Room.Reception is null  then ''
   else IHP_Room.Reception
   end
   as reception

   ,case when IHP_Room.Nama_Tamu ='NULL'  then ''
   when IHP_Room.Nama_Tamu is null  then ''
   else IHP_Room.Nama_Tamu
   end
   as nama_member

   ,IHP_Room.IP_Address as ip_address
   ,isnull(IHP_Ivc.Chusr,'') as chusr
   ,isnull(IHP_Ivc.Member,'') as kode_member
   ,isnull(IHP_Ivc.Nama,'') as nama

   ,DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin
   ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin
   ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)/60 as sisa_jam_checkin
   ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)%60 as sisa_menit_checkin
   ,Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu
   ,IHP_Room.Jam_Checkin as jam_checkin
   ,IHP_Room.Jam_Checkout as jam_checkout
   ,isnull(IHP_Sul.Summary,'') as summary
   ,isnull(IHP_Sul.Date_trans,'') as summary_date_
   ,isnull(CONVERT(datetime, IHP_Sul.DATE),'') as summary_date
   ,isnull(IHP_Sul.Chusr,'') as summary_chusr
   ,isnull(IHP_Sul.Total,0) as total_pembayaran

   ,IHP_Rcp.QM1 as qm1
   ,IHP_Rcp.QM2 as qm2
   ,IHP_Rcp.QM3 as qm3
   ,IHP_Rcp.QM4 as qm4
   ,IHP_Rcp.QF1 as qf1
   ,IHP_Rcp.QF2 as qf2
   ,IHP_Rcp.QF3 as qf3
   ,IHP_Rcp.QF4 as qf4
   ,IHP_Rcp.PAX as pax
   ,IHP_Rcp.Keterangan as hp
   ,isnull(IHP_Rcp.KMS,'') as keterangan
   ,isnull(IHP_Rcp.Member_Rev,'') as member_rev

  ,isnull(IHP_UangVoucher.[Voucher],'') as voucher
  ,isnull(IHP_UangVoucher.[Pay_Value],'') as pay_value_voucher

  ,isnull(IHP_UangMukaNonCash.[Nama_Payment],'') as nama_payment_uang_muka
  ,isnull(IHP_UangMukaNonCash.[Input1],'') as input1_jenis_kartu
  ,isnull(IHP_UangMukaNonCash.[Input2],'') as input2_nama
  ,isnull(IHP_UangMukaNonCash.[Input3],'') as input3_nomor_kartu
  ,isnull(IHP_UangMukaNonCash.[Input3],'') as input4_nomor_approval
  ,isnull(IHP_UangMukaNonCash.[Pay_Value],0) as pay_value_uang_muka
  ,isnull(IHP_UangMukaNonCash.[EDC_Machine],'') as edc_machine

  ,isnull(IHP_MBR.[EMAIL],'') as email
  ,isnull(IHP_MBR.[Point_Reward],'') as point_reward
  ,isnull(IHP_MBR.[File_Photo],'') as file_photo ${tambahan_query_room}

   FROM IHP_Room
   Left Join IHP_Ivc on IHP_Room.Reception=IHP_Ivc.Reception
   and IHP_Room.Kamar=IHP_Ivc.Kamar

   Left Join IHP_Rcp on IHP_Room.Reception=IHP_Rcp.Reception
   and IHP_Room.Kamar=IHP_Rcp.Kamar
   and IHP_Room.Reception=IHP_Rcp.Reception

   left join IHP_UangVoucher
   on IHP_Rcp.Reception=IHP_UangVoucher.Reception

   left join IHP_UangMukaNonCash
   on IHP_Rcp.Reception=IHP_UangMukaNonCash.Reception

   Left Join IHP_RoomCheckin on IHP_Room.Kamar=IHP_RoomCheckin.Kamar
   and IHP_Room.Kamar=IHP_RoomCheckin.Kamar

   Left Join IHP_Sul on IHP_RoomCheckin.Reception=IHP_Sul.Reception
   and IHP_Room.Kamar=IHP_Sul.Kamar

   Left Join IHP_Mbr on IHP_Rcp.Member=IHP_MBR.Member`;


class RoomService {
  constructor() { }

  getPengecekanRoomReady(db_, room0) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room0;

        /* 
        status=0 ready
        status=1 checksound
        status=2 checkin=not paid
        status=3 invoice printed=ditagihkan=claimed
        status=4 terbayar=paid
        status=5 checkout=repaired
        */

        var isiQuery = `
        SELECT
          IHP_Room.Kamar AS kamar,
          IHP_Room.Jenis_Kamar AS jenis_kamar,
          IHP_Room.Kapasitas AS kapasitas,
          ISNULL(IHP_Room.Jumlah_Tamu, 0) AS jumlah_tamu,
          IHP_Room.Status_Checkin AS status_checkin,
          CASE
            WHEN IHP_Room.Keterangan_Connect = 2 THEN 0
            WHEN IHP_Room.Keterangan_Connect = 1 THEN 1
            WHEN IHP_Room.Keterangan_Connect = 4 THEN 1
          END AS status_checkout,
          CASE
            WHEN IHP_Room.Keterangan_Connect = 4 AND
              IHP_Room.Status_Checkin = 1 AND
              IHP_Room.Nama_Tamu = 'TESKAMAR' AND
              (IHP_Room.Reception IS NULL OR
              IHP_Room.Reception = 'NULL') THEN 1
            ELSE 0
          END AS status_checksound,
          CASE
            WHEN (IHP_Room.Reception IS NULL OR
              IHP_Room.Reception = 'NULL') AND
              (IHP_Room.Nama_Tamu IS NULL OR
              IHP_Room.Nama_Tamu = 'NULL') AND
              IHP_Room.Status_Checkin = 0 AND
              IHP_Room.Keterangan_Connect = 2 THEN 0
            WHEN IHP_Room.Keterangan_Connect = 4 AND
              IHP_Room.Status_Checkin = 1 AND
              IHP_Room.Nama_Tamu = 'TESKAMAR' AND
              (IHP_Room.Reception IS NULL OR
              IHP_Room.Reception = 'NULL') THEN 1
            WHEN IHP_Room.Keterangan_Connect = 2 AND
              IHP_Room.Status_Checkin = 1 AND
              (IHP_Room.Reception IS NOT NULL OR
              IHP_Room.Reception <> 'NULL') AND
              (IHP_Room.Nama_Tamu IS NOT NULL OR
              IHP_Room.Nama_Tamu <> 'NULL') AND
              IHP_Sul.Summary IS NULL AND
              (IHP_Ivc.Printed = '0' OR
              IHP_Ivc.Printed = '-1') THEN 2
            WHEN IHP_Ivc.Printed > 0 AND
              IHP_Sul.Summary IS NULL AND
              IHP_Room.Status_Checkin = 1 AND
              IHP_Room.Keterangan_Connect = 2 THEN 3
            WHEN IHP_Sul.Summary IS NOT NULL AND
              IHP_Room.Status_Checkin = 1 AND
              IHP_Room.Keterangan_Connect = 2 THEN 4
            WHEN IHP_Room.Keterangan_Connect = 1 THEN 5
            ELSE 6
          END AS status_kamar,
          CASE
            WHEN IHP_Sul.Summary IS NOT NULL THEN 1
            ELSE 0
          END AS status_terbayar,
          IHP_Room.Status_10 AS status_10_menit,
          CASE
            WHEN IHP_Ivc.Printed = '1' THEN 1
            ELSE 0
          END AS status_tagihan_tercetak,
          CASE
            WHEN IHP_Room.Jenis_Kamar <> 'LOBBY' AND
              IHP_Room.Jenis_Kamar <> 'BAR' AND
              IHP_Room.Jenis_Kamar <> 'SOFA' AND
              IHP_Room.Jenis_Kamar <> 'LOUNGE' AND
              IHP_Room.Jenis_Kamar <> 'RESTO' AND
              (IHP_Room.Reception IS NULL OR
              IHP_Room.Reception = 'NULL') AND
              (IHP_Room.Nama_Tamu IS NULL OR
              IHP_Room.Nama_Tamu = 'NULL') AND
              IHP_Room.Status_Checkin = 0 AND
              IHP_Room.Keterangan_Connect = 2 THEN 1
            ELSE 0
          END AS status_kamar_ready_untuk_checkin,
          IHP_Room.Service_Kamar AS call_service_kamar,
          IHP_Room.Keterangan_Connect AS keterangan_connect,
          CASE
            WHEN IHP_Room.Jenis_Kamar <> 'LOBBY' AND
              IHP_Room.Jenis_Kamar <> 'BAR' AND
              IHP_Room.Jenis_Kamar <> 'SOFA' AND
              IHP_Room.Jenis_Kamar <> 'LOUNGE' AND
              IHP_Room.Jenis_Kamar <> 'RESTO' THEN CAST(1 AS bit)
            ELSE CAST(0 AS bit)
          END AS kamar_untuk_checkin,
          CASE
            WHEN IHP_Room.Reception = 'NULL' THEN ''
            WHEN IHP_Room.Reception IS NULL THEN ''
            ELSE IHP_Room.Reception
          END AS reception,
          CASE
            WHEN IHP_Room.Nama_Tamu = 'NULL' THEN ''
            WHEN IHP_Room.Nama_Tamu IS NULL THEN ''
            ELSE IHP_Room.Nama_Tamu
          END AS nama_member,
          IHP_Room.IP_Address AS ip_address,
          ISNULL(IHP_Ivc.Chusr, '') AS chusr,
          ISNULL(IHP_Ivc.Member, '') AS kode_member,
          ISNULL(IHP_Ivc.Invoice, '') AS invoice,
          ISNULL(IHP_Rcp.Id_Payment, 0) AS id_payment,
          DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) AS durasi_checkin,
          DATEDIFF(mi, IHP_Rcp.Checkin, IHP_Rcp.Checkout) AS durasi_checkin_rcp,
          DATEDIFF(mi, GETDATE(), IHP_Room.Jam_Checkout) AS sisa_checkin,
          DATEDIFF(mi, GETDATE(), IHP_Room.Jam_Checkout) / 60 AS sisa_jam_checkin,
          DATEDIFF(mi, GETDATE(), IHP_Room.Jam_Checkout) % 60 AS sisa_menit_checkin,
          DATEDIFF(mi, GETDATE(), IHP_Rcp.Checkout) AS rcp_sisa_checkin,
          DATEDIFF(mi, GETDATE(), IHP_Rcp.Checkout) / 60 AS rcp_sisa_jam_checkin,
          DATEDIFF(mi, GETDATE(), IHP_Rcp.Checkout) % 60 AS rcp_sisa_menit_checkin,
          DATEDIFF(mi, IHP_Room.Jam_Checkin, GETDATE()) AS room_sedang_berjalan,
          DATEDIFF(mi, IHP_Room.Jam_Checkin, GETDATE()) / 60 AS room_sedang_berjalan_jam,
          DATEDIFF(mi, IHP_Room.Jam_Checkin, GETDATE()) % 60 AS room_sedang_berjalan_menit,
          DATEDIFF(mi, IHP_Rcp.Checkin, GETDATE()) AS rcp_sedang_berjalan,
          DATEDIFF(mi,IHP_Rcp.Checkin,GETDATE()) / 60 AS rcp_sedang_berjalan_jam,
          DATEDIFF(mi,IHP_Rcp.Checkin,GETDATE()) % 60 AS rcp_sedang_berjalan_menit,
          DATEDIFF(mi,IHP_Rcp.Checkout,GETDATE()) AS rcp_ext_sedang_berjalan,
          DATEDIFF(mi,IHP_Rcp.Checkout,GETDATE()) / 60 AS rcp_ext_sedang_berjalan_jam,
          DATEDIFF(mi,IHP_Rcp.Checkout,GETDATE()) % 60 AS rcp_ext_sedang_berjalan_menit,
          CONVERT(varchar(24), DATEADD(MINUTE, (DATEDIFF(mi, IHP_Rcp.Checkin, GETDATE())), [IHP_Rcp].[Checkin]), 103) + ' ' +
          SUBSTRING(CONVERT(varchar(24), DATEADD(MINUTE, (DATEDIFF(mi, IHP_Rcp.Checkin, GETDATE())), [IHP_Rcp].[Checkin]), 114), 1, 12) AS checkin_ditambah_rcp_sedang_berjalan,
          ISNULL(IHP_Room.Keterangan_Tamu, '') AS keterangan_tamu,
          IHP_Room.Jam_Checkin AS jam_checkin,
          IHP_Room.Jam_Checkout AS jam_checkout,
          CONVERT(varchar,IHP_Room.Jam_Checkout, 103)+' '+CONVERT(varchar,IHP_Room.Jam_Checkout, 108) AS jam_checkout__,
          CONVERT(varchar,IHP_Room.Jam_Checkout, 103)+' '+CONVERT(varchar,IHP_Room.Jam_Checkout, 114) AS jam_checkout_,
          ISNULL(IHP_Sul.Summary, '') AS summary,
          ISNULL(IHP_Sul.Total, 0) AS total_pembayaran,
          IHP_Rcp.Uang_Muka AS uang_muka,
          IHP_Rcp.QM1 AS qm1,
          IHP_Rcp.QM2 AS qm2,
          IHP_Rcp.QM3 AS qm3,
          IHP_Rcp.QM4 AS qm4,
          IHP_Rcp.QF1 AS qf1,
          IHP_Rcp.QF2 AS qf2,
          IHP_Rcp.QF3 AS qf3,
          IHP_Rcp.QF4 AS qf4,
          IHP_Rcp.PAX AS pax,
          IHP_Rcp.Keterangan AS hp,
          IHP_Rcp.KMS AS keterangan,
          IHP_Rcp.Status_Promo AS status_promo,
          ISNULL(IHP_UangVoucher.[Voucher], '') AS voucher,
          ISNULL(IHP_UangVoucher.[Pay_Value], '') AS pay_value_voucher,
          ISNULL(IHP_UangMukaNonCash.[Nama_Payment], '') AS nama_payment_uang_muka,
          ISNULL(IHP_UangMukaNonCash.[Input1], '') AS input1_jenis_kartu,
          ISNULL(IHP_UangMukaNonCash.[Input2], '') AS input2_nama,
          ISNULL(IHP_UangMukaNonCash.[Input3], '') AS input3_nomor_kartu,
          ISNULL(IHP_UangMukaNonCash.[Input3], '') AS input4_nomor_approval,
          ISNULL(IHP_UangMukaNonCash.[Pay_Value], 0) AS pay_value_uang_muka,
          ISNULL(IHP_UangMukaNonCash.[EDC_Machine], '') AS edc_machine
        FROM IHP_Room
        LEFT JOIN IHP_Ivc
          ON IHP_Room.Reception = IHP_Ivc.Reception
          AND IHP_Room.Kamar = IHP_Ivc.Kamar
        LEFT JOIN IHP_RoomCheckin
          ON IHP_Room.Kamar = IHP_RoomCheckin.Kamar
          AND IHP_Room.Kamar = IHP_RoomCheckin.Kamar
        LEFT JOIN IHP_Sul
          ON IHP_RoomCheckin.Reception = IHP_Sul.Reception
          AND IHP_Room.Kamar = IHP_Sul.Kamar
        LEFT JOIN IHP_UangVoucher
          ON IHP_Room.Reception = IHP_UangVoucher.Reception
        LEFT JOIN IHP_UangMukaNonCash
          ON IHP_Room.Reception = IHP_UangMukaNonCash.Reception
        LEFT JOIN IHP_Rcp
          ON IHP_Room.Reception = IHP_Rcp.Reception
        WHERE IHP_Room.Kamar = '${room}'`;


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
              console.log(room + " Sukses isgetPengecekanRoomReady ");
              logger.info(room + " Sukses isgetPengecekanRoomReady ");

              if (dataReturn.recordset[0].kamar_untuk_checkin == 1) {
                console.log(room + " Kamar Untuk Checkin");
                logger.info(room + " Kamar Untuk Checkin");

                if (dataReturn.recordset[0].status_checkin == 1) {
                  if (dataReturn.recordset[0].status_checksound == 1) {
                    console.log(room + " Sedang digunakan CheckSound");
                    logger.info(room + " Sedang digunakan CheckSound");
                  }
                  else {
                    console.log(room + " Sedang digunakan Checkin");
                    logger.info(room + " Sedang digunakan Checkin");
                  }
                }

                if (dataReturn.recordset[0].status_checkout == 1) {
                  console.log(room + " Kamar sudah di checkout");
                  logger.info(room + " Kamar sudah di checkout");
                }
                if (dataReturn.recordset[0].status_terbayar == 1) {
                  console.log(room + " Tagihan kamar Sudah dibayar");
                  logger.info(room + " Tagihan kamar Sudah dibayar");
                }
                if (dataReturn.recordset[0].status_terbayar == 1) {
                  console.log(room + " Tagihan kamar Sudah dibayar");
                  logger.info(room + " Tagihan kamar Sudah dibayar");
                }
                if (dataReturn.recordset[0].status_tagihan_tercetak == 1) {
                  console.log(room + " Tagihan kamar Sudah tercetak");
                  logger.info(room + " Tagihan kamar Sudah tercetak");
                }
                if (dataReturn.recordset[0].status_checkin == 0) {
                  console.log(room + " Belum di Checkin");
                  logger.info(room + " Belum di Checkin");
                }
              }
              else {
                console.log(room + " bukan Kamar Untuk Checkin");
                logger.info(room + " bukan Kamar Untuk Checkin");
              }

              if (dataReturn.recordset[0].sisa_checkin < 0) {
                console.log(room + " Kamar Durasi Checkin Sudah habis");
                logger.info(room + " Kamar Durasi Checkin Sudah habis");
              }
              if (dataReturn.recordset[0].sisa_checkin > 0) {
                console.log(room + " Room sisa Durasi Checkin " + dataReturn.recordset[0].sisa_checkin + " menit");
                logger.info(room + " Room sisa Durasi Checkin " + dataReturn.recordset[0].sisa_checkin + " menit");

                if (dataReturn.recordset[0].rcp_sisa_checkin >= 0) {
                  console.log(room + " saat ini durasi menggunakan durasi Rcp awal sebelum extend");
                  logger.info(room + " saat ini durasi menggunakan durasi Rcp awal sebelum extend");

                  console.log(room + " durasi sisa checkin " + dataReturn.recordset[0].rcp_sisa_checkin + " menit");
                  logger.info(room + " durasi sisa checkin " + dataReturn.recordset[0].rcp_sisa_checkin + " menit");
                  console.log(room + " durasi sedang berjalan " + dataReturn.recordset[0].rcp_sedang_berjalan + " menit");
                  logger.info(room + " durasi sedang berjalan " + dataReturn.recordset[0].rcp_sedang_berjalan + " menit");
                }

                else if ((dataReturn.recordset[0].rcp_sisa_checkin < 0) && (dataReturn.recordset[0].sisa_checkin > 0)) {
                  console.log(room + " saat ini durasi menggunakan durasi extend Room");
                  logger.info(room + " saat ini durasi menggunakan durasi extend Room");
                }

                console.log(room + " total durasi sisa checkin " + dataReturn.recordset[0].sisa_checkin + " menit");
                logger.info(room + " total durasi sisa checkin " + dataReturn.recordset[0].sisa_checkin + " menit");
                console.log(room + " total durasi sedang berjalan " + dataReturn.recordset[0].rcp_ext_sedang_berjalan + " menit");
                logger.info(room + " total durasi sedang berjalan " + dataReturn.recordset[0].rcp_ext_sedang_berjalan + " menit");

              }

              resolve(dataResponse);
            }
            else {
              console.log(room + " Room Tidak Terdaftar");
              logger.info(room + " Room Tidak Terdaftar");
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

  getCekRoom(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var isiQuery = " " +
          " select " +
          " Nama_Tamu" +
          ", Reception" +
          " ,Keterangan_Connect" +
          " ,Status_Checkin " +
          " ,Status_10" +
          " ,[Jumlah_Tamu]" +
          " from IHP_Room " +
          " where Kamar = '" + room + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              dataResponse = new ResponseFormat(true, dataReturn.recordset);
              sql.close();
              resolve(dataResponse);
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

  getGroupingTypeRoomReady(db_) {
    // TODO :: this method spesific for HP112
    return new Promise((resolve, reject) => {

      db = db_;
      var isiQuery = `
          SELECT
          CASE
          	WHEN SUBSTRING( Jenis_Kamar, 1, 2 ) = 'BA' THEN 'BAR'
          	WHEN SUBSTRING ( Jenis_Kamar, 1, 2 ) = 'PR' THEN 'PR'
          	WHEN SUBSTRING ( Jenis_Kamar, 1, 2 ) = 'RO' THEN 'ROOM'
          	WHEN SUBSTRING ( Jenis_Kamar, 1, 2 ) = 'SO' THEN 'SOFA'
          END AS jenis_kamar,
          COUNT ( * ) AS jumlah_available
          FROM
          	IHP_Room
          WHERE
          	( IHP_Room.Reception IS NULL OR IHP_Room.Reception = 'NULL' )
          	AND ( IHP_Room.Nama_Tamu IS NULL OR IHP_Room.Nama_Tamu = 'NULL' )
          	AND IHP_Room.Status_Checkin= 0
          	AND IHP_Room.Keterangan_Connect= 2
          GROUP BY
          	SUBSTRING (Jenis_Kamar,1,2)
          ORDER BY jumlah_available ASC`;

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
    });
  }

  getAllRoomReadyByGroupingType(db_, jenis_kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var jenis_kamar = jenis_kamar_;

        var isiQuery = `
            ${getRoomQuery} 
            where 
            IHP_Room.Jenis_Kamar like '${jenis_kamar}%'
            AND (IHP_Room.Reception is null OR IHP_Room.Reception = 'NULL') 
            AND (IHP_Room.Nama_Tamu is null OR IHP_Room.Nama_Tamu = 'NULL') 
            AND IHP_Room.Status_Checkin=0 
            AND IHP_Room.Keterangan_Connect=2 
            AND IHP_Room.Kamar not in (select Kamar From [IHP_RoomCheckin])
            order by 
            IHP_Room.Kamar asc `;

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

  getJenisRoomReady(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = `
            SELECT
            	Jenis_Kamar AS jenis_kamar,
            	COUNT ( * ) AS jumlah_available,
            	Kapasitas AS kapasitas,
            CASE
            		WHEN IHP_Room.Jenis_Kamar<> 'LOBBY'
            		AND IHP_Room.Jenis_Kamar<> 'LOBBY'
            		AND IHP_Room.Jenis_Kamar<> 'BAR'
            		AND IHP_Room.Jenis_Kamar<> 'LOUNGE'
            		AND IHP_Room.Jenis_Kamar<> 'RESTO' THEN
            			CAST ( 1 AS BIT ) ELSE CAST ( 0 AS BIT )
            END AS kamar_untuk_checkin
            FROM
            	IHP_Room
            WHERE
            	( IHP_Room.Reception IS NULL OR IHP_Room.Reception = 'NULL' )
            	AND ( IHP_Room.Nama_Tamu IS NULL OR IHP_Room.Nama_Tamu = 'NULL' )
            	AND IHP_Room.Status_Checkin= 0
            	AND IHP_Room.Keterangan_Connect= 2
            GROUP BY
            		Jenis_Kamar,
            		Kapasitas
            ORDER BY
            	Kapasitas ASC`;

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

  getJenisRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " select " +
          " Jenis_Kamar as jenis_kamar " +
          ",Kapasitas as kapasitas" +

          " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
          " AND IHP_Room.Jenis_Kamar<>'BAR' " +
          " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
          " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
          " then CAST(1 AS BIT)" +
          " else CAST(0 AS BIT) end " +
          " as kamar_untuk_checkin" +

          " from " +
          " IHP_Room " +
          " group by  " +
          " Jenis_Kamar," +
          " Kapasitas" +
          " order by Jenis_Kamar desc";

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

  getJenisRoomReadyDetail(db_, jenis_kamar_, kapasitas_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var jenis_kamar = jenis_kamar_;
        var kapasitas = kapasitas_;
        var samaDgQuery = '';
        if (kapasitas !== undefined && kapasitas != '') {
          samaDgQuery = "and IHP_Room.Kapasitas ='" + kapasitas + "'";
        }
        var isiQuery = " " +
          getRoomQuery +
          " where " +
          " IHP_Room.Jenis_Kamar ='" + jenis_kamar + "'" +
          samaDgQuery +
          " AND (IHP_Room.Reception is null OR IHP_Room.Reception = 'NULL') " +
          " AND (IHP_Room.Nama_Tamu is null OR IHP_Room.Nama_Tamu = 'NULL') " +
          " AND IHP_Room.Status_Checkin=0 " +
          " AND IHP_Room.Keterangan_Connect=2 " +

          " AND IHP_Room.Kamar not in (select Kamar From [IHP_RoomCheckin]) " +

          " order by " +
          " IHP_Room.Kamar asc ";

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

  getJenisRoomDetail(db_, jenis_kamar_, kapasitas_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var jenis_kamar = jenis_kamar_;
        var kapasitas = kapasitas_;
        var samaDgQuery = '';
        if (kapasitas !== undefined && kapasitas != '') {
          samaDgQuery = "and IHP_Room.Kapasitas ='" + kapasitas + "'";
        }
        var isiQuery = " " +
          getRoomQuery +
          " where " +
          " IHP_Room.Jenis_Kamar ='" + jenis_kamar + "'" +
          samaDgQuery +
          " order by " +
          " IHP_Room.Kamar asc ";

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

  getAllRoomInUse(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          getRoomQuery +

          //Room yang sedang checkin
          " where " +
          " IHP_Room.Keterangan_Connect=2 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
          " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') " +

          //Room yang sedang checkout
          " or " +
          " (IHP_Room.Keterangan_Connect=1 " +
          " or " +
          "(" +
          " IHP_Room.Keterangan_Connect=4 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and IHP_Room.Nama_Tamu='TESKAMAR' " +
          " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          ") )" +

          //Room yang sedang terbayar
          " or " +
          " (IHP_Room.Keterangan_Connect=2 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and IHP_Sul.Summary is not null  " +
          " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
          " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') )" +

          //Room yang sedang checksound
          " or " +
          " (IHP_Room.Keterangan_Connect=4 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and IHP_Room.Nama_Tamu='TESKAMAR' " +
          " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " ) " +

          " order by IHP_Room.Jam_Checkout asc";

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

  getAllRoom(db_, keyword_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var keyword = keyword_;
        var likeQuery = ``;
        if (keyword != undefined && keyword != '') {
          likeQuery += ` where IHP_Room.Kamar like '%${keyword}%' `;
        }

        var isiQuery = " " +
          getRoomQuery +
          likeQuery +
          " order by IHP_Room.Jam_Checkout desc";

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

  getRoomByRoomNo(db_, room_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var room = room_;
        var likeQuery = " where IHP_Room.Kamar ='" + room + "'";
        var isiQuery = " " +
          getRoomQuery +
          likeQuery +
          " order by IHP_Room.Jam_Checkout desc";

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error getRoomByRoomNo ' + isiQuery);
            resolve(false);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              logger.info('Sukses cek Room Sign No ' +dataReturn.recordset[0].kamar+" "+ dataReturn.recordset[0].kamar_alias);
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



  getAllRoomCheckout(db_, keyword_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var keyword = keyword_;

        var likeQuery = ``;
        if (keyword != undefined && keyword != '') {
          likeQuery += ` and IHP_Room.Kamar like '%${keyword}%' `;
        }

        var isiQuery = " " +
          getRoomQuery +

          " where " +
          " IHP_Room.Keterangan_Connect=1 " +
          " or " +
          "(" +
          " IHP_Room.Keterangan_Connect=4 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and IHP_Room.Nama_Tamu='TESKAMAR' " +
          " and (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          ")" +
          //likeQuery+

          " order by IHP_Room.Jam_Checkout asc";
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

  getAllRoomCheckin(db_, keyword_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var keyword = keyword_;

        var likeQuery = ``;
        if (keyword != undefined && keyword != '') {
          likeQuery += ` and IHP_Room.Kamar like '%${keyword}%' `;
        }

        var isiQuery = " " +
          getRoomQuery +
          " where " +
          " IHP_Room.Keterangan_Connect=2 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
          " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') " +
          likeQuery +
          " order by IHP_Room.Jam_Checkout asc";

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

  getAllRoomCheckinByType(db_, param_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;


        let addQuery = ``;
        if (param_.room_code != undefined && param_.room_code != '') {
          addQuery += ` and IHP_Room.Kamar like '%${param_.room_code}%'`;
        }

        if (param_.mbr_name != undefined && param_.mbr_name != '') {
          addQuery += ` or IHP_Room.Nama_Tamu like '%${param_.mbr_name}%' `;
        }

        if (param_.room_type != undefined && param_.room_type != '') {
          //addQuery += ` and IHP_Room.Jenis_Kamar ='${param_.room_type}' AND IHP_Room.Kapasitas ='${kapasitas}' `;
          addQuery += ` and IHP_Room.Jenis_Kamar like '${param_.room_type}%' `;
        }

        let isiQuery = `
          ${getRoomQuery}
           where 
           IHP_Room.Keterangan_Connect=2 
           and IHP_Room.Status_Checkin=1  
           and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') 
           and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') 
          ${addQuery}
           order by IHP_Room.Jam_Checkout asc`;

        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            reject(err.message);
          } else {
            sql.close();
            if (dataReturn.recordset.length > 0) {
              resolve(dataReturn.recordset);
            }
            else {
              reject("No Room Checkin");
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

  getAllRoomPaid(db_, keyword_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var keyword = keyword_;

        var likeQuery = ``;
        if (keyword != undefined && keyword != '') {
          likeQuery += ` and IHP_Room.Kamar like '%${keyword}%' `;
        }
        var isiQuery = " " +
          getRoomQuery +

          " where " +
          " IHP_Room.Keterangan_Connect=2 " +
          " and IHP_Room.Status_Checkin=1  " +
          " and IHP_Sul.Summary is not null  " +
          " and (IHP_Room.Reception is NOT NULL OR IHP_Room.Reception <> 'NULL') " +
          " and (IHP_Room.Nama_Tamu is NOT NULL OR IHP_Room.Nama_Tamu <> 'NULL') " +
          likeQuery +
          " order by IHP_Room.Jam_Checkout asc";
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

  getAllRoomReady(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          getRoomQuery +
          " where " +
          " (IHP_Room.Reception is NULL OR IHP_Room.Reception = 'NULL') " +
          " AND (IHP_Room.Nama_Tamu is NULL OR IHP_Room.Nama_Tamu = 'NULL') " +
          " AND IHP_Room.Status_Checkin=0 " +
          " AND IHP_Room.Keterangan_Connect=2 " +

          " order by IHP_Room.Jenis_Kamar desc";
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

  getExtendRoomList(db_, kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var kamar = kamar_;
        var isiQuery = " " +
          " SELECT  [IHP_Ext].[Reception] as reception" +
          " ,[IHP_Ext].[Tgl_Extend] as tanggal_extend" +
          " ,[IHP_Ext].[Jam_Extend] as jam_extend" +
          " ,[IHP_Ext].[Menit_Extend] as menit_extend" +
          " ,([IHP_Ext].[Jam_Extend]*60)+[IHP_Ext].[Menit_Extend] as total_menit_extend" +
          " ,[IHP_Ext].[Date_Trans] as date_trans" +
          " ,[IHP_Room].[Jenis_Kamar] as jenis_kamar" +
          " ,[IHP_Room].[Kamar] as kamar" +
          " FROM [IHP_Ext]" +
          " ,IHP_Room " +
          " where IHP_Room.Kamar='" + kamar + "'" +
          " and IHP_Room.Reception=[IHP_Ext].[Reception]";
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

  getRoom(db_, kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kamar = kamar_;
        var isiQuery = " " +
          getRoomQuery +
          " where IHP_Room.Kamar='" + kamar + "'" +
          " order by IHP_Room.Jenis_Kamar" +
          ", IHP_Room.Kamar asc ";
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

  getRoomByType(db_, jenis_kamar_, kapasitas_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var jenis_kamar = jenis_kamar_;
        var kapasitas = kapasitas_;
        var isiQuery = " " +
          getRoomQuery +

          " where " +
          " IHP_Room.Jenis_Kamar ='" + jenis_kamar + "'" +
          " AND IHP_Room.Kapasitas ='" + kapasitas + "'" +

          " order by " +
          " IHP_Room.Kamar asc ";
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

  getChekinRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " SELECT " +
          " IHP_Room.Kamar, " +
          " IHP_Room.Kamar as kamar, " +
          " IHP_Room.Jenis_Kamar, " +
          " IHP_Room.Jenis_Kamar as jenis_kamar, " +
          " IHP_Room.Kapasitas, " +
          " IHP_Room.Kapasitas as kapasitas, " +
          " IHP_Room.Status_Checkin, " +
          " IHP_Room.Status_Checkin as status_checkin, " +
          " IHP_Room.Keterangan_Connect, " +
          " IHP_Room.Keterangan_Connect as keterangan_connect, " +
          " IHP_Room.Reception, " +
          " IHP_Room.Reception as reception, " +
          " IHP_Room.Nama_Tamu, " +
          " IHP_Room.Nama_Tamu as nama_tamu, " +
          " IHP_Room.IP_Address, " +
          " IHP_Room.IP_Address as ip_address, " +
          " IHP_Ivc.Chusr, " +
          " IHP_Ivc.Chusr as chusr, " +
          " DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin, " +
          " DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin, " +
          " IHP_Room.Jam_Checkin as jam_checkin, " +
          " IHP_Room.Jam_Checkout as jam_checkout, " +

          " Isnull(max(IHP_Promo_Rcp.Promo),'') as promo," +
          " Isnull(max(IHP_Promo_Rcp.Start_Promo),'') as start_promo," +
          " Isnull(max(IHP_Promo_Rcp.End_promo),'') as end_promo," +
          " Isnull(max(IHP_Promo_Rcp.Time_Start),'') as time_start," +
          " Isnull(max(IHP_Promo_Rcp.Time_Finish),'') as time_finish," +
          " Isnull(max(IHP_Promo_Rcp.Date_Start),'') as date_start," +
          " Isnull(max(IHP_Promo_Rcp.Date_Finish),'') as date_finish," +
          " Isnull(max(IHP_Promo_Rcp.Diskon_Persen),0) as diskon_persen," +
          " Isnull(max(IHP_Promo_Rcp.Diskon_Rp),0) as diskon_rp," +
          " Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu" +

          " FROM IHP_Room " +
          " Inner Join IHP_Ivc on IHP_Room.Reception=IHP_Ivc.Reception" +
          " Left Join IHP_Promo_Rcp on IHP_Room.Reception=IHP_Promo_Rcp.Reception" +
          " and IHP_Promo_Rcp.Status_Promo=2" +

          " WHERE " +
          " IHP_Room.Reception IS NOT NULL  " +
          " and IHP_Room.Status_checkin = 1  " +
          " and IHP_Room.Reception NOT IN (SELECT Reception FROM ihp_sul) " +

          " group by" +
          " IHP_Room.Kamar," +
          " IHP_Room.Jenis_Kamar," +
          " IHP_Room.Kapasitas," +
          " IHP_Room.Status_Checkin," +
          " IHP_Room.Keterangan_Connect," +
          " IHP_Room.Reception," +
          " IHP_Room.Nama_Tamu," +
          " IHP_Room.IP_Address," +
          " IHP_Ivc.Chusr," +
          " IHP_Room.Jam_Checkin," +
          " IHP_Room.Jam_Checkout," +
          " IHP_Room.Keterangan_Tamu" +
          " order by Jam_Checkout desc ";

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

  getOrderRoom(db_, kamar_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var kamar = kamar_;
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
          " IHP_Sod.[Qty] - sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_belum_terkirim " +


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
          " AND IHP_Sol.Kamar ='" + kamar + "'" +
          " group by " +
          "  IHP_Sol.SlipOrder" +
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
          //" ,IHP_Okd.Qty" +
          //" ,IHP_Okl.DATE"+
          " ,IHP_Sol.Date_trans" +
          " ,IHP_Sol.CHusr" +
          " ,[IHP_Sod_Promo].[Harga_Promo]" +
          " ,IHP_Sod.[Tgl_Terima]" +
          " Order By IHP_Sod.Status asc";

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

  getReadyRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " SELECT" +

          " IHP_Room.Kamar, " +
          " IHP_Room.Jenis_Kamar, " +
          " IHP_Room.Kapasitas, " +
          " IHP_Room.Status_Checkin, " +
          " IHP_Room.Keterangan_Connect, " +
          " isnull(IHP_Room.Reception,'') as Reception, " +
          " isnull(IHP_Room.Nama_Tamu,'') as Nama_Tamu, " +
          " IHP_Room.IP_Address, " +
          " DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin, " +
          " DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin, " +
          " IHP_Room.Jam_Checkin as jam_checkin, " +
          " IHP_Room.Jam_Checkout as jam_checkout " +

          " FROM IHP_Room" +
          " WHERE " +
          //" Status_Checkin=0 "+
          " (Reception IS NULL OR " +
          " Reception IN (SELECT Reception FROM ihp_sul))" +
          //" AND Keterangan_Connect=4  "+           
          " AND Jenis_Kamar<>'LOBBY' " +
          " AND Jenis_Kamar<>'BAR' " +
          " AND Jenis_Kamar<>'LOUNGE' " +
          " AND Jenis_Kamar<>'RESTO' " +
          "order by Jenis_Kamar, Kamar asc ";

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
module.exports = RoomService;