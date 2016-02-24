/**
 * 工具类模块
 * @module app/until/until
 * @author fancy <fancyboynet@gmail.com>
 */
module.exports = {
    redirect : function(url){
        window.location.href = url;
    },
    isValidPhone : function(s){
        return /^1\d{10}$/i.test(s);
    },
    isValidCode : function(s){
        return /^\d+$/i.test(s);
    },
    localStorage:{
        setItem : function(k, v){
            window.localStorage.setItem(k, v);
        },
        getItem : function(k){
            return window.localStorage.getItem(k);
        }
    }
};