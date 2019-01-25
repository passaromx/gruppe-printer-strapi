'use strict';

/**
 * Lastprint.js controller
 *
 * @description: A set of functions called "actions" for managing `Lastprint`.
 */

module.exports = {

  /**
   * Retrieve lastprint records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.lastprint.search(ctx.query);
    } else {
      return strapi.services.lastprint.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a lastprint record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.lastprint.fetch(ctx.params);
  },

  /**
   * Count lastprint records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.lastprint.count(ctx.query);
  },

  /**
   * Create a/an lastprint record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.lastprint.add(ctx.request.body);
  },

  /**
   * Update a/an lastprint record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.lastprint.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an lastprint record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.lastprint.remove(ctx.params);
  }
};
