// startタグ取得
$.fn.startTag = function(){
    return this[0].outerHTML.split(this.html())[0];
};
// endタグ取得
$.fn.endTag = function(){
    return this[0].outerHTML.split(this.html())[1];
};
// jsonデータからプロパティ値取得(nullは"")
// プロパティが存在しない時はdefaultValueを返す。
$.fn.getStringValue = function(data, propertyName, defaultValue) {
    var value = (data.hasOwnProperty(propertyName)) ?
                data[propertyName] : defaultValue;
    if (value == null) {
        value = "";
    }
    return value;
};
// Form入力値取得
$.fn.getDataFromForm = function(formSelector) {
    var conditions = {};
    // 指定フォームの値を全て条件に追加
    $(formSelector).serializeArray().forEach(function(formData, index){
        conditions[formData.name] = formData.value;
    });
    return conditions;
    // キャッシュ回避
    //conditions['dummy'] = new Date();
};
// Form表示
$.fn.setDataToForm = function(formSelector, conditions) {
    $(formSelector).serializeArray().forEach(function(formData, index){
        var name = formData.name;
        var value = $.fn.getStringValue(conditions, name, "");
        $('input[name="' + name + '"], select[name="' + name + '"]', $(formSelector)).val(value);
    });
};