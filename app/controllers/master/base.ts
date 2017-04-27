/**
 * マスタ共通コントローラー基底クラス
 * @namespace masterBaseController
 */
import { Models } from '@motionpicture/chevre-domain';
//import * as mongoose from 'mongoose';

/**
 * 前方一致正規表現取得
 *
 * @param {string} value
 * @returns {RegExp}
 */
export function getRegxForwardMatching(value: string): RegExp {
    return new RegExp('^' + value);
}
/**
 * Id自動採番
 *
 * @param {string} target
 * @param {number} digits
 * @returns {Promise<string | null>}
 */
export async function getId(target: string, digits: number): Promise<string | null> {
    const sequence = await Models.Sequence.findOneAndUpdate(
        { target: target },
        {
            $inc: { no: 1 }
        },
        {
            upsert: true,
            new: true
        }
    ).exec();

    const no: number = sequence.get('no');
    // 指定桁数になるように0で埋める
    let source = no.toString();
    while (source.length < digits) {
        source = '0' + source;
    }
    return source;
}
