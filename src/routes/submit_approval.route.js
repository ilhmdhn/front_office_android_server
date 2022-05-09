var express = require('express');
var router = express.Router()
var approvalController = require('../controller/submit_approval.controller')

router.route('/submit-approval')
    .post(approvalController.submitApproval)
module.exports = router;