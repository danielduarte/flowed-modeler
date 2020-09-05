/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

const PropertiesPanel = require('bpmn-js-properties-panel/lib/PropertiesPanel');
const minDom = require('min-dom');


const domQuery = minDom.query;
const domRemove = minDom.remove;
const domAttr = minDom.attr;

PropertiesPanel.prototype.update = function(element, force) {
  this._propertiesProvider._propertiesPanel = this;

  const current = this._current;
  let needsCreate = true; // no actual selection change

  if (typeof element === 'undefined') {
    element = this._canvas.getRootElement(); // use RootElement of diagram if no element is selected
  }

  const newTabs = this._propertiesProvider.getTabs(element);
  if (current && current.element === element && !force) {
    needsCreate = this._entriesChanged(current, newTabs); // see if existing panel can be reuseed
  }

  if (needsCreate) {
    let activeTabId;
    if (current) {
      const activeTabNode = domQuery('.bpp-properties-tab.bpp-active', current.panel); // get active tab from old panel
      if (activeTabNode) {
        activeTabId = domAttr(activeTabNode, 'data-tab');
      }
      domRemove(current.panel); // remove old panel
    }

    this._current = this._create(element, newTabs);

    // activate the saved active tab from the remove panel or the first tab
    activeTabId ? this.activateTab(activeTabId) : this.activateTab(this._current.tabs[0]);
  }

  if (this._current) {
    this._updateActivation(this._current); // make sure correct tab contents are visible
  }

  this._emit('changed');
};


module.exports = PropertiesPanel;
