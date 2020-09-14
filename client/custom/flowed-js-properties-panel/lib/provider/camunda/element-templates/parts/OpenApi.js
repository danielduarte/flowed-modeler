'use strict';

const Config = require('../../../../../../../src/app/util/configs');


const openApi = {
  status: 'todo',
  spec: null,
  endpoint: null,
};

const getOpenApi = async () => {
  const response = await fetch(Config.get('openapi.endpoint'));
  return await response.json();
};

// Invalidates the OpenApi spec cache if endpoint changed
const checkNewEndpoint = () => {
  const currentEndpoint = Config.get('openapi.endpoint');
  if (currentEndpoint !== openApi.endpoint) {
    openApi.endpoint = currentEndpoint;
    openApi.status = 'todo';
    openApi.spec = null;
  }
};

const requestSpec = () => {
  if (openApi.status === 'todo') {
    openApi.status = 'pending';
    return getOpenApi().then(openapi => {
      openApi.status = 'done';
      openApi.spec = openapi;
      return true;
    });
  }
  return Promise.resolve(false);
};

module.exports = {
  openApi,
  getOpenApi,
  checkNewEndpoint,
  requestSpec,
};
