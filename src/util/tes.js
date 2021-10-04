function insertEmployees() {
    var dbConn = new sql.Connection(dbConfig);
    dbConn.connect().then(function () {
        var transaction = new sql.Transaction(dbConn);
        transaction.begin().then(function () {
            var request = new sql.Request(transaction);
            request.query("INSERT INTO employee (name,salary,age) VALUES (req.body.name,req.body.salary,req.body.age")
                .then(function () {
                    transaction.commit().then(function (resp) {
                        console.log(resp);
                        dbConn.close();
                    }).catch(function (err) {
                        console.log("Error in Transaction Commit " + err);
                        dbConn.close();
                    });
                }).catch(function (err) {
                    console.log("Error in Transaction Begin " + err);
                    dbConn.close();
                });
        }).catch(function (err) {
            console.log(err);
            dbConn.close();
        }).catch(function (err) {
            //12.
            console.log(err);
        });
    });
}

function tesDbTrans() {
    var tesQry1 = `INSERT INTO [dbo].[Hsty] ( 
            [HISTORY], 
            [CHTime], 
            [CHUsr], 
            [Date_Trans] ) 
            VALUES (
                 N'TES5', 
                 '2019-08-15 10:50:31.000', 
                 N'TRI', 
                 '2019-08-15 10:50:31.000' )`;
    var tesQry2 = `INSERT INTO [dbo].[Hsty] ( 
            [HISTORY], 
            [CHTime], 
            [CHUsr], 
            [Date_Trans] ) 
            VALUES (
                 N'TES6', 
                 '2019-08-15 10:50:31.000', 
                 N'TRI', 
                 '2019-08-15 10:50:31.000' )`;
    var tesQry3 = `INSERT INTO [dbo].[Hsty] ( 
            [HISTORY], 
            [CHTxxxime], 
            [CHUsr], 
            [Date_Trans] ) 
            VALUES (
                 N'TES7', 
                 '2019-08-15 10:50:31.000', 
                 N'TRI', 
                 '2019-08-15 10:50:31.000' )`;


    const transaction = new sql.Transaction(dbPool);
    transaction.begin(async err => {
        if (err) {

        } else {
            try {
                const request = new sql.Request(transaction);
                const result1 = await request.query(tesQry1);
                const result2 = await request.query(tesQry2);
                const result3 = await request.query(tesQry3);
                transaction.commit(tErr => tErr && next('transaction commit error'));
            } catch (error) {
                transaction.rollback(tErr => tErr && next('transaction rollback error'));
                next('unknown error inside transaction = rollback');
            }
        }
    });
}