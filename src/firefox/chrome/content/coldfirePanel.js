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
	
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;
const STATE_IS_REQUEST = Components.interfaces.nsIWebProgressListener.STATE_IS_REQUEST;
const NOTIFY_ALL = Components.interfaces.nsIWebProgress.NOTIFY_ALL;

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
	
var ColdFire;
var Chrome;

Firebug.ColdFireExtension = extend(Firebug.Module, 
{ 
	coldfireView: "General",
	initialize: function() {
	    ColdFire = FirebugChrome.window.ColdFire;
	    ColdFire.initialize();
    },
	initContext: function( context ) 
	{
		ColdFire.enable();
		monitorColdFireProgress( context );
    },
    destroyContext: function( context ) 
    {
    	ColdFire.disable();
    	unmonitorColdfireProgress( context );
    },	
	syncFilterButtons: function(chrome)
    {
        var button = chrome.$("fbColdFireFilter-"+this.coldfireView);
        button.checked = true;    
    },	
	reattachContext: function(context)
    {
        var chrome = context ? context.chrome : FirebugChrome;
        this.syncFilterButtons(chrome);
    },	
    shutdown: function() 
    {
      ColdFire.shutdown();
	  ColdFire = null;
	  if(Firebug.getPref( 'defaultPanelName')=='ColdFireExtension' ) {
        Firebug.setPref( 'defaultPanelName','console' );
      }
    },
    showPanel: function( browser, panel ) 
    { 
        Chrome = browser.chrome;		
		
        var isColdFireExtension = panel && panel.name == "ColdFireExtension"; 
		var ColdFireExtensionButtons = Chrome.$( "fbColdFireExtensionButtons" ); 
        collapse( ColdFireExtensionButtons, !isColdFireExtension ); 
		
		var isVariablesView = this.coldfireView == "Variables";
		var ColdFireVariableBox = Chrome.$( "fbColdFireVariableBox" ); 
		collapse(ColdFireVariableBox, !(isColdFireExtension && isVariablesView));
        
        if( panel && panel.context.coldfireProgress )
		{
			if( panel.name == "ColdFireExtension" )
				panel.context.coldfireProgress.activate( panel );
			else
				panel.context.coldfireProgress.activate( null );
		}
		
		
		if (panel && panel.name == "ColdFireExtension")
			this.changeCurrentView(this.coldfireView);
		
    },
    changeCurrentView: function( view ) {
    	this.coldfireView = view;
				
		var isVariablesView = this.coldfireView == "Variables";
		var ColdFireVariableBox = Chrome.$( "fbColdFireVariableBox" ); 
		collapse(ColdFireVariableBox, !(isVariablesView));
		
    	FirebugContext.getPanel( "ColdFireExtension" ).displayCurrentView();
    },	
	addVariable: function(context, variable){
		
		var variableLine = getVariableLine(context);
        var varString = variable ? variable : variableLine.value;
		this.clearVarLine(context);
		if (varString.length > 0)
			ColdFire.addVariable(varString);
		
		this.changeCurrentView("Variables");
		
	},	
	removeVariable: function(index) {
		ColdFire.removeVariable(index);
		if (this.coldfireView == "Variables")		
			this.changeCurrentView("Variables");
	},	
	clearVariables: function() {
		ColdFire.clearVariables();
		if (this.coldfireView == "Variables")		
			this.changeCurrentView("Variables");
	},
	clearVarLine: function(context) {		
		var variableLine = getVariableLine(context);
        variableLine.value = "";
	}
	
}); 

function getVariableLine(context)
{
    return context.chrome.$("fbColdFireVariableLine");
}


function monitorColdFireProgress( context ) 
{
	if( !context.coldfireProgress ) 
	{
	    var listener = context.coldfireProgress = new coldfireProgress(context);
	    context.browser.addProgressListener(listener, NOTIFY_ALL);
	}
}
function unmonitorColdfireProgress( context )
{
	if ( context.coldfireProgress ) 
	{
    	if (context.browser.docShell)
    		context.browser.removeProgressListener( context.coldfireProgress, NOTIFY_ALL );
   		delete context.coldfireProgress;
    }
}
function coldfireProgress(context)
{    
    this.context = context;

    var queue = null;
    var panel = null;
    this.post = function (data) {
    	if(panel){
    		panel.generateRows(data);
    		queue = [];
    	}
    	else{
    		queue = [];
    		queue.push(data);
    	}
    };
    
    this.activate = function(activePanel)
    {
       	this.panel = panel = activePanel;
       	if(panel){
       		this.flush();
       	}
    };
    
    this.clear = function(){
    	queue = [];
    };
    
    this.flush = function() {
    	for(var i = 0; i < queue.length; i+= 2) {
			panel.generateRows(queue[i]);
    	}
    	queue = [];
    };
    
    this.clear();
    
}
coldfireProgress.prototype =
{
    panel: null,
    QueryInterface: function( aIID )
    {
    	if ( aIID.equals( Components.interfaces.nsIWebProgressListener ) || 
    	aIID.equals( Components.interfaces.nsISupportsWeakReference ) ||
    	aIID.equals( Components.interfaces.nsISupports ) )
    		return this;
    	throw Components.results.NS_NOINTERFACE;
    },
    onStateChange: function( aProgress, aRequest, aFlag, aStatus )
    {
    	if( aFlag & STATE_STOP && aFlag & STATE_IS_REQUEST )
    	{
    		if(aRequest.getResponseHeader){
    			try
    			{
					var generalHeader = '';
					var queriesHeader = '';
					var traceHeader = '';
					var templatesHeader = '';
					var ctemplatesHeader = '';
					var cfcsHeader = '';
					var timerHeader= '';
					var variablesHeader= '';
					//get all general headers
					var i = 1;
					try
					{
						while( true )
						{
							generalHeader += aRequest.getResponseHeader( "x-coldfire-general-" + i );
							i++;
						}
					}		
					catch(e){}			
					//get all query headers
					var i = 1;
					try
					{
						while( true )
						{
							queriesHeader += aRequest.getResponseHeader( "x-coldfire-queries-" + i );
							i++;
						}
					}
					catch(e){}
					//get all trace headers
					i = 1;
					try
					{
						while( true )
						{
							traceHeader += aRequest.getResponseHeader( "x-coldfire-trace-" + i );
							i++;
						}
					}
					catch(e){}
					//get all templates headers
					i = 1;
					try
					{
						while( true )
						{
							templatesHeader += aRequest.getResponseHeader( "x-coldfire-templates-" + i );
							i++;
						}
					}
					catch(e){}
					//get all ctemplates headers
					var i = 1;
					try
					{
						while( true )
						{
							ctemplatesHeader += aRequest.getResponseHeader( "x-coldfire-ctemplates-" + i );
							i++;
						}
					}
					catch(e){}
					//get all cfc headers
					var i = 1;
					try
					{
						while( true )
						{
							cfcsHeader += aRequest.getResponseHeader( "x-coldfire-cfcs-" + i );
							i++;
						}
					}
					catch(e){}
					//get all timer headers
					var i = 1;
					try
					{
						while( true )
						{
							timerHeader += aRequest.getResponseHeader( "x-coldfire-timer-" + i );
							i++;
						}
					}
					catch(e){}
					//get all variable headers
					var i = 1;
					try
					{
						while( true )
						{
							variablesHeader += aRequest.getResponseHeader( "x-coldfire-variables-" + i );
							i++;
						}						
					}					
					catch(e){}					
					try{
					cfObj = {
						generalObj: eval( "(" + generalHeader + ")" ),
						queriesObj: eval( "(" + queriesHeader + ")" ),
						traceObj: eval( "(" + traceHeader + ")" ),
						templatesObj:  eval( "(" + templatesHeader + ")" ),
						ctemplatesObj: eval( "(" + ctemplatesHeader + ")" ),
						cfcsObj: eval( "(" + cfcsHeader + ")" ),
						timerObj: eval( "(" + timerHeader + ")"),
						variablesObj: eval( "(" + variablesHeader + ")")
					};
					}catch(e){}
		   			this.post( cfObj ); 
		   		} 
		   		catch( e ) {}
		   	}
	   	}
	   	return 0;
	},
	onLocationChange: function(){return 0;},
	onProgressChange: function() {return 0;},
	onStatusChange: function() {return 0;},
	onSecurityChange: function() {return 0;},
	onLinkIconAvailable: function() {return 0;}
};

// add two new domplate tags to handle our stylesheet and script

function defineTags()
{
    for (var i = 0; i < arguments.length; ++i)
    {
        var tagName = arguments[i];
        var fn = new Function("var newTag = new DomplateTag('"+tagName+"'); return newTag.merge(arguments);");

        var fnName = tagName.toUpperCase();
        top[fnName] = fn;
    }
}

defineTags("link", "script");


function ColdFireExtensionPanel() {} 
ColdFireExtensionPanel.prototype = domplate(Firebug.Panel, 
{  
	// domplate tags
	
	styleSheetTag: 
		LINK({	rel: "stylesheet", 
				type: "text/css", 
				href: "chrome://coldfireextension/skin/panel.css", 
				id: "coldfirePanelCSS" }),
		
	scriptTag:
		SCRIPT({type: "text/javascript", id: "coldfirePanelScript"}),		
	
	tableTag:
        TABLE({width: "100%", cellpadding: 2, cellspacing: 0},
            THEAD(),
			TBODY()
        ),
		
	generalHeaderRow:
		TR(
			TH({class: "headerCell", width: "25%"}),
            TH({class: "headerCell", width: "75%"})
		),
		
	generalRowTag:
		FOR("row", "$rows",
            TR(
                TD({class: "valueCell", width: "25%"},"$row.LABEL|safeCFSTR"),
				TD({class: "valueCell", width: "75%"},"$row.VALUE")                    
            )
        ),
		
	etHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "20%"}, $CFSTR('Type')),
			TH({class: "headerCell", width: "35%"}, $CFSTR('File')),
			TH({class: "headerCell", width: "25%"}, $CFSTR('Method')),
			TH({class: "headerCell", width: "10%"}, $CFSTR('TotalInstances')),
			TH({class: "headerCell", width: "10%"}, $CFSTR('AvgExecTime'))		
		),
		
	etRowTag:
		FOR("row", "$rows",
            TR({class: "$row.AVGTIME|isSlow"},
                TD({class: "valueCell", width: "20%"},"$row.TYPE"),
				TD({class: "valueCell", width: "35%"},"$row.TEMPLATE"),
				TD({class: "valueCell", width: "25%"},"$row.METHOD"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.TOTALINSTANCES"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.AVGTIME|formatTime")                    
            )
        ),
		
	etTotalRow:
		TR(
			TD({class: "valueCell bold", width: "90%", colspan: 4}, $CFSTR('TotalExecTime')),
			TD({class: "valueCell bold", width: "10%", align: "right"}, "$totalTime|formatTime")		
		),
		
	queryHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "10%"}, $CFSTR('QueryName')),
			TH({class: "headerCell", width: "10%"}, $CFSTR('DataSource')),			
			TH({class: "headerCell", width: "7%"},  $CFSTR('Time')),
			TH({class: "headerCell", width: "7%"}, $CFSTR('Records')),
			TH({class: "headerCell", width: "7%"}, $CFSTR('Cached')),
			TH({class: "headerCell", width: "49%"}, $CFSTR('Template')),
			TH({class: "headerCell", width: "10%"},  $CFSTR('Timestamp'))					
		),
		
	queryRowTag:
		FOR("row", "$rows",
            TR({class: "$row.ET|isSlow"},
                TD({width: "10%"},"$row.QUERYNAME"),
				TD({width: "10%"},"$row.DATASOURCE"),				
				TD({width: "7%", align: "right"},"$row.ET|formatTime"),
				TD({width: "7%", align: "right"},"$row.RECORDSRETURNED"),
				TD({width: "7%", align: "center"}, "$row.CACHEDQUERY|formatCachedQuery"),
				TD({width: "49%"}, "$row.TEMPLATE"),
				TD({width: "10%"}, "$row.TIMESTAMP|formatTimeStamp")                    
            )			
        ),
		
	querySqlTag:
		TR(
			TD({class: "valueCell querySQL", width: "100%", colspan: 7})
		),
		
	traceHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "10%"}, $CFSTR('Type')),
			TH({class: "headerCell", width: "10%"},  $CFSTR('Delta')),
			TH({class: "headerCell", width: "80%"},  $CFSTR('Message'))	
		),
		
	traceRowTag:
		FOR("row", "$rows",
            TR({class: "$row.PRIORITY|getTraceClass"},
                TD({class: "valueCell", width: "10%"},"$row.PRIORITY|formatPriority|safeCFSTR"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.DELTA|formatTime"),
				TD({class: "valueCell", width: "80"},"$row.MESSAGE")                    
            )
        ),
		
	timerHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "90%"}, $CFSTR('Message')),
			TH({class: "headerCell", width: "10%"},  $CFSTR('Duration'))
		),
	
	timerRowTag:
		FOR("row", "$rows",
            TR(
                TD({class: "valueCell", width: "90%"},"$row.MESSAGE"),
				TD({class: "valueCell", width: "10%", align: "right"},"$row.DURATION|formatTime")
            )
        ),
		
	varHeaderRow:
		TR({class: "headerRow"},
			TH({class: "headerCell", width: "20%"}, $CFSTR('Variable')),
			TH({class: "headerCell", width: "80%"},  $CFSTR('Value'))
		),
	
	varRowTag:
		FOR("row", "$rows",
            TR({class: "variableRow", level: 0},
                TD({class: "valueCell", width: "20%", valign: "top"},"$row"),
				TD({class: "valueCell varValue", width: "80%", valign: "top"})
            )
        ),
	
	// Convenience for domplates	
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
	formatCachedQuery: function(cached)
	{
		return (cached == "1")?"true":"";
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
	// panel	
	name: $CFSTR("ColdFireExtension"), 
    title: $CFSTR("ColdFusion"), 
    searchable: false, 
    editable: false,
    generalRows: new Array(),
    etRows: new Array(),
	queryRows: new Array(),
	traceRows: new Array(),
	timerRows: new Array(),
	totalET: null,
	sortDirection: "ASC",
	sortBy: "",
	formatter: new ColdFireFormatter(),
	dumper: new ColdFireDump(),
	initialize: function(context, doc)
    {
        this.onMouseOver = bind(this.onMouseOver, this);
        this.onMouseOut = bind(this.onMouseOut, this);		
		this.setUpDoc(doc);		
		Firebug.Panel.initialize.apply(this, arguments);		
    },	   
    reattach: function(doc)
    {
       	this.setUpDoc(doc);		
		Firebug.Panel.reattach.apply(this, arguments);	
    }, 	
	setUpDoc: function(doc){
		var head = doc.getElementsByTagName("head")[0];
		// add stylesheet
		if (!doc.getElementById('coldfirePanelCSS')) {			
			var styleSheet = this.styleSheetTag.append({},head);			
		};
		//add script
		if (!doc.getElementById('coldfirePanelScript')) {				
			var script = this.scriptTag.append({},head);
			script.innerHTML = 'function tRow(s) {t = s.parentNode.lastChild;tTarget(t, tSource(s)) ;}function tTable(s) {var switchToState = tSource(s) ;var table = s.parentNode.parentNode;for (var i = 1; i < table.childNodes.length; i++) {t = table.childNodes[i] ;if (t.style) {tTarget(t, switchToState);}}}function tSource(s) {if (s.style.fontStyle == "italic" || s.style.fontStyle == null) {s.style.fontStyle = "normal";s.title = "click to collapse";return "open";} else {s.style.fontStyle = "italic";s.title = "click to expand";return "closed" ;}}function tTarget (t, switchToState) {if (switchToState == "open") {t.style.display = "";} else {t.style.display = "none";}}';		
		};			
	},		
	initializeNode: function(oldPanelNode)
    {
        this.panelNode.addEventListener("mouseover", this.onMouseOver, false);
        this.panelNode.addEventListener("mouseout", this.onMouseOut, false);
    },
	destroyNode: function()
    {
        this.panelNode.removeEventListener("mouseover", this.onMouseOver, false);
        this.panelNode.removeEventListener("mouseout", this.onMouseOut, false);
    },	
	getOptionsMenuItems: function()
	{
        return [
            this.cfMenuOption("ParseQueryParams","parseParams"),
			"-",
            {label: $CFSTR("ClearVariables"), nol10n: true, command: bindFixed(this.deleteVariables, this) }      
        ];
    },	
    generateRows: function( theObj )
	{
		try{
		this.generalRows = new Array();
	    for( var i = 0; i < theObj.generalObj.DATA.LABEL.length; i++ ){
			if(theObj.generalObj.DATA.LABEL[i] == 'TotalExecTime') {
				this.totalET = theObj.generalObj.DATA.VALUE[i]
				continue;
			}
			var temp = {
				LABEL: theObj.generalObj.DATA.LABEL[i],
				VALUE: theObj.generalObj.DATA.VALUE[i]
			}
			this.generalRows.push( temp );
		}
		this.queryRows = new Array();
		for( var i = 0; i < theObj.queriesObj.DATA.DATASOURCE.length; i++ ){
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
			this.queryRows.push(query);
		}
	    this.etRows = new Array();
		for(var i = 0; i < theObj.templatesObj.DATA.TOTALTIME.length; i++){
		   	var temp = { 
		   		TYPE: "Template",
				TOTALTIME: theObj.templatesObj.DATA.TOTALTIME[i],
		    	AVGTIME: theObj.templatesObj.DATA.AVGTIME[i],
	   			TEMPLATE: theObj.templatesObj.DATA.TEMPLATE[i],
	   		 	TOTALINSTANCES: theObj.templatesObj.DATA.TOTALINSTANCES[i],
				METHOD: ""
	    	};
	    	this.etRows.push(temp);
	    }
	    for(var i = 0; i < theObj.ctemplatesObj.DATA.TOTALTIME.length; i++){
		   	var temp = { 
		   		TYPE: "Child Template / Tag",
				TOTALTIME: theObj.ctemplatesObj.DATA.TOTALTIME[i],
		    	AVGTIME: theObj.ctemplatesObj.DATA.AVGTIME[i],
	   			TEMPLATE: theObj.ctemplatesObj.DATA.TEMPLATE[i],
	   		 	TOTALINSTANCES: theObj.ctemplatesObj.DATA.TOTALINSTANCES[i],
				METHOD: ""
	    	};
	    	this.etRows.push(temp);
	    }
		for(var i = 0; i < theObj.cfcsObj.DATA.TOTALTIME.length; i++){
		   	var temp = { 
		   		TYPE: "CFC",
				TOTALTIME: theObj.cfcsObj.DATA.TOTALTIME[i],
		    	AVGTIME: theObj.cfcsObj.DATA.AVGTIME[i],
	   			TEMPLATE: theObj.cfcsObj.DATA.CFC[i],
	   		 	TOTALINSTANCES: theObj.cfcsObj.DATA.TOTALINSTANCES[i],
				METHOD: theObj.cfcsObj.DATA.METHOD[i]
	    	};
	    	this.etRows.push(temp);
	    }
		this.traceRows = new Array();
		for( var i = 0; i < theObj.traceObj.DATA.DELTA.length; i++ )
		{
			var trace = {
				DELTA: theObj.traceObj.DATA.DELTA[i],
				ENDTIME: theObj.traceObj.DATA.ENDTIME[i],
				MESSAGE: theObj.traceObj.DATA.MESSAGE[i],
				PRIORITY: theObj.traceObj.DATA.PRIORITY[i]
			};
			this.traceRows.push(trace);
		}
		this.timerRows = new Array();
		for( var i = 0; i < theObj.timerObj.DATA.MESSAGE.length; i++ )
		{
			var timer = {
				MESSAGE: theObj.timerObj.DATA.MESSAGE[i],
				DURATION: theObj.timerObj.DATA.DURATION[i]
			};
			this.timerRows.push(timer);
		}
		this.variablesRows = new Array();
		for( var i = 0; i < theObj.variablesObj.DATA.VALUE.length; i++ )
		{
			var variable = {
				LABEL: theObj.variablesObj.DATA.LABEL[i],
				TYPE: theObj.variablesObj.DATA.TYPE[i],
				VALUE: theObj.variablesObj.DATA.VALUE[i]				
			};
			this.variablesRows.push(variable);
		}
		}catch(e){/*alert(e.message);*/}
	    this.displayCurrentView();
	},
	displayCurrentView: function(){
		this.panelNode.innerHTML = "";
		switch( Firebug.ColdFireExtension.coldfireView ) {
			case "General":
				this.renderGeneralTable();
				break;
			case "ET":
				this.renderETTable();
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
		//create header		
		var headerRow =  this.generalHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add general rows  
		if(this.generalRows.length)
			var row = this.generalRowTag.insertRows({rows: this.generalRows}, this.table.lastChild)[0];			
	},
	renderETTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.etHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add et rows
		if(this.etRows.length)
			var row = this.etRowTag.insertRows({rows: this.etRows}, this.table.lastChild)[1];		
		if(this.totalET != null) 
			var totalRow = this.etTotalRow.insertRows({totalTime: this.totalET}, row)[0];
	},
    renderDBTable: function() {				
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.queryHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add db rows
		if (this.queryRows.length) {
			var row = this.queryRowTag.insertRows({rows: this.queryRows}, this.table.lastChild)[0];
			do {
				newRow = this.querySqlTag.insertRows({},row)[0];
				row = newRow.nextSibling;
			} while (row)					
		}			
		// now we need to go build the sql string
		var sqlString = "";
		var sqlCell = null;				
		for( var i = 0; i < this.queryRows.length; i++ ){
			sqlString ="";
			sqlCell = null;
			if (this.queryRows[i].TYPE == "StoredProcedure") {
				sqlString += this.formatter.formatSPParams(this.queryRows[i].PARAMETERS);
				sqlString += this.formatter.formatSPResultSets(this.queryRows[i].RESULTSETS);
			} else {
				sqlString += this.formatter.formatQuery(this.queryRows[i].SQL,this.queryRows[i].PARAMETERS);
			}	
			sqlCell = getElementsByClass("querySQL", this.table, "td")[i];
			sqlCell.innerHTML = '<div class="sql"> <pre>' + sqlString + "</pre></div>";					
		}		
	},
	renderTraceTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.traceHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add trace rows
		if (this.traceRows.length)
			var row = this.traceRowTag.insertRows({rows: this.traceRows}, this.table.lastChild)[0];			
	},
	renderTimerTable: function() {
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.timerHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add timer rows
		if (this.timerRows.length)
			var row = this.timerRowTag.insertRows({rows: this.timerRows}, this.table.lastChild)[0];		
	},
	renderVariablesTable: function() {		
		//create table		
		this.table = this.tableTag.append({}, this.panelNode, this);
		//create header		
		var headerRow =  this.varHeaderRow.insertRows({}, this.table.firstChild)[0];
		//add variable rows
		var vars = ColdFire.getVariables();	
		if (vars.length)			
			var row = this.varRowTag.insertRows({rows: vars}, this.table.lastChild)[0];		
		// now we need to go build the var string
		var varString = "";
		var varCell = null;	
		for( var i = 0; i < vars.length; i++ ){
			varString ="";
			varCell = null;
			if (this.variablesRows && this.variablesRows[i] && this.variablesRows[i].VALUE) {
				varString = this.dumper.dump(this.variablesRows[i].VALUE,false);
			}
			varCell = getElementsByClass("varValue", this.table, "td")[i];
			varCell.innerHTML = varString;
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
	getVariableRowIndex : function(row) {
		var index = -1;
		for (; row && hasClass(row, "variableRow"); row = row.previousSibling)
			++index; 
		return index; 
	},
	deleteVariable : function(row) {
		var rowIndex = this.getVariableRowIndex(row);
		if (rowIndex > -1) {
			if (this.variablesRows && this.variablesRows.length > rowIndex)
				this.variablesRows.splice(rowIndex,1);
			Firebug.ColdFireExtension.removeVariable(rowIndex);    
		}
	},
	deleteVariables : function() {
		if (this.variablesRows)
			this.variablesRows.length = 0;
		Firebug.ColdFireExtension.clearVariables();		
	},
	cfMenuOption: function (label, option) {
		return {
            	label: $CFSTR(label), 
            	type: "checkbox", 
            	nol10n: true,
            	checked: ColdFire[option],
        		command: bindFixed(ColdFire.updatePref, ColdFire, option, !ColdFire[option])
        		};		
	}
	
	/*
	tRows: function (s) {
		t = s.parentNode.lastChild;
		tTarget(t, tSource(s));
	},
	tTable: function(s) {
		var switchToState = tSource(s);
		var table = s.parentNode.parentNode;
		for (var i = 1; i < table.childNodes.length; i++) {
			t = table.childNodes[i];
			if (t.style) {
				tTarget(t, switchToState);
			}
		}
	},
	tSource: function (s) {
		if (s.style.fontStyle == "italic" || s.style.fontStyle == null) {
			s.style.fontStyle = "normal";
			s.title = "click to collapse";
			return "open";
		} else {
			s.style.fontStyle = "italic";
			s.title = "click to expand";
			return "closed" ;
		}
	},
	tTarget: function(t, switchToState) {
		if (switchToState == "open") {
			t.style.display = "";
		} else {
			t.style.display = "none";
		}
	}
	*/
	
}); 

Firebug.registerModule( Firebug.ColdFireExtension ); 
Firebug.registerPanel( ColdFireExtensionPanel );

}});

function $CFSTR(name)
{
    return document.getElementById("strings_coldfire").getString(name);
}

function getElementsByClass(searchClass,node,tag) 
{
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}

/* A logger
var gConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

function coldfire_logMessage(aMessage) 
{
  gConsoleService.logStringMessage('ColdFire: ' + aMessage);
}
*/
