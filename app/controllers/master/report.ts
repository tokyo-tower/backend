/**
 * レポート出力コントローラー
 *
 * @namespace controller/report
 */
import * as ttts from '@motionpicture/ttts-domain';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as _ from 'underscore';
// tslint:disable-next-line:no-var-requires no-require-imports
const jconv = require('jconv');

const STATUS_CANCELLATION_FEE = 'CANCELLATION_FEE';
// 返金キャンセル料
const CANCEL_CHARGE_REFUND: number = 0;
const CANCEL_CHARGE: number = 1000;

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
    '"窓口ユーザーID"',
    '"入場フラグ"',
    '"入場日時"'
];

/**
 *
 * レポートindex
 */
export async function index(__: Request, res: Response): Promise<void> {
    res.render('master/report/index', {
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
    res.render('master/report/sales', {
        title: '売り上げレポート出力',
        routeName: 'master.report.sales',
        layout: 'layouts/master/layout'
    });
}
/**
 *
 * アカウント別レポート出力
 */
export async function account(__: Request, res: Response): Promise<void> {
    // アカウント一覧取得
    const ownerRepo = new ttts.repository.Owner(ttts.mongoose.connection);
    const owners = await ownerRepo.ownerModel.find({}, 'username name', { sort: { _id: 1 } }).exec();
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
    res.render('master/report/account', {
        owners: owners,
        hours: hours,
        minutes: minutes,
        title: 'アカウント別レポート出力',
        routeName: 'master.report.account',
        layout: 'layouts/master/layout'
    });
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

    // Responseヘッダセット
    const filename = getValue(req.query.reportType) === 'sales' ?
                     '売上げレポート' : 'アカウント別レポート';
    res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
    res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');

    try {
        // バリデーション(時分が片方のみ指定されていたらエラー)
        const errorMessage = await validate(req);
        if (errorMessage !== '') {
            throw new Error(errorMessage);
        }
        // 予約情報・キャンセル予約情報取得
        const reservations: any[] = await getReservations(getConditons(prmConditons, 'reservation'));
        let cancels: any[] = [];
        if (prmConditons.reportType === 'sales') {
            cancels = await getCancels(getConditons(prmConditons, 'cancel'));
        }
        const datas: any[] = Array.prototype.concat(reservations, cancels);

        // ソート
        if (datas.length > 0) {
            datas.sort((a: any, b: any) => {
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
        let results: any[] = [];
        if (datas.length > 0) {
            //検索結果編集
            results = datas.map((reservation) => {
                return getCsvData(reservation.payment_no) +
                    getCsvData(reservation.performance) +
                    getCsvData(reservation.seat_code) +
                    getCsvData(reservation.status) +
                    getCsvData(toYMDDB(reservation.performance_day)) +
                    getCsvData(reservation.performance_start_time) +
                    getCsvData(reservation.theater_name.ja) +
                    getCsvData(reservation.screen) +
                    getCsvData(reservation.screen_name.ja) +
                    getCsvData(reservation.film) +
                    getCsvData(reservation.film_name.ja) +
                    getCsvData(reservation.purchaser_group) +
                    getCsvData(reservation.purchaser_first_name) +
                    getCsvData(reservation.purchaser_last_name) +
                    getCsvData(reservation.purchaser_email) +
                    getCsvData(reservation.purchaser_tel) +
                    getCsvData(toString(reservation.purchased_at)) +
                    getCsvData(reservation.payment_method) +
                    getCsvData(reservation.seat_grade_name.ja) +
                    getCsvData(reservation.seat_grade_additional_charge) +
                    getCsvData(reservation.ticket_type_name.ja) +
                    getCsvData(reservation.ticket_ttts_extension.csv_code) +
                    getCsvData(reservation.charge) +
                    getCsvData(getCustomerGroup(reservation)) +
                    getCsvData(reservation.payment_seat_index) +
                    getCsvData(reservation.gmo_amount) +
                    getCsvData(reservation.window_user_id) +
                    getCsvData(reservation.checkins.length > 0 ? 'TRUE' : 'FALSE') +
                    getCsvData(reservation.checkins.length > 0 ? toString(reservation.checkins[0].when) : '', false);
            });
        }
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
 *
 * @param {any} req
 * @return {any}
 */
async function validate(req: Request): Promise<any> {
    // 検証
    const validatorResult = await req.getValidationResult();
    const errors: any = (!validatorResult.isEmpty()) ? req.validationErrors(true) : {};

    // 片方入力エラーチェック
    if (!isInputEven(req.query.start_hour1, req.query.start_minute1)) {
        (<any>errors).start_hour1 = {msg: '集計期間の時分Fromが片方しか指定されていません'};
    }
    if (!isInputEven(req.query.start_hour2, req.query.start_minute2)) {
        (<any>errors).start_hour2 = {msg: '集計期間の時分Toが片方しか指定されていません'};
    }
    let errorMessage: string = '';
    Object.keys(errors).forEach((key) => {
        if (errorMessage !== '') {errorMessage += csvLineFeed; }
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
function getConditons(prmConditons: any, dbType: string) : any {
    // 検索条件を作成
    const conditions: any = {};
    // 予約か否か
    const isReservation: boolean = (dbType === 'reservation');
    // レポートタイプが売上げか否か
    const isSales: boolean = prmConditons.reportType === 'sales';
    // 購入区分
    const purchaserGroup: string = isSales ?
        ttts.ReservationUtil.PURCHASER_GROUP_CUSTOMER : ttts.ReservationUtil.PURCHASER_GROUP_STAFF;

    // 予約
    if (isReservation) {
        // ステータス
        conditions.status = ttts.factory.reservationStatusType.ReservationConfirmed;
        // 購入区分
        conditions.purchaser_group = purchaserGroup;
        // アカウント
        if (prmConditons.owner_username !== null) {
            conditions.owner_username = prmConditons.owner_username;
        }
    } else {
        // キャンセルはsalesのみアカウント別はなし。
        // ステータス
        conditions.typeOf = ttts.factory.transactionType.ReturnOrder;
        // 購入区分
        conditions.object.transaction.object.purchaser_group = purchaserGroup;
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
            (isSales ? 'purchased_at' : 'updated_at') : 'createdAt';
        conditions[keyDate] = conditionsDate;

        // // 登録日From
        // if (prmConditons.performanceDayFrom !== null) {
        //     //conditionsDate.$gte =  toYMDDB(prmConditons.performanceDayFrom);
        //     conditionsDate.$gte =  toISOStringJapan(prmConditons.performanceDayFrom);
        // }
        // // 登録日To
        // if (prmConditons.performanceDayTo !== null) {
        //     //conditionsDate.$lte = toYMDDB(prmConditons.performanceDayTo);
        //     conditionsDate.$lt = toISOStringJapan(prmConditons.performanceDayTo, 1);
        // }
        //conditions[`${preKey}performance_day`] = conditionsDate;
        // const keyDate: string = dbType === 'reservation' ? 'updated_at' : 'created_at';
        // conditions[keyDate] = conditionsDate;
    }

    return conditions;
}
/**
 * 予約情報取得
 *
 * @param {any} conditions
 * @returns {Promise<any>}
 */
async function getReservations(conditions: any): Promise<any> {
    const reservationRepo = new ttts.repository.Reservation(ttts.mongoose.connection);
    const dataCount = await reservationRepo.reservationModel.count(conditions).exec();
    let reservations: any[] = [];
    if (dataCount > 0) {
        reservations = await reservationRepo.reservationModel.find(conditions).exec();
        reservations.map((reservation) => {
            reservation.status_sort = reservation.status;
        });
    }

    return reservations;
}
/**
 * キャンセル予約情報取得
 *
 * @param {any} conditions
 * @returns {Promise<any>}
 */
async function getCancels(conditions: any): Promise<any> {
    // 取引に対する返品リクエスト取得
    const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
    const returnOrderTransactions = await transactionRepo.transactionModel.find(
        conditions
    ).exec();

    // 予約情報をセット
    let cancels: any[] = [];
    const charges: number[] = [];
    for (const returnOrderTransaction of returnOrderTransactions) {
        const transaction = (<any>returnOrderTransaction).object._doc.transaction;
        const eventReservations = transaction.result.eventReservations;
        //const amount = transaction.object.authorizeActions[0].result.entryTranArgs.amount;
        const amount = eventReservations[0].charge;
        cancels = cancels.concat(eventReservations);
        // tslint:disable-next-line:prefer-for-of
        for (let indexCancel = 0; indexCancel < eventReservations.length; indexCancel += 1) {
            charges.push(amount);
        }
    }

    // キャンセルデータは1レコードで3行出力
    const reservations: any[] = [];
    let indexSet: number = 0;
    for (const cancelReservation of cancels) {
        // 予約データ
        cancelReservation.gmo_amount = charges[indexSet] ;
        cancelReservation.status_sort = '0';
        reservations.push(cancelReservation);
        // キャンセルデータ
        const cancelCan = copyModel(cancelReservation);
        cancelCan.purchased_at = cancelReservation.created_at;
        cancelCan.status = ttts.factory.reservationStatusType.ReservationCancelled;
        cancelCan.status_sort = '1';
        cancelCan.gmo_amount = charges[indexSet] ;
        reservations.push(cancelCan);
        // キャンセル料データ
        const cancelFee = copyModel(cancelReservation);
        cancelFee.purchased_at = cancelReservation.created_at;
        cancelFee.status = STATUS_CANCELLATION_FEE;
        cancelFee.status_sort = '2';
        //cancelFee.gmo_amount = cancelReservation.cancellation_fee;
        cancelFee.gmo_amount = cancelReservation.performance_ttts_extension.refund_status === ttts.PerformanceUtil.REFUND_STATUS.NONE ?
            CANCEL_CHARGE : CANCEL_CHARGE_REFUND;
        cancelFee.ticket_ttts_extension.csv_code = '';
        reservations.push(cancelFee);
        indexSet += 1;
    }

    return reservations;
}
/**
 * モデルコピー
 *
 * @param {any} model
 * @returns {any}
 */
function copyModel(model: any): any {
    const copiedModel: any = {};
    // オブジェクト判定
    const isObject = ((obj: any) => {
        return (obj !== null && typeof obj === 'object');
    });
    // プロパティコピー
    Object.getOwnPropertyNames(model).forEach((propertyName) => {
        copiedModel[propertyName] = isObject(model[propertyName]) ?
            copyModel(model[propertyName]) :
            copiedModel[propertyName] = model[propertyName];
    });

    return copiedModel;
}
/**
 * CSV出力用データ取得
 *
 * @param {any} value
 * @param {boolean} addSeparator
 * @returns {string}
 */
function getCsvData(value: string, addSeparator: boolean = true): string {
    // tslint:disable-next-line:no-console
    console.debug(value);
    value = convertToString(value);

    return `"${(!_.isEmpty(value) ? value : '')}"${(addSeparator ? csvSeparator : '')}`;
}
/**
 * 文字列変換
 *
 * @param {any} value
 * @returns {string}
 */
function convertToString(value: any): string {
    if (value === undefined) { return ''; }
    if (value === null) { return ''; }

    return value.toString();
}
/**
 * YYYY/MM/DD日付取得
 *
 * @param {string} dateStr('YYYYMMDD')
 * @returns {string} ('YYYY/MM/DD')
 */
// function toYMD(dateStr: string): string {
//     return moment(dateStr, 'YYYYMMDD').format('YYYY/MM/DD');
// }
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
 * HH:MM時刻取得
 *
 * @param {string} timeStr('HHMM')
 * @returns {string} ('HH:MM')
 */
// function toHM(timeStr: string): string {
//     // tslint:disable-next-line:no-magic-numbers
//     return `${timeStr.substr(0, 2)}:${timeStr.substr(2, 2)}`;
// }
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
    //return (date instanceof Date) ? moment(date).format('YYYY/MM/DD HH:mm:ss') : '';

    return moment(date).format('YYYY/MM/DD HH:mm:ss');
}
/**
 * 客層取得 (購入者居住国：2桁、年代：2桁、性別：1桁)
 *
 * @param {any} reservation
 * @returns {string}
 */
function getCustomerGroup(reservation: any): string {
    const locale = convertToString(reservation.purchaser_address);
    const age = convertToString(reservation.purchaser_age);
    const gender = convertToString(reservation.purchaser_gender);

    return (locale !== '' ? locale : '__') + (age !== '' ? age : '__') + (gender !== '' ? gender : '_');
}
