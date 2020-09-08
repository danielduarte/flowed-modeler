import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import IdGenerator from '../../../src/util/id-generator';

class FlowedFactory extends BpmnFactory {

  constructor(moddle, elementRegistry) {
    super(moddle);
    this.idGenerator = new IdGenerator(elementRegistry);
  }

  /**
   * Generate semantic ids for elements when required.
   *
   * @param element
   * @private
   */
  _ensureId(element) {
    if (element.id || !this._needsId(element)) {
      return;
    }

    let prefix;

    if (is(element, 'bpmn:Activity')) {
      prefix = 'task';
    } else if (is(element, 'bpmn:Gateway')) {
      prefix = 'cond';
    } else if (isAny(element, [ 'bpmn:SequenceFlow', 'bpmn:MessageFlow' ])) {
      prefix = 'val';
    } else {
      prefix = (element.$type || '').replace(/^[^:]*:/g, '');
    }
    prefix = prefix[0].toLowerCase() + prefix.slice(1); // to camel case

    element.id = this.idGenerator.next(prefix);
  }
}

FlowedFactory.$inject = [ 'moddle', 'elementRegistry' ];

export default FlowedFactory;
