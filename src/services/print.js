var sql = require('mssql');
var db;
var logger = require ('../util/logger');
var isiQuery;

class PrintService{
    constructor() { }

    getInvoiceCode(db_, rcp_){
        return new Promise((resolve) => {

        try{
            db = db_;
            var rcp = rcp_;

            isiQuery = `
            SELECT [Invoice] as ivc FROM [HP112new].[dbo].[IHP_Ivc] WHERE [Reception] = '${rcp}'
                `
            db.request().query(isiQuery, function (error, dataReturn){
                if(error){
                    sql.close();
                    console.log(error + '\n' + error.message + '\n error get ivc code \n' + isiQuery);
                    logger.error(error + '\n' + error.message + '\n error get ivc code \n' + isiQuery);
                    resolve(false)
                } else{
                    sql.close();
                    if(dataReturn.recordset.length>0){
                        resolve(dataReturn.recordset[0].ivc);
                    } else{
                        resolve(false);
                        console.log('kode invoice tidak ada');
                        logger.warn('kode invoice tidak ada');
                    }
                }
            })
            } catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get ivc code \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get ivc code \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getOutletInfo(db_){
        return new Promise((resolve) => {

        try{
            db = db_;

            isiQuery = `
                SELECT 
                [Nama_Outlet] as nama_outlet
               ,[Alamat_Outlet] as alamat_outlet
               ,[Tlp1] as telepon
               ,[Kota] as kota
                FROM [IHP_Config]
                `
            db.request().query(isiQuery, function (error, dataReturn){
                if(error){
                    sql.close();
                    console.log(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                    logger.error(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                    resolve(false)
                } else{
                    sql.close();
                    if(dataReturn.recordset.length>0){
                        resolve(dataReturn.recordset[0]);
                    } else{
                        resolve(false);
                        console.log('data  outlet belum ada di config');
                        logger.warn('data  outlet belum ada di config');
                    }
                }
            })
            } catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get data outlet \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getInvoice(db_, ivc_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var ivc = ivc_;

                isiQuery = `
                        SELECT 
                            (isnull(Sewa_Kamar_Sebelum_Diskon,0) + isnull(Total_Extend_Sebelum_Diskon,0)) as sewa_ruangan, 
                            (isnull(Diskon_Sewa_Kamar,0) + isnull(Diskon_Extend_Kamar,0)) as promo,
                            
                            (isnull(Sewa_Kamar,0) + isnull(Total_Extend,0)) as jumlah_ruangan,
                            (isnull(Charge_Penjualan,0) - isnull(Total_Cancelation,0)) as jumlah_penjualan,
                            
                            (isnull(Sewa_Kamar,0) + isnull(Total_Extend,0) + isnull(Charge_Penjualan,0) - isnull(Total_Cancelation,0)) as jumlah,
                            (isnull(Service_Kamar,0) + isnull(Service_Penjualan,0)) as jumlah_service,
                            (isnull(Tax_Kamar,0) + isnull(Tax_Penjualan,0)) as jumlah_pajak,
                            Transfer as transfer,
                            
                            --opsional
                            isnull(Overpax,0) as overpax,
                            isnull(Discount_kamar,0) as diskon_kamar,
                            isnull(Surcharge_Kamar,0) as surcharge_kamar,
                            isnull(Discount_Penjualan,0) as diskon_penjualan,
                            isnull(Uang_Voucher,0) as voucher,
                            isnull(Charge_Lain,0) as charge_lain,
                                
                            isnull(Total_All,0) as jumlah_total,
                            isnull(Uang_Muka,0) as uang_muka,
                            (isnull(Total_All,0) - isnull(Uang_Muka,0)) as jumlah_bersih
                        FROM [IHP_Ivc] WHERE Invoice = '${ivc}'
                        `
                    db.request().query(isiQuery, function (error, dataReturn){
                        if(error){
                            sql.close();
                            console.log(error + '\n' + error.message + '\n error get data invoice \n' + isiQuery);
                            logger.error(error + '\n' + error.message + '\n error get data invoice \n' + isiQuery);
                            resolve(false)
                        } else{
                            sql.close();
                            if(dataReturn.recordset.length>0){
                                resolve(dataReturn.recordset[0]);
                            } else{
                                resolve(false);
                                console.log('data invoice kosong');
                                logger.warn('data invoice kosong');
                                }
                            }
                        })
            } catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get data invoice \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get data invoice \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getRoomInfo(db_, ivc_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var ivc = ivc_;

                isiQuery = `
                SELECT
                    convert(varchar(16), [DATE], 120) as tanggal
                    ,[Nama] as nama
                    ,isnull((select kamar_alias FROM [IHP_room] WHERE Kamar = (select Kamar from [IHP_Rcp] WHERE Invoice = '${ivc}')), Kamar) as ruangan,
                    convert(varchar(5), Checkin, 8) as Checkin,
                    convert(varchar(5),DATEADD(HH,Jam_Sewa + isnull((SELECT SUM(Jam_Extend) FROM [IHP_Ext] WHERE Reception = (SELECT Reception FROM IHP_Rcp WHERE Invoice = '${ivc}')),0), convert(varchar(5), Checkin, 8)), 8) as Checkout
                FROM [IHP_Rcp]
                where Invoice = '${ivc}'
                `

                db.request().query(isiQuery, function (error, dataReturn){
                    if(error){
                        sql.close();
                        console.log(error + '\n' + error.message + '\n error get room data \n' + isiQuery);
                        logger.error(error + '\n' + error.message + '\n error get room data \n' + isiQuery);
                        resolve(false)
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length>0){
                            resolve(dataReturn.recordset[0]);
                        } else{
                            resolve(false);
                            console.log('data room empty');
                            logger.warn('data room empty');
                            }
                        }
                    })
            }catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get room data \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get room data \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getOrder(db_, rcp_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var rcp = rcp_;

                isiQuery = `
                SELECT DISTINCT
                okd.nama as nama_item,
                okd.Qty as jumlah,
                inventory.Price as harga,
                okd.qty * inventory.price as total
                from 
                ihp_sol sol, 
                ihp_okl okl, 
                ihp_okd okd,
                IHP_Inventory inventory
                where
                sol.SlipOrder = okd.SlipOrder
                and okl.orderpenjualan = okd.orderpenjualan
                and inventory.Inventory = okd.Inventory
                and sol.Reception = '${rcp}'
                `

                db.request().query(isiQuery, function (error, dataReturn){
                    if(error){
                        sql.close();
                        console.log(error + '\n' + error.message + '\n error get order data \n' + isiQuery);
                        logger.error(error + '\n' + error.message + '\n error get order data \n' + isiQuery);
                        resolve(false)
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length>0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                            console.log('data order empty');
                            logger.warn('data order empty');
                            }
                        }
                    })
            }catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get order data \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get order data \n' + isiQuery);
                resolve(false)
            }
        })
    }
    
    getCancelOrder(db_, rcp_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var rcp = rcp_;

                isiQuery = `
                    SELECT DISTINCT
                        ocd.nama as nama_item,
                        ocd.Qty as jumlah,
                        inventory.Price as harga,
                        ocd.qty * inventory.price as total
                    from 
                        ihp_sol sol, 
                        ihp_ocd ocd,
                        IHP_Inventory inventory
                    where
                        ocd.SlipOrder = sol.SlipOrder
                        and inventory.Inventory = ocd.Inventory
                        and sol.Reception = '${rcp}'
                `

                db.request().query(isiQuery, function (error, dataReturn){
                    if(error){
                        sql.close();
                        console.log(error + '\n' + error.message + '\n error get cancel order data \n' + isiQuery);
                        logger.error(error + '\n' + error.message + '\n error get cancel order data \n' + isiQuery);
                        resolve(false)
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length>0){
                            resolve(dataReturn.recordset);
                        } else{
                            resolve(false);
                            console.log('data cancel order empty');
                            logger.warn('data cancel order empty');
                            }
                        }
                    })
            }catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get cancel order data \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get cancel order data \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getTransfer(db_, ivc_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var ivc = ivc_;

                isiQuery = `
                SELECT  Kamar as kamar, 
                        isnull(Total_All,0) as total, 
                        [Transfer] as transfer
                FROM [IHP_Ivc] WHERE Invoice = '${ivc}'
                `

                db.request().query(isiQuery, function (error, dataReturn){
                    if(error){
                        sql.close();
                        console.log(error + '\n' + error.message + '\n error get transfer data \n' + isiQuery);
                        logger.error(error + '\n' + error.message + '\n error get transfer data \n' + isiQuery);
                        resolve(false)
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length>0){
                            resolve(dataReturn.recordset[0]);
                        } else{
                            resolve(false);
                            console.log('data transfer empty');
                            logger.info('data transfer empty');
                            }
                        }
                    })
            }catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get transfer data \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get transfer data \n' + isiQuery);
                resolve(false)
            }
        })
    }

    getPromoOrder(db_, rcp_){
        return new Promise((resolve) =>{
            try{
                db = db_;
                var rcp = rcp_;

                isiQuery = `
                SELECT 
                    okdp.Promo_Food as promo, 
                    SUM(okdp.Harga_Promo) as total_promo
                FROM 
                    IHP_Okd_Promo okdp,
                    IHP_Okl okl
                where 
                    okdp.OrderPenjualan = okl.OrderPenjualan
                    and okl.Reception = '${rcp}'
                Group By okdp.Promo_Food
                `

                db.request().query(isiQuery, function (error, dataReturn){
                    if(error){
                        sql.close();
                        console.log(error + '\n' + error.message + '\n error get promo order data \n' + isiQuery);
                        logger.error(error + '\n' + error.message + '\n error get promo order data \n' + isiQuery);
                        resolve(false)
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length>0){
                            resolve(dataReturn.recordset[0]);
                        } else{
                            resolve(false);
                            console.log('data promo order empty');
                            logger.warn('data promo order empty');
                            }
                        }
                    })
            }catch(error){
                sql.close();
                console.log(error + '\n' + error.message + '\n error get promo order data \n' + isiQuery);
                logger.error(error + '\n' + error.message + '\n error get promo order data \n' + isiQuery);
                resolve(false)
            }
        })
    }
}
module.exports = PrintService;