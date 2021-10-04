var DBConnection = require('../util/db.pool');
var sql = require("mssql");
var async = require('async');
var Shift = require('../util/shift');
var KodeTransaksi = require('../util/kode.transaksi');
var TarifKamar = require('../services/tarif.kamar');
var PromoRoom = require('../services/promo.room');
var PromoFood = require('../services/promo.food');
var Service = require('../services/service');
var Pajak = require('../services/pajak');
var Voucher = require('../services/voucher');
var TglMerah = require('../services/tgl.merah.js');
var Room = require('../services/room.service.js');
var History = require('../services/history.js');
var CheckinProses = require('../services/checkin.proses.js');

class TransferModel {

  static get ACCEPTED_CALL() { return 0; }


  constructor(logger) {
    this.log = logger;
  }

  async validateNewRoomTransfer(newRoom) {
    let db = await new DBConnection().getPoolConnection();

    return new Promise((resolve, reject) => {
      var qry = `
            SELECT
                IHP_Room.Kamar AS new_room_code,
                IHP_Room.Jenis_Kamar AS new_jenis_kamar,
                IHP_Room.Kapasitas AS kapasitas,
                ISNULL(IHP_Room.Jumlah_Tamu, 0) AS jumlah_tamu,
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
                END AS status_kamar_ready_untuk_checkin
            FROM IHP_Room
            LEFT JOIN IHP_Ivc 
                ON IHP_Room.Reception = IHP_Ivc.Reception
                AND IHP_Room.Kamar = IHP_Ivc.Kamar
            LEFT JOIN IHP_RoomCheckin
                ON IHP_Room.Kamar = IHP_RoomCheckin.Kamar
                AND IHP_Room.Kamar = IHP_RoomCheckin.Kamar
            LEFT JOIN IHP_Rcp
                ON IHP_Room.Reception = IHP_Rcp.Reception
            WHERE IHP_Room.Kamar = '${newRoom}'`;

      db.request().query(qry, function (err, dataReturn) {
        if (err) {
          logger.error(err);
          console.log(err);
          reject(`${err.message} : ${qry}`);
        } else {
          if (dataReturn.recordset.length > 0) {
            if (dataReturn.recordset[0].status_kamar_ready_untuk_checkin == 1) {
              resolve(dataReturn.recordset[0]);
            } else {
              console.log(`Room ${newRoom} Sedang Digunakan`);
              logger.info(`Room ${newRoom} Sedang Digunakan`);
              reject(`Room ${newRoom} Sedang Digunakan`);
            }
          } else {
            console.log(`Room ${newRoom} Tidak Terdaftar`);
            logger.info(`Room ${newRoom} Tidak Terdaftar`);
            reject(`Room ${newRoom} Tidak Terdaftar`);
          }
        }
      });
    });
  }

  async detailOldRoom(oldRoom) {
    let db = await new DBConnection().getPoolConnection();

    return new Promise((resolve, reject) => {

      var qry = `
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
              SUBSTRING(CONVERT(varchar(24), DATEADD(MINUTE, (DATEDIFF(mi, IHP_Rcp.Checkin, GETDATE())), [IHP_Rcp].[Checkin]), 114),1,8) AS checkin_ditambah_rcp_sedang_berjalan,
              ISNULL(IHP_Room.Keterangan_Tamu, '') AS keterangan_tamu,
              IHP_Room.Jam_Checkin AS jam_checkin,
              IHP_Room.Jam_Checkout AS jam_checkout,
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
            WHERE IHP_Room.Kamar = '${oldRoom}'`;

      db.request().query(qry, function (err, dataReturn) {
        if (err) {
          logger.error(err);
          console.log(err);
          reject(`${err.message} : ${qry}`);
        } else {
          if (dataReturn.recordset.length > 0) {

            let qm1 = dataReturn.recordset[0].qm1;
            let qm2 = dataReturn.recordset[0].qm2;
            let qm3 = dataReturn.recordset[0].qm3;
            let qm4 = dataReturn.recordset[0].qm4;
            let qf1 = dataReturn.recordset[0].qf1;
            let qf2 = dataReturn.recordset[0].qf2;
            let qf3 = dataReturn.recordset[0].qf3;
            let qf4 = dataReturn.recordset[0].qf4;
            let pax = qm1 + qm2 + qm3 + qm4 + qf1 + qf2 + qf3 + qf4;
            if (pax < 1) {
              reject("Jumlah pengunjung belum terisi");
            } else {
              let oldRoom = {
                sisa_checkin: dataReturn.recordset[0].sisa_checkin,
                sisa_menit_checkin: dataReturn.recordset[0].sisa_menit_checkin,
                sisa_jam_checkin: dataReturn.recordset[0].sisa_jam_checkin,
                old_rcp_code: dataReturn.recordset[0].reception,
                old_ivc_code: dataReturn.recordset[0].invoice,
                old_room_code: dataReturn.recordset[0].kamar,
                old_id_payment_uang_muka: dataReturn.recordset[0].id_payment,
                rcp_sedang_berjalan: parseInt(dataReturn.recordset[0].rcp_sedang_berjalan),
                rcp_sedang_berjalan_jam: parseInt(dataReturn.recordset[0].rcp_sedang_berjalan_jam),
                rcp_sedang_berjalan_menit: parseInt(dataReturn.recordset[0].rcp_sedang_berjalan_menit),
                rcp_sisa_checkin: parseInt(dataReturn.recordset[0].rcp_sisa_checkin),
                old_kapasitas_kamar: dataReturn.recordset[0].kapasitas,
                old_pax: dataReturn.recordset[0].pax,
                old_jenis_kamar: dataReturn.recordset[0].jenis_kamar,
                checkin_ditambah_rcp_sedang_berjalan: dataReturn.recordset[0].checkin_ditambah_rcp_sedang_berjalan,
                rcp_ext_sedang_berjalan: parseInt(dataReturn.recordset[0].rcp_ext_sedang_berjalan),
                rcp_ext_sedang_berjalan_sebelum_di_reset: parseInt(dataReturn.recordset[0].rcp_ext_sedang_berjalan),
                uang_muka: dataReturn.recordset[0].uang_muka,
                hp: dataReturn.recordset[0].hp,
                keterangan: dataReturn.recordset[0].keterangan,
                kode_member: dataReturn.recordset[0].kode_member,
                nama_member: dataReturn.recordset[0].nama_member,
                status_promo: dataReturn.recordset[0].status_promo,
                eventAcara: dataReturn.recordset[0].keterangan_tamu,
                voucher: dataReturn.recordset[0].voucher,
                jumlah_tamu: pax
              };
              resolve(oldRoom);
            }
          } else {
            console.log(`Room ${oldRoom}  Tidak Terdaftar`);
            logger.info(`Room ${oldRoom}  Tidak Terdaftar`);
            reject(`Room ${oldRoom}  Tidak Terdaftar`);
          }
        }
      });
    });
  }

  async checkinTransaction(oldRoom, newRoom, param) {

    let db = await new DBConnection().getPoolConnection();
    var shift = await new Shift().getShift(db);
    var date_trans_Query = await new Shift().getDateTransQuery(shift);
    var finalShift = await new Shift().getFinalShift(shift);

    var new_kode_rcp = await new KodeTransaksi().getReceptionCode(shift, db);
    var new_kode_ivc = await new KodeTransaksi().getinvoiceCode(shift, db);

    var apakah_sekarang_malam_besok_libur = await new TglMerah().getApakahSekarangMalamBesokLibur(db);
    var apakah_sekarang_tanggal_libur = await new TglMerah().getApakahSekarangTanggalLibur(db);
    let mbl;
    if (apakah_sekarang_malam_besok_libur.state == true) {
      mbl = '1';
    }
    else {
      mbl = '0';
    }
    let status_transfer = '1';

    var qInsertIhpRcp = `
        set dateformat dmy 
        INSERT INTO [dbo].[IHP_Rcp](
          [Reception],
          [DATE],
          [SHIFT],
          [Member],
          [Nama],
          [Kamar],
          [Checkin],
          [Jam_Sewa],
          [Menit_Sewa],
          [Checkout],
          [QM1],
          [QM2],
          [QM3],
          [QM4],
          [QF1],
          [QF2],
          [QF3],
          [QF4],
          [PAX],
          [Keterangan],
          [Uang_Muka],
          [Id_Payment],
          [Uang_Voucher],
          [Chtime],
          [Chusr],
          [MBL],
          [Status],
          [Posted],
          [Surcharge],
          [Flag],
          [Export],
          [Reservation],
          [Invoice],
          [Summary],
          [KMS],
          [Date_Trans],
          [Reception_Lama],
          [Status_Promo],
          [FlagStep],
          [Complete],
          [Printed_Slip_Checkin],
          [Member_Rev])
        VALUES (
          '${new_kode_rcp}',
          CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8),
          '${finalShift}',
          '${oldRoom.kode_member}',
          '${oldRoom.nama_member}',
          '${newRoom.new_room_code}',
          getdate(),
          ${param.duration_on_hours},
          0,
          DATEADD(minute,${param.duration_on_minute},GETDATE()),
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          ${oldRoom.old_pax},
          ${oldRoom.old_pax},
          ${oldRoom.hp}',
          ${oldRoom.uangMuka},
          ${oldRoom.old_id_payment_uang_muka},
          0,
          CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8),
          '${param.chusr}',
          '${mbl}',
          '${status_transfer}',
          '',
          'N',
          '',
          '',
          '',
          '${new_kode_ivc}',
          '',
          '${oldRoom.keterangan}',
          ${date_trans_Query}",
          '',
          '${oldRoom.status_promo}',
          '',
          '0',
          '-1',
          '${oldRoom.kode_member})`;

    var qInsertIhpIvc = `
        set dateformat dmy 
        INSERT INTO [dbo].[IHP_Ivc](
          [Invoice],
          [DATE],
          [Shift],
          [Reception],
          [Member],
          [Nama],
          [Kamar],
          [Sewa_Kamar],
          [Total_Extend],
          [Overpax],
          [Discount_Kamar],
          [Surcharge_Kamar],
          [Service_Kamar],
          [Tax_Kamar],
          [Total_Kamar],
          [Charge_Penjualan],
          [Total_Cancelation],
          [Discount_Penjualan],
          [Service_Penjualan],
          [Tax_Penjualan],
          [Total_Penjualan],
          [Charge_Lain],
          [Uang_Muka],
          [Uang_Voucher],
          [Total_All],
          [Transfer],
          [Status],
          [Chtime],
          [Chusr],
          [Printed],
          [Flag],
          [Posted],
          [Date_Trans],
          [Jenis_Kamar])
        VALUES(
          '${new_kode_ivc}',
          CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8),
          '${finalShift}',
          '${new_kode_rcp}',
          '${oldRoom.kode_member}',
          '${oldRoom.nama_member}',
          '${newRoom.new_room_code}',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          0,
          '0',
          '0',
          '${oldRoom.old_ivc_code}',
          '1',
          CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8)
          '${param.chusr}'
          '0',
          '',
          '',
          ${date_trans_Query},
          '${newRoom.new_jenis_kamar}')`;

    var qUpdateIhpRoom = `
        set dateformat dmy 
        Update IHP_Room 
        Set Reception = '${new_kode_rcp}',
            Nama_Tamu = '${nama_member}',
            Jumlah_Tamu = '${pax}',
            Jam_Checkin = 'getdate()',
            Jam_Masuk = " 'getdate()',
            Jam_Checkout = '${dateTambahan},
            Status_Checkin = '1',
            Keterangan_Tamu = '${eventAcara}',
        where Kamar = '${room}`;

    var qDeleteIhpRcpDetailsRoom = `
        Delete From IHP_Rcp_DetailsRoom 
        where Reception = '${new_kode_rcp}'`;

    var qSelectInfoInOutExtend = `
        SET DATEFORMAT dmy
        SELECT
          [IHP_Rcp].[Reception] AS reception,
          [IHP_Rcp].[Checkin] AS checkin_,
          CONVERT(varchar(24), [IHP_Rcp].[Checkin], 103) + ' ' + SUBSTRING(CONVERT(varchar(24), [IHP_Rcp].[Checkin], 114), 1, 8) AS checkin,
          [IHP_Rcp].[Jam_Sewa] AS jam_sewa,
          [IHP_Rcp].[Menit_Sewa] AS menit_sewa,
          [IHP_Rcp].[Checkout] AS checkout,
          [IHP_Room].[Jam_Checkin] AS jam_checkin,
          [IHP_Room].[Jam_Checkout] AS jam_checkout,
          [IHP_Room].[Jenis_Kamar] AS jenis_kamar,
          ISNULL(SUM([IHP_Ext].[Jam_Extend]), 0) AS [total_jam_extend],
          ISNULL(SUM([IHP_Ext].[Menit_Extend]), 0) AS [total_menit_extend],
          DATEADD(
          MINUTE,
          (
          ISNULL(SUM([IHP_Ext].[Menit_Extend]), 0) + (ISNULL(SUM([IHP_Ext].[Jam_Extend]), 0) * 60) + ([IHP_Rcp].[Jam_Sewa] * 60) + [IHP_Rcp].[Menit_Sewa]
          ),
          [IHP_Rcp].[Checkin]
          ) AS checkout_ditambah_extend_,

          CONVERT(
          varchar(24),
          DATEADD(
          MINUTE,
          (
          ISNULL(SUM([IHP_Ext].[Menit_Extend]), 0) + (ISNULL(SUM([IHP_Ext].[Jam_Extend]), 0) * 60) + ([IHP_Rcp].[Jam_Sewa] * 60) + [IHP_Rcp].[Menit_Sewa]
          ),
          [IHP_Rcp].[Checkin]
          ),
          103
          ) + ' ' + SUBSTRING(
          CONVERT(
          varchar(24),
          DATEADD(
          MINUTE,
          (
          ISNULL(SUM([IHP_Ext].[Menit_Extend]), 0) + (ISNULL(SUM([IHP_Ext].[Jam_Extend]), 0) * 60) + ([IHP_Rcp].[Jam_Sewa] * 60) + [IHP_Rcp].[Menit_Sewa]
          ),
          [IHP_Rcp].[Checkin]
          ),
          114
          ),
          1,
          8
          ) AS checkout_ditambah_extend,

          CASE
            WHEN
              CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
              CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
            ELSE DATEPART(dw, GETDATE())
          END
          AS nomor_hari_ini,
          CASE
            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 1 THEN 'minggu'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 2 THEN 'senin'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 3 THEN 'selasa'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 4 THEN 'rabu'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 5 THEN 'kamis'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 6 THEN 'jumat'

            WHEN
              (CASE
                WHEN
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) >= 0 AND
                  CAST(SUBSTRING(CONVERT(varchar(24), GETDATE(), 114), 1, 2) AS int) <= 5 THEN DATEPART(dw, GETDATE() - 1)
                ELSE DATEPART(dw, GETDATE())
              END) = 7 THEN 'sabtu'

          END
          AS hari

        FROM [IHP_Rcp]
        LEFT JOIN [IHP_Ext]
          ON [IHP_Rcp].[Reception] = [IHP_Ext].[Reception]
        LEFT JOIN [IHP_Room]
          ON [IHP_Rcp].[Reception] = [IHP_Room].[Reception]
        WHERE [IHP_Rcp].[Reception] = '${new_kode_rcp}'
        GROUP BY [IHP_Rcp].[Reception],
                [IHP_Rcp].[Checkin],
                [IHP_Rcp].[Jam_Sewa],
                [IHP_Rcp].[Menit_Sewa],
                [IHP_Rcp].[Checkout],
                [IHP_Room].[Jam_Checkin],
                [IHP_Room].[Jam_Checkout],
                [Jenis_Kamar] `;

    var qSelectJamKenaSewa = `
        set dateformat dmy 
        exec Jam_Kena_Sewa_ 
        '${jenis_kamar}',
        '${nomor_hari}',
        '${checkin}',
        '${checkout}'`;

    var qInsertIhpRoomCheckin = `
        set dateformat dmy 
        INSERT INTO [dbo].[IHP_RoomCheckin](
          [Kamar],
          [Reception])
        VALUES(" +
           '${newRoom.new_room_code}',
           '${new_kode_rcp}')`;


    return new Promise((resolve, reject) => {

    });

  }

}

module.exports = TransferModel;