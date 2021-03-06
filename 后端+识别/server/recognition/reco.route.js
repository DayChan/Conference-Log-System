const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('../../config/param-validation');
const recoCtrl = require('./reco.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/conf')
  /** POST /api/reco - Upload Pics */
  .post(recoCtrl.handlePicsByConf);
router.param('confId', recoCtrl.handlePicsByConf);

router.route('/confEnd')
  /** POST /api/reco - Upload Pics */
  .post(recoCtrl.handlePicsByConfEnd);

router.route('/user')
  /** POST /api/reco - Upload Pics */
  .post(recoCtrl.handlePicsByUser);
router.param('userId', recoCtrl.handlePicsByUser);

/**
 * TODO: 写一个confend路由 OK
 */
module.exports = router;
