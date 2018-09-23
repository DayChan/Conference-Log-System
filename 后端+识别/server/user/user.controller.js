const User = require('./user.model');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const spawnSync = require('child_process').spawnSync;
const spawn = require('child_process').spawn;
const execFileSync = require('child_process').execFileSync;
var async = require('async');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
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
 * Enroll with pic. (Enroll on the log in page.)
 * @property req
 */
function createWithPic(req, res, next) {
  console.log("startttt");
  var form = new formidable.IncomingForm();
  form.uploadDir = './faceReco_conference/Data/images_evaluation';                // 上传文件的保存路径
  form.keepExtensions = true;                // 保存扩展名
  form.maxFieldsSize = 20 * 1024 * 1024;     // 上传文件的最大大小
  
  form.parse(req, function (err, fields, files) {
    if (err) {
      return console.log('formidable, form.parse err');
    }                                        // 处理 request
    console.log('formidable, form.parse ok');
    console.log('显示上传时的参数 begin');
    console.log("field:",fields);
    userId = fields.id;
    userName = fields.username;
    passWord = fields.password;
    roles = fields.roles;
    mobileNumber = fields.mobileNumber;
    department = fields.department;
    job = fields.job;

    const user = new User({
      id: userId,
      username: userName,
      password: passWord,
      roles: roles,
      mobileNumber: mobileNumber,
      department: department,
      job: job
    });

    console.log("user: ")
    console.log(user);

    user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));

    console.log('显示上传时的参数 end');
    var item;
    var length = 0;                           // 计算 files 长度
    for (item in files) {
      length++;
    }
    if (length === 0) {
      console.log('files no data');
      return;
    }
    for (item in files) {
      var file = files[item];                 // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录       
      var tempfilepath = file.path;           
      var type = file.type;                   // 获取文件类型
      var filename = file.name;               // 获取文件名，并根据文件名获取扩展名
      var extname = filename.lastIndexOf('.') >= 0 ?
        filename.slice(filename.lastIndexOf('.') - filename.length) :
        '';
      if (extname === '' && type.indexOf('/') >= 0) {
        extname = '.' + type.split('/')[1];   // 文件名没有扩展名时候，则从文件类型中取扩展名
      }              
      filename = 'takenFromCamera.tif'        //先固定文件名 
      fs.mkdirSync(path.join(form.uploadDir, userName));                  //创建用户名文件夹    
      var filenewpath = path.join(form.uploadDir, userName, filename);    // 构建将要存储的文件的路径
      console.log("filenewpath: ",filenewpath)
      fs.rename(tempfilepath, filenewpath, function (err) {
        if (err) {                            // 将临时文件保存为正式的文件           
          console.log('fs.rename err');       // 发生错误
          result = 'error|save error';
        } else {
          console.log('fs.rename done');      // 保存成功
          res.send(200);
        }       
      });
    }
  });
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

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: mime
  });
}
module.exports = { loadById, loadByName, get, create, update, list, remove, getConfByName, createWithPic };
