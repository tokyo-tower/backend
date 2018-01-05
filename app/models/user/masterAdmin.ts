/**
 * マスタ管理者ユーザー
 * @export
 * @class MasterAdminUser
 */
export default class MasterAdminUser {
    public familyName: string;
    public givenName: string;
    public email: string;
    public telephone: string;
    public username: string;

    public static PARSE(session: Express.Session | undefined): MasterAdminUser {
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
    public isAuthenticated(): boolean {
        return (this.username !== undefined);
    }
}
