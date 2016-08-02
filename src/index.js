/**
 * @memberOf com.citicbank.cbjs
 * @class 获取手机验证码
 * @constructor
 * @extends com.citicbank.cbjs.Component.Base
 * @param {Object} param 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
 * @author liuwei
 */
define(["js/core"],
    function (framework) {
        var Component = framework.Component;
        var Model = framework.Model;
        var Bridge = framework.Bridge;
        var api = framework.api;
        var Template = framework.Template;
        var $ = api.$;

        Component.GetCode = Component.Base.extend({
            initialize: function (param) {
                this._super(param);
                this.timer = null;
                this.time = this.$el.data("time") || 60;
                this.beforeClickText = this.$el.data("text-before") || "获取验证码";
                this.afterClickText = this.$el.data("text-after") || "重新获取";
                this.$el.html(this.beforeClickText);
                this.bindEvent("click", "_onClick");
            },
            _onClick: function (e) {
                if(this.getParam().PHONE_NO||this.getParam().BANK_PHONE){
                    this.$el.attr("disabled", "true");
                    this.$el.css("background", "gray");
                    this._setTimer(this.time);
                    this.act = this.$el.data("act") || '5080002'

                    var self = this;
                    var model = new Model.Request(null, {
                        url: "cbframework.do?act="+this.act,
                        param: self.getParam(),
                        onSuccess: function (state, response) {
                            if (response.RETCODE != "AAAAAAA") {
                                if (response.RETCODE == "MBFO010") {
                                    Bridge.sessionTimeout();
                                } else {
                                    alert("错误：" + response.RETMSG + "(" + response.RETCODE + ")", null, null, function () {
                                        self.reset(true);
                                    });
                                }
                            } else {
                                response.MOBPHNO = response.MOBPHNO_Show;
                                if (typeof(self.onClick) === "function") {
                                    self.onClick(response);
                                }
                            }
                        },
                        onError: function (state, response) {
                            alert("错误：" + response.RETMSG + "(" + response.RETCODE + ")", null, null, function () {
                                self.reset(true);
                            });
                        }
                    });
                    model.refresh();
                }else{
                    Bridge.alert('请填写手机号！');
                }
            },
            _setTimer: function (t) {
                t = t - 1;
                this.$el.html(this.afterClickText + "(" + t + "秒)");
                if (t >= 0) {
                    var self = this;
                    this.timer = window.setTimeout(function () {
                        self._setTimer(t);
                    }, 1000);
                } else {
                    this.reset();
                    if (typeof(this.onTimerOver) === "function") {
                        this.onTimerOver();
                    }
                }
            },
            reset: function (resend) {
                window.clearTimeout(this.timer);
                this.$el.removeAttr("disabled");
                this.$el.css("background", "");
                this.$el.html(this.beforeClickText);
                if (resend && typeof(this.onRecet) === "function") {
                    this.onRecet();
                }
            },
            getParam: function () {
                var retParam = {};
                if (typeof(this.setParam) === "function") {
                    retParam = this.setParam();
                }
                retParam["INFOTEXT"] = "短信内容";
                return retParam;
            }
        });

        /**
         * 格式化金额组件
         * getValue:function(){return this.model.get("value")}
         * getText:function(){return this.$el.val()}
         * setText:function(val){this.$el.val(val)}
         * */

        Component.FormatAmount = Component.Input.extend({
            initialize: function (param) {
                _.defaults(this, {defMod: "FormatAmount"});
                this._super(param);

                this.maxLength = this.$el.data("v-max-len") || 13;
                this.bindEvent("focus", function (e) {
                    if (this.getValue()) {
                        this.setText(this.getValue(), false);
                        e.currentTarget.selectionStart = this.getValue().length;
                    }
                });
                this.bindEvent("blur", function () {
                    if (this.getValue()) {
                        this.setText(this.getValue(), true);
                    }
                });
                this.bindEvent("keypress", function () {
                    if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode==46))){
                        event.returnValue=false;
                    }else if (this.getText()) {
                        var val = this.getText();
                        var l = val.split(".")[0]||"",
                            r = val.split(".")[1]||"",
                            sl = val.split(".").length||0;
                        var selectText = this._getSelection()||"";
                        if(sl == 2 && event.keyCode==46){
                            event.returnValue=false;
                        }
                        if(selectText==""){
                            if(event.keyCode!=46){
                                if(sl == 2){
                                    if(r!="" && r.length>=2){
                                        event.returnValue=false;
                                    }
                                }else{
                                    if( l.length >= this.maxLength ){
                                        event.returnValue=false;
                                    }
                                }
                            }
                        }
                    }
                });
            },
            onInputChange: function (val) {
                if (val) {
                    if(!/^(\d{1,13}(\.\d{0,2})?)$/.test(val)){
                        val = val.replace(/[^\d\.]/g, "");
                        this.setText(val, false);
                    }
                    val = val + "";
                    var l = val.split(".")[0],
                        r = val.split(".")[1];
                    var t = l.length > this.maxLength ? l.substr(0, this.maxLength) : l;
                    var value = r ? t + "." + r.substr(0, 2) : t;
                    this.setValue(value,{silent:true});
                } else {
                    this.setValue("",{silent:true});
                    this.setText("", false);
                }
            },
            getText: function () {
                return this.$el.val();
            },
            setText: function (val, bol) {
                val = val + "";
                var l = val.split(".")[0],
                    r = val.split(".")[1],
                    sl = val.split(".").length;
                var t = l.length > this.maxLength ? l.substr(0, this.maxLength) : l;
                if (sl == 2 && val.substr(val.length - 1, 1) == ".") {
                    t = t + ".";
                }
                if (!r && sl == 3) {
                    t = t + ".";
                }
                var text = r ? t + "." + r.substr(0, 2) : t;
                if (bol) {
                    this.$el.val(this._formatNum(text, 2));
                } else {
                    this.$el.val(text);
                }
            },
            _formatNum: function (s, n) {
                n = n > 0 && n <= 20 ? n : 2;
                s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(2) + "";
                var l = s.split(".")[0].split("").reverse(),
                    r = s.split(".")[1],
                    t = "";
                for (var i = 0; i < l.length; i++) {
                    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
                }
                t = t.split("").reverse().join("");
                return r ? t + "." + r.substr(0, 2) : t;
            },
            _getSelection: function(){
                if(window.getSelection()){
                    return window.getSelection().toString();
                }else if(document.selection && document.selection.createRange()){
                    return document.selection.createRange().text;
                }
                return "";
            },
            finalRender: function() {
                if (this.getValue()) {
                    this.setText(this.getValue(), true);
                }
            }
        });

        Component.FormatAmount1 = Component.FormatAmount.extend({
            setText: function (val, bol) {
                val = val + "";
                var l = val.split(".")[0],
                    r = val.split(".")[1],
                    sl = val.split(".").length;
                var t = l.length > this.maxLength ? l.substr(0, this.maxLength) : l;
                if (sl == 2 && val.substr(val.length - 1, 1) == ".") {
                    t = t + ".";
                }
                if (!r && sl == 3) {
                    t = t + ".";
                }
                var text = r ? t + "." + r.substr(0, 2) : t;
                if (bol) {
                    if(parseFloat(val)){
                        this.$el.val(this._formatNum(text, 2));
                    } else {
                        this.$el.val("--");
                    }
                } else {
                    this.$el.val(text);
                }
            }
        });

        //带粘帖功能的数字输入框
        Component.NumInput = Component.Password.extend({
            initialize: function(param){
                this._super(param);

                var self = this;
                var $id = self.id + _.uniqueId();

                this.bindEvent("touchstart", function(){
                    event.stopPropagation();
                    if(!$("#" + $id)[0]){
                        $(self.$el[0].parentNode).append("<span id='" + $id + "' class='pasteBtn'></span>");
                        $("#" + $id)[0].ontouchstart = function () {
                            event.stopPropagation();
                            Bridge.openActivity("StickString", null, function (data) {
                                self.setValue(data.stickStr);
                            });
                            $("#" + $id).remove();
                        };
                    }
                });

                $("body")[0].ontouchstart = function(){
                    $("#" + $id).remove();
                };
            }
        });

        Component.SwitchBox = Component.Base.extend({
            initialize: function (param) {
                this._super(param);

                var model = this.model;
                model.mapping.value = api.getTypeVal('String', model.mapping.name, 'value');

                var self = this;

                self.bindEvent("click", function (event) {
                    var val = event.target.checked;
                    if (_.isFunction(self.onSwitch)) {
                        self.onSwitch(val, event);
                    }
                    model.setValue(val, {silent: true});
                });

                // 初始化
                var initVal = model.getValue() || self.el.checked;
                model.setValue(initVal, {silent: true});

            },
            onSwitch: function (val, event) {
                // 预留事件处理
            },
            doRender: function () {
                // 页面同步
                this.el.checked = this.model.getValue();
                return true;
            }
        });

        Component.CBCheckBox = Component.Base.extend({
            initialize: function (param) {
                this._super(param);

                var model = this.model;
                model.mapping.value = api.getTypeVal('String', model.mapping.name, 'value');

                // 页面赋值
                this.text = $('<label for="' + this.id + '" style="display:inline"></label>');
                this.text.insertAfter(this.$el);
                this.textTemplate = Template.obtainTemplate(this.$el.data("text-template") || "CheckBox");

                var self = this;

                self.bindEvent("click", function (event) {
                    var val = event.target.checked;
                    if (_.isFunction(self.onCheck)) {
                        self.onCheck(val, event);
                    }
                    model.setValue(val, {silent: true});
                });

                // 初始化
                var initVal = model.getValue() || self.el.checked;
                model.setValue(initVal, {silent: true});

            },
            onCheck: function (val, event) {
                // 预留事件处理
                this.toggle(val);
            },
            toggle: function (val) {
                // 处理页面逻辑
            },
            doRender: function () {
                // 页面首次同步
                this.el.checked = this.model.getValue();
                this.text.html(this.textTemplate(this.model.toJSON()));
                return true;
            },
            finalRefresh: function() {
                // 数据刷新
                this.toggle(this.getValue());
            }
        });
    });