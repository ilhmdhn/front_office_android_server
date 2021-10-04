const {
    app,
    Tray,
    Menu,
    BrowserWindow,
    ipcMain
} = require('electron');
var fs = require('fs');
var path = require('path');

config = JSON.parse(fs.readFileSync('setup.json'));

let win;

function createWindow() {
    // Instantiate Express App
    console.log('this createWindow');
    app.server = require(__dirname + '/src/server')(function (err) {

        win = new BrowserWindow({
            titleBarStyle: 'hidden',
            frame: true,
            width: 1200,
            height: 700,
            minWidth: 600,
            minHeight: 400,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
            }
            //icon: path.join(__dirname, 'server.ico')        
        });
        win.webContents.session.clearStorageData();
        win.webContents.session.clearCache(() => {
            console.log("clear cache");
        });

        if (err) {
            //console.log(`kena disini${err}`);

            win.loadFile(path.join(__dirname, '/src/views/error.html'));
            win.setSize(600, 400);
            win.center();
            win.focus();
            win.show();
            ipcMain.on('get-error-message', async (event, arg) => {
                var message = err.message;
                switch (err.code) {
                    case 'EACCES':
                        message = ` ${err.code} requires elevated privileges`;
                        //process.exit(1);
                        break;
                    case 'EADDRNOTAVAIL':
                        message = ` ${err.code} your ip setup.json is not define your machine`;
                        //process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        message = ` ${err.code} is already to use`;
                        //process.exit(1);
                        break;
                    case 'ETIMEDOUT':
                        message = `${err.message} ${err.code}  this server ip can not accessed`;
                        break;
                    default:
                        break;
                }
                event.returnValue = `Note : ${message}`;
            });
        } else {
            //console.log(process.env.PORTABLE_EXECUTABLE_DIR);
            win.loadURL('http://' + config.server_ip + ':' + config.server_port);
            win.focus();
            win.center();
            win.on('closed', () => {
                win = null;
            });
            win.on('minimize', function (event) {
                event.preventDefault();
                win.hide();
            });
            win.on('close', function (event) {
                if (!app.isQuiting) {
                    event.preventDefault();
                    win.hide();
                }
                return false;
            });

            const tray = new Tray('server.ico');
            tray.on('click', () => {
                if (win.isVisible()) {
                    win.hide();
                } else {
                    win.show();
                }
            });
            tray.setTitle('Server POS');

            win.on('show', () => {
                //tray.setHighlightMode('always');
                tray.setToolTip("Server Started");


            });
            win.on('hide', () => {
                //tray.popUpContextMenu();
                tray.setToolTip("Server Started");
            });
            var contextMenu = Menu.buildFromTemplate([{
                label: 'Server POS',
                click: function () {
                    win.show();
                }
            },
            {
                label: 'Quit',
                click: function () {
                    app.isQuiting = true;
                    app.quit();
                }
            }
            ]);
            tray.setContextMenu(contextMenu);
        }
    });

}


app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }

});
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});