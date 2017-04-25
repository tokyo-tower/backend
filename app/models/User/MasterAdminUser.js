"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseUser_1 = require("./BaseUser");
/**
 * マスタ管理者ユーザー
 *
 * @export
 * @class MasterAdminUser
 * @extends {BaseUser}
 */
class MasterAdminUser extends BaseUser_1.default {
    static PARSE(session) {
        const user = new MasterAdminUser();
        // セッション値からオブジェクトにセット
        if (session && session.hasOwnProperty(MasterAdminUser.AUTH_SESSION_NAME)) {
            Object.keys(session[MasterAdminUser.AUTH_SESSION_NAME]).forEach((propertyName) => {
                user[propertyName] = session[MasterAdminUser.AUTH_SESSION_NAME][propertyName];
            });
        }
        return user;
    }
}
MasterAdminUser.AUTH_SESSION_NAME = 'CHEVREFrontendMasterAuth';
exports.default = MasterAdminUser;
