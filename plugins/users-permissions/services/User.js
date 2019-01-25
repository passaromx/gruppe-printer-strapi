'use strict';

/**
 * User.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

const poolData = {    
  UserPoolId : "us-east-1_JyYULwrlF", // Your user pool id here    
  ClientId : "3tmo4pkier010pf900ucb059jq" // Your client id here
}; 
const pool_region = 'us-east-1';

module.exports = {
  /**
   * Promise to add a/an user.
   *
   * @return {Promise}
   */
  addCognito: async (values) => {
    
    return new Promise((resolve, reject) => {
      const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
      const attributeList = [];
      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'name',Value: values.name}));
      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'email',Value: values.email}));
      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'custom:role',Value: values.role || '5c2f94bdf80d6665bf53b9d9'}));
      attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:'custom:user_id',Value: values.user_id }));

      userPool.signUp(values.email, values.password, attributeList, null, function(err, result){
        if (err) {
          console.log('err', err);
          reject(err)
        }
        
        resolve(result)
      });
    })
    
  },

  add: async (values) => {
    if (values.password) {
      values.password = await strapi.plugins['users-permissions'].services.user.hashPassword(values);
    }

    // Use Content Manager business logic to handle relation.
    if (strapi.plugins['content-manager']) {
      return await strapi.plugins['content-manager'].services['contentmanager'].add({
        model: 'user'
      }, values, 'users-permissions');
    }

    return strapi.query('user', 'users-permissions').create(values);
  },

  /**
   * Promise to edit a/an user.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Note: The current method will return the full response of Mongo.
    // To get the updated object, you have to execute the `findOne()` method
    // or use the `findOneOrUpdate()` method with `{ new:true }` option.
    if (values.password) {
      values.password = await strapi.plugins['users-permissions'].services.user.hashPassword(values);
    }

    // Use Content Manager business logic to handle relation.
    if (strapi.plugins['content-manager']) {
      params.model = 'user';
      params.id = (params._id || params.id);

      return await strapi.plugins['content-manager'].services['contentmanager'].edit(params, values, 'users-permissions');
    }

    return strapi.query('user', 'users-permissions').update(_.assign(params, values));
  },

  /**
   * Promise to fetch a/an user.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    return strapi.query('user', 'users-permissions').findOne(_.pick(params, ['_id', 'id']));
  },

  /**
   * Promise to fetch all users.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    return strapi.query('user', 'users-permissions').find(strapi.utils.models.convertParams('user', params));
  },

  hashPassword: function (user = {}) {
    return new Promise((resolve) => {
      if (!user.password || this.isHashed(user.password)) {
        resolve(null);
      } else {
        bcrypt.hash(`${user.password}`, 10, (err, hash) => {
          resolve(hash);
        });
      }
    });
  },

  isHashed: (password) => {
    if (typeof password !== 'string' || !password) {
      return false;
    }

    return password.split('$').length === 4;
  },

  /**
   * Promise to remove a/an user.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Use Content Manager business logic to handle relation.
    if (strapi.plugins['content-manager']) {
      params.model = 'user';
      params.id = (params._id || params.id);

      await strapi.plugins['content-manager'].services['contentmanager'].delete(params, {source: 'users-permissions'});
    }

    return strapi.query('user', 'users-permissions').delete(params);
  },

  removeAll: async (params, query) => {
    // Use Content Manager business logic to handle relation.
    if (strapi.plugins['content-manager']) {
      params.model = 'user';
      query.source = 'users-permissions';

      return await strapi.plugins['content-manager'].services['contentmanager'].deleteMany(params, query);
    }

    // TODO remove this logic when we develop plugins' dependencies
    const primaryKey = strapi.query('user', 'users-permissions').primaryKey;
    const toRemove = Object.keys(query).reduce((acc, curr) => {
      if (curr !== 'source') {
        return acc.concat([query[curr]]);
      }

      return acc;
    }, []);

    return strapi.query('user', 'users-permissions').deleteMany({
      [primaryKey]: toRemove,
    });
  },

  validatePassword: (password, hash) => {
    return bcrypt.compareSync(password, hash);
  }
};
