var logger = require('../util/logger');
var sql = require("mssql");
var db;

class ModifikasiTable {
  constructor() { }


  penambahanKolomPrintedSlipCheckinIhpRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Rcp'" +
          " AND COLUMN_NAME ='Printed_Slip_Checkin')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Rcp ADD Printed_Slip_Checkin nvarchar(2) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomPrintedSlipCheckinIhpRcp");
            logger.info(" Gagal penambahanKolomPrintedSlipCheckinIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomPrintedSlipCheckinIhpRcp");
            logger.info(" Sukses penambahanKolomPrintedSlipCheckinIhpRcp");
            resolve(true);
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

  penambahanKolomSignIhpRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Rcp'" +
          " AND COLUMN_NAME ='Sign')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Rcp ADD Sign nvarchar(200) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomSignIhpRcp");
            logger.info(" Gagal penambahanKolomSignIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomSignIhpRcp");
            logger.info(" Sukses  penambahanKolomSignIhpRcp");
            resolve(true);
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

  melebarkanKolomPrintedIhpSul(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " alter table IHP_Sul alter column Printed nvarchar(2) NOT NULL ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal melebarkanKolomPrintedIhpSul");
            logger.info(" Gagal melebarkanKolomPrintedIhpSul");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses melebarkanKolomPrintedIhpSul");
            logger.info(" Sukses melebarkanKolomPrintedIhpSul");
            resolve(true);
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

  melebarkanKolomPrintedIhpIvc(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " alter table IHP_Ivc alter column Printed nvarchar(2) NULL ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal melebarkanKolomPrintedIhpIvc");
            logger.info(" Gagal melebarkanKolomPrintedIhpIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses melebarkanKolomPrintedIhpIvc");
            logger.info(" Sukses melebarkanKolomPrintedIhpIvc");
            resolve(true);
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

  penambahanKolomFilePhotoIhpMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='File_Photo')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD File_Photo nvarchar(100) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomFilePhotoIhpMbr");
            logger.info(" Gagal penambahanKolomFilePhotoIhpMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomFilePhotoIhpMbr");
            logger.info(" Sukses penambahanKolomFilePhotoIhpMbr");
            resolve(true);
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

  createTableIhpHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = 'IHP_History_Notif') Begin " +
          " CREATE TABLE [dbo].[IHP_History_Notif](" +
          " [Reception] [nvarchar](16) NOT NULL,	" +
          " [Date] [datetime] NULL," +
          " [Kamar] [nvarchar](30) NULL," +
          " [Chusr] [nvarchar](30) NULL," +
          " [Terima_Tolak] [smallint] NULL," +
          " [Client_Id] [nvarchar](30) NULL," +
          " [Date_Terkirim] [datetime] NULL," +
          " [Ip_Address] [nvarchar](20) NULL," +
          " [Jumlah_Client] [smallint] NULL" +

          " )" +
          " End";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpHistoryNotif");
            logger.info(" Gagal createTableIhpHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpHistoryNotif");
            logger.info(" Sukses createTableIhpHistoryNotif");
            resolve(true);
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

  createTableIhpIpAddress(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_IPAddress') BEGIN " +
          " CREATE TABLE [dbo].[IHP_IPAddress]( " +
          " [Aplikasi] [nvarchar](100) NULL, " +
          " [IP_Address] [nvarchar](20) NULL, " +
          " [Server_Socket_Port] [int] NULL," +
          " [Server_Udp_Port] [int] NULL" +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpIpAddress");
            logger.info(" Gagal createTableIhpIpAddress");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpIpAddress");
            logger.info(" Sukses createTableIhpIpAddress");
            resolve(true);
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

  createTableIhpIpAddressRoomNo(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_IPAddress_Room_No') BEGIN " +
          " CREATE TABLE [dbo].[IHP_IPAddress_Room_No]( " +
          " [Kamar] [nvarchar](50) NULL, " +
          " [IP_Address] [nvarchar](20) NULL, " +
          " [Server_Socket_Port] [int] NULL," +
          " [Server_Udp_Port] [int] NULL" +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpIpAddressRoomNo");
            logger.info(" Gagal createTableIhpIpAddressRoomNo");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpIpAddressRoomNo");
            logger.info(" Sukses createTableIhpIpAddressRoomNo");
            resolve(true);
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

  penambahanKolomTolakTerimaIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='Terima_Tolak')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD Terima_Tolak smallint " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomTolakTerimaIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomTolakTerimaIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomTolakTerimaIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomTolakTerimaIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomClientIdIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='Client_Id')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD Client_Id [nvarchar](30) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomClientIdIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomClientIdIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomClientIdIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomClientIdIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomDateTerkirimIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='Date_Terkirim')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD Date_Terkirim [datetime] " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomDateTerkirimIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomDateTerkirimIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomDateTerkirimIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomDateTerkirimIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomIpAddressIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='Ip_Address')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD [Ip_Address] [nvarchar](20) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIpAddressIdIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomIpAddressIdIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIpAddressIdIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomIpAddressIdIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomUserIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='User')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD [User] [nvarchar](11) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIpAddressIdIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomIpAddressIdIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIpAddressIdIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomIpAddressIdIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomJumlahClientIHPHistoryNotif(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_History_Notif'" +
          " AND COLUMN_NAME ='Jumlah_Client')" +
          " BEGIN  " +
          " ALTER TABLE IHP_History_Notif ADD [Jumlah_Client] [smallint] " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomJumlahClientIHPHistoryNotif");
            logger.info(" Gagal penambahanKolomJumlahClientIHPHistoryNotif");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomJumlahClientIHPHistoryNotif");
            logger.info(" Sukses penambahanKolomJumlahClientIHPHistoryNotif");
            resolve(true);
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

  penambahanKolomIpAddressIHPUser(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_User'" +
          " AND COLUMN_NAME ='IP_Address')" +
          " BEGIN  " +
          " ALTER TABLE IHP_User ADD IP_Address nvarchar (20) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIpAddressIHPUser");
            logger.info(" Gagal penambahanKolomIpAddressIHPUser");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIpAddressIHPUser");
            logger.info(" Sukses penambahanKolomIpAddressIHPUser");
            resolve(true);
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

  penambahanKolomLogin_DateIHPUser(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_User'" +
          " AND COLUMN_NAME ='Login_Date')" +
          " BEGIN  " +
          " ALTER TABLE IHP_User ADD Login_Date [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomLogin_DateIHPUser");
            logger.info(" Gagal penambahanKolomLogin_DateIHPUser");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomLogin_DateIHPUser");
            logger.info(" Sukses penambahanKolomLogin_DateIHPUser");
            resolve(true);
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

  penambahanKolomNamaTamuAliasIHPRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Room'" +
          " AND COLUMN_NAME ='Nama_Tamu_Alias')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Room ADD Nama_Tamu_Alias  [nvarchar](50) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomNamaTamuAliasIHPRoom");
            logger.info(" Gagal penambahanKolomNamaTamuAliasIHPRoom");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomNamaTamuAliasIHPRoom");
            logger.info(" Sukses penambahanKolomNamaTamuAliasIHPRoom");
            resolve(true);
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

  penambahanKolomKamarAliasIHPRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Room'" +
          " AND COLUMN_NAME ='Kamar_Alias')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Room ADD Kamar_Alias  [nvarchar](30) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomKamarAliasIHPRoom");
            logger.info(" Gagal penambahanKolomKamarAliasIHPRoom");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomKamarAliasIHPRoom");
            logger.info(" Sukses penambahanKolomKamarAliasIHPRoom");
            resolve(true);
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

  penambahanKolomMemberRevIHPRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Rcp'" +
          " AND COLUMN_NAME ='Member_Rev')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Rcp ADD Member_Rev  [nvarchar](16) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomMemberRevIHPRcp");
            logger.info(" Gagal penambahanKolomMemberRevIHPRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomMemberRevIHPRcp");
            logger.info(" Sukses penambahanKolomMemberRevIHPRcp");
            resolve(true);
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

  penambahanKolomIdCardNikIHPMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='Id_Card_Nik')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD Id_Card_Nik  [nvarchar](20) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIdCardNikIHPMbr");
            logger.info(" Gagal penambahanKolomIdCardNikIHPMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIdCardNikIHPMbr");
            logger.info(" Sukses penambahanKolomIdCardNikIHPMbr");
            resolve(true);
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

  penambahanKolomIdCardNameIHPMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='Id_Card_Name')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD Id_Card_Name  [nvarchar](50) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIdCardNameIHPMbr");
            logger.info(" Gagal penambahanKolomIdCardNameIHPMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIdCardNameIHPMbr");
            logger.info(" Sukses penambahanKolomIdCardNameIHPMbr");
            resolve(true);
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

  penambahanKolomIdCardAddressIHPMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='Id_Card_Address')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD Id_Card_Address  [nvarchar](100) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIdCardAddressIHPMbr");
            logger.info(" Gagal penambahanKolomIdCardAddressIHPMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIdCardAddressIHPMbr");
            logger.info(" Sukses penambahanKolomIdCardAddressIHPMbr");
            resolve(true);
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

  penambahanKolomIdCardCityIHPMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='Id_Card_City')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD Id_Card_City  [nvarchar](20) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIdCardCityIHPMbr");
            logger.info(" Gagal penambahanKolomIdCardCityIHPMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIdCardCityIHPMbr");
            logger.info(" Sukses penambahanKolomIdCardCityIHPMbr");
            resolve(true);
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

  penambahanKolomIdCardUrlIHPMbr(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Mbr'" +
          " AND COLUMN_NAME ='Id_Card_Url')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Mbr ADD Id_Card_Url  [nvarchar](50) NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomIdCardUrlIHPMbr");
            logger.info(" Gagal penambahanKolomIdCardUrlIHPMbr");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomIdCardUrlIHPMbr");
            logger.info(" Sukses penambahanKolomIdCardUrlIHPMbr");
            resolve(true);
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

  melebarkanKolomReservationIhpRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " alter table IHP_Rcp alter column Reservation nvarchar(40) NULL ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal melebarkanKolomPrintedIhpRcp");
            logger.info(" Gagal melebarkanKolomPrintedIhpRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses melebarkanKolomPrintedIhpRcp");
            logger.info(" Sukses melebarkanKolomPrintedIhpRcp");
            resolve(true);
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

  penambahanKolomStartExtIHPExt(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ext'" +
          " AND COLUMN_NAME ='Start_Extend')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ext ADD Start_Extend  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomStartExtIHPExt");
            logger.info(" Gagal penambahanKolomStartExtIHPExt");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomStartExtIHPExt");
            logger.info(" Sukses penambahanKolomStartExtIHPExt");
            resolve(true);
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

  penambahanKolomEndExtIHPExt(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ext'" +
          " AND COLUMN_NAME ='End_Extend')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ext ADD End_Extend  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomEndExtIHPExt");
            logger.info(" Gagal penambahanKolomEndExtIHPExt");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomEndExtIHPExt");
            logger.info(" Sukses penambahanKolomEndExtIHPExt");
            resolve(true);
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

  penambahanKolomSewaKamarSebelumDiskonIHPIvc(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ivc'" +
          " AND COLUMN_NAME ='Sewa_Kamar_Sebelum_Diskon')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ivc ADD Sewa_Kamar_Sebelum_Diskon  [float] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomSewaKamarSebelumDiskonIHPIvc");
            logger.info(" Gagal penambahanKolomSewaKamarSebelumDiskonIHPIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomSewaKamarSebelumDiskonIHPIvc");
            logger.info(" Sukses penambahanKolomSewaKamarSebelumDiskonIHPIvc");
            resolve(true);
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

  penambahanKolomTotalExtendSebelumDiskonIHPIvc(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ivc'" +
          " AND COLUMN_NAME ='Total_Extend_Sebelum_Diskon')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ivc ADD Total_Extend_Sebelum_Diskon [float] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomTotalExtendSebelumDiskonIHPIvc");
            logger.info(" Gagal penambahanKolomTotalExtendSebelumDiskonIHPIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomTotalExtendSebelumDiskonIHPIvc");
            logger.info(" Sukses penambahanKolomTotalExtendSebelumDiskonIHPIvc");
            resolve(true);
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

  penambahanKolomDiskonExtendKamarIHPIvc(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ivc'" +
          " AND COLUMN_NAME ='Diskon_Extend_Kamar')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ivc ADD Diskon_Extend_Kamar [float] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomDiskonExtendKamarIHPIvc");
            logger.info(" Gagal penambahanKolomDiskonExtendKamarIHPIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomDiskonExtendKamarIHPIvc");
            logger.info(" Sukses penambahanKolomDiskonExtendKamarIHPIvc");
            resolve(true);
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

  penambahanKolomDiskonSewaKamarIHPIvc(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Ivc'" +
          " AND COLUMN_NAME ='Diskon_Sewa_Kamar')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Ivc ADD Diskon_Sewa_Kamar [float] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomDiskonSewaKamarIHPIvc");
            logger.info(" Gagal penambahanKolomDiskonSewaKamarIHPIvc");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomDiskonSewaKamarIHPIvc");
            logger.info(" Sukses penambahanKolomDiskonSewaKamarIHPIvc");
            resolve(true);
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

  penambahanKolomDateTimeStartIHPRcpDetailsRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Rcp_DetailsRoom'" +
          " AND COLUMN_NAME ='Date_Time_Start')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Rcp_DetailsRoom ADD Date_Time_Start  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomDateTimeStartIHPRcpDetailsRoom");
            logger.info(" Gagal penambahanKolomDateTimeStartIHPRcpDetailsRoom");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomDateTimeStartIHPRcpDetailsRoom");
            logger.info(" Sukses penambahanKolomDateTimeStartIHPRcpDetailsRoom");
            resolve(true);
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

  penambahanKolomDateTimeFinishIHPRcpDetailsRoom(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Rcp_DetailsRoom'" +
          " AND COLUMN_NAME ='Date_Time_Finish')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Rcp_DetailsRoom ADD Date_Time_Finish  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomDateTimeFinishIHPRcpDetailsRoom");
            logger.info(" Gagal penambahanKolomDateTimeFinishIHPRcpDetailsRoom");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomDateTimeFinishIHPRcpDetailsRoom");
            logger.info(" Sukses penambahanKolomDateTimeFinishIHPRcpDetailsRoom");
            resolve(true);
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

  createTableIhpDetailSewaKamar(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_Detail_Sewa_Kamar') BEGIN " +
          " CREATE TABLE [dbo].[IHP_Detail_Sewa_Kamar]( " +
          " [Reception] [nvarchar](20) NULL, " +
          " [Kamar] [nvarchar](30) NULL, " +
          " [Hari] [smallint] NULL, " +
          " [Overpax] [Float] NULL, " +
          " [Tarif] [Float] NULL, " +
          " [Date_Time_Start] [Datetime] NULL, " +
          " [Date_Time_Finish] [Datetime] NULL, " +
          " [Menit_Yang_Digunakan] [int] NULL," +
          " [Tarif_Kamar_Yang_Digunakan] [Float] NULL, " +
          " [Tarif_Overpax_Yang_Digunakan] [Float] NULL " +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpDetailSewaKamar");
            logger.info(" Gagal createTableIhpDetailSewaKamar");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpDetailSewaKamar");
            logger.info(" Sukses createTableIhpDetailSewaKamar");
            resolve(true);
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

  createTableIhpDetailSewaKamarExtend(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_Detail_Sewa_Kamar_Extend') BEGIN " +
          " CREATE TABLE [dbo].[IHP_Detail_Sewa_Kamar_Extend]( " +
          " [Reception] [nvarchar](20) NULL, " +
          " [Kamar] [nvarchar](30) NULL, " +
          " [Hari] [smallint] NULL, " +
          " [Overpax] [Float] NULL, " +
          " [Tarif] [Float] NULL, " +
          " [Date_Time_Start] [Datetime] NULL, " +
          " [Date_Time_Finish] [Datetime] NULL, " +
          " [Menit_Yang_Digunakan] [int] NULL," +
          " [Tarif_Kamar_Yang_Digunakan] [Float] NULL, " +
          " [Tarif_Overpax_Yang_Digunakan] [Float] NULL " +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpDetailSewaKamarExtend");
            logger.info(" Gagal createTableIhpDetailSewaKamarExtend");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpDetailSewaKamarExtend");
            logger.info(" Sukses createTableIhpDetailSewaKamarExtend");
            resolve(true);
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

  createTableIhpDetailDiskonSewaKamar(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_Detail_Diskon_Sewa_Kamar') BEGIN " +
          " CREATE TABLE [dbo].[IHP_Detail_Diskon_Sewa_Kamar]( " +
          " [Reception] [nvarchar](20) NULL, " +
          " [Kamar] [nvarchar](30) NULL, " +
          " [Hari] [smallint] NULL, " +
          " [Overpax] [Float] NULL, " +
          " [Tarif] [Float] NULL, " +
          " [Date_Time_Start] [Datetime] NULL, " +
          " [Date_Time_Finish] [Datetime] NULL, " +
          " [Start_Promo] [Datetime] NULL, " +
          " [Finish_Promo] [Datetime] NULL, " +
          " [Hasil_Start_Promo] [Datetime] NULL, " +
          " [Hasil_Finish_Promo] [Datetime] NULL, " +
          " [Diskon_Persen] [int] NULL," +
          " [Diskon_Rp] [Float] NULL, " +
          " [Menit_Yang_Digunakan] [int] NULL," +
          " [Promo_Yang_Didapatkan] [Float] NULL " +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpDetailDiskonSewaKamar");
            logger.info(" Gagal createTableIhpDetailDiskonSewaKamar");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpDetailDiskonSewaKamar");
            logger.info(" Sukses createTableIhpDetailDiskonSewaKamar");
            resolve(true);
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

  createTableIhpDetailDiskonSewaKamarExtend(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery =
          " IF NOT EXISTS (SELECT * FROM information_schema.TABLES where TABLE_NAME = " +
          " 'IHP_Detail_Diskon_Sewa_Kamar_Extend') BEGIN " +
          " CREATE TABLE [dbo].[IHP_Detail_Diskon_Sewa_Kamar_Extend]( " +
          " [Reception] [nvarchar](20) NULL, " +
          " [Kamar] [nvarchar](30) NULL, " +
          " [Hari] [smallint] NULL, " +
          " [Overpax] [Float] NULL, " +
          " [Tarif] [Float] NULL, " +
          " [Date_Time_Start] [Datetime] NULL, " +
          " [Date_Time_Finish] [Datetime] NULL, " +
          " [Start_Promo] [Datetime] NULL, " +
          " [Finish_Promo] [Datetime] NULL, " +
          " [Hasil_Start_Promo] [Datetime] NULL, " +
          " [Hasil_Finish_Promo] [Datetime] NULL, " +
          " [Diskon_Persen] [int] NULL," +
          " [Diskon_Rp] [Float] NULL, " +
          " [Menit_Yang_Digunakan] [int] NULL," +
          " [Promo_Yang_Didapatkan] [Float] NULL " +
          " ) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal createTableIhpDetailDiskonSewaKamarExtend");
            logger.info(" Gagal createTableIhpDetailDiskonSewaKamarExtend");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses createTableIhpDetailDiskonSewaKamarExtend");
            logger.info(" Sukses createTableIhpDetailDiskonSewaKamarExtend");
            resolve(true);
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

  melebarkanKolomPrintedIhpSulHistory(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " alter table IHP_Sul_History alter column Printed nvarchar(2) NULL ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal melebarkanKolomPrintedIhpSulHistory");
            logger.info(" Gagal melebarkanKolomPrintedIhpSulHistory");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses melebarkanKolomPrintedIhpSulHistory");
            logger.info(" Sukses melebarkanKolomPrintedIhpSulHistory");
            resolve(true);
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

  melebarkanKolomPrintedIhpIvcHistory(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;
        var isiQuery = " " +
          " alter table IHP_Ivc_History alter column Printed nvarchar(2) NULL ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal melebarkanKolomPrintedIhpIvcHistory");
            logger.info(" Gagal melebarkanKolomPrintedIhpIvcHistory");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses melebarkanKolomPrintedIhpIvcHistory");
            logger.info(" Sukses melebarkanKolomPrintedIhpIvcHistory");
            resolve(true);
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

  penambahanKolomEmailedIhpSul(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Sul'" +
          " AND COLUMN_NAME ='Emailed')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Sul ADD Emailed nvarchar(2) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomEmailedIhpSul");
            logger.info(" Gagal penambahanKolomEmailedIhpSul");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomEmailedIhpSul");
            logger.info(" Sukses penambahanKolomEmailedIhpSul");
            resolve(true);
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

  penambahanKolomEmailedSuccessIhpSul(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Sul'" +
          " AND COLUMN_NAME ='Emailed_Success')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Sul ADD Emailed_Success nvarchar(2) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomEmailedSuccessIhpSul");
            logger.info(" Gagal penambahanKolomEmailedSuccessIhpSul");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomEmailedSuccessIhpSul");
            logger.info(" Sukses penambahanKolomEmailedSuccessIhpSul");
            resolve(true);
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

  penambahanKolomEmailedAddressIhpSul(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Sul'" +
          " AND COLUMN_NAME ='Emailed_Address')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Sul ADD Emailed_Address nvarchar(100) " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomEmailedAddressIhpSul");
            logger.info(" Gagal penambahanKolomEmailedAddressIhpSul");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomEmailedAddressIhpSul");
            logger.info(" Sukses penambahanKolomEmailedAddressIhpSul");
            resolve(true);
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

  penambahanKolomCheckinIHPPromoRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Promo_Rcp'" +
          " AND COLUMN_NAME ='Checkin')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Promo_Rcp ADD Checkin  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomStartExtIHPPromoRcp");
            logger.info(" Gagal penambahanKolomStartExtIHPPromoRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomStartExtIHPPromoRcp");
            logger.info(" Sukses penambahanKolomStartExtIHPPromoRcp");
            resolve(true);
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

  penambahanKolomCheckoutIHPPromoRcp(db_) {
    return new Promise((resolve, reject) => {
      try {
        db = db_;

        var isiQuery = " " +
          " IF NOT EXISTS (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
          " WHERE TABLE_NAME='IHP_Promo_Rcp'" +
          " AND COLUMN_NAME ='Checkout')" +
          " BEGIN  " +
          " ALTER TABLE IHP_Promo_Rcp ADD Checkout  [datetime] NULL " +
          " END ";
        db.request().query(isiQuery, function (err, dataReturn) {
          if (err) {
            sql.close();
            logger.error(err);
            console.log(err);
            logger.error(err.message + ' Error prosesQuery ' + isiQuery);
            console.log(" Gagal penambahanKolomEndExtIHPPromoRcp");
            logger.info(" Gagal penambahanKolomEndExtIHPPromoRcp");
            resolve(false);
          } else {
            sql.close();
            console.log(" Sukses penambahanKolomEndExtIHPPromoRcp");
            logger.info(" Sukses penambahanKolomEndExtIHPPromoRcp");
            resolve(true);
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


}
module.exports = ModifikasiTable;