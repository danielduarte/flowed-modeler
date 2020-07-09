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
};

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
    .map(rule_sequenceFlow).reduce((acc, seq) => {
      acc.byCode[seq.code] = seq;
      acc.byFrom[seq.from] || (acc.byFrom[seq.from] = []);
      acc.byFrom[seq.from].push(seq);
      acc.byTo[seq.to] || (acc.byTo[seq.to] = []);
      acc.byTo[seq.to].push(seq);
      return acc;
    }, {
      byCode: {},
      byFrom: {},
      byTo: {},
    });

  const taskList = node
    .content
    .filter(child => child.name === 'bpmn:task')
    .map(node => rule_task(node, sequences));

  const condTaskList = node
    .content
    .filter(child => child.name === 'bpmn:exclusiveGateway')
    .map(node => rule_exclusiveGateway(node, sequences));

  const subflowTaskList = node
    .content
    .filter(child => child.name === 'bpmn:subProcess')
    .map(node => rule_subProcess(node, sequences));

  return [...taskList, ...condTaskList, ...subflowTaskList];
}

function rule_sequenceFlow(node) {
  validateNode(node, { type: 'element', name: 'bpmn:sequenceFlow' });

  const seq = {
    code: typeof node.attrs.valueId === 'undefined' ? node.attrs.id : node.attrs.valueId,
    from: node.attrs.sourceRef,
    to: node.attrs.targetRef,
  };

  if (node.content.length > 0) {
    seq.cond = rule_conditionExpression(node.content[0]);
  }

  return seq;
}

function rule_conditionExpression(node) {
  validateNode(node, { type: 'element', name: 'bpmn:conditionExpression' });

  return node.content[0].content;
}

function rule_task(node, sequences) {
  validateNode(node, { type: 'element', name: 'bpmn:task' });

  const task = {
    code: node.attrs.id,
  };

  if (sequences.byTo[task.code]) {
    task.requires = [...new Set(sequences.byTo[task.code].map(seq => seq.code))];
  }

  if (sequences.byFrom[task.code]) {
    task.provides = [...new Set(sequences.byFrom[task.code].map(seq => seq.code))];
  }

  task.resolver = {
    name: 'flowed::Noop',
  };

  const loopNodes = node.content.filter(child => child.name === 'bpmn:multiInstanceLoopCharacteristics');
  if (loopNodes.length > 0) {
    const loop = loopNodes[0];

    task.resolver= {
      name: 'flowed::ArrayMap',
      params: {
        resolver: 'flowed::Noop',
        spec: {},
        params: {},
        automapParams: true,
        automapResults: true,
        parallel: !(loop.attrs && loop.attrs.isSequential === 'true'),
      }
    };
  }

  return task;
}

function rule_exclusiveGateway(node, sequences) {
  validateNode(node, { type: 'element', name: 'bpmn:exclusiveGateway' });

  const task = {
    code: node.attrs.id,
  };

  if (sequences.byTo[task.code]) {
    task.requires = [...new Set(sequences.byTo[task.code].map(seq => seq.code))];


  }

  if (sequences.byFrom[task.code]) {
    task.provides = [...new Set(sequences.byFrom[task.code].map(seq => seq.code))];
  }

  task.resolver = {
    name: 'flowed::Conditional',
  };

  if (task.requires && task.requires.length > 0) {
    task.resolver.params = {
      condition: task.requires[0],
    };
  }

  if (task.provides) {
    const trueProvs = task.provides.filter(prov => sequences.byCode[prov].cond === 'true');
    const falseProvs = task.provides.filter(prov => sequences.byCode[prov].cond === 'false');
    if (trueProvs.length > 0 || falseProvs.length > 0) {
      task.resolver.results = {};
      if (trueProvs.length > 0) {
        task.resolver.results.onTrue = trueProvs[0];
      }
      if (falseProvs.length > 0) {
        task.resolver.results.onFalse = falseProvs[0];
      }
    }
  }

  return task;
}

function rule_subProcess(node, sequences) {
  validateNode(node, { type: 'element', name: 'bpmn:subProcess' });

  const task = {
    code: node.attrs.id,
  };

  if (sequences.byTo[task.code]) {
    task.requires = [...new Set(sequences.byTo[task.code].map(seq => seq.code))];
  }

  if (sequences.byFrom[task.code]) {
    task.provides = [...new Set(sequences.byFrom[task.code].map(seq => seq.code))];
  }

  task.resolver= {
    name: 'flowed::SubFlow',
    params: {
      flowSpec: {},
      flowParams: {},
      flowExpectedResults: [],
      flowResolvers: {},
    }
  };

  return task;
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
