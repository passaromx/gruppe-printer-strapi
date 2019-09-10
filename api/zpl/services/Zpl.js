'use strict';
const sampleZpl = require('../sample');
const request = require('request');
const fs = require('fs');

/**
 * `Zpl` service.
 */

module.exports = {
  getPngOrPdf: (format, zpl, params) => {
    return new Promise((resolve, reject) => {
      // console.log(params);
      const url = `http://api.labelary.com/v1/printers/8dpmm/labels/${params ? params.size : '4.25x7.83'}/0/`;
      // console.log(url);
      const options = {
        url,
        headers: {
          'X-Rotation': 180
        },
        encoding: null,
        formData: { file: zpl },
      };
      if(format === 'pdf') options.headers = {...options.headers, 'Accept': 'application/pdf'};
      
      request.post(options, function (error, response, body) {
        if(error) reject(error);
        const filename = `/tmp/${Math.random()}.${format}`;
        fs.writeFile(filename, body, function(err) {
          if (err) {
            // console.log(err);
            reject(err);
          }
          resolve(filename);
        });
        
      });
    });    
  },

  uploadLabel: async (pdf, png, entry) => {
    return new Promise(async (resolve, reject) => {
      // console.log(pdf);

      const files = {
        labelPdf: {
          path: pdf,
          name: `${entry.sku}.pdf`,
          size: '0',
          type: 'application/pdf'
        },
      };

      if (png) {
        files.labelPng = {
          path: png,
          name: `${entry.sku}.png`,
          size: '0',
          type: 'image/png'
        };
      }
  
      await strapi.plugins.upload.services.upload.uploadToEntity({
        id: entry.id || entry._id,
        model: 'label'
      }, files, 'content-manager');  

      resolve(true);
    });
  }
};

