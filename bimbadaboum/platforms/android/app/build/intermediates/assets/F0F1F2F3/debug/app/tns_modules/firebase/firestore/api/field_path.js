/*! @license Firebase v4.5.0
Build: rev-f49c8b5
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FieldPath = undefined;
exports.fromDotSeparatedString = fromDotSeparatedString;

var _path = require('../model/path');

var _error = require('../util/error');

var _input_validation = require('../util/input_validation');

// The objects that are a part of this API are exposed to third-parties as
// compiled javascript so we want to flag our private members with a leading
// underscore to discourage their use.
// tslint:disable:strip-private-property-underscore
/**
 * A FieldPath refers to a field in a document. The path may consist of a single
 * field name (referring to a top-level field in the document), or a list of
 * field names (referring to a nested field in the document).
 */
var FieldPath = /** @class */function () {
    /**
     * Creates a FieldPath from the provided field names. If more than one field
     * name is provided, the path will point to a nested field in a document.
     *
     * @param fieldNames A list of field names.
     */
    function FieldPath() {
        var fieldNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fieldNames[_i] = arguments[_i];
        }
        (0, _input_validation.validateNamedArrayAtLeastNumberOfElements)('FieldPath', fieldNames, 'fieldNames', 1);
        for (var i = 0; i < fieldNames.length; ++i) {
            (0, _input_validation.validateArgType)('FieldPath', 'string', i, fieldNames[i]);
            if (fieldNames[i].length === 0) {
                throw new _error.FirestoreError(_error.Code.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). " + 'Field names must not be empty.');
            }
        }
        this._internalPath = new _path.FieldPath(fieldNames);
    }
    FieldPath.documentId = function () {
        return FieldPath._DOCUMENT_ID;
    };
    /**
     * Internal Note: The backend doesn't technically support querying by
     * document ID. Instead it queries by the entire document name (full path
     * included), but in the cases we currently support documentId(), the net
     * effect is the same.
     */
    FieldPath._DOCUMENT_ID = new FieldPath(_path.FieldPath.keyField().canonicalString());
    return FieldPath;
}(); /**
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
exports.FieldPath = FieldPath;
/**
 * Matches any characters in a field path string that are reserved.
 */

var RESERVED = new RegExp('[~\\*/\\[\\]]');
/**
 * Parses a field path string into a FieldPath, treating dots as separators.
 */
function fromDotSeparatedString(path) {
    var found = path.search(RESERVED);
    if (found >= 0) {
        throw new _error.FirestoreError(_error.Code.INVALID_ARGUMENT, "Invalid field path (" + path + "). Paths must not contain " + "'~', '*', '/', '[', or ']'");
    }
    try {
        return new (FieldPath.bind.apply(FieldPath, [void 0].concat(path.split('.'))))();
    } catch (e) {
        throw new _error.FirestoreError(_error.Code.INVALID_ARGUMENT, "Invalid field path (" + path + "). Paths must not be empty, " + "begin with '.', end with '.', or contain '..'");
    }
}
//# sourceMappingURL=field_path.js.map
