'use strict';

/**
 * Printrecord.js controller
 *
 * @description: A set of functions called "actions" for managing `Printrecord`.
 */

module.exports = {

  /**
   * Retrieve printrecord records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.printrecord.search(ctx.query);
    } else {
      return strapi.services.printrecord.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a printrecord record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.printrecord.fetch(ctx.params);
  },

  /**
   * Retrieve a printrecord record.
   *
   * @return {Object}
   */

  findOneAndUpdate: async (ctx) => {

    // if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
    //   return ctx.notFound();
    // }

    return strapi.services.printrecord.fetchAndUpdate(ctx);
  },

  /**
   * Count printrecord records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.printrecord.count(ctx.query);
  },

  /**
   * Create a/an printrecord record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.printrecord.add(ctx.request.body);
  },

  /**
   * Update a/an printrecord record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.printrecord.edit(ctx) ;
  },

  /**
   * Destroy a/an printrecord record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.printrecord.remove(ctx.params);
  }
};
