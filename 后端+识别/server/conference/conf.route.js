const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const confCtrl = require('./conf.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/list')
  /** GET /api/conferences - Get list of conferences */
  .get(confCtrl.list);

router.route('/create')
  /** POST /api/conferences - Create new conferences */
  .post(confCtrl.create);

router.route('/update')
  // .console.log('im here')
  /** PUT /api/conferences - Update new conferences */
  .post(confCtrl.update);

router.route('/id/:confId')
  /** GET /api/conferences/id/:confId - Get conferences */
  .get(confCtrl.get)

  /** PUT /api/conferences/:confId - Update conferences */
  .put(validate(paramValidation.updateUser), confCtrl.update)

  /** DELETE /api/conferences/:confId - Delete conferences */
  .delete(confCtrl.remove);

/** Load conferences when API with confId route parameter is hit */
router.param('confId', confCtrl.loadById);

router.route('/name/:confname')
  .get(confCtrl.get);
router.param('confname', confCtrl.loadByName);


router.route('/getParticipants/:id')
  .get(confCtrl.get);
router.param('id', confCtrl.getParticipantsById);

router.route('/detail')
  .post(confCtrl.loadById);
// router.param('confId', confCtrl.loadById);

// router.route('/info')
//   .get(confCtrl.getInfo);


module.exports = router;
