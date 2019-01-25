'use strict';

/**
 * License.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

module.exports = {

  /**
   * Promise to fetch all licenses.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('license', params);
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return License
      .find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  },

  /**
   * Promise to fetch a/an license.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return License
      .findOne(_.pick(params, _.keys(License.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count licenses.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('license', params);

    return License
      .count()
      .where(filters.where);
  },

  /**
   * Promise to add a/an license.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, License.associations.map(ast => ast.alias));
    const data = _.omit(values, License.associations.map(ast => ast.alias));
    // Create entry with no-relational data.
    const entry = await License.create(data);

    // Create relational data and return the entry.
    return License.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an license.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    
    const relations = _.pick(values, License.associations.map(a => a.alias));
    const data = _.omit(values, License.associations.map(a => a.alias));
    if(relations.print)  relations.print = (await Print.create(values.print)).id;
    let entry = await License.findOneAndUpdate(params, { $set: data }, { multi: true });
    if(!entry) {
      entry = await License.create({...data, mac: params.mac});
    } else {
      const log = Object.keys(entry._doc).filter(key => {
        if(data[key] && (entry._doc[key] != data[key])) return true;
      }).reduce(function(obj,item){
        obj[item] = data[item]; 
        return obj;
      }, {});
      const licenseLog = {
        data: log, 
        mac: params.mac, 
        print: relations.print
      };
      if(!licenseLog.print) delete licenseLog.print;
      if(Object.keys(log).length) await Licenselog.create(licenseLog);
    }
    
    // return entry._doc;
    // Update relational data and return the entry.
    return License.updateRelations(Object.assign({_id: entry._doc._id}, { values: relations }));
  },

  /**
   * Promise to remove a/an license.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    // Note: To get the full response of Mongo, use the `remove()` method
    // or add spent the parameter `{ passRawResult: true }` as second argument.
    const data = await License
      .findOneAndRemove(params, {})
      .populate(populate);

    if (!data) {
      return data;
    }

    await Promise.all(
      License.associations.map(async association => {
        if (!association.via || !data._id) {
          return true;
        }

        const search = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: data._id } : { [association.via]: { $in: [data._id] } };
        const update = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: null } : { $pull: { [association.via]: data._id } };

        // Retrieve model.
        const model = association.plugin ?
          strapi.plugins[association.plugin].models[association.model || association.collection] :
          strapi.models[association.model || association.collection];

        return model.update(search, update, { multi: true });
      })
    );

    return data;
  },

  /**
   * Promise to search a/an license.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('license', params);
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(License.attributes).reduce((acc, curr) => {
      switch (License.attributes[curr].type) {
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

    return License
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
