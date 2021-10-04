//console.log(bufferImage); 

var fs = require('fs');
class CreateDirectoryFile {

    createDirectoy(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

module.exports = CreateDirectoryFile;