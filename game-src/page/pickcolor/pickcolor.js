var $ = require('jquery/jquery');
var FastClick = require('fastclick/fastclick');
var until = require('until/until');
var leanCloud = {
    init : function(){
        var self = this;
        AV.initialize('JwuuFDxrYN5KtMhzsT90Prk2-gzGzoHsz', 'sRVStMvDDFM8upNpqIXAYpXw');
    },
    signUp : function(phone, onSuccess, onFail){
        var user = new AV.User();
        user.set('username', 'chihuo');
        user.set('password', 'chihuo');
        user.setMobilePhoneNumber(phone);
        user.signUp().then(function(data) {
            // 成功
            onSuccess && onSuccess(data);
        }, function(err) {
            // 失败
            onFail && onFail(err);
        });
    },
    resendCode : function(phone, onSuccess, onFail){
        AV.User.requestMobilePhoneVerify(phone).then(function(data) {
            //发送成功
            onSuccess && onSuccess(data);
        }, function(err) {
            //发送失败
            onFail && onFail(err);
        });
    },
    verify : function(code, onSuccess, onFail){
        AV.User.verifyMobilePhone(code).then(function(data) {
            //验证成功
            onSuccess && onSuccess(data);
        }, function(err) {
            onFail && onFail(err);
        });
    }
};
var register = {
    init : function(){
        var self = this;
        self._$first = $('#first');
        self._$phone = $('#phone');
        self._$btnGetCode = $('#btnGetCode');
        self._$code = $('#code');
        self._$btnVerify = $('#btnVerify');
        self._initGetCode();
        self._initVerify();
    },
    _initGetCode : function(){
        var self = this;
        self._$btnGetCode.on('click', function(){
            if(!self._checkPhone()){
                return false;
            }
            self._disableVerifyCode();
            leanCloud.signUp(self.getPhone(), function(){
                self._enableVerifyCode();
                self._disableGetCode();
            }, function(err){
                alert(err.message);
            });
        });
    },
    _disableGetCode : function(){
        var self = this;
        self._$phone.attr('disabled', 'disabled');
        self._$btnGetCode.attr('disabled', 'disabled').text('让验证码飞一会');
        if(self._delay){
            clearTimeout(self._delay);
        }
        self._delay = setTimeout(function(){
            self._enableGetCode();
        }, 60 * 1000);
    },
    _enableGetCode : function(){
        var self = this;
        self._$btnGetCode.removeAttr('disabled').text('重新获取').off().on('click', function(){
            if(!self._checkPhone()){
                return false;
            }
            self._disableVerifyCode();
            leanCloud.resendCode(self.getPhone(), function(){
                self._enableVerifyCode();
                self._disableGetCode();
            }, function(err){
                alert(err.message);
            });
        });
    },
    getPhone : function(){
        return this._$phone.val();
    },
    _checkPhone : function(){
        var self = this;
        var phone = self.getPhone();
        if(!until.isValidPhone(phone)){
            alert('手机号格式不对');
            return false;
        }
        return true;
    },
    _initVerify : function(){
        var self = this;
        self._$btnVerify.on('click', function(){
            if(!self._checkCode()){
                return false;
            }
            leanCloud.verify(self._getCode(), function(){
                self._hide();
                box.enable();
            }, function(err){
                alert(err.message);
            });
        });
    },
    _checkCode : function(){
        var self = this;
        var code = self._getCode();
        if(!until.isValidCode(code)){
            alert('验证码格式不对');
            return false;
        }
        return true;
    },
    _getCode : function(){
        return this._$code.val();
    },
    _enableVerifyCode : function(){
        var self = this;
        self._$btnVerify.removeAttr('disabled');
    },
    _disableVerifyCode : function(){
        var self = this;
        self._$btnVerify.attr('disabled', 'disabled');
    },
    _hide : function(){

    }
};
var box = {
    init : function(){
        var self = this;
        self._$container = $('#container').css('font-size',0);
        self._$level = $('#level');
        self._level = 0;
        self._vol = 20;
        self._opt = {
            len : 5
        };
        self._update();
    },
    _update : function(){
        var self = this;
        var len = self._getLen();
        var index = self._getIndex();
        var color = self._getColor();
        var $div = $('<div/>');
        var width = self._getWidth();
        for(var i = 0; i < len; i++){
            var $color = $('<div><div></div></div>');
            $color.css({
                'display' : 'inline-block',
                'padding-left' : width,
                'padding-top' : width,
                'position' : 'relative'
            }).find('div').css({
                'position' : 'absolute',
                'top':'1%',
                'bottom':'1%',
                'left':'1%',
                'right':'1%',
                'background-color' : color.normal
            });
            $div.append($color);
        }
        $div.children().eq(index).find('div').css('background-color', color.special).on('click', function(){
            self._pickRight();
        });
        self._$container.empty().append($div);
    },
    _pickRight : function(){
        var self = this;
        self._$level.text(++self._level);
        self._update();
    },
    _getVol : function(){
        var self = this;
        var params = [
            [0, 20],
            [9, 18],
            [19, 16],
            [29, 15],
            [39, 14],
            [49, 12],
            [59, 10],
            [69, 8],
            [79, 5]
        ];
        var vol;
        $.each(params, function(i, v){
            if(self._level < v[0]){
                vol = params[i - 1][1];
                return false;
            }
        });
        return vol;
    },
    _getLen : function(){
        var self = this;
        return self._opt.len * self._opt.len;
    },
    _getWidth : function(){
        var self = this;
        return 100 / self._opt.len + '%';
    },
    _getIndex : function(){
        var self = this;
        var len = self._getLen();
        return Math.floor(Math.random() * len);
    },
    _getColor : function(){
        var self = this;
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        var vol = self._getVol();
        var d = function(v){
            return v - vol < 0 ? v + vol : v - vol;
        };
        return {
            normal : 'rgb(' + r + ',' + g + ',' + b + ')',
            special : 'rgb(' + d(r) + ',' + d(g) + ',' + d(b) + ')'
        }
    },
    enable : function(){

    }
};

$(function(){
    FastClick.attach(document.body);
    leanCloud.init();
    register.init();
    box.init();
});