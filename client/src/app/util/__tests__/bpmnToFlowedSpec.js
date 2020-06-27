import bpmnToFlowed from '../bpmnToFlowed';


describe('util - bpmnToFlowed', function() {

  const testCases = [
    'empty',
    'simple-task',
  ];

  for (let i = 0; i < testCases.length; i++) {
    const caseName = testCases[i];

    it(`case: ${caseName} process`, async function() {
      const result = generateTestData(caseName);
      expect(result.converted).to.eql(result.flowed);
    });

  }

});

// -- helpers

function generateTestData(caseName) {
  const bpmn = require(`./bpmn-to-flowed/${caseName}.bpmn`);

  return {
    bpmn,
    flowed: require(`./bpmn-to-flowed/${caseName}.json`),
    converted: bpmnToFlowed(bpmn, { stringify: false }),
  };
}
