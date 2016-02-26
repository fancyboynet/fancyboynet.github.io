define("page/pickcolor/pickcolor",function(require,exports,module){var $=require("jquery/jquery"),FastClick=require("fastclick/fastclick"),until=require("app/until/until"),tplList=function(obj){{var __t,__p="";Array.prototype.join}with(obj||{})__p+="",$.each(data,function(t,e){__p+='\n<li data-userid="'+(null==(__t=e.userId)?"":__t)+'" class="'+(null==(__t=e.userId===myId?"myself":"")?"":__t)+'">'+(null==(__t=e.phone)?"":__t)+":<strong>"+(null==(__t=e.level)?"":__t)+"</strong></li>\n"}),__p+="";return __p},leanCloud={init:function(){var t=this;AV.initialize("JwuuFDxrYN5KtMhzsT90Prk2-gzGzoHsz","sRVStMvDDFM8upNpqIXAYpXw"),t._PickColor=AV.Object.extend("PickColor")},sendCode:function(t,e,n){AV.Cloud.requestSmsCode(t).then(function(t){e&&e(t)},function(t){n&&n(t)})},verify:function(t,e,n,i){var o=new AV.User;o.signUpOrlogInWithMobilePhone({mobilePhoneNumber:t,smsCode:e}).then(function(t){n&&n(t)},function(t){i&&i(t)})},getCurrentUser:function(){return AV.User.current()},save:function(t,e,n){var i=this,o=new AV.Query(i._PickColor),r=new i._PickColor;o.equalTo("user",i.getCurrentUser()),o.find().then(function(n){return n[0]?(r=n[0],r.get("level")>=t?void(e&&e(r)):(r.set("level",t),r.save())):(r=new i._PickColor,r.set("level",t),r.set("user",i.getCurrentUser()),r.save())},function(t){n&&n(t)}).then(function(t){e&&e(t)},function(t){n&&n(t)})},getList:function(t,e){var n=this,i=new AV.Query(n._PickColor);i.addDescending("level"),i.include("user"),i.find().then(function(e){t&&t(e)},function(t){e&&e(t)})}},login={init:function(){var t=this;return leanCloud.getCurrentUser()?void(box&&box.enableStart()):(t._$first=$("#first").show(),t._$phone=$("#phone"),t._$btnGetCode=$("#btnGetCode"),t._$code=$("#code"),t._$btnVerify=$("#btnVerify"),t._initGetCode(),void t._initVerify())},_initGetCode:function(){var t=this;t._$btnGetCode.on("click",function(){return t._checkPhone()?(t._disableVerifyCode(),void leanCloud.sendCode(t.getPhone(),function(){t._enableVerifyCode(),t._disableGetCode()},function(t){alert(t.message)})):!1})},_disableGetCode:function(){var t=this;t._$phone.attr("disabled","disabled"),t._$btnGetCode.attr("disabled","disabled").text("让验证码飞一会"),t._delay&&clearTimeout(t._delay),t._delay=setTimeout(function(){t._enableGetCode()},6e4)},_enableGetCode:function(){var t=this;t._$btnGetCode.removeAttr("disabled").text("重新获取")},getPhone:function(){return this._$phone.val()},_checkPhone:function(){var t=this,e=t.getPhone();return until.isValidPhone(e)?!0:(alert("手机号格式不对"),!1)},_initVerify:function(){var t=this;t._$btnVerify.on("click",function(){return t._checkCode()?void leanCloud.verify(t.getPhone(),t._getCode(),function(){t._hide(),box&&box.enableStart()},function(t){alert(t.message)}):!1})},_checkCode:function(){var t=this,e=t._getCode();return until.isValidCode(e)?!0:(alert("验证码格式不对"),!1)},_getCode:function(){return this._$code.val()},_enableVerifyCode:function(){var t=this;t._$btnVerify.removeAttr("disabled")},_disableVerifyCode:function(){var t=this;t._$btnVerify.attr("disabled","disabled")},_hide:function(){var t=this;t._$first.remove()}},box={init:function(){var t=this;t._$container=$("#container").css("font-size",0),t._$level=$("#level"),t._$btnStart=$("#btnStart"),t._$time=$("#time"),t._resetConfig(),t._opt={len:5},t._update(),t._initBtnStart()},_initBtnStart:function(){var t=this;t._$btnStart.on("click",function(){t._start()})},_start:function(){var t=this;t.disableStart(),t._resetConfig(),t._isStarted=!0,t._resetCountDown(),t._updateLevel(),t._update()},_resetConfig:function(){var t=this;t._level=0,t._vol=20,t._count=1},_resetCountDown:function(){var t=this,e=t._count;t._clearCountDown(),t._countDown=setInterval(function(){t._$time.text(e),1>e&&(t._clearCountDown(),t._over(),t._save()),e-=1},1e3)},_save:function(){var t=this;leanCloud.save(t._getLevel(),function(){},function(){})},_over:function(){var t=this;t._isStarted=!1,t.enableStart("重新挑战")},_clearCountDown:function(){var t=this;t._countDown&&clearInterval(t._countDown)},_update:function(){for(var t=this,e=t._getLen(),n=t._getIndex(),i=t._getColor(),o=$("<div/>"),r=t._getWidth(),a=0;e>a;a++){var l=$("<div><div></div></div>");l.css({display:"inline-block","padding-left":r,"padding-top":r,position:"relative"}).find("div").css({position:"absolute",top:"2%",bottom:"2%",left:"2%",right:"2%","background-color":i.normal}),o.append(l)}o.children().eq(n).find("div").css("background-color",i.special).on("click",function(){t._isStarted&&t._pickRight()}),t._$container.empty().append(o)},_pickRight:function(){var t=this;t._updateLevel(++t._level),t._update(),t._resetCountDown()},_updateLevel:function(t){var e=this;e._$level.text(void 0===t?e._level:t)},_getVol:function(){var t,e=this,n=[[0,20],[9,18],[19,16],[29,15],[39,14],[49,12],[59,10],[69,8],[79,5]];return $.each(n,function(i,o){return e._getLevel()<o[0]?(t=n[i-1][1],!1):void 0}),t},_getLevel:function(){return this._level},_getLen:function(){var t=this;return t._opt.len*t._opt.len},_getWidth:function(){var t=this;return 100/t._opt.len+"%"},_getIndex:function(){var t=this,e=t._getLen();return Math.floor(Math.random()*e)},_getColor:function(){var t=this,e=Math.round(255*Math.random()),n=Math.round(255*Math.random()),i=Math.round(255*Math.random()),o=t._getVol(),r=function(t){return 0>t-o?t+o:t-o};return{normal:"rgb("+e+","+n+","+i+")",special:"rgb("+r(e)+","+r(n)+","+r(i)+")"}},disableStart:function(){var t=this;t._$btnStart.attr("disabled","disabled")},enableStart:function(t){var e=this;e._$btnStart.removeAttr("disabled").text(void 0===t?"我要挑战":t)}},list={init:function(){var t=this;t._$list=$("#list"),t.update()},update:function(){var t=this;leanCloud.getList(function(e){t._$list.html(tplList({data:t._parseSeverData(e),myId:leanCloud.getCurrentUser()?leanCloud.getCurrentUser().id:""}))})},_parseSeverData:function(t){var e=[];return $.each(t,function(t,n){e.push({userId:n.get("user").id,phone:n.get("user").get("mobilePhoneNumber"),level:n.get("level")})}),e}};$(function(){FastClick.attach(document.body),leanCloud.init(),box.init(),login.init(),list.init()})});