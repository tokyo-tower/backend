/**
 * 券種グループマスタモデル
 *
 * 券種グループマスタの管理するためのモデルです
 *
 * @export
 * @class TicketTypeGroupsModel
 */
import MasterBaseModel from './MasterBaseModel';
export default class TicketTypeGroupsModel extends MasterBaseModel {
    /**
     * 券種グループ名(string(64))
     */
    public ticketGroupNameJa: string = '';
    /**
     * 対象券種名
     */
    public targetTicketName: string = '';
    /**
     * 補足説明(string(64))
     */
    public description: string = '';
    /**
     * 登録日(Date(10))
     */
    public createdAt: Date = new Date();
}
