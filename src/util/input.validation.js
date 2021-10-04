class InputValidation {
  constructor() { }

  removeCharQuotationMark(input_) {

    var input = input_;
    var panjang = input.length;
    var karakter;
    var a;
    var tmpNama = '';
    for (a = 0; a < panjang; a++) {
      karakter = input.charAt(a);
      if (
        (karakter != ',') &&
        (karakter != '.') &&
        (karakter != '`') &&
        (karakter != '~') &&
        (karakter != ';') &&
        (karakter != "'") &&
        (karakter != "\n") &&
        (karakter != '"')
      ) {
        tmpNama = tmpNama + karakter;
      }
    }
    return tmpNama;

  }

  isEmpty(value) {
    return (
      typeof value == 'undefined' ||
      value.length == 0 ||
      value == null ||
      value == ''
    );
  }

}
module.exports = InputValidation;