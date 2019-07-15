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
 */
const ttts = require("@motionpicture/ttts-domain");
const createDebug = require("debug");
const fastCsv = require("fast-csv");
const http_status_1 = require("http-status");
const iconv = require("iconv-lite");
const moment = require("moment-timezone");
const _ = require("underscore");
const debug = createDebug('ttts-backend:controllers');
// const POS_CLIENT_ID = process.env.POS_CLIENT_ID;
// const TOP_DECK_OPEN_DATE = process.env.TOP_DECK_OPEN_DATE;
const RESERVATION_START_DATE = process.env.RESERVATION_START_DATE;
const EXCLUDE_STAFF_RESERVATION = process.env.EXCLUDE_STAFF_RESERVATION === '1';
const sortReport4Sales = {
    'performance.startDay': 1,
    'performance.startTime': 1,
    payment_no: 1,
    reservationStatus: -1,
    'seat.code': 1,
    status_sort: 1
};
// カラム区切り(タブ)
const CSV_DELIMITER = '\t';
// 改行コード(CR+LF)
const CSV_LINE_ENDING = '\r\n';
var ReportType;
(function (ReportType) {
    ReportType["Sales"] = "Sales";
})(ReportType = exports.ReportType || (exports.ReportType = {}));
/**
 * 集計済みデータ取得API
 */
// tslint:disable-next-line:max-func-body-length
function getAggregateSales(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('query:', req.query);
        const dateFrom = getValue(req.query.dateFrom);
        const dateTo = getValue(req.query.dateTo);
        const eventStartFrom = getValue(req.query.eventStartFrom);
        const eventStartThrough = getValue(req.query.eventStartThrough);
        const conditions = [];
        let filename = 'DefaultReportName';
        try {
            switch (req.query.reportType) {
                case ReportType.Sales:
                    conditions.push({ aggregateUnit: 'SalesByEndDate' });
                    if (EXCLUDE_STAFF_RESERVATION) {
                        // 代理予約は除外
                        conditions.push({
                            'customer.group': {
                                $exists: true,
                                $eq: '01'
                            }
                        });
                    }
                    filename = '売上レポート';
                    break;
                default:
                    throw new Error(`${req.query.reportType}は非対応レポートタイプです`);
            }
            if (dateFrom !== null || dateTo !== null) {
                const minEndFrom = (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
                // 登録日From
                if (dateFrom !== null) {
                    // 売上げ
                    const endFrom = moment(`${getValue(req.query.dateFrom)}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                    conditions.push({
                        date_bucket: { $gte: moment.max(endFrom, minEndFrom).toDate() }
                    });
                }
                // 登録日To
                if (dateTo !== null) {
                    // 売上げ
                    conditions.push({
                        date_bucket: { $lt: moment(`${dateTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'days').toDate() }
                    });
                }
            }
            if (eventStartFrom !== null) {
                conditions.push({
                    'performance.startDay': {
                        $gte: moment(`${eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').tz('Asia/Tokyo').format('YYYYMMDD')
                    }
                });
            }
            if (eventStartThrough !== null) {
                conditions.push({
                    'performance.startDay': {
                        $lt: moment(`${eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ')
                            .add(1, 'day').tz('Asia/Tokyo').format('YYYYMMDD')
                    }
                });
            }
            // 集計データにストリーミングcursorを作成する
            const aggregateSaleRepo = new ttts.repository.AggregateSale(ttts.mongoose.connection);
            debug('finding aggregateSales...', conditions);
            const cursor = aggregateSaleRepo.aggregateSaleModel.find({ $and: conditions }).sort(sortReport4Sales).cursor();
            // Mongoドキュメントをcsvデータに変換するtransformer
            const transformer = (doc) => {
                // Return an object with all fields you need in the CSV
                return {
                    購入番号: doc.payment_no,
                    パフォーマンスID: doc.performance.id,
                    座席コード: doc.seat.code,
                    予約ステータス: doc.reservationStatus,
                    入塔予約年月日: doc.performance.startDay,
                    入塔予約時刻: doc.performance.startTime,
                    劇場名称: doc.theater.name,
                    スクリーンID: doc.screen.id,
                    スクリーン名: doc.screen.name,
                    作品ID: doc.film.id,
                    作品名称: doc.film.name,
                    購入者区分: doc.customer.group,
                    '購入者（名）': doc.customer.givenName,
                    '購入者（姓）': doc.customer.familyName,
                    購入者メール: doc.customer.email,
                    購入者電話: doc.customer.telephone,
                    購入日時: moment(doc.orderDate).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss'),
                    決済方法: doc.paymentMethod,
                    座席グレード名称: doc.seat.gradeName,
                    座席グレード追加料金: doc.seat.gradeAdditionalCharge,
                    券種名称: doc.ticketType.name,
                    チケットコード: doc.ticketType.csvCode,
                    券種料金: doc.ticketType.charge,
                    客層: doc.customer.segment,
                    payment_seat_index: doc.payment_seat_index,
                    予約単位料金: doc.price,
                    ユーザーネーム: doc.customer.username,
                    入場フラグ: doc.checkedin,
                    入場日時: doc.checkedin === 'TRUE' ? moment(doc.checkinDate).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss') : ''
                };
            };
            // const fields = [
            //     'paymentNo', 'performance.id', 'seat.code', 'reservationStatus',
            //     'performance.startDay', 'performance.startTime', 'theater.name', 'screen.id', 'screen.name', 'film.id', 'film.name',
            //     'customer.group', 'customer.givenName', 'customer.familyName', 'customer.email', 'customer.telephone',
            //     'orderDate', 'paymentMethod',
            //     'seat.gradeName', 'seat.gradeAdditionalCharge', 'ticketType.name', 'ticketType.csvCode', 'ticketType.charge',
            //     'customer.segment', 'paymentSeatIndex', 'price', 'customer.username', 'checkedin', 'checkinDate'
            // ];
            // const fieldNames = [
            //     '購入番号', 'パフォーマンスID', '座席コード', '予約ステータス',
            //     '入塔予約年月日', '入塔予約時刻', '劇場名称', 'スクリーンID', 'スクリーン名', '作品ID', '作品名称',
            //     '購入者区分', '購入者（名）', '購入者（姓）', '購入者メール', '購入者電話',
            //     '購入日時', '決済方法',
            //     '座席グレード名称', '座席グレード追加料金', '券種名称', 'チケットコード', '券種料金',
            //     '客層', 'payment_seat_index', '予約単位料金', 'ユーザーネーム', '入場フラグ', '入場日時'
            // ];
            // Set approrpiate download headers
            // res.setHeader('Content-disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
            res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');
            res.writeHead(http_status_1.OK, { 'Content-Type': 'text/csv; charset=Shift_JIS' });
            // Flush the headers before we start pushing the CSV content
            res.flushHeaders();
            // Create a Fast CSV stream which transforms documents to objects
            const csvStream = fastCsv
                .createWriteStream({
                headers: true,
                delimiter: CSV_DELIMITER,
                quoteColumns: true,
                rowDelimiter: CSV_LINE_ENDING
                // includeEndRowDelimiter: true
                // quote: '"',
                // escape: '"'
            })
                .transform(transformer);
            // .setEncoding("utf8")
            // res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
            // res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');
            // Pipe/stream the query result to the response via the CSV transformer stream
            // sjisに変換して流し込む
            cursor.pipe(csvStream)
                .pipe(iconv.decodeStream('utf-8'))
                .pipe(iconv.encodeStream('windows-31j'))
                .pipe(res);
        }
        catch (error) {
            res.send(error.message);
        }
    });
}
exports.getAggregateSales = getAggregateSales;
/**
 * 入力値取得(空文字はnullに変換)
 * @param {string|null} inputValue
 * @returns {string|null}
 */
function getValue(inputValue) {
    // tslint:disable-next-line:no-null-keyword
    return (!_.isEmpty(inputValue)) ? inputValue : null;
}
