'use strict';

/**
 * Update.js controller
 *
 * @description: A set of functions called "actions" for managing `Update`.
 */

module.exports = {

  /**
   * Retrieve update records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.update.search(ctx.query);
    } else {
      return strapi.services.update.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a update record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.update.fetch(ctx.params);
  },

  /**
   * Count update records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.update.count(ctx.query);
  },

  /**
   * Create a/an update record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.update.add(ctx.request.body);
  },

  /**
   * Update a/an update record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.update.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an update record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.update.remove(ctx.params);
  }
};
