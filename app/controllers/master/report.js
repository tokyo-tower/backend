"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * レポート出力コントローラー
 *
 * @namespace controller/report
 */
const ttts_domain_1 = require("@motionpicture/ttts-domain");
const ttts_domain_2 = require("@motionpicture/ttts-domain");
const moment = require("moment");
const _ = require("underscore");
// tslint:disable-next-line:no-var-requires no-require-imports
const jconv = require('jconv');
// カラム区切り(タブ)
const csvSeparator = '\t';
// 改行コード(CR+LF)
const csvLineFeed = '\r\n';
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
function index(__, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.render('master/report/index', {
            displayId: 'Aa-9',
            title: '売り上げレポート出力',
            filmModel: {},
            layout: 'layouts/master/layout'
        });
    });
}
exports.index = index;
/**
 *
 * アカウント別レポート出力
 */
function account(__, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // アカウント一覧取得
        const owners = yield ttts_domain_1.Models.Owner.find({}, '_id name', { sort: { _id: 1 } }).exec();
        const hours = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let hour = 0; hour < 24; hour += 1) {
            // tslint:disable-next-line:no-magic-numbers
            hours.push((`00${hour}`).slice(-2));
        }
        //const minutes: string[] = ['00', '15', '30', '45'];
        const minutes = [];
        // tslint:disable-next-line:no-magic-numbers
        for (let minute = 0; minute < 60; minute += 1) {
            // tslint:disable-next-line:no-magic-numbers
            minutes.push((`00${minute}`).slice(-2));
        }
        // 画面描画
        res.render('master/report/account', {
            owners: owners,
            hours: hours,
            minutes: minutes,
            displayId: 'Aa-10',
            title: 'アカウント別レポート出力',
            filmModel: {},
            layout: 'layouts/master/layout'
        });
    });
}
exports.account = account;
/**
 * 一覧データ取得API
 */
// tslint:disable-next-line:max-func-body-length
function getSales(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 引数セット
        const prmConditons = {};
        prmConditons.reportType = getValue(req.query.reportType);
        // 登録日
        prmConditons.performanceDayFrom = getValue(req.query.dateFrom);
        prmConditons.performanceDayTo = getValue(req.query.dateTo);
        // アカウント
        prmConditons.owner = getValue(req.query.owner);
        // 時刻From
        prmConditons.performanceStartHour1 = getValue(req.query.start_hour1);
        prmConditons.performanceStartMinute1 = getValue(req.query.start_minute1);
        // 時刻To
        prmConditons.performanceStartHour2 = getValue(req.query.start_hour2);
        prmConditons.performanceStartMinute2 = getValue(req.query.start_minute2);
        // Responseヘッダセット
        const filename = getValue(req.query.reportType) === 'sales' ?
            '売上げレポート' : 'アカウント別レポート';
        res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.csv`)}`);
        res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');
        try {
            // バリデーション(時分が片方のみ指定されていたらエラー)
            const errorMessage = yield validate(req);
            if (errorMessage !== '') {
                throw new Error(errorMessage);
            }
            // 予約情報・キャンセル予約情報取得
            const reservations = yield getReservations(getConditons(prmConditons, 'reservation'));
            const cancels = yield getCancels(getConditons(prmConditons, 'cancel'));
            const datas = Array.prototype.concat(reservations, cancels);
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
                return ttts_domain_2.ScreenUtil.sortBySeatCode(a.seat_code, b.seat_code);
            });
            let results = [];
            if (datas.length > 0) {
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
        }
        catch (error) {
            const message = error.message;
            res.write(message);
            res.end();
        }
    });
}
exports.getSales = getSales;
/**
 * レポート出力検証
 *
 * @param {any} req
 * @return {any}
 */
function validate(req) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検証
        const validatorResult = yield req.getValidationResult();
        const errors = (!validatorResult.isEmpty()) ? req.validationErrors(true) : {};
        // 片方入力エラーチェック
        if (!isInputEven(req.query.start_hour1, req.query.start_minute1)) {
            errors.start_hour1 = { msg: '集計期間の時分Fromが片方しか指定されていません' };
        }
        if (!isInputEven(req.query.start_hour2, req.query.start_minute2)) {
            errors.start_hour2 = { msg: '集計期間の時分Toが片方しか指定されていません' };
        }
        let errorMessage = '';
        Object.keys(errors).forEach((key) => {
            if (errorMessage !== '') {
                errorMessage += csvLineFeed;
            }
            errorMessage += errors[key].msg;
        });
        return errorMessage;
    });
}
/**
 * 両方入力チェック(両方入力、または両方未入力の時true)
 *
 * @param {string} value1
 * @param {string} value2
 * @return {boolean}
 */
function isInputEven(value1, value2) {
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
function getValue(inputValue) {
    return (!_.isEmpty(inputValue)) ? inputValue : null;
}
/**
 * 検索条件取得
 *
 * @param {any} prmConditons
 * @param {string} dbType
 * @returns {any}
 */
function getConditons(prmConditons, dbType) {
    // 検索条件を作成
    const conditions = {};
    // キャンセルデータではreservationの下に予約レコードが丸ごと入っている
    const preKey = dbType === 'reservation' ? '' : 'reservation.';
    // レポートタイプが売上げか否か
    const isSales = prmConditons.reportType === 'sales';
    // ステータス
    conditions[`${preKey}status`] = ttts_domain_2.ReservationUtil.STATUS_RESERVED;
    // GMO項目の有無: 売上げ:true,アカウント別:false
    conditions[`${preKey}gmo_order_id`] = { $exists: isSales };
    // アカウント
    if (prmConditons.owner !== null) {
        conditions[`${preKey}owner`] = prmConditons.owner;
    }
    // 集計期間
    if (prmConditons.performanceDayFrom !== null || prmConditons.performanceDayTo !== null) {
        const conditionsDate = {};
        // 登録日From
        if (prmConditons.performanceDayFrom !== null) {
            if (isSales) {
                // 売上げ
                conditionsDate.$gte = (dbType === 'reservation') ?
                    toYMDDB(prmConditons.performanceDayFrom) :
                    toISOStringJapan(prmConditons.performanceDayFrom);
            }
            else {
                // アカウント別
                const timeWk = `${prmConditons.performanceDayFrom} ` +
                    `${prmConditons.performanceStartHour1}` +
                    `${prmConditons.performanceStartMinute1}`;
                conditionsDate.$gte = toISOStringUTC(timeWk);
            }
        }
        // 登録日To
        if (prmConditons.performanceDayTo !== null) {
            if (isSales) {
                // 売上げ
                if (dbType === 'reservation') {
                    conditionsDate.$lte = toYMDDB(prmConditons.performanceDayTo);
                }
                else {
                    conditionsDate.$lt = toISOStringJapan(prmConditons.performanceDayTo, 1);
                }
            }
            else {
                // アカウント別
                const timeWk = `${prmConditons.performanceDayTo} ` +
                    `${prmConditons.performanceStartHour2}` +
                    `${prmConditons.performanceStartMinute2}`;
                conditionsDate.$lt = toISOStringUTC(timeWk, 1);
            }
        }
        const keyDate = dbType === 'reservation' ?
            (isSales ? 'gmo_tran_date' : 'updated_at') : 'created_at';
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
function getReservations(conditions) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataCount = yield ttts_domain_1.Models.Reservation.count(conditions).exec();
        let reservations = [];
        if (dataCount > 0) {
            reservations = yield ttts_domain_1.Models.Reservation.find(conditions).exec();
        }
        return reservations;
    });
}
/**
 * キャンセル予約情報取得
 *
 * @param {any} conditions
 * @returns {Promise<any>}
 */
function getCancels(conditions) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataCount = yield ttts_domain_1.Models.CustomerCancelRequest.count(conditions).exec();
        const reservations = [];
        // そのまま＋予約ステータス：CANCELLED＋予約ステータス：CANCELLATION_FEEの3レコード作成
        if (dataCount > 0) {
            const cancels = yield ttts_domain_1.Models.CustomerCancelRequest.find(conditions).exec();
            cancels.map((cancel) => {
                const cancelReservation = cancel.reservation;
                // 予約データ
                reservations.push(cancelReservation);
                // キャンセルデータ
                const cancelCan = copyModel(cancelReservation);
                cancelCan.purchased_at = cancel.created_at;
                cancelCan.status = ttts_domain_2.ReservationUtil.STATUS_CANCELLED;
                reservations.push(cancelCan);
                // キャンセル料データ
                const cancelFee = copyModel(cancelReservation);
                cancelFee.purchased_at = cancel.created_at;
                cancelFee.status = ttts_domain_2.ReservationUtil.STATUS_CANCELLATION_FEE;
                cancelFee.gmo_amount = cancel.cancellation_fee;
                reservations.push(cancelFee);
            });
        }
        return reservations;
    });
}
/**
 * モデルコピー
 *
 * @param {any} model
 * @returns {any}
 */
function copyModel(model) {
    const copiedModel = {};
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
function getCsvData(value, addSeparator = true) {
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
function convertToString(value) {
    if (value === undefined) {
        return '';
    }
    if (value === null) {
        return '';
    }
    return value.toString();
}
/**
 * YYYY/MM/DD日付取得
 *
 * @param {string} dateStr('YYYYMMDD')
 * @returns {string} ('YYYY/MM/DD')
 */
function toYMD(dateStr) {
    return moment(dateStr, 'YYYYMMDD').format('YYYY/MM/DD');
}
/**
 * YYYYMMDD日付取得
 *
 * @param {string} dateStr('YYYY/MM/DD')
 * @returns {string} ('YYYYMMDD')
 */
function toYMDDB(dateStr) {
    return moment(dateStr, 'YYYY/MM/DD').format('YYYYMMDD');
}
/**
 * DB検索用ISO日付取得
 *
 * @param {string} dateStr
 * @param {number} addDay
 * @returns {string}
 */
function toISOStringJapan(dateStr, addDay = 0) {
    const dateWk = moment(dateStr, 'YYYY/MM/DD').add(addDay, 'days').format('YYYY-MM-DD');
    return `${dateWk}T00:00:00+09:00`;
}
/**
 * DB検索用ISO日付+時分取得
 *
 * @param {string} dateStr
 * @param {number} addMinute
 * @returns {string}
 */
function toISOStringUTC(dateStr, addMinute = 0) {
    // tslint:disable-next-line:no-magic-numbers
    const gtc = moment(dateStr, 'YYYY/MM/DD HHmm').add(-9, 'hours').add(addMinute, 'minutes');
    const dateWk = gtc.format('YYYY-MM-DD');
    const timeWk = gtc.format('HH:mm:ss');
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
function toHM(timeStr) {
    // tslint:disable-next-line:no-magic-numbers
    return `${timeStr.substr(0, 2)}:${timeStr.substr(2, 2)}`;
}
/**
 * YYYY/MM/DD HH:mm:ss 日時取得
 *
 * @param {Date} date
 * @returns {string} ('YYYY/MM/DD HH:mm:ss')
 */
function toString(date) {
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
function getCustomerGroup(reservation) {
    const locale = convertToString(reservation.purchaser_address);
    const age = convertToString(reservation.purchaser_age);
    const gender = convertToString(reservation.purchaser_gender);
    return (locale !== '' ? locale : '__') + (age !== '' ? age : '__') + (gender !== '' ? gender : '_');
}
