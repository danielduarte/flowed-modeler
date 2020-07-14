import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

class FlowedFactory extends BpmnFactory {

  nextIdByType = {};

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
      prefix = 'condTask';
    } else if (isAny(element, [ 'bpmn:SequenceFlow', 'bpmn:MessageFlow' ])) {
      prefix = 'val';
    } else {
      prefix = (element.$type || '').replace(/^[^:]*:/g, '');
    }
    prefix = prefix[0].toLowerCase() + prefix.slice(1); // to camel case


    if (!Object.hasOwnProperty.call(this.nextIdByType, prefix)) {
      this.nextIdByType[prefix] = 1;
    }

    element.id = `${prefix}${this.nextIdByType[prefix]}`;
    this.nextIdByType[prefix]++;
  }
}

export default FlowedFactory;
