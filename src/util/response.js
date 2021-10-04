function ResponseFormat(state, data, message = "succes") {
    this.state = state;
    if (data != null) {
        this.length = data.length;
    }
    this.message = message;
    this.data = data;
}


module.exports = ResponseFormat;