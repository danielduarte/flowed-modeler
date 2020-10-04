/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React from 'react';
import { Modal } from '../../../app/primitives';
import { omit } from 'min-dash';
import css from './DeploymentConfigModal.less';
import { TextInput } from '../shared/components';
import { Formik, Field } from 'formik';


export default class DeploymentConfigModal extends React.PureComponent {

  state = {
    endpoints: [],
    selected: -1,
    counter: 1,
  };

  constructor(props) {
    super(props);
    this.valuesCache = { ...props.configuration };
  }

  componentDidMount = () => {
    const endpoints = this.props.configuration.endpoints || [];

    this.setState({
      endpoints,
      selected: endpoints.length >= 0 ? 0 : -1,
    });

    const { subscribeToFocusChange, validator } = this.props;
    const { onAppFocusChange } = this;

    subscribeToFocusChange(onAppFocusChange);

    validator.resetCancel();
  };

  componentWillUnmount = () => {
    this.props.unsubscribeFromFocusChange();
  };

  isConnectionError(code) {
    return code === 'NOT_FOUND' || code === 'CONNECTION_FAILED' || code === 'NO_INTERNET_CONNECTION';
  }

  checkEndpointURLConnectivity = async (skipError) => {
    const {
      valuesCache,
      setFieldErrorCache,
      externalErrorCodeCache,
      isConnectionError,
      checkAuthStatus
    } = this;

    checkAuthStatus(valuesCache);

    if (isConnectionError(externalErrorCodeCache) || skipError) {

      const validationResult = await this.props.validator.validateConnection(valuesCache.endpoint);

      if (!hasKeys(validationResult)) {

        this.externalErrorCodeCache = null;
        this.props.validator.clearEndpointURLError(setFieldErrorCache);
      } else {

        const { code } = validationResult;

        if (isConnectionError(code) && code !== this.externalErrorCodeCache) {
          this.props.validator.updateEndpointURLError(code, setFieldErrorCache);
        }

        this.externalErrorCodeCache = code;
      }
    }
  };

  onSetFieldValueReceived = () => {

    // Initial endpoint URL validation. Note that this is not a form validation
    // and should affect only the Endpoint URL field.
    return this.checkEndpointURLConnectivity(true);
  };

  onAppFocusChange = () => {

    // User may fix connection related errors by focusing out from app (turn on wifi, start server etc.)
    // In that case we want to check if errors are fixed when the users focuses back on to the app.
    return this.checkEndpointURLConnectivity();
  };

  onClose = (action = 'cancel', data = null) => {
    this.props.onClose(action, { endpoints: this.state.endpoints });
  };

  onSubmit = async (values) => {
    this.externalErrorCodeCache = null;
    this.onClose('deploy', values);
  };

  fieldError = (meta) => {
    return meta.error;
  };

  setAuthType = (form) => {
    return event => {
      const authType = event.target.value;
      const { values, setValues } = form;

      let { endpoint } = values;
      endpoint = omit(endpoint, [ 'username', 'password' ]);
      endpoint = omit(endpoint, [ 'token' ]);

      setValues({
        ...values,
        endpoint: { ...endpoint, authType }
      });
    };
  };

  checkAuthStatus = (values) => {
  };

  handleAdd = () => {
    const nroEndpoint = this.state.counter;
    this.setState({
      endpoints: [...this.state.endpoints, { name: `API #${nroEndpoint}`, url: ''}],
      selected: this.state.endpoints.length,
      counter: nroEndpoint + 1,
    });
  };

  handleRemove = () => {
    const newEndpoints = [...this.state.endpoints];
    newEndpoints.splice(this.state.selected, 1);
    this.setState({
      endpoints: newEndpoints,
      selected: newEndpoints.length > 0 ? 0 : -1,
    });
  };

  handleChangeEndpoint = (event) => {
    const newEndpoints = [ ...this.state.endpoints ];
    const newEndpoint = { ...this.state.endpoints[this.state.selected] };

    newEndpoint[event.target.name] = event.target.value;
    newEndpoints[this.state.selected] = newEndpoint;

    this.setState({endpoints: newEndpoints});
  };

  render() {

    const {
      onSubmit,
      onClose,
      onSetFieldValueReceived
    } = this;

    const {
      configuration: values,
      title,
      intro,
      primaryAction
    } = this.props;

    return (
      <Modal className={ css.DeploymentConfigModal } onClose={ () => {
        onClose('cancel', null, true);
      } }>

        <Formik
          initialValues={ values }
          onSubmit={ onSubmit }
          validateOnBlur={ false }
        >
          { form => {

            this.valuesCache = { ...form.values };
            if (!this.setFieldErrorCache) {
              this.setFieldErrorCache = form.setFieldError;
              onSetFieldValueReceived();
            }

            return (
              <form onSubmit={ form.handleSubmit }>
                <Modal.Title>
                  {
                    title || 'Setup OpenApi'
                  }
                </Modal.Title>

                <Modal.Body>
                  {
                    intro && (
                      <p className="intro">
                        { intro }
                      </p>
                    )
                  }

                  <div className="modal-config-endpoints">
                    <legend>Services Endpoints Configuration</legend>
                    <div className="fields">
                      <div className="left">
                        <div>
                          <button type="button" className="btn btn-secondary" onClick={this.handleAdd}>Add</button>
                          <button type="button" className="btn btn-secondary" onClick={this.handleRemove}>Remove</button>
                        </div>
                        <select
                          className="api-selector"
                          size="10"
                          value={ this.state.selected }
                          onChange={ (event) => this.setState({ selected: event.target.value }) }
                        >
                          {this.state.endpoints.map(({ name, url }, index) => (
                            <option
                              key={ index }
                              value={ index }
                            >
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {this.state.selected >= 0 && (<div className="right">
                        <fieldset className="form-group">
                          <Field
                            name="name"
                            component={ TextInput }
                            label="Name"
                            hint="A unique name for this API"
                            value={ this.state.endpoints[this.state.selected] && this.state.endpoints[this.state.selected].name }
                            onChange={ this.handleChangeEndpoint }
                          />
                          <Field
                            name="url"
                            component={ TextInput }
                            label="Endpoint"
                            hint="Should point to an OpenApi specification in JSON format."
                            value={ this.state.endpoints[this.state.selected] && this.state.endpoints[this.state.selected].url }
                            onChange={ this.handleChangeEndpoint }
                          />
                        </fieldset>
                      </div>)}
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer>
                  <div className="form-submit">

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={ () => {
                        onClose('cancel', null, false);
                      } }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={ form.isSubmitting }
                      onClick={ () => {

                        // @oguz:
                        // this is a hack as FormIK does not seem to
                        // set isSubmitting when this button is clicked.
                        // if you come up with a better solution, please
                        // do a PR.
                        this.isOnBeforeSubmit = true;
                        setTimeout(() => {
                          this.isOnBeforeSubmit = false;
                        });
                      } }
                    >
                      { primaryAction || 'Save' }
                    </button>

                  </div>
                </Modal.Footer>
              </form>
            );
          } }
        </Formik>
      </Modal>
    );
  }
}

function hasKeys(obj) {
  return obj && Object.keys(obj).length > 0;
}
