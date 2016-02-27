var $ = require('jquery/jquery');
var FastClick = require('fastclick/fastclick');
var until = require('app/until/until');
var tplList = __inline('list.tpl');

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
        }, function(err) {
            // 失败
            onFail && onFail(err);
        });
    },
    getCurrentUser : function(){
        return AV.User.current();
    },
    save : function(level, onSuccess, onFail){
        var self = this;
        var query = new AV.Query(self._PickColor);
        var pickColor = new self._PickColor();
        query.equalTo('user', self.getCurrentUser());
        query.find().then(function(results){
            if(!results[0]){
                pickColor = new self._PickColor();
                pickColor.set('level', level);
                pickColor.set('user', self.getCurrentUser());
                return pickColor.save();
            }
            pickColor = results[0];
            if(pickColor.get('level') >= level){
                onSuccess && onSuccess(pickColor);
                return;
            }
            pickColor.set('level', level);
            return pickColor.save();
        }, function(err){
            onFail && onFail(err);
        }).then(function(data){
            onSuccess && onSuccess(data);
        }, function(err){
            onFail && onFail(err);
        });
    },
    getList : function(onSuccess, onFail){
        var self = this;
        var query = new AV.Query(self._PickColor);
        // 降序
        query.addDescending('level');
        query.include("user");
        query.find().then(function(data) {
            onSuccess && onSuccess(data);
        }, function(err) {
            onFail && onFail(err);
        });
    }
};

var login = {
    init : function(){
        var self = this;
        if(leanCloud.getCurrentUser()){
            box && box.enableStart();
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
                box && box.enableStart();
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
        self._$total = $('#total');
        self._resetConfig();
        self._opt = {
            len : 5
        };
        self._update();
        self._initBtnStart();
    },
    _initBtnStart : function(){
        var self = this;
        self._$btnStart.on('click', function(){
            self._start();
        });
    },
    _start : function(){
        var self = this;
        self.disableStart();
        self._resetConfig();
        self._hideTotal();
        self._hideDiff();
        self._isStarted = true;
        self._resetCountDown();
        self._updateLevel();
        self._update();
    },
    _resetConfig : function(){
        var self = this;
        self._level = 0;
        self._vol = 20;
        self._count = 3;
    },
    _resetCountDown : function(){
        var self = this;
        var count = self._count;
        self._clearCountDown();
        self._countDown = setInterval(function(){
            self._$time.text(count);
            if(count < 1){
                self._clearCountDown();
                self._over();
                self._save();
            }
            count = count - 1;
        }, 1000);
    },
    _save : function(){
        var self = this;
        leanCloud.save(self._getLevel(), function(data){
            if(list){
                list.update();
            }
        }, function(err){

        })
    },
    _over : function(){
        var self = this;
        self._isStarted = false;
        self._showTotal();
        self._showDiff();
        self.enableStart('重新挑战');
    },
    _showDiff : function(){
        var self = this;
        self._$container.find('diff').addClass('animated');
    },
    _hideDiff : function(){
        var self = this;
        self._$container.find('diff').removeClass('animated');
    },
    _showTotal : function(){
        var self = this;
        self._$total.show().find('strong').text(self._getLevel());
    },
    _hideTotal : function(){
        var self = this;
        self._$total.hide();
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
                'top':'2%',
                'bottom':'2%',
                'left':'2%',
                'right':'2%',
                'background-color' : color.normal
            });
            $div.append($color);
        }
        $div.children().eq(index).addClass('diff infinite bounce').find('div').css('background-color', color.special).on('click', function(){
            if(self._isStarted){
                self._pickRight();
            }
        });
        self._$container.empty().append($div);
    },
    _pickRight : function(){
        var self = this;
        self._updateLevel(++self._level);
        self._update();
        self._resetCountDown();
    },
    _updateLevel : function(level){
        var self = this;
        self._$level.text(level === undefined ? self._level : level);
    },
    _getVol : function(){
        var self = this;
        var params = [
            [0, 20],
            [9, 16],
            [19, 14],
            [29, 12],
            [39, 10],
            [49, 8],
            [59, 7],
            [69, 6],
            [79, 5],
            [89, 3],
            [Number.MAX_VALUE, 1]
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
        self._$btnStart.removeAttr('disabled').text(text === undefined ? '我要挑战' : text);
    }
};

var list = {
    init : function(){
        var self = this;
        self._$list = $('#list');
        self.update();
    },
    update : function(){
        var self = this;
        leanCloud.getList(function(data){
            self._$list.html(tplList({
                data : self._parseSeverData(data),
                myId : leanCloud.getCurrentUser() ? leanCloud.getCurrentUser().id : ''
            }));
        });
    },
    _parseSeverData : function(serverData){
        var data = [];
        $.each(serverData, function(i, v){
            data.push({
                "userId" : v.get('user').id,
                "phone" : v.get('user').get('mobilePhoneNumber'),
                "level" : v.get('level')
            });
        });
        return data;
    }
};

$(function(){
    FastClick.attach(document.body);
    leanCloud.init();
    box.init();
    login.init();
    list.init();
});