/*! @license Firebase v4.5.0
Build: rev-f49c8b5
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.encode = encode;
exports.decode = decode;
exports.prefixSuccessor = prefixSuccessor;

var _path = require('../model/path');

var _assert = require('../util/assert');

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
var escapeChar = '\x01';
var encodedSeparatorChar = '\x01';
var encodedNul = '\x10';
var encodedEscape = '\x11';
/**
 * Encodes a resource path into a IndexedDb-compatible string form.
 */
function encode(path) {
    var result = '';
    for (var i = 0; i < path.length; i++) {
        if (result.length > 0) {
            result = encodeSeparator(result);
        }
        result = encodeSegment(path.get(i), result);
    }
    return encodeSeparator(result);
}
/** Encodes a single segment of a resource path into the given result */
function encodeSegment(segment, resultBuf) {
    var result = resultBuf;
    var length = segment.length;
    for (var i = 0; i < length; i++) {
        var c = segment.charAt(i);
        switch (c) {
            case '\0':
                result += escapeChar + encodedNul;
                break;
            case escapeChar:
                result += escapeChar + encodedEscape;
                break;
            default:
                result += c;
        }
    }
    return result;
}
/** Encodes a path separator into the given result */
function encodeSeparator(result) {
    return result + escapeChar + encodedSeparatorChar;
}
/**
 * Decodes the given IndexedDb-compatible string form of a resource path into
 * a ResourcePath instance. Note that this method is not suitable for use with
 * decoding resource names from the server; those are One Platform format
 * strings.
 */
function decode(path) {
    // Event the empty path must encode as a path of at least length 2. A path
    // with exactly 2 must be the empty path.
    var length = path.length;
    (0, _assert.assert)(length >= 2, 'Invalid path ' + path);
    if (length === 2) {
        (0, _assert.assert)(path.charAt(0) === escapeChar && path.charAt(1) === encodedSeparatorChar, 'Non-empty path ' + path + ' had length 2');
        return _path.ResourcePath.EMPTY_PATH;
    }
    // Escape characters cannot exist past the second-to-last position in the
    // source value.
    var lastReasonableEscapeIndex = length - 2;
    var segments = [];
    var segmentBuilder = '';
    for (var start = 0; start < length;) {
        // The last two characters of a valid encoded path must be a separator, so
        // there must be an end to this segment.
        var end = path.indexOf(escapeChar, start);
        if (end < 0 || end > lastReasonableEscapeIndex) {
            (0, _assert.fail)('Invalid encoded resource path: "' + path + '"');
        }
        var next = path.charAt(end + 1);
        switch (next) {
            case encodedSeparatorChar:
                var currentPiece = path.substring(start, end);
                var segment = void 0;
                if (segmentBuilder.length === 0) {
                    // Avoid copying for the common case of a segment that excludes \0
                    // and \001
                    segment = currentPiece;
                } else {
                    segmentBuilder += currentPiece;
                    segment = segmentBuilder;
                    segmentBuilder = '';
                }
                segments.push(segment);
                break;
            case encodedNul:
                segmentBuilder += path.substring(start, end);
                segmentBuilder += '\0';
                break;
            case encodedEscape:
                // The escape character can be used in the output to encode itself.
                segmentBuilder += path.substring(start, end + 1);
                break;
            default:
                (0, _assert.fail)('Invalid encoded resource path: "' + path + '"');
        }
        start = end + 2;
    }
    return new _path.ResourcePath(segments);
}
/**
 * Computes the prefix successor of the given path, computed by encode above.
 * A prefix successor is the first key that cannot be prefixed by the given
 * path. It's useful for defining the end of a prefix scan such that all keys
 * in the scan have the same prefix.
 *
 * Note that this is not a general prefix successor implementation, which is
 * tricky to get right with Strings, given that they encode down to UTF-8.
 * Instead this relies on the fact that all paths encoded by this class are
 * always terminated with a separator, and so a successor can always be
 * cheaply computed by incrementing the last character of the path.
 */
function prefixSuccessor(path) {
    var c = path.charCodeAt(path.length - 1);
    // TODO(mcg): this really should be a general thing, but not worth it right
    // now
    (0, _assert.assert)(c === 1, 'successor may only operate on paths generated by encode');
    return path.substring(0, path.length - 1) + String.fromCharCode(c + 1);
}
//# sourceMappingURL=encoded_resource_path.js.map
