/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import CamundaPlugin from './camunda-plugin';
import FlowedPlugin from './flowed-plugin';

// import PrivacyPreferences from './privacy-preferences';  // Do not use privacy settings for now
import UpdateChecks from './update-checks';
import ErrorTracking from './error-tracking';

export default [
  CamundaPlugin,
  FlowedPlugin,

  // PrivacyPreferences, // Do not use privacy settings for now
  UpdateChecks,
  ErrorTracking
];
