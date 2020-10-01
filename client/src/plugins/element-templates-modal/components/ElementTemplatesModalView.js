/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React, { PureComponent } from 'react';

import classNames from 'classnames';

import { Modal } from '../../../app/primitives';

import Dropdown from './Dropdown';
import Input from './Input';

import css from './ElementTemplatesModalView.less';

import {
  isDefined,
  isNil
} from 'min-dash';

const MAX_DESCRIPTION_LENGTH = 200;

class ElementTemplatesView extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      applied: null,
      elementTemplates: [],
      elementTemplatesFiltered: [],
      expanded: null,
      filter: {
        tags: [],
        search: ''
      },
      scroll: false,
      selected: null
    };
  }

  componentDidMount = () => {
    this.getElementTemplates();
  }

  getElementTemplates = async () => {
    const {
      config,
      triggerAction
    } = this.props;

    let elementTemplates = await config.get('bpmn.elementTemplates');

    const selectedElementType = await triggerAction('getSelectedElementType');

    elementTemplates = elementTemplates
      .filter(({ appliesTo }) => {
        return appliesTo.includes(selectedElementType);
      })
      .sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        } else {
          return 1;
        }
      });

    const selectedElementAppliedElementTemplate = await triggerAction('getSelectedElementAppliedElementTemplate');

    this.setState({
      elementTemplates,
      elementTemplatesFiltered: elementTemplates,
      applied: selectedElementAppliedElementTemplate
    });
  }

  onSelect = ({ id }) => {
    this.setState({
      selected: id
    });
  }

  onToggleExpanded = ({ id }) => {
    const { expanded } = this.state;

    if (expanded === id) {
      this.setState({
        expanded: null
      });
    } else {
      this.setState({
        expanded: id
      });
    }
  }

  onApply = () => {
    const {
      onApply,
      onClose
    } = this.props;

    const {
      elementTemplates,
      selected
    } = this.state;

    if (isNil(selected)) {
      return;
    }

    const elementTemplate = elementTemplates.find(({ id }) => id === selected);

    onApply(elementTemplate);

    onClose();
  }

  onSearchChange = search => {
    const { filter } = this.state;

    this.setFilter({
      ...filter,
      search
    });
  }

  onTagsChange = tags => {
    const { filter } = this.state;

    this.setFilter({
      ...filter,
      tags
    });
  }

  setFilter = filter => {
    const { elementTemplates } = this.state;

    const elementTemplatesFiltered = filterElementTemplates(elementTemplates, filter);

    this.setState({
      elementTemplatesFiltered,
      filter
    });
  }

  onScroll = ({ target }) => {
    this.setState({ scroll: target.scrollTop > 0 });
  }

  render() {
    const { onClose } = this.props;

    const {
      applied,
      elementTemplates,
      elementTemplatesFiltered,
      expanded,
      filter,
      scroll,
      selected
    } = this.state;

    const {
      tags
    } = filter;

    const tagCounts = getTagCounts(elementTemplates);

    const canApply = elementTemplatesFiltered.find(({ id }) => id === selected);

    return (
      <Modal className={ css.ElementTemplatesModalView } onClose={ onClose }>

        <Modal.Title>Catalog</Modal.Title>

        <Modal.Body onScroll={ this.onScroll }>
          <div className={ classNames('header', { 'header--scroll': scroll }) }>
            <h2 className="header__title">Templates</h2>
            <div className="header__filter">
              <Input className="header__filter-item" value={ filter.search } onChange={ this.onSearchChange } />
              {
                Object.keys(tagCounts).length
                  ? <Dropdown className="header__filter-item" tagCounts={ tagCounts } tagsSelected={ tags } onChange={ this.onTagsChange } />
                  : null
              }
            </div>
          </div>

          <ul className="element-templates-list">
            {
              elementTemplatesFiltered.length
                ? elementTemplatesFiltered.map(elementTemplate => {
                  const { id } = elementTemplate;

                  return (
                    <ElementTemplatesListItem
                      key={ id }
                      applied={ applied }
                      expanded={ expanded }
                      elementTemplate={ elementTemplate }
                      onSelect={ () => this.onSelect(elementTemplate) }
                      onToggleExpanded={ () => this.onToggleExpanded(elementTemplate) }
                      selected={ selected } />
                  );
                })
                : null
            }
            {
              !elementTemplatesFiltered.length ? (
                <ElementTemplatesListItemEmpty />
              ) : null
            }
          </ul>
        </Modal.Body>

        <Modal.Footer>
          <div className="form-submit">
            <button className="btn btn-secondary button--cancel" type="submit" onClick={ onClose }>
              Cancel
            </button>
            <button
              disabled={ !canApply }
              className="btn btn-primary button--apply"
              type="submit"
              onClick={ this.onApply }
            >
              Apply
            </button>
          </div>
        </Modal.Footer>

      </Modal>
    );
  }
}

export default ElementTemplatesView;

export class ElementTemplatesListItem extends React.PureComponent {
  onSelect = ({ target }) => {
    const { onSelect } = this.props;

    // Do not select on description expand click
    if (target.classList.contains('element-templates-list__item-description-expand')) {
      return;
    }

    onSelect();
  }

  render() {
    const {
      applied,
      elementTemplate,
      expanded,
      onToggleExpanded,
      selected
    } = this.props;

    const {
      description,
      id,
      name
    } = elementTemplate;

    let meta = [];

    const tags = getTags(elementTemplate),
          date = getDate(elementTemplate);

    // Assume first tag is catalog name
    if (tags.length) {
      meta = [
        ...meta,
        tags[ 0 ]
      ];
    }

    if (date) {
      meta = [
        ...meta,
        date
      ];
    }

    return (
      <li className={
        classNames(
          'element-templates-list__item',
          { 'element-templates-list__item--applied': id === applied },
          { 'element-templates-list__item--selectable': id !== applied },
          { 'element-templates-list__item--selected': id === selected }
        )
      } onClick={ id !== applied && id !== selected ? this.onSelect : null }>
        <div className="element-templates-list__item-header">
          <span className="element-templates-list__item-name">{ name }</span>
          {
            meta.length ? <span className="element-templates-list__item-meta">{ meta.join(' | ') }</span> : null
          }
        </div>
        {
          isDefined(description) && (
            <div className="element-templates-list__item-description">
              {
                description.length > MAX_DESCRIPTION_LENGTH
                  ? (id !== expanded ? `${ description.substring(0, MAX_DESCRIPTION_LENGTH) } ... ` : `${ description } `)
                  : description
              }
              {
                description.length > MAX_DESCRIPTION_LENGTH
                  ? (
                    <span className="element-templates-list__item-description-expand" onClick={ onToggleExpanded }>
                      {
                        id === expanded ? 'Less' : 'More'
                      }
                    </span>
                  )
                  : null
              }
            </div>
          )
        }
      </li>
    );
  }
}

export class ElementTemplatesListItemEmpty extends PureComponent {
  render() {
    return <li className="element-templates-list__item element-templates-list__item--empty">No matching catalog templates found.</li>;
  }
}

// helpers //////////

function filterElementTemplates(elementTemplates, filter) {
  return elementTemplates.filter(elementTemplate => {
    const {
      tags,
      search
    } = filter;

    const {
      description,
      name
    } = elementTemplate;

    // Assume first tag is Cawemo catalog project name
    if (tags && tags.length && !tags.includes(getTags(elementTemplate)[ 0 ])) {
      return false;
    }

    if (search
      && search.length
      && !name.toLowerCase().includes(search.toLowerCase())
      && !(description || '').toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });
}

function getTags(elementTemplate) {
  const { metadata } = elementTemplate;

  if (!metadata) {
    return [];
  }

  const { tags } = metadata;

  if (!tags) {
    return [];
  }

  return tags;
}

function getTagCounts(elementTemplates) {
  return elementTemplates.reduce((tagCounts, elementTemplate) => {
    const tags = getTags(elementTemplate);

    tags.forEach(tag => {
      if (tagCounts[ tag ]) {
        tagCounts[ tag ] += 1;
      } else {
        tagCounts[ tag ] = 1;
      }
    });

    return tagCounts;
  }, {});
}

function leftPad(string, length, character) {
  while (string.length < length) {
    string = `${ character }${ string }`;
  }

  return string;
}

function getDate(elementTemplate) {
  const { metadata } = elementTemplate;

  if (!metadata) {
    return;
  }

  const dateUpdated = new Date(metadata.updated);

  const year = dateUpdated.getFullYear();

  const month = leftPad(String(dateUpdated.getMonth() + 1), 2, '0');

  const date = leftPad(String(dateUpdated.getDate()), 2, '0');

  return `${ year }-${ month }-${ date }`;
}