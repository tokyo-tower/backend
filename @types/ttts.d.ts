import * as ttts from '@motionpicture/ttts-domain';
import * as express from 'express';
import MasterAdminUser from '../app/models/user/masterAdmin';

declare global {
    namespace Express {
        export interface Request {
            masterAdminUser?: MasterAdminUser;
        }

        interface IUser {
            familyName: string;
            givenName: string;
            email: string;
            telephone: string;
            username: string;
        }

        // tslint:disable-next-line:interface-name
        export interface Session {
            masterAdminUser?: IUser;
        }
    }
}
