'use strict';

/**
 * License.js controller
 *
 * @description: A set of functions called "actions" for managing `License`.
 */

module.exports = {

  /**
   * Retrieve license records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.license.search(ctx.query);
    } else {
      return strapi.services.license.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a license record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.license.fetch(ctx.params);
  },

  /**
   * Count license records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.license.count(ctx.query);
  },

  /**
   * Create a/an license record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.license.add(ctx.request.body);
  },

  /**
   * Update a/an license record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.license.edit(ctx.params, ctx.request.body, ctx.query) ;
  },

  /**
   * Destroy a/an license record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.license.remove(ctx.params);
  }
};
