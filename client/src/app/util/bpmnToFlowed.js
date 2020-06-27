const { toJson } = require('xml2json-canonical');

export default function bpmnToFlowed(xml, options) {
  const opts = {
    stringify: true,
    ...options,
  };

  const json = rule_bpmn(toJson(xml, 'compact'));

  if (opts.stringify) {
    return JSON.stringify(json, null, 2);
  } else {
    return json;
  }
}

// -- parser rules

function rule_bpmn(json) {
  return {};
}
