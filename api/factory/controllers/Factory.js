'use strict';

/**
 * Factory.js controller
 *
 * @description: A set of functions called "actions" for managing `Factory`.
 */

module.exports = {

  /**
   * Retrieve factory records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.factory.search(ctx.query);
    } else {
      return strapi.services.factory.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a factory record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.factory.fetch(ctx.params);
  },

  /**
   * Count factory records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.factory.count(ctx.query);
  },

  /**
   * Create a/an factory record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.factory.add(ctx.request.body);
  },

  /**
   * Update a/an factory record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.factory.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an factory record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.factory.remove(ctx.params);
  }
};
