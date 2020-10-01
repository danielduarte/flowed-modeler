/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* global sinon */

import React from 'react';

import { mount } from 'enzyme';

import ElementTemplatesView, { ElementTemplatesListItem, ElementTemplatesListItemEmpty } from '../ElementTemplatesModalView';
import Dropdown from '../Dropdown';


describe('<ElementTemplatesView>', function() {

  describe('basics', function() {

    it('should render', async function() {

      // when
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      // then
      expect(instance).to.exist;
      expect(wrapper).to.exist;
    });


    it('should get element templates on mount', async function() {

      // given
      const { instance } = await createElementTemplatesModalView();

      const getElementTemplatesSpy = sinon.spy(instance, 'getElementTemplates');

      // when
      instance.componentDidMount();

      // then
      expect(getElementTemplatesSpy).to.have.been.called;
    });


    it('should get element templates for selected element type', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      // when
      await instance.getElementTemplates();

      // then
      expect(wrapper.state('elementTemplates')).to.have.length(2);
    });


    it('should get element templates sorted alphabetically', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      // when
      await instance.getElementTemplates();

      // then
      expect(wrapper.state('elementTemplates').map(({ name }) => name)).to.eql([
        'Template 1',
        'Template 2'
      ]);
    });


    it('should list element templates', async function() {

      // given
      const { wrapper } = await createElementTemplatesModalView();

      wrapper.update();

      // then
      expect(wrapper.find(ElementTemplatesListItem)).to.have.length(2);
    });


    it('should display meta data', async function() {

      // given
      const elementTemplate = DEFAULT_ELEMENT_TEMPLATES.find(({ name }) => name === 'Template 1');

      const { wrapper } = await createElementTemplatesModalView();

      wrapper.update();

      // then
      const listItem = wrapper.findWhere(n => n.prop('elementTemplate') === elementTemplate).first();

      const meta = listItem.find('.element-templates-list__item-meta').first();

      expect(meta.text()).to.equal('Walt\'s Catalog | 2001-09-08');
    });


    it('should not list element templates (no element templates for element type)', async function() {

      // given
      function triggerAction(action) {
        if (action === 'getSelectedElementType') {
          return 'bpmn:StartEvent';
        }
      }

      const { wrapper } = await createElementTemplatesModalView({ triggerAction });

      wrapper.update();

      // then
      expect(wrapper.find(ElementTemplatesListItem)).to.have.length(0);
      expect(wrapper.find(ElementTemplatesListItemEmpty)).to.have.length(1);
    });


    it('should select element template', async function() {

      // given
      const { wrapper } = await createElementTemplatesModalView();

      wrapper.update();

      const elementTemplatesListItem = wrapper.find(ElementTemplatesListItem).first();

      // when
      elementTemplatesListItem.simulate('click');

      // then
      expect(wrapper.state('selected')).to.equal('some-rpa-template');
    });


    it('should toggle expanded (expand)', async function() {

      // given
      const { wrapper } = await createElementTemplatesModalView();

      wrapper.update();

      const elementTemplatesListItem = wrapper.find(ElementTemplatesListItem).first();

      const expand = elementTemplatesListItem.find('.element-templates-list__item-description-expand').first();

      // when
      expand.simulate('click');

      // then
      expect(wrapper.state('expanded')).to.equal('some-rpa-template');
      expect(wrapper.state('selected')).to.be.null;
    });


    it('should toggle expanded (collapse)', async function() {

      // given
      const { wrapper } = await createElementTemplatesModalView();

      wrapper.update();

      const elementTemplatesListItem = wrapper.find(ElementTemplatesListItem).first();

      const expand = elementTemplatesListItem.find('.element-templates-list__item-description-expand').first();

      expand.simulate('click');

      // when
      expand.simulate('click');

      // then
      expect(wrapper.state('expanded')).to.equal(null);
      expect(wrapper.state('selected')).to.be.null;
    });


    it('should have sticky header', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      wrapper.update();

      // when
      instance.onScroll({
        target: {
          scrollTop: 100
        }
      });

      // then
      expect(wrapper.state('scroll')).to.be.true;
    });

  });


  describe('apply element template', function() {


    it('should not apply element template (no element template selected)', async function() {

      // given
      const onApplySpy = sinon.spy();

      const { instance } = await createElementTemplatesModalView({ onApply: onApplySpy });

      // when
      instance.onApply();

      // then
      expect(onApplySpy).not.to.have.been.called;
    });

  });


  describe('filter', function() {

    it('should filter by search', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      // when
      instance.onSearchChange('Template 1');

      wrapper.update();

      // then
      expect(wrapper.find(ElementTemplatesListItem)).to.have.length(1);
      expect(wrapper.find(ElementTemplatesListItem).first().prop('elementTemplate')).to.equal(DEFAULT_ELEMENT_TEMPLATES.find(({ name }) => name === 'Template 1'));
    });


    it('should filter by tag', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      // when
      instance.onTagsChange([ 'Walt\'s Catalog' ]);

      wrapper.update();

      // then
      expect(wrapper.find(ElementTemplatesListItem)).to.have.length(1);
      expect(wrapper.find(ElementTemplatesListItem).first().prop('elementTemplate')).to.equal(DEFAULT_ELEMENT_TEMPLATES.find(({ name }) => name === 'Template 1'));
    });


    it('should not show tag filter (no tags)', async function() {

      // when
      const { wrapper } = await createElementTemplatesModalView({
        config: new Config({
          get(key, ...args) {
            if (key === 'bpmn.elementTemplates') {
              return Promise.resolve([]);
            }

            throw Error('Unknown key');
          }
        })
      });

      // then
      expect(wrapper.find(Dropdown)).to.have.length(0);
    });


    it('should disable apply button if selected element template does not match filter', async function() {

      // given
      const {
        instance,
        wrapper
      } = await createElementTemplatesModalView();

      wrapper.update();

      const elementTemplatesListItem = wrapper.find(ElementTemplatesListItem).first();

      elementTemplatesListItem.simulate('click');

      // when
      instance.onSearchChange('Template 4');

      wrapper.update();

      // then
      expect(wrapper.find('.button--apply').first().prop('disabled')).to.be.true;
    });

  });

});

// helpers //////////

const DEFAULT_ELEMENT_TEMPLATES = [
  {
    appliesTo: [
      'bpmn:ServiceTask'
    ],
    id: 'another-rpa-template',
    metadata: {
      catalogOrganizationId: '00000000-0000-0000-0000-000000000000',
      catalogTemplateId: '00000000-0000-0000-0000-000000000001',
      created: 1000000000000,
      tags: [
        'Donald\'s Catalog'
      ],
      updated: 1000000000000
    },
    name: 'Template 2',
    properties: []
  },
  {
    appliesTo: [
      'bpmn:UserTask'
    ],
    id: 'user-task-template',
    metadata: {
      catalogOrganizationId: '00000000-0000-0000-0000-000000000000',
      catalogTemplateId: '00000000-0000-0000-0000-000000000002',
      created: 1000000000000,
      tags: [
        'Donald\'s Catalog'
      ],
      updated: 1000000000000
    },
    name: 'Template 3',
    properties: []
  },
  {
    appliesTo: [
      'bpmn:ServiceTask'
    ],
    id: 'some-rpa-template',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    metadata: {
      catalogOrganizationId: '00000000-0000-0000-0000-000000000000',
      catalogTemplateId: '00000000-0000-0000-0000-000000000000',
      created: 1000000000000,
      tags: [
        'Walt\'s Catalog'
      ],
      updated: 1000000000000
    },
    name: 'Template 1',
    properties: []
  }
];

async function createElementTemplatesModalView(props = {}) {
  function triggerAction(action) {
    if (action === 'getSelectedElementType') {
      return 'bpmn:ServiceTask';
    }
  }

  const defaultProps = {
    config: new Config(),
    displayNotification() {},
    onApply() {},
    onClose() {},
    subscribe() {},
    triggerAction
  };

  const wrapper = mount(<ElementTemplatesView { ...{ ...defaultProps, ...props } } />);

  const instance = wrapper.instance();

  await instance.getElementTemplates();

  return {
    instance,
    wrapper
  };
}

class Config {
  constructor(overrides = {}) {
    this.elementTemplates = DEFAULT_ELEMENT_TEMPLATES;

    Object.assign(this, overrides);
  }

  get(key, ...args) {
    if (key === 'bpmn.elementTemplates') {
      return Promise.resolve(this.elementTemplates);
    }

    throw Error('Unknown key');
  }
}
