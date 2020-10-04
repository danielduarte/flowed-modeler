const CONFIG_ROOT_KEY = 'flowedConfig';

const defaults = {
  'openapi.endpoint': 'http://localhost:3003/explorer/openapi.json',
  'openapi.endpoints': [],
};

export const get = key => {
  let flowedConfig = localStorage.getItem(CONFIG_ROOT_KEY);
  if (flowedConfig !== null) {
    try {
      flowedConfig = JSON.parse(flowedConfig);
    } catch (err) {
      flowedConfig = null;
    }
  }

  if (flowedConfig === null) {
    flowedConfig = defaults;
    localStorage.setItem(CONFIG_ROOT_KEY, JSON.stringify(flowedConfig));
  }

  if (typeof key === 'undefined') {
    return flowedConfig;
  }

  return flowedConfig.hasOwnProperty(key) ? flowedConfig[key] : null;
};


export const set = (key, value) => {
  const flowedConfig = get();

  if (typeof value === 'undefined') {
    delete flowedConfig[key];
  } else {
    flowedConfig[key] = value;
  }

  localStorage.setItem(CONFIG_ROOT_KEY, JSON.stringify(flowedConfig));
};
