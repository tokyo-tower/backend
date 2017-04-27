"use strict";
/**
 * 共通ユーティリティ
 *
 * @namespace Util
 */
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
/**
 * ミリ秒とプロセスに対してユニークなトークンを生成する
 *
 * @memberOf Util
 */
function createToken() {
    // tslint:disable-next-line:no-require-imports
    const uniqid = require('uniqid');
    // tslint:disable-next-line:no-magic-numbers insecure-random
    const data = (Math.floor(Math.random() * 10000) + 1000).toString() + uniqid();
    return crypto.createHash('md5').update(data, 'utf8').digest('hex');
}
exports.createToken = createToken;
/**
 * ハッシュ値を作成する
 *
 * @param {string} password
 * @param {string} salt
 * @memberOf Util
 */
function createHash(password, salt) {
    const sha512 = crypto.createHash('sha512');
    sha512.update(salt + password, 'utf8');
    return sha512.digest('hex');
}
exports.createHash = createHash;
