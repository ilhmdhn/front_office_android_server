var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
const OrderInventoryService = require('../services/order.inventory.service.js');
var CheckinProses = require('../services/checkin.proses.js');

var db;
var logger;
var hasilReceptionInvoiceDetail;

var hasilPromoRcp;
var hasilPromoRcpRoom;
var hasilPromoRcpFood;
var hasilSulSud;
var hasilSlipOrderStatus;
var hasilTarifPerjamHargaKamar;
var hasilExtend;
var invoice;

var ringkasan_total_all;
var ringkasan_sub_sub_total;
var ringkasan_sub_total;
var ringkasan_total_all;
var ringkasan_total_kamar;
var ringkasan_total_penjualan;
var ringkasan_cancelation_penjualan;
var ringkasan_diskon_member_penjualan;
var ringkasan_extend_kamar;
var ringkasan_surcharge_kamar;
var ringkasan_overpax_kamar;
var ringkasan_diskon_member_kamar;
var ringkasan_service;
var ringkasan_pajak;
var normal_uang_muka;
var normal_nilai_gift_voucher;
var normal_gift_voucher;
var ringkasan_sewa_kamar;
var ringkasan_penjualan;
var normal_voucher;

var normal_total_all;
var normal_total_kamar;
var normal_total_penjualan;
var normal_cancelation_penjualan;
var normal_diskon_member_penjualan;
var normal_extend_kamar;
var normal_surcharge_kamar;
var normal_overpax_kamar;
var normal_diskon_member_kamar;
var normal_service;
var normal_pajak;
var normal_sewa_kamar;
var normal_penjualan;
var normal_total_kamar_penjualan_sebelum_service;
var normal_total_final;
var normal_sewa_kamar_sebelum_service;
var normal_penjualan_sebelum_service;

var transfer_total_all;
var transfer_total_kamar;
var transfer_total_penjualan;
var transfer_cancelation_penjualan;
var transfer_diskon_member_penjualan;
var transfer_extend_kamar;
var transfer_surcharge_kamar;
var transfer_overpax_kamar;
var transfer_diskon_member_kamar;
var transfer_service;
var transfer_pajak;
var transfer_sewa_kamar;
var transfer_penjualan;
var sign_path_;
var query_ihp_ivc_kamar_transfer;
var query_ihp_ivc_rcp;

/* status=0 ready
status=1 checksound
status=2 checkin=not paid
status=3 invoice printed=ditagihkan=claimed
status=4 terbayar=paid
status=5 checkout=repaired
*/

var getRoomQuery = "" +
    " SELECT " +
    " IHP_Room.Kamar as kamar" +
    " ,IHP_Room.Jenis_Kamar as jenis_kamar" +
    " ,IHP_Room.Kapasitas as kapasitas" +
    " ,isnull(IHP_Room.Jumlah_Tamu,0) as jumlah_tamu" +
    " ,IHP_Room.Status_Checkin as status_checkin " +

    " ,case when IHP_Room.Keterangan_Connect=2  then 0 " +
    " when IHP_Room.Keterangan_Connect=1  then 1 " +
    " when IHP_Room.Keterangan_Connect=4  then 1 end" +
    " as status_checkout" +

    " ,case when IHP_Room.Keterangan_Connect=4 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Nama_Tamu='TESKAMAR' " +
    " and IHP_Room.Reception is null " +
    " then 1 " +
    " else 0 end" +
    " as status_checksound" +

    " ,case " +
    " when IHP_Room.Reception is null " +
    " AND IHP_Room.Nama_Tamu is null " +
    " AND IHP_Room.Status_Checkin=0 " +
    " AND IHP_Room.Keterangan_Connect=2 " +
    " then 0" +

    " when IHP_Room.Keterangan_Connect=4 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Nama_Tamu='TESKAMAR' " +
    " and IHP_Room.Reception is null " +
    " then 1" +

    " when IHP_Room.Keterangan_Connect=2 " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Reception is not null " +
    " and IHP_Room.Nama_Tamu is not null " +
    " and IHP_Sul.Summary is null " +
    " and (IHP_Ivc.Printed='0' or IHP_Ivc.Printed='-1')" +
    " then 2" +

    " when IHP_Ivc.Printed>0 " +
    " and IHP_Sul.Summary is null " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Keterangan_Connect=2 " +
    " then 3" +

    " when IHP_Sul.Summary is not null " +
    " and IHP_Room.Status_Checkin=1  " +
    " and IHP_Room.Keterangan_Connect=2 " +
    " then 4" +

    " when IHP_Room.Keterangan_Connect=1  " +
    " then 5" +

    " else  6 end" +
    " as status_kamar" +

    " ,case when IHP_Sul.Summary is not null  " +
    " then 1 else  0 end" +
    " as status_terbayar" +

    " ,IHP_Room.Status_10 as status_10_menit " +

    " ,case when IHP_Ivc.Printed='1' then 1 " +
    " else 0 end as status_tagihan_tercetak " +

    " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'BAR' " +
    " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
    " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
    " AND IHP_Room.Reception is null " +
    " AND IHP_Room.Nama_Tamu is null " +
    " AND IHP_Room.Status_Checkin=0 " +
    " AND IHP_Room.Keterangan_Connect=2 " +
    " then 1 " +
    " else 0 end" +
    " as status_kamar_ready_untuk_checkin" +

    " ,IHP_Room.Service_Kamar as call_service_kamar " +
    " ,IHP_Room.Keterangan_Connect as keterangan_connect " +

    " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
    " AND IHP_Room.Jenis_Kamar<>'BAR' " +
    " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
    " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
    " then CAST(1 AS BIT) " +
    " else CAST(0 AS BIT) end" +
    " as kamar_untuk_checkin" +

    " ,case when IHP_Room.Reception ='NULL'  then ''" +
    " when IHP_Room.Reception is null  then ''" +
    " else IHP_Room.Reception " +
    " end" +
    " as reception" +

    " ,case when IHP_Room.Nama_Tamu ='NULL'  then ''" +
    " when IHP_Room.Nama_Tamu is null  then ''" +
    " else IHP_Room.Nama_Tamu " +
    " end" +
    " as nama_member" +

    " ,IHP_Room.IP_Address as ip_address" +
    " ,isnull(IHP_Ivc.Chusr,'') as chusr " +
    " ,isnull(IHP_Ivc.Member,'') as kode_member " +
    //" ,isnull(IHP_Ivc.Nama,'') as nama " +

    " ,DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin " +
    " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin " +
    " ,Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu" +
    " ,IHP_Room.Jam_Checkin as jam_checkin " +
    " ,IHP_Room.Jam_Checkout as jam_checkout " +
    " ,isnull(IHP_Sul.Summary,'') as summary " +
    " ,isnull(IHP_Sul.Total,0) as total_pembayaran " +

    " FROM IHP_Room " +
    " Left Join IHP_Ivc on IHP_Room.Reception=IHP_Ivc.Reception" +
    " and IHP_Room.Kamar=IHP_Ivc.Kamar" +

    " Left Join IHP_RoomCheckin on IHP_Room.Kamar=IHP_RoomCheckin.Kamar" +
    " and IHP_Room.Kamar=IHP_RoomCheckin.Kamar" +

    " Left Join IHP_Sul on IHP_RoomCheckin.Reception=IHP_Sul.Reception" +
    " and IHP_Room.Kamar=IHP_Sul.Kamar";


exports.submitCheckInRoomViaFo = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    _procCheckInRoomViaFo(req, res);
};

async function _procCheckInRoomViaFo(req, res) {
    try {
        var roomCode = req.body.room;
        var kode_member = req.body.nama_tamu;
        var member = req.body.member;
        var durasiJam = req.body.durasi_jam;
        var durasiJam1 = parseInt(durasiJam);
        var durasimenit = req.body.durasi_menit;
        var durasimenit1 = parseInt(durasimenit);
        var jumlahTamu = req.body.jumlah_tamu;
        var jumlahTamu1 = parseInt(jumlahTamu);
        var totalDurasiCekinMenit = (durasiJam1 * 60) + durasimenit1;
        var dateTambahan = "DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())";
        var QM1a = req.body.qm1;
        var QM1b = parseInt(QM1a);
        var QM2a = req.body.qm2;
        var QM2b = parseInt(QM2a);
        var QM3a = req.body.qm3;
        var QM3b = parseInt(QM3a);
        var QM4a = req.body.qm4;
        var QM4b = parseInt(QM4a);
        var QF1a = req.body.qf1;
        var QF1b = parseInt(QF1a);
        var QF2a = req.body.qf2;
        var QF2b = parseInt(QF2a);
        var QF3a = req.body.qf3;
        var QF3b = parseInt(QF3a);
        var QF4a = req.body.qf4;
        var QF4b = parseInt(QF4a);


        var roomQuery = " " +
            " SELECT" +
            " Kamar, " +
            " Jenis_Kamar, " +
            " Kapasitas, " +
            " Status_Checkin," +
            " Keterangan_Connect, " +
            " isnull(Reception,'') AS Reception, " +
            " isnull(Nama_Tamu,'') AS Nama_Tamu, " +
            " DATEDIFF(mi, Jam_Checkin, Jam_Checkout) AS durasi_checkin, " +
            " Jam_Checkin AS jam_checkin, " +
            " Jam_Checkout AS jam_checkout " +
            " FROM IHP_Room" +
            " WHERE " +
            " Reception IS NULL" +
            //" AND Keterangan_Connect=4  " +
            " AND Kamar='" + roomCode + "' " +
            " AND Jenis_Kamar<>'LOBBY' order by Kamar asc ";
        //" AND Jenis_Kamar<>'LOBBY' order by Jam_Checkout desc ";

        var insert_ihp_pda = " " +
            " INSERT INTO [IHP_PDA] " +
            " ([Kamar] " +
            " ,[Nama] " +
            " ,[Member] " +
            " ,[Pax] " +
            " ,[Jam_Checkin] " +
            " ,[Jam_Checkout] " +
            " ,[Jam_Sewa] " +
            " ,[Menit_Sewa] " +
            " ,[Status] " +
            " ,[Reception] " +
            " ,[QM1] " +
            " ,[QM2] " +
            " ,[QM3] " +
            " ,[QM4] " +
            " ,[QF1] " +
            " ,[QF2] " +
            " ,[QF3] " +
            " ,[QF4]) " +
            " VALUES " +
            " ('" + roomCode + "'," +
            "   '" + kode_member + "'," +
            "   '" + member + "'," +
            "   '" + jumlahTamu1 + "'," +
            "   GETDATE()," +
            "   DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())," +
            "   '" + durasiJam1 + "'," +
            "   '" + durasimenit1 + "'," +
            "   '0'," +
            "   ' '," +
            "   " + QM1b + "," +
            "   " + QM2b + "," +
            "   " + QM3b + "," +
            "   " + QM4b + "," +
            "   " + QF1b + "," +
            "   " + QF2b + "," +
            "   " + QF3b + "," +
            "   " + QF4b +
            "   )";
        var UpdateIhpRoomQuery = " " +
            " update IHP_Room set Nama_Tamu='" + kode_member + "', " +
            " Status_Checkin=1, " +
            " Jumlah_Tamu=" + jumlahTamu1 + ", " +
            " Keterangan_Connect=2, " +
            " Jam_Checkin=GETDATE() ," +
            " Jam_Masuk=GETDATE(), " +
            //" Jam_Checkout= DATEADD(minute," + totalDurasiCekinMenit + ",GETDATE())" +
            " Jam_Checkout=DATEADD(minute,10,GETDATE())" +
            " Where Kamar='" + roomCode + "'";
        await new CheckinProses().prosesQuery(db, insert_ihp_pda);
        await new CheckinProses().prosesQuery(db, UpdateIhpRoomQuery);
        db.request().query(roomQuery, function (err, dataReturn) {
            if (err) {
                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {

                if (dataReturn.recordset.length > 0) {
                    dataResponse = new ResponseFormat(true, dataReturn.recordset);
                    res.send(dataResponse);
                } else {
                    dataResponse = new ResponseFormat(false, null, "Data Kosong");
                    res.send(dataResponse);
                }
            }
        });

    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }

}

function initInvoice() {
    formDataGetToClient = [];
    hasilReceptionInvoiceDetail = [];
    hasilOrderPenjualan = [];
    hasilOrderCancelation = [];
    hasilPromoRcp = [];
    hasilPromoRcpRoom = [];
    hasilSulSud = [];
    hasilPromoRcpFood = [];
    hasilSlipOrderStatus = [];
    hasilTarifPerjamHargaKamar = [];
    hasilExtend = [];

    ringkasan_total_all = parseFloat(0);
    ringkasan_total_kamar = parseFloat(0);
    ringkasan_total_penjualan = parseFloat(0);
    ringkasan_cancelation_penjualan = parseFloat(0);
    ringkasan_diskon_member_penjualan = parseFloat(0);
    ringkasan_extend_kamar = parseFloat(0);
    ringkasan_surcharge_kamar = parseFloat(0);
    ringkasan_overpax_kamar = parseFloat(0);
    ringkasan_diskon_member_kamar = parseFloat(0);
    ringkasan_service = parseFloat(0);
    ringkasan_pajak = parseFloat(0);
    normal_uang_muka = parseFloat(0);
    normal_nilai_gift_voucher = parseFloat(0);
    normal_gift_voucher = parseFloat(0);
    ringkasan_sewa_kamar = parseFloat(0);
    ringkasan_penjualan = parseFloat(0);

    normal_total_all = parseFloat(0);
    normal_total_kamar = parseFloat(0);
    normal_total_penjualan = parseFloat(0);
    normal_cancelation_penjualan = parseFloat(0);
    normal_diskon_member_penjualan = parseFloat(0);
    normal_extend_kamar = parseFloat(0);
    normal_surcharge_kamar = parseFloat(0);
    normal_overpax_kamar = parseFloat(0);
    normal_diskon_member_kamar = parseFloat(0);
    normal_service = parseFloat(0);
    normal_pajak = parseFloat(0);
    normal_sewa_kamar = parseFloat(0);
    normal_penjualan = parseFloat(0);
    normal_total_kamar_penjualan_sebelum_service = parseFloat(0);
    normal_total_final = parseFloat(0);
    var normal_sewa_kamar_sebelum_service = parseFloat(0);
    var normal_penjualan_sebelum_service = parseFloat(0);

    transfer_total_all = parseFloat(0);
    transfer_total_kamar = parseFloat(0);
    transfer_total_penjualan = parseFloat(0);
    transfer_cancelation_penjualan = parseFloat(0);
    transfer_diskon_member_penjualan = parseFloat(0);
    transfer_extend_kamar = parseFloat(0);
    transfer_surcharge_kamar = parseFloat(0);
    transfer_overpax_kamar = parseFloat(0);
    transfer_diskon_member_kamar = parseFloat(0);
    transfer_service = parseFloat(0);
    transfer_pajak = parseFloat(0);
    transfer_sewa_kamar = parseFloat(0);
    transfer_penjualan = parseFloat(0);
    normal_gift_voucher = false;
    normal_voucher = parseFloat(0);
    var ringkasan_sub_sub_total = parseFloat(0);
    var ringkasan_sub_total = parseFloat(0);
    sign_path_ = '';

    query_ihp_ivc_kamar_transfer = "" +
        " select " +

        " IHP_Rcp.[DATE] as date" +
        " ,IHP_Rcp.[Kamar] as kamar" +
        " ,IHP_Ivc.Jenis_Kamar as jenis_kamar" +
        " ,IHP_Rcp.[SHIFT]as shift" +
        " ,IHP_Rcp.[Member] as kode_member" +
        " ,IHP_Rcp.[Nama] as nama_member" +
        " ,IHP_Rcp.[Checkin] as checkin" +
        " ,IHP_Rcp.[Jam_Sewa] as jam_sewa" +
        " ,IHP_Rcp.[Menit_Sewa] as menit_sewa" +
        " ,IHP_Rcp.[Checkout] as checkout" +
        " ,IHP_Rcp.Checkin as jam_checkin " +
        " ,IHP_Rcp.Checkout as jam_checkout " +
        " ,IHP_Rcp.[QM1] as qm1" +
        " ,IHP_Rcp.[QM2] as qm2" +
        " ,IHP_Rcp.[QM3] as qm3" +
        " ,IHP_Rcp.[QM4] as qm4" +
        " ,IHP_Rcp.[QF1] as qf1" +
        " ,IHP_Rcp.[QF2] as qf2" +
        " ,IHP_Rcp.[QF3] as qf3" +
        " ,IHP_Rcp.[QF4] as qf4" +
        " ,IHP_Rcp.[PAX] as pax" +
        " ,IHP_Rcp.[Keterangan] as hp" +
        " ,IHP_Rcp.[Chtime] chtime" +
        " ,IHP_Rcp.[Chusr] as chusr" +
        " ,IHP_Rcp.[MBL] as malam_besok_libur" +
        " ,IHP_Rcp.[Surcharge] as surcharge" +
        " ,IHP_Rcp.[Reservation] as reservation" +
        " ,IHP_Rcp.[Invoice] as invoice" +
        " ,IHP_Rcp.[Summary] as summary" +
        " ,IHP_Rcp.[KMS] as Keterangan" +
        " ,IHP_Rcp.[Date_Trans] as date_trans" +
        " ,IHP_Rcp.[Status_Promo] as status_promo" +

        " ,case when IHP_Rcp.[Status_Promo]=1  then 'NORMAL DISKON MEMBER'" +
        " when IHP_Rcp.[Status_Promo]=2  then 'PROMOSI NON MEMBER'" +
        " when IHP_Rcp.[Status_Promo]=3  then 'PROMOSI + DISKON MEMBER' end" +
        " as keterangan_status_promo" +

        " ,IHP_Rcp.[Id_Payment] as id_payment_uang_muka" +

        " ,case when IHP_Rcp.[Id_Payment]=0  then 'CASH'" +
        " when IHP_Rcp.[Id_Payment]=1 then 'CREDIT'" +
        " when IHP_Rcp.[Id_Payment]=2  then 'DEBET' end" +
        " as keterangan_payment_uang_muka" +

        ",Round(IHP_Ivc.[Sewa_Kamar],0) as sewa_kamar" +
        ",Round(IHP_Ivc.[Total_Extend],0) as total_extend" +
        ",Round(IHP_Ivc.[Overpax],0) as overpax" +
        ",Round(IHP_Ivc.[Discount_Kamar],0) as discount_kamar" +
        ",Round(IHP_Ivc.[Surcharge_Kamar],0) as surcharge_kamar" +
        ",Round(IHP_Ivc.[Service_Kamar],0) as service_kamar" +
        ",Round(IHP_Ivc.[Tax_Kamar],0) as tax_kamar" +
        ",Round(IHP_Ivc.[Total_Kamar],0) as total_kamar" +
        ",Round(IHP_Ivc.[Charge_Penjualan],0) as charge_penjualan" +
        ",Round(IHP_Ivc.[Total_Cancelation],0) as total_cancelation" +
        ",Round(IHP_Ivc.[Discount_Penjualan],0)  as discount_penjualan" +
        ",Round(IHP_Ivc.[Service_Penjualan],0) service_penjualan" +
        ",Round(IHP_Ivc.[Tax_Penjualan],0) tax_penjualan" +
        ",Round(IHP_Ivc.[Total_Penjualan],0) as total_penjualan" +
        ",Round(IHP_Ivc.[Charge_Lain],0) as charge_lain" +
        ",Round(IHP_Ivc.[Uang_Muka],0) as uang_muka" +
        ",Round(IHP_Ivc.[Uang_Voucher],0) as uang_voucher" +
        ",Round(IHP_Ivc.[Total_All],0) as total_all" +

        ",IHP_Ivc.[Transfer] as invoice_transfer" +
        " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +
        ",IHP_Ivc.[Printed] as status_tagihan_tercetak" +

        " from " +
        " IHP_Rcp," +
        " IHP_Ivc" +
        " where " +
        " IHP_Ivc.Kamar=IHP_Rcp.Kamar" +
        " And IHP_Ivc.Reception=IHP_Rcp.Reception";

    query_ihp_ivc_rcp = "" +
        " select " +

        " IHP_Room.Kamar as kamar" +
        " ,IHP_Room.Jenis_Kamar as jenis_kamar" +
        " ,IHP_Room.Kapasitas as kapasitas" +
        " ,isnull(IHP_Room.Jumlah_Tamu,0) as jumlah_tamu" +
        " ,IHP_Room.Status_Checkin as status_checkin " +
        " ,IHP_Room.Nama_Tamu_Alias as event_owner " +

        " ,case when IHP_Room.Keterangan_Connect=2  then '0'" +
        " when IHP_Room.Keterangan_Connect=1  then '1'" +
        " when IHP_Room.Keterangan_Connect=4  then '1' end" +
        " as status_checkout" +

        " ,case when IHP_Room.Keterangan_Connect=4 " +
        " and IHP_Room.Status_Checkin=1  " +
        " and IHP_Room.Status_10=1  " +
        " and IHP_Room.Nama_Tamu='TESKAMAR' " +
        " and IHP_Room.Reception is null " +
        " then '1'" +
        " else '0' end" +
        " as status_checksound" +

        " ,case when IHP_Sul.Summary is not null  then '1'" +
        " else  '0' end" +
        " as status_terbayar" +

        " ,IHP_Room.Status_10 as status_10_menit " +
        " ,isnull(IHP_Ivc.Printed,'0') as status_tagihan_tercetak " +

        " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
        " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
        " AND IHP_Room.Jenis_Kamar<>'BAR' " +
        " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
        " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
        " AND IHP_Room.Reception is null " +
        " AND IHP_Room.Nama_Tamu is null " +
        " AND IHP_Room.Status_Checkin=0 " +
        " AND IHP_Room.Keterangan_Connect=2 " +
        " then '1'" +
        " else  '0' end" +
        " as status_kamar_ready_untuk_checkin" +

        " ,IHP_Room.Service_Kamar as call_service_kamar " +
        " ,IHP_Room.Keterangan_Connect as keterangan_connect " +

        " ,case when IHP_Room.Jenis_Kamar<>'LOBBY' " +
        " AND IHP_Room.Jenis_Kamar<>'LOBBY' " +
        " AND IHP_Room.Jenis_Kamar<>'BAR' " +
        " AND IHP_Room.Jenis_Kamar<>'LOUNGE' " +
        " AND IHP_Room.Jenis_Kamar<>'RESTO' " +
        " then CAST(1 AS BIT)" +
        " else  CAST(0 AS BIT) end" +
        " as kamar_untuk_checkin" +

        " ,isnull(IHP_Rcp.Reception,'') as reception " +
        " ,IHP_Rcp.[Nama] as nama_member " +
        " ,IHP_Room.IP_Address as ip_address" +

        " ,DATEDIFF(mi, IHP_Room.Jam_Checkin, IHP_Room.Jam_Checkout) as durasi_checkin " +
        " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout) as sisa_checkin " +
        " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)/60 as sisa_jam_checkin" +
        " ,DATEDIFF(mi, getdate(), IHP_Room.Jam_Checkout)%60 as sisa_menit_checkin" +
        " ,Isnull(IHP_Room.Keterangan_Tamu,'') as keterangan_tamu" +
        " ,IHP_Rcp.Checkin as jam_checkin " +
        " ,IHP_Rcp.Checkout as jam_checkout " +

        " ,IHP_Rcp.[DATE] as date" +
        " ,IHP_Rcp.[SHIFT]as shift" +
        " ,IHP_Rcp.[Member] as kode_member" +
        " ,IHP_Rcp.[Checkin] as checkin" +
        " ,IHP_Rcp.[Jam_Sewa] as jam_sewa" +
        " ,IHP_Rcp.[Menit_Sewa] as menit_sewa" +
        " ,IHP_Rcp.[Checkout] as checkout" +
        " ,IHP_Rcp.[QM1] as qm1" +
        " ,IHP_Rcp.[QM2] as qm2" +
        " ,IHP_Rcp.[QM3] as qm3" +
        " ,IHP_Rcp.[QM4] as qm4" +
        " ,IHP_Rcp.[QF1] as qf1" +
        " ,IHP_Rcp.[QF2] as qf2" +
        " ,IHP_Rcp.[QF3] as qf3" +
        " ,IHP_Rcp.[QF4] as qf4" +
        " ,IHP_Rcp.[PAX] as pax" +
        " ,IHP_Rcp.[Keterangan] as hp" +
        " ,IHP_Rcp.[Chtime] chtime" +
        " ,IHP_Rcp.[Chusr] as chusr" +
        " ,IHP_Rcp.[MBL] as malam_besok_libur" +
        " ,IHP_Rcp.[Surcharge] as surcharge" +
        " ,IHP_Rcp.[Reservation] as reservation" +
        " ,IHP_Rcp.[Invoice] as invoice" +
        " ,IHP_Rcp.[Summary] as summary" +
        " ,IHP_Rcp.[KMS] as keterangan" +
        " ,IHP_Rcp.[Date_Trans] as date_trans" +
        " ,IHP_Rcp.[Status_Promo] as status_promo" +
        " ,IHP_Rcp.[Sign] as sign" +
        " ,isnull(IHP_Rcp.[Member_Rev],'') as member_ref" +

        " ,case when IHP_Rcp.[Status_Promo]=1  then 'NORMAL DISKON MEMBER'" +
        " when IHP_Rcp.[Status_Promo]=2  then 'PROMOSI NON MEMBER'" +
        " when IHP_Rcp.[Status_Promo]=3  then 'PROMOSI + DISKON MEMBER' end" +
        " as keterangan_status_promo" +

        " ,IHP_Rcp.[Id_Payment] as id_payment_uang_muka" +

        " ,case when IHP_Rcp.[Id_Payment]=0  then 'CASH'" +
        " when IHP_Rcp.[Id_Payment]=1 then 'CREDIT'" +
        " when IHP_Rcp.[Id_Payment]=2  then 'DEBET'" +
        " when IHP_Rcp.[Id_Payment]=32  then 'TRANSFER' end" +
        " as keterangan_payment_uang_muka" +

        ",Round(IHP_Ivc.[Sewa_Kamar],0) as sewa_kamar" +
        ",Round(IHP_Ivc.[Total_Extend],0) as total_extend" +
        ",Round(IHP_Ivc.[Overpax],0) as overpax" +
        ",Round(IHP_Ivc.[Discount_Kamar],0) as discount_kamar" +
        ",Round(IHP_Ivc.[Surcharge_Kamar],0) as surcharge_kamar" +
        ",Round(IHP_Ivc.[Service_Kamar],0) as service_kamar" +
        ",Round(IHP_Ivc.[Tax_Kamar],0) as tax_kamar" +
        ",Round(IHP_Ivc.[Total_Kamar],0) as total_kamar" +
        ",Round(IHP_Ivc.[Charge_Penjualan],0) as charge_penjualan" +
        ",Round(IHP_Ivc.[Total_Cancelation],0) as total_cancelation" +
        ",Round(IHP_Ivc.[Discount_Penjualan],0)  as discount_penjualan" +
        ",Round(IHP_Ivc.[Service_Penjualan],0) service_penjualan" +
        ",Round(IHP_Ivc.[Tax_Penjualan],0) tax_penjualan" +
        ",Round(IHP_Ivc.[Total_Penjualan],0) as total_penjualan" +
        ",Round(IHP_Ivc.[Charge_Lain],0) as charge_lain" +
        ",Round(IHP_Ivc.[Uang_Muka],0) as uang_muka" +
        ",Round(IHP_Ivc.[Uang_Voucher],0) as uang_voucher" +
        ",Round(IHP_Ivc.[Total_All],0) as total_all" +

        ",IHP_Ivc.[Transfer] as invoice_transfer" +
        " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +
        //",IHP_Ivc.[Printed] as status_tagihan_tercetak" +
        ",isnull(IHP_UangMukaNonCash.[Nama_Payment],'') as nama_payment_uang_muka" +
        ",isnull(IHP_UangMukaNonCash.[Input1],'') as input1_jenis_kartu" +
        ",isnull(IHP_UangMukaNonCash.[Input2],'') as input2_nama" +
        ",isnull(IHP_UangMukaNonCash.[Input3],'') as input3_nomor_kartu" +
        ",isnull(IHP_UangMukaNonCash.[Input3],'') as input4_nomor_approval" +
        ",isnull(IHP_UangMukaNonCash.[Pay_Value],0) as pay_value_uang_muka" +
        ",isnull(IHP_UangMukaNonCash.[EDC_Machine],'') as edc_machine_" +
        ",isnull([IHP_EDC].[NamaMesin],'') as edc_machine" +

        ",isnull(IHP_UangVoucher.[Voucher],'') as voucher" +
        ",isnull(IHP_UangVoucher.[Pay_Value],'') as pay_value_voucher" +

        ",isnull(IHP_Vcr.[Jenis_Voucher],'') as jenis_voucher" +
        ",cast(isnull(IHP_Vcr.[Jenis_Voucher],0) as bit) as gift_voucher";
}


exports.getCheckinHistory = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var roomCode = req.params.room;
    var invoiceSelected = '';
    var listIvcRcp = [];
    var reception = req.params.reception;
    let _orderInventoryService = new OrderInventoryService(logger);
    //TODO :: main getCheckinHistory
    initInvoice();
    getInvoice(roomCode, reception)
        .then(ivc => {
            invoiceSelected = ivc.data[0].Invoice;
            var statusTransfer = ivc.data[0].Status;
            return getReceptionInvoiceDetailHistory(invoiceSelected, statusTransfer);
        })
        .then(rcpIvc => {
            listIvcRcp = rcpIvc;
            var getOrderPenjualan_ = _orderInventoryService.getOrderPenjualan(invoiceSelected);
            var getOrderCancelation_ = _orderInventoryService.getOrderCancelation(invoiceSelected);
            var getSlipOrderStatus_ = _orderInventoryService.getSlipOrderStatus(invoiceSelected);
            var getTarifPerjamHargaKamar_ = getTarifPerjamHargaKamarFunc(invoiceSelected);
            var getExtendRoom_ = getExtendRoom(invoiceSelected);
            var getPromoRcpRoom_ = getPromoRcpRoom(invoiceSelected);
            var getPromoRcpFood_ = getPromoRcpFood(invoiceSelected);
            var getSulSud_ = getSulSud(invoiceSelected);

            return Promise.all([
                getOrderPenjualan_,
                getOrderCancelation_,
                getSlipOrderStatus_,
                getTarifPerjamHargaKamar_,
                getExtendRoom_,
                getPromoRcpRoom_,
                getPromoRcpFood_,
                getSulSud_
            ]);

        })
        .then(data => {

            var eOrderPenjualan = data[0];
            var eOrderCancelation = data[1];
            var eSlipOrderStatus = data[2];
            var eTarifPerjamHargaKamar = data[3];
            var eExtendRoom = data[4];
            var ePromoRcpRoom = data[5];
            var ePromoRcpFood = data[6];
            var eSulSud = data[7];

            let roomOrder = {
                room: roomCode,
                //sign_path: sign_path_,
                order_room: listIvcRcp,
                order_room_extend: eExtendRoom,
                order_room_price: eTarifPerjamHargaKamar,
                order_inventory: eOrderPenjualan,
                order_inventory_cancelation: eOrderCancelation,
                order_inventory_progress: eSlipOrderStatus,
                order_promo_room: ePromoRcpRoom,
                order_promo_food: ePromoRcpFood,
                order_room_payment: eSulSud,
                invoice: invoice
            };
            res.send(new ResponseFormat(true, roomOrder));
        })
        .catch((err) => {
            logger.error(err);
            res.send(new ResponseFormat(false, null, err.stack));
        });

};

exports.getCheckinResult = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    let roomCode = req.params.room;
    let invoiceSelected = '';
    let listIvcRcp = [];
    let _orderInventoryService = new OrderInventoryService(logger);

    //TODO :: main getCheckinResult
    initInvoice();
    getReception(roomCode)
        .then(rcp => {
            return getInvoice(roomCode, rcp);
        })
        .then(ivc => {
            invoiceSelected = ivc.data[0].Invoice;
            var statusTransfer = ivc.data[0].Status;
            return getReceptionInvoiceDetail(invoiceSelected, statusTransfer);
        })
        .then(rcpIvc => {
            listIvcRcp = rcpIvc;

            let getOrderPenjualan_ = _orderInventoryService.getOrderPenjualan(invoiceSelected);// TODO :: 04 Collect Order Penjualan
            let getOrderCancelation_ = _orderInventoryService.getOrderCancelation(invoiceSelected);//TODO :: 05 Collect Order Cancelation
            let getSlipOrderStatus_ = _orderInventoryService.getSlipOrderStatus(invoiceSelected);// TODO :: 07 Collect Slip Order Status
            let getTarifPerjamHargaKamar_ = getTarifPerjamHargaKamarFunc(invoiceSelected);
            let getExtendRoom_ = getExtendRoom(invoiceSelected);
            let getPromoRcpRoom_ = getPromoRcpRoom(invoiceSelected);
            let getPromoRcpFood_ = getPromoRcpFood(invoiceSelected);
            let getRcpTIme_ = getTimeRcp(invoiceSelected);

            return Promise.all([
                getOrderPenjualan_,
                getOrderCancelation_,
                getSlipOrderStatus_,
                getTarifPerjamHargaKamar_,
                getExtendRoom_,
                getPromoRcpRoom_,
                getPromoRcpFood_,
                getRcpTIme_
            ]);

        })
        .then(data => {

            let eOrderPenjualan = data[0];
            let eOrderCancelation = data[1];
            let eSlipOrderStatus = data[2];
            let eTarifPerjamHargaKamar = data[3];
            let eExtendRoom = data[4];
            let ePromoRcpRoom = data[5];
            let ePromoRcpFood = data[6];
            let time = data[7]
            let eTimeRcp = {
                checkin: time[0].Checkin,
                durasi: time[0].jam_sewa,
                checkout: time[0].Checkout
            };
            let summaryOrderInventory = _orderInventoryService.getSummaryOrderInventory(
                _orderInventoryService.getSummaryProgressOrderInventory(eOrderPenjualan),
                _orderInventoryService.getSummaryCancelOrderInventory(eOrderCancelation)
            );

            let roomOrder = {
                room: roomCode,
                checkin_room: listIvcRcp[0],
                order_room: listIvcRcp,
                order_room_extend: eExtendRoom,
                order_room_price: eTarifPerjamHargaKamar,
                summary_order_inventory: summaryOrderInventory,
                order_inventory: eOrderPenjualan,
                order_inventory_cancelation: eOrderCancelation,
                order_inventory_progress: eSlipOrderStatus,
                order_promo_room: ePromoRcpRoom,
                order_promo_food: ePromoRcpFood,
                invoice: invoice,
                time: eTimeRcp
            };

            res.send(new ResponseFormat(true, roomOrder));
        })
        .catch((err) => {
            logger.error(err);
            res.send(new ResponseFormat(false, null, err.stack));
        });

};

// TODO :: 01 Get Rcp by RoomCode
function getReception(roomCode) {
    return new Promise((resolve, reject) => {
        try {
            var isiQuery = " " +
                " select " +
                " isnull(IHP_Room.Reception,'') AS Reception " +
                " from IHP_Room " +
                " where Kamar = '" + roomCode + "' ";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    reject(err.message);
                } else {

                    if (dataReturn.recordset.length > 0) {
                        var reception = dataReturn.recordset[0].Reception;
                        resolve(reception);
                    }
                    else {
                        reject("Data Reception Not found");
                    }

                }
            });

        } catch (err) {
            console.log(err);
            logger.error(err.message);
            reject(err.message);
        }
    });
}

// TODO :: 02 Get Ivc by RoomCode
function getInvoice(roomCode, rcp) {
    return new Promise((resolve, reject) => {
        try {

            var isiQuery = " " +
                " select " +
                " IHP_Ivc.Invoice, " +
                " IHP_Ivc.Status " +
                " from IHP_Ivc " +
                " where Kamar = '" + roomCode + "' " +
                " and Reception='" + rcp + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    reject(err.message);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset);
                        resolve(dataResponse);
                    }
                    else {
                        reject("Data Invoice Not Found");
                    }
                }
            });

        } catch (err) {
            console.log(err);
            logger.error(err.message);
            reject(err.message);
        }
    });
}
// added 22 april 2022
function getTimeRcp(ivc) {
    return new Promise((resolve, reject) => {
        try {

            var isiQuery = `
            SELECT Reception, 
            RIGHT('0'+CAST(DATEPART(hour, Checkin) as varchar(2)),2) + ':' +
            RIGHT('0'+CAST(DATEPART(minute, Checkin)as varchar(2)),2) as Checkin
            ,(Jam_Sewa + ISNULL((SELECT SUM(Jam_Extend) FROM HP112.dbo.IHP_Ext WHERE Reception = (SELECT Reception FROM HP112.dbo.IHP_Rcp WHERE Invoice = '${ivc}')),0)) as jam_sewa
            ,isnull(
             RIGHT('0'+CAST(DATEPART(hour, (SELECT MAX(End_Extend) FROM HP112.dbo.IHP_Ext WHERE Reception = (SELECT Reception FROM HP112.dbo.IHP_Rcp WHERE Invoice = '${ivc}'))) as varchar(2)),2) + ':' +
             RIGHT('0'+CAST(DATEPART(minute, (SELECT MAX(End_Extend) FROM HP112.dbo.IHP_Ext WHERE Reception = (SELECT Reception FROM HP112.dbo.IHP_Rcp WHERE Invoice = '${ivc}')))as varchar(2)),2)
            ,RIGHT('0'+CAST(DATEPART(hour, Checkout) as varchar(2)),2) + ':' +
             RIGHT('0'+CAST(DATEPART(minute, Checkout)as varchar(2)),2)) as Checkout
             FROM hp112.dbo.IHP_Rcp
             WHERE Invoice = '${ivc}'`;

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    reject(err.message);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        resolve(dataReturn.recordset);
                    }
                    else {
                        reject("Data Reception Not Found");
                    }
                }
            });

        } catch (err) {
            console.log(err);
            logger.error(err.message);
            reject(err.message);
        }
    });
}

// TODO :: 03 Join Rcp Ivc always result
function getReceptionInvoiceDetail(ivc, statusTransfer) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;
            var statusKamarNormal = statusTransfer;
            var CekReceptionInvoiceQuery;

            if (statusKamarNormal == '1') {
                CekReceptionInvoiceQuery = " " +

                    query_ihp_ivc_rcp +

                    " from " +
                    " IHP_Room " +

                    " inner join IHP_Rcp" +
                    " on IHP_Room.Reception=IHP_Rcp.Reception " +
                    " And IHP_Room.Kamar=IHP_Rcp.Kamar" +

                    " inner join IHP_Ivc" +
                    " on IHP_Ivc.Reception=IHP_Rcp.Reception " +
                    " And IHP_Room.Kamar=IHP_Ivc.Kamar" +
                    " And IHP_Ivc.Invoice='" + ivc2 + "'" +

                    " inner join IHP_RoomCheckin" +
                    " on IHP_Rcp.Reception=IHP_RoomCheckin.Reception " +
                    " And IHP_Room.Kamar=IHP_RoomCheckin.Kamar" +

                    " left join IHP_UangMukaNonCash" +
                    " on IHP_Rcp.Reception=IHP_UangMukaNonCash.Reception " +

                    " left join [IHP_EDC]" +
                    " on [IHP_EDC].[No]=[IHP_UangMukaNonCash].[EDC_Machine] " +

                    " left join IHP_UangVoucher" +
                    " on IHP_Rcp.Reception=IHP_UangVoucher.Reception " +

                    " left join IHP_Vcr" +
                    " on IHP_Vcr.Voucher=IHP_UangVoucher.Voucher " +

                    " Left Join IHP_Sul on IHP_RoomCheckin.Reception=IHP_Sul.Reception" +
                    " and IHP_Room.Kamar=IHP_Sul.Kamar";

            }
            else if (statusKamarNormal == '0') {
                CekReceptionInvoiceQuery = " " +
                    query_ihp_ivc_kamar_transfer +
                    " and IHP_Ivc.Invoice='" + ivc2 + "'";
            }

            db.request().query(CekReceptionInvoiceQuery, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message);
                    reject(err.message);
                } else {
                    var dataResponse = dataReturn.recordset;
                    if (dataReturn.recordset.length > 0) {
                        var status_bukan_kamar_transfer_ = dataResponse[0].not_room_transfer;
                        var invoiceTransfer = dataResponse[0].invoice_transfer;
                        hasilReceptionInvoiceDetail.push(dataResponse[0]);

                        //jika mempunyai kamar transfer / kolom invoice transfer terisi
                        if (dataResponse[0].invoice_transfer != "") {
                            var statusKamarTransfer = "0";

                            ringkasan_total_all = ringkasan_total_all + dataResponse[0].total_all;
                            ringkasan_total_kamar = ringkasan_total_kamar + dataResponse[0].total_kamar;
                            ringkasan_total_penjualan = ringkasan_total_penjualan + dataResponse[0].total_penjualan;
                            ringkasan_cancelation_penjualan = ringkasan_cancelation_penjualan + dataResponse[0].total_cancelation;
                            ringkasan_diskon_member_penjualan = ringkasan_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                            ringkasan_extend_kamar = ringkasan_extend_kamar + dataResponse[0].total_extend;
                            ringkasan_surcharge_kamar = ringkasan_surcharge_kamar + dataResponse[0].surcharge_kamar;
                            ringkasan_overpax_kamar = ringkasan_overpax_kamar + dataResponse[0].overpax;
                            ringkasan_diskon_member_kamar = ringkasan_diskon_member_kamar + dataResponse[0].discount_kamar;
                            ringkasan_service = ringkasan_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                            ringkasan_pajak = ringkasan_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                            ringkasan_sewa_kamar = ringkasan_sewa_kamar + dataResponse[0].sewa_kamar;
                            ringkasan_penjualan = ringkasan_penjualan + dataResponse[0].charge_penjualan;

                            if (status_bukan_kamar_transfer_ == false) {
                                //kamar transfer
                                transfer_total_all = transfer_total_all + dataResponse[0].total_all;
                                transfer_total_kamar = transfer_total_kamar + dataResponse[0].total_kamar;
                                transfer_total_penjualan = transfer_total_penjualan + dataResponse[0].total_penjualan;
                                transfer_cancelation_penjualan = transfer_cancelation_penjualan + dataResponse[0].total_cancelation;
                                transfer_diskon_member_penjualan = transfer_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                                transfer_extend_kamar = transfer_extend_kamar + dataResponse[0].total_extend;
                                transfer_surcharge_kamar = transfer_surcharge_kamar + dataResponse[0].surcharge_kamar;
                                transfer_overpax_kamar = transfer_overpax_kamar + dataResponse[0].overpax;
                                transfer_diskon_member_kamar = transfer_diskon_member_kamar + dataResponse[0].discount_kamar;
                                transfer_service = transfer_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                transfer_pajak = transfer_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                transfer_sewa_kamar = transfer_sewa_kamar + dataResponse[0].sewa_kamar;
                                transfer_penjualan = transfer_penjualan + dataResponse[0].charge_penjualan;

                            }
                            else if (status_bukan_kamar_transfer_ == true) {
                                //kamar normal kamar terakhir
                                if (dataResponse[0].jenis_voucher == 0) {
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].uang_voucher;
                                }
                                else if (dataResponse[0].jenis_voucher == 1) {
                                    normal_nilai_gift_voucher = dataResponse[0].pay_value_voucher;
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].pay_value_voucher;
                                }
                                normal_total_all = dataResponse[0].total_all;
                                normal_total_kamar = dataResponse[0].total_kamar;
                                normal_total_penjualan = dataResponse[0].total_penjualan;
                                normal_cancelation_penjualan = dataResponse[0].total_cancelation;
                                normal_diskon_member_penjualan = dataResponse[0].discount_penjualan;
                                normal_extend_kamar = dataResponse[0].total_extend;
                                normal_surcharge_kamar = dataResponse[0].surcharge_kamar;
                                normal_overpax_kamar = dataResponse[0].overpax;
                                normal_diskon_member_kamar = dataResponse[0].discount_kamar;
                                normal_service = dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                normal_pajak = dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                normal_sewa_kamar = dataResponse[0].sewa_kamar;
                                normal_penjualan = dataResponse[0].charge_penjualan;
                                normal_uang_muka = dataResponse[0].uang_muka;

                                normal_sewa_kamar_sebelum_service = dataResponse[0].sewa_kamar +
                                    dataResponse[0].total_extend +
                                    dataResponse[0].overpax +
                                    dataResponse[0].surcharge_kamar -
                                    dataResponse[0].discount_kamar;

                                normal_penjualan_sebelum_service = dataResponse[0].charge_penjualan -
                                    dataResponse[0].discount_penjualan -
                                    dataResponse[0].total_cancelation;

                                normal_total_kamar_penjualan_sebelum_service = normal_sewa_kamar_sebelum_service -
                                    dataResponse[0].uang_voucher +
                                    normal_penjualan_sebelum_service;
                            }
                            resolve(getReceptionInvoiceDetail(invoiceTransfer, statusKamarTransfer));
                        }
                        //jika tidak mempunyai kamar transfer pure kamar normal / kamar status 0
                        else {
                            ringkasan_total_all = ringkasan_total_all + dataResponse[0].total_all;
                            ringkasan_total_kamar = ringkasan_total_kamar + dataResponse[0].total_kamar;
                            ringkasan_total_penjualan = ringkasan_total_penjualan + dataResponse[0].total_penjualan;
                            ringkasan_cancelation_penjualan = ringkasan_cancelation_penjualan + dataResponse[0].total_cancelation;
                            ringkasan_diskon_member_penjualan = ringkasan_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                            ringkasan_extend_kamar = ringkasan_extend_kamar + dataResponse[0].total_extend;
                            ringkasan_surcharge_kamar = ringkasan_surcharge_kamar + dataResponse[0].surcharge_kamar;
                            ringkasan_overpax_kamar = ringkasan_overpax_kamar + dataResponse[0].overpax;
                            ringkasan_diskon_member_kamar = ringkasan_diskon_member_kamar + dataResponse[0].discount_kamar;
                            ringkasan_service = ringkasan_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                            ringkasan_pajak = ringkasan_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                            ringkasan_sewa_kamar = ringkasan_sewa_kamar + dataResponse[0].sewa_kamar;
                            ringkasan_penjualan = ringkasan_penjualan + dataResponse[0].charge_penjualan;

                            if (status_bukan_kamar_transfer_ == false) {
                                //kamar transfer kamar pertama
                                transfer_total_all = transfer_total_all + dataResponse[0].total_all;
                                transfer_total_kamar = transfer_total_kamar + dataResponse[0].total_kamar;
                                transfer_total_penjualan = transfer_total_penjualan + dataResponse[0].total_penjualan;
                                transfer_cancelation_penjualan = transfer_cancelation_penjualan + dataResponse[0].total_cancelation;
                                transfer_diskon_member_penjualan = transfer_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                                transfer_extend_kamar = transfer_extend_kamar + dataResponse[0].total_extend;
                                transfer_surcharge_kamar = transfer_surcharge_kamar + dataResponse[0].surcharge_kamar;
                                transfer_overpax_kamar = transfer_overpax_kamar + dataResponse[0].overpax;
                                transfer_diskon_member_kamar = transfer_diskon_member_kamar + dataResponse[0].discount_kamar;
                                transfer_service = transfer_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                transfer_pajak = transfer_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                transfer_sewa_kamar = transfer_sewa_kamar + dataResponse[0].sewa_kamar;
                                transfer_penjualan = transfer_penjualan + dataResponse[0].charge_penjualan;
                            }
                            else if (status_bukan_kamar_transfer_ == true) {
                                //kamar normal atau kamar tanpa transder
                                if (dataResponse[0].jenis_voucher == 0) {
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].uang_voucher;
                                }
                                else if (dataResponse[0].jenis_voucher == 1) {
                                    normal_nilai_gift_voucher = dataResponse[0].pay_value_voucher;
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].pay_value_voucher;
                                }
                                normal_total_all = dataResponse[0].total_all;
                                normal_total_kamar = dataResponse[0].total_kamar;
                                normal_total_penjualan = dataResponse[0].total_penjualan;
                                normal_cancelation_penjualan = dataResponse[0].total_cancelation;
                                normal_diskon_member_penjualan = dataResponse[0].discount_penjualan;
                                normal_extend_kamar = dataResponse[0].total_extend;
                                normal_surcharge_kamar = dataResponse[0].surcharge_kamar;
                                normal_overpax_kamar = dataResponse[0].overpax;
                                normal_diskon_member_kamar = dataResponse[0].discount_kamar;
                                normal_service = dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                normal_pajak = dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                normal_sewa_kamar = dataResponse[0].sewa_kamar;
                                normal_penjualan = dataResponse[0].charge_penjualan;
                                normal_uang_muka = dataResponse[0].uang_muka;

                                normal_sewa_kamar_sebelum_service = dataResponse[0].sewa_kamar +
                                    dataResponse[0].total_extend +
                                    dataResponse[0].overpax +
                                    dataResponse[0].surcharge_kamar -
                                    dataResponse[0].discount_kamar;

                                normal_penjualan_sebelum_service = dataResponse[0].charge_penjualan -
                                    dataResponse[0].discount_penjualan -
                                    dataResponse[0].total_cancelation;

                                normal_total_kamar_penjualan_sebelum_service = normal_sewa_kamar_sebelum_service -
                                    dataResponse[0].uang_voucher +
                                    normal_penjualan_sebelum_service;

                            }

                            normal_total_final = normal_total_kamar_penjualan_sebelum_service +
                                transfer_total_all +
                                normal_service + normal_pajak -
                                normal_nilai_gift_voucher -
                                normal_uang_muka;
                            sign_path_ = dataResponse[0].sign;

                            if (normal_nilai_gift_voucher == false) {
                                ringkasan_sub_sub_total =
                                    (ringkasan_sewa_kamar +
                                        ringkasan_extend_kamar +
                                        normal_surcharge_kamar +
                                        ringkasan_overpax_kamar +
                                        ringkasan_penjualan) -
                                    ringkasan_cancelation_penjualan -
                                    normal_voucher;
                            }
                            else {
                                ringkasan_sub_sub_total =
                                    (ringkasan_sewa_kamar +
                                        ringkasan_extend_kamar +
                                        normal_surcharge_kamar +
                                        ringkasan_overpax_kamar +
                                        ringkasan_penjualan) -
                                    ringkasan_cancelation_penjualan;
                            }
                            ringkasan_sub_total = ringkasan_sub_sub_total -
                                (ringkasan_diskon_member_kamar +
                                    ringkasan_diskon_member_penjualan);

                            if (normal_nilai_gift_voucher == true) {
                                ringkasan_total_all =
                                    (ringkasan_sub_total +
                                        ringkasan_service +
                                        ringkasan_pajak) -
                                    (normal_uang_muka +
                                        normal_voucher);
                            }
                            else {
                                ringkasan_total_all =
                                    (ringkasan_sub_total +
                                        ringkasan_service +
                                        ringkasan_pajak) -
                                    normal_uang_muka;
                            }


                            invoice = {
                                normal_sewa_kamar: normal_sewa_kamar_sebelum_service,
                                normal_voucher: normal_voucher,
                                normal_surcharge_kamar: normal_surcharge_kamar,
                                normal_penjualan: normal_penjualan_sebelum_service,
                                normal_total_kamar_penjualan_sebelum_service: normal_total_kamar_penjualan_sebelum_service,
                                normal_service: normal_service,
                                normal_pajak: normal_pajak,
                                normal_total_all: normal_total_all,
                                normal_uang_muka: normal_uang_muka,
                                normal_nilai_gift_voucher: normal_nilai_gift_voucher,
                                normal_gift_voucher: normal_gift_voucher,
                                normal_total_final: normal_total_final,
                                sign_path: dataResponse[0].sign,

                                ringkasan_sewa_kamar: ringkasan_sewa_kamar,
                                ringkasan_extend_kamar: ringkasan_extend_kamar,
                                ringkasan_overpax_kamar: ringkasan_overpax_kamar,
                                ringkasan_diskon_member_kamar: ringkasan_diskon_member_kamar,
                                ringkasan_surcharge_kamar: ringkasan_surcharge_kamar,
                                ringkasan_total_kamar: ringkasan_total_kamar,
                                ringkasan_penjualan: ringkasan_penjualan,
                                ringkasan_cancelation_penjualan: ringkasan_cancelation_penjualan,
                                ringkasan_diskon_member_penjualan: ringkasan_diskon_member_penjualan,
                                ringkasan_total_penjualan: ringkasan_total_penjualan,
                                ringkasan_service: ringkasan_service,
                                ringkasan_pajak: ringkasan_pajak,
                                ringkasan_total_all: ringkasan_total_all,
                                ringkasan_sub_sub_total: ringkasan_sub_sub_total,
                                ringkasan_sub_total: ringkasan_sub_total,

                                transfer_sewa_kamar: transfer_sewa_kamar,
                                transfer_extend_kamar: transfer_extend_kamar,
                                transfer_overpax_kamar: transfer_overpax_kamar,
                                transfer_surcharge_kamar: transfer_surcharge_kamar,
                                transfer_diskon_member_kamar: transfer_diskon_member_kamar,
                                transfer_total_kamar: transfer_total_kamar,
                                transfer_penjualan: transfer_penjualan,
                                transfer_cancelation_penjualan: transfer_cancelation_penjualan,
                                transfer_diskon_member_penjualan: transfer_diskon_member_penjualan,
                                transfer_total_penjualan: transfer_total_penjualan,
                                transfer_service: transfer_service,
                                transfer_pajak: transfer_pajak,
                                transfer_total_all: transfer_total_all


                                /* 

                                normal_total_all: normal_total_all,
                                normal_total_kamar: normal_total_kamar,
                                normal_total_penjualan: normal_total_penjualan,
                                normal_cancelation_penjualan: normal_cancelation_penjualan,
                                normal_diskon_member_penjualan: normal_diskon_member_penjualan,
                                normal_extend_kamar: normal_extend_kamar,
                                normal_surcharge_kamar: normal_surcharge_kamar,
                                normal_overpax_kamar: normal_overpax_kamar,
                                normal_diskon_member_kamar: normal_diskon_member_kamar,
                                normal_service: normal_service,
                                normal_pajak: normal_pajak,

                                normal_sewa_kamar: normal_sewa_kamar,
                                normal_penjualan: normal_penjualan,

                                normal_total_kamar_penjualan_sebelum_service: normal_total_kamar_penjualan_sebelum_service,
                                normal_total_final: normal_total_final,
                                normal_nilai_gift_voucher: normal_nilai_gift_voucher,
                                normal_voucher: normal_voucher,
                                normal_uang_muka: normal_uang_muka,
                                normal_gift_voucher: normal_gift_voucher,
                                normal_sewa_kamar_sebelum_service: normal_sewa_kamar_sebelum_service,
                                normal_penjualan_sebelum_service: normal_penjualan_sebelum_service,*/

                            };

                            resolve(hasilReceptionInvoiceDetail);
                        }
                    } else {
                        resolve(hasilReceptionInvoiceDetail);
                    }
                }
            });
        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}
// TODO :: 06 Collect Promo Rcp
function getPromoRcp(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var CekPromoRcpQuery = " " +
                " select " +
                "IHP_Promo_Rcp.[Reception] as reception" +
                ",IHP_Promo_Rcp.[Promo] as promo" +
                ",IHP_Promo_Rcp.[Start_Promo] as start_promo" +
                ",IHP_Promo_Rcp.[End_promo] as end_promo" +
                ",IHP_Promo_Rcp.[Status_Promo] as status_promo" +

                " ,case when IHP_Promo_Rcp.[Status_Promo]=1  then 'PROMO ROOM'" +
                " when IHP_Promo_Rcp.[Status_Promo]=2  then 'PROMO FNB' end" +
                " as keterangan_status_promo" +

                ",IHP_Promo_Rcp.[Syarat_Kamar] as syarat_kamar" +
                ",IHP_Promo_Rcp.[Kamar] as keterangan_syarat_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Jenis_kamar] as syarat_jenis_kamar" +
                ",IHP_Promo_Rcp.[Jenis_Kamar] as jenis_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Durasi] as syarat_durasi" +
                ",IHP_Promo_Rcp.[Durasi] as durasi" +
                ",IHP_Promo_Rcp.[Syarat_Hari] as syarat_hari" +
                ",IHP_Promo_Rcp.[Hari] as hari" +
                ",IHP_Promo_Rcp.[Syarat_Jam] as syarat_jam" +
                ",IHP_Promo_Rcp.[Date_Start] as date_start " +
                ",IHP_Promo_Rcp.[Time_Start] as time_start" +
                ",IHP_Promo_Rcp.[Date_Finish] as date_finish" +
                ",IHP_Promo_Rcp.[Time_Finish] as time_finish" +
                ",IHP_Promo_Rcp.[Syarat_Quantity] as syarat_quantity" +
                ",IHP_Promo_Rcp.[Quantity]  as quantity" +
                ",IHP_Promo_Rcp.[Diskon_Persen] as diskon_persen" +
                ",IHP_Promo_Rcp.[Diskon_Rp]  as diskon_rp" +
                ",IHP_Promo_Rcp.[Syarat_Inventory] as  syarat_inventory" +
                ",IHP_Promo_Rcp.[Inventory] as inventory" +
                ",IHP_Promo_Rcp.[Sign_Inventory] as sign_inventory" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Persen] as sign_diskon_persen" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Rp] as sign_diskon_rp" +
                ",IHP_Promo_Rcp.[FlagExtend] as flag_extend" +

                " ,IHP_Ivc.[kamar] as kamar" +
                " ,IHP_Ivc.[Invoice] as invoice" +
                " ,IHP_Ivc.[Transfer] as Invoice_Transfer" +
                " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +

                " from " +
                " IHP_Ivc" +
                " " +

                " left join IHP_Promo_Rcp" +
                " on IHP_Promo_Rcp.Reception=IHP_Ivc.Reception " +
                " where IHP_Ivc.Invoice='" + ivc2 + "'";

            db.request().query(CekPromoRcpQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                    reject(err.message);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {
                            if (data.reception != null) {
                                hasilPromoRcp.push(data);
                            }
                        }

                        if (dataReturn.recordset[0].Invoice_Transfer != "") {
                            var invoiceTransfer = dataReturn.recordset[0].Invoice_Transfer;
                            resolve(getPromoRcp(invoiceTransfer));
                        }
                        else {

                            resolve(hasilPromoRcp);
                        }

                    } else {

                        resolve(hasilPromoRcp);
                    }
                }
            });

        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}
//TODO :: 08 Collect Tarif Harga Kamar always result
function getTarifPerjamHargaKamarFunc(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var CekPromoRcpQuery = " " +
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
                " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +


                " from " +
                " IHP_Ivc" +
                " ,IHP_Rcp_DetailsRoom" +

                " where IHP_Ivc.Invoice='" + ivc2 + "'" +
                " and IHP_Ivc.Reception=IHP_Rcp_DetailsRoom.Reception";

            db.request().query(CekPromoRcpQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                    reject(err.message);
                } else {


                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {

                            hasilTarifPerjamHargaKamar.push(data);

                        }

                        if (dataReturn.recordset[0].invoice_transfer != "") {
                            var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
                            resolve(getTarifPerjamHargaKamarFunc(invoiceTransfer));
                        }
                        else {

                            resolve(hasilTarifPerjamHargaKamar);
                        }
                    } else {
                        resolve(hasilTarifPerjamHargaKamar);
                    }
                }
            });

        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}

//TODO :: 09 Collect Extend Room
function getExtendRoom(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var isiQuery = " " +
                " SELECT   [IHP_Ext].[Reception] as reception  " +
                " ,[IHP_Ext].[Tgl_Extend] as tanggal_extend  " +
                " ,[IHP_Ext].[Jam_Extend] as jam_extend  " +
                " ,[IHP_Ext].[Menit_Extend] as menit_extend  " +
                " ,[IHP_Ext].[Date_Trans] as date_trans  " +
                " ,IHP_Ivc.[kamar] as kamar" +
                " ,IHP_Ivc.[Jenis_Kamar] as jenis_kamar" +
                " ,IHP_Ivc.[Invoice] as invoice" +
                " ,IHP_Ivc.[Transfer] as invoice_transfer" +
                " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +
                " FROM " +
                " [IHP_Ivc]" +
                " left join [IHP_Ext]" +
                " on IHP_Ivc.Reception=[IHP_Ext].Reception " +
                " where " +
                " IHP_Ivc.Invoice='" + ivc2 + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                    reject(err.message);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {
                            if (data.reception != null) {
                                hasilExtend.push(data);
                            }

                        }

                        if (dataReturn.recordset[0].invoice_transfer != "") {
                            var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
                            resolve(getExtendRoom(invoiceTransfer));
                        }
                        else {

                            resolve(hasilExtend);
                        }
                    } else {
                        resolve(hasilExtend);
                    }
                }
            });


        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}

function getRoom(isiQuery) {
    return new Promise((resolve, reject) => {
        try {

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {

                    if (dataReturn.recordset.length > 0) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset);
                        resolve(dataResponse);
                    }
                    else {
                        resolve(false);
                    }

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

// TODO :: 10 Collect Promo Rcp Room
function getPromoRcpRoom(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var CekPromoRcpQuery = " " +
                " select " +
                "IHP_Promo_Rcp.[Reception] as reception" +
                ",IHP_Promo_Rcp.[Promo] as promo_room" +
                ",IHP_Promo_Rcp.[Start_Promo] as start_promo" +
                ",IHP_Promo_Rcp.[End_promo] as end_promo" +
                ",IHP_Promo_Rcp.[Status_Promo] as status_promo" +

                " ,case when IHP_Promo_Rcp.[Status_Promo]=1  then 'PROMO ROOM'" +
                " when IHP_Promo_Rcp.[Status_Promo]=2  then 'PROMO FNB' end" +
                " as keterangan_status_promo" +

                ",IHP_Promo_Rcp.[Syarat_Kamar] as syarat_kamar" +
                ",IHP_Promo_Rcp.[Kamar] as keterangan_syarat_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Jenis_kamar] as syarat_jenis_kamar" +
                ",IHP_Promo_Rcp.[Jenis_Kamar] as jenis_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Durasi] as syarat_durasi" +
                ",IHP_Promo_Rcp.[Durasi] as durasi" +
                ",IHP_Promo_Rcp.[Syarat_Hari] as syarat_hari" +
                ",IHP_Promo_Rcp.[Hari] as hari" +
                ",IHP_Promo_Rcp.[Syarat_Jam] as syarat_jam" +
                ",IHP_Promo_Rcp.[Date_Start] as date_start " +
                ",IHP_Promo_Rcp.[Time_Start] as time_start" +
                ",IHP_Promo_Rcp.[Date_Finish] as date_finish" +
                ",IHP_Promo_Rcp.[Time_Finish] as time_finish" +
                ",IHP_Promo_Rcp.[Syarat_Quantity] as syarat_quantity" +
                ",IHP_Promo_Rcp.[Quantity]  as quantity" +
                ",IHP_Promo_Rcp.[Diskon_Persen] as diskon_persen" +
                ",IHP_Promo_Rcp.[Diskon_Rp]  as diskon_rp" +
                ",IHP_Promo_Rcp.[Syarat_Inventory] as  syarat_inventory" +
                ",IHP_Promo_Rcp.[Inventory] as inventory" +
                ",IHP_Promo_Rcp.[Sign_Inventory] as sign_inventory" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Persen] as sign_diskon_persen" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Rp] as sign_diskon_rp" +
                ",IHP_Promo_Rcp.[FlagExtend] as flag_extend" +

                " ,IHP_Ivc.[kamar] as kamar" +
                " ,IHP_Ivc.[Invoice] as invoice" +
                " ,IHP_Ivc.[Transfer] as Invoice_Transfer" +
                " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +

                " from " +
                " IHP_Ivc" +
                " " +

                " left join IHP_Promo_Rcp" +
                " on IHP_Promo_Rcp.Reception=IHP_Ivc.Reception " +
                " and IHP_Promo_Rcp.Status_Promo=1 " +
                " where IHP_Ivc.Invoice='" + ivc2 + "'";

            db.request().query(CekPromoRcpQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                    reject(err.message);
                } else {


                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {
                            if (data.reception != null) {
                                hasilPromoRcpRoom.push(data);
                            }
                        }

                        if (dataReturn.recordset[0].Invoice_Transfer != "") {
                            var invoiceTransfer = dataReturn.recordset[0].Invoice_Transfer;
                            resolve(getPromoRcpRoom(invoiceTransfer));
                        }
                        else {

                            resolve(hasilPromoRcpRoom);
                        }

                    } else {

                        resolve(hasilPromoRcpRoom);
                    }
                }
            });

        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}

// TODO :: 11 Collect Promo Rcp Food
function getPromoRcpFood(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var CekPromoRcpQuery = " " +
                " select " +
                "IHP_Promo_Rcp.[Reception] as reception" +
                ",IHP_Promo_Rcp.[Promo] as promo_food" +
                ",IHP_Promo_Rcp.[Start_Promo] as start_promo" +
                ",IHP_Promo_Rcp.[End_promo] as end_promo" +
                ",IHP_Promo_Rcp.[Status_Promo] as status_promo" +

                " ,case when IHP_Promo_Rcp.[Status_Promo]=1  then 'PROMO ROOM'" +
                " when IHP_Promo_Rcp.[Status_Promo]=2  then 'PROMO FNB' end" +
                " as keterangan_status_promo" +

                ",IHP_Promo_Rcp.[Syarat_Kamar] as syarat_kamar" +
                ",IHP_Promo_Rcp.[Kamar] as keterangan_syarat_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Jenis_kamar] as syarat_jenis_kamar" +
                ",IHP_Promo_Rcp.[Jenis_Kamar] as jenis_kamar" +
                ",IHP_Promo_Rcp.[Syarat_Durasi] as syarat_durasi" +
                ",IHP_Promo_Rcp.[Durasi] as durasi" +
                ",IHP_Promo_Rcp.[Syarat_Hari] as syarat_hari" +
                ",IHP_Promo_Rcp.[Hari] as hari" +
                ",IHP_Promo_Rcp.[Syarat_Jam] as syarat_jam" +
                ",IHP_Promo_Rcp.[Date_Start] as date_start " +
                ",IHP_Promo_Rcp.[Time_Start] as time_start" +
                ",IHP_Promo_Rcp.[Date_Finish] as date_finish" +
                ",IHP_Promo_Rcp.[Time_Finish] as time_finish" +
                ",IHP_Promo_Rcp.[Syarat_Quantity] as syarat_quantity" +
                ",IHP_Promo_Rcp.[Quantity]  as quantity" +
                ",IHP_Promo_Rcp.[Diskon_Persen] as diskon_persen" +
                ",IHP_Promo_Rcp.[Diskon_Rp]  as diskon_rp" +
                ",IHP_Promo_Rcp.[Syarat_Inventory] as  syarat_inventory" +
                ",IHP_Promo_Rcp.[Inventory] as inventory" +
                ",IHP_Promo_Rcp.[Sign_Inventory] as sign_inventory" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Persen] as sign_diskon_persen" +
                ",IHP_Promo_Rcp.[Sign_Diskon_Rp] as sign_diskon_rp" +
                ",IHP_Promo_Rcp.[FlagExtend] as flag_extend" +

                " ,IHP_Ivc.[kamar] as kamar" +
                " ,IHP_Ivc.[Invoice] as invoice" +
                " ,IHP_Ivc.[Transfer] as Invoice_Transfer" +
                " ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer" +

                " from " +
                " IHP_Ivc" +
                " " +

                " left join IHP_Promo_Rcp" +
                " on IHP_Promo_Rcp.Reception=IHP_Ivc.Reception " +
                " and IHP_Promo_Rcp.Status_Promo=2 " +
                " where IHP_Ivc.Invoice='" + ivc2 + "'";

            db.request().query(CekPromoRcpQuery, function (err, dataReturn) {
                if (err) {

                    logger.error(err.message);
                    reject(err.message);
                } else {


                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {
                            if (data.reception != null) {
                                hasilPromoRcpFood.push(data);
                            }
                        }

                        if (dataReturn.recordset[0].Invoice_Transfer != "") {
                            var invoiceTransfer = dataReturn.recordset[0].Invoice_Transfer;
                            resolve(getPromoRcpFood(invoiceTransfer));
                        }
                        else {

                            resolve(hasilPromoRcpFood);
                        }

                    } else {

                        resolve(hasilPromoRcpFood);
                    }
                }
            });

        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}


// TODO :: 12 Collect pembayaran
function getSulSud(ivc) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;

            var SulSudQuery = " " +
                " select " +

                "[IHP_Sul].[Reception] as reception" +
                " ,[IHP_Sul].[Invoice] as invoice" +
                " ,[IHP_Sul].[Kamar] as kamar" +
                " ,[IHP_Sul].[Bayar] as bayar" +
                " ,[IHP_Sul].[Kembali] as kembali" +
                " ,[IHP_Sud].[Summary] as summary" +
                " ,[IHP_Sud].[ID_Payment] as id_payment" +
                " ,[IHP_Sud].[Nama_Payment] as payment_type" +
                " ,[IHP_Sud].[Member] as member" +
                " ,[IHP_Sud].[Nama] as nama" +
                " ,[IHP_Sud].[Input1] as bank_type" +
                " ,[IHP_Sud].[Input2] as bank_akun_name" +
                " ,[IHP_Sud].[Input3] as bank_akun_number" +
                " ,[IHP_Sud].[Input4] as bank_akun_approval" +
                " ,[IHP_Sud].[Pay_Value] as nominal" +
                " ,[IHP_Sud].[EDC_Machine] as edc_machine" +

                " from " +
                " IHP_Sul" +
                " " +

                " Inner join IHP_Sud" +
                " on IHP_Sul.Summary=IHP_Sud.Summary " +
                " where IHP_Sul.Invoice='" + ivc2 + "'";

            db.request().query(SulSudQuery, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message);
                    reject(err.message);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        for (const data of dataReturn.recordset) {
                            if (data.reception != null) {
                                hasilSulSud.push(data);
                                resolve(hasilSulSud);
                            }
                        }
                    } else {
                        resolve(hasilSulSud);
                    }
                }
            });
        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}

// TODO :: 03 Join Rcp Ivc always result
function getReceptionInvoiceDetailHistory(ivc, statusTransfer) {
    return new Promise((resolve, reject) => {
        try {
            var ivc2 = ivc;
            var statusKamarNormal = statusTransfer;
            var CekReceptionInvoiceQuery;

            if (statusKamarNormal == "1") {
                CekReceptionInvoiceQuery = " " +

                    query_ihp_ivc_rcp +

                    " FROM IHP_Ivc " +

                    " Inner Join IHP_Rcp on " +
                    " IHP_Ivc.Reception=IHP_Rcp.Reception " +
                    " and IHP_Ivc.Invoice=IHP_Rcp.Invoice " +
                    " and IHP_Ivc.Kamar=IHP_Rcp.Kamar " +
                    " And IHP_Ivc.Invoice='" + ivc2 + "'" +

                    " left join IHP_Room " +
                    " on IHP_Ivc.Kamar=IHP_Room.Kamar " +

                    " left join IHP_UangMukaNonCash" +
                    " on IHP_Rcp.Reception=IHP_UangMukaNonCash.Reception " +

                    " left join [IHP_EDC]" +
                    " on [IHP_EDC].[No]=[IHP_UangMukaNonCash].[EDC_Machine] " +

                    " left join IHP_UangVoucher" +
                    " on IHP_Rcp.Reception=IHP_UangVoucher.Reception " +

                    " left join IHP_Vcr" +
                    " on IHP_Vcr.Voucher=IHP_UangVoucher.Voucher " +

                    " Left Join IHP_Sul on IHP_Ivc.Reception=IHP_Sul.Reception" +
                    " and IHP_Ivc.Kamar=IHP_Sul.Kamar";

            }
            else if (statusKamarNormal == "0") {
                CekReceptionInvoiceQuery = " " +
                    query_ihp_ivc_kamar_transfer +
                    " and IHP_Ivc.Invoice='" + ivc2 + "'";
            }

            db.request().query(CekReceptionInvoiceQuery, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message);
                    reject(err.message);
                } else {
                    var dataResponse = dataReturn.recordset;
                    if (dataReturn.recordset.length > 0) {
                        var status_bukan_kamar_transfer_ = dataResponse[0].not_room_transfer;
                        var invoiceTransfer = dataResponse[0].invoice_transfer;
                        hasilReceptionInvoiceDetail.push(dataResponse[0]);

                        //jika mempunyai kamar transfer / invoice transfer ada isinya
                        if (dataResponse[0].invoice_transfer != "") {
                            var statusKamarTransfer = "0";

                            ringkasan_total_all = ringkasan_total_all + dataResponse[0].total_all;
                            ringkasan_total_kamar = ringkasan_total_kamar + dataResponse[0].total_kamar;
                            ringkasan_total_penjualan = ringkasan_total_penjualan + dataResponse[0].total_penjualan;
                            ringkasan_cancelation_penjualan = ringkasan_cancelation_penjualan + dataResponse[0].total_cancelation;
                            ringkasan_diskon_member_penjualan = ringkasan_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                            ringkasan_extend_kamar = ringkasan_extend_kamar + dataResponse[0].total_extend;
                            ringkasan_surcharge_kamar = ringkasan_surcharge_kamar + dataResponse[0].surcharge_kamar;
                            ringkasan_overpax_kamar = ringkasan_overpax_kamar + dataResponse[0].overpax;
                            ringkasan_diskon_member_kamar = ringkasan_diskon_member_kamar + dataResponse[0].discount_kamar;
                            ringkasan_service = ringkasan_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                            ringkasan_pajak = ringkasan_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                            ringkasan_sewa_kamar = ringkasan_sewa_kamar + dataResponse[0].sewa_kamar;
                            ringkasan_penjualan = ringkasan_penjualan + dataResponse[0].charge_penjualan;

                            if (status_bukan_kamar_transfer_ == false) {
                                //kamar transfer
                                transfer_total_all = transfer_total_all + dataResponse[0].total_all;
                                transfer_total_kamar = transfer_total_kamar + dataResponse[0].total_kamar;
                                transfer_total_penjualan = transfer_total_penjualan + dataResponse[0].total_penjualan;
                                transfer_cancelation_penjualan = transfer_cancelation_penjualan + dataResponse[0].total_cancelation;
                                transfer_diskon_member_penjualan = transfer_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                                transfer_extend_kamar = transfer_extend_kamar + dataResponse[0].total_extend;
                                transfer_surcharge_kamar = transfer_surcharge_kamar + dataResponse[0].surcharge_kamar;
                                transfer_overpax_kamar = transfer_overpax_kamar + dataResponse[0].overpax;
                                transfer_diskon_member_kamar = transfer_diskon_member_kamar + dataResponse[0].discount_kamar;
                                transfer_service = transfer_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                transfer_pajak = transfer_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                transfer_sewa_kamar = transfer_sewa_kamar + dataResponse[0].sewa_kamar;
                                transfer_penjualan = transfer_penjualan + dataResponse[0].charge_penjualan;

                            }
                            else if (status_bukan_kamar_transfer_ == true) {
                                //kamar normal / kamar terakhir
                                if (dataResponse[0].jenis_voucher == 0) {
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].uang_voucher;
                                }
                                else if (dataResponse[0].jenis_voucher == 1) {
                                    normal_nilai_gift_voucher = dataResponse[0].pay_value_voucher;
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].pay_value_voucher;
                                }
                                normal_total_all = dataResponse[0].total_all;
                                normal_total_kamar = dataResponse[0].total_kamar;
                                normal_total_penjualan = dataResponse[0].total_penjualan;
                                normal_cancelation_penjualan = dataResponse[0].total_cancelation;
                                normal_diskon_member_penjualan = dataResponse[0].discount_penjualan;
                                normal_extend_kamar = dataResponse[0].total_extend;
                                normal_surcharge_kamar = dataResponse[0].surcharge_kamar;
                                normal_overpax_kamar = dataResponse[0].overpax;
                                normal_diskon_member_kamar = dataResponse[0].discount_kamar;
                                normal_service = dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                normal_pajak = dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                normal_sewa_kamar = dataResponse[0].sewa_kamar;
                                normal_penjualan = dataResponse[0].charge_penjualan;
                                normal_uang_muka = dataResponse[0].uang_muka;

                                normal_sewa_kamar_sebelum_service = dataResponse[0].sewa_kamar +
                                    dataResponse[0].total_extend +
                                    dataResponse[0].overpax +
                                    dataResponse[0].surcharge_kamar -
                                    dataResponse[0].discount_kamar;

                                normal_penjualan_sebelum_service = dataResponse[0].charge_penjualan -
                                    dataResponse[0].discount_penjualan -
                                    dataResponse[0].total_cancelation;

                                normal_total_kamar_penjualan_sebelum_service = normal_sewa_kamar_sebelum_service -
                                    dataResponse[0].uang_voucher +
                                    normal_penjualan_sebelum_service;
                            }
                            resolve(getReceptionInvoiceDetailHistory(invoiceTransfer, statusKamarTransfer));
                        }
                        //jika tidak mempunyai kamar transfer pure kamar normal / kamar pertama / kamar status 0
                        else {
                            ringkasan_total_all = ringkasan_total_all + dataResponse[0].total_all;
                            ringkasan_total_kamar = ringkasan_total_kamar + dataResponse[0].total_kamar;
                            ringkasan_total_penjualan = ringkasan_total_penjualan + dataResponse[0].total_penjualan;
                            ringkasan_cancelation_penjualan = ringkasan_cancelation_penjualan + dataResponse[0].total_cancelation;
                            ringkasan_diskon_member_penjualan = ringkasan_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                            ringkasan_extend_kamar = ringkasan_extend_kamar + dataResponse[0].total_extend;
                            ringkasan_surcharge_kamar = ringkasan_surcharge_kamar + dataResponse[0].surcharge_kamar;
                            ringkasan_overpax_kamar = ringkasan_overpax_kamar + dataResponse[0].overpax;
                            ringkasan_diskon_member_kamar = ringkasan_diskon_member_kamar + dataResponse[0].discount_kamar;
                            ringkasan_service = ringkasan_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                            ringkasan_pajak = ringkasan_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                            ringkasan_sewa_kamar = ringkasan_sewa_kamar + dataResponse[0].sewa_kamar;
                            ringkasan_penjualan = ringkasan_penjualan + dataResponse[0].charge_penjualan;

                            if (status_bukan_kamar_transfer_ == false) {
                                //kamar transfer kamar pertama
                                transfer_total_all = transfer_total_all + dataResponse[0].total_all;
                                transfer_total_kamar = transfer_total_kamar + dataResponse[0].total_kamar;
                                transfer_total_penjualan = transfer_total_penjualan + dataResponse[0].total_penjualan;
                                transfer_cancelation_penjualan = transfer_cancelation_penjualan + dataResponse[0].total_cancelation;
                                transfer_diskon_member_penjualan = transfer_diskon_member_penjualan + dataResponse[0].discount_penjualan;
                                transfer_extend_kamar = transfer_extend_kamar + dataResponse[0].total_extend;
                                transfer_surcharge_kamar = transfer_surcharge_kamar + dataResponse[0].surcharge_kamar;
                                transfer_overpax_kamar = transfer_overpax_kamar + dataResponse[0].overpax;
                                transfer_diskon_member_kamar = transfer_diskon_member_kamar + dataResponse[0].discount_kamar;
                                transfer_service = transfer_service + dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                transfer_pajak = transfer_pajak + dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                transfer_sewa_kamar = transfer_sewa_kamar + dataResponse[0].sewa_kamar;
                                transfer_penjualan = transfer_penjualan + dataResponse[0].charge_penjualan;
                            }
                            else if (status_bukan_kamar_transfer_ == true) {
                                //kamar normal atau kamar tanpa transder
                                if (dataResponse[0].jenis_voucher == 0) {
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].uang_voucher;
                                }
                                else if (dataResponse[0].jenis_voucher == 1) {
                                    normal_nilai_gift_voucher = dataResponse[0].pay_value_voucher;
                                    normal_gift_voucher = dataResponse[0].gift_voucher;
                                    normal_voucher = dataResponse[0].pay_value_voucher;
                                }
                                normal_total_all = dataResponse[0].total_all;
                                normal_total_kamar = dataResponse[0].total_kamar;
                                normal_total_penjualan = dataResponse[0].total_penjualan;
                                normal_cancelation_penjualan = dataResponse[0].total_cancelation;
                                normal_diskon_member_penjualan = dataResponse[0].discount_penjualan;
                                normal_extend_kamar = dataResponse[0].total_extend;
                                normal_surcharge_kamar = dataResponse[0].surcharge_kamar;
                                normal_overpax_kamar = dataResponse[0].overpax;
                                normal_diskon_member_kamar = dataResponse[0].discount_kamar;
                                normal_service = dataResponse[0].service_kamar + dataResponse[0].service_penjualan;
                                normal_pajak = dataResponse[0].tax_kamar + dataResponse[0].tax_penjualan;
                                normal_sewa_kamar = dataResponse[0].sewa_kamar;
                                normal_penjualan = dataResponse[0].charge_penjualan;
                                normal_uang_muka = dataResponse[0].uang_muka;

                                normal_sewa_kamar_sebelum_service = dataResponse[0].sewa_kamar +
                                    dataResponse[0].total_extend +
                                    dataResponse[0].overpax +
                                    dataResponse[0].surcharge_kamar -
                                    dataResponse[0].discount_kamar;

                                normal_penjualan_sebelum_service = dataResponse[0].charge_penjualan -
                                    dataResponse[0].discount_penjualan -
                                    dataResponse[0].total_cancelation;

                                normal_total_kamar_penjualan_sebelum_service = normal_sewa_kamar_sebelum_service -
                                    dataResponse[0].uang_voucher +
                                    normal_penjualan_sebelum_service;

                            }

                            normal_total_final = normal_total_kamar_penjualan_sebelum_service +
                                transfer_total_all +
                                normal_service + normal_pajak -
                                normal_nilai_gift_voucher -
                                normal_uang_muka;
                            sign_path_ = dataResponse[0].sign;

                            if (normal_nilai_gift_voucher == false) {
                                ringkasan_sub_sub_total =
                                    (ringkasan_sewa_kamar +
                                        ringkasan_extend_kamar +
                                        normal_surcharge_kamar +
                                        ringkasan_overpax_kamar +
                                        ringkasan_penjualan) -
                                    ringkasan_cancelation_penjualan -
                                    normal_voucher;
                            }
                            else {
                                ringkasan_sub_sub_total =
                                    (ringkasan_sewa_kamar +
                                        ringkasan_extend_kamar +
                                        normal_surcharge_kamar +
                                        ringkasan_overpax_kamar +
                                        ringkasan_penjualan) -
                                    ringkasan_cancelation_penjualan - r;
                            }
                            ringkasan_sub_total = ringkasan_sub_sub_total -
                                (ringkasan_diskon_member_kamar +
                                    ringkasan_diskon_member_penjualan);

                            if (normal_nilai_gift_voucher == true) {
                                ringkasan_total_all =
                                    (ringkasan_sub_total +
                                        ringkasan_service +
                                        ringkasan_pajak) -
                                    (normal_uang_muka +
                                        normal_voucher);
                            }
                            else {
                                ringkasan_total_all =
                                    (ringkasan_sub_total +
                                        ringkasan_service +
                                        ringkasan_pajak) -
                                    normal_uang_muka;
                            }

                            invoice = {
                                normal_sewa_kamar: normal_sewa_kamar_sebelum_service,
                                normal_voucher: normal_voucher,
                                normal_surcharge_kamar: normal_surcharge_kamar,
                                normal_penjualan: normal_penjualan_sebelum_service,
                                normal_total_kamar_penjualan_sebelum_service: normal_total_kamar_penjualan_sebelum_service,
                                normal_service: normal_service,
                                normal_pajak: normal_pajak,
                                normal_total_all: normal_total_all,
                                normal_uang_muka: normal_uang_muka,
                                normal_nilai_gift_voucher: normal_nilai_gift_voucher,
                                normal_gift_voucher: normal_gift_voucher,
                                normal_total_final: normal_total_final,
                                sign_path: dataResponse[0].sign,

                                ringkasan_sewa_kamar: ringkasan_sewa_kamar,
                                ringkasan_extend_kamar: ringkasan_extend_kamar,
                                ringkasan_overpax_kamar: ringkasan_overpax_kamar,
                                ringkasan_diskon_member_kamar: ringkasan_diskon_member_kamar,
                                ringkasan_surcharge_kamar: ringkasan_surcharge_kamar,
                                ringkasan_total_kamar: ringkasan_total_kamar,
                                ringkasan_penjualan: ringkasan_penjualan,
                                ringkasan_cancelation_penjualan: ringkasan_cancelation_penjualan,
                                ringkasan_diskon_member_penjualan: ringkasan_diskon_member_penjualan,
                                ringkasan_total_penjualan: ringkasan_total_penjualan,
                                ringkasan_service: ringkasan_service,
                                ringkasan_pajak: ringkasan_pajak,
                                ringkasan_total_all: ringkasan_total_all,
                                ringkasan_sub_sub_total: ringkasan_sub_sub_total,
                                ringkasan_sub_total: ringkasan_sub_total,

                                transfer_sewa_kamar: transfer_sewa_kamar,
                                transfer_extend_kamar: transfer_extend_kamar,
                                transfer_overpax_kamar: transfer_overpax_kamar,
                                transfer_surcharge_kamar: transfer_surcharge_kamar,
                                transfer_diskon_member_kamar: transfer_diskon_member_kamar,
                                transfer_total_kamar: transfer_total_kamar,
                                transfer_penjualan: transfer_penjualan,
                                transfer_cancelation_penjualan: transfer_cancelation_penjualan,
                                transfer_diskon_member_penjualan: transfer_diskon_member_penjualan,
                                transfer_total_penjualan: transfer_total_penjualan,
                                transfer_service: transfer_service,
                                transfer_pajak: transfer_pajak,
                                transfer_total_all: transfer_total_all

                                /*normal_total_all: normal_total_all,
                                normal_total_kamar: normal_total_kamar,
                                normal_total_penjualan: normal_total_penjualan,
                                normal_cancelation_penjualan: normal_cancelation_penjualan,
                                normal_diskon_member_penjualan: normal_diskon_member_penjualan,
                                normal_extend_kamar: normal_extend_kamar,
                                normal_surcharge_kamar: normal_surcharge_kamar,
                                normal_overpax_kamar: normal_overpax_kamar,
                                normal_diskon_member_kamar: normal_diskon_member_kamar,
                                normal_service: normal_service,
                                normal_pajak: normal_pajak,

                                normal_sewa_kamar: normal_sewa_kamar,
                                normal_penjualan: normal_penjualan,

                                normal_total_kamar_penjualan_sebelum_service: normal_total_kamar_penjualan_sebelum_service,
                                normal_total_final: normal_total_final,
                                normal_nilai_gift_voucher: normal_nilai_gift_voucher,
                                normal_voucher: normal_voucher,
                                normal_uang_muka: normal_uang_muka,
                                normal_gift_voucher: normal_gift_voucher,
                                normal_sewa_kamar_sebelum_service: normal_sewa_kamar_sebelum_service,
                                normal_penjualan_sebelum_service: normal_penjualan_sebelum_service,
                                 */

                            };
                            resolve(hasilReceptionInvoiceDetail);
                        }
                    } else {
                        resolve(hasilReceptionInvoiceDetail);
                    }
                }
            });


        } catch (err) {
            logger.error(err.message);
            reject(err.message);
        }
    });
}


