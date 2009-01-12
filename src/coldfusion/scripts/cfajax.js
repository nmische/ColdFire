/*ADOBE SYSTEMS INCORPORATED
Copyright 2007 Adobe Systems Incorporated
All Rights Reserved.

NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
terms of the Adobe license agreement accompanying it.  If you have received this file from a
source other than Adobe, then your use, modification, or distribution of it requires the prior
written permission of Adobe.*/


	


function cfinit(){
if(!window.ColdFusion){
ColdFusion={};
var $C=ColdFusion;
if(!$C.Ajax){
$C.Ajax={};
}
var $A=$C.Ajax;
if(!$C.AjaxProxy){
$C.AjaxProxy={};
}
var $X=$C.AjaxProxy;
if(!$C.Bind){
$C.Bind={};
}
var $B=$C.Bind;
if(!$C.Event){
$C.Event={};
}
var $E=$C.Event;
if(!$C.Log){
$C.Log={};
}
var $L=$C.Log;
if(!$C.Util){
$C.Util={};
}
var $U=$C.Util;
if(!$C.DOM){
$C.DOM={};
}
var $D=$C.DOM;
if(!$C.Spry){
$C.Spry={};
}
var $S=$C.Spry;
if(!$C.Pod){
$C.Pod={};
}
var $P=$C.Pod;
if(!$C.objectCache){
$C.objectCache={};
}
if(!$C.required){
$C.required={};
}
if(!$C.importedTags){
$C.importedTags=[];
}
if(!$C.requestCounter){
$C.requestCounter=0;
}
if(!$C.bindHandlerCache){
$C.bindHandlerCache={};
}
window._cf_loadingtexthtml="<div style=\"text-align: center;\">"+window._cf_loadingtexthtml+"&nbsp;"+CFMessage["loading"]+"</div>";
$C.globalErrorHandler=function(_b,_c){
if($L.isAvailable){
$L.error(_b,_c);
}
if($C.userGlobalErrorHandler){
$C.userGlobalErrorHandler(_b);
}
if(!$L.isAvailable&&!$C.userGlobalErrorHandler){
alert(_b+CFMessage["globalErrorHandler.alert"]);
}
};
$C.handleError=function(_d,_e,_f,_10,_11,_12,_13){
var msg=$L.format(_e,_10);
if(_d){
$L.error(msg,"http");
if(!_11){
_11=-1;
}
if(!_12){
_12=msg;
}
_d(_11,_12);
}else{
if(_13){
$L.error(msg,"http");
throw msg;
}else{
$C.globalErrorHandler(msg,_f);
}
}
};
$C.setGlobalErrorHandler=function(_15){
$C.userGlobalErrorHandler=_15;
};
$A.createXMLHttpRequest=function(){
var _16=["Microsoft.XMLHTTP","MSXML2.XMLHTTP.5.0","MSXML2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP"];
for(var i=0;i<_16.length;i++){
try{
return new ActiveXObject(_16[i]);
}
catch(e){
}
}
try{
return new XMLHttpRequest();
}
catch(e){
}
return false;
};
$A.isRequestError=function(req){
return ((req.status!=0&&req.status!=200)||req.getResponseHeader("server-error"));
};
$A.sendMessage=function(url,_1a,_1b,_1c,_1d,_1e,_1f){
var req=$A.createXMLHttpRequest();
if(!_1a){
_1a="GET";
}
if(_1c&&_1d){
req.onreadystatechange=function(){
$A.callback(req,_1d,_1e);
};
}
var _cf_nodebug_value = (window._coldfireForceDebug)?"false":"true";
if(_1b){
_1b+="&_cf_nodebug=" + _cf_nodebug_value + "&_cf_nocache=true";
}else{
_1b="_cf_nodebug=" + _cf_nodebug_value + "&_cf_nocache=true";
}
if(window._cf_clientid){
_1b+="&_cf_clientid="+_cf_clientid;
}
if(_1a=="GET"){
if(_1b){
_1b+="&_cf_rc="+($C.requestCounter++);
if(url.indexOf("?")==-1){
url+="?"+_1b;
}else{
url+="&"+_1b;
}
}
$L.info("ajax.sendmessage.get","http",[url]);
req.open(_1a,url,_1c);
req.send(null);
}else{
$L.info("ajax.sendmessage.post","http",[url,_1b]);
req.open(_1a,url,_1c);
req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
if(_1b){
req.send(_1b);
}else{
req.send(null);
}
}
if(!_1c){
while(req.readyState!=4){
}
if($A.isRequestError(req)){
$C.handleError(null,"ajax.sendmessage.error","http",[req.status,req.statusText],req.status,req.statusText,_1f);
}else{
return req;
}
}
};
$A.callback=function(req,_22,_23){
if(req.readyState!=4){
return;
}
_22(req,_23);
};
$A.submitForm=function(_24,url,_26,_27,_28,_29){
var _2a=$C.getFormQueryString(_24);
if(_2a==-1){
$C.handleError(_27,"ajax.submitform.formnotfound","http",[_24],-1,null,true);
return;
}
if(!_28){
_28="POST";
}
_29=!(_29===false);
var _2b=function(req){
$A.submitForm.callback(req,_24,_26,_27);
};
$L.info("ajax.submitform.submitting","http",[_24]);
var _2d=$A.sendMessage(url,_28,_2a,_29,_2b);
if(!_29){
$L.info("ajax.submitform.success","http",[_24]);
return _2d.responseText;
}
};
$A.submitForm.callback=function(req,_2f,_30,_31){
if($A.isRequestError(req)){
$C.handleError(_31,"ajax.submitform.error","http",[req.status,_2f,req.statusText],req.status,req.statusText);
}else{
$L.info("ajax.submitform.success","http",[_2f]);
if(_30){
_30(req.responseText);
}
}
};
$C.empty=function(){
};
$C.setSubmitClicked=function(_32,_33){
var el=$D.getElement(_33,_32);
el.cfinputbutton=true;
$C.setClickedProperty=function(){
el.clicked=true;
};
$E.addListener(el,"click",$C.setClickedProperty);
};
$C.getFormQueryString=function(_35,_36){
var _37;
if(typeof _35=="string"){
_37=(document.getElementById(_35)||document.forms[_35]);
}else{
if(typeof _35=="object"){
_37=_35;
}
}
if(!_37||null==_37.elements){
return -1;
}
var _38,elementName,elementValue,elementDisabled;
var _39=false;
var _3a=(_36)?{}:"";
for(var i=0;i<_37.elements.length;i++){
_38=_37.elements[i];
elementDisabled=_38.disabled;
elementName=_38.name;
elementValue=_38.value;
if(!elementDisabled&&elementName){
switch(_38.type){
case "select-one":
case "select-multiple":
for(var j=0;j<_38.options.length;j++){
if(_38.options[j].selected){
if(window.ActiveXObject){
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,_38.options[j].attributes["value"].specified?_38.options[j].value:_38.options[j].text);
}else{
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,_38.options[j].hasAttribute("value")?_38.options[j].value:_38.options[j].text);
}
}
}
break;
case "radio":
case "checkbox":
if(_38.checked){
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,elementValue);
}
break;
case "file":
case undefined:
case "reset":
case "button":
break;
case "submit":
if(_38.cfinputbutton){
if(_39==false&&_38.clicked){
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,elementValue);
_39=true;
}
}else{
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,elementValue);
}
break;
case "textarea":
var _3d;
if(window.FCKeditorAPI&&(_3d=$C.objectCache[elementName])&&_3d.richtextid){
var _3e=FCKeditorAPI.GetInstance(_3d.richtextid);
if(_3e){
elementValue=_3e.GetXHTML();
}
}
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,elementValue);
break;
default:
_3a=$C.getFormQueryString.processFormData(_3a,_36,elementName,elementValue);
break;
}
}
}
if(!_36){
_3a=_3a.substr(0,_3a.length-1);
}
return _3a;
};
$C.getFormQueryString.processFormData=function(_3f,_40,_41,_42){
if(_40){
if(_3f[_41]){
_3f[_41]+=","+_42;
}else{
_3f[_41]=_42;
}
}else{
_3f+=encodeURIComponent(_41)+"="+encodeURIComponent(_42)+"&";
}
return _3f;
};
$A.importTag=function(_43){
$C.importedTags.push(_43);
};
$A.checkImportedTag=function(_44){
var _45=false;
for(var i=0;i<$C.importedTags.length;i++){
if($C.importedTags[i]==_44){
_45=true;
break;
}
}
if(!_45){
$C.handleError(null,"ajax.checkimportedtag.error","widget",[_44]);
}
};
$C.getElementValue=function(_47,_48,_49){
if(!_47){
$C.handleError(null,"getelementvalue.noelementname","bind",null,null,null,true);
return;
}
if(!_49){
_49="value";
}
var _4a=$B.getBindElementValue(_47,_48,_49);
if(typeof (_4a)=="undefined"){
_4a=null;
}
if(_4a==null){
$C.handleError(null,"getelementvalue.elnotfound","bind",[_47,_49],null,null,true);
return;
}
return _4a;
};
$B.getBindElementValue=function(_4b,_4c,_4d,_4e,_4f){
var _50="";
if(window[_4b]){
var _51=eval(_4b);
if(_51&&_51._cf_getAttribute){
_50=_51._cf_getAttribute(_4d);
return _50;
}
}
var _52=$C.objectCache[_4b];
if(_52&&_52._cf_getAttribute){
_50=_52._cf_getAttribute(_4d);
return _50;
}
var el=$D.getElement(_4b,_4c);
var _54=(el&&((!el.length&&el.length!=0)||(el.length&&el.length>0)||el.tagName=="SELECT"));
if(!_54&&!_4f){
$C.handleError(null,"bind.getbindelementvalue.elnotfound","bind",[_4b]);
return null;
}
if(el.tagName!="SELECT"){
if(el.length>1){
var _55=true;
for(var i=0;i<el.length;i++){
var _57=(el[i].getAttribute("type")=="radio"||el[i].getAttribute("type")=="checkbox");
if(!_57||(_57&&el[i].checked)){
if(!_55){
_50+=",";
}
_50+=$B.getBindElementValue.extract(el[i],_4d);
_55=false;
}
}
}else{
_50=$B.getBindElementValue.extract(el,_4d);
}
}else{
var _55=true;
for(var i=0;i<el.options.length;i++){
if(el.options[i].selected){
if(!_55){
_50+=",";
}
_50+=$B.getBindElementValue.extract(el.options[i],_4d);
_55=false;
}
}
}
if(typeof (_50)=="object"){
$C.handleError(null,"bind.getbindelementvalue.simplevalrequired","bind",[_4b,_4d]);
return null;
}
if(_4e&&$C.required[_4b]&&_50.length==0){
return null;
}
return _50;
};
$B.getBindElementValue.extract=function(el,_59){
var _5a=el[_59];
if((_5a==null||typeof (_5a)=="undefined")&&el.getAttribute){
_5a=el.getAttribute(_59);
}
return _5a;
};
$L.init=function(){
if(window.YAHOO&&YAHOO.widget&&YAHOO.widget.Logger){
YAHOO.widget.Logger.categories=[CFMessage["debug"],CFMessage["info"],CFMessage["error"],CFMessage["window"]];
YAHOO.widget.LogReader.prototype.formatMsg=function(_5b){
var _5c=_5b.category;
return "<p>"+"<span class='"+_5c+"'>"+_5c+"</span>:<i>"+_5b.source+"</i>: "+_5b.msg+"</p>";
};
var _5d=new YAHOO.widget.LogReader(null,{width:"30em",fontSize:"100%"});
_5d.setTitle(CFMessage["log.title"]||"ColdFusion AJAX Logger");
_5d._btnCollapse.value=CFMessage["log.collapse"]||"Collapse";
_5d._btnPause.value=CFMessage["log.pause"]||"Pause";
_5d._btnClear.value=CFMessage["log.clear"]||"Clear";
$L.isAvailable=true;
}
};
$L.log=function(_5e,_5f,_60,_61){
if(!$L.isAvailable){
return;
}
if(!_60){
_60="global";
}
_60=CFMessage[_60]||_60;
_5f=CFMessage[_5f]||_5f;
_5e=$L.format(_5e,_61);
YAHOO.log(_5e,_5f,_60);
};
$L.format=function(_62,_63){
var msg=CFMessage[_62]||_62;
if(_63){
for(i=0;i<_63.length;i++){
if(!_63[i].length){
_63[i]="";
}
var _65="{"+i+"}";
msg=msg.replace(_65,_63[i]);
}
}
return msg;
};
$L.debug=function(_66,_67,_68){
$L.log(_66,"debug",_67,_68);
};
$L.info=function(_69,_6a,_6b){
$L.log(_69,"info",_6a,_6b);
};
$L.error=function(_6c,_6d,_6e){
$L.log(_6c,"error",_6d,_6e);
};
$L.dump=function(_6f,_70){
if($L.isAvailable){
var _71=(/string|number|undefined|boolean/.test(typeof (_6f))||_6f==null)?_6f:recurse(_6f,typeof _6f,true);
$L.debug(_71,_70);
}
};
$X.invoke=function(_72,_73,_74,_75){
var _76="method="+_73;
var _77=_72.returnFormat||"json";
_76+="&returnFormat="+_77;
if(_72.queryFormat){
_76+="&queryFormat="+_72.queryFormat;
}
if(_72.formId){
var _78=$C.getFormQueryString(_72.formId,true);
if(_74!=null){
for(prop in _78){
_74[prop]=_78[prop];
}
}else{
_74=_78;
}
_72.formId=null;
}
var _79="";
if(_74!=null){
_79=$X.JSON.encode(_74);
_76+="&argumentCollection="+encodeURIComponent(_79);
}
$L.info("ajaxproxy.invoke.invoking","http",[_72.cfcPath,_73,_79]);
if(_72.callHandler){
_72.callHandler.call(null,_72.callHandlerParams,_72.cfcPath,_76);
return;
}
var _7a;
if(_72.async){
_7a=function(req){
$X.callback(req,_72,_75);
};
}
var req=$A.sendMessage(_72.cfcPath,_72.httpMethod,_76,_72.async,_7a,null,true);
if(!_72.async){
return $X.processResponse(req,_72);
}
};
$X.callback=function(req,_7e,_7f){
if($A.isRequestError(req)){
$C.handleError(_7e.errorHandler,"ajaxproxy.invoke.error","http",[req.status,_7e.cfcPath,req.statusText],req.status,req.statusText);
}else{
if(_7e.callbackHandler){
var _80=$X.processResponse(req,_7e);
_7e.callbackHandler(_80,_7f);
}
}
};
$X.processResponse=function(req,_82){
var _83=true;
for(var i=0;i<req.responseText.length;i++){
var c=req.responseText.charAt(i);
_83=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_83){
break;
}
}
var _86=(req.responseXML&&req.responseXML.childNodes.length>0);
var _87=_86?"[XML Document]":req.responseText;
$L.info("ajaxproxy.invoke.response","http",[_87]);
var _88;
var _89=_82.returnFormat||"json";
if(_89=="json"){
_88=_83?null:$X.JSON.decode(req.responseText);
}else{
_88=_86?req.responseXML:(_83?null:req.responseText);
}
return _88;
};
$X.init=function(_8a,_8b){
var _8c=_8b.split(".");
var ns=self;
for(i=0;i<_8c.length-1;i++){
if(_8c[i].length){
ns[_8c[i]]=ns[_8c[i]]||{};
ns=ns[_8c[i]];
}
}
var _8e=_8c[_8c.length-1];
if(ns[_8e]){
return ns[_8e];
}
ns[_8e]=function(){
this.httpMethod="GET";
this.async=false;
this.callbackHandler=null;
this.errorHandler=null;
this.formId=null;
};
ns[_8e].prototype.cfcPath=_8a;
ns[_8e].prototype.setHTTPMethod=function(_8f){
if(_8f){
_8f=_8f.toUpperCase();
}
if(_8f!="GET"&&_8f!="POST"){
$C.handleError(null,"ajaxproxy.sethttpmethod.invalidmethod","http",[_8f],null,null,true);
}
this.httpMethod=_8f;
};
ns[_8e].prototype.setSyncMode=function(){
this.async=false;
};
ns[_8e].prototype.setAsyncMode=function(){
this.async=true;
};
ns[_8e].prototype.setCallbackHandler=function(fn){
this.callbackHandler=fn;
this.setAsyncMode();
};
ns[_8e].prototype.setErrorHandler=function(fn){
this.errorHandler=fn;
this.setAsyncMode();
};
ns[_8e].prototype.setForm=function(fn){
this.formId=fn;
};
ns[_8e].prototype.setQueryFormat=function(_93){
if(_93){
_93=_93.toLowerCase();
}
if(!_93||(_93!="column"&&_93!="row")){
$C.handleError(null,"ajaxproxy.setqueryformat.invalidformat","http",[_93],null,null,true);
}
this.queryFormat=_93;
};
ns[_8e].prototype.setReturnFormat=function(_94){
if(_94){
_94=_94.toLowerCase();
}
if(!_94||(_94!="plain"&&_94!="json"&&_94!="wddx")){
$C.handleError(null,"ajaxproxy.setreturnformat.invalidformat","http",[_94],null,null,true);
}
this.returnFormat=_94;
};
$L.info("ajaxproxy.init.created","http",[_8a]);
return ns[_8e];
};
$U.isWhitespace=function(s){
var _96=true;
for(var i=0;i<s.length;i++){
var c=s.charAt(i);
_96=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_96){
break;
}
}
return _96;
};
$U.getFirstNonWhitespaceIndex=function(s){
var _9a=true;
for(var i=0;i<s.length;i++){
var c=s.charAt(i);
_9a=(c==" "||c=="\n"||c=="\t"||c=="\r");
if(!_9a){
break;
}
}
return i;
};
$C.trim=function(_9d){
return _9d.replace(/^\s+|\s+$/g,"");
};
$U.isInteger=function(n){
var _9f=true;
if(typeof (n)=="number"){
_9f=(n>=0);
}else{
for(i=0;i<n.length;i++){
if($U.isInteger.numberChars.indexOf(n.charAt(i))==-1){
_9f=false;
break;
}
}
}
return _9f;
};
$U.isInteger.numberChars="0123456789";
$U.isArray=function(a){
return (typeof (a.length)=="number"&&!a.toUpperCase);
};
$U.isBoolean=function(b){
if(b===true||b===false){
return true;
}else{
if(b.toLowerCase){
b=b.toLowerCase();
return (b==$U.isBoolean.trueChars||b==$U.isBoolean.falseChars);
}else{
return false;
}
}
};
$U.isBoolean.trueChars="true";
$U.isBoolean.falseChars="false";
$U.castBoolean=function(b){
if(b===true){
return true;
}else{
if(b===false){
return false;
}else{
if(b.toLowerCase){
b=b.toLowerCase();
if(b==$U.isBoolean.trueChars){
return true;
}else{
if(b==$U.isBoolean.falseChars){
return false;
}else{
return false;
}
}
}else{
return false;
}
}
}
};
$U.checkQuery=function(o){
var _a4=null;
if(o&&o.COLUMNS&&$U.isArray(o.COLUMNS)&&o.DATA&&$U.isArray(o.DATA)&&(o.DATA.length==0||(o.DATA.length>0&&$U.isArray(o.DATA[0])))){
_a4="row";
}else{
if(o&&o.COLUMNS&&$U.isArray(o.COLUMNS)&&o.ROWCOUNT&&$U.isInteger(o.ROWCOUNT)&&o.DATA){
_a4="col";
for(var i=0;i<o.COLUMNS.length;i++){
var _a6=o.DATA[o.COLUMNS[i]];
if(!_a6||!$U.isArray(_a6)){
_a4=null;
break;
}
}
}
}
return _a4;
};
$X.JSON=new function(){
var _a7={}.hasOwnProperty?true:false;
var _a8=/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/;
var pad=function(n){
return n<10?"0"+n:n;
};
var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"};
var _ac=function(s){
if(/["\\\x00-\x1f]/.test(s)){
return "\""+s.replace(/([\x00-\x1f\\"])/g,function(a,b){
var c=m[b];
if(c){
return c;
}
c=b.charCodeAt();
return "\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16);
})+"\"";
}
return "\""+s+"\"";
};
var _b1=function(o){
var a=["["],b,i,l=o.length,v;
for(i=0;i<l;i+=1){
v=o[i];
switch(typeof v){
case "undefined":
case "function":
case "unknown":
break;
default:
if(b){
a.push(",");
}
a.push(v===null?"null":$X.JSON.encode(v));
b=true;
}
}
a.push("]");
return a.join("");
};
var _b4=function(o){
return "\""+o.getFullYear()+"-"+pad(o.getMonth()+1)+"-"+pad(o.getDate())+"T"+pad(o.getHours())+":"+pad(o.getMinutes())+":"+pad(o.getSeconds())+"\"";
};
this.encode=function(o){
if(typeof o=="undefined"||o===null){
return "null";
}else{
if(o instanceof Array){
return _b1(o);
}else{
if(o instanceof Date){
return _b4(o);
}else{
if(typeof o=="string"){
return _ac(o);
}else{
if(typeof o=="number"){
return isFinite(o)?String(o):"null";
}else{
if(typeof o=="boolean"){
return String(o);
}else{
var a=["{"],b,i,v;
for(var i in o){
if(!_a7||o.hasOwnProperty(i)){
v=o[i];
switch(typeof v){
case "undefined":
case "function":
case "unknown":
break;
default:
if(b){
a.push(",");
}
a.push(this.encode(i),":",v===null?"null":this.encode(v));
b=true;
}
}
}
a.push("}");
return a.join("");
}
}
}
}
}
}
};
this.decode=function(_b9){
if($U.isWhitespace(_b9)){
return null;
}
var _ba=$U.getFirstNonWhitespaceIndex(_b9);
if(_ba>0){
_b9=_b9.slice(_ba);
}
if(window._cf_jsonprefix&&_b9.indexOf(_cf_jsonprefix)==0){
_b9=_b9.slice(_cf_jsonprefix.length);
}
try{
if(_a8.test(_b9)){
return eval("("+_b9+")");
}
}
catch(e){
}
throw new SyntaxError("parseJSON");
};
}();
if(!$C.JSON){
$C.JSON={};
}
$C.JSON.encode=$X.JSON.encode;
$C.JSON.decode=$X.JSON.decode;
$C.navigate=function(url,_bc,_bd,_be,_bf,_c0){
if(url==null){
$C.handleError(_be,"navigate.urlrequired","widget");
return;
}
if(_bf){
_bf=_bf.toUpperCase();
if(_bf!="GET"&&_bf!="POST"){
$C.handleError(null,"navigate.invalidhttpmethod","http",[_bf],null,null,true);
}
}else{
_bf="GET";
}
var _c1;
if(_c0){
_c1=$C.getFormQueryString(_c0);
if(_c1==-1){
$C.handleError(null,"navigate.formnotfound","http",[_c0],null,null,true);
}
}
if(_bc==null){
if(_c1){
if(url.indexOf("?")==-1){
url+="?"+_c1;
}else{
url+="&"+_c1;
}
}
$L.info("navigate.towindow","widget",[url]);
window.location.replace(url);
return;
}
$L.info("navigate.tocontainer","widget",[url,_bc]);
var obj=$C.objectCache[_bc];
if(obj!=null){
if(typeof (obj._cf_body)!="undefined"&&obj._cf_body!=null){
_bc=obj._cf_body;
}
}
$A.replaceHTML(_bc,url,_bf,_c1,_bd,_be);
};
$A.checkForm=function(_c3,_c4,_c5,_c6,_c7){
var _c8=_c4.call(null,_c3);
if(_c8==false){
return false;
}
var _c9=$C.getFormQueryString(_c3);
$L.info("ajax.submitform.submitting","http",[_c3.name]);
$A.replaceHTML(_c5,_c3.action,_c3.method,_c9,_c6,_c7);
return false;
};
$A.replaceHTML=function(_ca,url,_cc,_cd,_ce,_cf){
var _d0=document.getElementById(_ca);
if(!_d0){
$C.handleError(_cf,"ajax.replacehtml.elnotfound","http",[_ca]);
return;
}
var _d1="_cf_containerId="+encodeURIComponent(_ca);
_cd=(_cd)?_cd+"&"+_d1:_d1;
$L.info("ajax.replacehtml.replacing","http",[_ca,url,_cd]);
if(_cf_loadingtexthtml){
try{
_d0.innerHTML=_cf_loadingtexthtml;
}
catch(e){
}
}
var _d2=function(req,_d4){
var _d5=false;
if($A.isRequestError(req)){
$C.handleError(_cf,"ajax.replacehtml.error","http",[req.status,_d4.id,req.statusText],req.status,req.statusText);
_d5=true;
}
var _d6=new $E.CustomEvent("onReplaceHTML",_d4);
var _d7=new $E.CustomEvent("onReplaceHTMLUser",_d4);
$E.loadEvents[_d4.id]={system:_d6,user:_d7};
if(req.responseText.search(/<script/i)!=-1){
try{
_d4.innerHTML="";
}
catch(e){
}
$A.replaceHTML.processResponseText(req.responseText,_d4,_cf);
}else{
try{
_d4.innerHTML=req.responseText;
}
catch(e){
}
}
$E.loadEvents[_d4.id]=null;
_d6.fire();
_d6.unsubscribe();
_d7.fire();
_d7.unsubscribe();
$L.info("ajax.replacehtml.success","http",[_d4.id]);
if(_ce&&!_d5){
_ce();
}
};
try{
$A.sendMessage(url,_cc,_cd,true,_d2,_d0);
}
catch(e){
try{
_d0.innerHTML=$L.format(CFMessage["ajax.replacehtml.connectionerrordisplay"],[url,e]);
}
catch(e){
}
$C.handleError(_cf,"ajax.replacehtml.connectionerror","http",[_ca,url,e]);
}
};
$A.replaceHTML.processResponseText=function(_d8,_d9,_da){
var pos=0;
var _dc=0;
var _dd=0;
_d9._cf_innerHTML="";
while(pos<_d8.length){
var _de=_d8.indexOf("<s",pos);
if(_de==-1){
_de=_d8.indexOf("<S",pos);
}
if(_de==-1){
break;
}
pos=_de;
var _df=true;
var _e0=$A.replaceHTML.processResponseText.scriptTagChars;
for(var i=1;i<_e0.length;i++){
var _e2=pos+i+1;
if(_e2>_d8.length){
break;
}
var _e3=_d8.charAt(_e2);
if(_e0[i][0]!=_e3&&_e0[i][1]!=_e3){
pos+=i+1;
_df=false;
break;
}
}
if(!_df){
continue;
}
var _e4=_d8.substring(_dc,pos);
if(_e4){
_d9._cf_innerHTML+=_e4;
}
var _e5=_d8.indexOf(">",pos)+1;
if(_e5==0){
pos++;
continue;
}else{
pos+=7;
}
var _e6=_e5;
while(_e6<_d8.length&&_e6!=-1){
_e6=_d8.indexOf("</s",_e6);
if(_e6==-1){
_e6=_d8.indexOf("</S",_e6);
}
if(_e6!=-1){
_df=true;
for(var i=1;i<_e0.length;i++){
var _e2=_e6+2+i;
if(_e2>_d8.length){
break;
}
var _e3=_d8.charAt(_e2);
if(_e0[i][0]!=_e3&&_e0[i][1]!=_e3){
_e6=_e2;
_df=false;
break;
}
}
if(_df){
break;
}
}
}
if(_e6!=-1){
var _e7=_d8.substring(_e5,_e6);
var _e8=_e7.indexOf("<!--");
if(_e8!=-1){
_e7=_e7.substring(_e8+4);
}
var _e9=_e7.lastIndexOf("//-->");
if(_e9!=-1){
_e7=_e7.substring(0,_e9-1);
}
if(_e7.indexOf("document.write")!=-1){
_e7="var _cfDomNode = document.getElementById('"+_d9.id+"'); var _cfBuffer='';"+"if (!document._cf_write)"+"{document._cf_write = document.write;"+"document.write = function(str){if (_cfBuffer!=null){_cfBuffer+=str;}else{document._cf_write(str);}};};"+_e7+";_cfDomNode._cf_innerHTML += _cfBuffer; _cfBuffer=null;";
}
try{
eval(_e7);
}
catch(ex){
$C.handleError(_da,"ajax.replacehtml.jserror","http",[_d9.id,ex]);
}
}
_de=_d8.indexOf(">",_e6)+1;
if(_de==0){
_dd=_e6+1;
break;
}
_dd=_de;
pos=_de;
_dc=_de;
}
if(_dd<_d8.length-1){
var _e4=_d8.substring(_dd,_d8.length);
if(_e4){
_d9._cf_innerHTML+=_e4;
}
}
try{
_d9.innerHTML=_d9._cf_innerHTML;
}
catch(e){
}
_d9._cf_innerHTML="";
};
$A.replaceHTML.processResponseText.scriptTagChars=[["s","S"],["c","C"],["r","R"],["i","I"],["p","P"],["t","T"]];
$D.getElement=function(_ea,_eb){
var _ec=function(_ed){
return (_ed.name==_ea||_ed.id==_ea);
};
var _ee=$D.getElementsBy(_ec,null,_eb);
if(_ee.length==1){
return _ee[0];
}else{
return _ee;
}
};
$D.getElementsBy=function(_ef,tag,_f1){
tag=tag||"*";
var _f2=[];
if(_f1){
_f1=$D.get(_f1);
if(!_f1){
return _f2;
}
}else{
_f1=document;
}
var _f3=_f1.getElementsByTagName(tag);
if(!_f3.length&&(tag=="*"&&_f1.all)){
_f3=_f1.all;
}
for(var i=0,len=_f3.length;i<len;++i){
if(_ef(_f3[i])){
_f2[_f2.length]=_f3[i];
}
}
return _f2;
};
$D.get=function(el){
if(!el){
return null;
}
if(typeof el!="string"&&!(el instanceof Array)){
return el;
}
if(typeof el=="string"){
return document.getElementById(el);
}else{
var _f6=[];
for(var i=0,len=el.length;i<len;++i){
_f6[_f6.length]=$D.get(el[i]);
}
return _f6;
}
return null;
};
$E.loadEvents={};
$E.CustomEvent=function(_f8,_f9){
return {name:_f8,domNode:_f9,subs:[],subscribe:function(_fa,_fb){
var dup=false;
for(var i=0;i<this.subs.length;i++){
var sub=this.subs[i];
if(sub.f==_fa&&sub.p==_fb){
dup=true;
break;
}
}
if(!dup){
this.subs.push({f:_fa,p:_fb});
}
},fire:function(){
for(var i=0;i<this.subs.length;i++){
var sub=this.subs[i];
sub.f.call(null,this,sub.p);
}
},unsubscribe:function(){
this.subscribers=[];
}};
};
$E.windowLoadImpEvent=new $E.CustomEvent("cfWindowLoadImp");
$E.windowLoadEvent=new $E.CustomEvent("cfWindowLoad");
$E.windowLoadUserEvent=new $E.CustomEvent("cfWindowLoadUser");
$E.listeners=[];
$E.addListener=function(el,ev,fn,_104){
var l={el:el,ev:ev,fn:fn,params:_104};
$E.listeners.push(l);
var _106=function(e){
if(!e){
var e=window.event;
}
fn.call(null,e,_104);
};
if(el.addEventListener){
el.addEventListener(ev,_106,false);
return true;
}else{
if(el.attachEvent){
el.attachEvent("on"+ev,_106);
return true;
}else{
return false;
}
}
};
$E.isListener=function(el,ev,fn,_10b){
var _10c=false;
var ls=$E.listeners;
for(var i=0;i<ls.length;i++){
if(ls[i].el==el&&ls[i].ev==ev&&ls[i].fn==fn&&ls[i].params==_10b){
_10c=true;
break;
}
}
return _10c;
};
$E.callBindHandlers=function(id,_110,ev){
var el=document.getElementById(id);
if(!el){
return;
}
var ls=$E.listeners;
for(var i=0;i<ls.length;i++){
if(ls[i].el==el&&ls[i].ev==ev&&ls[i].fn._cf_bindhandler){
ls[i].fn.call(null,null,ls[i].params);
}
}
};
$E.registerOnLoad=function(func,_116,_117,user){
if($E.registerOnLoad.windowLoaded){
if(_116&&_116._cf_containerId&&$E.loadEvents[_116._cf_containerId]){
if(user){
$E.loadEvents[_116._cf_containerId].user.subscribe(func,_116);
}else{
$E.loadEvents[_116._cf_containerId].system.subscribe(func,_116);
}
}else{
func.call(null,null,_116);
}
}else{
if(user){
$E.windowLoadUserEvent.subscribe(func,_116);
}else{
if(_117){
$E.windowLoadImpEvent.subscribe(func,_116);
}else{
$E.windowLoadEvent.subscribe(func,_116);
}
}
}
};
$E.registerOnLoad.windowLoaded=false;
$E.onWindowLoad=function(fn){
if(window.addEventListener){
window.addEventListener("load",fn,false);
}else{
if(window.attachEvent){
window.attachEvent("onload",fn);
}else{
if(document.getElementById){
window.onload=fn;
}
}
}
};
$C.addSpanToDom=function(){
var _11a=document.createElement("span");
document.body.insertBefore(_11a,document.body.firstChild);
};
$E.windowLoadHandler=function(e){
if(window.Ext){
Ext.BLANK_IMAGE_URL=_cf_contextpath+"/CFIDE/scripts/ajax/resources/ext/images/default/s.gif";
}
$C.addSpanToDom();
$L.init();
$E.registerOnLoad.windowLoaded=true;
$E.windowLoadImpEvent.fire();
$E.windowLoadImpEvent.unsubscribe();
$E.windowLoadEvent.fire();
$E.windowLoadEvent.unsubscribe();
$E.windowLoadUserEvent.fire();
$E.windowLoadUserEvent.unsubscribe();
};
$E.onWindowLoad($E.windowLoadHandler);
$B.register=function(_11c,_11d,_11e,_11f){
for(var i=0;i<_11c.length;i++){
var _121=_11c[i][0];
var _122=_11c[i][1];
var _123=_11c[i][2];
if(window[_121]){
var _124=eval(_121);
if(_124&&_124._cf_register){
_124._cf_register(_123,_11e,_11d);
continue;
}
}
var _125=$C.objectCache[_121];
if(_125&&_125._cf_register){
_125._cf_register(_123,_11e,_11d);
continue;
}
var _126=$D.getElement(_121,_122);
var _127=(_126&&((!_126.length&&_126.length!=0)||(_126.length&&_126.length>0)||_126.tagName=="SELECT"));
if(!_127){
$C.handleError(null,"bind.register.elnotfound","bind",[_121]);
}
if(_126.length>1&&!_126.options){
for(var i=0;i<_126.length;i++){
$B.register.addListener(_126[i],_123,_11e,_11d);
}
}else{
$B.register.addListener(_126,_123,_11e,_11d);
}
}
if(!$C.bindHandlerCache[_11d.bindTo]&&typeof (_11d.bindTo)=="string"){
$C.bindHandlerCache[_11d.bindTo]=function(){
_11e.call(null,null,_11d);
};
}
if(_11f){
_11e.call(null,null,_11d);
}
};
$B.register.addListener=function(_128,_129,_12a,_12b){
if(!$E.isListener(_128,_129,_12a,_12b)){
$E.addListener(_128,_129,_12a,_12b);
}
};
$B.assignValue=function(_12c,_12d,_12e,_12f){
if(!_12c){
return;
}
if(_12c.call){
_12c.call(null,_12e,_12f);
return;
}
var _130=$C.objectCache[_12c];
if(_130&&_130._cf_setValue){
_130._cf_setValue(_12e);
return;
}
var _131=document.getElementById(_12c);
if(!_131){
$C.handleError(null,"bind.assignvalue.elnotfound","bind",[_12c]);
}
if(_131.tagName=="SELECT"){
var _132=$U.checkQuery(_12e);
var _133=$C.objectCache[_12c];
if(_132){
if(!_133||(_133&&(!_133.valueCol||!_133.displayCol))){
$C.handleError(null,"bind.assignvalue.selboxmissingvaldisplay","bind",[_12c]);
return;
}
}else{
if(typeof (_12e.length)=="number"&&!_12e.toUpperCase){
if(_12e.length>0&&(typeof (_12e[0].length)!="number"||_12e[0].toUpperCase)){
$C.handleError(null,"bind.assignvalue.selboxerror","bind",[_12c]);
return;
}
}else{
$C.handleError(null,"bind.assignvalue.selboxerror","bind",[_12c]);
return;
}
}
_131.options.length=0;
if(!_132){
for(var i=0;i<_12e.length;i++){
var opt=new Option(_12e[i][1],_12e[i][0]);
_131.options[i]=opt;
}
}else{
if(_132=="col"){
var _136=_12e.DATA[_133.valueCol];
var _137=_12e.DATA[_133.displayCol];
if(!_136||!_137){
$C.handleError(null,"bind.assignvalue.selboxinvalidvaldisplay","bind",[_12c]);
return;
}
for(var i=0;i<_136.length;i++){
var opt=new Option(_137[i],_136[i]);
_131.options[i]=opt;
}
}else{
if(_132=="row"){
var _138=-1;
var _139=-1;
for(var i=0;i<_12e.COLUMNS.length;i++){
var col=_12e.COLUMNS[i];
if(col==_133.valueCol){
_138=i;
}
if(col==_133.displayCol){
_139=i;
}
if(_138!=-1&&_139!=-1){
break;
}
}
if(_138==-1||_139==-1){
$C.handleError(null,"bind.assignvalue.selboxinvalidvaldisplay","bind",[_12c]);
return;
}
for(var i=0;i<_12e.DATA.length;i++){
var opt=new Option(_12e.DATA[i][_139],_12e.DATA[i][_138]);
_131.options[i]=opt;
}
}
}
}
}else{
_131[_12d]=_12e;
}
$E.callBindHandlers(_12c,null,"change");
$L.info("bind.assignvalue.success","bind",[_12e,_12c,_12d]);
};
$B.localBindHandler=function(e,_13c){
var _13d=document.getElementById(_13c.bindTo);
var _13e=$B.evaluateBindTemplate(_13c,true);
$B.assignValue(_13c.bindTo,_13c.bindToAttr,_13e);
};
$B.localBindHandler._cf_bindhandler=true;
$B.evaluateBindTemplate=function(_13f,_140,_141,_142){
var _143=_13f.bindExpr;
var _144="";
for(var i=0;i<_143.length;i++){
if(typeof (_143[i])=="object"){
var _146=$B.getBindElementValue(_143[i][0],_143[i][1],_143[i][2],_140,_142);
if(_146==null){
if(_140){
_144="";
break;
}else{
_146="";
}
}
if(_141){
_146=encodeURIComponent(_146);
}
_144+=_146;
}else{
_144+=_143[i];
}
}
return _144;
};
$B.jsBindHandler=function(e,_148){
var _149=_148.bindExpr;
var _14a=_148.callFunction+"(";
for(var i=0;i<_149.length;i++){
var _14c;
if(typeof (_149[i])=="object"){
_14c=$B.getBindElementValue(_149[i][0],_149[i][1],_149[i][2],false);
}else{
_14c=_149[i];
}
if(_14c&&_14c.replace){
_14c=_14c.replace(/\\/g,"\\\\");
_14c=_14c.replace(/\'/g,"\\'");
_14c=_14c.replace(/\r\n/g,"\\r\\n");
_14c=_14c.replace(/\n/g,"\\n");
_14c=_14c.replace(/\r/g,"\\r");
}
if(i!=0){
_14a+=",";
}
_14a+="'"+_14c+"'";
}
_14a+=")";
$L.info("bind.jsbindhandler.invoking","bind",[_14a]);
var _14d=eval(_14a);
$B.assignValue(_148.bindTo,_148.bindToAttr,_14d,_148.bindToParams);
};
$B.jsBindHandler._cf_bindhandler=true;
$B.urlBindHandler=function(e,_14f){
var _150=_14f.bindTo;
if($C.objectCache[_150]&&$C.objectCache[_150]._cf_visible===false){
$C.objectCache[_150]._cf_dirtyview=true;
return;
}
var url=$B.evaluateBindTemplate(_14f,false,true);
if(_14f.bindToAttr){
var _14f={"bindTo":_14f.bindTo,"bindToAttr":_14f.bindToAttr,"bindToParams":_14f.bindToParams,"errorHandler":_14f.errorHandler,"url":url};
try{
$A.sendMessage(url,"GET",null,true,$B.urlBindHandler.callback,_14f);
}
catch(e){
$C.handleError(_14f.errorHandler,"ajax.urlbindhandler.connectionerror","http",[url,e]);
}
}else{
$A.replaceHTML(_150,url,null,null,null,_14f.errorHandler);
}
};
$B.urlBindHandler._cf_bindhandler=true;
$B.urlBindHandler.callback=function(req,_153){
if($A.isRequestError(req)){
$C.handleError(_153.errorHandler,"bind.urlbindhandler.httperror","http",[req.status,_153.url,req.statusText],req.status,req.statusText);
}else{
$L.info("bind.urlbindhandler.response","http",[req.responseText]);
var _154;
try{
_154=$X.JSON.decode(req.responseText);
}
catch(e){
$C.handleError(_153.errorHandler,"bind.urlbindhandler.jsonerror","http",[req.responseText]);
}
$B.assignValue(_153.bindTo,_153.bindToAttr,_154,_153.bindToParams);
}
};
$A.initSelect=function(_155,_156,_157){
$C.objectCache[_155]={"valueCol":_156,"displayCol":_157};
};
$S.setupSpry=function(){
if(typeof (Spry)!="undefined"&&Spry.Data){
Spry.Data.DataSet.prototype._cf_getAttribute=function(_158){
var val;
var row=this.getCurrentRow();
if(row){
val=row[_158];
}
return val;
};
Spry.Data.DataSet.prototype._cf_register=function(_15b,_15c,_15d){
var obs={bindParams:_15d};
obs.onCurrentRowChanged=function(){
_15c.call(null,null,this.bindParams);
};
obs.onDataChanged=function(){
_15c.call(null,null,this.bindParams);
};
this.addObserver(obs);
};
if(Spry.Debug.trace){
var _15f=Spry.Debug.trace;
Spry.Debug.trace=function(str){
$L.info(str,"spry");
_15f(str);
};
}
if(Spry.Debug.reportError){
var _161=Spry.Debug.reportError;
Spry.Debug.reportError=function(str){
$L.error(str,"spry");
_161(str);
};
}
$L.info("spry.setupcomplete","bind");
}
};
$E.registerOnLoad($S.setupSpry,null,true);
$S.bindHandler=function(_163,_164){
var url;
var _cf_nodebug_value = (window._coldfireForceDebug)?"false":"true";
var _166="_cf_nodebug=" + _cf_nodebug_value + "&_cf_nocache=true";
if(window._cf_clientid){
_166+="&_cf_clientid="+_cf_clientid;
}
var _167=window[_164.bindTo];
var _168=(typeof (_167)=="undefined");
if(_164.cfc){
var _169={};
var _16a=_164.bindExpr;
for(var i=0;i<_16a.length;i++){
var _16c;
if(_16a[i].length==2){
_16c=_16a[i][1];
}else{
_16c=$B.getBindElementValue(_16a[i][1],_16a[i][2],_16a[i][3],false,_168);
}
_169[_16a[i][0]]=_16c;
}
_169=$X.JSON.encode(_169);
_166+="&method="+_164.cfcFunction;
_166+="&argumentCollection="+encodeURIComponent(_169);
$L.info("spry.bindhandler.loadingcfc","http",[_164.bindTo,_164.cfc,_164.cfcFunction,_169]);
url=_164.cfc;
}else{
url=$B.evaluateBindTemplate(_164,false,true,_168);
$L.info("spry.bindhandler.loadingurl","http",[_164.bindTo,url]);
}
var _16d=_164.options||{};
if((_167&&_167._cf_type=="json")||_164.dsType=="json"){
_166+="&returnformat=json";
}
if(_167){
if(_167.requestInfo.method=="GET"){
_16d.method="GET";
if(url.indexOf("?")==-1){
url+="?"+_166;
}else{
url+="&"+_166;
}
}else{
_16d.postData=_166;
_16d.method="POST";
_167.setURL("");
}
_167.setURL(url,_16d);
_167.loadData();
}else{
if(!_16d.method||_16d.method=="GET"){
if(url.indexOf("?")==-1){
url+="?"+_166;
}else{
url+="&"+_166;
}
}else{
_16d.postData=_166;
_16d.useCache=false;
}
var ds;
if(_164.dsType=="xml"){
ds=new Spry.Data.XMLDataSet(url,_164.xpath,_16d);
}else{
ds=new Spry.Data.JSONDataSet(url,_16d);
ds.preparseFunc=$S.preparseData;
}
ds._cf_type=_164.dsType;
var _16f={onLoadError:function(req){
$C.handleError(_164.errorHandler,"spry.bindhandler.error","http",[_164.bindTo,req.url,req.requestInfo.postData]);
}};
ds.addObserver(_16f);
window[_164.bindTo]=ds;
}
};
$S.bindHandler._cf_bindhandler=true;
$S.preparseData=function(ds,_172){
var _173=$U.getFirstNonWhitespaceIndex(_172);
if(_173>0){
_172=_172.slice(_173);
}
if(window._cf_jsonprefix&&_172.indexOf(_cf_jsonprefix)==0){
_172=_172.slice(_cf_jsonprefix.length);
}
return _172;
};
$P.init=function(_174){
$L.info("pod.init.creating","widget",[_174]);
var _175={};
_175._cf_body=_174+"_body";
$C.objectCache[_174]=_175;
};
$B.cfcBindHandler=function(e,_177){
var _178=(_177.httpMethod)?_177.httpMethod:"GET";
var _179={};
var _17a=_177.bindExpr;
for(var i=0;i<_17a.length;i++){
var _17c;
if(_17a[i].length==2){
_17c=_17a[i][1];
}else{
_17c=$B.getBindElementValue(_17a[i][1],_17a[i][2],_17a[i][3],false);
}
_179[_17a[i][0]]=_17c;
}
var _17d=function(_17e,_17f){
$B.assignValue(_17f.bindTo,_17f.bindToAttr,_17e,_17f.bindToParams);
};
var _180={"bindTo":_177.bindTo,"bindToAttr":_177.bindToAttr,"bindToParams":_177.bindToParams};
var _181={"async":true,"cfcPath":_177.cfc,"httpMethod":_178,"callbackHandler":_17d,"errorHandler":_177.errorHandler};
if(_177.proxyCallHandler){
_181.callHandler=_177.proxyCallHandler;
_181.callHandlerParams=_177;
}
$X.invoke(_181,_177.cfcFunction,_179,_180);
};
$B.cfcBindHandler._cf_bindhandler=true;
}
}
cfinit();
