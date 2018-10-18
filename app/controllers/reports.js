"use strict";
/**
 * レポート出力コントローラー
 * @namespace controllers.report
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ttts = require("@motionpicture/ttts-domain");
const createDebug = require("debug");
const fastCsv = require("fast-csv");
const http_status_1 = require("http-status");
const iconv = require("iconv-lite");
const json2csv = require("json2csv");
const moment = require("moment-timezone");
const _ = require("underscore");
// tslint:disable-next-line:no-var-requires no-require-imports
const jconv = require('jconv');
const debug = createDebug('ttts-backend:controllers:report');
const POS_CLIENT_ID = process.env.POS_CLIENT_ID;
const TOP_DECK_OPEN_DATE = process.env.TOP_DECK_OPEN_DATE;
const RESERVATION_START_DATE = process.env.RESERVATION_START_DATE;
const sortReport4Sales = {
    'performance.startDay': 1,
    'performance.startTime': 1,
    payment_no: 1,
    reservationStatus: -1,
    'seat.code': 1,
    status_sort: 1
};
// CSV用のステータスコード
var Status4csv;
(function (Status4csv) {
    Status4csv["Reserved"] = "RESERVED";
    Status4csv["Cancelled"] = "CANCELLED";
    // キャンセル行ステータス
    Status4csv["CancellationFee"] = "CANCELLATION_FEE";
})(Status4csv || (Status4csv = {}));
const purchaserGroupStrings = {
    Customer: '01',
    Staff: '04'
};
const paymentMethodStrings = {
    CreditCard: '0'
};
// カラム区切り(タブ)
const CSV_DELIMITER = '\t';
// 改行コード(CR+LF)
const CSV_LINE_ENDING = '\r\n';
/**
 * 一覧データ取得API
 */
// tslint:disable-next-line:max-func-body-length
function getSales(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 引数セット
        const prmConditons = {
            reportType: getValue(req.query.reportType),
            performanceDayFrom: getValue(req.query.dateFrom),
            performanceDayTo: getValue(req.query.dateTo),
            eventStartFrom: getValue(req.query.eventStartFrom),
            eventStartThrough: getValue(req.query.eventStartThrough),
            owner_username: getValue(req.query.owner_username),
            performanceStartHour1: getValue(req.query.start_hour1),
            performanceStartMinute1: getValue(req.query.start_minute1),
            performanceStartHour2: getValue(req.query.start_hour2),
            performanceStartMinute2: getValue(req.query.start_minute2)
        };
        let filename = 'DefaultReport';
        try {
            // バリデーション(時分が片方のみ指定されていたらエラー)
            const errorMessage = yield validate(req);
            if (errorMessage !== '') {
                throw new Error(errorMessage);
            }
            // 予約情報・キャンセル予約情報取得
            let placeOrderTransactions;
            let returnOrderTransactions;
            let reservations = [];
            let cancels = [];
            switch (prmConditons.reportType) {
                case 'sales':
                    filename = '売上げレポート';
                    const reservationsOnOrderDate = yield searchReservations({
                        orderFrom: moment(`${prmConditons.performanceDayFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').toDate(),
                        orderThrough: moment(`${prmConditons.performanceDayTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'day').toDate()
                    });
                    placeOrderTransactions = yield searchPlaceOrderTransactions4reportByEndDate(prmConditons);
                    returnOrderTransactions = yield searchReturnOrderTransactions4reportByEndDate(prmConditons);
                    reservations = placeOrderTransactions2reservationDatas({
                        placeOrderTransactions: placeOrderTransactions,
                        reservations: reservationsOnOrderDate
                    });
                    cancels = returnOrderTransactions2cancelDatas({
                        returnOrderTransactions: returnOrderTransactions,
                        reservations: reservationsOnOrderDate
                    });
                    break;
                case 'salesByEventStartDate':
                    filename = '売上げレポート';
                    const reservationsOnEventDate = yield searchReservations({
                        eventStartFrom: moment(`${prmConditons.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').toDate(),
                        eventStartThrough: moment(`${prmConditons.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ')
                            .add(1, 'day').toDate()
                    });
                    placeOrderTransactions = yield searchPlaceOrderTransactions4reportByEventStartDate(prmConditons);
                    returnOrderTransactions = yield searchReturnOrderTransactions4reportByEventStartDate(prmConditons);
                    reservations = placeOrderTransactions2reservationDatas({
                        placeOrderTransactions: placeOrderTransactions,
                        reservations: reservationsOnEventDate
                    });
                    cancels = returnOrderTransactions2cancelDatas({
                        returnOrderTransactions: returnOrderTransactions,
                        reservations: reservationsOnEventDate
                    });
                    break;
                case 'salesByAccount':
                    filename = 'アカウント別レポート';
                    throw new Error('implementing...');
                // placeOrderTransactions = await searchPlaceOrderTransactions4reportByAccount(prmConditons);
                // reservations = await placeOrderTransactions2reservationDatas(placeOrderTransactions);
                // break;
                default:
            }
            const datas = [...reservations, ...cancels];
            // ソート
            if (datas.length > 0) {
                datas.sort((a, b) => {
                    // 入塔日
                    if (a.performance.startDay > b.performance.startDay) {
                        return 1;
                    }
                    if (a.performance.startDay < b.performance.startDay) {
                        return -1;
                    }
                    // 開始時間
                    if (a.performance.startTime > b.performance.startTime) {
                        return 1;
                    }
                    if (a.performance.startTime < b.performance.startTime) {
                        return -1;
                    }
                    // 購入番号
                    if (a.paymentNo > b.paymentNo) {
                        return 1;
                    }
                    if (a.paymentNo < b.paymentNo) {
                        return -1;
                    }
                    // CANCELLATION_FEEは購入の最後の行
                    if (a.reservationStatus === Status4csv.CancellationFee) {
                        return 1;
                    }
                    if (b.reservationStatus === Status4csv.CancellationFee) {
                        return -1;
                    }
                    if (a.seat.code > b.seat.code) {
                        return 1;
                    }
                    if (a.seat.code < b.seat.code) {
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
            const fields = [
                'paymentNo', 'performance.id', 'seat.code', 'reservationStatus',
                'performance.startDay', 'performance.startTime', 'theater.name', 'screen.id', 'screen.name', 'film.id', 'film.name',
                'customer.group', 'customer.givenName', 'customer.familyName', 'customer.email', 'customer.telephone',
                'orderDate', 'paymentMethod',
                'seat.gradeName', 'seat.gradeAdditionalCharge', 'ticketType.name', 'ticketType.csvCode', 'ticketType.charge',
                'customer.segment', 'paymentSeatIndex', 'price', 'customer.username', 'checkedin', 'checkinDate'
            ];
            const fieldNames = [
                '購入番号', 'パフォーマンスID', '座席コード', '予約ステータス',
                '入塔予約年月日', '入塔予約時刻', '劇場名称', 'スクリーンID', 'スクリーン名', '作品ID', '作品名称',
                '購入者区分', '購入者（名）', '購入者（姓）', '購入者メール', '購入者電話',
                '購入日時', '決済方法',
                '座席グレード名称', '座席グレード追加料金', '券種名称', 'チケットコード', '券種料金',
                '客層', 'payment_seat_index', '予約単位料金', 'ユーザーネーム', '入場フラグ', '入場日時'
            ];
            const output = json2csv({
                data: datas,
                fields: fields,
                fieldNames: fieldNames,
                del: CSV_DELIMITER,
                newLine: CSV_LINE_ENDING,
                quotes: '"',
                defaultValue: '',
                flatten: true,
                preserveNewLinesInValues: true
            });
            debug(`writing ${output.length} character(s) to response...`);
            // Responseヘッダセット
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
            res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');
            res.write(jconv.convert(output, 'UTF8', 'SJIS'));
            res.end();
        }
        catch (error) {
            const message = error.message;
            res.send(message);
        }
    });
}
exports.getSales = getSales;
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
        // Name of the downloaded file - e.g. "Download.csv"
        let filename = 'DefaultReport';
        switch (getValue(req.query.reportType)) {
            case 'sales':
                conditions.push({ aggregateUnit: 'SalesByEndDate' });
                filename = '（購入日）売上レポート';
                // if (dateFrom !== null || dateTo !== null) {
                //     conditions.date_bucket = {};
                //     const minEndFrom =
                //         (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
                //     // 登録日From
                //     if (dateFrom !== null) {
                //         // 売上げ
                //         const endFrom = moment(`${getValue(req.query.dateFrom)}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                //         conditions.date_bucket.$gte = moment.max(endFrom, minEndFrom).toDate();
                //     }
                //     // 登録日To
                //     if (dateTo !== null) {
                //         // 売上げ
                //         conditions.date_bucket.$lt =
                //             moment(`${dateTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'days').toDate();
                //     }
                // }
                break;
            case 'salesByEventStartDate':
                conditions.push({ aggregateUnit: 'SalesByEventStartDate' });
                filename = '（来塔予定日）売上レポート';
                // if (dateFrom !== null || dateTo !== null) {
                //     conditions.performance = { startDay: {} };
                //     const minEndFrom =
                //         (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
                //     // 登録日From
                //     if (dateFrom !== null) {
                //         // 売上げ
                //         const endFrom = moment(`${getValue(req.query.dateFrom)}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                //         conditions.performance.startDay.$gte = moment.max(endFrom, minEndFrom).format("YYYYMMDD");
                //     }
                //     // 登録日To
                //     if (dateTo !== null) {
                //         // 売上げ
                //         conditions.performance.startDay.$lt =
                //             moment(`${dateTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'days').format("YYYYMMDD");
                //     }
                // }
                break;
            case 'salesByAccount':
                break;
            default:
        }
        try {
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
            const aggregateSaleRepo = new ttts.repository.AggregateSale(ttts.mongoose.connection);
            debug('finding aggregateSales...', conditions);
            const cursor = aggregateSaleRepo.aggregateSaleModel.find({ $and: conditions }).sort(sortReport4Sales).cursor();
            // const client = await mongodb.MongoClient.connect(conStr);
            // const db = await client.db("ttts-preview")
            // const collection = await db.collection("transactions")
            // let cursor = await collection.find(conditions)
            // The transformer function
            const transformer = (doc) => {
                // Return an object with all fields you need in the CSV
                // For example ...
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
                    購入日時: moment(doc.orderDate).format('YYYY/MM/DD HH:mm:ss'),
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
                    入場日時: doc.checkedin === 'TRUE' ? moment(doc.checkinDate).format('YYYY/MM/DD HH:mm:ss') : ''
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
            //sjisに変換して流し込む
            cursor
                .pipe(csvStream)
                .pipe(iconv.decodeStream('utf-8'))
                .pipe(iconv.encodeStream('windows-31j'))
                .pipe(res);
        }
        catch (error) {
            const message = error.message;
            res.send(message);
        }
    });
}
exports.getAggregateSales = getAggregateSales;
/**
 * レポート出力検証
 * @param {Request} req
 * @return {any}
 */
function validate(req) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検証
        const validatorResult = yield req.getValidationResult();
        const errors = (!validatorResult.isEmpty()) ? validatorResult.mapped : {};
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
                errorMessage += CSV_LINE_ENDING;
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
function searchPlaceOrderTransactions4reportByEndDate(searchConditions) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: ttts.factory.transactionType.PlaceOrder,
            status: ttts.factory.transactionStatusType.Confirmed,
            'object.purchaser_group': {
                $exists: true,
                $eq: ttts.factory.person.Group.Customer
            }
        };
        if (POS_CLIENT_ID !== undefined) {
            // POS購入除外(一時的に除外機能オフ)
            // conditions['agent.id'] = { $ne: POS_CLIENT_ID };
        }
        // 集計期間
        // 予約開始日時の設定があれば、それ以前は除外
        const minEndFrom = (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
        const conditionsDate = {
            $exists: true,
            $gte: minEndFrom.toDate()
        };
        if (searchConditions.performanceDayFrom !== null || searchConditions.performanceDayTo !== null) {
            // 登録日From
            if (searchConditions.performanceDayFrom !== null) {
                // 売上げ
                const endFrom = moment(`${searchConditions.performanceDayFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                conditionsDate.$gte = moment.max(endFrom, minEndFrom).toDate();
            }
            // 登録日To
            if (searchConditions.performanceDayTo !== null) {
                // 売上げ
                conditionsDate.$lt =
                    moment(`${searchConditions.performanceDayTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'days').toDate();
            }
        }
        conditions.endDate = conditionsDate;
        debug('finding transactions...', conditions);
        const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        const transactions = yield transactionRepo.transactionModel.find(conditions).exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
        debug(`${transactions.length} transactions found.`);
        return transactions;
    });
}
function searchReturnOrderTransactions4reportByEndDate(searchConditions) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: ttts.factory.transactionType.ReturnOrder,
            status: ttts.factory.transactionStatusType.Confirmed,
            'object.transaction.object.purchaser_group': {
                $exists: true,
                $eq: ttts.factory.person.Group.Customer
            }
        };
        if (POS_CLIENT_ID !== undefined) {
            // POS購入除外(一時的に除外機能オフ)
            // conditions['object.transaction.agent.id'] = { $ne: POS_CLIENT_ID };
        }
        // 集計期間
        // 予約開始日時の設定があれば、それ以前は除外
        const minEndFrom = (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
        const conditionsDate = {
            $exists: true,
            $gte: minEndFrom.toDate()
        };
        if (searchConditions.performanceDayFrom !== null || searchConditions.performanceDayTo !== null) {
            // 登録日From
            if (searchConditions.performanceDayFrom !== null) {
                // 売上げ
                const endFrom = moment(`${searchConditions.performanceDayFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
                conditionsDate.$gte = moment.max(endFrom, minEndFrom).toDate();
            }
            // 登録日To
            if (searchConditions.performanceDayTo !== null) {
                // 売上げ
                conditionsDate.$lt =
                    moment(`${searchConditions.performanceDayTo}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'days').toDate();
            }
        }
        conditions.endDate = conditionsDate;
        debug('finding transactions...', conditions);
        const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        const transactions = yield transactionRepo.transactionModel.find(conditions).exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
        debug(`${transactions.length} transactions found.`);
        return transactions;
    });
}
/*
async function searchPlaceOrderTransactions4reportByAccount(
    searchConditions: ISearchSalesConditions
): Promise<ttts.factory.transaction.placeOrder.ITransaction[]> {
    // 検索条件を作成
    const conditions: any = {
        typeOf: ttts.factory.transactionType.PlaceOrder,
        status: ttts.factory.transactionStatusType.Confirmed,
        'object.purchaser_group': {
            $exists: true,
            $eq: ttts.factory.person.Group.Staff
        }
    };

    if (POS_CLIENT_ID !== undefined) {
        // POS購入除外(一時的に除外機能オフ)
        // conditions['agent.id'] = { $ne: POS_CLIENT_ID };
    }

    // アカウント
    if (searchConditions.owner_username !== null) {
        conditions['result.eventReservations.owner_username'] = {
            $exists: true,
            $eq: searchConditions.owner_username
        };
    }

    // 集計期間
    // 予約開始日時の設定があれば、それ以前は除外
    const minEndFrom =
        (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01T00:00:00Z');
    const conditionsDate: any = {
        $exists: true,
        $gte: minEndFrom.toDate()
    };
    if (searchConditions.performanceDayFrom !== null || searchConditions.performanceDayTo !== null) {
        // 登録日From
        if (searchConditions.performanceDayFrom !== null) {
            // アカウント別
            const endFrom = moment(
                // tslint:disable-next-line:max-line-length
                `${searchConditions.performanceDayFrom}T${searchConditions.performanceStartHour1}
:${searchConditions.performanceStartMinute1}:00+09:00`,
                'YYYY/MM/DDTHH:mm:ssZ'
            );
            conditionsDate.$gte = moment.max(endFrom, minEndFrom).toDate();
        }
        // 登録日To
        if (searchConditions.performanceDayTo !== null) {
            // アカウント別
            conditionsDate.$lt = moment(
                // tslint:disable-next-line:max-line-length
                `${searchConditions.performanceDayTo}T${searchConditions.performanceStartHour2}
:${searchConditions.performanceStartMinute2}:00+09:00`,
                'YYYY/MM/DDTHH:mm:ssZ'
            ).toDate();
        }
    }
    conditions.endDate = conditionsDate;

    debug('finding transactions...', conditions);
    const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
    const transactions = await transactionRepo.transactionModel.find(conditions).exec()
        .then((docs) => docs.map((doc) => <ttts.factory.transaction.placeOrder.ITransaction>doc.toObject()));
    debug(`${transactions.length} transactions found.`);

    return transactions;
}
*/
function searchPlaceOrderTransactions4reportByEventStartDate(searchConditions) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = [
            { typeOf: ttts.factory.transactionType.PlaceOrder },
            { status: ttts.factory.transactionStatusType.Confirmed },
            {
                'object.purchaser_group': {
                    $exists: true,
                    $eq: ttts.factory.person.Group.Customer
                }
            }
        ];
        if (POS_CLIENT_ID !== undefined) {
            // POS購入除外(一時的に除外機能オフ)
            // conditions['agent.id'] = { $ne: POS_CLIENT_ID };
        }
        // イベント開始日時条件を追加
        conditions.push({
            'result.eventReservations.performance_start_date': {
                $exists: true,
                $gte: moment(`${searchConditions.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').toDate(),
                $lt: moment(`${searchConditions.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'day').toDate()
            }
        });
        // let returnTransactions: ttts.factory.transaction.placeOrder.ITransaction[] = [];
        // const fromD = moment(`${searchConditions.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        // const toD = moment(`${searchConditions.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        // const cnt = toD.diff(fromD, 'days');
        // const iterateMin = 15;
        // const performanceCntPerDay = 53;
        // for (let c = 0; c < cnt + 1; c += 1) {
        //     const m = moment(`${searchConditions.eventStartFrom}T09:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add('days', c);
        //     const dateConditios = [];
        //     for (let i = 0; i < performanceCntPerDay; i += 1) {
        //         if (i === 0) {
        //             dateConditios.push(
        //                 { 'result.eventReservations.performance_start_date': m.toDate() }
        //             );
        //         } else {
        //             dateConditios.push(
        //                 { 'result.eventReservations.performance_start_date': m.add('minutes', iterateMin).toDate() }
        //             );
        //         }
        //     }
        //     conditions.$or = dateConditios;
        //     debug('finding transactions...', conditions);
        //     const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        //     const transactions = await transactionRepo.transactionModel.find(conditions).exec()
        //         .then((docs) => docs.map((doc) => <ttts.factory.transaction.placeOrder.ITransaction>doc.toObject()));
        //     debug(`${transactions.length} transactions found.`);
        //     returnTransactions = returnTransactions.concat(transactions);
        // }
        debug('finding transactions...', conditions);
        const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        const transactions = yield transactionRepo.transactionModel.find({ $and: conditions }).exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
        debug(transactions.length, 'transactions found');
        return transactions;
    });
}
function searchReservations(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const conditions = [{ _id: { $exists: true } }];
        if (params.eventStartFrom !== undefined) {
            conditions.push({ performance_start_date: { $gte: params.eventStartFrom } });
        }
        if (params.eventStartThrough !== undefined) {
            conditions.push({ performance_start_date: { $lt: params.eventStartThrough } });
        }
        if (params.orderFrom !== undefined) {
            conditions.push({ purchased_at: { $gte: params.orderFrom } });
        }
        if (params.orderThrough !== undefined) {
            conditions.push({ purchased_at: { $lt: params.orderThrough } });
        }
        const reservationRepo = new ttts.repository.Reservation(ttts.mongoose.connection);
        debug('finding reservations...', conditions);
        const reservations = yield reservationRepo.reservationModel.find({ $and: conditions }).exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
        debug(reservations.length, 'reservations found');
        return reservations;
    });
}
function searchReturnOrderTransactions4reportByEventStartDate(searchConditions) {
    return __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = [
            { typeOf: ttts.factory.transactionType.ReturnOrder },
            { status: ttts.factory.transactionStatusType.Confirmed },
            {
                'object.transaction.object.purchaser_group': {
                    $exists: true,
                    $eq: ttts.factory.person.Group.Customer
                }
            }
        ];
        if (POS_CLIENT_ID !== undefined) {
            // POS購入除外(一時的に除外機能オフ)
            // conditions['object.transaction.agent.id'] = { $ne: POS_CLIENT_ID };
        }
        // イベント開始日時条件を追加
        conditions.push({
            'object.transaction.result.eventReservations.performance_start_date': {
                $exists: true,
                $gte: moment(`${searchConditions.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').toDate(),
                $lt: moment(`${searchConditions.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'day').toDate()
            }
        });
        // conditions['object.transaction.result.eventReservations.performance_start_date'] = {
        //     $type: 'date'
        // };
        // if (searchConditions.eventStartFrom !== null) {
        //     conditions['object.transaction.result.eventReservations.performance_start_date'].$gte =
        //         moment(`${searchConditions.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').toDate();
        // }
        // if (searchConditions.eventStartThrough !== null) {
        //     conditions['object.transaction.result.eventReservations.performance_start_date'].$lt =
        //         moment(`${searchConditions.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add(1, 'day').toDate();
        // }
        // let returnTransactions: ttts.factory.transaction.returnOrder.ITransaction[] = [];
        // const fromD = moment(`${searchConditions.eventStartFrom}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        // const toD = moment(`${searchConditions.eventStartThrough}T00:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ');
        // const cnt = toD.diff(fromD, 'days');
        // const iterateMin = 15;
        // const performanceCntPerDay = 53;
        // for (let c = 0; c < cnt + 1; c += 1) {
        //     const m = moment(`${searchConditions.eventStartFrom}T09:00:00+09:00`, 'YYYY/MM/DDTHH:mm:ssZ').add('days', c);
        //     const dateConditios = [];
        //     for (let i = 0; i < performanceCntPerDay; i += 1) {
        //         if (i === 0) {
        //             dateConditios.push(
        //                 { 'object.transaction.result.eventReservations.performance_start_date': m.toDate() }
        //             );
        //         } else {
        //             dateConditios.push(
        //                 { 'object.transaction.result.eventReservations.performance_start_date': m.add('minutes', iterateMin).toDate() }
        //             );
        //         }
        //     }
        //     conditions.$or = dateConditios;
        //     debug('finding transactions...', conditions);
        //     const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        //     const transactions = await transactionRepo.transactionModel.find(conditions).exec()
        //         .then((docs) => docs.map((doc) => <ttts.factory.transaction.returnOrder.ITransaction>doc.toObject()));
        //     debug(`${transactions.length} transactions found.`);
        //     returnTransactions = returnTransactions.concat(transactions);
        // }
        debug('finding transactions...', conditions);
        const transactionRepo = new ttts.repository.Transaction(ttts.mongoose.connection);
        const transactions = yield transactionRepo.transactionModel.find({ $and: conditions }).exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
        debug(transactions.length, 'transactions found');
        return transactions;
    });
}
function placeOrderTransactions2reservationDatas(params) {
    const transactions = params.placeOrderTransactions;
    let reservations = params.reservations;
    // オープン前のPOS購入を除外
    if (POS_CLIENT_ID !== undefined && TOP_DECK_OPEN_DATE !== undefined) {
        // エージェントがPOSでない、あるいは、オープン日時以降の取引であればOK
        const topDeckOpenDate = moment(TOP_DECK_OPEN_DATE).toDate();
        reservations = reservations.filter((r) => {
            return ((r.transaction_agent !== undefined && r.transaction_agent.id !== POS_CLIENT_ID)
                || moment(r.purchased_at).toDate() >= topDeckOpenDate);
        });
        // transactions = transactions.filter((t) => {
        //     return (t.agent.id !== POS_CLIENT_ID || moment(t.endDate).toDate() >= topDeckOpenDate);
        // });
    }
    // 予約情報をセット
    const datas = [];
    // 取引数分Loop
    for (const transaction of transactions) {
        const transactionResult = transaction.result;
        // 取引から予約情報取得
        const eventReservations = reservations.filter((r) => r.order_number === transactionResult.order.orderNumber);
        eventReservations.forEach((r) => {
            datas.push(reservation2data(r, transactionResult.order.price));
        });
    }
    debug('datas created.');
    return datas;
}
function returnOrderTransactions2cancelDatas(params) {
    const transactions = params.returnOrderTransactions;
    let reservations = params.reservations;
    // オープン前のPOS購入を除外
    if (POS_CLIENT_ID !== undefined && TOP_DECK_OPEN_DATE !== undefined) {
        // エージェントがPOSでない、あるいは、オープン日時以降の取引であればOK
        const topDeckOpenDate = moment(TOP_DECK_OPEN_DATE).toDate();
        reservations = reservations.filter((r) => {
            return ((r.transaction_agent !== undefined && r.transaction_agent.id !== POS_CLIENT_ID)
                || moment(r.purchased_at).toDate() >= topDeckOpenDate);
        });
        // transactions = transactions.filter((t) => {
        //     return (t.object.transaction.agent.id !== POS_CLIENT_ID || moment(t.object.transaction.endDate).toDate() >= topDeckOpenDate);
        // });
    }
    const datas = [];
    transactions.forEach((returnOrderTransaction) => {
        // 取引からキャンセル予約情報取得
        const placeOrderTransaction = returnOrderTransaction.object.transaction;
        const placeOrderTransactionResult = placeOrderTransaction.result;
        const eventReservations = reservations.filter((r) => r.order_number === placeOrderTransactionResult.order.orderNumber);
        for (const r of eventReservations) {
            // 座席分のキャンセルデータ
            datas.push(Object.assign({}, reservation2data(r, placeOrderTransactionResult.order.price), { reservationStatus: Status4csv.Cancelled, status_sort: `${r.status}_1`, cancellationFee: returnOrderTransaction.object.cancellationFee, orderDate: moment(returnOrderTransaction.endDate).format('YYYY/MM/DD HH:mm:ss') }));
            // 購入分のキャンセル料データ
            if (r.payment_seat_index === 0) {
                datas.push(Object.assign({}, reservation2data(r, placeOrderTransactionResult.order.price), { seat: {
                        code: '',
                        gradeName: '',
                        gradeAdditionalCharge: ''
                    }, ticketType: {
                        name: '',
                        charge: returnOrderTransaction.object.cancellationFee.toString(),
                        csvCode: ''
                    }, paymentSeatIndex: '', reservationStatus: Status4csv.CancellationFee, status_sort: `${r.status}_2`, cancellationFee: returnOrderTransaction.object.cancellationFee, price: returnOrderTransaction.object.cancellationFee.toString(), orderDate: moment(returnOrderTransaction.endDate).format('YYYY/MM/DD HH:mm:ss') }));
            }
        }
    });
    return datas;
}
/**
 * 予約データをcsvデータ型に変換する
 * @param {ttts.factory.reservation.event.IReservation} r 予約データ
 * @param {number} orderPrice 注文金額
 */
function reservation2data(r, orderPrice) {
    // 客層取得 (購入者居住国：2桁、年代：2桁、性別：1桁)
    const locale = (r.purchaser_address !== undefined) ? r.purchaser_address : '';
    const age = (r.purchaser_age !== undefined) ? r.purchaser_age : '';
    const gender = (r.purchaser_gender !== undefined) ? r.purchaser_gender : '';
    const customerSegment = (locale !== '' ? locale : '__') + (age !== '' ? age : '__') + (gender !== '' ? gender : '_');
    return {
        paymentNo: r.payment_no,
        paymentSeatIndex: r.payment_seat_index.toString(),
        performance: {
            id: r.performance,
            startDay: r.performance_day,
            startTime: r.performance_start_time
        },
        theater: {
            name: r.theater_name.ja
        },
        screen: {
            id: r.screen,
            name: r.screen_name.ja
        },
        film: {
            id: r.film,
            name: r.film_name.ja
        },
        seat: {
            code: r.seat_code,
            gradeName: r.seat_grade_name.ja,
            gradeAdditionalCharge: r.seat_grade_additional_charge.toString()
        },
        ticketType: {
            name: r.ticket_type_name.ja,
            // リリース当初の間違ったマスターデータをカバーするため
            csvCode: (r.ticket_ttts_extension.csv_code === '0000000000231') ? '10031' : r.ticket_ttts_extension.csv_code,
            charge: r.charge.toString()
        },
        customer: {
            group: (purchaserGroupStrings[r.purchaser_group] !== undefined)
                ? purchaserGroupStrings[r.purchaser_group]
                : r.purchaser_group,
            givenName: r.purchaser_first_name,
            familyName: r.purchaser_last_name,
            email: r.purchaser_email,
            telephone: r.purchaser_tel,
            segment: customerSegment,
            username: (r.owner_username !== undefined) ? r.owner_username : ''
        },
        orderDate: moment(r.purchased_at).format('YYYY/MM/DD HH:mm:ss'),
        paymentMethod: (paymentMethodStrings[r.payment_method] !== undefined)
            ? paymentMethodStrings[r.payment_method]
            : r.payment_method,
        checkedin: r.checkins.length > 0 ? 'TRUE' : 'FALSE',
        checkinDate: r.checkins.length > 0 ? moment(r.checkins[0].when).format('YYYY/MM/DD HH:mm:ss') : '',
        reservationStatus: Status4csv.Reserved,
        status_sort: r.status,
        price: orderPrice.toString(),
        cancellationFee: 0
    };
}
