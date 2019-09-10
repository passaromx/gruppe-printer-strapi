'use strict';

/**
 * Client.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

module.exports = {

  /**
   * Promise to fetch all clients.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('client', params);
    // Select field to populate.
    const populate = Client.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');
    // console.log(populate);
    return Client
      .find({deleted: false})
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate)
      .populate({
        path: 'licenses',
        populate: {
          path: 'print'
        }});
  },

  /**
   * Promise to fetch a/an client.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Client.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Client
      .findOne(_.pick(params, _.keys(Client.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count clients.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('client', params);

    return Client
      .count()
      .where(filters.where);
  },

  /**
   * Promise to add a/an client.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Client.associations.map(ast => ast.alias));
    const data = _.omit(values, Client.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Client.create(data);

    // Create relational data and return the entry.
    return Client.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an client.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Client.associations.map(a => a.alias));
    const data = _.omit(values, Client.associations.map(a => a.alias));

    // Update entry with no-relational data.
    const entry = await Client.update(params, data, { multi: true });

    // Update relational data and return the entry.
    return Client.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an client.
   *
   * @return {Promise}
   */

  remove: async params => {
    const data = await Client.update(params, { deleted: true }, { multi: true });

    return data;
  },

  /**
   * Promise to search a/an client.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('client', params);
    // Select field to populate.
    const populate = Client.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(Client.attributes).reduce((acc, curr) => {
      switch (Client.attributes[curr].type) {
        case 'integer':
        case 'float':
        case 'decimal':
          if (!_.isNaN(_.toNumber(params._q))) {
            return acc.concat({ [curr]: params._q });
          }

          return acc;
        case 'string':
        case 'text':
        case 'password':
          return acc.concat({ [curr]: { $regex: params._q, $options: 'i' } });
        case 'boolean':
          if (params._q === 'true' || params._q === 'false') {
            return acc.concat({ [curr]: params._q === 'true' });
          }

          return acc;
        default:
          return acc;
      }
    }, []);

    return Client
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
