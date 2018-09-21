const express = require('express');
const userRoutes = require('./server/user/user.route');
const authRoutes = require('./server/auth/auth.route');
const confRoutes = require('./server/conference/conf.route');
const recoRoutes = require('./server/recognition/reco.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount conf routes at /conference
router.use('/conferences', confRoutes);

// mount recognition routes at /reco
router.use('/reco', recoRoutes);

module.exports = router;
