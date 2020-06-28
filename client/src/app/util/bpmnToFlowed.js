const { toJson } = require('xml2json-canonical');


module.exports = function bpmnToFlowed(xml, options) {
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

  const sequences = node
    .content
    .filter(child => child.name === 'bpmn:sequenceFlow')
    .map(seqNode => ({
      code: seqNode.attrs.id,
      from: seqNode.attrs.sourceRef,
      to: seqNode.attrs.targetRef,
    })).reduce((acc, seq) => {
      acc.byFrom[seq.from] || (acc.byFrom[seq.from] = []);
      acc.byFrom[seq.from].push(seq);
      acc.byTo[seq.to] || (acc.byTo[seq.to] = []);
      acc.byTo[seq.to].push(seq);
      return acc;
    }, {
      byFrom: {},
      byTo: {},
    });

  const taskList = node
    .content
    .filter(child => child.name === 'bpmn:task')
    .map(taskNode => {
      const t = {
        code: taskNode.attrs.id,
      };

      if (sequences.byTo[t.code]) {
        t.requires = sequences.byTo[t.code].map(seq => seq.code);
      }

      if (sequences.byFrom[t.code]) {
        t.provides = sequences.byFrom[t.code].map(seq => seq.code);
      }

      t.resolver = {
        name: 'flowed::Noop',
      };

      return t;
    });

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
