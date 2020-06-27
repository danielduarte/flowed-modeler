const { toJson } = require('xml2json-canonical');

export default function bpmnToFlowed(xml) {
  const json = toJson(xml, 'compact');
  return JSON.stringify(json, null, 2);
}
