var ResponseFormat = require('../util/response');
var DBConnection = require('../util/db.pool');
var logger;
var fs = require('fs');
var url = require('url');
var db;

exports.getInventoryWaiters = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var ip_server = await new DBConnection().getIpServer();
    var port_server = await new DBConnection().getPortServer();
    var inventory_query = "" +
        "SELECT " +
        " IHP_Inventory.inventory, " +
        " isnull(IHP_Inventory.InventoryID_Global, '') as InventoryID_Global," +
        " isnull(IHP_Inventory.InventoryID_Global, '') as inventory_id_global," +
        " IHP_Inventory.nama, " +
        " IHP_Inventory.price, " +
        " IHP_Inventory.StrName, " +
        " IHP_Inventory.StrName as str_name, " +
        " IHP_Inventory.Location, " +
        " IHP_Inventory.Location as location, " +
        " case when IHP_Inventory.[Location]=1  then 'KASIR'" +
        " when IHP_Inventory.[Location]=2 then 'DAPUR'" +
        " when IHP_Inventory.[Location]=3  then 'BAR' end" +
        " as keterangan_location," +

        " IHP_Inventory.Reward, " +
        " IHP_Inventory.Reward as reward, " +
        " IHP_Inventory.Point, " +
        " IHP_Inventory.Point as point, " +
        " IHP_Inventory.[GROUP] as Groupe, " +
        " IHP_Inventory.[GROUP] as [group], " +

        " case when IHP_Inventory.[GROUP] =0  then 'MINUMAN'" +
        " when IHP_Inventory.[GROUP] =1 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =2 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =3 then 'SNACK'" +
        " when IHP_Inventory.[GROUP] =4 then 'PAKET'" +
        " when IHP_Inventory.[GROUP]=5  then 'LAIN' end" +
        " as Groupe1," +

        " case when IHP_Inventory.[GROUP] =0  then 'MINUMAN'" +
        " when IHP_Inventory.[GROUP] =1 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =2 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =3 then 'SNACK'" +
        " when IHP_Inventory.[GROUP] =4 then 'PAKET'" +
        " when IHP_Inventory.[GROUP]=5  then 'LAIN' end" +
        " as group_keterangan," +


        " IHP_Inventory.Service, " +
        " IHP_Inventory.Service as service, " +
        " cast(IHP_Inventory.Service as bit) as dikenakan_service, " +
        " IHP_Inventory.Pajak, " +
        " IHP_Inventory.Pajak as pajak, " +
        " cast(IHP_Inventory.Pajak as bit) as dikenakan_pajak, " +
        " IHP_Config2.Service_Persen_Food, " +
        " IHP_Config2.Service_Persen_Food as service_persen_food, " +
        " IHP_Config2.Service_Rp_Food, " +
        " IHP_Config2.Service_Rp_Food service_rp_food, " +
        " IHP_Config2.Tax_Persen_Food, " +
        " IHP_Config2.Tax_Persen_Food as tax_persen_food, " +
        " IHP_Config2.Tax_Rp_Food, " +
        " IHP_Config2.Tax_Rp_Food as tax_rp_food, " +
        
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " as Nilai_service, " +

        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " as nilai_service, " +

        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1 " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end as Nilai_pajak, " +

        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1 " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end as nilai_pajak, " +

        " IHP_Inventory.price " +
        " + " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1   " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " + " +
        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1  " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end " +
        " as Price_include_service_pajak, " +

        " IHP_Inventory.price " +
        " + " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1   " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " + " +
        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1  " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end " +
        " as price_include_service_pajak, " +

        " 'http://"+ip_server+":"+port_server+"/inventory/image/'+"+
        " isnull(IHP_Inventory.InventoryID_Global, '')+'.jpg' as url_image "+
        // " Picture "+
        " FROM IHP_Inventory " +
        " ,IHP_Config2 " +
        " WHERE IHP_Inventory.status = 1 " +
        //" AND IHP_Inventory.reward = 0 " +
        " and IHP_Config2.Data='1'" +
        //" and IHP_Inventory.price >0" +
        " ORDER BY IHP_Inventory.Nama ";

    try {
        db.request().query(inventory_query, function (err, dataReturn) {
            if (err) {
                logger.error(err.message);
                dataResponse = new ResponseFormat(false,null,err.message);
                res.send(dataResponse);
            } else {

                dataResponse = new ResponseFormat(true, dataReturn.recordset);
                res.send(dataResponse);
            }
        });

    } catch (error) {
        logger.error(error);
    }
};

exports.getInventoryKasir = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;
    var ip_server = await new DBConnection().getIpServer();
    var port_server = await new DBConnection().getPortServer();

    var inventory_query = "" +
        "SELECT " +        
        " IHP_Inventory.inventory, " +
        " isnull(IHP_Inventory.InventoryID_Global, '') as InventoryID_Global," +
        " isnull(IHP_Inventory.InventoryID_Global, '') as inventory_id_global," +
        " IHP_Inventory.nama, " +
        " IHP_Inventory.price, " +
        " IHP_Inventory.StrName, " +
        " IHP_Inventory.StrName as str_name, " +
        " IHP_Inventory.Location, " +
        " IHP_Inventory.Location as location, " +
        " case when IHP_Inventory.[Location]=1  then 'KASIR'" +
        " when IHP_Inventory.[Location]=2 then 'DAPUR'" +
        " when IHP_Inventory.[Location]=3  then 'BAR' end" +
        " as keterangan_location," +

        " IHP_Inventory.Reward, " +
        " IHP_Inventory.Reward as reward, " +
        " IHP_Inventory.Point, " +
        " IHP_Inventory.Point as point, " +
        " IHP_Inventory.[GROUP] as Groupe, " +
        " IHP_Inventory.[GROUP] as [group], " +

        " case when IHP_Inventory.[GROUP] =0  then 'MINUMAN'" +
        " when IHP_Inventory.[GROUP] =1 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =2 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =3 then 'SNACK'" +
        " when IHP_Inventory.[GROUP] =4 then 'PAKET'" +
        " when IHP_Inventory.[GROUP]=5  then 'LAIN' end" +
        " as Groupe1," +

        " case when IHP_Inventory.[GROUP] =0  then 'MINUMAN'" +
        " when IHP_Inventory.[GROUP] =1 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =2 then 'MAKANAN'" +
        " when IHP_Inventory.[GROUP] =3 then 'SNACK'" +
        " when IHP_Inventory.[GROUP] =4 then 'PAKET'" +
        " when IHP_Inventory.[GROUP]=5  then 'LAIN' end" +
        " as group_keterangan," +

        " IHP_Inventory.Service, " +
        " IHP_Inventory.Service as service, " +
        " cast(IHP_Inventory.Service as bit) as dikenakan_service, " +
        " IHP_Inventory.Pajak, " +
        " IHP_Inventory.Pajak as pajak, " +
        " cast(IHP_Inventory.Pajak as bit) as dikenakan_pajak, " +
        " IHP_Config2.Service_Persen_Food, " +
        " IHP_Config2.Service_Persen_Food as service_persen_food, " +
        " IHP_Config2.Service_Rp_Food, " +
        " IHP_Config2.Service_Rp_Food service_rp_food, " +
        " IHP_Config2.Tax_Persen_Food, " +
        " IHP_Config2.Tax_Persen_Food as tax_persen_food, " +
        " IHP_Config2.Tax_Rp_Food, " +
        " IHP_Config2.Tax_Rp_Food as tax_rp_food, " +
        
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " as Nilai_service, " +

        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " as nilai_service, " +

        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1 " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end as Nilai_pajak, " +

        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1 " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end as nilai_pajak, " +

        " IHP_Inventory.price " +
        " + " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1   " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " + " +
        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1  " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end " +
        " as Price_include_service_pajak, " +

        " IHP_Inventory.price " +
        " + " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1   " +
        " then (IHP_Inventory.price/100)* IHP_Config2.Service_Persen_Food   " +
        " else IHP_Config2.Service_Rp_Food " +
        " end  " +
        " + " +
        " case when IHP_Config2.Tax_Persen_Food>0 and Pajak=1  " +
        " then  " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))/100*IHP_Config2.Tax_Persen_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)/100*IHP_Config2.Tax_Persen_Food  " +
        " end  " +
        " else " +
        " case when IHP_Config2.Service_Persen_Food>0 and Service=1  " +
        " then (IHP_Inventory.price+((IHP_Inventory.price/100)*IHP_Config2.Service_Persen_Food))+IHP_Config2.Tax_Rp_Food " +
        " else (IHP_Inventory.price+IHP_Config2.Service_Rp_Food)+IHP_Config2.Tax_Rp_Food  " +
        " end  " +
        " end " +
        " as price_include_service_pajak, " +

        " 'http://"+ip_server+":"+port_server+"/inventory/image/'+"+
        " isnull(IHP_Inventory.InventoryID_Global, '')+'.jpg' as url_image "+
        // " Picture "+
        " FROM IHP_Inventory " +
        " ,IHP_Config2 " +
        " WHERE IHP_Inventory.status = 1 " +
        //" AND IHP_Inventory.reward = 0 " +
        " and IHP_Config2.Data='1'" +
        //" and IHP_Inventory.price >0" +
        " ORDER BY IHP_Inventory.Nama ";

    try {


        db.request().query(inventory_query, function (err, dataReturn) {
            if (err) {
                logger.error(err.message);
            } else {
                dataResponse = new ResponseFormat(true, dataReturn.recordset);
                res.send(dataResponse);
            }
        });

    } catch (error) {
        logger.error(error);
    }
};


exports.getInventoryImage = async function (req, res) {

    db = await new DBConnection().getPoolConnection();
    logger = req.log;

    //use the url to parse the requested url and get the image name
    //var query = url.parse(req.url, true).query;
    //pic = query.image;
    pic = req.params.idImage;

    //read the image using fs and send the image content back in the response
    //D:\Ainul\FotoMinumanRenamed\MNHP-CT-034.jpg
    //fs.readFile('/path/to/an/image/directory/' + pic, function (err, content) {
    fs.readFile('./images/image_fnb/' + pic, function (err, content) {
        if (err) {
            //console.log(err);
            //res.writeHead(400, {'Content-type':'text/html'}) ; 
            //res.end("No such image"); 
            //jika gambar tidak ada
            fs.readFile('./images/noimage.png', function (err, content) {
                if (err) {
                    console.log(err);
                    res.writeHead(400, { 'Content-type': 'text/html' });
                    res.end("No such image");

                } else {
                    //specify the content type in the response will be an image
                    res.writeHead(200, { 'Content-type': 'image/jpg' });
                    res.end(content);
                }
            });
            //end jika gambar tidak ada
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(content);
        }
    });
};