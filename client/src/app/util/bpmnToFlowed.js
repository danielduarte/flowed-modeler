const { toJson } = require('xml2json-canonical');


export default function bpmnToFlowed(xml, options) {
  const opts = {
    stringify: true,
    ...options,
  };

  const { spec, warnings } = rule_bpmn(toJson(xml, { skipEmptyTexts: true }));

  warnings.forEach(msg => console.error(msg));

  if (opts.stringify) {
    return JSON.stringify(spec, null, 2);
  } else {
    return spec;
  }
}

// -- parser rules

function rule_bpmn(node) {
  validateNode(node, { type: 'xml' });

  const { tasksList, warnings } = rule_definitions(node.content[0]);
  const tasks = tasksList.reduce((acc, t) => {
    acc[t.code] = t;
    delete t.code;
    return acc;
  }, {});

  return {
    spec: tasksList.length > 0 ? { tasks } : {},
    warnings,
  };
}

function rule_definitions(node) {
  validateNode(node, { type: 'element', name: 'bpmn:definitions' });

  const warnings = [];

  const processNodes = node.content.filter(child => child.name === 'bpmn:process');
  if (processNodes.length === 0) {
    throw new Error('No process node found.');
  }

  if (processNodes.length > 1) {
    warnings.push('More than one process node found. Only the first one is converted.');
  }

  return {
    tasksList: rule_process(processNodes[0]),
    warnings,
  };
}

function rule_process(node) {
  validateNode(node, { type: 'element', name: 'bpmn:process' });

  const taskList = node
    .content
    .filter(child => child.name === 'bpmn:task')
    .map(taskNode => ({
      code: taskNode.attrs.id,
      resolver: {
        name: 'flowed::Noop',
      },
    }));

  return taskList;
}

function validateNode(node, expectedFields) {
  Object.entries(expectedFields).forEach(([field, expectedValue]) => {
    if (!node.hasOwnProperty(field)) {
      throw new Error(`Missing field "${field}" in node.`);
    }
    if (node[field] !== expectedValue) {
      throw new Error(`Expected node ${field} ${expectedValue} but found ${node[field]}.`);
    }
  });
}
