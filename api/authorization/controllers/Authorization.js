'use strict';

/**
 * Authorization.js controller
 *
 * @description: A set of functions called "actions" for managing `Authorization`.
 */

module.exports = {

  /**
   * Retrieve authorization records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.authorization.search(ctx.query);
    } else {
      return strapi.services.authorization.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a authorization record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.authorization.fetch(ctx.params);
  },

  /**
   * Count authorization records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.authorization.count(ctx.query);
  },

  /**
   * Create a/an authorization record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.authorization.add(ctx.request.body);
  },

  /**
   * Update a/an authorization record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.authorization.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an authorization record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.authorization.remove(ctx.params);
  }
};
