var ResponseFormat = require('../util/response');
var sql = require("mssql");
var DBConnection = require('../util/db.pool');

var logger;
var db;
var a;

exports.loginFo = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    var dekripsiUser0 = await enkripsi_dekripsi_1(req.body.user_id);
    var dekripsiUser = await enkripsi_dekripsi_2(dekripsiUser0,true);

    var dekripsiPassword0 = await enkripsi_dekripsi_1(req.body.user_password);
    var dekripsiPassword = await enkripsi_dekripsi_2(dekripsiPassword0,true);

    try {
        var isiQuery = "" +
            "select " +
            "   User_ID " +
            "   ,User_Password " +
            "   ,Level_User " +
            "   ,Last_Login " +
            "  ,Verifikasi" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(0 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Master_Management_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(0 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(0 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(0 as bit)" +
            " when Level_User='°©' then Cast(0 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Menu_Transaksi_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Sub_Menu_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(1 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  FO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(1 as bit)" +
            " end as  POS" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(1 as bit)" +
            " when Level_User='»¼ª' then Cast(1 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  POP" +

            " from IHP_User " +
            //" where User_ID='" + dekripsiUser + "'" +
            //" and User_Password='" + dekripsiPassword + "'";
            " where User_ID=" + dekripsiUser + "" +
            " and User_Password=" + dekripsiPassword + "";

        var isgetCekUserNamePasswordDone = await getCekUserNamePassword(isiQuery);
        if (isgetCekUserNamePasswordDone.state == true) {
            var User_ID0 = isgetCekUserNamePasswordDone.data.User_ID;
            var User_ID1 = await enkripsi_dekripsi_1(User_ID0);
            var User_ID2 = await enkripsi_dekripsi_2(User_ID1,false);

            var User_Password0 = isgetCekUserNamePasswordDone.data.User_Password;
            var User_Password1 = await enkripsi_dekripsi_1(User_Password0);
            var User_Password2 = await enkripsi_dekripsi_2(User_Password1,false);

            var Level_User0 = isgetCekUserNamePasswordDone.data.Level_User;
            var Level_User1 = await enkripsi_dekripsi_1(Level_User0);
            var Level_User2 = await enkripsi_dekripsi_2(Level_User1,false);

            var lastLogin = isgetCekUserNamePasswordDone.data.Last_Login;
            var Master_Management_MFO = isgetCekUserNamePasswordDone.data.Master_Management_MFO;
            var Menu_Transaksi_MFO = isgetCekUserNamePasswordDone.data.Menu_Transaksi_MFO;
            var Sub_Menu_MFO = isgetCekUserNamePasswordDone.data.Sub_Menu_MFO;
            var FO = isgetCekUserNamePasswordDone.data.FO;
            var POS = isgetCekUserNamePasswordDone.data.POS;
            var POP = isgetCekUserNamePasswordDone.data.POP;
            await updateIhpUserLastLogin(isgetCekUserNamePasswordDone.data.User_ID,req._remoteAddress);

            var responya = {
                user_id: User_ID2,
                user_password: User_Password2,
                level_user: Level_User2,
                last_login: lastLogin,
                master_management_mfo: Master_Management_MFO,
                menu_transaksi_mfo: Menu_Transaksi_MFO,
                sub_menu_mfo: Sub_Menu_MFO,
                fo: FO,
                pos: POS,
                pop: POP
            };
            dataResponse = new ResponseFormat(true, responya);
            res.send(dataResponse);
        }
        if (isgetCekUserNamePasswordDone.state == false) {
            dataResponse = new ResponseFormat(false, null, "user "+req.body.user_id+" password "+req.body.user_password+" tidak terdaftar");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
};

exports.login = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var dekripsiUser0 = await enkripsi_dekripsi_1(req.body.User_Id);
    var dekripsiUser = await enkripsi_dekripsi_2(dekripsiUser0);

    var dekripsiPassword0 = await enkripsi_dekripsi_1(req.body.User_Password);
    var dekripsiPassword = await enkripsi_dekripsi_2(dekripsiPassword0);
    await updateIhpUserLastLogin(req.body.User_Id,req._remoteAddress);

    try {
        var isiQuery = "" +
            "select " +
            "   User_ID " +
            "   ,User_Password" +
            "   ,Level_User" +
            "   ,Last_Login" +
            "  ,Verifikasi" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '1'" +
            " when Level_User='²¼¨¢»´' then '1'" +
            " when Level_User='¸¹µ¿°' then '1'" +
            " when Level_User='°©' then '0'" +
            " when Level_User='²¼«¿¬' then '0'" +
            " when Level_User='½¼¨£¬' then '0'" +
            " when Level_User='»¼ª' then '0'" +
            " when Level_User='ª¸ª »¨' then '0'" +
            " end as  Master_Management_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '0'" +
            " when Level_User='²¼¨¢»´' then '0'" +
            " when Level_User='¸¹µ¿°' then '0'" +
            " when Level_User='°©' then '0'" +
            " when Level_User='²¼«¿¬' then '0'" +
            " when Level_User='½¼¨£¬' then '0'" +
            " when Level_User='»¼ª' then '0'" +
            " when Level_User='ª¸ª »¨' then '0'" +
            " end as  Menu_Transaksi_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '1'" +
            " when Level_User='²¼¨¢»´' then '1'" +
            " when Level_User='¸¹µ¿°' then '1'" +
            " when Level_User='°©' then '1'" +
            " when Level_User='²¼«¿¬' then '0'" +
            " when Level_User='½¼¨£¬' then '0'" +
            " when Level_User='»¼ª' then '0'" +
            " when Level_User='ª¸ª »¨' then '0'" +
            " end as  Sub_Menu_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '1'" +
            " when Level_User='²¼¨¢»´' then '1'" +
            " when Level_User='¸¹µ¿°' then '1'" +
            " when Level_User='°©' then '1'" +
            " when Level_User='²¼«¿¬' then '1'" +
            " when Level_User='½¼¨£¬' then '0'" +
            " when Level_User='»¼ª' then '0'" +
            " when Level_User='ª¸ª »¨' then '0'" +
            " end as  FO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '1'" +
            " when Level_User='²¼¨¢»´' then '1'" +
            " when Level_User='¸¹µ¿°' then '1'" +
            " when Level_User='°©' then '1'" +
            " when Level_User='²¼«¿¬' then '0'" +
            " when Level_User='½¼¨£¬' then '0'" +
            " when Level_User='»¼ª' then '0'" +
            " when Level_User='ª¸ª »¨' then '1'" +
            " end as  POS" +

            " , case when Level_User='¸¾»¹«´£µ·º' then '1'" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then '1'" +
            " when Level_User='²¼¨¢»´' then '1'" +
            " when Level_User='¸¹µ¿°' then '1'" +
            " when Level_User='°©' then '1'" +
            " when Level_User='²¼«¿¬' then '0'" +
            " when Level_User='½¼¨£¬' then '1'" +
            " when Level_User='»¼ª' then '1'" +
            " when Level_User='ª¸ª »¨' then '0'" +
            " end as  POP" +

            " from IHP_User " +
            " where User_ID='" + req.body.User_Id + "'" +
            " and User_Password='" + req.body.User_Password + "'";
        db.request().query(isiQuery, function (err, dataReturn) {
            if (err) {
                sql.close();
                logger.error(err.message);
                dataResponse = new ResponseFormat(false, null, err.message);
                res.send(dataResponse);
            } else {
                sql.close();
                if (dataReturn.recordset.length > 0) {
                    dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
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
};

exports.loginDekripsi = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    var dekripsiUser0 = await enkripsi_dekripsi_1(req.body.User_Id);
    var dekripsiUser = await enkripsi_dekripsi_2(dekripsiUser0);

    var dekripsiPassword0 = await enkripsi_dekripsi_1(req.body.User_Password);
    var dekripsiPassword = await enkripsi_dekripsi_2(dekripsiPassword0);

    try {
        var isiQuery = "" +
            "select " +
            "   User_ID " +
            "   ,User_Password " +
            "   ,Level_User " +
            "   ,Last_Login " +
            "  ,Verifikasi" +
            "  ,Cast(Verifikasi as bit) as verifikasi" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(0 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Master_Management_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(0 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(0 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(0 as bit)" +
            " when Level_User='°©' then Cast(0 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Menu_Transaksi_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  Sub_Menu_MFO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(1 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  FO" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(0 as bit)" +
            " when Level_User='»¼ª' then Cast(0 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(1 as bit)" +
            " end as  POS" +

            " , case when Level_User='¸¾»¹«´£µ·º' then Cast(1 as bit)" +
            " when Level_User='ª¨¨³¬¬¾¯¶¯' then Cast(1 as bit)" +
            " when Level_User='²¼¨¢»´' then Cast(1 as bit)" +
            " when Level_User='¸¹µ¿°' then Cast(1 as bit)" +
            " when Level_User='°©' then Cast(1 as bit)" +
            " when Level_User='²¼«¿¬' then Cast(0 as bit)" +
            " when Level_User='½¼¨£¬' then Cast(1 as bit)" +
            " when Level_User='»¼ª' then Cast(1 as bit)" +
            " when Level_User='ª¸ª »¨' then Cast(0 as bit)" +
            " end as  POP" +

            " from IHP_User " +
            " where User_ID='" + dekripsiUser + "'" +
            " and User_Password='" + dekripsiPassword + "'";

        var isgetCekUserNamePasswordDone = await getCekUserNamePassword(isiQuery);
        if (isgetCekUserNamePasswordDone.state == true) {
            var verifikasi_ = isgetCekUserNamePasswordDone.data.verifikasi;
            var User_ID0 = isgetCekUserNamePasswordDone.data.User_ID;
            var User_ID1 = await enkripsi_dekripsi_1(User_ID0);
            var User_ID2 = await enkripsi_dekripsi_2(User_ID1,false);

            var User_Password0 = isgetCekUserNamePasswordDone.data.User_Password;
            var User_Password1 = await enkripsi_dekripsi_1(User_Password0);
            var User_Password2 = await enkripsi_dekripsi_2(User_Password1,false);

            var Level_User0 = isgetCekUserNamePasswordDone.data.Level_User;
            var Level_User1 = await enkripsi_dekripsi_1(Level_User0);
            var Level_User2 = await enkripsi_dekripsi_2(Level_User1,false);

            var lastLogin = isgetCekUserNamePasswordDone.data.Last_Login;
            var Master_Management_MFO = isgetCekUserNamePasswordDone.data.Master_Management_MFO;
            var Menu_Transaksi_MFO = isgetCekUserNamePasswordDone.data.Menu_Transaksi_MFO;
            var Sub_Menu_MFO = isgetCekUserNamePasswordDone.data.Sub_Menu_MFO;
            var FO = isgetCekUserNamePasswordDone.data.FO;
            var POS = isgetCekUserNamePasswordDone.data.POS;
            var POP = isgetCekUserNamePasswordDone.data.POP;
            await updateIhpUserLastLogin(isgetCekUserNamePasswordDone.data.User_ID);

            var responya = {
                User_ID: User_ID2,
                User_Password: User_Password2,
                Level_User: Level_User2,
                Last_Login: lastLogin,                
                Master_Management_MFO: Master_Management_MFO,
                Menu_Transaksi_MFO: Menu_Transaksi_MFO,
                Sub_Menu_MFO: Sub_Menu_MFO,
                FO: FO,
                POS: POS,
                POP: POP,
                user_id: User_ID2,
                user_password: User_Password2,
                level_user: Level_User2,
                last_login: lastLogin,
                verifikasi: verifikasi_,
                master_mangement_mfo: Master_Management_MFO,
                menu_transaksi_mfo: Menu_Transaksi_MFO,
                sub_menu_mfo: Sub_Menu_MFO,
                fo: FO,
                pos: POS,
                pop: POP
            };
            dataResponse = new ResponseFormat(true, responya);
            res.send(dataResponse);
        }
        if (isgetCekUserNamePasswordDone.state == false) {
            dataResponse = new ResponseFormat(false, null, "Data Kosong");
            res.send(dataResponse);
        }
    } catch (error) {
        logger.error(error);
        dataResponse = new ResponseFormat(false, null, error.message);
        res.send(dataResponse);
    }
};

exports.test_enkripsi_dekripsi_1 = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var key = "62791583";
    var panjangKey = key.length;
    var binerHexaF = "00001111";
    var binerHexaF0 = "11110000";
    var hasilBiner = "";
    var hasilEnkripsiDekripsi = "";
    var hasilEnkripsiDekripsiAscii = "";
    var asciiAndBiner = 0;
    var asciiXorBiner = 0;
    var binerKarakter = "";
    var karHasil = 0;
    var and = "";
    var hasilAndBiner = "";
    var y = 0;
    var binerKey = "";
    var hasilBinerKey = "";
    var hasilAndBinerKey = "";
    var andKey = "";
    var xor = "";
    var hasilXor = "";
    var hasilAndBinerF0 = "";
    var andF0 = "";

    var input0 = req.params.input;
    var panjang = input0.length;
    var desimalKey;
    var desimalHuruf;
    var hurufBinerHexaF;
    var hurufHasilBiner;

    for (a = 0; a < panjang; a++) {
        hasilBiner = "";
        hasilBinerKey = "";
        hasilAndBinerKey = "";
        binerKey = "";
        hasilAndBiner = "";
        hasilXor = "";
        hasilAndBinerF0 = "";


        //var desimalHuruf=huruf.charCodeAt(0);
        desimalHuruf = input0.charCodeAt(a);
        binerKarakter = desimalHuruf.toString(2);
        var panjangBinerKarakter = binerKarakter.length;
        if (panjangBinerKarakter == 7) {
            binerKarakter = "0" + binerKarakter;
        } else if (panjangBinerKarakter == 6) {
            binerKarakter = "00" + binerKarakter;
        } else if (panjangBinerKarakter == 5) {
            binerKarakter = "000" + binerKarakter;
        } else if (panjangBinerKarakter == 4) {
            binerKarakter = "0000" + binerKarakter;
        } else if (panjangBinerKarakter == 3) {
            binerKarakter = "00000" + binerKarakter;
        } else if (panjangBinerKarakter == 2) {
            binerKarakter = "000000" + binerKarakter;
        } else if (panjangBinerKarakter == 1) {
            binerKarakter = "0000000" + binerKarakter;
        }
        hasilBiner = hasilBiner + binerKarakter;
        //}

        // hasil biner char di and khan dengan biner HEXA F 00001111
        var panjangHasilBiner = hasilBiner.length;
        for (b = 0; b < panjangHasilBiner; b++) {
            hurufHasilBiner = hasilBiner[b];
            hurufBinerHexaF = binerHexaF[b];
            if (
                (hurufHasilBiner == "1") &&
                (hurufBinerHexaF == "1")) {
                and = "1";
            } else {
                and = "0";
            }
            hasilAndBiner = hasilAndBiner + and;
        }

        // hasil biner char di and khan dengan biner HEXA F0 00001111
        for (b = 0; b < panjangHasilBiner; b++) {
            hurufHasilBiner = hasilBiner[b];
            var hurufBinerHexaF0 = binerHexaF0[b];
            if (
                (hurufHasilBiner == "1") &&
                (hurufBinerHexaF0 == "1")
            ) {
                andF0 = "1";
            } else {
                andF0 = "0";
            }
            hasilAndBinerF0 = hasilAndBinerF0 + andF0;
        }

        desimalKey = key.charCodeAt(y);
        binerKey = desimalKey.toString(2);

        var panjangBinerKey = binerKey.length;
        if (panjangBinerKey == 7) {
            binerKey = "0" + binerKey;
        } else if (panjangBinerKey == 6) {
            binerKey = "00" + binerKey;
        } else if (panjangBinerKey == 5) {
            binerKey = "000" + binerKey;
        } else if (panjangBinerKey == 4) {
            binerKey = "0000" + binerKey;
        } else if (panjangBinerKey == 3) {
            binerKey = "00000" + binerKey;
        } else if (panjangBinerKey == 2) {
            binerKey = "000000" + binerKey;
        } else if (panjangBinerKey == 1) {
            binerKey = "0000000" + binerKey;
        }
        hasilBinerKey = hasilBinerKey + binerKey;

        // hasil biner key di and khan dengan biner HEXA F 00001111
        var panjangHasilBinerKey = hasilBinerKey.length;
        for (b = 0; b < panjangHasilBinerKey; b++) {
            var hurufHasilBinerKey = hasilBinerKey[b];
            hurufBinerHexaF = binerHexaF[b];
            if (
                (hurufHasilBinerKey == "1") &&
                (hurufBinerHexaF == "1")
            ) {
                andKey = "1";
            } else {
                andKey = "0";
            }
            hasilAndBinerKey = hasilAndBinerKey + andKey;
        }
        y = y + 1;
        if ((y + 1) > panjangKey) {
            y = 0;
        }

        // hasil biner key di xor khan dengan hasilAndBiner
        var panjangHasilAndBinerKey = hasilAndBinerKey.length;
        for (c = 0; c < panjangHasilAndBinerKey; c++) {
            var hurufHasilAndBinerKey = hasilAndBinerKey[c];
            var hurufHasilAndBiner = hasilAndBiner[c];
            if (
                (hurufHasilAndBinerKey == "1") &&
                (hurufHasilAndBiner == "1")
            ) {
                xor = "0";
            } else if (
                (hurufHasilAndBinerKey == "0") &&
                (hurufHasilAndBiner == "0")
            ) {
                xor = "0";
            } else if (
                (hurufHasilAndBinerKey == "1") ||
                (hurufHasilAndBiner == "0")
            ) {
                xor = "1";
            } else if (
                (hurufHasilAndBinerKey == "0") ||
                (hurufHasilAndBiner == "1")
            ) {
                xor = "1";
            }
            hasilXor = hasilXor + xor;
        }

        asciiXorBiner = parseInt(hasilXor, 2);
        asciiAndBiner = parseInt(hasilAndBinerF0, 2);
        var karHasil0 = asciiXorBiner + asciiAndBiner;
        karhasil = String.fromCharCode(karHasil0);
        //karhasil=utf8.encode(karhasil);
        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + karhasil;
        hasilEnkripsiDekripsiAscii=hasilEnkripsiDekripsiAscii+","+karHasil0;
    }

    var responya = {
        desimalHurufInput: desimalHuruf,
        hasilBinerInput: hasilBiner,
        binerHexaF: binerHexaF,
        binerHexaF0: binerHexaF0,
        desimalKey: desimalKey,
        hasilBinerKey: hasilBinerKey,

        hasilBinerInputAndBinerHexaF: hasilAndBiner,
        hasilBinerInputAndBinerHexaF0: hasilAndBinerF0,
        hasilBinerKeyAndBinerHexaF: hasilAndBinerKey,
        hasilAndBinerKeyXorhasilAndBiner: hasilXor,

        asciiXorBiner: asciiXorBiner,
        asciiAndBiner: asciiAndBiner,
        karhasil: karhasil,
        ascii:hasilEnkripsiDekripsiAscii,
        hasilEnkripsiDekripsi: hasilEnkripsiDekripsi
    };

    dataResponse = new ResponseFormat(responya);
    res.send(dataResponse);

};

exports.test_enkripsi_dekripsi_2 = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    var hasilBiner = "";
    var hasilNegasiBiner = "";
    var negasi = "";
    var hasilEnkripsiDekripsi = "";
    var ascii = 0;
    var binerKarakter = "";
    var karHasil = 0;
    var utf8_encode="";
    var hasilEnkripsiDekripsiAscii = "";

    var desimalHuruf;
    var input0 = req.params.input;
    var panjang = input0.length;
    for (a = 0; a < panjang; a++) {
        hasilBiner = "";

        //var desimalHuruf=huruf.charCodeAt(0);
        desimalHuruf = input0.charCodeAt(a);
        binerKarakter = desimalHuruf.toString(2);

        var panjangBinerKarakter = binerKarakter.length;
        if (panjangBinerKarakter == 7) {
            binerKarakter = "0" + binerKarakter;
        } else if (panjangBinerKarakter == 6) {
            binerKarakter = "00" + binerKarakter;
        } else if (panjangBinerKarakter == 5) {
            binerKarakter = "000" + binerKarakter;
        } else if (panjangBinerKarakter == 4) {
            binerKarakter = "0000" + binerKarakter;
        } else if (panjangBinerKarakter == 3) {
            binerKarakter = "00000" + binerKarakter;
        } else if (panjangBinerKarakter == 2) {
            binerKarakter = "000000" + binerKarakter;
        } else if (panjangBinerKarakter == 1) {
            binerKarakter = "0000000" + binerKarakter;
        }
        hasilBiner = hasilBiner + binerKarakter;

        // hasil biner di Not khan
        hasilNegasiBiner = "";
        var panjangHasilBiner = hasilBiner.length;
        for (b = 0; b < panjangHasilBiner; b++) {
            var hurufHasilBiner = hasilBiner[b];
            if ((hurufHasilBiner == "0")) {
                negasi = "1";
            } else if ((hurufHasilBiner == "1")) {
                negasi = "0";
            }
            hasilNegasiBiner = hasilNegasiBiner + negasi;
        }

        ascii = parseInt(hasilNegasiBiner, 2);
        karhasil = String.fromCharCode(ascii);
        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + karhasil;
        hasilEnkripsiDekripsiAscii=hasilEnkripsiDekripsiAscii+","+ascii;
    }

    var responya = {
        desimalHurufInput: desimalHuruf,
        hasilBinerInput: hasilBiner,    


        hasilNegasiBiner: hasilNegasiBiner,
        ascii: ascii,
        karhasil: karhasil,
        utf8_encode:utf8_encode,
        ascii:hasilEnkripsiDekripsiAscii,
        hasilEnkripsiDekripsi: hasilEnkripsiDekripsi
    };

    dataResponse = new ResponseFormat(responya);
    res.send(dataResponse);

};

exports.test_enkripsi_dekripsi = async function (req, res) {
    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    var input0 = req.params.input;
    var isEnkripsi_0 = await enkripsi_dekripsi_1(input0);
    var isEnkripsi_ = await enkripsi_dekripsi_2(isEnkripsi_0,false);
    var responya = {
        dekripsi: isEnkripsi_
    };
    dataResponse = new ResponseFormat(responya);
    res.send(dataResponse);

};

function enkripsi_dekripsi_1(input) {
    return new Promise((resolve, reject) => {
        try {
            var key = "62791583";
            var panjangKey = key.length;
            var binerHexaF = "00001111";
            var binerHexaF0 = "11110000";
            var hasilBiner = "";
            var hasilEnkripsiDekripsi = "";
            var asciiAndBiner = 0;
            var asciiXorBiner = 0;
            var binerKarakter = "";
            var karHasil = 0;
            var and = "";
            var hasilAndBiner = "";
            var y = 0;
            var binerKey = "";
            var hasilBinerKey = "";
            var hasilAndBinerKey = "";
            var andKey = "";
            var xor = "";
            var hasilXor = "";
            var hasilAndBinerF0 = "";
            var andF0 = "";
            var hurufBinerHexaF;
            var hurufHasilBiner;

            var input0 = input;
            var panjang = input0.length;
            for (a = 0; a < panjang; a++) {
                hasilBiner = "";
                hasilBinerKey = "";
                hasilAndBinerKey = "";
                binerKey = "";
                hasilAndBiner = "";
                hasilXor = "";
                hasilAndBinerF0 = "";

                //var desimalHuruf=huruf.charCodeAt(0);
                var desimalHuruf = input0.charCodeAt(a);
                binerKarakter = desimalHuruf.toString(2);
                var panjangBinerKarakter = binerKarakter.length;
                if (panjangBinerKarakter == 7) {
                    binerKarakter = "0" + binerKarakter;
                } else if (panjangBinerKarakter == 6) {
                    binerKarakter = "00" + binerKarakter;
                } else if (panjangBinerKarakter == 5) {
                    binerKarakter = "000" + binerKarakter;
                } else if (panjangBinerKarakter == 4) {
                    binerKarakter = "0000" + binerKarakter;
                } else if (panjangBinerKarakter == 3) {
                    binerKarakter = "00000" + binerKarakter;
                } else if (panjangBinerKarakter == 2) {
                    binerKarakter = "000000" + binerKarakter;
                } else if (panjangBinerKarakter == 1) {
                    binerKarakter = "0000000" + binerKarakter;
                }
                hasilBiner = hasilBiner + binerKarakter;
                //}

                // hasil biner char di and khan dengan biner HEXA F 00001111
                var panjangHasilBiner = hasilBiner.length;
                for (b = 0; b < panjangHasilBiner; b++) {
                    hurufHasilBiner = hasilBiner[b];
                    hurufBinerHexaF = binerHexaF[b];
                    if (
                        (hurufHasilBiner == "1") &&
                        (hurufBinerHexaF == "1")) {
                        and = "1";
                    } else {
                        and = "0";
                    }
                    hasilAndBiner = hasilAndBiner + and;
                }

                // hasil biner char di and khan dengan biner HEXA F0 00001111
                for (b = 0; b < panjangHasilBiner; b++) {
                    hurufHasilBiner = hasilBiner[b];
                    var hurufBinerHexaF0 = binerHexaF0[b];
                    if (
                        (hurufHasilBiner == "1") &&
                        (hurufBinerHexaF0 == "1")
                    ) {
                        andF0 = "1";
                    } else {
                        andF0 = "0";
                    }
                    hasilAndBinerF0 = hasilAndBinerF0 + andF0;
                }

                var desimalKey = key.charCodeAt(y);
                binerKey = desimalKey.toString(2);

                var panjangBinerKey = binerKey.length;
                if (panjangBinerKey == 7) {
                    binerKey = "0" + binerKey;
                } else if (panjangBinerKey == 6) {
                    binerKey = "00" + binerKey;
                } else if (panjangBinerKey == 5) {
                    binerKey = "000" + binerKey;
                } else if (panjangBinerKey == 4) {
                    binerKey = "0000" + binerKey;
                } else if (panjangBinerKey == 3) {
                    binerKey = "00000" + binerKey;
                } else if (panjangBinerKey == 2) {
                    binerKey = "000000" + binerKey;
                } else if (panjangBinerKey == 1) {
                    binerKey = "0000000" + binerKey;
                }
                hasilBinerKey = hasilBinerKey + binerKey;

                // hasil biner key di and khan dengan biner HEXA F 00001111
                var panjangHasilBinerKey = hasilBinerKey.length;
                for (b = 0; b < panjangHasilBinerKey; b++) {
                    var hurufHasilBinerKey = hasilBinerKey[b];
                    hurufBinerHexaF = binerHexaF[b];
                    if (
                        (hurufHasilBinerKey == "1") &&
                        (hurufBinerHexaF == "1")
                    ) {
                        andKey = "1";
                    } else {
                        andKey = "0";
                    }
                    hasilAndBinerKey = hasilAndBinerKey + andKey;
                }
                y = y + 1;
                if ((y + 1) > panjangKey) {
                    y = 0;
                }

                // hasil biner key di xor khan dengan hasilAndBiner
                var panjangHasilAndBinerKey = hasilAndBinerKey.length;
                for (c = 0; c < panjangHasilAndBinerKey; c++) {
                    var hurufHasilAndBinerKey = hasilAndBinerKey[c];
                    var hurufHasilAndBiner = hasilAndBiner[c];
                    if (
                        (hurufHasilAndBinerKey == "1") &&
                        (hurufHasilAndBiner == "1")
                    ) {
                        xor = "0";
                    } else if (
                        (hurufHasilAndBinerKey == "0") &&
                        (hurufHasilAndBiner == "0")
                    ) {
                        xor = "0";
                    } else if (
                        (hurufHasilAndBinerKey == "1") ||
                        (hurufHasilAndBiner == "0")
                    ) {
                        xor = "1";
                    } else if (
                        (hurufHasilAndBinerKey == "0") ||
                        (hurufHasilAndBiner == "1")
                    ) {
                        xor = "1";
                    }
                    hasilXor = hasilXor + xor;
                }

                asciiXorBiner = parseInt(hasilXor, 2);
                asciiAndBiner = parseInt(hasilAndBinerF0, 2);
                var karHasil0 = asciiXorBiner + asciiAndBiner;
                karhasil = String.fromCharCode(karHasil0);
                hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + karhasil;
            }
            resolve(hasilEnkripsiDekripsi);

        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error enkripsi_0 ');
            resolve(false);
        }
    });
}

function enkripsi_dekripsi_2(input,nomor_ascii_) {
    return new Promise((resolve, reject) => {
        try {
            var nomor_ascii=nomor_ascii_;
            var hasilBiner = "";
            var hasilNegasiBiner = "";
            var negasi = "";
            var hasilEnkripsiDekripsi = "";
            var ascii = 0;
            var binerKarakter = "";
            var karHasil = 0;

            var input0 = input;
            var panjang = input0.length;
            for (a = 0; a < panjang; a++) {
                hasilBiner = "";

                //var desimalHuruf=huruf.charCodeAt(0);
                var desimalHuruf = input0.charCodeAt(a);
                binerKarakter = desimalHuruf.toString(2);

                var panjangBinerKarakter = binerKarakter.length;
                if (panjangBinerKarakter == 7) {
                    binerKarakter = "0" + binerKarakter;
                } else if (panjangBinerKarakter == 6) {
                    binerKarakter = "00" + binerKarakter;
                } else if (panjangBinerKarakter == 5) {
                    binerKarakter = "000" + binerKarakter;
                } else if (panjangBinerKarakter == 4) {
                    binerKarakter = "0000" + binerKarakter;
                } else if (panjangBinerKarakter == 3) {
                    binerKarakter = "00000" + binerKarakter;
                } else if (panjangBinerKarakter == 2) {
                    binerKarakter = "000000" + binerKarakter;
                } else if (panjangBinerKarakter == 1) {
                    binerKarakter = "0000000" + binerKarakter;
                }
                hasilBiner = hasilBiner + binerKarakter;

                // hasil biner di Not khan
                hasilNegasiBiner = "";
                var panjangHasilBiner = hasilBiner.length;
                for (b = 0; b < panjangHasilBiner; b++) {
                    var hurufHasilBiner = hasilBiner[b];
                    if ((hurufHasilBiner == "0")) {
                        negasi = "1";
                    } else if ((hurufHasilBiner == "1")) {
                        negasi = "0";
                    }
                    hasilNegasiBiner = hasilNegasiBiner + negasi;
                }

                ascii = parseInt(hasilNegasiBiner, 2);
                karhasil = String.fromCharCode(ascii);
                //karhasil=utf8.encode(karhasil);                
                //hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + "CHAR("+karhasil+")+";
                if(a==(panjang-1)){
                    if(nomor_ascii==true){
                        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + "CHAR("+ascii+")";
                    }else{
                        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + karhasil;
                    }                    
                }else{
                    if(nomor_ascii==true){
                        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + "CHAR("+ascii+")+";
                    }else{
                        hasilEnkripsiDekripsi = hasilEnkripsiDekripsi + karhasil;
                    }      
                }
            }
            resolve(hasilEnkripsiDekripsi);

        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch enkripsi_ ');
            resolve(false);
        }
    });
}

function getCekUserNamePassword(query) {
    return new Promise((resolve, reject) => {
        try {
            db.request().query(query, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                } else {
                    sql.close();
                    if (dataReturn.recordset.length > 0) {
                        dataResponse = new ResponseFormat(true, dataReturn.recordset[0]);
                        resolve(dataResponse);
                    } else {
                        dataResponse = new ResponseFormat(false, null, "Data Kosong");
                        resolve(dataResponse);
                    }
                }
            });
        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error getCekUserNamePassword ' + query);
            resolve(false);
        }
    });
}

function updateIhpUserLastLogin(user_,ip_address_) {
    return new Promise((resolve, reject) => {
        try {
            var user = user_;
            var ip_address = ip_address_;
            var isiQuery = "" +
                "set dateformat dmy " +
                " update IHP_User set [Last_Login]= " +               
                " CONVERT(VARCHAR(24),GETDATE(),103) + ' '+ SUBSTRING(CONVERT(VARCHAR(24),GETDATE(),114),1,8) " +
                " , IP_Address='"+ip_address+"'"+
                " , Login_Date=GetDate()"+
                " where [User_ID]='" + user + "'";
            db.request().query(isiQuery, function (err, dataReturn) {
                if (err) {
                    sql.close();
                    logger.error(err.message);
                    resolve(false);
                } else {
                    sql.close();
                    resolve(true);
                }
            });
        } catch (err) {
            console.log(err);
            logger.error(err.message);
            logger.error('Catch Error getCekUserNamePassword ' + query);
            resolve(false);
        }
    });
}