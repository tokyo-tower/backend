/**
 * expressアプリケーション
 *
 * @ignore
 */

// 依存パッケージ
import * as ttts from '@motionpicture/ttts-domain';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as createDebug from 'debug';
import * as express from 'express';
import * as expressValidator from 'express-validator';
import * as helmet from 'helmet';
import * as multer from 'multer';
import * as favicon from 'serve-favicon';
// tslint:disable-next-line:no-var-requires no-require-imports
const expressLayouts = require('express-ejs-layouts');

import mongooseConnectionOptions from '../mongooseConnectionOptions';

// ミドルウェア
import authentication from './middlewares/authentication';
import errorHandler from './middlewares/errorHandler';
import locals from './middlewares/locals';
import notFoundHandler from './middlewares/notFoundHandler';
import session from './middlewares/session';

// ルーター
import authRouter from './routes/auth';
import devRouter from './routes/dev';
import filmMasterRouter from './routes/master/film';
import performanceMasterRouter from './routes/master/performance';
import ticketTypeMasterRouter from './routes/master/ticketType';
import ticketTypeGroupMasterRouter from './routes/master/ticketTypeGroup';
import reportsRouter from './routes/reports';
import router from './routes/router';

const debug = createDebug('ttts-backend:app');

const app = express();

app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(session); // セッション
app.use(locals); // テンプレート変数

if (process.env.NODE_ENV !== 'production') {
    // サーバーエラーテスト
    app.get('/dev/uncaughtexception', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });

        req.on('end', () => {
            throw new Error('uncaughtexception manually');
        });
    });
}

// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(expressLayouts);
// tslint:disable-next-line:no-backbone-get-set-outside-model
app.set('layout', 'layouts/layout');

// uncomment after placing your favicon in /public
app.use(favicon(`${__dirname}/../public/favicon.ico`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// for parsing multipart/form-data
const storage = multer.memoryStorage();
app.use(multer({ storage: storage }).any());

app.use(cookieParser());
app.use(express.static(`${__dirname}/../public`));

app.use(expressValidator()); // バリデーション

// ルーティング登録の順序に注意！
if (process.env.NODE_ENV !== 'production') {
    app.use('/dev', devRouter);
}

app.use(authRouter); // ログイン・ログアウト

app.use(authentication); // ユーザー認証

app.use(router);
app.use('/master/films', filmMasterRouter); //作品
app.use('/master/performances', performanceMasterRouter); //パフォーマンス
app.use('/master/ticketTypes', ticketTypeMasterRouter); //券種
app.use('/master/ticketTypeGroups', ticketTypeGroupMasterRouter); //券種グループ
app.use('/reports', reportsRouter); //レポート出力

// 404
app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

ttts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

export = app;
