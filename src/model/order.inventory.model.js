var DBConnection = require('../util/db.pool');

class OrderInventoryModel {

    constructor(logger) {
        this.log = logger;
    }

    async getOrderPenjualanDb(ivc) {
        let db = await new DBConnection().getPoolConnection();
        let hasilOrderPenjualan = [];
        let logger = this.log;

        return new Promise((resolve, reject) => {
            (function recursiveInvoice(ivcParam) {

                var cekOrderPenjualanQuery = `select
                IHP_Okd.[OrderPenjualan] as order_penjualan
                    , IHP_Okd.[Inventory] as inventory
                    , IHP_Okd.[Nama] as nama
                    , IHP_Okd.[Price] as harga_per_item_setelah_diskon
                    , IHP_Okd.[Price] + (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty]) as price
                    , (isnull(IHP_Okd_Promo.[Harga_Promo], 0) / IHP_Okd.[Qty]) as diskon
                    , IHP_Okd.[Qty] as qty
                    , IHP_Okd.[Total] as total_setelah_diskon
                    , IHP_Okd.[Location] as location

                    ,case when IHP_Okd.[Location] = 1  then 'KASIR'
                when IHP_Okd.[Location] = 2 then 'DAPUR'
                when IHP_Okd.[Location] = 3  then 'BAR' end
                as keterangan_location
                    , CAST(IHP_Okd.[Printed] as BIT) as printed
                    , IHP_Okd.[Note] as note
                    , IHP_Okd.[SlipOrder] as slip_order
                    , isnull(IHP_Okd.[ID_COOKER], '') as id_cooker

                    , isnull(IHP_Okd_Promo.[Promo_Food], '') as promo_food
                    , isnull(IHP_Okd_Promo.[Harga_Promo], 0) as total_diskon

                    , IHP_Ivc.[kamar] as kamar
                    , IHP_Ivc.[Invoice] as invoice
                    , IHP_Ivc.[Transfer] as invoice_transfer
                    , CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer

                    , IHP_Ocd.[OrderCancelation] as order_cancelation
                    , sum(isnull(IHP_Ocd.[Qty], 0)) as qty_ocd
                    , IHP_Okd.[Qty] - sum(isnull(IHP_Ocd.[Qty], 0)) as qty_belum_ocd

                from
                IHP_Ivc

                left join IHP_Okl
                on IHP_Ivc.Reception = IHP_Okl.Reception
                And IHP_Ivc.Kamar = IHP_Okl.Kamar

                left join IHP_Okd
                on IHP_Okl.OrderPenjualan = IHP_Okd.OrderPenjualan

                left join IHP_Okd_Promo
                on IHP_Okd.OrderPenjualan = IHP_Okd_Promo.OrderPenjualan
                and IHP_Okd.Inventory = IHP_Okd_Promo.Inventory

                left join IHP_Ocd
                on IHP_Okd.OrderPenjualan = IHP_Ocd.OrderPenjualan
                and IHP_Okd.Inventory = IHP_Ocd.Inventory
                and IHP_Okd.SlipOrder = IHP_Ocd.SlipOrder

                where IHP_Ivc.Invoice = '${ivcParam}'
                group by
                IHP_Okd.OrderPenjualan
                    , IHP_Okd.Inventory
                    , IHP_Okd.Nama
                    , IHP_Okd.Price
                    , IHP_Okd_Promo.Harga_Promo
                    , IHP_Okd.Qty
                    , IHP_Okd.Total
                    , IHP_Okd.Location
                    , IHP_Okd.Printed
                    , IHP_Okd.Note
                    , IHP_Okd.SlipOrder
                    , IHP_Okd.ID_COOKER
                    , IHP_Okd_Promo.Promo_Food
                    , IHP_Ivc.Kamar
                    , IHP_Ivc.Invoice
                    , IHP_Ivc.[Transfer]
                    , IHP_Ivc.[Status]
                    , IHP_Ocd.[OrderCancelation]`;

                db.request().query(cekOrderPenjualanQuery, function (err, dataReturn) {
                    if (err) {
                        logger.error(err.message);
                        reject(err.message);
                    } else {


                        if (dataReturn.recordset.length > 0) {
                            for (const data of dataReturn.recordset) {
                                if (data.order_penjualan != null) {
                                    hasilOrderPenjualan.push(data);
                                }
                            }

                            if (dataReturn.recordset[0].invoice_transfer != "") {
                                var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
                                recursiveInvoice(invoiceTransfer);
                            }
                            else {
                                resolve(hasilOrderPenjualan);
                            }
                        } else {

                            resolve(hasilOrderPenjualan);
                        }
                    }
                });
            })(ivc);
        });
    }

    async getOrderCancelationDb(ivc) {
        let db = await new DBConnection().getPoolConnection();
        let hasilOrderCancelation = [];
        let logger = this.log;

        return new Promise((resolve, reject) => {
            (function recursiveInvoice(ivcParam) {

                var cekOrderCancelationQuery = `select
                 IHP_Ocd.[OrderCancelation] as order_cancelation
                 ,IHP_Ocd.[Inventory] as inventory
                 ,IHP_Ocd.[Nama] as nama
                 ,IHP_Ocd.[Price] as harga_per_item_setelah_diskon
                 ,IHP_Ocd.[Price]+(isnull(IHP_Ocd_Promo.[Harga_Promo],0)/IHP_Ocd.[Qty])  as price
                 ,(isnull(IHP_Ocd_Promo.[Harga_Promo],0)/IHP_Ocd.[Qty])  as diskon
                 ,IHP_Ocd.[Qty] as qty
                 ,IHP_Ocd.[Total] as total_setelah_diskon
                 ,IHP_Ocd.[OrderPenjualan] as order_penjualan
                 ,IHP_Ocd.[SlipOrder] as  slip_order

                 ,IHP_Ivc.[kamar] as kamar
                 ,IHP_Ivc.[Invoice] as invoice
                 ,IHP_Ivc.[Transfer] as invoice_transfer
                 ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer

                ,isnull(IHP_Ocd_Promo.[Promo_Food],'') as promo_food
                ,isnull(IHP_Ocd_Promo.[Harga_Promo],0) as total_diskon

                 from
                 IHP_Ivc

                 left join IHP_Ocl
                 on IHP_Ivc.Reception=IHP_Ocl.Reception
                 And IHP_Ivc.Kamar=IHP_Ocl.Kamar

                 left join IHP_Ocd
                 on IHP_Ocl.OrderCancelation=IHP_Ocd.OrderCancelation

                 left join IHP_Ocd_Promo
                 on IHP_Ocd.OrderCancelation=IHP_Ocd_Promo.OrderCancelation
                 and IHP_Ocd.Inventory = IHP_Ocd_Promo.Inventory

                 where IHP_Ivc.Invoice='${ivcParam}'`;

                db.request().query(cekOrderCancelationQuery, function (err, dataReturn) {
                    if (err) {
                        logger.error(err.message);
                        reject(err.message);
                    } else {
                        if (dataReturn.recordset.length > 0) {
                            for (const data of dataReturn.recordset) {
                                if (data.order_cancelation != null) {
                                    hasilOrderCancelation.push(data);
                                }

                            }

                            if (dataReturn.recordset[0].invoice_transfer != "") {
                                var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
                                recursiveInvoice(invoiceTransfer);
                            }
                            else {
                                resolve(hasilOrderCancelation);
                            }
                        } else {

                            resolve(hasilOrderCancelation);
                        }
                    }
                });
            })(ivc);
        });
    }

    async getSlipOrderStatusDb(ivc) {
        let db = await new DBConnection().getPoolConnection();
        let hasilSlipOrderStatus = [];
        let logger = this.log;

        return new Promise((resolve, reject) => {
            (function recursiveInvoice(ivcParam) {

                var cekSlipOrderStatusQuery = ` select
                IHP_Sod.[SlipOrder] as slip_order
                ,IHP_Sod.[Inventory] as inventory
                ,IHP_Sod.[Nama] as nama
                ,IHP_Sod.[Price]+(isnull(IHP_Sod_Promo.[Harga_Promo],0)/IHP_Sod.[Qty])  as price
                ,(isnull(IHP_Sod_Promo.[Harga_Promo],0)/IHP_Sod.[Qty])  as diskon
                ,IHP_Sod.[Price]  as harga_per_item_setelah_diskon
                ,IHP_Sod.[Qty] as qty
                ,IHP_Sod.[Qty_Terima] as qty_terima
                ,IHP_Sod.[Total] as total_setelah_diskon
                ,CAST(IHP_Sod.[Status] as INT)  as order_status

                 ,case when IHP_Sod.[Status]=1  then 'SLIP ORDER TERKIRIM'
                 when IHP_Sod.[Status]=2 then 'SLIP ORDER BATALKAN'
                 when IHP_Sod.[Status]=3 then 'SLIP ORDER DITERIMA'
                 when IHP_Sod.[Status]=5  then 'PESANAN FNB TERKIRIM KE ROOM' end
                 as keterangan_status_slip_order

                ,IHP_Sod.[Location] as location

                 ,case when IHP_Sod.[Location]=1  then 'KASIR'
                 when IHP_Sod.[Location]=2 then 'DAPUR'
                 when IHP_Sod.[Location]=3  then 'BAR' end
                 as keterangan_location

                ,CAST(IHP_Sod.[Printed] as BIT) as printed
                ,IHP_Sod.[Note] as note
                ,isnull(IHP_Sod.[Tgl_Terima],'') as tanggal_terima
                ,isnull(IHP_Sod.[Tgl_Kirim],'') as tanggal_kirim

                ,isnull(IHP_Sod_Promo.[Promo_Food],'') as promo_food
                ,isnull(IHP_Sod_Promo.[Harga_Promo],0) as total_diskon

                 ,IHP_Ivc.[kamar] as kamar
                 ,IHP_Ivc.[Invoice] as invoice
                 ,IHP_Ivc.[Transfer] as invoice_transfer
                 ,CAST(IHP_Ivc.[Status] AS BIT) as not_room_transfer

                 ,IHP_Okd.[OrderPenjualan] as order_penjualan
                , sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_terkirim
                , IHP_Sod.[Qty] - sum(isnull(IHP_Okd.[Qty], 0)) as order_qty_belum_terkirim

                 from
                 IHP_Ivc

                 left join IHP_Sol
                 on IHP_Sol.Reception=IHP_Ivc.Reception
                 And IHP_Ivc.Kamar=IHP_Sol.Kamar

                 left join IHP_Sod
                 on IHP_Sol.SlipOrder=IHP_Sod.SlipOrder
                 and IHP_Sod.Status!=2

                 left join IHP_Sod_Promo
                 on IHP_Sod.SlipOrder=IHP_Sod_Promo.SlipOrder
                 and IHP_Sod.Inventory = IHP_Sod_Promo.Inventory

                 left join IHP_Okd
                 on IHP_Sod.SlipOrder=IHP_Okd.SlipOrder
                 and IHP_Sod.Inventory=IHP_Okd.Inventory
                 and IHP_Sod.Status != 2

                 where IHP_Ivc.Invoice='${ivcParam}'
                 group by
                IHP_Sod.SlipOrder
                ,IHP_Sod.Inventory
                ,IHP_Sod.Nama
                ,IHP_Sod.Price
                ,IHP_Sod_Promo.Harga_Promo
                ,IHP_Sod.Qty
                ,IHP_Sod.Qty_Terima
                ,IHP_Sod.Total
                ,IHP_Sod.[Status]
                ,IHP_Sod.Location
                ,IHP_Sod.Printed
                ,IHP_Sod.Note
                ,IHP_Sod.Tgl_Terima
                ,IHP_Sod.Tgl_Kirim
                ,IHP_Sod_Promo.Promo_Food
                ,IHP_Ivc.Kamar
                ,IHP_Ivc.Invoice
                ,IHP_Ivc.[Transfer]
                ,IHP_Ivc.[Status]
                ,IHP_Okd.Qty
                ,IHP_Okd.[OrderPenjualan]
                ,IHP_Sod.Tgl_Terima

                 Order By Tgl_Terima asc`;

                db.request().query(cekSlipOrderStatusQuery, function (err, dataReturn) {
                    if (err) {
                        logger.error(err.message);
                        reject(err.message);
                    } else {
                        if (dataReturn.recordset.length > 0) {
                            for (const data of dataReturn.recordset) {
                                if (data.slip_order != null) {
                                    hasilSlipOrderStatus.push(data);
                                }
                            }

                            if (dataReturn.recordset[0].invoice_transfer != "") {
                                var invoiceTransfer = dataReturn.recordset[0].invoice_transfer;
                                recursiveInvoice(invoiceTransfer);
                            }
                            else {

                                resolve(hasilSlipOrderStatus);
                            }
                        } else {
                            resolve(hasilSlipOrderStatus);
                        }
                    }
                });
            })(ivc);
        });

    }

    async isAvailableUnprocessedOrder(rcp) {
        let db = await new DBConnection().getPoolConnection();
        return new Promise((resolve, reject) => {
            let logger = this.log;
            var qry = `select * from IHP_Sod 
                    where (Status='1' or Status='3') 
                     and SlipOrder in (Select SlipOrder from IHP_Sol Where Reception='${rcp}')`;
            db.request().query(qry, function (err, dataReturn) {
                if (err) {
                    logger.error(err.message + ' Error prosesQuery ' + qry);
                    resolve(false);
                } else {
                    if (dataReturn.recordset.length > 0) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            });
        });
    }

    async getOrderPenjualanByRcpDb(rcp) {

    }

    async getCancelOrderPenjualanByRcpDb(rcp) {

    }

}

module.exports = OrderInventoryModel;