'use strict';

/**
 * Client.js controller
 *
 * @description: A set of functions called "actions" for managing `Client`.
 */

module.exports = {

  /**
   * Retrieve client records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.client.search(ctx.query);
    } else {
      return strapi.services.client.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a client record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.client.fetch(ctx.params);
  },

  /**
   * Count client records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.client.count(ctx.query);
  },

  /**
   * Create a/an client record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.client.add(ctx.request.body);
  },

  /**
   * Update a/an client record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.client.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an client record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.client.remove(ctx.params);
  }
};
