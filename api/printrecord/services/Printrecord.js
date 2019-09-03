'use strict';

/**
 * Printrecord.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

module.exports = {

  /**
   * Promise to fetch all printrecords.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('printrecord', params);
    // Select field to populate.
    const populate = Printrecord.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Printrecord
      .find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  },

  /**
   * Promise to fetch a/an printrecord.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Printrecord.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Printrecord
      .findOne(_.pick(params, _.keys(Printrecord.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count printrecords.
   *
   * @return {Promise}
   */

  count: (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('printrecord', params);

    return Printrecord
      .count()
      .where(filters.where);
  },

  /**
   * Promise to add a/an printrecord.
   *
   * @return {Promise}
   */

  add: async (values) => {

    if (_.isArray(values)) {
      /* const createdRecords = [];
      Promise.all(values.map(async item => {
        const data = _.omit(item, Printrecord.associations.map(ast => ast.alias));

        // Create entry with no-relational data.
        const entry = await Printrecord.create(data);
        console.log(entry);
        createdRecords.push(entry);
      })); */
      return Printrecord.insertMany(values);
    }

    // Extract values related to relational data.
    const relations = _.pick(values, Printrecord.associations.map(ast => ast.alias));
    const data = _.omit(values, Printrecord.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Printrecord.create(data);

    // Create relational data and return the entry.
    return Printrecord.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an printrecord.
   *
   * @return {Promise}
   */

  edit: async ctx => {

    const { params, request } = ctx;
    const values = request.body;


    const record = await Printrecord.findOne({ uid: params._id });
    console.log(record);
    if (record != null) {
      const { isRegistered } = record;
      if (isRegistered) {
        // return 409
        return ctx.response.conflict([], ['UID has already been registered']);
      } else {
        // Extract values related to relational data.
        const relations = _.pick(values, Printrecord.associations.map(a => a.alias));
        const data = _.omit(values, Printrecord.associations.map(a => a.alias));

        // Update entry with no-relational data.
        const entry = await Printrecord.update({ uid: params._id }, data, { multi: true });

        // Update relational data and return the entry.
        return Printrecord.updateRelations(Object.assign(params, { values: relations }));
      }
    }

    return ctx.response.notFound(['The requested code was not found'], [params]);
    
  },

  /**
   * Promise to remove a/an printrecord.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Select field to populate.
    const populate = Printrecord.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    // Note: To get the full response of Mongo, use the `remove()` method
    // or add spent the parameter `{ passRawResult: true }` as second argument.
    const data = await Printrecord
      .findOneAndRemove(params, {})
      .populate(populate);

    if (!data) {
      return data;
    }

    await Promise.all(
      Printrecord.associations.map(async association => {
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
   * Promise to search a/an printrecord.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('printrecord', params);
    // Select field to populate.
    const populate = Printrecord.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(Printrecord.attributes).reduce((acc, curr) => {
      switch (Printrecord.attributes[curr].type) {
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

    return Printrecord
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
