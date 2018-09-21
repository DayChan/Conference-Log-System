const User = require('./user.model');

/**
 * Load user and append to req.
 */
function loadById(req, res, next) {
  User.getById(req.body.id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return res.json(req.user);
    })
    .catch(e => next(e));
}

function loadByName(req, res, next, username) {
  User.getByName(username)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get Conferences By User Name
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function getConfByName(req, res, next) {
  // var user = {
  //   username: req.body.username,
  //   recentConferences: [],
  //   attendedConference: []
  // };
  console.log('getConfByName!');
  // console.log('req.body: ' + req.body);
  // console.log('user.username: ' + user.username);
  console.log('req.body.username: ' + req.body.username);
  User.getByName(req.body.username)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      console.log('req.user: ' + req.user);
      // console.log('user.recentConferences: ' + req.user.recentConferences);
      // console.log('user.attendedConferences: ' + req.user.attendedConferences);
      return res.json(user);
      // return res.json({
      //   recentConferences: user.recentConferences,
      //   attendedConferences: user.attendedConferences
      // });
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {Number} req.body.id - The id of user.
 * @property {String} req.body.username - The username of user.
 * @property {String} req.body.password - The password of user.
 * @property {String} req.body.roles - The roles of user.
 * @property {String} req.body.department - The department of user.
 * @property {Array} req.body.recentConferences - The job of recentConferences.
 * @property {Array} req.body.attendedConferences - The job of attendedConferences.
 * @property {String} req.body.job - The job of user.
 * @property {String} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function create(req, res, next) {
  const user = new User({
    id: req.body.id,
    username: req.body.username,
    password: req.body.password,
    roles: req.body.roles,
    mobileNumber: req.body.mobileNumber,
    recentConferences: req.body.recentConferences,
    attendedConferences: req.body.attendedConferences,
    department: req.body.department,
    job: req.body.job
  });
  console.log(user);

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {Number} req.body.id - The id of user.
 * @property {String} req.body.username - The username of user.
 * @property {String} req.body.password - The password of user.
 * @property {String} req.body.roles - The roles of user.
 * @property {String} req.body.department - The department of user.
 * @property {String} req.body.job - The job of user.
 * @property {Array} req.body.recentConferences - The job of recentConferences.
 * @property {Array} req.body.attendedConferences - The job of attendedConferences.
 * @property {String} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = new User({
    id: req.body.id,
    username: req.body.username,
    password: req.body.password,
    roles: req.body.roles,
    recentConferences: req.body.recentConferences,
    attendedConferences: req.body.attendedConferences,
    mobileNumber: req.body.mobileNumber,
    department: req.body.department,
    job: req.body.job
  });
  // user.attendedConference.append(req.body.recentConferences);

  User.remove({ id: user.id }, function(err) {
    if (!err) {
      console.log('"ok"');
    }
    else {
      console.log('"err"');
    }
  });
  
  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get conf list.
 * @property {number} req.query.page - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

module.exports = { loadById, loadByName, get, create, update, list, remove, getConfByName };
