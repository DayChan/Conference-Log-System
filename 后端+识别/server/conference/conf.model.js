const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

/**
 * Conference Schema
 * TODO: CONF表中加一项已离席
 */
const ConferenceSchema = new mongoose.Schema({
  id: {
    type: Number
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  participants: {
    type: Array
  },
  attendedStaff: {
    type: Array
  },
  leaveStaff: {
    type: Array
  },
  lateStaff: {
    type: Array
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String
  },
  status: {
    type: String
  },
  haveLeftStaff: {
    type: Array
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ConferenceSchema.method({});

/**
 * Statics
 */
ConferenceSchema.statics = {
  /**
   * Get conf
   * @param {id} confId - The objectId of conf.
   * @returns {Promise<Conference, APIError>}
   */
  getById(confId) {
    return this.where('id', confId)
      .exec()
      .then((conf) => {
        if (conf) {
          return conf;
        }
        const err = new APIError('No such conf exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * Get conf
   * @param {confname} title - The confname of conf.
   * @returns {Promise<Conference, APIError>}
   */
  getByName(title) {
    return this.where('confname', title)
      // .$where("this.confname == name")
      .exec()
      .then((conf) => {
        if (conf) {
          return conf;
        }
        const err = new APIError('No such conf exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * List confs in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of confs to be skipped.
   * @param {number} limit - Limit number of confs to be returned.
   * @returns {Promise<Conference[]>}
   */
  list({
    skip = 0,
    limit = 50
  } = {}) {
    return this.find()
      .sort({
        createdAt: -1
      })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Conference
 */
module.exports = mongoose.model('Conference', ConferenceSchema);
