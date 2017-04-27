"use strict";
/**
 * devルーターテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const app = require("../app/app");
describe('GET /dev/400', () => {
    it('bad request manually', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/dev/400')
            .expect('Content-Type', /text\/html/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
            assert.notEqual(response.text.length, 0);
        });
    }));
});
