'use strict';

const Config = require('../../../../../../../src/app/util/configs');


const defaultApi = {
  status: 'todo',
  spec: null,
  endpoint: null,
};

const apis = {};

const downloadOpenApi = async apiName => {
  const endpoints = Config.get('openapi.endpoints');
  const currentEndpoint = endpoints.find(ep => ep.name === apiName);
  const currentUrl = currentEndpoint && currentEndpoint.url;
console.log('REQUESTING', currentUrl);
  const response = await fetch(currentUrl);
  return await response.json();
};

// Invalidates the OpenApi spec cache if endpoint changed
const checkNewEndpoint = apiName => {
  const endpoints = Config.get('openapi.endpoints');
  const currentEndpoint = endpoints.find(ep => ep.name === apiName);
  const currentUrl = currentEndpoint && currentEndpoint.url;
  if (currentUrl !== getOpenApi(apiName).endpoint) {
    apis[apiName] = {
      endpoint: currentUrl,
      status: 'todo',
      spec: null,
    };
  }
};

const requestSpec = apiName => {
  if (getOpenApi(apiName).status === 'todo') {
    apis[apiName].status = 'pending';
    return downloadOpenApi(apiName).then(openapi => {
      apis[apiName].status = 'done';
      apis[apiName].spec = openapi;
      return true;
    });
  }
  return Promise.resolve(false);
};

const getOpenApi = apiName => {
  return apis.hasOwnProperty(apiName) ? apis[apiName] : defaultApi;
};

module.exports = {
  getOpenApi,
  checkNewEndpoint,
  requestSpec,
};
