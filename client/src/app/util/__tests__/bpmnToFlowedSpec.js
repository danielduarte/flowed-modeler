import bpmnToFlowed from '../bpmnToFlowed';


describe('util - bpmnToFlowed', function() {

  it('case: empty process', async function() {

    const bpmn = require('./bpmn-to-flowed/empty.bpmn');
    const flowed = require('./bpmn-to-flowed/empty.flowed');

    const converted = bpmnToFlowed(bpmn, { stringify: false });

    expect(converted).to.eql(flowed);
  });

});
