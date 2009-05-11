/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Adam Podolnick.
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Adam Podolnick <podman@gmail.com>
 *     Nathan Mische <nmische@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


FBL.ns(function() { with (FBL) {
	
const Cc = Components.classes;
const Ci = Components.interfaces;
	
const STATE_START = Ci.nsIWebProgressListener.STATE_START;
const STATE_STOP = Ci.nsIWebProgressListener.STATE_STOP;
const STATE_IS_REQUEST = Ci.nsIWebProgressListener.STATE_IS_REQUEST;
const NOTIFY_ALL = Ci.nsIWebProgress.NOTIFY_ALL;
const nsIObserverService = Ci.nsIObserverService;
const observerService = CCSV("@joehewitt.com/firebug-http-observer;1", "nsIObserverService");
const promtService = CCSV("@mozilla.org/embedcomp/prompt-service;1", "nsIPromptService");

// Database Types
const SQL_SERVER = 1;

const logger = new LoggingUtil();

function defineTags(){
		for (var i = 0; i < arguments.length; ++i) {
			var tagName = arguments[i];
			var fn = new Function("var newTag = new DomplateTag('" + tagName + "'); return newTag.merge(arguments);");
			
			var fnName = tagName.toUpperCase();
			top[fnName] = fn;
		}
	}
	
defineTags("link", "script", "code", "i");

const ToolboxPlate = domplate(
{
	tag:
		DIV({class: "variableToolbox", _domPanel: "$domPanel", onclick: "$onClick"},
			IMG({class: "variableDeleteButton closeButton", src: "blank.gif"})
		),
	
	onClick: function(event)
	{
		var toolbox = event.currentTarget;
		toolbox.domPanel.deleteVariable(toolbox.varRow);
	}
});

const FormatterPlate = domplate(
{		
	dump:
		TAG('$value|format',{value:'$value|parseParts'}),
			
	arrayTable:
		TABLE({class:'cfdump_array'},
			TBODY(
				TR(
					TH({class:'array',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'array')
				),				
				FOR('x','$value',
					TR(
						TD({class:'array',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
						TD(
							TAG('$x.val|format',{value:'$x.val|parseParts'})
						)							
					)
				)
			)						
		),
				
	binaryTable:
		TABLE({class:'cfdump_binary'},
			TBODY(
				TR(
					TH({class:'binary',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'binary')
				),
				TR(
					TD({class:'binary'},
						CODE('$value.data')
					)
				)
			)			
		),
			
	customfunctionTable:
		TABLE({class:'cfdump_udf', width:'100%'},
			TBODY(
				TR(
					TH({class:'udf',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'function $value.NAME')
				),
				TR(
					TD(
						TABLE({class:'cfdump_udfbody'},
							TBODY(
								TAG('$value|formatUDFArguments',{value:'$value'}),
								TR(
									TD({width:"30%"},I('ReturnType:')),
									TD('$value|formatUDFReturnType')								
								),
								TR(
									TD(I('Roles:')),
									TD('$value|formatUDFRoles')								
								),
								TR(
									TD(I('Access:')),
									TD('$value|formatUDFAccess')								
								),
								TR(
									TD(I('Output:')),
									TD('$value|formatUDFOutput')								
								),
								TR(
									TD(I('DisplayName:')),
									TD('$value|formatUDFDisplayName')								
								),
								TR(
									TD(I('Hint:')),
									TD('$value|formatUDFHint')								
								),
								TR(
									TD(I('Description:')),
									TD('$value|formatUDFDescription')								
							)
							)
						)
					)
				)
			)				
		),
	
	argumentsTable:
		TR(
			TD({colspan:2},
				I('Arguments:'),
				TABLE({class:'cfdump_udfarguments'},
					TBODY(
						TR(
							TH('Name'),
							TH('Required'),
							TH('Type'),
							TH('Default')											
						),
						FOR('param','$value.PARAMETERS',
							TR(
								TD('$param|formatParamName'),
								TD('$param|formatParamRequired'),
								TD('$param|formatParamType'),
								TD('$param|formatParamDefault')
							)											
						)	
					)									
				)									
			)
		),
	
	argumentsRow:
		TR(
			TD(I('Arguments:')),
			TD('none')								
		),
		
	componentTable:
		TABLE({class: 'cfdump_cfc'},
			TBODY(
				TR(
					TH({class:'cfc',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'component $value.NAME')
				),
				TAG('$value|formatComponentFunctions',{value:'$value'})					
			)
		),
		
	functionsTable:
		TR(				
			TD({class:'cfc',onclick:'$cfdumpToggleRow',style:'cursor:pointer;background-color:#FF99AA;font-style:normal;',title:'click to collapse'},'METHODS'),
			TD({style:'display:block',valign:'top'},
				TABLE({class:'cfdump_cfc'},
					TBODY(
						FOR('func','$value.FUNCTIONS',
							TR({valign:'top'},
								TD({class:'cfc',onclick:'$cfdumpToggleRow',style:'cursor:pointer;background-color:#FF99AA;font-style:normal;',title:'click to collapse'},'$func.NAME'),
								TD(TAG('$this.customfunctionTable',{value:'$func'}))								
							)							
						)	
					)					
				)
			)					
		),
		
	functionsRow:
		TR(				
			TD({class:'cfc',onclick:'$cfdumpToggleRow',style:'cursor:pointer;background-color:#FF99AA;font-style:normal;',title:'click to collapse'},'METHODS'),
			TD({style:'display:block',valign:'top'},'none')					
		),		
		
	objectTable:
		TABLE({class: 'cfdump_object'},
			TBODY(
				TR(
					TH({class:'object',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'object of $value.CLASSNAME')
				),
				TR(				
					TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Class Name'),
					TD('$value.CLASSNAME')					
				),
				TR(				
					TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Methods'),
					TD(
						TABLE({class:'cfdump_object'},
							TBODY(
								TR(
									TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Method'),
									TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Return Type')
								),
								FOR('meth','$value.METHODS',
									TR({valign:'top'},
										TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$meth.METHOD'),
										TD('$meth.RETURNTYPE')								
									)							
								)
							)					
						)					
					)
				),
				TR(				
					TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Fields'),
					TD(
						TABLE({class:'cfdump_object'},
							TBODY(
								TR(
									TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Field'),
									TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Value')
								),
								FOR('field','$value.FIELDS',
									TR({valign:'top'},
										TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$field.FIELD'),
										TD('$field.VALUE')								
									)							
								)	
							)					
						)					
					)
				)
			)
		),
		
	queryTable:
		TABLE({class: 'cfdump_query'},
			TBODY(
				TR(
					TH({class:'query',colspan:'$value.COLUMNS|queryColSpan',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'query')
				),
				TR({bgcolor:'eeaaaa'},
					TD({class:'query',onclick:'$cfdumpToggleRowQry',style:'cursor:pointer;',title:'click to collapse'},'&nbsp;'),
					FOR('column','$value.COLUMNS',						
						TD({class:'query'},'$column')
					)				
				),
				FOR('row','$value.DATA',
					TR(
						TD({class:'query',onclick:'$cfdumpToggleRowQry',style:'cursor:pointer;',title:'click to collapse'},'$row.index'),
						FOR('col','$row.DATA',						
							TD('$col')
						)					
					)				
				)
			)
		),			
				
	structTable:
		TABLE({class:'cfdump_struct'},
			TBODY(
				TR(
					TH({class:'struct',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'struct')
				),				
				FOR('x','$value',
					TR(
						TD({class:'struct',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
						TD(
							TAG('$x.val|format',{value:'$x.val|parseParts'})
						)							
					)
				)	
			)					
		),
		
	wddxTable:
		TABLE({class:'cfdump_wddx'},
			TBODY(
				TR(
					TH({class:'wddx',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'wddx encoded')
				),
				TR(
					TD({valign:'top'},
						TAG('$value|format',{value:'$value|parseParts'})			
					)
				)
			)			
		),
		
	xmlDocTable:
		TABLE({class:'cfdump_xml'},
			TBODY(
				TR(
					TH({class:'xml',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'xml document')
				),
				FOR('x','$value',
					TR(
						TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
						TD(
							TAG('$x.val|format',{value:'$x.val|parseParts'})
						)							
					)
				)
			)		
		),
		
	xmlElemTable:
		TABLE({class:'cfdump_xml'},
			TBODY(
				TR(
					TH({class:'xml',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'xml element')
				),
				FOR('x','$value',
					TR(
						TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
						TD(
							TAG('$x.val|format',{value:'$x.val|parseParts'})
						)							
					)
				)
			)		
		),
	
	xmlNodeTable:
		TABLE({class:'cfdump_xml'},
			TBODY(
				FOR('x','$value',
					TR(
						TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
						TD(
							TAG('$x.val|format',{value:'$x.val|parseParts'})
						)							
					)
				)
			)		
		),
				
	simpleDiv:
		DIV(PRE('$value')),
				
	unknownDiv:
		DIV('$value|formatString'),

	blankDiv:
		DIV(''),
			
	formatComponentFunctions: function(value) {
		if (value.hasOwnProperty("FUNCTIONS") && value.FUNCTIONS.length > 0) {
			return this.functionsTable;
		} else {
			return this.functionsRow;
		}
	},
	
	formatParamName: function(param) {
		return (param.hasOwnProperty("NAME")) ? param.NAME : "";			
	},
	
	formatParamRequired: function(param) {
		if (param.hasOwnProperty("REQUIRED")){
			if (param.REQUIRED == true) {
				return "Required";
			} else {
				return "Optional";
			}
		} else {
			return "";
		}	
	},
	
	formatParamType: function(param) {
		return (param.hasOwnProperty("TYPE")) ? param.TYPE : "";	
	},
	
	formatParamDefault: function(param) {
		if (param.hasOwnProperty("DEFAULT")){
			if (param.DEFAULT == "") {
				return "[empty string]";
			} else {
				return param.DEFAULT;
			}
		} else {
			return "";
		}	
	},
			
	formatUDFArguments: function(value) {
		if (value.hasOwnProperty("PARAMETERS") && value.PARAMETERS.length > 0) {
			return this.argumentsTable;
		} else {
			return this.argumentsRow;
		}
	},
	
	formatUDFReturnType: function(value) {
		return (value.hasOwnProperty("RETURNTYPE")) ? value.RETURNTYPE : "";
	},
	
	formatUDFRoles: function(value) {
		return (value.hasOwnProperty("ROLES")) ? value.ROLES : "";
	},
	
	formatUDFAccess: function(value) {
		return (value.hasOwnProperty("ACCESS")) ? value.ACCESS : "";
	},
	
	formatUDFOutput: function(value) {
		return (value.hasOwnProperty("OUTPUT")) ? value.OUTPUT : "";
	},
	
	formatUDFDisplayName: function(value) {
		return (value.hasOwnProperty("DISPLAYNAME")) ? value.DISPLAYNAME : "";
	},
	
	formatUDFHint: function(value) {
		return (value.hasOwnProperty("HINT")) ? value.HINT : "";
	},
	
	formatUDFDescription: function(value) {
		return (value.hasOwnProperty("DESCRIPTION")) ? value.DESCRIPTION : "";
	},
	
	formatString: function(value){
		return (value) ? value.toString() : "";
	},
	
	queryColSpan: function(value) {
		return value.length + 1;
	},
	
	format: function(value){						
		
		switch (this.dumpType(value)) {				
			case "array":				
				return this.arrayTable;
			case "binary":
				return this.binaryTable;
			case "customfunction":
				return this.customfunctionTable;					
			case "simpleValue":
				return this.simpleDiv;	
			case "component":
				return this.componentTable;
			case "java":
				return this.objectTable;
			case "query":
				return this.queryTable;				
			case "struct":
				return this.structTable;
			case "wddx":
				return this.wddxTable;
			case "xmldoc":
				return this.xmlDocTable;
			case "xmlelem":
				return this.xmlElemTable;
			case "xmlnode":
				return this.xmlNodeTable;
			case "unknown":
				return this.unknownDiv;				
		}					
							
	},
				
	parseParts: function(value) {
		
		var parts = [];
		var part;
				
		switch (this.dumpType(value)) {
			
			case "array":					
				for (var i=0; i < value.length; i++) {
					part = {name: i+1, val: value[i] };
					parts.push(part);
				}
				return parts;				
				
			case "binary":
				if (value.length > 1000) {
					value.data += ' [truncated]';
				}
				return value;
				
			case "customfunction":
				return value;
				
			case "simpleValue":
				return value;
				
			case "component":
				return value;
				
			case "java":
				return value;
			
			case "query":
				var columns = value.COLUMNLIST.split(',');					
				for (var i = 0; i < value.DATA[columns[0]].length; i++) {
					part = {index: i + 1};
					part.DATA = [];
					for (var j = 0; j < columns.length; j++) {
						part.DATA.push(value.DATA[columns[j]][i]);							
					}
					parts.push(part);						
				}
								
				return {RECORDCOUNT: value.recordcount, COLUMNS: columns, DATA: parts};
				
			case "struct":
			case "xmldoc":
			case "xmlelem":
			case "xmlnode":
				for (var i in value) {
					if (i != "__cftype__") {
						part = {name: i, val: value[i] };
						parts.push(part);						
					}					
				}
				return parts;	
			
			case "wddx":
				return value.data;
				
			case "unknown":
				return value;	
				
			default:
				return value;		
			
		}
	},
	
	dumpType: function(value) {
		
		if (value instanceof Array) {				
			return "array";					
		} else if (typeof(value) == "object" && value.hasOwnProperty("__cftype__")) {
			return value.__cftype__;	
		} else if (typeof(value) == "object" && value.hasOwnProperty("RECORDCOUNT") && value.hasOwnProperty("DATA")) {
			return "query";	
		} else if (typeof(value) == "string" || typeof(value) == "number" || typeof(value) == "boolean") {
			return "simpleValue";					
		} else {					
			return "unknown";					
		}			
		
	},
	
	cfdumpToggleTable: function(event){
		var source = event.currentTarget;			
		
		var switchToState = this.cfdumpToggleSource( source ) ;
		var table = source.parentNode.parentNode;			
		
		for ( var i = 1; i < table.childNodes.length; i++ ) {
			target = table.childNodes[i] ;
			if(target.style) {
				this.cfdumpToggleTarget( target, switchToState ) ;
			}
		}
		
	},
	
	cfdumpToggleRow: function(event){				
		var source = event.currentTarget;
		var element = null;
		var vLen = source.parentNode.childNodes.length;
		for(var i=vLen-1;i>0;i--){
			if(source.parentNode.childNodes[i].nodeType == 1){
				element = source.parentNode.childNodes[i];
				break;
			}
		}
		if(element == null)
			target = source.parentNode.lastChild;
		else
			target = element;
				
		this.cfdumpToggleTarget( target, this.cfdumpToggleSource( source ) ) ;
	},
	
	cfdumpToggleSource: function( source ){
		if ( source.style.fontStyle == 'italic' || source.style.fontStyle == null) {
			source.style.fontStyle = 'normal' ;
			source.title = 'click to collapse' ;
			return 'open' ;
		} else {
			source.style.fontStyle = 'italic' ;
			source.title = 'click to expand' ;
			return 'closed' ;
		}
	},

	cfdumpToggleTarget: function( target, switchToState ){
		if ( switchToState == 'open' )	target.style.display = '' ;
		else target.style.display = 'none' ;
	},
	
	cfdumpToggleRowQry: function(event) {
		var source = event.currentTarget;
		var expand = (source.title == "click to collapse") ? "closed" : "open";
		var target = null;
		var vLen = source.parentNode.childNodes.length;
		for(var i=vLen-1;i>=1;i--){
			if(source.parentNode.childNodes[i].nodeType == 1){
				target = source.parentNode.childNodes[i];
				this.cfdumpToggleTarget( target, expand );
				this.cfdumpToggleSourceQry( source, expand );
			}
		}
		if(target == null){
			//target is the last cell
			target = source.parentNode.lastChild;
			this.cfdumpToggleTarget( target, this.cfdumpToggleSource( source ) ) ;
		}			
	},	
	
	cfdumpToggleSourceQry: function(source, expand) {
		if(expand == "closed"){
			source.title = "click to expand";
			source.style.fontStyle = "italic";
		}
		else{
			source.title = "click to collapse";
			source.style.fontStyle = "normal";
		}
	},	
	
});

	
var ColdFire;
var panelName = "coldfusion";
var Chrome;

// coldfire module

Firebug.ColdFireModule = extend(Firebug.Module, 
{ 
	
	panelBar1: $("fbPanelBar1"),
	enabled: false,
	
	// extends module
	
	initialize: function() 
	{		
		ColdFire = FirebugChrome.window.ColdFire;
		ColdFire.initialize();
		observerService.addObserver(this, "firebug-http-event", false);
	},
	
	initializeUI: function(detachArgs)
    {
        Firebug.NetMonitor.addListener(this);
    },
	
	shutdown: function() 
	{
		ColdFire.shutdown();
		ColdFire = null;
		observerService.removeObserver(this, "firebug-http-event");
		if(Firebug.getPref( 'defaultPanelName')=='coldfire' ) 
		{
			Firebug.setPref( 'defaultPanelName','console' );
		}
		Firebug.NetMonitor.removeListener(this);
	},	
	
	initContext: function( context ) 
	{		
		var tab = this.panelBar1.getTab("coldfusion");		
		if (Firebug.NetMonitor.isEnabled(context)) {			
			this.enabled = true;
			tab.removeAttribute("disabled");			
		} else {	
			this.enabled = false;		
			tab.setAttribute("disabled", "true");
		} 			
	},
			
	reattachContext: function(context)
	{
		var chrome = context ? context.chrome : FirebugChrome;
		this.syncFilterButtons(chrome);
		this.syncVariablesBox(chrome);
	},	
	
	watchWindow: function(context, win)
	{
   		if (ColdFire["forceDebug"]) {
			if (win.wrappedJSObject.ColdFusion) {
				setDebugMode(context.window.wrappedJSObject.ColdFusion,true);
			} else if (typeof win.wrappedJSObject.onload != "function") {
				win.wrappedJSObject.onload = function() {
					if (this.ColdFusion) {							
						
						var $C = this.ColdFusion;
						var $A = $C.Ajax;
						var $X = $C.AjaxProxy;
						var $B = $C.Bind;
						var $E = $C.Event;
						var $L = $C.Log;
						var $U = $C.Util;
						var $D = $C.DOM;
						var $S = $C.Spry;
						var $P = $C.Pod;
	
						$A.sendMessage = function(url, _1a, _1b, _1c, _1d, _1e, _1f){
							var req = $A.createXMLHttpRequest();
							if (!_1a) {
								_1a = "GET";
							}
							if (_1c && _1d) {
								req.onreadystatechange = function(){
									$A.callback(req, _1d, _1e);
								};
							}
							if (_1b) {
								_1b += "&_cf_nodebug=false&_cf_nocache=true";
							}
							else {
								_1b = "_cf_nodebug=false&_cf_nocache=true";
							}
							if (window._cf_clientid) {
								_1b += "&_cf_clientid=" + _cf_clientid;
							}
							if (_1a == "GET") {
								if (_1b) {
									_1b += "&_cf_rc=" + ($C.requestCounter++);
									if (url.indexOf("?") == -1) {
										url += "?" + _1b;
									}
									else {
										url += "&" + _1b;
									}
								}
								$L.info("ajax.sendmessage.get", "http", [url]);
								req.open(_1a, url, _1c);
								req.send(null);
							}
							else {
								$L.info("ajax.sendmessage.post", "http", [url, _1b]);
								req.open(_1a, url, _1c);
								req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
								if (_1b) {
									req.send(_1b);
								}
								else {
									req.send(null);
								}
							}
							if (!_1c) {
								while (req.readyState != 4) {
								}
								if ($A.isRequestError(req)) {
									$C.handleError(null, "ajax.sendmessage.error", "http", [req.status, req.statusText], req.status, req.statusText, _1f);
								}
								else {
									return req;
								}
							}
						};
						$S.bindHandler = function(_163, _164){
							var url;
							var _166 = "_cf_nodebug=false&_cf_nocache=true";
							if (window._cf_clientid) {
								_166 += "&_cf_clientid=" + _cf_clientid;
							}
							var _167 = window[_164.bindTo];
							var _168 = (typeof(_167) == "undefined");
							if (_164.cfc) {
								var _169 = {};
								var _16a = _164.bindExpr;
								for (var i = 0; i < _16a.length; i++) {
									var _16c;
									if (_16a[i].length == 2) {
										_16c = _16a[i][1];
									}
									else {
										_16c = $B.getBindElementValue(_16a[i][1], _16a[i][2], _16a[i][3], false, _168);
									}
									_169[_16a[i][0]] = _16c;
								}
								_169 = $X.JSON.encode(_169);
								_166 += "&method=" + _164.cfcFunction;
								_166 += "&argumentCollection=" + encodeURIComponent(_169);
								$L.info("spry.bindhandler.loadingcfc", "http", [_164.bindTo, _164.cfc, _164.cfcFunction, _169]);
								url = _164.cfc;
							}
							else {
								url = $B.evaluateBindTemplate(_164, false, true, _168);
								$L.info("spry.bindhandler.loadingurl", "http", [_164.bindTo, url]);
							}
							var _16d = _164.options ||
							{};
							if ((_167 && _167._cf_type == "json") || _164.dsType == "json") {
								_166 += "&returnformat=json";
							}
							if (_167) {
								if (_167.requestInfo.method == "GET") {
									_16d.method = "GET";
									if (url.indexOf("?") == -1) {
										url += "?" + _166;
									}
									else {
										url += "&" + _166;
									}
								}
								else {
									_16d.postData = _166;
									_16d.method = "POST";
									_167.setURL("");
								}
								_167.setURL(url, _16d);
								_167.loadData();
							}
							else {
								if (!_16d.method || _16d.method == "GET") {
									if (url.indexOf("?") == -1) {
										url += "?" + _166;
									}
									else {
										url += "&" + _166;
									}
								}
								else {
									_16d.postData = _166;
									_16d.useCache = false;
								}
								var ds;
								if (_164.dsType == "xml") {
									ds = new Spry.Data.XMLDataSet(url, _164.xpath, _16d);
								}
								else {
									ds = new Spry.Data.JSONDataSet(url, _16d);
									ds.preparseFunc = $S.preparseData;
								}
								ds._cf_type = _164.dsType;
								var _16f = {
									onLoadError: function(req){
										$C.handleError(_164.errorHandler, "spry.bindhandler.error", "http", [_164.bindTo, req.url, req.requestInfo.postData]);
									}
								};
								ds.addObserver(_16f);
								window[_164.bindTo] = ds;
							}
						};
					}
				}			
			}
		}
	},
	
	showContext: function(browser, context)
    {
		
		var panel = context.getPanel(panelName);		
		
		if (!context.coldfire || !context.coldfire.file) {
			panel.clear();
			panel.updateLocation(null);
		}
		else {
			panel.updateLocation(context.coldfire.file);
		}		

    },
	
	showPanel: function( browser, panel ) 
	{ 		
		Chrome = browser.chrome;		
		if (panel && panel.name == "coldfusion" && this.enabled)
			this.changeCurrentView(this.coldfireView);		
	},
	
	// coldfire
	
	coldfireView: "General",
		
	syncFilterButtons: function(chrome)
	{		
		var theChrome = chrome ? chrome : Chrome;
		var button = theChrome.$("fbColdFireFilter-"+this.coldfireView);
		button.checked = true;    
	},	
	
	syncVariablesBox: function(chrome)
	{		
		var theChrome = chrome ? chrome : Chrome;
		var isVariablesView = this.coldfireView == "Variables";
		var coldFireVariableBox = theChrome.$("fbColdFireVariableBox"); 
		collapse(coldFireVariableBox, !(isVariablesView));		
	},
	
	changeCurrentView: function( view ) 
	{				
		this.coldfireView = view;
		this.syncFilterButtons();
		this.syncVariablesBox();		
		FirebugContext.getPanel( "coldfusion" ).displayCurrentView();
	},	
	
	// NetMonitor listener interface method
	
	onLoad: function(context, file) {
		var panel = context.getPanel("coldfusion");
		panel.updateFile(file);		
	},
	
	// nsIObserver interface method
	observe: function(subject, topic, data) {		
		
		if (!(subject instanceof Ci.nsIHttpChannel))
                return;
		
		if (topic == 'http-on-modify-request' && this.enabled) {
			
			try{
				subject.setRequestHeader("User-Agent",
					subject.getRequestHeader("User-Agent") + " " + "ColdFire/" + ColdFire.version,
					true);
			} catch (e) {
				logger.logMessage(e);
			}
			
			try{
				var variables = FirebugContext.getPanel( "coldfusion" ).variables;
				if(variables.length)
					subject.setRequestHeader("x-coldfire-variables", 
						JSON.stringify(variables),
						true);
			} catch (e) {
				logger.logMessage(e);
			}
			
			try{
				if(ColdFire['enhanceTrace'])
					subject.setRequestHeader("x-coldfire-enhance-trace", 
						"true",
						true);
			} catch (e) {
				logger.logMessage(e);
			}
				
		}		 
	},
	
	// nsISupports interface method
	QueryInterface: function(iid) {
		if (!iid.equals(Ci.nsIObserver) && !iid.equals(Ci.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;		
	}
		
}); 

// row data object is used to hold coldfire data

function RowData() {}

RowData.prototype =
{
    generalRows: [],
	etRows: [],
	exceptionRows: [],
	queryRows: [],
	traceRows: [],
	timerRows: [],
	variablesRows: [],
	totalET: 0,
	dbET: 0,
	templateET: 0,
	ctemplateET: 0,
	cfcET: 0,
		
	clear: function() {
		this.generalRows = [];
		this.etRows = [];
		this.exceptionRows = [];
		this.queryRows = [];
		this.traceRows = [];
		this.timerRows = [];
		this.variablesRows = [];
		this.totalET = 0;
		this.dbET = 0;
		this.templateET = 0;
		this.ctemplateET = 0;
		this.cfcET = 0;
	}
	
};

// coldfire panel

function ColdFirePanel() {} 
ColdFirePanel.prototype = domplate(Firebug.Panel, 
{  
	// domplate tags
	
	styleSheetTag: 
		LINK({	rel: "stylesheet", 
				type: "text/css", 
				href: "chrome://coldfireextension/skin/panel.css", 
				id: "coldfirePanelCSS" }),
		
	tableTag:
		TABLE({class: "panelTable", width: "100%", cellpadding: 2, cellspacing: 0},
			THEAD(),
			TBODY({class: "panelTableBody"}),
			TFOOT()
		),
		
	generalHeaderRow:
		TR(
			TD({class: "labelCell", width: "25%"}, $CFSTR('Requests')),
			TD({class: "valueCell", width: "75%"},
				FORM(
					SELECT({name: "reqSelect", onchange: "$onChangeReq",  _domPanel: "$domPanel"},
						FOR("file", "$domPanel.queue",
							TAG('$file|getGeneralOption',{file:'$file'})
						)	
					)
				)
			)
		),
		
	generalOptionSelected:
		OPTION({value: "$file.href", selected: "true"}, "$file.href"),
		
	generalOption:
		OPTION({value: "$file.href"}, "$file.href"),
		
	generalRowTag:
		FOR("row", "$rows",
			TR(
				TD({class: "labelCell", width: "25%"},"$row.LABEL|safeCFSTR"),
				TD({class: "valueCell", width: "75%"},"$row.VALUE")                    
			)
		),
		
	etHeaderRow:
		TR({class: "headerRow", onclick: "$onHeaderClick"},
			TH({class: "headerCell alphaValue", width: "20%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Type')
				)
			),
			TH({class: "headerCell alphaValue", width: "35%"},
				DIV({class: "headerCellBox"},
					$CFSTR('File')
				)
			),
			TH({class: "headerCell alphaValue", width: "25%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Method')
				)
			),
			TH({class: "headerCell", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('TotalInstances')
				)
			),
			TH({class: "headerCell", width: "5%"},
				DIV({class: "headerCellBox"},
					$CFSTR('AvgTime')
				)
			),
			TH({class: "headerCell", width: "5%"},
				DIV({class: "headerCellBox"},
					$CFSTR('TotalTime')
				)
			)
		),
		
	etRowTag:
		FOR("row", "$rows",
			TR({class: "$row.AVGTIME|isSlow"},
				TD({class: "valueCell", width: "20%"},"$row.TYPE"),
				TD({class: "valueCell", width: "35%"},"$row.TEMPLATE"),
				TD({class: "valueCell", width: "25%"},"$row.METHOD"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.TOTALINSTANCES"),
				TD({class: "valueCell", width: "5%", align: "right"},"$row.AVGTIME|formatTime"),
				TD({class: "valueCell", width: "5%", align: "right"},"$row.TOTALTIME|formatTime")                    
			)
		),
	
	etOtherRow:
		TR(
			TD({class: "valueCell", width: "90%", colspan: 4}, $CFSTR('OtherTime')),
			TD({class: "valueCell", width: "10%", align: "right", colspan: 2}, "$time|formatTime")		
		),	
	
	etTotalRow:
		TR(
			TD({class: "valueCell bold", width: "90%", colspan: 4}, $CFSTR('TotalExecTime')),
			TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$totalTime|formatTime")		
		),	
	
	etDBRow:
		TR(
			TD({class: "valueCell bold", width: "90%", colspan: 4}, $CFSTR('DBExecTime')),
			TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$times|formatDBTime")		
		),	
		
	etCFCRow:
		TR(
			TD({class: "valueCell bold", width: "90%", colspan: 4}, $CFSTR('CFCExecTime')),
			TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$times|formatCFCTime")		
		),	
		
	exceptionHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Timestamp')
				)
			),
			TH({class: "headerCell alphaValue", width: "25%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Type')
				)
			),
			TH({class: "headerCell alphaValue", width: "65%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Template')
				)
			)			
		),
	
	exceptionRowTag:
		FOR("row", "$rows",
			TR(
				TD({width: "10%"},"$row.TIMESTAMP|formatTimeStamp"),
				TD({width: "25%"},"$row.NAME|formatExceptionName"),				
				TD({width: "65%"},"$row|formatExceptionLocation")                    
			),
			TR(
				TD({class: "valueCell exceptionMessage", width: "100%", colspan: 3}, PRE("$row.MESSAGE"))
			)		
		),
		
		
	queryHeaderRow:
		TR({class: "headerRow queryTable", onclick: "$onHeaderClick"},
			TH({class: "headerCell alphaValue", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('QueryName')
				)
			),
			TH({class: "headerCell alphaValue", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('DataSource')
				)
			),			
			TH({class: "headerCell", width: "7%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Time')
				)
			),
			TH({class: "headerCell", width: "7%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Records')
				)
			),
			TH({class: "headerCell alphaValue", width: "7%"}, 
				DIV({class: "headerCellBox"},
					$CFSTR('Cached')
				)
			),
			TH({class: "headerCell alphaValue", width: "49%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Template')
				)
			),
			TH({class: "headerCell", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Timestamp')
				)
			)					
		),
		
	queryRowTag:
		FOR("row", "$rows",
			TR({class: "queryRow $row.ET|isSlow"},
				TD({width: "10%"},"$row.QUERYNAME"),
				TD({width: "10%"},"$row.DATASOURCE"),				
				TD({width: "7%", align: "right"},"$row.ET|formatTime"),
				TD({width: "7%", align: "right"},"$row.RECORDSRETURNED"),
				TD({width: "7%", align: "center", nowrap: "true"}, "$row.CACHEDQUERY|formatCachedQuery"),
				TD({width: "49%"}, "$row.TEMPLATE"),
				TD({width: "10%", align:"right"}, "$row.TIMESTAMP|formatTimeStamp")                    
			),
			TR({class: "querySQL $row.ET|isSlow", _repObject: "$row"},
				TD({class: "valueCell", width: "100%", colspan: 7},
					TAG('$row|queryDisplay', {row:'$row'})					
				)
			)		
		),
		
	storedProcTag:
		DIV(
			TAG("$this.spParamsTag", {parameters: "$row.PARAMETERS"}),
			TAG("$this.spResultSetsTag", {resultsets: "$row.RESULTSETS"})
		),
		
	spParamsTag:
		TABLE({border: 0, width: "100%", cellpadding: 2, cellspacing: 0},		
			THEAD(),
			TBODY(
				TR({class: "procHead"},
					TH({colspan: "5", class: "procHead"}, $CFSTR("StoredProcedureParameters"))
				),
				TR({class: "procSubHead"},
					TD({class: "procSubHead"}, $CFSTR("lcType")),
					TD({class: "procSubHead"}, $CFSTR("lcCFSqlType")),
					TD({class: "procSubHead"}, $CFSTR("lcValue")),
					TD({class: "procSubHead"}, $CFSTR("lcVariable")),
					TD({class: "procSubHead"}, $CFSTR("lcDBVarname"))
				),
				FOR("param", "$parameters",
					TR({class: "procValue"},
						TD({class: "procValue"},"$param|formatParamType"),
						TD({class: "procValue"},"$param|formatParamCFSqlType"),
						TD({class: "procValue"},"$param|formatParamValue"),
						TD({class: "procValue"},"$param|formatParamVariable"),
						TD({class: "procValue"},"$param|formatParamDBVarname")
					)				
				)	
			),
			TFOOT()		
		),	
	
	spResultSetsTag:
		TABLE({border: 0, width: "100%", cellpadding: 2, cellspacing: 0},		
			TBODY(
				TR({class: "procHead"},
					TH({colspan: "2", class: "procHead"}, $CFSTR("StoredProcedureResultSets"))
				),
				TR({class: "procSubHead"},
					TD({class: "procSubHead"}, $CFSTR("lcName")),
					TD({class: "procSubHead"}, $CFSTR("lcResultset"))
				),
				FOR("resultset", "$resultsets",
					TR({class: "procValue"},
						TD({class: "procValue"},"$resultset|formatResultsetName"),
						TD({class: "procValue"},"$resultset|formatResultsetNumber")
					)				
				)		
			)			
		),	
		
	sqlTag:
		DIV (
			PRE("$row|formatSQLString"),
			TAG("$row|queryParamDisplay", {parameters: "$row.PARAMETERS"})
		),
		
	sqlParamsTag:
		DIV (
			BR(),
			DIV({class: "queryParam"}, "$parameters|formatParamHeader"),
			FOR("param", "$parameters",
				DIV({class: "queryParam"},"$param|fomatParamString")
			)
		),
		
	traceHeaderRow:
		TR({class: "headerRow", onclick: "$onHeaderClick"},
			TH({class: "headerCell alphaValue", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Type')
				)
			),
			TH({class: "headerCell", width: "10%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Delta')
				)
			),
			TH({class: "headerCell alphaValue", width: "10%"}, 
				DIV({class: "headerCellBox"},
					$CFSTR('Category')
				)
			),
			TH({class: "headerCell alphaValue", width: "70%"}, 
				DIV({class: "headerCellBox"},
					$CFSTR('MessageResult')
				)
			)	
		),
		
	traceRowTag:
		FOR("row", "$rows",
			TR({class: "$row.PRIORITY|getTraceClass"},
				TD({class: "valueCell", valign:"top", width: "10%"},"$row.PRIORITY|formatPriority|safeCFSTR"),
				TD({class: "valueCell", valign:"top", width: "10%", align: "right"},"$row.DELTA|formatTime"),
				TD({class: "valueCell", valign:"top", width: "10%"},"$row.CATEGORY"),
				TD({class: "valueCell", valign:"top", width: "70%"},"$row|formatMessage")         
			)
		),
		
	traceRowEnhancedTag:
		FOR("row", "$rows",
			TR({class: "$row.PRIORITY|getTraceClass"},
				TD({class: "valueCell", valign:"top", width: "10%"},"$row.PRIORITY|formatPriority|safeCFSTR"),
				TD({class: "valueCell", valign:"top", width: "10%", align: "right"},"$row.DELTA|formatTime"),
				TD({class: "valueCell", valign:"top", width: "10%"},"$row.CATEGORY"),
				TD({class: "valueCell", valign:"top", width: "70%"},
					TABLE({cellpadding:0, cellspacing:0},
						TBODY(							
							TR({valign:"top"},
								TD({valign:"top"},"$row.MESSAGE"),
								TD({valign:"top",class:"traceValue"})								
							)							
						)					
					)
				)                    
			)
		),
		
	timerHeaderRow:
		TR({class: "headerRow", onclick: "$onHeaderClick"},
			TH({class: "headerCell alphaValue", width: "90%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Message')
				)
			),
			TH({class: "headerCell", width: "10%"},  
				DIV({class: "headerCellBox"},
					$CFSTR('Duration')
				)
			)
		),
	
	timerRowTag:
		FOR("row", "$rows",
			TR(
				TD({class: "valueCell", width: "90%"},"$row.MESSAGE"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.DURATION|formatTime")
			)
		),
		
	varHeaderRow:
		TR({class: "headerRow", onclick: "$onHeaderClick"},
			TH({class: "headerCell alphaValue", width: "20%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Variable')
				)
			),
			TH({class: "headerCell alphaValue", width: "80%"},
				DIV({class: "headerCellBox"},
					$CFSTR('Value')
				)
			)
		),
	
	varRowTag:
		FOR("row", "$rows",
			TR({class: "variableRow", level: 0},
				TD({class: "valueCell", width: "20%", valign: "top"},"$row"),
				TD({class: "valueCell varValue", width: "80%", valign: "top"})
			)
		),
		
	blankDiv:
		DIV(""),
	
	queryDisplay: function(row)
	{
		if (row.TYPE == "StoredProcedure") {
			return this.storedProcTag;
		} else {
			return this.sqlTag;
		}
	},
	
	queryParamDisplay: function(row)
	{
		var sqlText = row.SQL;
		var params = row.PARAMETERS;
		if (params.length && params.length > 0) {			
			var questionMarks = sqlText.match(/\?/g);			
			if (!((params.length == questionMarks.length) && ColdFire['parseParams'] )) {	
				return this.sqlParamsTag;				
			}			
		} 		
		return this.blankDiv;				
	},
		
	// convenience for domplates
		
	safeCFSTR: function(name)
	{
		try{
			return $CFSTR(name);			
		} catch (e) {
			return name;
		}		
	},	
	
	isSlow: function(time)
	{
		return (parseInt(time) > 250)? "slow": "";
	},
	
	formatExceptionName: function(name)
	{
		var i = name.indexOf("Exception");
		if (i >= 0)
			return name;
		
		return name + " Exception";
	},
	
	formatExceptionLocation: function(row)
	{
		return row.TEMPLATE + " : line " + row.LINE;
	},
	
	formatCachedQuery: function(cached)
	{
		return (cached == "1")?$CFSTR("Yes"):$CFSTR("No");
	},	
	
	formatTime: function(time)
	{
		return time + " ms";
	},	
	
	formatTimeStamp: function(time)
	{
		return time.replace(/.*([0-9]{2}:[0-9]{2}:[0-9]{2}).*/,"$1");
	},
	
	getTraceClass: function(priority)
	{
		var tmp = "";
		switch(priority)
		{
			case "warning":				
				tmp = "traceWarning";
				break;
			case "error":
				tmp = "traceError";
				break;
			case "fatal information":
				tmp = "traceFatal";
				break;
		}	
		return tmp;
	},	
	
	formatPriority: function(priority)
	{
		var tmp = priority;
		switch(priority)
		{
			case "information":
				tmp = "Info";
				break;
			case "warning":
				tmp = "Warning";
				break;
			case "error":
				tmp = "Error";
				break;
			case "fatal information":
				tmp = "Fatal";
				break;
		}
		return tmp;
	},
	
	formatMessage: function(row)
	{
		var msg = row.MESSAGE;
		if (row.RESULT != ''){
			msg += '[' + row.RESULT + ']';
		}
		return msg;
	},
			
	formatDBTime: function(times)
	{
		var per = 0;
		if (times.totalET > 0)
			per = parseInt(times.dbET * 100 / times.totalET);
		return times.dbET + "ms (" + per + "%)";
	},
	
	formatCFCTime: function(times)
	{	
		var per = 0;
		if (times.totalET > 0)
			per = parseInt(times.cfcET * 100 / times.totalET);
		return times.cfcET + "ms (" + per + "%)";
	},	
	
	formatSQLString: function(query, parseParams, showParam, suppressWhiteSpace)
	{		
		var parseParams = (parseParams) ? parseParams : ColdFire['parseParams'];
		var showParam = (showParam) ? showParam : false;
		var suppressWhiteSpace = (suppressWhiteSpace) ? suppressWhiteSpace : ColdFire['suppressWhiteSpace'];
		
		var sqlText = query.SQL;
		var params = query.PARAMETERS;
		// parse parameters
		if (params.length && params.length > 0) {			
			var questionMarks = sqlText.match(/\?/g);			
			if ((params.length == questionMarks.length) && parseParams ) {	
				for (var i = 0; i < params.length; i++) {
					// get the formatted value	
					var val = this.formatParamInlineValue(params[i]);
					if (showParam) {
						var param = params[i];
						param[param.length] = i + 1;
						val += " /* " + this.fomatParamString(param) + " */ ";
					}						
					sqlText = sqlText.replace(/\?/,val);
				}				
			}
		}
		// supress white space
		if (suppressWhiteSpace) {
			
			var re = /^\s+\b\n?/gm;
			sqlText = sqlText.replace(re,"");

			re = /[ \f\r\t\v\u00A0\u2028\u2029]{2,}/g;
			sqlText = sqlText.replace(re," ");
			
			re = /\s+$/;
			sqlText = sqlText.replace(re,"");
		
		}
		
		return sqlText;		
	},
	
	formatParamInlineValue: function(param) 
	{
		var type = param[0];
		var value = param[1];
		var tmpVal = value;
		if (type == 2){
			// handle bit types
			tmpVal = (value == "1" || value.toUpperCase() == "TRUE" || value.toUpperCase() == "YES") ? 1 : 0;
		} else if ( type < 15){
			// handle numeric types
			tmpVal =  value;
		} else if (type < 18) {
			// handle date time types
			tmpVal = (value.indexOf("{") == 0) ? value : "'" + value + "'";
		} else if (type < 23) {
			// handle text types
			tmpVal = "'" + value.toString().replace(/'/g, "''") + "'";
		}
		return tmpVal;				
	},
	
	formatParamHeader: function(parameters)
	{
		// this is a little hack to store the param index for display in formatParamString below.
		for(var i = 0; i < parameters.length; i++) {
			var param = parameters[i];
			param[param.length] = i + 1;
		}
		return $CFSTR("QueryParamValues") + " -";
	},
	
	fomatParamString: function(param) {		
		return $CFSTR("Parameter") + " #" + param[param.length-1] + " (" + this.cfsqltypes[param[0]] + ") = " + param[1];
	},
	
	formatParamType: function(param)
	{
		return param[0];
	},
	
	formatParamCFSqlType: function(param)
	{
		return this.cfsqltypes[param[1]];
	},
		
	formatParamValue: function(param)
	{
		return param[2];
	},
	
	formatParamVariable: function(param)
	{
		return param[3];
	},
	
	formatParamDBVarname: function(param)
	{
		return param[4];
	},
	
	formatResultsetName: function(resultset)
	{
		return resultset[0];
	},
	
	formatResultsetNumber: function(resultset)
	{
		return resultset[1];
	},
	
	formatClipboardSQL: function(query)
	{
		var sqlText = "";		
		
		if (query.TYPE == "StoredProcedure") {		
			
			sqlText = "With searching comes loss\nand the presence of absence:\nno stored procedures.";
			
			/*
			switch (ColdFire['dbType']) {
				case SQL_SERVER:
					sqlText = this.formatSQLServerProc(query);
					break;				
			}	
			*/	
			
		} else {
						
			sqlText = this. formatSQLString(query, true, true, false);
			
			var params = query.PARAMETERS;
								
			if (params.length && params.length > 0) {				
				var questionMarks = query.SQL.match(/\?/g);			
				if (params.length != questionMarks.length) {					
					for (var i = 0; i < params.length; i++) {
						// this is a little hack to store the param index for display in formatParamString below.
						var param = params[i];
						param[param.length] = i + 1;
						// get the formatted value	
						var val = this.fomatParamString(param);
						sqlText += "\n" + val;
					}	
				}
			}
			
		}		
		return sqlText;	
	},
	
	// lookup array for CF SQL types
	
	cfsqltypes: [
		"unknown",
		//numeric types
		"cf_sql_bigint", "cf_sql_binary", "cf_sql_bit", "cf_sql_blob", "cf_sql_decimal", "cf_sql_double", "cf_sql_float", "cf_sql_integer", "cf_sql_longvarbinary", "cf_sql_money", "cf_sql_numeric", "cf_sql_real", "cf_sql_smallint", "cf_sql_tinyint", "cf_sql_varbinary", 
		//date time types
		"cf_sql_date", "cf_sql_time", "cf_sql_timestamp",
		//text types
		"cf_sql_char", "cf_sql_clob", "cf_sql_idstamp", "cf_sql_longvarchar", "cf_sql_varchar"	
	],	
	
	// SQL Server Stored Procedure
	
	formatSQLServerProc: function(query) {
		
		var decText = "";
		var assignText = "";		
		var sqlText = "EXEC\t" + query.QUERYNAME;
		
		var params = query.PARAMETERS;
		var sqlTexDelim = "";
		var decTextDelim = "DECLARE\t";
		
		if (params.length && params.length > 0) {
			for (var i = 0; i < params.length; i++) {
				var param = params[i];
				
				var dbVarName = this.formatParamDBVarname(param);
				var val = this.formatParamValue(param);
				
				switch (this.formatParamType(param)){
					
					case "IN":
					case "in":
						// handle in params
						sqlText += sqlTexDelim + "\n\t\t";
						if (dbVarName.length)
							sqlText += dbVarName + "=";
						sqlText += val;	
						sqlTextDelim = ",";					
						break;
					case "OUT":
					case "out":
						// handle out params						
						var varName = getSQLServerProcParamVarName(param);
						var varType = getSQLServerProcParamType(param);(param)
						
						decText += decTextDelim + varName + " " + varType;
						decTextDelim = ",\n\t\t";
						
						sqlText += sqlTextDelim + "\n\t\t";
						sqlText += varName + " = " + varName + " OUTPUT";
						sqlTextDelim = ",";
						
						break;
						
					case "INOUT":
					case "inout":
						// handle inout params
						
						break;							
				}				
				
			}				
		}
		
		return sqlText;
		
	},
	
	getSQLServerProcParamVarName: function(param) {
		var dbVarName = formatParamDBVarname(param);
		
		if (dbVarName != "")
			return dbVarName;
			
		dbVarName = formatParamVariable(param).toString().split("=")[0];
		
		return '@' + dbVarName;
	},
	
	getSQLServerProcParamType: function(param) {
		var dbSQLType = this.sqlservertypes[param[1]];
		
		var maxLength = ( param[5] == "" && param[6] != "" ) ? "18" : param[5];
		var scale = param[6];
		
		// check for maxLength, scale
		if (scale != "") {			
			dbSQLType += "(" + maxLength + "," + scale + ")";			
		} else if (maxLength != "") {
			dbSQLType += "(" + maxLength + ")";
		}
		
		return dbSQLType;
		
	},
	
	sqlservertypes: [
		"unknown",
		//numeric types
		"BIGINT", "BINARY", "BIT", "VARBINARY(MAX)", "DECIMAL", "FLOAT", "FLOAT", "INT", "IMAGE", "MONEY", "NUMERIC", "REAL", "SMALLINT", "TINYINT", "VARBINARY",
		//date time types
		"DATETIME", "DATETIME", "DATETIME",
		//text types
		"CHAR", "VARCHAR(MAX)", "UNIQUEIDENTIFIER", "TEXT", "VARCHAR"
	],
		
	// extends panel	
	
	name: panelName, 
	searchable: false, 
	editable: false,
	title: $CFSTR("ColdFusion"), 
	
	initialize: function(context, doc)
	{
		
		this.onMouseOver = bind(this.onMouseOver, this);
		this.onMouseOut = bind(this.onMouseOut, this);		
		this.setUpDoc(doc);	
		this.clear();		
					
		Firebug.Panel.initialize.apply(this, arguments);		
	},	 
	
	destroy: function(state) // Panel may store info on state
    {
        Firebug.Panel.destroy.apply(this, arguments);
    },
		
	reattach: function(doc)
	{
		this.setUpDoc(doc);	
			
		Firebug.Panel.reattach.apply(this, arguments);	
	}, 	
	
	initializeNode: function(myPanelNode)
	{
		this.panelNode.addEventListener("mouseover", this.onMouseOver, false);
		this.panelNode.addEventListener("mouseout", this.onMouseOut, false);
	},
	
	destroyNode: function()
	{
		this.panelNode.removeEventListener("mouseover", this.onMouseOver, false);
		this.panelNode.removeEventListener("mouseout", this.onMouseOut, false);
	},	
	
	show: function(state)
	{
		
		this.showToolbarButtons("fbColdFireExtensionButtons", true);
		
		var shouldShow = this.shouldShow();
 		this.showToolbarButtons("fbColdFireExtensionButtonsFilter", shouldShow);
		this.showToolbarButtons("fbColdFireVariableBox", shouldShow && Firebug.ColdFireModule.coldfireView == "Variables");
		
		if (!shouldShow)
			return;		
		
		this.displayCurrentView();			
	},
		
	hide: function(state)
	{
		this.showToolbarButtons("fbColdFireExtensionButtons", false);	
		this.showToolbarButtons("fbColdFireVariableBox", false);
		
	},
	
	supportsObject: function(object)
    {
 		if (object instanceof NetFile)
			return 1;
			
		return 0;
    },
	
	navigate: function(object)
    {
		Firebug.Panel.navigate.apply(this, arguments);
    },
	
	updateLocation: function(object)
    {			
			if(!object){
				this.displayCurrentView();	
				return;				
			}
			
			var file = object;		
				 
			if(!file.hasOwnProperty("cfObj")) {	
								
				var headers = {
					general: [],
					exceptions: [],
					queries: [],
					trace: [],
					templates: [],
					ctemplates: [],
					cfcs: [],
					timer: [],
					variables: []
				};
				
				var re = /x-coldfire-([a-z]*)-([0-9]*)/;
				
				for (var i = 0; i < file.responseHeaders.length; i++){
					var cfheader = re.exec(file.responseHeaders[i].name);
					if (cfheader){
						headers[cfheader[1]][parseInt(cfheader[2]) - 1] = file.responseHeaders[i].value;
					}					
				};
				
				var cfObj = {
					generalObj: eval( "(" + this.stringifyHeaders(headers.general) + ")" ),
					exceptionsObj: eval( "(" + this.stringifyHeaders(headers.exceptions) + ")" ),
					queriesObj: eval( "(" + this.stringifyHeaders(headers.queries) + ")" ),
					traceObj: eval( "(" + this.stringifyHeaders(headers.trace) + ")" ),
					templatesObj:  eval( "(" + this.stringifyHeaders(headers.templates) + ")" ),
					ctemplatesObj: eval( "(" + this.stringifyHeaders(headers.ctemplates) + ")" ),
					cfcsObj: eval( "(" + this.stringifyHeaders(headers.cfcs) + ")" ),
					timerObj: eval( "(" + this.stringifyHeaders(headers.timer) + ")"),
					variablesObj: eval( "(" + this.stringifyHeaders(headers.variables) + ")")
				};			
			
			};	
		
			this.context.coldfire = { file: file };				
			this.generateRows(cfObj);							
			this.displayCurrentView();
		 
    },
	
	getLocationList: function()
    {
        return this.queue;
    },	
	
	getOptionsMenuItems: function()
	{
		return [
			this.cfMenuOptionRefresh("ParseQueryParams","parseParams"),
			this.cfMenuOptionRefresh("SuppressQueryWhiteSpace","suppressWhiteSpace"),
			this.cfMenuOption("ShowLastRequest","showLastRequest"),
			this.cfMenuOption("EnhanceTrace","enhanceTrace"),
			this.cfMenuOptionRefresh("ExecTimeTotalsOnTop","etTotalsOnTop"),
			{label: $CFSTR("EnableCFAJAXDebugging"), type: "checkbox", nol10n: true, checked: ColdFire["forceDebug"], command: bindFixed(this.toggleForceDebug, this, "forceDebug") },	
			"-",
			{label: $CFSTR("ClearVariables"), nol10n: true, command: bindFixed(this.deleteVariables, this) }      
		];
	},
	
	getContextMenuItems: function(nada, target)
    {
        var items = [];

        var query = Firebug.getRepObject(target);
        if (!query)
            return items;
			
		var cbText = this.formatClipboardSQL(query);
			
		items.push(
			{label: $CFSTR("CopySQL"), command: bindFixed(copyToClipboard, FBL, cbText) }
		);

        return items;
    },
	
	getDefaultLocation: function(context)
    {
        return null;
    },
	
	getObjectLocation: function(object)
    {
		return object.href;
    },
	
	// see net panel
	
	shouldShow: function()
    {
        if (Firebug.NetMonitor.isEnabled(this.context))
            return true;

        Firebug.ModuleManagerPage.show(this, Firebug.NetMonitor);

        return false;
    },
	
	// coldfire	
	
	queue: [],
	variables: [],		
	rowData: new RowData(),
	
	clear: function()
    {
		this.queue = [];
		this.rowData.clear();
		delete this.location;

    },
	
	setUpDoc: function(doc){
		
		var head = doc.getElementsByTagName("head")[0];
		// add stylesheet
		if (!doc.getElementById('coldfirePanelCSS')) {			
			var styleSheet = this.styleSheetTag.append({},head);			
		};
	},	
	
	stringifyHeaders: function(headerArray){
		
		var sortFn = function(a,b){
			var re = /x-coldfire-.*-([0-9]*)/;
			var apos = a.name.replace(re,$1);
			var bpos = b.name.replace(re,$1);
			
			if (apos < bpos) return -1;
			if (apos > bpos) return 1;
			if (apos == bpos) return 0;
		}
		
		if (headerArray.length){
			//array.sort(sortFn);
			return headerArray.join("");
		} else {
			return "{}";	
		}
	},	
	
	generateRows: function( theObj )
	{
		
		this.rowData.clear();
		
		try{		
		//general rows
		for( var i = 0; i < theObj.generalObj.DATA.LABEL.length; i++ ){
			if(theObj.generalObj.DATA.LABEL[i] == 'TotalExecTime') {
				if (!isNaN(parseInt(theObj.generalObj.DATA.VALUE[i])))
					this.rowData.totalET = parseInt(theObj.generalObj.DATA.VALUE[i]);
				continue;
			}
			var temp = {
				LABEL: theObj.generalObj.DATA.LABEL[i],
				VALUE: theObj.generalObj.DATA.VALUE[i]
			}
			this.rowData.generalRows.push( temp );
		}
		}catch(e){ logger.logMessage(e) }
		
		try{		
		//exception rows
		for( var i = 0; i < theObj.exceptionsObj.DATA.NAME.length; i++ ){
			var exception = {
				TIMESTAMP: theObj.exceptionsObj.DATA.TIMESTAMP[i],
				NAME: theObj.exceptionsObj.DATA.NAME[i],
				TEMPLATE: theObj.exceptionsObj.DATA.TEMPLATE[i],
				LINE: theObj.exceptionsObj.DATA.LINE[i],
				MESSAGE: theObj.exceptionsObj.DATA.MESSAGE[i]
			};	
			this.rowData.exceptionRows.push(exception);
		}
		}catch(e){ logger.logMessage(e) }
		
		try{
		//query rows		
		for( var i = 0; i < theObj.queriesObj.DATA.DATASOURCE.length; i++ ){
			if(!isNaN(parseInt(theObj.queriesObj.DATA.ET[i])))
				this.rowData.dbET += parseInt(theObj.queriesObj.DATA.ET[i]);			
			var query = {
				DATASOURCE: theObj.queriesObj.DATA.DATASOURCE[i],
				ET: theObj.queriesObj.DATA.ET[i],
				QUERYNAME: theObj.queriesObj.DATA.QUERYNAME[i],
				RECORDSRETURNED: theObj.queriesObj.DATA.RECORDSRETURNED[i],
				SQL: theObj.queriesObj.DATA.SQL[i],
				PARAMETERS: theObj.queriesObj.DATA.PARAMETERS[i],
				RESULTSETS: theObj.queriesObj.DATA.RESULTSETS[i],
				TYPE: theObj.queriesObj.DATA.TYPE[i],
				CACHEDQUERY: theObj.queriesObj.DATA.CACHEDQUERY[i],
				TEMPLATE: theObj.queriesObj.DATA.TEMPLATE[i],
				TIMESTAMP: theObj.queriesObj.DATA.TIMESTAMP[i]
			};	
			this.rowData.queryRows.push(query);
		}
		}catch(e){ logger.logMessage(e) }
		
		try{
		//et rows	  
		for(var i = 0; i < theObj.templatesObj.DATA.TOTALTIME.length; i++){
			if(!isNaN(parseInt(theObj.templatesObj.DATA.TOTALTIME[i])))
				this.rowData.templateET += parseInt(theObj.templatesObj.DATA.TOTALTIME[i]);
			var temp = { 
				TYPE: "Template",
				TOTALTIME: theObj.templatesObj.DATA.TOTALTIME[i],
				AVGTIME: theObj.templatesObj.DATA.AVGTIME[i],
				TEMPLATE: theObj.templatesObj.DATA.TEMPLATE[i],
				TOTALINSTANCES: theObj.templatesObj.DATA.TOTALINSTANCES[i],
				METHOD: ""
			};
			this.rowData.etRows.push(temp);
		}
		for(var i = 0; i < theObj.ctemplatesObj.DATA.TOTALTIME.length; i++){
			if(!isNaN(parseInt(theObj.ctemplatesObj.DATA.TOTALTIME[i])))
				this.rowData.ctemplateET += parseInt(theObj.ctemplatesObj.DATA.TOTALTIME[i]);
			var temp = { 
				TYPE: "Child Template / Tag",
				TOTALTIME: theObj.ctemplatesObj.DATA.TOTALTIME[i],
				AVGTIME: theObj.ctemplatesObj.DATA.AVGTIME[i],
				TEMPLATE: theObj.ctemplatesObj.DATA.TEMPLATE[i],
				TOTALINSTANCES: theObj.ctemplatesObj.DATA.TOTALINSTANCES[i],
				METHOD: ""
			};
			this.rowData.etRows.push(temp);
		}
		for(var i = 0; i < theObj.cfcsObj.DATA.TOTALTIME.length; i++){
			if(!isNaN(parseInt(theObj.cfcsObj.DATA.TOTALTIME[i])))
				this.rowData.cfcET += parseInt(theObj.cfcsObj.DATA.TOTALTIME[i]);
			var temp = { 
				TYPE: "CFC",
				TOTALTIME: theObj.cfcsObj.DATA.TOTALTIME[i],
				AVGTIME: theObj.cfcsObj.DATA.AVGTIME[i],
				TEMPLATE: theObj.cfcsObj.DATA.CFC[i],
				TOTALINSTANCES: theObj.cfcsObj.DATA.TOTALINSTANCES[i],
				METHOD: theObj.cfcsObj.DATA.METHOD[i]
			};
			this.rowData.etRows.push(temp);
		}
		}catch(e){ logger.logMessage(e) }
		
		try{
		//trace rows
		for( var i = 0; i < theObj.traceObj.DATA.DELTA.length; i++ )
		{
			var trace = {
				DELTA: theObj.traceObj.DATA.DELTA[i],
				ENDTIME: theObj.traceObj.DATA.ENDTIME[i],
				MESSAGE: theObj.traceObj.DATA.MESSAGE[i],
				RESULT: theObj.traceObj.DATA.RESULT[i],
				PRIORITY: theObj.traceObj.DATA.PRIORITY[i],
				CATEGORY: theObj.traceObj.DATA.CATEGORY[i],
			};
			this.rowData.traceRows.push(trace);
		}
		}catch(e){ logger.logMessage(e) }
		
		try{
		//timer rows
		for( var i = 0; i < theObj.timerObj.DATA.MESSAGE.length; i++ )
		{
			var timer = {
				MESSAGE: theObj.timerObj.DATA.MESSAGE[i],
				DURATION: theObj.timerObj.DATA.DURATION[i]
			};
			this.rowData.timerRows.push(timer);
		}
		}catch(e){ logger.logMessage(e) }
		
		try{
		//variable rows
		for( var i = 0; i < theObj.variablesObj.DATA.VALUE.length; i++ )
		{
			var variable = {
				LABEL: theObj.variablesObj.DATA.LABEL[i],
				VALUE: theObj.variablesObj.DATA.VALUE[i]				
			};
			this.rowData.variablesRows.push(variable);
		}
		}catch(e){ logger.logMessage(e) }
		
		//total exection time
		if (this.rowData.totalET < 0) {
			this.rowData.totalET = this.rowData.dbET + this.rowData.cfcET + this.rowData.templateET + this.rowData.ctemplateET;
		}
		
		try{
		//add total execution time to general tab
		var temp = {
			LABEL: $CFSTR("TotalExecTime"),
			VALUE: this.rowData.totalET + " ms" 
		}
		this.rowData.generalRows.push( temp );
		}catch(e){ logger.logMessage(e) }
		
	},
	
	displayCurrentView: function(){
		this.panelNode.innerHTML = "";		
		switch( Firebug.ColdFireModule.coldfireView ) {
			case "General":
				this.renderGeneralTable();
				break;
			case "ET":
				this.renderETTable();
				break;
			case "Exceptions":
				this.renderExceptionTable();
				break;
			case "DB":
				this.renderDBTable();
				break;
			case "Traces":
				this.renderTraceTable();
				break;
			case "Timer":
				this.renderTimerTable();
				break;
			case "Variables":
				this.renderVariablesTable();
				break;
		}
	},

	renderGeneralTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//add general rows  
		if(this.rowData.generalRows.length)
			var row = this.generalRowTag.insertRows({rows: this.rowData.generalRows}, this.table.childNodes[1])[0];			
	},
	
	renderETTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.etHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add et rows
		if (this.rowData.etRows.length) {
			// put totals at top if pref is set
			if (ColdFire['etTotalsOnTop']) {							
				//total row
				var totalRow = this.etTotalRow.insertRows({
					totalTime: this.rowData.totalET
				}, headerRow)[0];
				//db row 
				var dbRow = this.etDBRow.insertRows({
					times: {
						totalET: this.rowData.totalET,
						dbET: this.rowData.dbET
					}
				}, totalRow)[0];
				//cfc row
				var cfcRow = this.etCFCRow.insertRows({
					times: {
						totalET: this.rowData.totalET,
						cfcET: this.rowData.cfcET
					}
				}, dbRow)[0];				
				//other time row
				var otherRow = this.etOtherRow.insertRows({
					time: this.rowData.totalET - this.rowData.templateET
				}, cfcRow)[0];				
			}
						
			var row = this.etRowTag.insertRows({
				rows: this.rowData.etRows
			}, this.table.childNodes[1])[0];
			
			if (!ColdFire['etTotalsOnTop']) {
				//other time row
				var otherRow = this.etOtherRow.insertRows({
					time: this.rowData.totalET - this.rowData.templateET
				}, this.table.lastChild)[0];
				//total row
				var totalRow = this.etTotalRow.insertRows({
					totalTime: this.rowData.totalET
				}, otherRow)[0];
				//db row 
				var dbRow = this.etDBRow.insertRows({
					times: {
						totalET: this.rowData.totalET,
						dbET: this.rowData.dbET
					}
				}, totalRow)[0];
				//cfc row
				var cfcRow = this.etCFCRow.insertRows({
					times: {
						totalET: this.rowData.totalET,
						cfcET: this.rowData.cfcET
					}
				}, dbRow)[0];
			}			
		}
	},
	
	renderExceptionTable: function() {				
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.exceptionHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add exception rows
		if (this.rowData.exceptionRows.length) {
			var row = this.exceptionRowTag.insertRows({rows: this.rowData.exceptionRows}, this.table.childNodes[1])[0];
		}		
	},
	
	renderDBTable: function() {				
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.queryHeaderRow.insertRows({}, this.table.firstChild)[0];
		var sqlString = "";
		var rowNum = 0;
		//add db rows
		if (this.rowData.queryRows.length) {
			var row = this.queryRowTag.insertRows({rows: this.rowData.queryRows}, this.table.childNodes[1])[0];
		}		
	},
		
	renderTraceTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.traceHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add trace rows
		if (this.rowData.traceRows.length) {
			if (ColdFire['enhanceTrace']) {
				var row = this.traceRowEnhancedTag.insertRows({rows: this.rowData.traceRows}, this.table.childNodes[1])[0];
			} else {
				var row = this.traceRowTag.insertRows({rows: this.rowData.traceRows}, this.table.childNodes[1])[0];
			}			
		}
						
		//now we need to format the result if we are doing an enhanced trace
		if (ColdFire['enhanceTrace']) {
			var traceCell = null;
			for (var i = 0; i < this.rowData.traceRows.length; i++) {
				if (this.rowData.traceRows && this.rowData.traceRows[i] && this.rowData.traceRows[i].RESULT) {
					traceCell = getElementsByClass("traceValue", this.table, "td")[i];
					FormatterPlate.dump.append({
						value: eval('(' + this.rowData.traceRows[i].RESULT + ')')
					}, traceCell);
				}
			}
		}
	},
	
	renderTimerTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.timerHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add timer rows
		if (this.rowData.timerRows.length)
			var row = this.timerRowTag.insertRows({rows: this.rowData.timerRows}, this.table.childNodes[1])[0];		
	},
	
	renderVariablesTable: function() {		
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.varHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add variable rows
		var vars = this.variables;	
		if (vars.length)			
			var row = this.varRowTag.insertRows({rows: vars}, this.table.childNodes[1])[0];		
		// now we need to format the variable
		var varCell = null;	
		for( var i = 0; i < vars.length; i++ ){			
			if (this.rowData.variablesRows && this.rowData.variablesRows[i] && this.rowData.variablesRows[i].VALUE) {
				varCell = getElementsByClass("varValue", this.table, "td")[i];
				FormatterPlate.dump.append( {value: eval('(' + this.rowData.variablesRows[i].VALUE + ')')}, varCell);
			}			
		}	
	},
	
	showToolbox: function(row) {
		var toolbox = this.getToolbox();
		if (row)
		{
			if (hasClass(row, "editing"))
				return;
			
			toolbox.varRow = row;

			var offset = getClientOffset(row);
			toolbox.style.top = offset.y + "px";
			this.panelNode.appendChild(toolbox);
		}
		else
		{
			delete toolbox.varRow;
			if (toolbox.parentNode)
				toolbox.parentNode.removeChild(toolbox);
		}
	},
	
	getToolbox: function() {
		if (!this.toolbox)
			this.toolbox = ToolboxPlate.tag.replace({domPanel: this}, this.document);

		return this.toolbox;
	},
	
	onMouseOver: function(event) {			
		var variableRow = getAncestorByClass(event.target, "variableRow");
		if (variableRow) 			
			 this.showToolbox(variableRow);			
	},
	
	onMouseOut: function(event) {				
		if (isAncestor(event.relatedTarget, this.getToolbox()))
			return;

		var variableRow = getAncestorByClass(event.relatedTarget, "variableRow");
		if (!variableRow) 
			this.showToolbox(null);			
	},
	
	onHeaderClick: function(event) {
		var table = getAncestorByClass(event.target, "panelTable");
        var header = getAncestorByClass(event.target, "headerCell");
		var queryTable = getAncestorByClass(event.target, "queryTable");
        if (!header)
            return;

        var numerical = !hasClass(header, "alphaValue");

        var colIndex = 0;
        for (header = header.previousSibling; header; header = header.previousSibling)
            ++colIndex;

		if (queryTable) {
			this.sortQueries(table, colIndex, numerical);
		} else {
			this.sort(table, colIndex, numerical);
		}
        
	},
	
	sort: function(table, colIndex, numerical)
    {
        var tbody = getChildByClass(table, "panelTableBody");

        var values = [];
        for (var row = tbody.childNodes[0]; row; row = row.nextSibling)
        {
            var cell = row.childNodes[colIndex];
            var value = numerical ? parseFloat(cell.textContent) : cell.textContent;
            values.push({row: row, value: value});
        }

        values.sort(function(a, b) { return a.value < b.value ? -1 : 1; });

        var headerRow = table.firstChild.firstChild;
        var headerSorted = getChildByClass(headerRow, "headerSorted");
        removeClass(headerSorted, "headerSorted");

        var header = headerRow.childNodes[colIndex];
        setClass(header, "headerSorted");

        if (!header.sorted || header.sorted == 1)
        {
            removeClass(header, "sortedDescending");
            setClass(header, "sortedAscending");

            header.sorted = -1;

            for (var i = 0; i < values.length; ++i) {
                values[i].row.setAttribute("odd", (i % 2));
                tbody.appendChild(values[i].row);
            }
        }
        else
        {
            removeClass(header, "sortedAscending");
            setClass(header, "sortedDescending");

            header.sorted = 1;

            for (var i = values.length-1; i >= 0; --i) {
                values[i].row.setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].row);
            }
        }
    },
	
	sortQueries: function(table, colIndex, numerical)
    {
        var tbody = getChildByClass(table, "panelTableBody");

        var values = [];
        for (var row = tbody.childNodes[0]; row; row = row.nextSibling.nextSibling)
        {
            var sqlRow = row.nextSibling;
			var cell = row.childNodes[colIndex];
            var value = numerical ? safeParseFloat(cell.textContent) : cell.textContent;
            values.push({rows: [row, sqlRow], value: value});
        }

        values.sort(function(a, b) { return a.value < b.value ? -1 : 1; });

        var headerRow = table.firstChild.firstChild;
        var headerSorted = getChildByClass(headerRow, "headerSorted");
        removeClass(headerSorted, "headerSorted");

        var header = headerRow.childNodes[colIndex];
        setClass(header, "headerSorted");

        if (!header.sorted || header.sorted == 1)
        {
            removeClass(header, "sortedDescending");
            setClass(header, "sortedAscending");

            header.sorted = -1;

            for (var i = 0; i < values.length; ++i) {
                values[i].rows[0].setAttribute("odd", (i % 2));
                tbody.appendChild(values[i].rows[0]);
				values[i].rows[1].setAttribute("odd", (i % 2));
                tbody.appendChild(values[i].rows[1]);
            }
        }
        else
        {
            removeClass(header, "sortedAscending");
            setClass(header, "sortedDescending");

            header.sorted = 1;

            for (var i = values.length-1; i >= 0; --i) {
                values[i].rows[0].setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].rows[0]);
				values[i].rows[1].setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].rows[1]);
            }
        }
    },
	
	getVariableRowIndex : function(row) {
		var index = -1;
		for (; row && hasClass(row, "variableRow"); row = row.previousSibling)
			++index; 
		return index; 
	},
	
	addVariable: function(variable){		
		var variableLine = this.context.chrome.$("fbColdFireVariableLine");
		var varString = variable ? variable : variableLine.value;	
		var re = /^[A-Za-z_\u0024\u00A2\u00A3\u00A4\u00A5\u09F2\u09F3\u0E3F\u17DB\uFDFC\u20A0\u20A1\u20A2\u20A3\u20A4\u20A5\u20A6\u20A8\u20A9\u20AA\u20AB\u20AC\u20AD\u20AD\u20AD\u20AE\u20AF\u20B0\u20B1][A-Za-z0-9_\u0024\u00A2\u00A3\u00A4\u00A5\u09F2\u09F3\u0E3F\u17DB\uFDFC\u20A0\u20A1\u20A2\u20A3\u20A4\u20A5\u20A6\u20A8\u20A9\u20AA\u20AB\u20AC\u20AD\u20AD\u20AD\u20AE\u20AF\u20B0\u20B1]*$/;

		
		var nameArray = varString.split(".");
		
		for (var i=0; i < nameArray.length; i++) {	
			if (!re.test(nameArray[i])) {			
				promtService.alert(window, $CFSTR("ColdFire"), $CFSTR("InvalidVarName") + ": " + varString);
				return;			
			}
		}
				
		variableLine.value = "";
					
		if (varString.length > 0) 
		{
			var temp = {
				LABEL: varString,
				TYPE: "",
				VALUE: ""				
			};
			
			if(!this.rowData.variablesRows)
				this.rowData.variablesRows = [];
			
			this.rowData.variablesRows.push(temp);	
			
			this.variables.push(varString);			
		}
		Firebug.ColdFireModule.changeCurrentView("Variables");		
	},
		
	deleteVariable : function(row) {
		var rowIndex = this.getVariableRowIndex(row);
		if (rowIndex > -1) {
			if (this.rowData.variablesRows && this.rowData.variablesRows.length > rowIndex)
				this.rowData.variablesRows.splice(rowIndex,1);
			this.variables.splice(rowIndex,1);   
		}
		Firebug.ColdFireModule.changeCurrentView("Variables");
	},
	
	deleteVariables : function() {
		if (this.rowData.variablesRows)
			this.rowData.variablesRows.length = 0;
		this.variables.length = 0; 
		Firebug.ColdFireModule.changeCurrentView("Variables");		
	},
	
	clearVarLine: function() {		
		var variableLine = this.context.chrome.$("fbColdFireVariableLine");
		variableLine.value = "";
	},
	
	cfMenuOption: function (label, option) {
		return {
				label: $CFSTR(label), 
				type: "checkbox", 
				nol10n: true,
				checked: ColdFire[option],
				command: bindFixed(ColdFire.setPref, ColdFire, option, !ColdFire[option])
				};		
	},
	
	cfMenuOptionRefresh: function (label, option) {
		return {
				label: $CFSTR(label), 
				type: "checkbox", 
				nol10n: true,
				checked: ColdFire[option],
				command: bindFixed(this.toggleOption, this, option)
				};		
	},
	
	toggleForceDebug: function (option) {
		var val = !ColdFire[option]
		ColdFire.setPref(option,val);
		if (this.context.window.wrappedJSObject.ColdFusion) {
			setDebugMode(this.context.window.wrappedJSObject.ColdFusion,val);
		}		
	},
		
	toggleOption: function (option) {
		ColdFire.setPref(option,!ColdFire[option]);
		this.displayCurrentView();
	},
			
	// handle files from netMonitor
	
	updateFile: function(file)
	{
		
		var index = this.queue.indexOf(file);
					
		if ((index == -1) && (this.hasColdFireHeader(file))) {
			
			if (this.queue.length >= ColdFire['maxQueueRequests'])
				this.queue.splice(0, 1);
			
			index = this.queue.push(file) - 1;	
			
			if (ColdFire['showLastRequest'] || index == 0) {
				this.navigate(file);
			} else {
				this.displayCurrentView();
			}
		
		}	
			
	},
	
	hasColdFireHeader: function(file){
		if (!file.responseHeaders) {
			return false;
		}
					
		for (var i = 0; i < file.responseHeaders.length; i++){
			if (file.responseHeaders[i].name.match(/x-coldfire/))
				return true;			
		}
		
		return false;
	}

}); 

Firebug.registerModule( Firebug.ColdFireModule ); 
Firebug.registerPanel( ColdFirePanel );

}});