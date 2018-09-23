const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list);

router.route('/create')
  // /** GET /api/users - Get list of users */
  // .get(userCtrl.list)

  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

router.route('/name/:username')
  .get(userCtrl.get);
router.param('username', userCtrl.loadByName);

router.route('/update')
  // .console.log('im here')
  /** PUT /api/conferences - Update new conferences */
  .post(userCtrl.update);

router.route('/detail')
  .post(userCtrl.loadById);

router.route('/confs')
  .post(userCtrl.getConfByName);

router.route('/createWithPic')
  .post(userCtrl.createWithPic);

module.exports = router;
