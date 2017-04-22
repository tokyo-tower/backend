/**
 * devルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('GET /dev/400', () => {
    it('bad request manually', async () => {
        await supertest(app)
            .get('/dev/400')
            .expect('Content-Type', /text\/html/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert.notEqual(response.text.length, 0);
            });
    });
});
