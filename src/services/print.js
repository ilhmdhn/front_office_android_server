var sql = require('mssql');
const { resolveContent } = require('nodemailer/lib/shared');
var db;
var logger = require ('../util/logger');
var isiQuery;

class PrintService{
    constructor() { }

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
                            (Sewa_Kamar_Sebelum_Diskon + Total_Extend_Sebelum_Diskon) as sewa_ruangan, 
                            (Diskon_Sewa_Kamar + Diskon_Extend_Kamar) as promo,
                            
                            (Sewa_Kamar + Total_Extend) as jumlah_ruangan,
                            (Charge_Penjualan - Total_Cancelation) as jumlah_penjualan,
                            
                            (Sewa_Kamar + Total_Extend + Charge_Penjualan - Total_Cancelation) as jumlah,
                            (Service_Kamar + Service_Penjualan) as jumlah_service,
                            (Tax_Kamar + Tax_Penjualan) as jumlah_pajak,
                            
                            --opsional
                            Overpax as overpax,
                            Discount_kamar as diskon_kamar,
                            Surcharge_Kamar as surcharge_kamar,
                            Discount_Penjualan as diskon_penjualan,
                            Uang_Voucher as voucher,
                                
                            Total_All as jumlah_total,
                            Uang_Muka as uang_muka,
                            (Total_All - Uang_Muka) as jumlah_bersih
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
}
module.exports = PrintService;