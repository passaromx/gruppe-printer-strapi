'use strict';

const fs = require('fs');
/**
 * A set of functions called "actions" for `Zpl`
 */

module.exports = {

  create: async(entry, path, size) => {
    const zpl = await fs.readFileSync(path, 'utf8'); 
    const pdf = await strapi.services.zpl.getPngOrPdf('pdf', zpl, {size});
    const png = await strapi.services.zpl.getPngOrPdf('png', zpl, {size});

    const label = await strapi.services.zpl.uploadLabel(pdf, png, entry);

    return label;
  },

  restore: async(entry, path, size) => {
    const zpl = await fs.readFileSync(path, 'utf8'); 
    const pdf = await strapi.services.zpl.getPngOrPdf('pdf', zpl, {size});

    const label = await strapi.services.zpl.uploadLabel(pdf, null, entry);

    return label;
  }
};
