import * as ttts from '@motionpicture/ttts-domain';
import * as express from 'express';
import MasterAdminUser from '../app/user';

declare global {
    namespace Express {
        export interface Request {
            masterAdminUser?: MasterAdminUser;
        }

        /**
         * セッションインターフェース
         * セッション管理する値についてはここで型定義すること
         */
        // tslint:disable-next-line:interface-name
        export interface Session {
            user?: ttts.service.admin.IAdmin;
            cognitoCredentials?: ttts.service.admin.ICredentials;
        }
    }
}
