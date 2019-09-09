'use strict';

/**
 * Authorization.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

module.exports = {

  /**
   * Promise to fetch all authorizations.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('authorization', params);
    // Select field to populate.
    const populate = Authorization.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Authorization
      .find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      // .limit(filters.limit)
      .populate(populate);
  },

  /**
   * Promise to fetch a/an authorization.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Authorization.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Authorization
      .findOne(_.pick(params, _.keys(Authorization.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count authorizations.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('authorization', params);

    return Authorization
      .count()
      .where(filters.where);
  },

  /**
   * Promise to add a/an authorization.
   *
   * @return {Promise}
   */

  add: async (values) => {
    const source = 'content-manager';
    // Extract values related to relational data.
    const relations = _.pick(values, Authorization.associations.map(ast => ast.alias));
    const data = _.omit(values, Authorization.associations.map(ast => ast.alias));

    if(values.hasOwnProperty('fields') && values.hasOwnProperty('files')) {
      const files = values.files;
      const entry = await Authorization.create(values.fields);

      if (strapi.plugins.upload && Object.keys(files).length > 0) {
        await strapi.plugins.upload.services.upload.uploadToEntity({
          id: entry.id || entry._id,
          model: 'authorization'
        }, files, source);
      }

      const authorization = await Authorization.updateRelations({ _id: entry.id, values: relations });
      return authorization;
    }

    // Create entry with no-relational data.
    const entry = await Authorization.create(data);

    // Create relational data and return the entry.
    return Authorization.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an authorization.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const values_ = values.fields ? values.fields : values;
    const relations = _.pick(values_, Authorization.associations.map(a => a.alias));
    const data = _.omit(values_, Authorization.associations.map(a => a.alias));

    // Update entry with no-relational data.
    await Authorization.update(params, data, { multi: true });

    if(values.hasOwnProperty('files')) {
      const source = 'content-manager';
      const files = values.files;
      if (strapi.plugins.upload && Object.keys(files).length > 0) {
        const updateFiles = Object.keys(files).map(async file => {
          await strapi.plugins.upload.models.file.deleteMany({
            'related.ref': params._id,
            'related.field': file
          });
          
          return file;
        });
        
        await strapi.plugins.upload.services.upload.uploadToEntity({
          id: params._id,
          model: 'authorization'
        }, files, source);
      }
    }

    // Update relational data and return the entry.
    return Authorization.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an authorization.
   *
   * @return {Promise}
   */

  remove: async params => {
    const response = await Authorization.findOne({
      id: params._id
    });

    if(!response) return null;

    await strapi.plugins.upload.models.file.deleteMany({
      'related.ref': params._id
    });

    return await Authorization.findOneAndDelete({
      id: params._id
    });
  },

  deleteMany: async query => {
    let ids = query.ids.split(','); 
    ids = ids.length <= 0 ? query.ids : ids;

    const populate = Authorization.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const items = await Authorization.find({ _id: { $in: ids } }).populate(populate);
    // console.log(items);
    // console.log(strapi.plugins.upload.models.file);

    items.map(async item => {
      // console.log(item);
      await strapi.plugins.upload.models.file.findOneAndDelete({
        _id: item.authPdf.related[0]
      });
    });

    return await Authorization.deleteMany({
      _id: {$in: ids}
    });
    return;
  },

  /**
   * Promise to search a/an authorization.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('authorization', params);
    // Select field to populate.
    const populate = Authorization.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(Authorization.attributes).reduce((acc, curr) => {
      switch (Authorization.attributes[curr].type) {
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

    return Authorization
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
