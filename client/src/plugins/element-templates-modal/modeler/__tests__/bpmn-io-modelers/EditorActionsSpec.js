/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import TestContainer from 'mocha-test-container-support';

import BpmnModeler from '../../../../../app/tabs/flowed/modeler/FlowedModeler';

import EditorActions from '../../EditorActions';

import diagramXML from './diagram.bpmn';

const DEFAULT_OPTIONS = {
  additionalModules: [
    {
      __init__: [
        'elementTemplatesModalEditorActions',
      ],
      elementTemplatesModalEditorActions: [ 'type', EditorActions ]
    }
  ],
  exporter: {
    name: 'my-tool',
    version: '120-beta.100'
  }
};


describe('EditorActions', function() {

  this.timeout(10000);

  let container,
      modeler;

  beforeEach(async function() {
    container = TestContainer.get(this);

    modeler = await createModeler({
      container
    });
  });


  it('should bootstrap', async function() {

    // then
    expect(modeler).to.exist;
  });

});

// helpers //////////

async function createModeler(options = {}) {
  const modeler = new BpmnModeler({
    ...DEFAULT_OPTIONS,
    ...options
  });

  await modeler.importXML(diagramXML);

  return modeler;
}
