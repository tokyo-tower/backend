"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * マスタ管理者ユーザー
 * @export
 * @class MasterAdminUser
 */
class MasterAdminUser {
    static PARSE(session) {
        const user = new MasterAdminUser();
        // セッション値からオブジェクトにセット
        if (session !== undefined && session.masterAdminUser !== undefined) {
            user.familyName = session.masterAdminUser.familyName;
            user.givenName = session.masterAdminUser.givenName;
            user.email = session.masterAdminUser.email;
            user.telephone = session.masterAdminUser.telephone;
            user.username = session.masterAdminUser.username;
        }
        return user;
    }
    /**
     * サインイン中かどうか
     */
    isAuthenticated() {
        return (this.username !== undefined);
    }
}
exports.default = MasterAdminUser;
