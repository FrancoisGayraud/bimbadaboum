/*! @license Firebase v4.5.0
Build: rev-f49c8b5
Terms: https://firebase.google.com/terms/ */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Transaction = undefined;

var _snapshot_version = require('./snapshot_version');

var _collections = require('../model/collections');

var _document = require('../model/document');

var _mutation = require('../model/mutation');

var _error = require('../util/error');

var _promise = require('../../utils/promise');

/**
 * Internal transaction object responsible for accumulating the mutations to
 * perform and the base versions for any documents read.
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
var Transaction = /** @class */function () {
    function Transaction(datastore) {
        this.datastore = datastore;
        // The version of each document that was read during this transaction.
        this.readVersions = (0, _collections.documentVersionMap)();
        this.mutations = [];
        this.committed = false;
    }
    Transaction.prototype.recordVersion = function (doc) {
        var docVersion = doc.version;
        if (doc instanceof _document.NoDocument) {
            // For deleted docs, we must use baseVersion 0 when we overwrite them.
            docVersion = _snapshot_version.SnapshotVersion.forDeletedDoc();
        }
        var existingVersion = this.readVersions.get(doc.key);
        if (existingVersion !== null) {
            if (!docVersion.equals(existingVersion)) {
                // This transaction will fail no matter what.
                throw new _error.FirestoreError(_error.Code.ABORTED, 'Document version changed between two reads.');
            }
        } else {
            this.readVersions = this.readVersions.insert(doc.key, docVersion);
        }
    };
    Transaction.prototype.lookup = function (keys) {
        var _this = this;
        if (this.committed) {
            return _promise.PromiseImpl.reject('Transaction has already completed.');
        }
        if (this.mutations.length > 0) {
            return _promise.PromiseImpl.reject('Transactions lookups are invalid after writes.');
        }
        return this.datastore.lookup(keys).then(function (docs) {
            docs.forEach(function (doc) {
                return _this.recordVersion(doc);
            });
            return docs;
        });
    };
    Transaction.prototype.write = function (mutations) {
        if (this.committed) {
            throw new _error.FirestoreError(_error.Code.FAILED_PRECONDITION, 'Transaction has already completed.');
        }
        this.mutations = this.mutations.concat(mutations);
    };
    /**
     * Returns the version of this document when it was read in this transaction,
     * as a precondition, or no precondition if it was not read.
     */
    Transaction.prototype.precondition = function (key) {
        var version = this.readVersions.get(key);
        if (version) {
            return _mutation.Precondition.updateTime(version);
        } else {
            return _mutation.Precondition.NONE;
        }
    };
    /**
     * Returns the precondition for a document if the operation is an update.
     */
    Transaction.prototype.preconditionForUpdate = function (key) {
        var version = this.readVersions.get(key);
        if (version && version.equals(_snapshot_version.SnapshotVersion.forDeletedDoc())) {
            // The document doesn't exist, so fail the transaction.
            throw new _error.FirestoreError(_error.Code.FAILED_PRECONDITION, "Can't update a document that doesn't exist.");
        } else if (version) {
            // Document exists, base precondition on document update time.
            return _mutation.Precondition.updateTime(version);
        } else {
            // Document was not read, so we just use the preconditions for a blind
            // update.
            return _mutation.Precondition.exists(true);
        }
    };
    Transaction.prototype.set = function (key, data) {
        this.write(data.toMutations(key, this.precondition(key)));
    };
    Transaction.prototype.update = function (key, data) {
        this.write(data.toMutations(key, this.preconditionForUpdate(key)));
    };
    Transaction.prototype.delete = function (key) {
        this.write([new _mutation.DeleteMutation(key, this.precondition(key))]);
        // Since the delete will be applied before all following writes, we need to
        // ensure that the precondition for the next write will be exists: false.
        this.readVersions = this.readVersions.insert(key, _snapshot_version.SnapshotVersion.forDeletedDoc());
    };
    Transaction.prototype.commit = function () {
        var _this = this;
        var unwritten = this.readVersions;
        // For each mutation, note that the doc was written.
        this.mutations.forEach(function (mutation) {
            unwritten = unwritten.remove(mutation.key);
        });
        if (!unwritten.isEmpty()) {
            return _promise.PromiseImpl.reject(Error('Every document read in a transaction must also be written.'));
        }
        return this.datastore.commit(this.mutations).then(function () {
            _this.committed = true;
        });
    };
    return Transaction;
}();
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map
