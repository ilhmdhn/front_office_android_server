var sql = require("mssql");
var logger = require ('../util/logger');
var db;
var isiQuery;
var dateFormat = require('dateformat');

class Report{
    constructor(){ }

    getCINPaid(db_, tanggalIn_, tanggalOut_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
            db = db_;
            var tanggalIn = tanggalIn_;
            var tanggalOut = tanggalOut_;
            var tanggalAwal = tanggalAwal_;
            var tanggalAkhir = tanggalAkhir_;
            var chusr = chusr_;
            var shift = shift_;

            if (chusr != '-'){
                isiQuery = `
                Select Count(Rcp.Reception) as jumlah_checkin_sudah_bayar,
                isnull(sum(RCP.Pax),0) as jumlah_tamu_sudah_bayar
                from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room 
                where
                Rcp.CheckIn >= '${dateFormat(tanggalIn, "yyyy-mm-dd HH:MM:ss")}'  and
                Rcp.CheckIn <= '${dateFormat(tanggalOut, "yyyy-mm-dd HH:MM:ss")}' and
                RCp.kamar = Room.Kamar and 
                (Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE'and
                Room.Jenis_Kamar <> 'RESTO') and
                Rcp.reception in (select reception from hp112.dbo.ihp_Sul where 
                    date_trans >= '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' and
                    date_trans <= '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' and
                Shift = ${shift} and 
                Chusr = '${chusr}')`    
            } else {
                isiQuery = `
                Select Count(Rcp.Reception) as jumlah_checkin_sudah_bayar,
                isnull(sum(RCP.Pax),0) as jumlah_tamu_sudah_bayar
                from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room 
                where
                Rcp.CheckIn >= '${dateFormat(tanggalIn, "yyyy-mm-dd HH:MM:ss")}' and
                Rcp.CheckIn <= '${dateFormat(tanggalOut, "yyyy-mm-dd HH:MM:ss")}' and
                RCp.kamar = Room.Kamar and 
                (Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE'and
                Room.Jenis_Kamar <> 'RESTO') and
                Rcp.reception in (select reception from hp112.dbo.ihp_Sul where 
                date_trans >= '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' and
                date_trans <= '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' and
                Shift = ${shift})` 
            }

            db.request().query(isiQuery, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err);
                    console.log(err);
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);  
                } else{
                    sql.close();
                    if(dataReturn.recordset.length > 0){
                        var nilai = {
                            jumlahCheckinPaid : dataReturn.recordset[0].jumlah_checkin_sudah_bayar,
                            jumlahTamuPaid : dataReturn.recordset[0].jumlah_tamu_sudah_bayar
                        }
                        console.log("JUMLAH PAID CIN= " + nilai);
                        logger.info("JUMLAH PAID CIN= " + nilai);
                        resolve(nilai);
                    } else{
                        console.log("PAID CHECKIN DATA 0 ");
                        logger.info("PAID CHECKIN DATA 0 ");
                        resolve(false);
                    }
                }
            })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(false);
            }
        })
    }

    getJumlahJamPaid(db_, tanggalIn_, tanggalOut_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise ((resolve, reject) =>{
            try{
                db = db_;
                var tanggalIn = tanggalIn_;
                var tanggalOut = tanggalOut_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;
    
                 if (chusr != '-'){
                isiQuery = `
                select distinct
                CONVERT(char,r.date_trans,105) as tanggal,
                isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_sudah_bayar,
                isnull(sum(r.pax),0) as jumlah_tamu_sudah_bayar
                from
                ihp_rcp as r
                left join ihp_ext as e on 
                r.reception = e.reception and
                e.status = 1, 
                IHP_room room 
                where 
                CONVERT(char,r.date_trans,105) = '${dateFormat(tanggalAwal, "dd-mm-yyyy")}' and
                r.kamar = room.kamar and
                (
                Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE' and
                Room.Jenis_Kamar <> 'RESTO') and
                r.reception in (
                    select reception from ihp_Sul 
                    where 
                    date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and 
                    date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}'  as datetime) and 
                    Shift = ${shift} and Chusr = '${chusr}')
                group by CONVERT(char,r.date_trans,105)`
                } else {
                isiQuery = `
                select distinct
                CONVERT(char,r.date_trans,105) as tanggal,
                isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_sudah_bayar,
                isnull(sum(r.pax),0) as jumlah_tamu_sudah_bayar
                from
                ihp_rcp as r
                left join ihp_ext as e on 
                r.reception = e.reception and
                e.status = 1, 
                IHP_room room 
                where 
                CONVERT(char,r.date_trans,105) = '${dateFormat(tanggalAwal, "dd-mm-yyyy")}' and
                r.kamar = room.kamar and
                (
                Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE' and
                Room.Jenis_Kamar <> 'RESTO') and
                r.reception in (
                    select reception from ihp_Sul 
                    where 
                    date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and 
                    date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}'  as datetime) and 
                    Shift = ${shift} )
                group by CONVERT(char,r.date_trans,105)`
                }

            

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        console.log(err);
                        logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                        resolve(false);    
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length > 0){
                            var nilai = {
                                tanggal: dataReturn.recordset[0].tanggal,
                                jumlah_jam_sudah_bayar: dataReturn.recordset[0].jumlah_jam_sudah_bayar
                            }
                            console.log("JUMLAH JAM DAN TANGGAL PAID= " + nilai);
                            logger.info("JUMLAH JAM DAN TANGGAL PAID= " + nilai);
                            resolve(nilai);
                        } else{
                            console.log("service= Room 0 ");
                            logger.info("service= Room 0 ");
                            resolve(false); 
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(false);
            }
        })
    }

    getCINPiutang(db_, tanggalIn_, tanggalOut_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalIn = tanggalIn_;
                var tanggalOut = tanggalOut_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;
                
                if (chusr != '-'){
                    isiQuery = `
                    Select Count(Rcp.Reception) as jumlah_checkin_piutang,
                    isnull(sum(RCP.Pax),0) as jumlah_tamu_piutang 
                    from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room
                    WHERE (Rcp.CheckIn >= '${dateFormat(tanggalIn, "yyyy-mm-dd HH:MM:ss")}' and
                           Rcp.CheckIn <= '${dateFormat(tanggalOut, "yyyy-mm-dd HH:MM:ss")}') and
                            Rcp.kamar = Room.Kamar and
                            (
                                Room.Jenis_Kamar <> 'LOBBY' and
                                Room.Jenis_Kamar <> 'BAR' and
                                Room.Jenis_Kamar <> 'LOUNGE' and
                                Room.Jenis_Kamar <> 'RESTO'
                            ) and 
                            Rcp.Shift = '${shift}' and
                            and Rcp.Chusr = '${chusr} and
                            Rcp.reception not in (select reception from hp112.dbo.ihp_Sul where 
                                date_trans >= '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' and 
                                date_trans <= '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' 
                                and Shift = ${shift}')`
                }else{
                    isiQuery = `
                    Select Count(Rcp.Reception) as jumlah_checkin_piutang,
                    isnull(sum(RCP.Pax),0) as jumlah_tamu_piutang 
                    from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room
                    WHERE (Rcp.CheckIn >= '${dateFormat(tanggalIn, "yyyy-mm-dd HH:MM:ss")}' and
                           Rcp.CheckIn <= '${dateFormat(tanggalOut, "yyyy-mm-dd HH:MM:ss")}') and
                            Rcp.kamar = Room.Kamar and
                            (
                                Room.Jenis_Kamar <> 'LOBBY' and
                                Room.Jenis_Kamar <> 'BAR' and
                                Room.Jenis_Kamar <> 'LOUNGE' and
                                Room.Jenis_Kamar <> 'RESTO'
                            ) and 
                            Rcp.Shift = '${shift}' and
                            Rcp.reception not in (select reception from hp112.dbo.ihp_Sul 
                                where date_trans >= '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' and 
                                date_trans <= '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' 
                                and Shift = ${shift})`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        console.log(err);
                        logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                        resolve(false);  
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length > 0){
                            var hasil = {
                                jumlah_checkin_piutang: dataReturn.recordset[0].jumlah_checkin_piutang,
                                jumlah_tamu_piutang: dataReturn.recordset[0].jumlah_tamu_piutang
                            }
                            console.log("DATA PIUTANG= " + hasil);
                            logger.info("DATA PIUTANG= " + hasil);
                            resolve(hasil);
                        } else{
                            console.log("PIUTANG CHECKIN DATA 0 ");
                            logger.info("PIUTANG CHECKIN DATA 0 ");
                            resolve(false);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(false);
            }
        })
    }

    getJumlahJamPiutang(db_, tanggalIn_, tanggalOut_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) => {
            try{
                db = db_;
                var tanggalIn = tanggalIn_;
                var tanggalOut = tanggalOut_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `
                    select distinct
                    CONVERT(char,r.date_trans,105) as tanggal,
                    isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_piutang,
                    isnull(sum(r.pax),0) as jumlah_tamu_piutang
                    from
                    ihp_rcp as r
                    left join ihp_ext as e on 
                    r.reception = e.reception and
                    r.Chusr = ${chusr} and
                    e.status = 1, 
                    IHP_room room 
                    where 
                    CONVERT(char,r.date_trans,105) = '${dateFormat(tanggalAwal, "dd-mm-yyyy")}' and
                    r.kamar = room.kamar and
                    (
                    Room.Jenis_Kamar <> 'LOBBY' and
                    Room.Jenis_Kamar <> 'BAR' and
                    Room.Jenis_Kamar <> 'LOUNGE' and
                    Room.Jenis_Kamar <> 'RESTO') and
                    r.Shift = ${shift}
                    and
                    r.reception not in (
                        select reception from ihp_Sul 
                        where 
                        date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and 
                        date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}'  as datetime)
                        and Shift = ${shift})
                    group by CONVERT(char,r.date_trans,105)`
                } else {
                    isiQuery = `
                    select distinct
                    CONVERT(char,r.date_trans,105) as tanggal,
                    isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_piutang,
                    isnull(sum(r.pax),0) as jumlah_tamu_piutang
                    from
                    ihp_rcp as r
                    left join ihp_ext as e on 
                    r.reception = e.reception and
                    e.status = 1, 
                    IHP_room room 
                    where 
                    CONVERT(char,r.date_trans,105) = '${dateFormat(tanggalAwal, "dd-mm-yyyy")}' and
                    r.kamar = room.kamar and
                    (
                    Room.Jenis_Kamar <> 'LOBBY' and
                    Room.Jenis_Kamar <> 'BAR' and
                    Room.Jenis_Kamar <> 'LOUNGE' and
                    Room.Jenis_Kamar <> 'RESTO') and
                    r.Shift = ${shift}
                    and
                    r.reception not in (
                        select reception from ihp_Sul 
                        where 
                        date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and 
                        date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}'  as datetime)
                        and Shift = ${shift})
                    group by CONVERT(char,r.date_trans,105)`
                }
                    

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        // console.log(err);
                        logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                        resolve(false); 
                    } else{
                        sql.close();
                        if(dataReturn.recordset.length > 0){
                            var hasil = {
                                tanggal: dataReturn.recordset[0].tanggal,
                                jumlah_jam_piutang: dataReturn.recordset[0].jumlah_jam_piutang 
                            }
                            console.log("DATA PIUTANG= " + hasil);
                            logger.info("DATA PIUTANG= " + hasil);
                            resolve(hasil); 
                        } else{
                            console.log("PIUTANG CHECKIN DATA 0 ");
                            logger.info("PIUTANG CHECKIN DATA 0 ");
                            resolve(false);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(false);
            }
        })
    }

    getJumlahCash(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'CASH' and Sud.id_payment = '0'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'CASH' and Sud.id_payment = '0'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(false);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data CASH "+ jumlah);
                        logger.info("Data CASH "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data CASH 0 ");
                        logger.info("Data CASH 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahCreditCard(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'CREDIT CARD' and Sud.id_payment = '1'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'CREDIT CARD' and Sud.id_payment = '1'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data CC "+ jumlah);
                        logger.info("Data CC "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data CC 0 ");
                        logger.info("Data CC 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahDebetCard(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'DEBET CARD' and Sud.id_payment = '2'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'DEBET CARD' and Sud.id_payment = '2'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data DEBET CARD "+ jumlah);
                        logger.info("Data DEBET CARD "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data DEBET CARD 0 ");
                        logger.info("Data DEBET CARD 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahPiutang(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'PIUTANG' and Sud.id_payment = '3'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'PIUTANG' and Sud.id_payment = '3'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data PIUTANG "+ jumlah);
                        logger.info("Data PIUTANG "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data PIUTANG 0 ");
                        logger.info("Data PIUTANG ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahComplimentary(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'COMPLIMENTARY' and Sud.id_payment = '4'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'COMPLIMENTARY' and Sud.id_payment = '4'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data COMPLIMENTARY "+ jumlah);
                        logger.info("Data COMPLIMENTARY "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data COMPLIMENTARY 0 ");
                        logger.info("Data COMPLIMENTARY ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahEmoney(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'E-MONEY' and Sud.id_payment = '31'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'E-MONEY' and Sud.id_payment = '31'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data E-MONEY "+ jumlah);
                        logger.info("Data E-MONEY "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data E-MONEY 0 ");
                        logger.info("Data E-MONEY ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahTransfer(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'TRANSFER' and Sud.id_payment = '32'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'TRANSFER' and Sud.id_payment = '32'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data TRANSFER "+ jumlah);
                        logger.info("Data TRANSFER "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data TRANSFER 0 ");
                        logger.info("Data TRANSFER ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahPoinMembership(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var chusr = chusr_;
              var shift = shift_;

              if (chusr != '-'){
                  isiQuery = `set dateformat dmy
                  SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                  FROM IHP_Sul Sul, IHP_Sud Sud
                  WHERE 
                  Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                  Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                  Sul.summary = Sud.summary and 
                  Sud.nama_payment = 'POIN MEMBERSHIP'
                  and Sul.Shift = ${shift}
                  and Sul.CHusr = ${chusr}`
              } else {
                  isiQuery = `set dateformat dmy
                  SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                  FROM IHP_Sul Sul, IHP_Sud Sud
                  WHERE 
                  Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                  Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                  Sul.summary = Sud.summary and 
                  Sud.nama_payment = 'POIN MEMBERSHIP'
                  and Sul.Shift = ${shift}`
              }

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                          var jumlah = dataReturn.recordset[0].jumlah;
                      
                      console.log("Data Poin Membership "+ jumlah);
                      logger.info("Data Poin Membership "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("Data Poin Membership 0 ");
                      logger.info("Data Poin Membership ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
  }

    getJumlahVoucher(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'VOUCHER' and Sud.id_payment = '5'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'VOUCHER' and Sud.id_payment = '5'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data VOUCHER "+ jumlah);
                        logger.info("Data VOUCHER "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data VOUCHER 0 ");
                        logger.info("Data VOUCHER 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahUangMuka(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'UANG MUKA' and Sud.id_payment = '6'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'UANG MUKA' and Sud.id_payment = '6'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data UANG MUKA "+ jumlah);
                        logger.info("Data UANG MUKA "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data UANG MUKA 0 ");
                        logger.info("Data UANG MUKA 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahSmartCard(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'SMART CARD' and Sud.id_payment = '7'
                    and Sul.Shift = ${shift}
                    and Sul.CHusr = ${chusr}`
                } else {
                    isiQuery = `set dateformat dmy
                    SELECT DISTINCT isnull(SUM(Sud.pay_value), 0) as jumlah
                    FROM IHP_Sul Sul, IHP_Sud Sud
                    WHERE 
                    Sul.date_trans >= cast('${dateFormat(tanggalAwal, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.date_trans <= cast('${dateFormat(tanggalAkhir, "dd/mm/yyyy HH:MM:ss")}' as datetime) and
                    Sul.summary = Sud.summary and 
                    Sud.nama_payment = 'SMART CARD' and Sud.id_payment = '7'
                    and Sul.Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data SMART CARD "+ jumlah);
                        logger.info("Data SMART CARD "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data SMART CARD 0 ");
                        logger.info("Data SMART CARD 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahPendapatanLain(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set dateformat dmy
                    Select isnull(SUM(Uang_Muka),0) as pendapatan_lain
                    from IHP_Rsv where date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) and status = 3 and
                    Shift = ${shift}
                    and CHUsr = ${chusr}`
                } else {
                    isiQuery = `Set dateformat dmy
                    Select isnull(SUM(Uang_Muka),0) as pendapatan_lain
                    from IHP_Rsv where date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) and status = 3 and
                    Shift = ${shift}`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].pendapatan_lain;
                        
                        console.log("Data Pendapatan  lain "+ jumlah);
                        logger.info("Data Pendapatan  lain "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Pendapatan  lain 0 ");
                        logger.info("Data Pendapatan  lain 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahUangMukaCheckinBelumBayar(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set dateformat dmy
                    Select isnull(SUM(Uang_Muka),0) as jumlah
                    from IHP_Rcp where date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) and 
                    Shift = ${shift} and Reservation = ''
                    and Reception not in
                    (select reception from ihp_Sul
                    where date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and shift = ${shift}
                    and CHUsr = ${chusr})`
                } else {
                    isiQuery = `Set dateformat dmy
                    Select isnull(SUM(Uang_Muka),0) as jumlah
                    from IHP_Rcp where date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) and 
                    Shift = ${shift} and Reservation = ''
                    and Reception not in
                    (select reception from ihp_Sul where 
                    date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                    date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and shift = ${shift})`
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka belum bayar "+ jumlah);
                        logger.info("Data Uang Muka belum bayar "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka belum bayar 0 ");
                        logger.info("Data Uang Muka belum bayar 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahUangMukaCheckinCash(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and CHUsr = ${chusr}
                    and (ID_Payment = '0') 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                } else {
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and (ID_Payment = '0') 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka Tunai "+ jumlah);
                        logger.info("Data Uang Muka Tunai "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka Tunai 0 ");
                        logger.info("Data Uang Muka Tunai 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }
  
    getJumlahUangMukaCheckinTransfer(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and CHUsr = ${chusr}
                    and (ID_Payment = '32') 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                } else {
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and (ID_Payment = '32') 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka Tunai "+ jumlah);
                        logger.info("Data Uang Muka Tunai "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka Tunai 0 ");
                        logger.info("Data Uang Muka Tunai 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahUangMukaCheckinCreditCard(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and CHUsr = ${chusr}
                    and ID_Payment = '1' 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                } else {
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and ID_Payment = '1'  
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka Kartu Kredit "+ jumlah);
                        logger.info("Data Uang Muka Kartu Kredit "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka Kartu Kredit 0 ");
                        logger.info("Data Uang Muka Kartu Kredit 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahUangMukaCheckinDebetCard(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and CHUsr = ${chusr}
                    and ID_Payment = '2' 
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                } else {
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(
                      SUM(Uang_Muka), 
                      0
                    ) as jumlah 
                  from 
                    IHP_Rcp 
                  where 
                    date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                    and Shift = ${shift} 
                    and Reservation = ''
                    and ID_Payment = '2'  
                    and Reception not in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                        and shift = ${shift}
                    )
                  `
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka Kartu Debit "+ jumlah);
                        logger.info("Data Uang Muka Kartu Debit "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka Kartu Debit 0 ");
                        logger.info("Data Uang Muka Kartu Debit 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahInvoice(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;
                var nilai = {
                  totalKamar : 0,
                  totalPenjualan : 0
              }

                isiQuery = `Set 
                    dateformat dmy 
                  Select 
                  isnull(Total_Kamar + Total_Extend,0) as Total_Kamar, 
                  isnull(Total_Penjualan,0) as Total_Penjualan, 
                  Reception, 
                  Transfer 
                  from 
                    IHP_Ivc 
                  where 
                    date_trans >= CONVERT(
                        datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                        120
                      ) 
                    and date_trans <= CONVERT(
                        datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                        120
                      ) 
                    and status <> 0
                    and reception in (
                      select 
                        reception 
                      from 
                        ihp_Sul 
                      where 
                        date_trans >= CONVERT(
                            datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                            120
                          ) 
                        and date_trans <= CONVERT(
                            datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                            120
                          ) 
                        and Shift = ${shift})`

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(false);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){  
                        console.log("Data Total invoice "+ nilai);
                        logger.info("Data Total invoice "+ nilai);
                        resolve(dataReturn.recordset);
                        } else{
                        console.log("Data Total invoice 0 ");
                        logger.info("Data Total invoice 0 ");
                        resolve(false);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(nilai);
            }
        })
    }

    getTransferKamar(db_, invoice_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var invoice = invoice_;
                var jumlah = 0;
    
                    isiQuery = `Select 
                    isnull(total_all,0) as total_transfer,
                    isnull(Total_Penjualan,0) as total_penjualan, 
                    Transfer from IHP_Ivc 
                    where Invoice = '${invoice}'`
    
                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                        console.log("Data Transfer kamar "+ jumlah);
                        logger.info("Data Transfer kamar "+ jumlah);
                        resolve(dataReturn.recordset);
                        } else{
                        console.log("Data Transfer kamar 0 ");
                        logger.info("Data Transfer kamar 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getTransferMakanan(db_, invoice_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var invoice = invoice_;
                var jumlah = 0;
    
                    isiQuery = `Select 
                    isnull(Total_Penjualan,0) as total_transfer, 
                    Transfer from IHP_Ivc 
                    where Invoice = '${invoice}'`
    
                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                        console.log("Data Transfer Penjualan "+ jumlah);
                        logger.info("Data Transfer Penjualan "+ jumlah);
                        resolve(dataReturn.recordset);
                        } else{
                        console.log("Data Transfer Penjualan 0 ");
                        logger.info("Data Transfer Penjualan 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahReservasiBelumCheckin(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(sum(Uang_Muka),0) as jumlah 
                  from 
                    IHP_Rsv 
                  where 
                    Shift = ${shift}
                    and date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) 
                    and CHusr = ${chusr} 
                    and Status = 1 
                    and Reservation not in (Select Reservation from IHP_Rcp)
                  `
                } else {
                    isiQuery = `Set 
                    dateformat dmy 
                  Select 
                    isnull(sum(Uang_Muka),0) as jumlah 
                  from 
                    IHP_Rsv 
                  where 
                    Shift = ${shift}
                    and date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) 
                    and Status = 1 
                    and Reservation not in (Select Reservation from IHP_Rcp)
                  `
                }

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                            var jumlah = dataReturn.recordset[0].jumlah;
                        
                        console.log("Data Uang Muka Kartu Debit "+ jumlah);
                        logger.info("Data Uang Muka Kartu Debit "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("Data Uang Muka Kartu Debit 0 ");
                        logger.info("Data Uang Muka Kartu Debit 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahReservasiSudahCheckin(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggalAwal = tanggalAwal_;
                var tanggalAkhir = tanggalAkhir_;
                var chusr = chusr_;
                var shift = shift_;
                var dateRcp = '';
                var dateRsv = '';
                var shiftRcp = '';
                var shiftRsv = '';

                isiQuery = `Set dateformat dmy
                    SELECT isnull(Rcp.Uang_Muka,0) as Cash_In,Rcp.Shift as Shift_Rcp, Rsv.Shift as Shift_Rsv,                    
                    CONVERT(char,Rcp.Date_Trans, 105) as Date_Rcp, 
                    CONVERT(char,Rsv.Date_Trans, 105) as Date_Rsv
                    from IHP_Rcp Rcp, IHP_Rsv Rsv where
                    Rcp.Reservation = Rsv.Reservation
                    and 
                    Rsv.date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and
                    Rsv.date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                    and Rsv.Shift = ${shift}`
                

                db.request().query(isiQuery, function(err, dataReturn){
                    if(err){
                        sql.close();
                        logger.error(err);
                        logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                        resolve(0);
                    } else{
                        sql.close()
                        if(dataReturn.recordset.length > 0){
                        var jumlah = 0;
                        
                        console.log(`cekpanjang ${dataReturn.recordset.length}`);
                        for (var i=0; i< dataReturn.recordset.length; i++){
                          dateRsv = dataReturn.recordset[i].Date_Rsv;
                          dateRcp = dataReturn.recordset[i].Date_Rcp;
                          shiftRcp = dataReturn.recordset[i].Shift_Rcp;
                          shiftRsv = dataReturn.recordset[i].Shift_Rsv;
                          if (dateRcp != dateRsv){
                            jumlah = jumlah + dataReturn.recordset[i].Cash_In;
                          } else if(shiftRcp != shiftRsv){
                            jumlah = jumlah + dataReturn.recordset[i].Cash_In;
                          }
                        }
                        
                        console.log("JumlahReservasiSudahCheckin "+ jumlah);
                        logger.info("JumlahReservasiSudahCheckin "+ jumlah);
                        resolve(jumlah);
                        } else{
                        console.log("JumlahReservasiSudahCheckin 0 ");
                        logger.info("JumlahReservasiSudahCheckin 0 ");
                        resolve(0);
                        }
                    }
                })
            } catch{
                console.log(error);
                logger.error(error.message);
                logger.error('Catch Error prosesQuery ');
                resolve(0);
            }
        })
    }

    getJumlahPenjualan(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var chusr = chusr_;
              var shift = shift_;

              if (chusr != '-'){
                  isiQuery = `Set 
                  dateformat dmy 
                Select 
                isnull(Total_Penjualan,0) as Total_Penjualan 
                from 
                  IHP_Ivc 
                where 
                  date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                  and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                  and status <> 0
                  and Chusr = ${chusr} 
                  and reception in (
                    select 
                      reception 
                    from 
                      ihp_Sul 
                    where 
                      date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                      and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                      and Shift = ${shift})`
              } else {
                  isiQuery = `Set 
                  dateformat dmy 
                Select 
                isnull(Total_Penjualan,0) as Total_Penjualan 
                from 
                  IHP_Ivc 
                where 
                  date_trans >= CONVERT(
                      datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                  and date_trans <= CONVERT(
                      datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                      120
                    ) 
                  and status <> 0
                  and reception in (
                    select 
                      reception 
                    from 
                      ihp_Sul 
                    where 
                      date_trans >= CONVERT(
                          datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                      and date_trans <= CONVERT(
                          datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 
                          120
                        ) 
                      and Shift = ${shift})
                `
              }

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                          var jumlah = dataReturn.recordset[0].Total_Penjualan;
                      
                      console.log("Data Total Penjualan "+ jumlah);
                      logger.info("Data Total Penjualan "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("Data Total Penjualan 0 ");
                      logger.info("Data Total Penjualan 0 ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
    }

    getJumlahReservasiSudahCheckinBelumBayar(db_, tanggalAwal_, tanggalAkhir_, shift_, chusr_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var chusr = chusr_;
              var shift = shift_;

              if (chusr != '-'){
                  isiQuery = `Set dateformat dmy
                  Select isnull(Rcp.Uang_Muka,0) as jumlah
                  Rcp.Date_Trans as Date_Rcp, Rsv.Date_Trans as Date_Rsv
                  from IHP_Rcp Rcp, IHP_Rsv Rsv 
                  where
                  Rcp.Reservation = Rsv.Reservation and 
                  Rcp.date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                  Rcp.date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and Rcp.Shift = ${shift}
                  and Rcp.Reception not in (select reception from ihp_Sul where
                  date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                  date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and shift = ${shift}
                  and CHUsr = ${chusr})
                `
              } else {
                  isiQuery = `Set dateformat dmy
                  Select isnull(Rcp.Uang_Muka,0) as jumlah
                  from IHP_Rcp Rcp, IHP_Rsv Rsv 
                  where
                  Rcp.Reservation = Rsv.Reservation and 
                  Rcp.date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                  Rcp.date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and Rcp.Shift = ${shift}
                  and Rcp.Reception not in (select reception from ihp_Sul where
                  date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                  date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and shift = ${shift})`
              }

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                          var jumlah = dataReturn.recordset[0].jumlah;
                      
                      console.log("Data reservasi sudah checkin belum bayar "+ jumlah);
                      logger.info("Data reservasi sudah checkin belum bayar "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("Data reservasi sudah checkin belum bayar 0 ");
                      logger.info("Data reservasi sudah checkin belum bayar 0 ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
    }

    // cari uang muka

    getJumlahUangMukaReservasiBelumCheckin(db_, tanggalAwal_, tanggalAkhir_, shift_, idPayment_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var idPayment = idPayment_;
              var shift = shift_;

              isiQuery = `Set 
                  dateformat dmy 
                Select 
                  isnull(sum(Uang_Muka),0) as jumlah 
                from 
                  IHP_Rsv 
                where 
                  Shift = ${shift}
                  and date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and Id_Payment = ${idPayment}
                  and Status = 1 
                  and Reservation not in (Select Reservation from IHP_Rcp)
                `

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                          var jumlah = dataReturn.recordset[0].jumlah;
                      
                      console.log("Data JumlahUangMukaReservasiBelumCheckin "+ jumlah);
                      logger.info("Data JumlahUangMukaReservasiBelumCheckin "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("Data JumlahUangMukaReservasiBelumCheckin 0 ");
                      logger.info("Data JumlahUangMukaReservasiBelumCheckin 0 ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
    }

    getJumlahUangMukaReservasiSudahCheckin(db_, tanggalAwal_, tanggalAkhir_, shift_, idPayment_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var idPayment = idPayment_;
              var shift = shift_;
              var dateRcp = '';
              var dateRsv = '';
              var shiftRcp = '';
              var shiftRsv = '';

              isiQuery = `Set dateformat dmy
                  SELECT isnull(Rcp.Uang_Muka,0) as Cash_In,Rcp.Shift as Shift_Rcp, Rsv.Shift as Shift_Rsv,                    
                  CONVERT(char,Rcp.Date_Trans, 105) as Date_Rcp, 
                  CONVERT(char,Rsv.Date_Trans, 105) as Date_Rsv
                  from IHP_Rcp Rcp, IHP_Rsv Rsv where
                  Rcp.Reservation = Rsv.Reservation
                  and 
                  Rsv.date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and
                  Rsv.date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                  and Rsv.Id_Payment = ${idPayment}
                  and Rsv.Shift = ${shift}`
              

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                      var jumlah = 0;
                      
                      console.log(`cekpanjang ${dataReturn.recordset.length}`);
                      for (var i=0; i< dataReturn.recordset.length; i++){
                        dateRsv = dataReturn.recordset[i].Date_Rsv;
                        dateRcp = dataReturn.recordset[i].Date_Rcp;
                        shiftRcp = dataReturn.recordset[i].Shift_Rcp;
                        shiftRsv = dataReturn.recordset[i].Shift_Rsv;
                        if (dateRcp != dateRsv){
                          jumlah = jumlah + dataReturn.recordset[i].Cash_In;
                        } else if(shiftRcp != shiftRsv){
                          jumlah = jumlah + dataReturn.recordset[i].Cash_In;
                        }
                      }
                      
                      console.log("JumlahUangMukaReservasiSudahCheckin "+ jumlah);
                      logger.info("JumlahUangMukaReservasiSudahCheckin "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("JumlahUangMukaReservasiSudahCheckin 0 ");
                      logger.info("JumlahUangMukaReservasiSudahCheckin 0 ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
    }

    getJumlahUangMukaReservasiSudahCheckinBelumBayar(db_, tanggalAwal_, tanggalAkhir_, shift_, idPayment_){
    return new Promise((resolve, reject) =>{
        try{
            db = db_;
            var tanggalAwal = tanggalAwal_;
            var tanggalAkhir = tanggalAkhir_;
            var idPayment = idPayment_;
            var shift = shift_;

            isiQuery = `Set dateformat dmy
                Select isnull(Rcp.Uang_Muka,0) as jumlah
                from IHP_Rcp Rcp, IHP_Rsv Rsv 
                where
                Rcp.Reservation = Rsv.Reservation and 
                Rcp.date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                Rcp.date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                and Rcp.Shift = ${shift}
                and Rsv.Id_Payment = ${idPayment}
                and Rcp.Reception not in (select reception from ihp_Sul where
                date_trans >= CONVERT(datetime, '${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) and
                date_trans <= CONVERT(datetime, '${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120)
                and shift = ${shift})`
            

            db.request().query(isiQuery, function(err, dataReturn){
                if(err){
                    sql.close();
                    logger.error(err);
                    logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                    resolve(0);
                } else{
                    sql.close()
                    if(dataReturn.recordset.length > 0){
                        var jumlah = dataReturn.recordset[0].jumlah;
                    
                    console.log("Data JumlahUangMukaReservasiSudahCheckinBelumBayar "+ jumlah);
                    logger.info("Data JumlahUangMukaReservasiSudahCheckinBelumBayar "+ jumlah);
                    resolve(jumlah);
                    } else{
                    console.log("Data JumlahUangMukaReservasiSudahCheckinBelumBayar 0 ");
                    logger.info("Data JumlahUangMukaReservasiSudahCheckinBelumBayar 0 ");
                    resolve(0);
                    }
                }
            })
        } catch{
            console.log(error);
            logger.error(error.message);
            logger.error('Catch Error prosesQuery ');
            resolve(0);
        }
    })
    }

    getJumlahUangPendapatanLain(db_, tanggalAwal_, tanggalAkhir_, shift_, idPayment_){
      return new Promise((resolve, reject) =>{
          try{
              db = db_;
              var tanggalAwal = tanggalAwal_;
              var tanggalAkhir = tanggalAkhir_;
              var idPayment = idPayment_;
              var shift = shift_;

                  isiQuery = `Set dateformat dmy
                  Select isnull(SUM(Uang_Muka),0) as pendapatan_lain
                  from IHP_Rsv where 
                  date_trans >= CONVERT(datetime,'${dateFormat(tanggalAwal, "yyyy-mm-dd HH:MM:ss")}', 120) 
                  and
                  date_trans <= CONVERT(datetime,'${dateFormat(tanggalAkhir, "yyyy-mm-dd HH:MM:ss")}', 120) 
                  and status = 3 
                  and Id_Payment = ${idPayment}
                  and Shift = ${shift}`

              db.request().query(isiQuery, function(err, dataReturn){
                  if(err){
                      sql.close();
                      logger.error(err);
                      logger.error(err.message + 'Error ProsesQuery'+  isiQuery)
                      resolve(0);
                  } else{
                      sql.close()
                      if(dataReturn.recordset.length > 0){
                          var jumlah = dataReturn.recordset[0].pendapatan_lain;
                      
                      console.log("Data Pendapatan  lain "+ jumlah);
                      logger.info("Data Pendapatan  lain "+ jumlah);
                      resolve(jumlah);
                      } else{
                      console.log("Data Pendapatan  lain 0 ");
                      logger.info("Data Pendapatan  lain 0 ");
                      resolve(0);
                      }
                  }
              })
          } catch{
              console.log(error);
              logger.error(error.message);
              logger.error('Catch Error prosesQuery ');
              resolve(0);
          }
      })
  }

}
module.exports = Report;