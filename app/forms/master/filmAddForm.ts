/**
 * 作品マスタフォーム
 *
 * @ignore
 */
import {Request} from 'express';
import * as form from 'express-form';

// 作品コード 半角64
const NAME_MAX_LENGTH_CODE: number = 64;
// 作品名・日本語 全角64
const NAME_MAX_LENGTH_NAME_JA: number = 64;
// 作品名・英語 半角128
const NAME_MAX_LENGTH_NAME_EN: number = 128;
// 上映時間・数字10
const NAME_MAX_LENGTH_NAME_MINUTES: number = 10;

export default (req: Request) => {
    return form(
        // 作品コード
        form.field('filmCode', req.__('Master.Form.FieldName.filmCode')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' }))
            .maxLength(NAME_MAX_LENGTH_CODE, req.__('Message.maxLength{{fieldName}}{{max}}', { fieldName: '%s', max: NAME_MAX_LENGTH_CODE.toString() }))
            .regex(/^[ -\~]+$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 作品名
        form.field('filmNameJa', req.__('Master.Form.FieldName.filmNameJa')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' }))
            .maxLength(NAME_MAX_LENGTH_NAME_JA, req.__('Message.maxLength{{fieldName}}{{max}}', { fieldName: '%s', max: NAME_MAX_LENGTH_CODE.toString() })),
        // 作品名カナ
        form.field('filmNameKana', req.__('Master.Form.FieldName.filmNameKana')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' }))
            .maxLength(NAME_MAX_LENGTH_NAME_JA, req.__('Message.maxLength{{fieldName}}{{max}}', { fieldName: '%s', max: NAME_MAX_LENGTH_CODE.toString() }))
            .regex(/^[ァ-ロワヲンーa-zA-Z]*$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 作品名英
        form.field('filmNameEn', req.__('Master.Form.FieldName.filmNameEn')).trim()
            .maxLength(NAME_MAX_LENGTH_NAME_EN, req.__('Message.maxLength{{fieldName}}{{max}}', { fieldName: '%s', max: NAME_MAX_LENGTH_CODE.toString() }))
            .regex(/^[ -\~]+$/, req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // 上映時間
        form.field('filmMinutes', req.__('Master.Form.FieldName.filmMinutes')).trim()
            .maxLength(NAME_MAX_LENGTH_NAME_MINUTES, req.__('Message.maxLength{{fieldName}}{{max}}', { fieldName: '%s', max: NAME_MAX_LENGTH_CODE.toString() }))
            .isNumeric(req.__('Message.invalid{{fieldName}}', { fieldName: '%s' })),
        // レイティング
        form.field('filmRatings', req.__('Master.Form.FieldName.filmRatings')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' })),
        // 字幕/吹き替え
        form.field('subtitleDub', req.__('Master.Form.FieldName.subtitleDub')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' })),
        // 上映形態
        form.field('screeningForm', req.__('Master.Form.FieldName.screeningForm')).trim()
            .required('', req.__('Message.required{{fieldName}}', { fieldName: '%s' }))
    );
};
