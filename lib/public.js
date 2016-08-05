define(['js/core'],function(framework){
	var Bridge = framework.Bridge;
    var api = framework.api;
	
	Bridge.CommonSendMessage=function(plugin,method,param,callback){/*提取调用原生的公用方法*/
//      plugin包名  method方法名   param请求参数   callback回调函数
        var request={
            url:'client:///'+plugin+'?'+method,
            data:param,
            complete:function(state,data){
                if(state=='success'){
                    if(_.isFunction(callback)){
                        callback(data);
                    }
                }
            }
        }
        api.fetch(request);
    };
    /*展示加载框*/
    Bridge.showDialog = function(callback){
        var param ={
        };
        Bridge.CommonSendMessage("PTClient","showDialog",param,callback);
    };
    /*展示加载框*/
    Bridge.dismissDialog = function(callback){
        var param ={
        };
        Bridge.CommonSendMessage("PTClient","dismissDialog",param,callback);
    };
    /*获取数据*/
    Bridge.clientData = function(type,callback){
        var param ={
            type:type
        };
        Bridge.CommonSendMessage("PTClient","clientData",param,callback);
    };
	/*普通弹框*/
    Bridge.alert = function(msg,title,icon,callback){
        var param ={
            type:"1",
            title:title || "提示",
            log:icon || "3",
            content:msg
        };
        Bridge.CommonSendMessage('PTClient','alert',param,callback);
    };
    /*错误弹框*/
    Bridge.errorAlert = function(msg,title,icon,callback){
        var param ={
            type:"1",
            title:title || "提示",
            log:icon || "3",
            content:msg
        };
        Bridge.CommonSendMessage('PTClient','errorAlert',param,callback);
    };
});