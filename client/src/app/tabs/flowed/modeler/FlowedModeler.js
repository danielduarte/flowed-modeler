/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import BpmnModeler from 'bpmn-js/lib/Modeler';

import minimapModule from 'diagram-js-minimap';

import diagramOriginModule from 'diagram-js-origin';

import alignToOriginModule from '@bpmn-io/align-to-origin';
import addExporterModule from '@bpmn-io/add-exporter';

import executableFixModule from 'bpmn-js-executable-fix';

import completeDirectEditingModule from './features/complete-direct-editing';
import globalClipboardModule from './features/global-clipboard';
import handToolOnSpaceModule from './features/hand-tool-on-space';
import propertiesPanelKeyboardBindingsModule from './features/properties-panel-keyboard-bindings';

import Flags, { DISABLE_ADJUST_ORIGIN } from '../../../../util/Flags';

import signavioCompatModule from 'bpmn-js-signavio-compat';

import camundaModdlePackage from '../../../../../custom/flowed-moddle/resources/camunda';
import camundaModdleExtension from 'camunda-bpmn-moddle/lib';
import flowedModdlePackage from '../../../../../custom/flowed-moddle/resources/flowed';
import flowedModdleExtension from '../../../../../custom/flowed-moddle/lib';
import flowedBpmnFactory from '../../../../../custom/flowed-bpmn-factory';
import flowedPalette from '../../../../../custom/flowed-palette';
import flowedPropertyPanel from '../../../../../custom/custom-property-panel';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from '../../../../../custom/flowed-js-properties-panel/lib/provider/camunda';

import disableCollapsedSubprocessModule from 'bpmn-js-disable-collapsed-subprocess';


import 'bpmn-js-properties-panel/styles/properties.less';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

import 'diagram-js-minimap/assets/diagram-js-minimap.css';


export default class FlowedModeler extends BpmnModeler {

  constructor(options = {}) {

    const {
      moddleExtensions,
      ...otherOptions
    } = options;

    super({
      ...otherOptions,
      moddleExtensions: {
        flowed: flowedModdlePackage,
        camunda: camundaModdlePackage,
        ...(moddleExtensions || {})
      }
    });
  }
}

const defaultModules = BpmnModeler.prototype._modules;

const extensionModules = [
  addExporterModule,
  flowedModdleExtension,
  camundaModdleExtension,
  completeDirectEditingModule,
  executableFixModule,
  Flags.get(DISABLE_ADJUST_ORIGIN) ? diagramOriginModule : alignToOriginModule,
  globalClipboardModule,
  handToolOnSpaceModule,
  minimapModule,
  propertiesPanelKeyboardBindingsModule,
  propertiesPanelModule,
  propertiesProviderModule,
  signavioCompatModule,
  disableCollapsedSubprocessModule,
  flowedBpmnFactory,
  flowedPalette,
  flowedPropertyPanel,
];

FlowedModeler.prototype._modules = [
  ...defaultModules,
  ...extensionModules
];
