var sql = require("mssql");
var logger = require ('../util/logger');
var db;
var isiQuery;

class Report{
    constructor(){ }

    getCINPaid(db_, tanggal_, shift_, chusr_){
        return new Promise((resolve, reject) =>{
            try{
            db = db_;
            var tanggal = tanggal_;
            var chusr = chusr_;
            var shift = shift_;
            var isiQuery;

            if (chusr != '-'){
                isiQuery = `Set dateformat dmy
                Select Count(Rcp.Reception) as jumlah_checkin_sudah_bayar,
                isnull(sum(RCP.Pax),0) as jumlah_tamu_sudah_bayar
                from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room 
                where
                Rcp.CheckIn >= cast('${tanggal} 08:00:00' as datetime) and
                Rcp.CheckIn <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) and
                RCp.kamar = Room.Kamar and 
                (Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE'and
                Room.Jenis_Kamar <> 'RESTO') and
                Rcp.reception in (select reception from hp112.dbo.ihp_Sul where date_trans >= cast('${tanggal} 08:00:00' as datetime)) and
                date_trans <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) and
                Shift = ${shift} and 
                Rcp.Chusr = '${chusr}'`    
            } else {
                isiQuery = `Set dateformat dmy
                Select Count(Rcp.Reception) as jumlah_checkin_sudah_bayar,
                isnull(sum(RCP.Pax),0) as jumlah_tamu_sudah_bayar
                from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room 
                where
                Rcp.CheckIn >= cast('${tanggal} 08:00:00' as datetime) and
                Rcp.CheckIn <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) and
                RCp.kamar = Room.Kamar and 
                (Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE'and
                Room.Jenis_Kamar <> 'RESTO') and
                Rcp.reception in (select reception from hp112.dbo.ihp_Sul where date_trans >= cast('${tanggal} 08:00:00' as datetime)) and
                date_trans <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) and
                Shift = ${shift}` 
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

    getJumlahJamPaid(db_, tanggal_, shift_, chusr_){
        return new Promise ((resolve, reject) =>{
            try{
                db = db_;
                var tanggal = tanggal_;
                var chusr = chusr_;
                var shift = shift_;
                var isiQuery;
    
                 if (chusr != '-'){
                isiQuery = ` set dateformat dmy
                select distinct
                CONVERT(char,r.date_trans,105) as tanggal,
                isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_sudah_bayar,
                isnull(sum(r.pax),0) as jumlah_tamu_sudah_bayar
                from
                hp112.dbo.ihp_rcp as r
                left join hp112.dbo.ihp_ext as e on r.reception = e.reception and
                e.status = 1, 
                hp112.dbo.IHP_room room 
                where 
                CONVERT(varchar,r.date_trans,105) = CONVERT(varchar,'${tanggal}',105) and
                
                r.kamar = room.kamar and
                (
                Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE' and
                Room.Jenis_Kamar <> 'RESTO') and
                r.reception in (select reception from hp112.dbo.ihp_Sul where CONVERT(char,date_trans,105) >= CONVERT(char,'${tanggal}',105) and CONVERT(char,date_trans,105) <= CONVERT(char, DATEADD(day, 1, '${tanggal}'),105) and Shift = '${shift}' and r.Chusr = '${chusr}' )
                group by CONVERT(char,r.date_trans,105)`
                
            } else {
                isiQuery = `set dateformat dmy
                select distinct
                CONVERT(char,r.date_trans,105) as tanggal,
                isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_sudah_bayar,
                isnull(sum(r.pax),0) as jumlah_tamu_sudah_bayar
                from
                hp112.dbo.ihp_rcp as r
                left join hp112.dbo.ihp_ext as e on r.reception = e.reception and
                e.status = 1, 
                hp112.dbo.IHP_room room 
                where 
                CONVERT(varchar,r.date_trans,105) = CONVERT(varchar,'${tanggal}',105) and
                
                r.kamar = room.kamar and
                (
                Room.Jenis_Kamar <> 'LOBBY' and
                Room.Jenis_Kamar <> 'BAR' and
                Room.Jenis_Kamar <> 'LOUNGE' and
                Room.Jenis_Kamar <> 'RESTO') and
                r.reception in (select reception from hp112.dbo.ihp_Sul where CONVERT(char,date_trans,105) >= CONVERT(char,'${tanggal}',105) and CONVERT(char,date_trans,105) <= CONVERT(char,DATEADD(day, 1,'${tanggal}'),105) and Shift = '${shift}' )
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

    getCINPiutang(db_, tanggal_, shift_,  chusr_){
        return new Promise((resolve, reject) =>{
            try{
                db = db_;
                var tanggal = tanggal_;
                var chusr = chusr_;
                var shift = shift_;
                var isiQuery;
                
                if (chusr != '-'){
                    isiQuery = `Set dateformat dmy
                    Select Count(Rcp.Reception) as jumlah_checkin_piutang,
                    isnull(sum(RCP.Pax),0) as jumlah_tamu_piutang 
                    from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room
                    WHERE (Rcp.CheckIn >= cast('${tanggal} 08:00:00' as datetime) and
                           Rcp.CheckIn <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime))) and
                            Rcp.kamar = Room.Kamar and
                            (
                                Room.Jenis_Kamar <> 'LOBBY' and
                                Room.Jenis_Kamar <> 'BAR' and
                                Room.Jenis_Kamar <> 'LOUNGE' and
                                Room.Jenis_Kamar <> 'RESTO'
                            ) and 
                            Rcp.Shift = '${shift}' and
                            Rcp.reception not in (select reception from hp112.dbo.ihp_Sul 
                                where date_trans >= cast('${tanggal} 08:00:00' as datetime) and 
                                date_trans <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) 
                                and Shift = '${shift}' and Rcp.Chusr = '${chusr}')`
                }else{
                    isiQuery = `Set dateformat dmy
                    Select Count(Rcp.Reception) as jumlah_checkin_piutang,
                    isnull(sum(RCP.Pax),0) as jumlah_tamu_piutang 
                    from hp112.dbo.IHP_Rcp Rcp, hp112.dbo.Ihp_Room Room
                    WHERE (Rcp.CheckIn >= cast('${tanggal} 08:00:00' as datetime) and
                           Rcp.CheckIn <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime))) and
                            Rcp.kamar = Room.Kamar and
                            (
                                Room.Jenis_Kamar <> 'LOBBY' and
                                Room.Jenis_Kamar <> 'BAR' and
                                Room.Jenis_Kamar <> 'LOUNGE' and
                                Room.Jenis_Kamar <> 'RESTO'
                            ) and 
                            Rcp.Shift = '${shift}' and
                            Rcp.reception not in (select reception from hp112.dbo.ihp_Sul 
                                where date_trans >= cast('${tanggal} 08:00:00' as datetime) and 
                                date_trans <= DATEADD(DAY, 1, cast('${tanggal} 05:00:00' as datetime)) 
                                and Shift = '${shift}')`
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

    getJumlahJamPiutang(db_, tanggal_, shift_, chusr_){
        return new Promise((resolve, reject) => {
            try{
                db = db_;
                var tanggal = tanggal_;
                var chusr = chusr_;
                var shift = shift_;

                if (chusr != '-'){
                    isiQuery = ` set dateformat dmy
                    select distinct
                    CONVERT(char,r.date_trans,105) as tanggal,
                    isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_piutang,
                    isnull(sum(r.pax),0) as jumlah_tamu_piutang
                    from
                    hp112.dbo.ihp_rcp as r
                    left join hp112.dbo.ihp_ext as e on r.reception = e.reception and
                    e.status = 1, 
                    hp112.dbo.IHP_room room 
                    where 
                    CONVERT(varchar,r.date_trans,105) = CONVERT(varchar,'${tanggal}',105) and
                    
                    r.kamar = room.kamar and
                    (
                    Room.Jenis_Kamar <> 'LOBBY' and
                    Room.Jenis_Kamar <> 'BAR' and
                    Room.Jenis_Kamar <> 'LOUNGE' and
                    Room.Jenis_Kamar <> 'RESTO') and
                    r.reception not in (select reception from hp112.dbo.ihp_Sul where CONVERT(char,date_trans,105) >= CONVERT(char,'${tanggal}',105) and CONVERT(char,date_trans,105) <= CONVERT(char, DATEADD(day, 1, '${tanggal}') ,105) and Shift = '${shift}' and r.Chusr = '${chusr}' )
                    group by CONVERT(char,r.date_trans,105)`
                    
                } else {
                    isiQuery = `set dateformat dmy
                    select distinct
                    CONVERT(char,r.date_trans,105) as tanggal,
                    isnull(sum(r.jam_sewa),0) + isnull(sum(e.jam_extend),0) as jumlah_jam_piutang,
                    isnull(sum(r.pax),0) as jumlah_tamu_piutang
                    from
                    hp112.dbo.ihp_rcp as r
                    left join hp112.dbo.ihp_ext as e on r.reception = e.reception and
                    e.status = 1, 
                    hp112.dbo.IHP_room room 
                    where 
                    CONVERT(varchar,r.date_trans,105) = CONVERT(varchar,'${tanggal}',105) and
                    
                    r.kamar = room.kamar and
                    (
                    Room.Jenis_Kamar <> 'LOBBY' and
                    Room.Jenis_Kamar <> 'BAR' and
                    Room.Jenis_Kamar <> 'LOUNGE' and
                    Room.Jenis_Kamar <> 'RESTO') and
                    r.reception not in (select reception from hp112.dbo.ihp_Sul where CONVERT(char,date_trans,105) >= CONVERT(char,'${tanggal}',105) and CONVERT(char,date_trans,105) <= CONVERT(char,DATEADD(day, 1, '${tanggal}'),105) and Shift = '${shift}' )
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
}
module.exports = Report;