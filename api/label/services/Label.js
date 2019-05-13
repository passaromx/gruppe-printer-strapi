'use strict';


/**
 * Label.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');
const fs = require('fs');

module.exports = {

  /**
   * Promise to fetch all labels.
   *
   * @return {Promise}
   */
  fetchDownloads: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('label', params);
    // Select field to populate.
    const populate = Label.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');
    const lastSync = Date.now();
    const all = await Label.find({deleted: false});
    const allLabels = all.map(label => label._id);
    const labels = await Label
      .find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      // .limit(filters.limit)
      .populate(populate, 'url');

    const refs = labels.map(label => label.id);
    delete filters.where.client;
    const uploads = await strapi.plugins.upload.models.file
      .find({'related.ref': {$in: refs}})
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit);

    console.log('alllabels', allLabels);

    return {
      allLabels,
      labels,
      uploads,
      lastSync
    };
  },

  fetchAll: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('label', params);
    // Select field to populate.
    const populate = Label.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');
    return Label
      .find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      // .limit(filters.limit)
      .populate(populate); 
  },

  /**
   * Promise to fetch a/an label.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Label.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Label
      .findOne(_.pick(params, _.keys(Label.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count labels.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('label', params);

    return Label
      .count()
      .where(filters.where);
  },

  /**
   * Promise to add a/an label.
   *
   * @return {Promise}
   */

  add: async (values) => {
    const source = 'content-manager';
    // // Extract values related to relational data.
    const relations = _.pick(values, Label.associations.map(ast => ast.alias));
    
    if (values.hasOwnProperty('fields') && values.hasOwnProperty('files')) {
      // Silent recursive parser.
      const parser = (value) => {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Silent.
        }

        return _.isArray(value) ? value.map(obj => parser(obj)) : value;
      };

      const files = values.files;

      
      // Update JSON fields.
      const entry = await Label.create(values.fields);
      await Label.populate(entry, 'client');
      const size = entry.client.settings.size || '4x6';

      // Then, request plugin upload.
      if (strapi.plugins.upload && Object.keys(files).length > 0) {
        // Upload new files and attach them to this entity.
        await strapi.plugins.upload.services.upload.uploadToEntity({
          id: entry.id || entry._id,
          model: 'label'
        }, files, source);
        const path = files.label && files.label.path ? files.label.path : 'nolabel';
        path !== 'nolabel' && await strapi.controllers.zpl.create(entry, path, size);
        const label = await Label.updateRelations({ _id: entry.id, values: relations });
        return label;
        
      }
    }
    const entry = await Label.create(values);
    
    return Label.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an label.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const values_ = values.fields ? values.fields : values;
    const relations = _.pick(values_, Label.associations.map(a => a.alias));
    const data = _.omit(values_, Label.associations.map(a => a.alias));
    const label = await Label.findById(params._id).populate('client');
    // Update entry with no-relational data.
    await Label.update(params, data, { multi: true });
    const size = label.client.settings.size || '4x6';
  
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
          model: 'label'
        }, files, source);
        const path = files.label && files.label.path ? files.label.path : 'nolabel';
        path !== 'nolabel' && await strapi.controllers.zpl.create(label, path, size);
      }
    }


    // Update relational data and return the entry.
    return Label.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an label.
   *
   * @return {Promise}
   */

  remove: async params => {    
    const response = await Label.findOne({
      id: params._id
    });

    if(!response) return null;

    await strapi.plugins.upload.models.file.deleteMany({
      'related.ref': params._id
    });

    return await Label.findOneAndDelete({
      id: params._id
    });
  },

  deleteMany: async query => {
    let ids = query.ids.split(','); 
    ids = ids.length <= 0 ? query.ids : ids;

    const response = await Label.find({
      id: {$in: ids}
    });
    if(!response) return null;

    await strapi.plugins.upload.models.file.deleteMany({
      'related.ref': {$in: ids}
    });

    return await Label.deleteMany({
      _id: {$in: ids}
    });
  },

  /**
   * Promise to search a/an label.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('label', params);
    // Select field to populate.
    const populate = Label.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(Label.attributes).reduce((acc, curr) => {
      switch (Label.attributes[curr].type) {
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

    return Label
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
const sampleZpl = `

`;