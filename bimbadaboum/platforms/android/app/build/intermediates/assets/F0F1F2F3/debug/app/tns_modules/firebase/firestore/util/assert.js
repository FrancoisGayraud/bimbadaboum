/*! @license Firebase v4.5.0
Build: rev-f49c8b5
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fail = fail;
exports.assert = assert;

var _version = require('../core/version');

var _log = require('./log');

/**
 * Unconditionally fails, throwing an Error with the given message.
 *
 * Returns any so it can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 */
/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function fail(failure) {
  // Log the failure in addition to throw an exception, just in case the
  // exception is swallowed.
  var message = "FIRESTORE (" + _version.SDK_VERSION + ") INTERNAL ASSERTION FAILED: " + failure;
  (0, _log.error)(message);
  // NOTE: We don't use FirestoreError here because these are internal failures
  // that cannot be handled by the user. (Also it would create a circular
  // dependency between the error and assert modules which doesn't work.)
  throw new Error(message);
}
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 */
function assert(assertion, message) {
  if (!assertion) {
    fail(message);
  }
}
//# sourceMappingURL=assert.js.map
