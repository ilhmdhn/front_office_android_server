var ResponseFormat = require('../util/response');
var sql = require("mssql");
var request = require('request');
var DBConnection = require('../util/db.pool');
const fs = require('fs');
var logger;
var db;
var a;
var cek_koneksi_internet;

exports.getGenerateIdNonMember = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    var formDataResponseFromServer = [];
    nama0 = req.params.nama;
    panjang = nama0.length;
    var karakter;
    var a;
    var tmpNama = '';
    for (a = 0; a < panjang; a++) {
        karakter = nama0.charAt(a);
        if ((karakter != ',') && (karakter != '.') && (karakter != ' ')) {
            tmpNama = tmpNama + karakter;
        }
    }

    var tmpNama1 = tmpNama;
    var tmpNama2 = '';

    for (a = 0; a < tmpNama1.length; a++) {
        karakter = tmpNama1.charAt(a);
        if (a < 9) {
            tmpNama2 = tmpNama2 + karakter;
        }
    }


    tmpNama2 = tmpNama2 + '-1';
    tmpNama3 = tmpNama2.toUpperCase();
    formDataResponseFromServer.push({
        nama: tmpNama3
    });
    dataResponse = new ResponseFormat(true, formDataResponseFromServer);
    res.send(dataResponse);

};

exports.getWebMembership = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    var ip_server = await new DBConnection().getIpServer();
    var port_server = await new DBConnection().getPortServer();
    logger = req.log;

    cek_koneksi_internet = false;
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("!!!---Attention No Internet connection---!!! Can not check Voucher and Member");
            cek_koneksi_internet = false;
            var isiQuery = "" +
                " select " +
                " Member as member " +
                " ,[Sex] as sex " +
                " ,[Expire_Date] as expired_date " +
                " ,[Nama_Lengkap] as nama_lengkap " +
                " ,[ALAMAT] as alamat " +
                " ,[KOTA] as kota " +
                " ,[Hp] hp " +
                " ,[FAX] as fax " +
                " ,[EMAIL] email " +
                " ,[BirthDay] as birth_day " +
                " ,case when Jenis_Member is null then 'BASIC'  " +
                " else Jenis_Member end as jenis_member " +
                " ,[Smart_Card] as smart_card " +
                " ,[Diskon_Room] as diskon_room " +
                "  ,[Diskon_Food] as diskon_food " +
                " ,[Point_Reward] as point_reward " +
                " ,isnull([Code_Tipe_Member],0) as code_tipe_member " +
                " ,isnull([Pengali_Poin],0) as pengali_poin " +
                " ,isnull([File_Photo],'') as file_photo " +
                " ,isnull([Verifikasi_Email],0) as verifikasi_email " +
                " ,isnull([Verifikasi_Hp],0) as verifikasi_hp " +
                " ,isnull([Verifikasi_Id_Card],0) as verifikasi_id_card " +
                " ,isnull([Verifikasi_Id_Card_Note],0) as verifikasi_id_card_note " +
                " ,isnull([Id_Card_Name],0) as id_card_name " +
                " ,isnull([Id_Card_Url],0) as id_card_url " +
                " ,isnull([Id_Card_Address],0) as Code_Tipe_Member " +
                " ,isnull([Id_Card_City],0) as id_card_city " +
                " ,isnull([Id_Card_Nik],0) as id_card_nik " +
                " ,isnull([Verifikasi_Id_Card_Note],'') as verifikasi_id_card_note " +
                "  FROM [dbo].[IHP_MBR]  where member= '" + req.params.web_membership + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
                        res.send(dataResponse);
                    } else {
                        res.send(new ResponseFormat(false, null, "Error getWebMembership -> No Internet connection"));
                    }

                }
            });

        } else {
            console.log("Internet Connected");
            cek_koneksi_internet = true;
            try {
                var param = req.params.web_membership;
                //var url = "http://13.76.167.131:4012/mbr/detail_/";
                //var url = "http://13.76.167.131:3011/mbr/detail_/";
                var url_ = "http://13.76.167.131:3013/mbr/detail_/";
                url_ = url_ + param;
                url_ = url_ + "/" + ip_server;
                url_ = url_ + "/" + port_server;

                request.get({
                    url: url_
                },
                    function optionalCallback(err, response, body) {
                        if (err) {
                            logger.error("Error getWebMembership -> " + err.message);
                            console.log("Error getWebMembership -> " + err.message);
                            dataResponse = new ResponseFormat(false, null, "Error getWebMembership " + err.message);
                            res.send(dataResponse);
                        } else {
                            try {
                                var responya = response.body;
                                var body0 = JSON.parse(responya);
                                if (body0.length > 0) {
                                    if (body0.state == true) {
                                        insertUpdateIhpMbr(res, body0.data);
                                    } else {
                                        var dataKosong = "Data tidak ditemukan";
                                        dataResponse = new ResponseFormat(false, null, dataKosong);
                                        res.send(dataResponse);
                                    }
                                }
                            } catch (error) {
                                logger.error("Error getWebMembership -> " + error.message);
                                res.send(new ResponseFormat(false, null, "Error getWebMembership " + error.message));
                            }
                        }
                    });
            } catch (error) {
                logger.error("Catch Error getWebMembership -> " + error);
                var pesanError = "Error " + err.message;
                dataResponse = new ResponseFormat(false, null, pesanError);
                res.send(dataResponse);
            }
        }
    });

};

exports.getWebMembershipFoto = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    try {
        var dir = './images';
        var dir_member = './images/member';
        var dir_uploads = './images/member/uploads';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(dir_member)) {
            fs.mkdirSync(dir_member);
        }

        if (!fs.existsSync(dir_uploads)) {
            fs.mkdirSync(dir_uploads);
        }

        var param = req.params.web_membership;
        //var url = "http://13.76.167.131:4012/mbr/detail_/";
        //var url = "http://13.76.167.131:3011/mbr/detail_/";
        var url_ = "https://club.happypuppy.id/user_uploads/";
        url_ = url_ + param;
        const path = "./images/member/" + param;

        //disable certificate  https://club.happypuppy.id
        //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        const download = (url_, path, callback) => {
            request.head(url_, (err, res, body) => {
                request(url_)
                    .pipe(fs.createWriteStream(path))
                    .on('close', callback);
            });
        };

        download(url_, path, (err) => {
            console.log('✅ Done!');
            if (err) {
                console.log(err);
            }
            else {

                if (param.includes('uploads') == true) {
                    fs.readFile('./images/noimage.png', function (err, content_) {
                        if (err) {
                            console.log(err);
                            res.writeHead(400, { 'Content-type': 'text/html' });
                            res.end("No such image");
                        } else {
                            //specify the content type in the response will be an image
                            res.writeHead(200, { 'Content-type': 'image/jpg' });
                            res.end(content_);
                        }
                    });
                }
                else {
                    fs.readFile('./images/member/' + param, function (err, content) {
                        if (err) {
                            fs.readFile('./images/noimage.png', function (err, content_) {
                                if (err) {
                                    console.log(err);
                                    res.writeHead(400, { 'Content-type': 'text/html' });
                                    res.end("No such image");
                                } else {
                                    //specify the content type in the response will be an image
                                    res.writeHead(200, { 'Content-type': 'image/jpg' });
                                    res.end(content_);
                                }
                            });
                            //end jika gambar tidak ada
                        } else {
                            //specify the content type in the response will be an image
                            res.writeHead(200, { 'Content-type': 'image/jpg' });
                            res.end(content);
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
        logger.error("Catch Error getWebMembership -> " + error);
        dataResponse = new ResponseFormat(false, null, "Error " + error.message);
        res.send(dataResponse);
    }
};

async function insertUpdateIhpMbr(res, body) {
    var res0 = res;
    try {
        var member0 = body[0].member;
        var nama_Lengkap0;
        var Jenis_Member0;
        var isprosesQueryDone;

        var isiQuery = " Select Member From IHP_Mbr where Member='" + member0 + "'";
        var isProsesgetCekMemberDone = await getCekMember(isiQuery);
        if (isProsesgetCekMemberDone != false) {
            console.log("Sukses isProsesgetCekMemberDone: " + isProsesgetCekMemberDone);
            logger.info("Sukses isProsesgetCekMemberDone: " + isProsesgetCekMemberDone);
            nama_Lengkap0 = body[0].nama_lengkap.toUpperCase();
            Jenis_Member0 = body[0].jenis_member.toUpperCase();
            var updateQuery = " Update IHP_Mbr set " +
                " Nama_Lengkap='" + nama_Lengkap0 + "' " +
                " ,[Date]=CONVERT(VARCHAR(10), GETDATE(), 103) + ' '  + convert(VARCHAR(8), GETDATE(), 14)" +
                " ,Chtime=getdate()" +
                " ,ALAMAT='" + body[0].alamat + "' " +
                " ,BirthDay='" + body[0].birth_day + "' " +
                " ,Smart_Card='2' " +
                " ,Diskon_Food='" + body[0].diskon_food + "' " +
                " ,Diskon_Room='" + body[0].diskon_room + "' " +
                " ,EMAIL='" + body[0].email + "' " +
                " ,Expire_Date='" + body[0].expire_date + "' " +
                " ,FAX='" + body[0].fax + "' " +
                " ,Hp='" + body[0].hp + "' " +
                " ,Telepon='" + body[0].hp + "' " +
                " ,Jenis_Member='" + Jenis_Member0 + "' " +
                " ,Code_Tipe_Member='" + body[0].code_tipe_member + "' " +
                " ,KOTA='" + body[0].kota + "' " +
                " ,Pengali_Poin='" + body[0].pengali_poin + "' " +
                " ,Point_Reward='" + body[0].point_reward + "' " +
                " ,Sex='" + body[0].sex + "' " +
                " ,File_Photo='" + body[0].photo + "' " +
                " ,Verifikasi_Email='" + body[0].verifikasi_email + "' " +
                " ,Verifikasi_Hp='" + body[0].verifikasi_hp + "' " +
                " ,Verifikasi_Id_Card='" + body[0].verifikasi_id_card + "' " +
                " ,Verifikasi_Id_Card_Note='" + body[0].verifikasi_id_card_note + "' " +
                " ,Id_Card_Name='" + body[0].id_card_name + "' " +
                " ,Id_Card_Nik='" + body[0].id_card_nik + "' " +
                " ,Id_Card_City='" + body[0].id_card_city + "' " +
                " ,Id_Card_Address='" + body[0].id_card_address + "' " +
                " ,Id_Card_Url='" + body[0].id_card_url + "' " +
                " where Member='" + body[0].member + "'";

            isprosesQueryDone = await prosesQuery(updateQuery);
            if (isprosesQueryDone != false) {
                console.log("Sukses Update Member: " + body[0].member);
                logger.info("Sukses Update Member: " + body[0].member);

                dataResponse = new ResponseFormat(true, body[0]);
                res0.send(dataResponse);
            }
            if (isprosesQueryDone == false) {
                console.log("Gagal Update Member: " + body[0].member);
                logger.info("Gagal Update Member: " + body[0].member);
                dataResponse = new ResponseFormat(true, body[0]);
                res0.send(dataResponse);
            }

        } else if (isProsesgetCekMemberDone == false) {
            console.log("Member Kosong: " + member0);
            logger.info("Member Kosong: " + member0);
            nama_Lengkap0 = body[0].nama_lengkap.toUpperCase();
            Jenis_Member0 = body[0].jenis_member.toUpperCase();
            var insertQuery = " INSERT INTO [dbo].[IHP_MBR]" +
                "([Member]" +
                ",[DATE]" +
                ",[Expire_Date]" +
                ",[Nama_Lengkap]" +
                ",[Sex]" +
                ",[ALAMAT]" +
                ",[KOTA]" +
                ",[KODEPOS]" +
                ",[Telepon]" +
                ",[FAX]" +
                ",[Hp]" +
                ",[EMAIL]" +
                ",[BirthDay]" +
                ",[BirthPlace]" +
                ",[StateMarital]" +
                ",[DateMarital]" +
                ",[AGAMA]" +
                ",[JOB]" +
                ",[MPOP]" +
                ",[MDANGDUT]" +
                ",[MDISCO]" +
                ",[MROCK]" +
                ",[MROCKNROLL]" +
                ",[MJAZZ]" +
                ",[MBLUES]" +
                ",[MLAIN]" +
                ",[PFAV01]" +
                ",[PFAV02]" +
                ",[PFAV03]" +
                ",[CHtime]" +
                ",[CHUSR]" +
                ",[STATUS]" +
                ",[Jenis_Member]" +
                ",[LASTLOGIN]" +
                ",[Jumlah_Checkin]" +
                ",[Total_Sewa_Kamar]" +
                ",[Total_Pembelian]" +
                ",[Point_Reward]" +
                ",[Saldo]" +
                ",[Picture_Member]" +
                ",[EXPORT]" +
                ",[Smart_Card]" +
                ",[Diskon_Room]" +
                ",[Diskon_Food]" +
                ",[Code_Tipe_Member]" +
                ",[Pengali_Poin]" +
                ",[File_Photo]" +
                ",[Verifikasi_Email]" +
                ",[Verifikasi_Hp]" +
                ",[Verifikasi_Id_Card]" +
                ",[Verifikasi_Id_Card_Note]" +
                ",[Id_Card_Name]" +
                ",[Id_Card_Nik]" +
                ",[Id_Card_City]" +
                ",[Id_Card_Address]" +
                ",[Id_Card_Url]" +
                ")" +
                "VALUES " +
                "(" +
                "'" + body[0].member + "'" +
                ",CONVERT(VARCHAR(10), GETDATE(), 103) + ' '  + convert(VARCHAR(8), GETDATE(), 14)" +
                ",'" + body[0].expire_date + "'" +
                ",'" + nama_Lengkap0 + "'" +
                ",'" + body[0].sex + "'" +
                ",'" + body[0].alamat + "'" +
                ",'" + body[0].kota + "'" +
                ",''" +
                ",'" + body[0].hp + "'" +
                ",'" + body[0].fax + "'" +
                ",'" + body[0].hp + "'" +
                ",'" + body[0].email + "'" +
                ",'" + body[0].birth_day + "'" +
                ",''" +
                ",''" +
                ",'01/01/1900 00:00:00'" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                ",''" +
                " ,getdate()" +
                ",''" +
                ",'TRUE'" +
                ",'" + Jenis_Member0 + "'" +
                ",CONVERT(VARCHAR(10), GETDATE(), 103) + ' '  + convert(VARCHAR(8), GETDATE(), 14)" +
                ",0" +
                ",0" +
                ",0" +
                "," + body[0].point_reward + "" +
                ",0" +
                ",''" +
                ",''" +
                " ,'2' " +
                "," + body[0].diskon_room + "" +
                "," + body[0].diskon_food + "" +
                ",'" + body[0].code_tipe_member + "'" +
                "," + body[0].pengali_poin + "" +
                ",'" + body[0].photo + "'" +
                ",'" + body[0].verifikasi_email + "'" +
                ",'" + body[0].verifikasi_hp + "'" +
                ",'" + body[0].verifikasi_id_card + "'" +
                ",'" + body[0].verifikasi_id_card_note + "'" +
                ",'" + body[0].id_card_name + "'" +
                ",'" + body[0].id_card_nik + "'" +
                ",'" + body[0].id_card_city + "'" +
                ",'" + body[0].id_card_address + "'" +
                ",'" + body[0].id_card_url + "'" +
                ")";

            isprosesQueryDone = await prosesQuery(insertQuery);
            if (isprosesQueryDone != false) {
                console.log("Sukses insert Member: " + body[0].member);
                logger.info("Sukses insert Member: " + body[0].member);

                dataResponse = new ResponseFormat(true, body[0]);
                res0.send(dataResponse);
            } else if (isprosesQueryDone == false) {
                console.log("Gagal insert Member: " + body[0].member);
                logger.info("Gagal insert Member: " + body[0].member);
                dataResponse = new ResponseFormat(true, body[0]);
                res0.send(dataResponse);
            }
        }
    } catch (error) {
        logger.error('Error isProsesgetCekMemberDone ' + error.message);
        dataResponse = new ResponseFormat(false, null, error.message);
        res0.send(dataResponse);
    }
}

function getCekMember(isiQuery) {
    return new Promise((resolve, reject) => {
        try {
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        var member = dataReturn.recordset[0].Member;
                        resolve(member);
                    } else {
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

function getMemberLokal(member_) {
    return new Promise((resolve, reject) => {
        try {
            var member = member_;
            var isiQuery = "" +
                " select " +
                " Member as member " +
                " ,[Sex] as sex " +
                " ,[Expire_Date] as expired_date " +
                " ,[Nama_Lengkap] as nama_lengkap " +
                " ,[ALAMAT] as alamat " +
                " ,[KOTA] as kota " +
                " ,[Hp] kota " +
                " ,[FAX] as fax " +
                " ,[EMAIL] email " +
                " ,[BirthDay] as birth_day " +
                " ,case when Jenis_Member is null then 'BASIC'  " +
                " else Jenis_Member end as jenis_member " +
                " ,[Smart_Card] as smart_card " +
                " ,[Diskon_Room] as diskon_room " +
                "  ,[Diskon_Food] as diskon_food " +
                " ,[Point_Reward] as point_reward " +
                " ,isnull([Code_Tipe_Member],0) as code_tipe_member " +
                " ,isnull([Pengali_Poin],0) as pengali_poin " +
                " ,isnull([File_Photo],'') as file_photo " +
                " ,isnull([Verifikasi_Email],0) as verifikasi_email " +
                " ,isnull([Verifikasi_Hp],0) as verifikasi_hp " +
                " ,isnull([Verifikasi_Id_Card],0) as verifikasi_id_card " +
                " ,isnull([Verifikasi_Id_Card_Note],0) as verifikasi_id_card_note " +
                " ,isnull([Id_Card_Name],0) as id_card_name " +
                " ,isnull([Id_Card_Url],0) as id_card_url " +
                " ,isnull([Id_Card_Address],0) as Code_Tipe_Member " +
                " ,isnull([Id_Card_City],0) as id_card_city " +
                " ,isnull([Id_Card_Nik],0) as id_card_nik " +
                "  FROM [dbo].[IHP_MBR]  where member= '" + member + "'";

            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        var member = dataReturn.recordset[0].Member;
                        resolve(dataReturn.recordset);
                    } else {
                        resolve(false);
                    }

                }
            });
        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error prosesQuery ');
            resolve(false);
        }
    });
}

function prosesQuery(isiQuery) {
    return new Promise((resolve, reject) => {
        try {
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message + ' Error prosesQuery ' + isiQuery);
                    resolve(false);
                } else {
                    sql.close();
                    resolve(true);
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