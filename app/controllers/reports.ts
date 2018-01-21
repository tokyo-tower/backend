
/**
 * レポート出力コントローラー
 * @namespace controllers.report
 */

import * as tttsapi from '@motionpicture/ttts-api-nodejs-client';
import * as ttts from '@motionpicture/ttts-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';
import * as _ from 'underscore';
// tslint:disable-next-line:no-var-requires no-require-imports
const jconv = require('jconv');

const debug = createDebug('ttts-backend:controllers:report');

const authClient = new tttsapi.auth.OAuth2({
    domain: <string>process.env.API_AUTHORIZE_SERVER_DOMAIN,
    clientId: <string>process.env.API_CLIENT_ID,
    clientSecret: <string>process.env.API_CLIENT_SECRET
});

// CSV用のステータスコード
enum Status4csv {
    Reserved = 'RESERVED',
    Cancelled = 'CANCELLED',
    // キャンセル行ステータス
    CancellationFee = 'CANCELLATION_FEE'
}

const purchaserGroupStrings: any = {
    Customer: '01',
    Staff: '04'
};
const paymentMethodStrings: any = {
    CreditCard: '0'
};

/**
 * CSVデータインターフェース
 * @type
 */
type IData = ttts.factory.reservation.event.IReservation & {
    status_sort: string;
    cancellationFee: number;
    // 予約単位料金
    price: number;
    status4csv: Status4csv;
    // 取引作成日(キャンセルデータに出力)
    transaction_createdAt: Date;
};

// カラム区切り(タブ)
const csvSeparator: string = '\t';
// 改行コード(CR+LF)
const csvLineFeed: string = '\r\n';
// 売り上げレポートヘッダ
const arrayHeadSales = [
    '"購入番号"',
    '"パフォーマンスID"',
    '"座席コード"',
    '"予約ステータス"',
    '"入塔予約年月日"',
    '"入塔予約時刻"',
    '"劇場名称"',
    '"スクリーンID"',
    '"スクリーン名"',
    '"作品ID"',
    '"作品名称"',
    '"購入者区分"',
    '"購入者（名）"',
    '"購入者（姓）"',
    '"購入者メール"',
    '"購入者電話"',
    '"購入日時"',
    '"決済方法"',
    '"座席グレード名称"',
    '"座席グレード追加料金"',
    '"券種名称"',
    '"チケットコード"',
    '"券種料金"',
    '"客層"',
    '"payment_seat_index"',
    '"予約単位料金"',
    '"ユーザーネーム"',
    '"入場フラグ"',
    '"入場日時"'
];

/**
 *
 * レポートindex
 */
export async function index(__: Request, res: Response): Promise<void> {
    res.render('reports/index', {
        title: 'レポート',
        routeName: 'master.report.index',
        layout: 'layouts/master/layout'
    });
}
/**
 *
 * 売り上げレポート出力
 */
export async function sales(__: Request, res: Response): Promise<void> {
    res.render('reports/sales', {
        title: '売り上げレポート出力',
        routeName: 'master.report.sales',
        layout: 'layouts/master/layout'
    });
}
/**
 *
 * アカウント別レポート出力
 */
export async function account(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cognitoCredentials = (<Express.ICredentials>(<Express.Session>req.session).cognitoCredentials);
        authClient.setCredentials({
            refresh_token: cognitoCredentials.refreshToken,
            // expiry_date: number;
            access_token: cognitoCredentials.accessToken,
            token_type: cognitoCredentials.tokenType
        });
        const adminService = new tttsapi.service.Admin({
            endpoint: <string>process.env.API_ENDPOINT,
            auth: authClient
        });
        const cognitoUsers = await adminService.search({ group: 'Staff' });
        debug('cognitoUsers:', cognitoUsers);

        if (cognitoUsers.length <= 0) {
            throw new Error('Staff admin users not found.');
        }

        const hours: string[] = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let hour: number = 0; hour < 24; hour += 1) {
            // tslint:disable-next-line:no-magic-numbers
            hours.push((`00${hour}`).slice(-2));
        }
        //const minutes: string[] = ['00', '15', '30', '45'];
        const minutes: string[] = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let minute: number = 0; minute < 60; minute += 1) {
            // tslint:disable-next-line:no-magic-numbers
            minutes.push((`00${minute}`).slice(-2));
        }
        // 画面描画
        res.render('reports/account', {
            cognitoUsers: cognitoUsers,
            hours: hours,
            minutes: minutes,
            title: 'アカウント別レポート出力',
            routeName: 'master.report.account',
            layout: 'layouts/master/layout'
        });
    } catch (error) {
        next(error);
    }
}
/**
 * 一覧データ取得API
 */
// tslint:disable-next-line:max-func-body-length
export async function getSales(req: Request, res: Response): Promise<void> {
    // 引数セット
    const prmConditons: any = {};
    prmConditons.reportType = getValue(req.query.reportType);
    // 登録日
    prmConditons.performanceDayFrom = getValue(req.query.dateFrom);
    prmConditons.performanceDayTo = getValue(req.query.dateTo);
    // アカウント
    prmConditons.owner_username = getValue(req.query.owner_username);
    // 時刻From
    prmConditons.performanceStartHour1 = getValue(req.query.start_hour1);
    prmConditons.performanceStartMinute1 = getValue(req.query.start_minute1);
    // 時刻To
    prmConditons.performanceStartHour2 = getValue(req.query.start_hour2);
    prmConditons.performanceStartMinute2 = getValue(req.query.start_minute2);

    try {
        // バリデーション(時分が片方のみ指定されていたらエラー)
        const errorMessage = await validate(req);
        if (errorMessage !== '') {
            throw new Error(errorMessage);
        }
        // 予約情報・キャンセル予約情報取得
        const reservations = await getReservations(getConditons(prmConditons, 'reservation'));

        let cancels: IData[] = [];
        if (prmConditons.reportType === 'sales') {
            cancels = await getCancels(getConditons(prmConditons, 'cancel'));
        }

        const datas = [...reservations, ...cancels];

        // ソート
        if (datas.length > 0) {
            datas.sort((a, b) => {
                // 入塔日
                if (a.performance_day > b.performance_day) {
                    return 1;
                }
                if (a.performance_day < b.performance_day) {
                    return -1;
                }
                // 開始時間
                if (a.performance_start_time > b.performance_start_time) {
                    return 1;
                }
                if (a.performance_start_time < b.performance_start_time) {
                    return -1;
                }
                // 購入番号
                if (a.payment_no > b.payment_no) {
                    return 1;
                }
                if (a.payment_no < b.payment_no) {
                    return -1;
                }
                // 座席番号
                if (a.seat_code > b.seat_code) {
                    return 1;
                }
                if (a.seat_code < b.seat_code) {
                    return -1;
                }
                // 3レコード用:confirmed->cencelled->CANCELLATION_FEE
                if (a.status_sort > b.status_sort) {
                    return 1;
                }
                if (a.status_sort < b.status_sort) {
                    return -1;
                }

                return 0;
            });
        }

        const results = datas.map((reservation) => {
            return getCsvData(reservation.payment_no) +
                getCsvData(reservation.performance) +
                getCsvData(reservation.seat_code) +
                getCsvData(reservation.status4csv) +
                getCsvData(toYMDDB(reservation.performance_day)) +
                getCsvData(reservation.performance_start_time) +
                getCsvData(reservation.theater_name.ja) +
                getCsvData(reservation.screen) +
                getCsvData(reservation.screen_name.ja) +
                getCsvData(reservation.film) +
                getCsvData(reservation.film_name.ja) +
                // tslint:disable-next-line:max-line-length
                getCsvData((purchaserGroupStrings[reservation.purchaser_group] !== undefined) ? purchaserGroupStrings[reservation.purchaser_group] : reservation.purchaser_group) +
                getCsvData(reservation.purchaser_first_name) +
                getCsvData(reservation.purchaser_last_name) +
                getCsvData(reservation.purchaser_email) +
                getCsvData(reservation.purchaser_tel) +
                getCsvData(toString(reservation.purchased_at)) +
                // tslint:disable-next-line:max-line-length
                getCsvData((paymentMethodStrings[reservation.payment_method] !== undefined) ? paymentMethodStrings[reservation.payment_method] : reservation.payment_method) +
                getCsvData(reservation.seat_grade_name.ja) +
                getCsvData(reservation.seat_grade_additional_charge.toString()) +
                getCsvData(reservation.ticket_type_name.ja) +
                getCsvData(reservation.ticket_ttts_extension.csv_code) +
                getCsvData(reservation.charge.toString()) +
                getCsvData(getCustomerGroup(reservation)) +
                getCsvData(reservation.payment_seat_index.toString()) +
                getCsvData(reservation.price.toString()) +
                getCsvData((reservation.owner_username !== undefined) ? reservation.owner_username : '') +
                getCsvData(reservation.checkins.length > 0 ? 'TRUE' : 'FALSE') +
                getCsvData(reservation.checkins.length > 0 ? toString(reservation.checkins[0].when) : '', false);
        });
        debug('writing results to response...', results);

        // Responseヘッダセット
        const filename = getValue(req.query.reportType) === 'sales' ? '売上げレポート' : 'アカウント別レポート';
        res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
        res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');

        const head = arrayHeadSales.join(csvSeparator) + csvLineFeed;
        res.write(jconv.convert(head, 'UTF8', 'SJIS'));
        res.write(jconv.convert(results.join(csvLineFeed), 'UTF8', 'SJIS'));
        res.end();
    } catch (error) {
        const message: string = error.message;
        res.write(message);
        res.end();
    }
}
/**
 * レポート出力検証
 * @param {Request} req
 * @return {any}
 */
async function validate(req: Request): Promise<any> {
    // 検証
    const validatorResult = await req.getValidationResult();
    const errors: any = (!validatorResult.isEmpty()) ? validatorResult.mapped : {};

    // 片方入力エラーチェック
    if (!isInputEven(req.query.start_hour1, req.query.start_minute1)) {
        errors.start_hour1 = { msg: '集計期間の時分Fromが片方しか指定されていません' };
    }
    if (!isInputEven(req.query.start_hour2, req.query.start_minute2)) {
        errors.start_hour2 = { msg: '集計期間の時分Toが片方しか指定されていません' };
    }
    let errorMessage: string = '';
    Object.keys(errors).forEach((key) => {
        if (errorMessage !== '') { errorMessage += csvLineFeed; }
        errorMessage += errors[key].msg;
    });

    return errorMessage;
}
/**
 * 両方入力チェック(両方入力、または両方未入力の時true)
 *
 * @param {string} value1
 * @param {string} value2
 * @return {boolean}
 */
function isInputEven(value1: string, value2: string): boolean {
    if (_.isEmpty(value1) && _.isEmpty(value2)) {
        return true;
    }
    if (!_.isEmpty(value1) && !_.isEmpty(value2)) {
        return true;
    }

    return false;
}
/**
 * 入力値取得(空文字はnullに変換)
 *
 * @param {string|null} inputValue
 * @returns {string|null}
 */
function getValue(inputValue: string | null): string | null {
    return (!_.isEmpty(inputValue)) ? inputValue : null;
}
/**
 * 検索条件取得
 *
 * @param {any} prmConditons
 * @param {string} dbType
 * @returns {any}
 */
function getConditons(prmConditons: any, dbType: string): any {
    // 検索条件を作成
    const conditions: any = {};
    // 予約か否か
    const isReservation: boolean = (dbType === 'reservation');
    // レポートタイプが売上げか否か
    const isSales: boolean = prmConditons.reportType === 'sales';
    // 購入区分
    const purchaserGroup: string = isSales ? ttts.factory.person.Group.Customer : ttts.factory.person.Group.Staff;

    // 予約
    if (isReservation) {
        // ステータス
        conditions.typeOf = ttts.factory.transactionType.PlaceOrder;
        conditions.status = ttts.factory.transactionStatusType.Confirmed;
        // 購入区分
        conditions['object.purchaser_group'] = purchaserGroup;
        // アカウント
        if (prmConditons.owner_username !== null) {
            conditions['result.eventReservations.owner_username'] = prmConditons.owner_username;
        }
    } else {
        // キャンセルはsalesのみアカウント別はなし。
        // ステータス
        conditions.typeOf = ttts.factory.transactionType.ReturnOrder;
        // 購入区分
        conditions['object.transaction.object.purchaser_group'] = purchaserGroup;
    }

    // 集計期間
    if (prmConditons.performanceDayFrom !== null || prmConditons.performanceDayTo !== null) {
        const conditionsDate: any = {};
        // 登録日From
        if (prmConditons.performanceDayFrom !== null) {
            if (isSales) {
                // 売上げ
                conditionsDate.$gte = toISOStringJapan(prmConditons.performanceDayFrom);
            } else {
                // アカウント別
                const timeWk: string = `${prmConditons.performanceDayFrom} ` +
                    `${prmConditons.performanceStartHour1}` +
                    `${prmConditons.performanceStartMinute1}`;
                conditionsDate.$gte = toISOStringUTC(timeWk);
            }
        }
        // 登録日To
        if (prmConditons.performanceDayTo !== null) {
            if (isSales) {
                // 売上げ
                conditionsDate.$lt = toISOStringJapan(prmConditons.performanceDayTo, 1);
            } else {
                // アカウント別
                const timeWk: string = `${prmConditons.performanceDayTo} ` +
                    `${prmConditons.performanceStartHour2}` +
                    `${prmConditons.performanceStartMinute2}`;
                conditionsDate.$lt = toISOStringUTC(timeWk, 1);
            }
        }
        const keyDate: string = dbType === 'reservation' ?
            (isSales ? 'updatedAt' : 'updatedAt') : 'createdAt';
        //(isSales ? 'purchased_at' : 'updated_at') : 'createdAt';
        conditions[keyDate] = conditionsDate;
    }

    return conditions;
}

/**
 * 予約情報取得
 * @param {any} conditions
 * @returns {Promise<IData[]>}
 */
async function getReservations(conditions: any): Promise<IData[]> {
    // 取引取得
    const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
    const transactions = await transactionRepo.transactionModel.find(
        conditions
    ).exec().then((docs) => docs.map((doc) => <ttts.factory.transaction.placeOrder.ITransaction>doc.toObject()));

    // 予約情報をセット
    const reservations: IData[] = [];
    // 取引数分Loop
    for (const transaction of transactions) {
        // 取引から予約情報取得
        const eventReservations = (<ttts.factory.transaction.placeOrder.IResult>transaction.result).eventReservations;
        for (const eventReservation of eventReservations) {
            if (eventReservation.status === ttts.factory.reservationStatusType.ReservationConfirmed) {
                reservations.push({
                    ...eventReservation,
                    status4csv: Status4csv.Reserved,
                    status_sort: eventReservation.status,
                    price: (<ttts.factory.transaction.placeOrder.IResult>transaction.result).order.price,
                    cancellationFee: 0,
                    transaction_createdAt: <Date>transaction.endDate
                });
            }
        }
    }

    return reservations;
}

/**
 * キャンセル予約情報取得
 *
 * @param {any} conditions
 * @returns {Promise<IData[]>}
 */
async function getCancels(conditions: any): Promise<IData[]> {
    // 取引に対する返品リクエスト取得
    const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
    const returnOrderTransactions = await transactionRepo.transactionModel.find(
        conditions
    ).exec().then((docs) => docs.map((doc) => <ttts.factory.transaction.returnOrder.ITransaction>doc.toObject()));

    // 予約情報をセット
    const cancels: IData[] = [];
    // 取引数分Loop
    for (const returnOrderTransaction of returnOrderTransactions) {
        // 取引からキャンセル予約情報取得
        const transaction = returnOrderTransaction.object.transaction;
        const eventReservations = (<ttts.factory.transaction.placeOrder.IResult>transaction.result).eventReservations;
        for (const eventReservation of eventReservations) {
            if (eventReservation.status === ttts.factory.reservationStatusType.ReservationConfirmed) {
                cancels.push({
                    ...eventReservation,
                    status4csv: Status4csv.Cancelled,
                    status_sort: '',
                    cancellationFee: returnOrderTransaction.object.cancellationFee,
                    price: (<ttts.factory.transaction.placeOrder.IResult>transaction.result).order.price,
                    transaction_createdAt: <Date>returnOrderTransaction.endDate
                });
            }
        }
    }

    // キャンセルデータは1レコードで3行出力
    const reservations: IData[] = [];
    for (const cancelReservation of cancels) {
        // キャンセルデータ
        reservations.push({
            ...cancelReservation,
            status_sort: `${cancelReservation.status}_1`,
            status4csv: Status4csv.Cancelled,
            purchased_at: cancelReservation.transaction_createdAt
        });

        // キャンセル料データ
        reservations.push({
            ...cancelReservation,
            status_sort: `${cancelReservation.status}_2`,
            status4csv: Status4csv.CancellationFee,
            purchased_at: cancelReservation.transaction_createdAt,
            price: cancelReservation.cancellationFee,
            charge: cancelReservation.cancellationFee,
            ticket_ttts_extension: {
                ...cancelReservation.ticket_ttts_extension,
                csv_code: ''
            }
        });
    }

    return reservations;
}

/**
 * CSV出力用データ取得
 * @param {string} value
 * @param {boolean} addSeparator
 * @returns {string}
 */
function getCsvData(value: string, addSeparator: boolean = true): string {
    const converted = convertToString(value);

    return `"${(!_.isEmpty(converted) ? converted : '')}"${(addSeparator ? csvSeparator : '')}`;
}

/**
 * 文字列変換
 * @param {any} value
 * @returns {string}
 */
function convertToString(value: any): string {
    if (value === undefined) { return ''; }
    if (value === null) { return ''; }

    return value.toString();
}

/**
 * YYYYMMDD日付取得
 *
 * @param {string} dateStr('YYYY/MM/DD')
 * @returns {string} ('YYYYMMDD')
 */
function toYMDDB(dateStr: string): string {
    return moment(dateStr, 'YYYY/MM/DD').format('YYYYMMDD');
}
/**
 * DB検索用ISO日付取得
 *
 * @param {string} dateStr
 * @param {number} addDay
 * @returns {string}
 */
function toISOStringJapan(dateStr: string, addDay: number = 0): string {
    const dateWk: string = moment(dateStr, 'YYYY/MM/DD').add(addDay, 'days').format('YYYY-MM-DD');

    return `${dateWk}T00:00:00+09:00`;
}
/**
 * DB検索用ISO日付+時分取得
 *
 * @param {string} dateStr
 * @param {number} addMinute
 * @returns {string}
 */
function toISOStringUTC(dateStr: string, addMinute: number = 0): string {
    // tslint:disable-next-line:no-magic-numbers
    const gtc: moment.Moment = moment(dateStr, 'YYYY/MM/DD HHmm').add(-9, 'hours').add(addMinute, 'minutes');
    const dateWk: string = gtc.format('YYYY-MM-DD');
    const timeWk: string = gtc.format('HH:mm:ss');

    // tslint:disable-next-line:no-console
    console.log(`${dateWk}T${timeWk}Z`);

    return `${dateWk}T${timeWk}Z`;
}
/**
 * YYYY/MM/DD HH:mm:ss 日時取得
 *
 * @param {Date} date
 * @returns {string} ('YYYY/MM/DD HH:mm:ss')
 */
function toString(date: Date): string {
    if (convertToString(date) === '') {
        return '';
    }

    return moment(date).format('YYYY/MM/DD HH:mm:ss');
}

/**
 * 客層取得 (購入者居住国：2桁、年代：2桁、性別：1桁)
 * @param {ttts.factory.reservation.event.IReservation} reservation
 * @returns {string}
 */
function getCustomerGroup(reservation: ttts.factory.reservation.event.IReservation): string {
    const locale = convertToString(reservation.purchaser_address);
    const age = convertToString(reservation.purchaser_age);
    const gender = convertToString(reservation.purchaser_gender);

    return (locale !== '' ? locale : '__') + (age !== '' ? age : '__') + (gender !== '' ? gender : '_');
}
