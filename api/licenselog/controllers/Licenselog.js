'use strict';

/**
 * Licenselog.js controller
 *
 * @description: A set of functions called "actions" for managing `Licenselog`.
 */

module.exports = {

  /**
   * Retrieve licenselog records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.licenselog.search(ctx.query);
    } else {
      return strapi.services.licenselog.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a licenselog record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.licenselog.fetch(ctx.params);
  },

  /**
   * Count licenselog records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.licenselog.count(ctx.query);
  },

  /**
   * Create a/an licenselog record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.licenselog.add(ctx.request.body);
  },

  /**
   * Update a/an licenselog record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.licenselog.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an licenselog record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.licenselog.remove(ctx.params);
  }
};
