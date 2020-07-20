const bpmnToFlowed = require('../bpmnToFlowed');
const assert = require('assert');

const isRunningMocha = process.argv[1] && process.argv[1].endsWith('mocha');

describe('util - bpmnToFlowed', function() {

  const testCases = [
    'empty',
    'simple-task',
    'if',
    'dependent-tasks',
    'cycle',
    'reuse-value',
    'conditional',
    'multi-instance-task-parallel',
    'multi-instance-task-sequential',
    'subflow-empty',
    'simple-task-echo',
  ];

  for (let i = 0; i < testCases.length; i++) {
    const caseName = testCases[i];

    it(`case: ${caseName} process`, async function() {
      const result = generateTestData(caseName);

      if (isRunningMocha) {
        assert.deepStrictEqual(result.converted, result.flowed, `Conversion error in case ${caseName}`);
      } else {
        expect(result.converted).to.eql(result.flowed);
      }
    });
  }
});

// -- helpers

function generateTestData(caseName) {
  let bpmn;
  if (isRunningMocha) {
    bpmn = require('fs').readFileSync(`./bpmn-to-flowed/${caseName}.bpmn`, 'utf-8');
  } else {
    bpmn = require(`./bpmn-to-flowed/${caseName}.bpmn`);
  }

  return {
    bpmn,
    flowed: require(`./bpmn-to-flowed/${caseName}.json`),
    converted: bpmnToFlowed(bpmn, { stringify: false }),
  };
}
