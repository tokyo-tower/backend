/**
 * 共通ユーティリティ
 *
 * @namespace Util
 */

import * as crypto from 'crypto';

/**
 * ミリ秒とプロセスに対してユニークなトークンを生成する
 *
 * @memberOf Util
 */
export function createToken(): string {
    // tslint:disable-next-line:no-require-imports
    const uniqid = require('uniqid');
    // tslint:disable-next-line:no-magic-numbers insecure-random
    const data = (Math.floor(Math.random() * 10000) + 1000).toString() + <string>uniqid();

    return crypto.createHash('md5').update(data, 'utf8').digest('hex');
}

/**
 * ハッシュ値を作成する
 *
 * @param {string} password
 * @param {string} salt
 * @memberOf Util
 */
export function createHash(password: string, salt: string): string {
    const sha512 = crypto.createHash('sha512');
    sha512.update(salt + password, 'utf8');
    return sha512.digest('hex');
}
