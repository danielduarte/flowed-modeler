/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import CodeMirror from 'codemirror';

// xml syntax highlighting
import 'codemirror/mode/xml/xml';

// auto close tags
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/edit/closetag';

// search addons
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';

import 'codemirror/addon/dialog/dialog';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.css';
import bpmnToFlowed from '../../util/bpmnToFlowed';


/**
 * Create a code mirror instance with an editor API.
 *
 * @param  {Object} options
 * @return {CodeMirror}
 */
export default function create(options) {

  var el = this;

  var instance = CodeMirror(function(_el) {
    el = _el;
  }, {
    autoCloseTags: true,
    dragDrop: true,
    allowDropFileTypes: ['text/plain'],
    lineWrapping: true,
    lineNumbers: true,
    mode: {
      name: 'application/json',
      htmlMode: false
    },
    tabSize: 2,
    readOnly: true
  });

  instance.attachTo = function(parentNode) {
    parentNode.appendChild(el);

    this.refresh();
  };

  instance.detach = function() {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };

  instance.importXML = function(xml) {
    this.setValue(bpmnToFlowed(xml));

    this.doc.clearHistory();
  };

  instance.destroy = function() { };

  Object.defineProperty(instance, '_stackIdx', {
    get() {
      return this.doc.historySize().undo;
    }
  });

  return instance;
}
