/**
 * レポート出力コントローラー
 *
 * @namespace controller/report
 */
import { Models } from '@motionpicture/ttts-domain';
import { ReservationUtil, ScreenUtil } from '@motionpicture/ttts-domain';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as _ from 'underscore';
// tslint:disable-next-line:no-var-requires no-require-imports
const jconv = require('jconv');

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
 * 売り上げレポート出力
 */
export async function index(__: Request, res: Response): Promise<void> {
    res.render('master/report/index', {
        displayId: 'Aa-9',
        title: '売り上げレポート出力',
        filmModel: {},
        layout: 'layouts/master/layout'
    });
}
/**
 * 一覧データ取得API
 */
export async function getSales(req: Request, res: Response): Promise<void> {
    // Responseヘッダセット
    const filename = '売り上げレポート';
    res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
    res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');

    // 登録日
    const performanceDayFrom: string = (!_.isEmpty(req.query.dateFrom)) ? req.query.dateFrom : null;
    const performanceDayTo: string = (!_.isEmpty(req.query.dateTo)) ? req.query.dateTo : null;

    try {
        // 予約情報・キャンセル予約情報取得
        const reservations: any[] = await getReservations(getConditons(performanceDayFrom, performanceDayTo, 'reservation'));
        const cancels: any[] = await getCancels(getConditons(performanceDayFrom, performanceDayTo, 'cancel'));
        const datas: any[] = Array.prototype.concat(reservations, cancels);

        // ソート昇順(上映日→開始時刻→座席番号)
        datas.sort((a, b) => {
            if (a.performance_day > b.performance_day) {
                return 1;
            }
            if (a.performance_day < b.performance_day) {
                return -1;
            }
            if (a.performance_start_time > b.performance_start_time) {
                return 1;
            }
            if (a.performance_start_time < b.performance_start_time) {
                return -1;
            }

            return ScreenUtil.sortBySeatCode(a.seat_code, b.seat_code);
        });
        let results: any[] = [];
        if ( datas.length > 0 ) {
            //検索結果編集
            results = datas.map((reservation) => {
                return getCsvData(reservation.payment_no) +
                    getCsvData(reservation.performance) +
                    getCsvData(reservation.seat_code) +
                    getCsvData(reservation.status) +
                    getCsvData(toYMD(reservation.performance_day)) +
                    getCsvData(toHM(reservation.performance_start_time)) +
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
                    getCsvData(reservation.ticket_notes) +
                    getCsvData(reservation.ticket_type_charge) +
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
 * 検索条件取得
 *
 * @param {string|null} performanceDayFrom
 * @param {string|null} performanceDayTo
 * @param {string} type
 * @returns {any}
 */
function getConditons(performanceDayFrom: string | null, performanceDayTo: string | null, typeDB: string) : any {
    // 検索条件を作成
    let conditions: any = {};
    if (performanceDayFrom !== null || performanceDayTo !== null) {
        const conditionsDate: any = {};
        // 登録日From
        if (performanceDayFrom !== null) {
            conditionsDate.$gte =  toYMDDB(performanceDayFrom);
        }
        // 登録日To
        if (performanceDayTo !== null) {
            conditionsDate.$lte = toYMDDB(performanceDayTo);
        }
        if (typeDB === 'reservation') {
            conditions = {
                status: ReservationUtil.STATUS_RESERVED,
                performance_day: conditionsDate
            };
            conditions.performance_day = conditionsDate;
        } else {
            // キャンセルデータではreservationの下に予約レコードが丸ごと入っている
            conditions = {
                'reservation.status': ReservationUtil.STATUS_RESERVED,
                'reservation.performance_day': conditionsDate
            };
        }
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
    const dataCount = await Models.Reservation.count(conditions).exec();
    let reservations: any[] = [];
    if (dataCount > 0) {
        reservations = await Models.Reservation.find(conditions).exec();
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
    const dataCount = await Models.CustomerCancelRequest.count(conditions).exec();
    const reservations: any[] = [];
    // そのまま＋予約ステータス：CANCELLED＋予約ステータス：CANCELLATION_FEEの3レコード作成
    if (dataCount > 0) {
        const cancels: any[] = await Models.CustomerCancelRequest.find(conditions).exec();
        // reservations = cancels.map((cancel) => {
        //     cancel.reservation.cancelled_at = cancel.created_at;
        // tslint:disable-next-line:max-line-length
        //     cancel.reservation.status = (cancel.reservation.purchaser_group === ReservationUtil.PURCHASER_GROUP_STAFF) ? ReservationUtil.STATUS_CANCELLATION_FEE : ReservationUtil.STATUS_CANCELLED;
        //     //cancel.reservation.status = 'CANCELLED'; //@@@@@@@@@@

        //     return cancel.reservation;
        // });
        cancels.map((cancel) => {
            const cancelReservation = cancel.reservation;
            // 予約データ
            reservations.push(cancelReservation);
            // キャンセルデータ
            const cancelCan = copyModel(cancelReservation);
            cancelCan.purchased_at = cancel.created_at;
            cancelCan.status = ReservationUtil.STATUS_CANCELLED;
            reservations.push(cancelCan);
            // キャンセル料データ
            const cancelFee = copyModel(cancelReservation);
            cancelFee.purchased_at = cancel.created_at;
            cancelFee.status = ReservationUtil.STATUS_CANCELLATION_FEE;
            cancelFee.gmo_amount = cancel.cancellation_fee;
            reservations.push(cancelFee);
        });
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
    Object.getOwnPropertyNames(model).forEach((propertyName) => {
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
    value = convertToString(value);
    // // tslint:disable-next-line:no-console
    // console.debug(value);

    //return `"${((!_.isEmpty(value) ? value : '') + '"')}${(addSeparator ? csvSeparator : '')}`;
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
function toYMD(dateStr: string): string {
    return moment(dateStr, 'YYYYMMDD').format('YYYY/MM/DD');
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
 * HH:MM時刻取得
 *
 * @param {string} timeStr('HHMM')
 * @returns {string} ('HH:MM')
 */
function toHM(timeStr: string): string {
    // tslint:disable-next-line:no-magic-numbers
    return `${timeStr.substr(0, 2)}:${timeStr.substr(2, 2)}`;
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
