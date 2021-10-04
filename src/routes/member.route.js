var express = require('express');
var router = express.Router();
var memberCtrl = require('../controller/member.controller');

router.route('/generate-id-non-member/:nama')
    .get(memberCtrl.getGenerateIdNonMember);

router.route('/membership/:web_membership')
    .get(memberCtrl.getWebMembership);

router.route('/membership/foto/:web_membership')
    .get(memberCtrl.getWebMembershipFoto);

module.exports = router;