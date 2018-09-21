const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
// const userCtrl = require('../user/user.controller');
const Users = require('../user/user.model');


let currentUser = {
  username: null,
  token: null,
  roles: null
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function login(req, res, next) {
  var user = {
    username: req.body.username,
    password: null
  };
  console.log(user.username);
  user = await Users.getByName(user.username)
    .then((getedUser) => {
      console.log('getedUser: ' + getedUser);
      // console.log('getedUser.password' + getedUser.password);
      return getedUser;
    })
    .catch(e => next(e));

  console.log('user' + user);
  console.log(user[0].password);

  if (req.body.username === user[0].username && req.body.password === user[0].password) {
    const token = jwt.sign({
      username: user[0].username
    }, config.jwtSecret);
    currentUser.username = user[0].username;
    currentUser.token = token;
    return res.json({
      token,
      username: user.username
    });
  }
  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

async function getInfo(req, res) {

  var user = {
    username: req.body.username,
    password: null,
    roles: null
  };
  console.log('currentUser.username: ' + currentUser.username);
  // var roles;
  user = await Users.getByName(currentUser.username)
    .then((getedUser) => {
      console.log('getedUser: ' + getedUser);
      // console.log('getedUser.password' + getedUser.password);
      return getedUser;
    })
    .catch(e => next(e));
  
  // user = user[0];
  // console.log(user.roles);
  // console.log('currentUser.roles: ' + currentUser.roles);
  return res.json({
    user
  });
}

function logout(req, res) {
  // return res(200);
  console.log(req.body.token);
  res.sendStatus(200);
}

module.exports = { login, getRandomNumber, getInfo, logout };
