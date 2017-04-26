"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 券種グループマスタモデル
 *
 * 券種グループマスタの管理するためのモデルです
 *
 * @export
 * @class TicketTypeGroupsModel
 */
const MasterBaseModel_1 = require("./MasterBaseModel");
class TicketTypeGroupsModel extends MasterBaseModel_1.default {
    constructor() {
        super(...arguments);
        /**
         * 券種グループ名(string(64))
         */
        this.ticketGroupNameJa = '';
        /**
         * 対象券種名
         */
        this.targetTicketName = '';
        /**
         * 補足説明(string(64))
         */
        this.description = '';
        /**
         * 登録日(Date(10))
         */
        this.createdAt = new Date();
    }
}
exports.default = TicketTypeGroupsModel;
//# sourceMappingURL=TicketTypeGroupsModel.js.map