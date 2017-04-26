"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種マスタモデル
 *
 * 券種マスタの管理するためのモデルです
 *
 * @export
 * @class TicketTypeModel
 */
const MasterBaseModel_1 = require("./MasterBaseModel");
class TicketTypeModel extends MasterBaseModel_1.default {
    constructor() {
        super(...arguments);
        /**
         * ticketNameJa: サイト表示用券種名(string(64))
         */
        this.ticketNameJa = '';
        /**
         * ticketNameKana: サイト表示用券種名英(string(64))
         */
        this.ticketNameKana = '';
        /**
         * ticketNameEn: 管理用券種名(string(64))
         */
        this.ticketNameEn = '';
        /**
         * descriptionJa: 補足説明(string(64))
         */
        this.descriptionJa = '';
        /**
         * descriptionEn: 補足説明英(string(64))
         */
        this.descriptionEn = '';
        /**
         * indicatorColor: 入場時表示カラー(string(7))
         */
        this.indicatorColor = '';
        /**
         * createdAt: 登録日(Date(10))
         */
        this.createdAt = new Date();
    }
}
exports.default = TicketTypeModel;
//# sourceMappingURL=TicketTypeModel.js.map