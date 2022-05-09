module.exports = {

    enkripsi_dekripsi_1: async function (input) {
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
},

    enkripsi_dekripsi_2: async function(input,nomor_ascii_) {
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
}