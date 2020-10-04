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
import AuthTypes from '../shared/AuthTypes';
import DeploymentConfigModal from './DeploymentConfigModal';
import DeploymentConfigValidator from './validation/DeploymentConfigValidator';
import { generateId } from '../../../util';
import { Fill } from '../../../app/slot-fill';
import { Button, Icon } from '../../../app/primitives';
import * as Config from '../../../app/util/configs';

const DEPLOYMENT_DETAILS_CONFIG_KEY = 'deployment-tool';
const ENGINE_ENDPOINTS_CONFIG_KEY = 'openApiEndpoints';
const PROCESS_DEFINITION_CONFIG_KEY = 'process-definition';

const DEFAULT_ENDPOINT = {
  url: 'http://localhost:3000/openapi.json',
  authType: AuthTypes.basic,
  rememberCredentials: false
};

export default class DeploymentTool extends PureComponent {

  state = {
    modalState: null,
    activeTab: null
  };

  validator = new DeploymentConfigValidator();

  componentDidMount() {
    this.props.subscribe('app.activeTabChanged', ({ activeTab }) => {
      this.setState({ activeTab });
    });

    this.props.subscribe('app.focus-changed', () => {
      if (this.focusChangeCallback) {
        this.focusChangeCallback();
      }
    });
  }

  subscribeToFocusChange = (callback) => {
    this.focusChangeCallback = callback;
  };

  unsubscribeFromFocusChange = () => {
    delete this.focusChangeCallback;
  };

  saveTab = (tab) => {
    const {
      triggerAction
    } = this.props;

    return triggerAction('save-tab', { tab });
  };

  deploy = (options = {}) => {
    const {
      activeTab
    } = this.state;

    return this.deployTab(activeTab, options);
  };

  async deployTab(tab) {

    // (1) Cancel if file save cancelled
    if (!tab) {
      return;
    }

    // (2) Get configuration
    let configuration = await this.getSavedConfiguration(tab);

    // (3) Open modal to enter deployment configuration
    const {
      action,
      configuration: userConfiguration
    } = await this.getConfigurationFromUserInput(tab, configuration);

    // (4) Handle user cancellation
    if (action === 'cancel') {
      return;
    }

    await this.saveConfiguration(tab, userConfiguration);
  }

  async saveProcessDefinition(tab, deployment) {
    if (!deployment || !deployment.deployedProcessDefinition) {
      return;
    }

    const {
      deployedProcessDefinition: processDefinition
    } = deployment;

    const {
      config
    } = this.props;

    return await config.setForFile(tab.file, PROCESS_DEFINITION_CONFIG_KEY, processDefinition);
  }

  async saveConfiguration(tab, configuration) {
    const {
      endpoints,
    } = configuration;

    await this.saveEndpoint(endpoints);

    const tabConfiguration = {
      endpoints,
    };

    await this.setTabConfiguration(tab, tabConfiguration);

    return configuration;
  }

  removeCredentials = async () => {
  };

  saveCredential = async (credential) => {
    const savedConfiguration = await this.getSavedConfiguration(this.state.activeTab);
    this.saveEndpoint({
      ...savedConfiguration.endpoint,
      rememberCredentials: true,
      ...credential
    });
  };

  async saveEndpoint(endpoints) {
    await this.setEndpoints(endpoints);
  }

  async getSavedConfiguration(tab) {
    const tabConfig = await this.getTabConfiguration(tab);

    if (!tabConfig) {
      return undefined;
    }

    return tabConfig;
  }

  async getConfigurationFromUserInput(tab, providedConfiguration, uiOptions) {
    const configuration = await this.getDefaultConfiguration(tab, providedConfiguration);

    return new Promise(resolve => {
      const handleClose = (action, configuration) => {

        this.setState({
          modalState: null
        });

        // inform validator to cancel ongoing requests
        this.validator.cancel();

        // contract: if configuration provided, user closed with O.K.
        // otherwise they canceled it
        return resolve({ action, configuration });
      };

      this.setState({
        modalState: {
          tab,
          configuration,
          handleClose,
          ...uiOptions
        }
      });
    });
  }

  getEndpoints() {
    return this.props.config.get(ENGINE_ENDPOINTS_CONFIG_KEY, []);
  }

  setEndpoints(endpoints) {
    Config.set('openapi.endpoints', endpoints);
    return this.props.config.set(ENGINE_ENDPOINTS_CONFIG_KEY, endpoints);
  }

  getTabConfiguration(tab) {
    return this.props.config.getForFile(tab.file, DEPLOYMENT_DETAILS_CONFIG_KEY);
  }

  setTabConfiguration(tab, configuration) {
    return this.props.config.setForFile(tab.file, DEPLOYMENT_DETAILS_CONFIG_KEY, configuration);
  }

  async getDefaultEndpoints(tab, providedEndpoint) {
    let endpoints = [];

    if (providedEndpoint) {
      endpoints = providedEndpoint;
    } else {
      endpoints = await this.getEndpoints();
    }

    return endpoints;
  }

  async getDefaultConfiguration(tab, providedConfiguration = {}) {
    const endpoints = await this.getDefaultEndpoints(tab, providedConfiguration.endpoints);

    return {
      endpoints,
    };
  }

  render() {
    const {
      activeTab,
      modalState
    } = this.state;

    return <React.Fragment>
      { activeTab && activeTab.type !== 'empty' && <Fill slot="toolbar" group="8_deploy">
        <Button
          onClick={ this.deploy }
          title="Setup OpenApi"
        >
          <Icon name="properties" />
        </Button>
      </Fill> }

      { modalState &&
      <DeploymentConfigModal
        configuration={ modalState.configuration }
        activeTab={ modalState.tab }
        title={ modalState.title }
        intro={ modalState.intro }
        primaryAction={ modalState.primaryAction }
        onClose={ modalState.handleClose }
        validator={ this.validator }
        saveCredential={ this.saveCredential }
        subscribeToFocusChange={ this.subscribeToFocusChange }
        unsubscribeFromFocusChange={ this.unsubscribeFromFocusChange }
      />
      }
    </React.Fragment>;
  }

}
