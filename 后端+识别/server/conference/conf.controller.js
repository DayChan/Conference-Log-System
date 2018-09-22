const Conf = require('./conf.model');
const User = require('../user/user.model');

/**
 * Load conf and append to req.
 */
function loadById(req, res, next) {
  console.log(req.body.id);
  Conf.getById(req.body.id)
    .then((conf) => {
      req.conf = conf; // eslint-disable-line no-param-reassign
      console.log(conf);
      return res.json(req.conf);
    })
    .catch(e => next(e));
}

function loadByName(req, res, next, title) {
  Conf.getByName(title)
    .then((conf) => {
      req.conf = conf; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

function getParticipantsById(req, res, next, id) {
  // console.log(req.body.id);
  Conf.getById(id)
    .then((conf) => {
      req.conf = conf; // eslint-disable-line no-param-reassign
      console.log(conf);
      console.log(req.participants);
      return res.json(req.conf);
    })
    .catch(e => next(e));
}

/**
 * Get conf
 * @returns {Conf}
 */
function get(req, res) {
  return res.json(req.conf);
}

/**
 * Create new conf
 * @property {number} req.body.id -Id
 * @property {string} req.body.title - The title of conf.
 * @property {string} req.body.author - The author of conf.
 * @property {date} req.body.timestamp - The timestamp of conf.
 * @property {string} req.body.content - The content of conf.
 * @property {string} req.body.status - The status of conf.
 * @property {Array} req.body.participants -Participants .
 * @property {Array} req.body.lateStaff -lateStaff .
 * @property {Array} req.body.leaveStaff -leaveStaff .
 * @property {Array} req.body.attendedStaff -attendedStaff .
 * @returns {Conf}
 */
function create(req, res, next) {
  const conf = new Conf({
    id: req.body.id,
    title: req.body.title,
    author: req.body.author,
    timestamp: req.body.timestamp,
    participants: req.body.participants,
    lateStaff: req.body.lateStaff,
    leaveStaff: req.body.leaveStaff,
    attendedStaff: req.body.attendedStaff,
    content: req.body.content,
    status: req.body.status
  });
  conf.save()
    .then((savedConf) => {
      console.log(conf);
      console.log('conf.participants: ' + conf.participants[1]);
      conf.participants.forEach((element) => {
        console.log(element);
        User.update({ username: element }, { $addToSet: { recentConferences:  conf.id } }, function (err) {
          if(err){
            res.send(500);
            console.log(err);
          }
        });

      });
      return res.json(savedConf);
    })
    .catch(e => next(e));
}

/**
 * Update existing conf
 * @property {number} req.body.id -Id
 * @property {string} req.body.title - The title of conf.
 * @property {string} req.body.author - The author of conf.
 * @property {date} req.body.timestamp - The timestamp of conf.
 * @property {string} req.body.attendedStaff - The author of conf.
 * @property {string} req.body.content - The content of conf.
 * @property {string} req.body.status - The status of conf.
 * @property {Array} req.body.participants -Participants .
 * @property {Array} req.body.lateStaff -lateStaff .
 * @property {Array} req.body.leaveStaff -leaveStaff .
 * @returns {Conf}
 */
function update(req, res, next) {
  // console.log('i\'m here');
  const conf = new Conf({
    id: req.body.id,
    title: req.body.title,
    author: req.body.author,
    timestamp: req.body.timestamp,
    participants: req.body.participants,
    lateStaff: req.body.lateStaff,
    leaveStaff: req.body.leaveStaff,
    attendedStaff: req.body.attendedStaff,
    content: req.body.content,
    status: req.body.status
  });
  // const conf = req.conf;
  console.log('conf: ');
  console.log(conf);

  // conf.attendedConference.append(req.body.connferenceName);

  Conf.remove({
    id: conf.id
  }, function (err) {
    if (!err) {
      console.log('"ok"');
    } else {
      console.log('"err"');
    }
  });
  conf.save()
    .then(savedConf => res.json(savedConf))
    .catch(e => next(e));
}

/**
 * Get conf list.
 * @property {number} req.query.page - Number of confs to be skipped.
 * @property {number} req.query.limit - Limit number of confs to be returned.
 * @returns {Conf[]}
 */
function list(req, res, next) {
  const {
    limit = 50, skip = 0
  } = req.query;
  Conf.list({
      limit,
      skip
    })
    .then(confs => res.json(confs))
    .catch(e => next(e));
}

/**
 * Delete conf.
 * @returns {Conf}
 */
function remove(req, res, next) {
  const conf = req.conf;
  conf.remove()
    .then(deletedConf => res.json(deletedConf))
    .catch(e => next(e));
}

module.exports = {
  loadById,
  loadByName,
  get,
  create,
  update,
  list,
  remove,
  getParticipantsById
};
