'use strict';

/**
 * Print.js controller
 *
 * @description: A set of functions called "actions" for managing `Print`.
 */

module.exports = {

  /**
   * Retrieve print records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.print.search(ctx.query);
    } else {
      return strapi.services.print.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a print record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.print.fetch(ctx.params);
  },

  /**
   * Count print records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.print.count(ctx.query);
  },

  /**
   * Create a/an print record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.print.add(ctx.request.body);
  },

  /**
   * Update a/an print record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.print.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an print record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.print.remove(ctx.params);
  }
};
