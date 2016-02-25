var $ = require('jquery/jquery');
var FastClick = require('fastclick/fastclick');
var until = require('app/until/until');
var leanCloud = {
    init : function(){
        var self = this;
        AV.initialize('JwuuFDxrYN5KtMhzsT90Prk2-gzGzoHsz', 'sRVStMvDDFM8upNpqIXAYpXw');
        self._PickColor = AV.Object.extend('PickColor');
    },
    sendCode : function(phone, onSuccess, onFail){
        AV.Cloud.requestSmsCode(phone).then(function(data) {
            //发送成功
            onSuccess && onSuccess(data);
        }, function(err) {
            //发送失败
            onFail && onFail(err);
        });
    },
    verify : function(phone, code, onSuccess, onFail){
        var user = new AV.User();
        user.signUpOrlogInWithMobilePhone({
            mobilePhoneNumber: phone,
            smsCode: code
        }).then(function(data) {
            //注册或者登录成功
            onSuccess && onSuccess(data);
        }, function(error) {
            // 失败
            onFail && onFail(err);
        });
    },
    getCurrentUser : function(){
        return AV.User.current();
    },
    save : function(level, onSuccess, onFail){
        var self = this;

    }
};
var login = {
    init : function(){
        var self = this;
        if(leanCloud.getCurrentUser()){
            box.enableStart();
            return;
        }
        self._$first = $('#first').show();
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
            leanCloud.sendCode(self.getPhone(), function(){
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
        self._$btnGetCode.removeAttr('disabled').text('重新获取');
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
            leanCloud.verify(self.getPhone(), self._getCode(), function(){
                self._hide();
                box.enableStart();
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
        var self = this;
        self._$first.remove();
    }
};
var box = {
    init : function(){
        var self = this;
        self._$container = $('#container').css('font-size',0);
        self._$level = $('#level');
        self._$btnStart = $('#btnStart');
        self._$time = $('#time');
        self._level = 0;
        self._vol = 20;
        self._opt = {
            len : 5
        };
        self._update();
        self._initBtnStart();
    },
    _initBtnStart : function(){
        var self = this;
        self._$btnStart.on('click', function(){
            self._update();
            self._start();
        });
    },
    _start : function(){
        var self = this;
        self._isStarted = true;
        self.disableStart();
        self._resetCountDown();
    },
    _resetCountDown : function(){
        var self = this;
        var second = 5;
        self._clearCountDown();
        self._countDown = setInterval(function(){
            self._$time.text(second);
            if(second < 1){
                self._clearCountDown();
                self._over();
                self._save();
            }
            second = second - 1;
        }, 1000);
    },
    _save : function(){
        var self = this;
        console.log('_save', self._getLevel());
    },
    _over : function(){
        var self = this;
        self._isStarted = false;
        self.enableStart('重新挑战');
    },
    _clearCountDown : function(){
        var self = this;
        if(self._countDown){
            clearInterval(self._countDown);
        }
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
            if(self._isStarted){
                self._pickRight();
            }
        });
        self._$container.empty().append($div);
    },
    _pickRight : function(){
        var self = this;
        self._$level.text(++self._level);
        self._update();
        self._resetCountDown();
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
            if(self._getLevel() < v[0]){
                vol = params[i - 1][1];
                return false;
            }
        });
        return vol;
    },
    _getLevel : function(){
        return this._level;
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
    disableStart : function(){
        var self = this;
        self._$btnStart.attr('disabled', 'disabled');
    },
    enableStart : function(text){
        var self = this;
        self._$btnStart.removeAttr('disabled').text(text === undefined ? '开始挑战啦' : text);
    }
};

$(function(){
    FastClick.attach(document.body);
    leanCloud.init();
    box.init();
    login.init();
});