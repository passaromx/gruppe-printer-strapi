'use strict';

/**
 * Label.js controller
 *
 * @description: A set of functions called "actions" for managing `Label`.
 */

module.exports = {

  /**
   * Retrieve label records.
   *
   * @return {Object|Array}
   */
  labelsPrinter: async (ctx) => {
    const labels = await strapi.services.label.fetchAll(ctx.query, true);
    // const labels_ = labels.map(label => {
    //   return {
    //     name: label.name,
    //     sku: label.sku,

    //   }
    // })
    return labels;
  },

  download: async (ctx) => {
    console.log('download');
    return strapi.services.label.fetchDownloads(ctx.query, ctx.request.body);
  },

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.label.search(ctx.query);
    } else {
      return strapi.services.label.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a label record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.label.fetch(ctx.params);
  },

  /**
   * Count label records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.label.count(ctx.query);
  },

  /**
   * Create a/an label record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    console.log(ctx.request.body);
    const created = await strapi.services.label.add(ctx.request.body);
    return created;
  },

  /**
   * Update a/an label record.
   *
   * @return {Object}
   */

  update: async (ctx) => {
    console.log(ctx.request.body);
    return strapi.services.label.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an label record.
   *
   * @return {Object}
   */

  destroy: async (ctx) => {
    const label = strapi.services.label.remove(ctx.params);
    if(!label) return ctx.response.notFound();
    return label;
  },

  deleteMany: async ctx => {  
    const { query } = ctx;
    return strapi.services.label.deleteMany(query);
  }
};
