'use strict';

/**
 * Jwt.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../../../jwk.json');
const defaultJwtOptions = { expiresIn: '30d' };


module.exports = {
  getToken: function (ctx) {
    const params = _.assign({}, ctx.request.body, ctx.request.query);

    let token = '';

    if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
      const parts = ctx.request.header.authorization.split(' ');

      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new Error('Invalid authorization header format. Format is Authorization: Bearer [token]');
      }
    } else if (params.token) {
      token = params.token;
    } else {
      throw new Error('No authorization header was found');
    }

    return this.verify(token);
  },

  issue: (payload, jwtOptions = {}) => {
    _.defaults(jwtOptions, defaultJwtOptions);
    const token = jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      process.env.JWT_SECRET || _.get(strapi.plugins['users-permissions'], 'config.jwtSecret') || 'oursecret',
      {},
    );
    return token;
  },

  verify: (token) => {
    return new Promise(function (resolve, reject) {
      // const pem = jwkToPem(jwk);
      // jwt.verify(
      //   token, 
      //   pem, 
      //   function(err, decodedToken) {
      //     if (err) {
            
      //       return reject(new Error('Invalid token.'));
      //     }
      //     resolve(decodedToken);
      // });
      jwt.verify(
        token,
        process.env.JWT_SECRET || _.get(strapi.plugins['users-permissions'], 'config.jwtSecret') || 'oursecret',
        {},
        function (err, tokenPayload = {}) {
          if (err) {
            return reject(new Error('Invalid token.'));
          }
          resolve(tokenPayload);
        }
      );
    });
  }
};
