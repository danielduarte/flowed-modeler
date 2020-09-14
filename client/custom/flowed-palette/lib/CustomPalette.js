'use strict';

import { assign } from 'min-dash';

const elementHelper = require('../../../../client/custom/flowed-js-properties-panel/lib/helper/ElementHelper');

export default function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._globalConnect = globalConnect;
  this._translate = translate;

  this._removedPaletteEntries = [
    'create.intermediate-event',
    'create.data-object',
    'create.data-store',
    'create.participant-expanded',
    'create.group',
  ];

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate'
];

PaletteProvider.prototype.getPaletteEntries = function(element) {
  const actions = {};
  const create = this._create;
  const elementFactory = this._elementFactory;
  const spaceTool = this._spaceTool;
  const lassoTool = this._lassoTool;
  const handTool = this._handTool;
  const globalConnect = this._globalConnect;
  const translate = this._translate;

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      if (options && options.resolverName) {
        shape.businessObject['modelerTemplate'] = options.resolverName;
        shape.businessObject.extensionElements = elementHelper.createElement('bpmn:ExtensionElements', null, shape, elementFactory._bpmnFactory);
        const params = elementHelper.createElement('flowed:Params', null, shape.businessObject.extensionElements, elementFactory._bpmnFactory);
        const results = elementHelper.createElement('flowed:Results', null, shape.businessObject.extensionElements, elementFactory._bpmnFactory);
        shape.businessObject.extensionElements.values = [params, results];
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn:/, '');

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createSubprocess(event) {
    var subProcess = elementFactory.createShape({
      type: 'bpmn:SubProcess',
      x: 0,
      y: 0,
      isExpanded: true
    });

    var startEvent = elementFactory.createShape({
      type: 'bpmn:StartEvent',
      x: 40,
      y: 82,
      parent: subProcess
    });

    create.start(event, [ subProcess, startEvent ], {
      hints: {
        autoSelect: [ startEvent ]
      }
    });
  }

  function createParticipant(event) {
    create.start(event, elementFactory.createParticipantShape());
  }

  Object.assign(actions, {
    'hand-tool': {
      group: 'tools',
      className: 'bpmn-icon-hand-tool',
      title: translate('Activate the hand tool'),
      action: {
        click: function(event) {
          handTool.activateHand(event);
        }
      }
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: translate('Activate the lasso tool'),
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: translate('Activate the create/remove space tool'),
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'global-connect-tool': {
      group: 'tools',
      className: 'bpmn-icon-connection-multi',
      title: translate('Activate the global connect tool'),
      action: {
        click: function(event) {
          globalConnect.toggle(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none',
      translate('Create StartEvent')
    ),
    'create.intermediate-event': createAction(
      'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none',
      translate('Create Intermediate/Boundary Event')
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none',
      translate('Create EndEvent')
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'bpmn-icon-task',
      translate('Create Task')
    ),
    'create.task.echo': createAction(
      'bpmn:Task', 'activity', 'flowed-icon-resolver-echo',
      translate('Create Echo Task'), { resolverName: 'flowed::Echo' }
    ),
    'create.task.wait': createAction(
      'bpmn:Task', 'activity', 'flowed-icon-resolver-wait',
      translate('Create Wait Task'), { resolverName: 'flowed::Wait' }
    ),
    'create.task.throwerror': createAction(
      'bpmn:Task', 'activity', 'flowed-icon-resolver-throwerror',
      translate('Create ThrowError Task'), { resolverName: 'flowed::ThrowError' }
    ),
    'create.task.stop': createAction(
      'bpmn:Task', 'activity', 'flowed-icon-resolver-stop',
      translate('Create Stop Task'), { resolverName: 'flowed::Stop' }
    ),
    'create.task.pause': createAction(
      'bpmn:Task', 'activity', 'flowed-icon-resolver-pause',
      translate('Create Pause Task'), { resolverName: 'flowed::Pause' }
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-none',
      translate('Create Condition')
    ),
    'create.data-object': createAction(
      'bpmn:DataObjectReference', 'data-object', 'bpmn-icon-data-object',
      translate('Create DataObjectReference')
    ),
    'create.data-store': createAction(
      'bpmn:DataStoreReference', 'data-store', 'bpmn-icon-data-store',
      translate('Create DataStoreReference')
    ),
    'create.subprocess-expanded': {
      group: 'activity',
      className: 'bpmn-icon-subprocess-expanded',
      title: translate('Create Subflow'),
      action: {
        dragstart: createSubprocess,
        click: createSubprocess
      }
    },
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'bpmn-icon-participant',
      title: translate('Create Pool/Participant'),
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    },
    'create.group': createAction(
      'bpmn:Group', 'artifact', 'bpmn-icon-group',
      translate('Create Group')
    ),
  });

  this._removedPaletteEntries.forEach(entryId => delete actions[entryId]);

  return actions;
};
