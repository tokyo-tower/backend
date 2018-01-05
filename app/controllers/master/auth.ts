/**
 * マスタ管理者認証コントローラー
 * @namespace controllers.master.auth
 */

import * as ttts from '@motionpicture/ttts-domain';
import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'underscore';

import * as Message from '../../../common/Const/Message';

const debug = createDebug('ttts-backend:controllers:master:auth');

const masterHome: string = '/master/report';
const cookieName = 'remember_master_admin';

/**
 * マスタ管理ログイン
 */
export async function login(req: Request, res: Response): Promise<void> {
    if (req.masterAdminUser !== undefined && req.masterAdminUser.isAuthenticated()) {
        res.redirect(masterHome);

        return;
    }

    let errors: any = {};

    if (req.method === 'POST') {
        // 検証
        validate(req);
        const validatorResult = await req.getValidationResult();
        errors = validatorResult.mapped;

        if (validatorResult.isEmpty()) {
            try {
                // ログイン情報が有効であれば、Cognitoでもログイン
                (<Express.Session>req.session).cognitoCredentials =
                    await getCognitoCredentials(req.body.username, req.body.password);
                debug('cognito credentials published.', (<Express.Session>req.session).cognitoCredentials);
            } catch (error) {
                errors = { username: { msg: 'IDもしくはパスワードの入力に誤りがあります' } };
            }

            const cognitoCredentials = (<Express.Session>req.session).cognitoCredentials;
            if (cognitoCredentials !== undefined) {
                const cognitoUser = await getCognitoUser(<string>cognitoCredentials.AccessToken);

                // ログイン
                (<Express.Session>req.session).masterAdminUser = cognitoUser;

                const cb = (!_.isEmpty(req.query.cb)) ? req.query.cb : masterHome;
                res.redirect(cb);

                return;
            }
        }
    }

    // ログイン画面遷移
    res.render('master/auth/login', {
        displayId: 'Aa-1',
        title: 'マスタ管理ログイン',
        errors: errors,
        routeName: 'master.login',
        layout: 'layouts/master/layoutLogin'
    });
}

function validate(req: Request): void {
    req.checkBody('username', Message.Common.required.replace('$fieldName$', 'ID')).notEmpty();
    req.checkBody('password', Message.Common.required.replace('$fieldName$', 'パスワード')).notEmpty();
}

/**
 * マスタ管理ログアウト
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.session !== undefined) {
            delete req.session.masterAdminUser;
        }

        await ttts.Models.Authentication.remove({ token: req.cookies[cookieName] }).exec();

        res.clearCookie(cookieName);
        res.redirect('/master/login');
    } catch (error) {
        next(error);
    }
}

async function getCognitoUser(accesssToken: string) {
    return new Promise<Express.IUser>((resolve, reject) => {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            apiVersion: 'latest',
            region: 'ap-northeast-1'
        });

        type CognitoUserAttributeType = AWS.CognitoIdentityServiceProvider.AttributeType;

        cognitoIdentityServiceProvider.getUser(
            {
                AccessToken: accesssToken
            },
            (err, data) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve({
                        username: data.Username,
                        // id: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'sub')).Value,
                        familyName: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'family_name')).Value,
                        givenName: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'given_name')).Value,
                        email: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'email')).Value,
                        telephone: <string>(<CognitoUserAttributeType>data.UserAttributes.find((a) => a.Name === 'phone_number')).Value
                    });
                }
            });
    });
}

/**
 * Cognito認証情報を取得する
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 */
async function getCognitoCredentials(username: string, password: string) {
    return new Promise<AWS.CognitoIdentityServiceProvider.AuthenticationResultType>((resolve, reject) => {
        const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
            region: 'ap-northeast-1',
            accessKeyId: <string>process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: <string>process.env.AWS_SECRET_ACCESS_KEY
        });
        const hash = crypto.createHmac('sha256', <string>process.env.API_CLIENT_SECRET)
            .update(`${username}${<string>process.env.API_CLIENT_ID}`)
            .digest('base64');
        const params = {
            UserPoolId: <string>process.env.COGNITO_USER_POOL_ID,
            ClientId: <string>process.env.API_CLIENT_ID,
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            AuthParameters: {
                USERNAME: username,
                SECRET_HASH: hash,
                PASSWORD: password
            }
            // ClientMetadata?: ClientMetadataType;
            // AnalyticsMetadata?: AnalyticsMetadataType;
            // ContextData?: ContextDataType;
        };

        cognitoidentityserviceprovider.adminInitiateAuth(params, (err, data) => {
            debug('adminInitiateAuth result:', err, data);
            if (err instanceof Error) {
                reject(err);
            } else {
                if (data.AuthenticationResult === undefined) {
                    reject(new Error('Unexpected.'));
                } else {
                    resolve(data.AuthenticationResult);
                }
            }
        });
    });
}
