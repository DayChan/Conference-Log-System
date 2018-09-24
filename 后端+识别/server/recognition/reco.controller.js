const Conf = require('../conference/conf.model');
const User = require('../user/user.model');
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

function getLocalTime(date){
  var date = new Date(date);//如果date为13位不需要乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y+M+D+h+m+s;
}

function handlePicsByUser(req, res, next) {
  // console.log(req);
  // 固定的文件路径
  const filePath = './image/takenFromCamera.png';
  const tiffPath = './image/takenFromCamera.tif';
  const converterPath = './png2tiff/png_converter.py'
  const recoPath = './faceReco_conference/reco.py'

  var form = new formidable.IncomingForm();
  form.uploadDir = './image'; // 上传文件的保存路径ir
  form.keepExtensions = true; // 保存扩展名
  form.maxFieldsSize = 200 * 1024 * 1024; // 上传文件的最大大小
  console.log(form);
  
  // 处理 request
  form.parse(req, function (err, fields, files) {
    if (err) {
      return console.log('formidable, form.parse err');
    }

    console.log('formidable, form.parse ok');

    // 显示参数，例如 token
    console.log('显示上传时的参数 begin');
    console.log(fields);
    console.log(files);
    console.log('显示上传时的参数 end');

    var item;

    // 计算 files 长度
    var length = 0;
    for (item in files) {
      length++;
    }
    if (length === 0) {
      console.log('files no data');
      return;
    }

    for (item in files) {
      var file = files[item];
      // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
      var tempfilepath = file.path;
      // 获取文件类型
      var type = file.type;

      // 获取文件名，并根据文件名获取扩展名
      var filename = file.name;
      var extname = filename.lastIndexOf('.') >= 0 ?
        filename.slice(filename.lastIndexOf('.') - filename.length) :
        '';
      // 文件名没有扩展名时候，则从文件类型中取扩展名
      if (extname === '' && type.indexOf('/') >= 0) {
        extname = '.' + type.split('/')[1];
      }
      // 将文件名重新赋值为一个随机数（避免文件重名）
      // filename = Math.random().toString().slice(2) + extname;

      // 构建将要存储的文件的路径
      var filenewpath = path.join(form.uploadDir, filename);
      
      // 将临时文件保存为正式的文件
      fs.rename(tempfilepath, filenewpath, function (err) {
        // 存储结果
        
        var result = '';
        
        if (err) {
          // 发生错误
          console.log('fs.rename err');
          result = 'error|save error';
        } else {
          // 保存成功
          console.log('fs.rename done');
          let username;
          let usernameArray = [];

          async.series(
            [
              function (done) {
                console.log("ready to convert");
                console.log('filePath: ' + filePath);
                // png to tiff
                var py = spawnSync('python3', [converterPath, filePath]);
                // py.stdout.on('data', (data) => {
                //   console.log(`stdout: ${data}`);
                // })
                console.log(py.stdout.toString());
                console.log(py.stderr.toString());
                done(err, result);
              },

              function (done) {
                // 调用识别模块
                console.log("ready to recognize");
                var py = spawn('python3', [recoPath, tiffPath], {
                  stdio: [null, null, null, 'ipc']
                });

                py.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                  usernameArray = data.toString('utf8').split("\'");
                  username = usernameArray[1];
                  console.log('username: ' + username);
                  if (username === 'Err!') {
                    res.send(500);
                  } else {
                    User.getByName(username)
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
                })
                py.stderr.on('data', (data) => {
                  console.log(`stderr: ${data}`);
                })
                py.on('close', (code) => {
                  console.log(`子进程退出码：${code}`);
                })
                // console.log(py.stdout.toString());
                // console.log(py.stderr.toString());
                // var username = py.stdout.buffer();

                // console.log('username: ' + username);
                done(err, result);
              }
            ],
            function (errs, results) {
              if (errs) throw errs; // errs = [err1, err2, err3]
              console.log('results: ' + results); // results = [result1, result2, result3]
            });
        }

        // 返回结果
      }); // fs.rename
    } // for in 
  });

  // // 识别结束，删除照片
  // fs.unlinkSync(filePath);

}

/**
 * ! 把user表中存的Conf改为conf_title
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function handlePicsByConf(req, res, next) {
  const filePath = './image/takenFromCamera.png';
  const tiffPath = './image/takenFromCamera.tif';
  const converterPath = './png2tiff/png_converter.py'
  const recoPath = './faceReco_conference/reco.py'
  let fieldid;

  var form = new formidable.IncomingForm();
  form.uploadDir = './image'; // 上传文件的保存路径
  form.keepExtensions = true; // 保存扩展名
  form.maxFieldsSize = 20 * 1024 * 1024; // 上传文件的最大大小
  // console.log(form);
  // 处理 request
  form.parse(req, function (err, fields, files) {
    if (err) {
      return console.log('formidable, form.parse err');
    }

    console.log('formidable, form.parse ok');

    // 显示参数，例如 token
    console.log('显示上传时的参数 begin');
    console.log(fields);
    // console.log(fields.id);
    // console.log(files);
    fieldid = fields.id;
    console.log('显示上传时的参数 end');

    var item;

    // 计算 files 长度
    var length = 0;
    for (item in files) {
      length++;
    }
    if (length === 0) {
      console.log('files no data');
      return;
    }

    for (item in files) {
      var file = files[item];
      // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
      var tempfilepath = file.path;
      // 获取文件类型
      var type = file.type;

      // 获取文件名，并根据文件名获取扩展名
      var filename = file.name;
      var extname = filename.lastIndexOf('.') >= 0 ?
        filename.slice(filename.lastIndexOf('.') - filename.length) :
        '';
      // 文件名没有扩展名时候，则从文件类型中取扩展名
      if (extname === '' && type.indexOf('/') >= 0) {
        extname = '.' + type.split('/')[1];
      }
      // 将文件名重新赋值为一个随机数（避免文件重名）
      // filename = Math.random().toString().slice(2) + extname;

      // 构建将要存储的文件的路径
      var filenewpath = path.join(form.uploadDir, filename);

      // 将临时文件保存为正式的文件
      fs.rename(tempfilepath, filenewpath, function (err) {
        // 存储结果
        var result = '';

        if (err) {
          // 发生错误
          console.log('fs.rename err');
          result = 'error|save error';
        } else {
          // 保存成功
          console.log('fs.rename done');
          // 拼接图片url地址
          let user_name;
          let usernameArray = [];

          async.series(
            [
              function (done) {
                console.log("ready to convert");
                console.log('filePath: ' + filePath);
                // png to tiff
                var py = spawnSync('python3', [converterPath, filePath]);
                // py.stdout.on('data', (data) => {
                //   console.log(`stdout: ${data}`);
                // })
                console.log(py.stdout.toString());
                console.log(py.stderr.toString());
                done(err, result);
              },

              function (done) {
                // 调用识别模块
                // console.log(fieldid);
                console.log("ready to recognize");
                var py = spawn('python3', [recoPath, tiffPath], {
                  stdio: [null, null, null, 'ipc']
                });

                py.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                  usernameArray = data.toString('utf8').split("\'");
                  user_name = usernameArray[1];
                  console.log('username: ' + user_name);
                  if (user_name === 'Err!') {
                    res.send(500);
                  } else {
                    console.log('fieldid: ' + fieldid);
                    Conf.getById(fieldid)
                      .then((conf) => {
                        console.log('1');
                        console.log('conf: ' + conf);   //* 对user表加减conf
                        User.update({ username: user_name }, { $pull: { attendedConferences: {id: conf[0].id} } }, function(err) {
                          if(err) {
                            console.log(err);
                            }
                          });   //在将会议加入最近用户前先将同其中id会议删除（防止二次登陆）
                        User.update({ username: user_name }, { $addToSet: { attendedConferences: conf[0] } }, function(err) {
                          if(err){
                            console.log(err);
                            }
                          });
                        console.log('2');     //! 测试
                        User.update({ username: user_name }, { $pull: { recentConferences: {id: conf[0].id} } }, function(err) {
                          if(err) {
                            console.log(err);
                            }
                          });
                        console.log('3');
                        User.getByName(user_name)   //* 对conf表加减user
                        .then((user) => {
                          console.log('4');
                          console.log('user: ' + user);
                          var timestamp = Date.parse(new Date());
                          var timeNow = getLocalTime(timestamp);
                          console.log('timeNow: ' + timeNow);
                          Conf.update({ id: fieldid }, { $pull: { attendedStaff: {user_name: user_name} } }, function(err) {
                            if (err) {
                              console.log(err);
                              }
                            });
                          Conf.update({ id: fieldid }, { $addToSet: { attendedStaff: {user_name, timeNow} } }, function(err) {
                            if (err) {
                              console.log(err);
                              }else {res.send(200);}
                            }); 
                          /* 
                          console.log('5');
                          Conf.update({ id: fieldid }, { $pull: { participants: user_name } }, function(err) {
                            if (err) {
                              console.log(err);
                            }
                          }); //? 这是将username从conf participants中pull掉的操作，不知要不要加 
                          */                            
                          }).catch(e => next(e));
                        }).catch(e => next(e));
                      }
                  })
                py.stderr.on('data', (data) => {
                  console.log(`stderr: ${data}`);
                })
                py.on('close', (code) => {
                  console.log(`子进程退出码：${code}`);
                })
                done(err, result);
              }
            ],
            function (errs, results) {
              if (errs) throw errs; // errs = [err1, err2, err3]
              console.log('results: ' + results); // results = [result1, result2, result3]
            });
        }
        // 返回结果
        // res.writeHead(200, {
        //   'Content-type': 'text/html'
        // });
        // res.end();
      }); // fs.rename
    } // for in 
  });
/*
  var picPath = form.uploadDir + "/" + file.name;
  var py = spawn(python3, [recoPath, picPath]);
  var name = null;
  py.stdio.on('data', (data) => {
    console.log(`stdout: ${data}`);
    name = data;
  })
  console.log(`stdout: ${name}`);

  User.update({
    username: name
  }, {
    $pull: {
      recentConferences: {
        id: confid
      }
    }
  }, function (err) {
    if (err) {
      res.send(500);
      console.log(err);
    }
  });
  User.update({
    username: name
  }, {
    $addToSet: {
      recentConferences: {
        id: confid
      }
    }
  }, function (err) {
    if (err) {
      res.send(500);
      console.log(err);
    }
  });
  */
}


// function loadByName(req, res, next, title) {
//   Conf.getByName(title)
//     .then((conf) => {
//       req.conf = conf; // eslint-disable-line no-param-reassign
//       return next();
//     })
//     .catch(e => next(e));
// }

/**
 * TODO: 写一个结束会议识别签到的api 
 * TODO: 在数据库conf表加一项已离席人员 OK
 * handlepicsbyconfend
 */

function handlePicsByConfEnd(req, res, next) {
  const filePath = './image/takenFromCamera.png';
  const tiffPath = './image/takenFromCamera.tif';
  const converterPath = './png2tiff/png_converter.py'
  const recoPath = './faceReco_conference/reco.py'
  let fieldid;

  var form = new formidable.IncomingForm();
  form.uploadDir = './image'; // 上传文件的保存路径
  form.keepExtensions = true; // 保存扩展名
  form.maxFieldsSize = 20 * 1024 * 1024; // 上传文件的最大大小
  // console.log(form);
  // 处理 request
  form.parse(req, function (err, fields, files) {
    if (err) {
      return console.log('formidable, form.parse err');
    }

    console.log('formidable, form.parse ok');

    // 显示参数，例如 token
    console.log('显示上传时的参数 begin');
    console.log(fields);
    // console.log(fields.id);
    // console.log(files);
    fieldid = fields.id;
    console.log('显示上传时的参数 end');

    var item;

    // 计算 files 长度
    var length = 0;
    for (item in files) {
      length++;
    }
    if (length === 0) {
      console.log('files no data');
      return;
    }

    for (item in files) {
      var file = files[item];
      // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
      var tempfilepath = file.path;
      // 获取文件类型
      var type = file.type;

      // 获取文件名，并根据文件名获取扩展名
      var filename = file.name;
      var extname = filename.lastIndexOf('.') >= 0 ?
        filename.slice(filename.lastIndexOf('.') - filename.length) :
        '';
      // 文件名没有扩展名时候，则从文件类型中取扩展名
      if (extname === '' && type.indexOf('/') >= 0) {
        extname = '.' + type.split('/')[1];
      }
      // 将文件名重新赋值为一个随机数（避免文件重名）
      // filename = Math.random().toString().slice(2) + extname;

      // 构建将要存储的文件的路径
      var filenewpath = path.join(form.uploadDir, filename);

      // 将临时文件保存为正式的文件
      fs.rename(tempfilepath, filenewpath, function (err) {
        // 存储结果
        var result = '';

        if (err) {
          // 发生错误
          console.log('fs.rename err');
          result = 'error|save error';
        } else {
          // 保存成功
          console.log('fs.rename done');
          // 拼接图片url地址
          let user_name;
          let usernameArray = [];

          async.series(
            [
              function (done) {
                console.log("ready to convert");
                console.log('filePath: ' + filePath);
                // png to tiff
                var py = spawnSync('python3', [converterPath, filePath]);
                // py.stdout.on('data', (data) => {
                //   console.log(`stdout: ${data}`);
                // })
                console.log(py.stdout.toString());
                console.log(py.stderr.toString());
                done(err, result);
              },

              function (done) {
                // 调用识别模块
                // console.log(fieldid);
                console.log("ready to recognize");
                var py = spawn('python3', [recoPath, tiffPath], {
                  stdio: [null, null, null, 'ipc']
                });

                py.stdout.on('data', (data) => {
                  console.log(`stdout: ${data}`);
                  usernameArray = data.toString('utf8').split("\'");
                  user_name = usernameArray[1];
                  console.log('username: ' + user_name);
                  if (user_name === 'Err!') {
                    res.send(500);
                  } else {
                    console.log('fieldid: ' + fieldid);
                    Conf.getById(fieldid)
                      .then((conf) => {
                        User.getByName(user_name)   //* 对conf表加减user
                        .then((user) => {
                          console.log('1');
                          console.log('user: ' + user);
                          var timestamp = Date.parse(new Date());
                          var timeNow = getLocalTime(timestamp);
                          console.log('timeNow: ' + timeNow);
                          Conf.update({ id: conf[0].id }, { $pull: { haveLeftStaff: {user_name: user_name} } }, function(err) {
                            if (err) {
                              console.log(err);
                              }
                            });
                          Conf.update({ id: conf[0].id }, { $addToSet: { haveLeftStaff: {user_name, timeNow} } }, function(err) {
                            if (err) {
                              console.log(err);
                              } else {res.send(200);}
                            });
                          console.log("done left");
                          
                          }).catch(e => next(e));
                        }).catch(e => next(e));
                      }
                  })
                py.stderr.on('data', (data) => {
                  console.log(`stderr: ${data}`);
                })
                py.on('close', (code) => {
                  console.log(`子进程退出码：${code}`);
                })
                done(err, result);
              }
            ],
            function (errs, results) {
              if (errs) throw errs; // errs = [err1, err2, err3]
              console.log('results: ' + results); // results = [result1, result2, result3]
            });
        }
      }); 
    } 
  });
}

module.exports = {
  handlePicsByUser,
  handlePicsByConf,
  handlePicsByConfEnd
};