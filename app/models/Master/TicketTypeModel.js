"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MasterBaseModel_1 = require("./MasterBaseModel");
/**
 * 券種マスタモデル
 *
 * 券種マスタの管理するためのモデルです
 *
 * @export
 * @class TicketTypeModel
 */
class TicketTypeModel extends MasterBaseModel_1.default {
    constructor() {
        super(...arguments);
        /**
         * 券種コード(string(64))
         */
        this.ticketCode = '';
        /**
         * サイト表示用券種名(string(64))
         */
        this.ticketNameJa = '';
        /**
         * サイト表示用券種名英(string(64))
         */
        this.ticketNameEn = '';
        /**
         * 管理用券種名(string(64))
         */
        this.managementTypeName = '';
        /**
         * 補足説明(string(64))
         */
        this.descriptionJa = '';
        /**
         * 補足説明英(string(64))
         */
        this.descriptionEn = '';
        /**
         * 入場時表示カラー(string(7))
         */
        this.indicatorColor = '';
        /**
         * 登録日(Date(10))
         */
        this.createdAt = new Date();
    }
}
exports.default = TicketTypeModel;
