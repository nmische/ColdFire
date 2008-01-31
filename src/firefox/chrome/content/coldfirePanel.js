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
					var queriesHeader = '';
					var traceHeader = '';
					var templatesHeader = '';
					var ctemplatesHeader = '';
					var cfcsHeader = '';
					var timerHeader= '';
					var variablesHeader= '';
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
						generalObj: eval( "(" + aRequest.getResponseHeader( "x-coldfire-general" ) + ")" ),
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



function ColdFireExtensionPanel() {} 
ColdFireExtensionPanel.prototype = extend(Firebug.Panel, 
{ 
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
		
		// add stylesheet
		if (!doc.getElementById('coldfirePanelCSS')) {			
			var coldfirePanelCSS=doc.createElement('link');
			coldfirePanelCSS.setAttribute('rel','stylesheet');
			coldfirePanelCSS.setAttribute('type','text/css');
			coldfirePanelCSS.setAttribute('href','chrome://coldfireextension/skin/panel.css');
			coldfirePanelCSS.setAttribute('id','coldfirePanelCSS');
			doc.getElementsByTagName("head")[0].appendChild(coldfirePanelCSS);
		};
				
		//add script
		if (!doc.getElementById('coldfirePanelScript')) {			
			var script = 'function tRow(s) {t = s.parentNode.lastChild;tTarget(t, tSource(s)) ;}function tTable(s) {var switchToState = tSource(s) ;var table = s.parentNode.parentNode;for (var i = 1; i < table.childNodes.length; i++) {t = table.childNodes[i] ;if (t.style) {tTarget(t, switchToState);}}}function tSource(s) {if (s.style.fontStyle == "italic" || s.style.fontStyle == null) {s.style.fontStyle = "normal";s.title = "click to collapse";return "open";} else {s.style.fontStyle = "italic";s.title = "click to expand";return "closed" ;}}function tTarget (t, switchToState) {if (switchToState == "open") {t.style.display = "";} else {t.style.display = "none";}}';		
			var coldfirePanelScript = doc.createElement('script');
			coldfirePanelScript.setAttribute('type', 'text/javascript');
			coldfirePanelScript.setAttribute('id', 'coldfirePanelScript');
			coldfirePanelScript.appendChild(document.createTextNode(script));
			doc.getElementsByTagName("head")[0].appendChild(coldfirePanelScript);
		};				
	},		
	initializeNode: function(oldPanelNode)
    {
        this.panelNode.addEventListener("mouseover", this.onMouseOver, false);
        this.panelNode.addEventListener("mouseout", this.onMouseOut, false);
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
	    for(var i in theObj.generalObj){
			this.generalRows.push({key:i,value:theObj.generalObj[i]});
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
				TYPE: theObj.queriesObj.DATA.TYPE[i]
			};	
			this.queryRows.push( query );
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
	    	this.etRows.push( temp );
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
	    	this.etRows.push( temp );
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
	    	this.etRows.push( temp );
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
				for( var i = 0; i < this.generalRows.length; i++ ) {
					this.addGeneralRow(this.generalRows[i].key, this.generalRows[i].value);
				}
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
	renderETTable: function() {
		//create table
		var tbl = this.document.createElement( "table" );
		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
		//create header
		var tblString = new StringBuffer();
		tblString.append("<TR class='headerRow'><TH class='headerCell' width='20%'><B>" + $CFSTR('Type') + "</B></TH><TH class='headerCell' width='35%'><B>" + $CFSTR('File') + "</B></TH><TH class='headerCell' width='25%'><B>" + $CFSTR('Method') + "</B></TH><TH class='headerCell' width='10%'><B>" + $CFSTR('TotalInstances') + "</B></TH><TH class='headerCell' width='10%'><B>" + $CFSTR('AvgExecTime') + "</B></TH></TR>");
		//add template rows
		for( var i = 0; i < this.etRows.length; i++ ) {
			var style = ( parseInt( this.etRows[i].AVGTIME ) > 50 ) ? "style='background-color:#FFF0F5'" : "";
			tblString.append("<TR "+style+" ><TD class='valueCell'>"+this.etRows[i].TYPE+"</TD><TD class='valueCell'>"+this.etRows[i].TEMPLATE+"</TD><TD class='valueCell'>"+this.etRows[i].METHOD+"</TD><TD class='valueCell'>"+this.etRows[i].TOTALINSTANCES+"</TD><TD class='valueCell'>"+this.etRows[i].AVGTIME+" ms</TD></TR>");
		}
		if(this.totalET != null)
			tblString.append("<TR class='headerRow'><TD colspan='4'><B>" + $CFSTR('TotalExecTime') + "</B></TD><TD><B>"+this.totalET+"ms</B></TD></TR>");
		tbl.innerHTML = tblString.toString();
		this.panelNode.appendChild(tbl);
	},
    addGeneralRow: function( k, v ){
    	var realKey;
    	switch( k ){
    		case "COLDFUSIONSERVER":
    			realKey = $CFSTR("ColdFusionServer");
    			break;
    		case "TEMPLATE":
    			realKey = $CFSTR("Template");
    			break;
    		case "TIMESTAMP":
    			realKey = $CFSTR("Timestamp");
    			break;
    		case "LOCALE":
    			realKey = $CFSTR("Locale");
    			break;
    		case "USERAGENT":
    			realKey = $CFSTR("UserAgent");
    			break;
    		case "REMOTEIP":
    			realKey = $CFSTR("RemoteIP");
    			break;
    		case "REMOTEHOST":
    			realKey = $CFSTR("RemoteHost");
    			break;
    		case "APPLICATION":
    			realKey = $CFSTR("Application");
    			break;
    	}
   		var tbl = this.document.createElement( "table" );
   		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
   		tbl.style.borderBottom = "1px dotted #d3d3d3";
		var row = this.document.createElement( "tr" );
		var key = this.document.createElement( "td" );
		key.innerHTML = realKey;
		key.width = "25%";
		var value = this.document.createElement("td");
		value.innerHTML = "<b><font color=\"#0033CC\">"+v+"</font></b>";
		value.width = "75%";
    	row.appendChild( key );
    	row.appendChild( value );
    	tbl.appendChild( row );
    	this.panelNode.appendChild( tbl );
    },
	renderDBTable: function() {
		var tbl = this.document.createElement( "table" );
		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
		var tblString = new StringBuffer();
		tblString.append("<TR class='headerRow'><TH class='headerCell' width='15%'><B>" + $CFSTR('DataSource') + "</B></TH><TH class='headerCell' width='10%'><B>" + $CFSTR('QueryName') + "</B></TH><TH class='headerCell' width='8%'><B>" + $CFSTR('ExecutionTime') + "</B></TH><TH class='headerCell' width='7%'><B>" + $CFSTR('Records') + "</B></TH><TH class='headerCell' width='60%'><B>" + $CFSTR('SQL') + "</B></TH></TR>");
		for( var i = 0; i < this.queryRows.length; i++ ){
			var style = ( parseInt( this.queryRows[i].ET ) > 50 ) ? " class='querySlow'" : "";
			tblString.append("<TR"+style+"><TD class='valueCell'>"+this.queryRows[i].DATASOURCE+"</TD><TD class='valueCell'>"+this.queryRows[i].QUERYNAME+"</TD><TD class='valueCell'>"+this.queryRows[i].ET+" ms</TD><TD class='valueCell'>"+this.queryRows[i].RECORDSRETURNED+"</TD><TD class='valueCell'>");
			if (this.queryRows[i].TYPE == 'StoredProcedure') {
				tblString.append(this.formatter.formatSPParams(this.queryRows[i].PARAMETERS));
				tblString.append(this.formatter.formatSPResultSets(this.queryRows[i].RESULTSETS));
			} else {
				tblString.append(this.formatter.formatQuery(this.queryRows[i].SQL,this.queryRows[i].PARAMETERS));
			}	
			tblString.append("</TD></TR>");		
		}
		tbl.innerHTML = tblString.toString(); 
		this.panelNode.appendChild(tbl);
	},
	renderTraceTable: function() {
		var tbl = this.document.createElement( "table" );
		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
		var tblString = new StringBuffer();
		tblString.append("<TR class='headerRow'><TH class='headerCell' width='10%'><B>" + $CFSTR('Type') + "</B></TH><TH class='headerCell' width='10%'>" + $CFSTR('Delta') + "</TH><TH class='headerCell' width='80%'><B>" + $CFSTR('Message') + "</B></TH></TR>");
		for( var i = 0; i < this.traceRows.length; i++ ){
			var style = "";
			var type = "";
			switch(this.traceRows[i].PRIORITY){
				case "information":
					type = "Info";
					break;
				case "warning":
					type = "Warning";
					style = " class='traceWarning'";
					break;
				case "error":
					type = "Error";
					style = " class='traceError'";
					break;
				case "fatal information":
					type = "Fatal";
					style = " class='traceFatal'";
					break;
			}
			tblString.append("<TR"+style+"><TD class='labelCell'>"+type+"</TD><TD class='valueCell'>"+this.traceRows[i].DELTA+" ms</TD><TD class='valueCell'>"+this.traceRows[i].MESSAGE+"</TD></TR>");
		}
		tbl.innerHTML = tblString.toString();
		this.panelNode.appendChild(tbl);
	},
	renderTimerTable: function() {
		var tbl = this.document.createElement( "table" );
		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
		var tblString = new StringBuffer();
		tblString.append("<TR class='headerRow'><TH class='headerCell' width='90%'><B>" + $CFSTR('Message') + "</B></TH><TH class='headerCell' width='10%'>" + $CFSTR('Duration') + "</TH></TR>");
		for( var i = 0; i < this.timerRows.length; i++ ){
			tblString.append("<TR><TD class='valueCell'>"+this.timerRows[i].MESSAGE+"</TD><TD class='valueCell'>"+this.timerRows[i].DURATION+" ms</TD></TR>");
		}
		tbl.innerHTML = tblString.toString();
		this.panelNode.appendChild(tbl);
	},
	renderVariablesTable: function() {		
		var tbl = this.document.createElement( "table" );
		tbl.width = "100%";
		tbl.style.borderSpacing = "0px";
		var hdrRow = this.document.createElement( "tr" );
		hdrRow.className = "headerRow";
		var hdrCell1 = this.document.createElement( "th" );
		hdrCell1.className="headerCell";
		hdrCell1.width="20%";
		hdrCell1.innerHTML = "<B>" + $CFSTR('Variable') + "</B>";
		var hdrCell2 = this.document.createElement( "th" );
		hdrCell2.className="headerCell";
		hdrCell2.width="80%";
		hdrCell2.innerHTML = "<B>" + $CFSTR('Value') + "</B>";
		hdrRow.appendChild(hdrCell1);
		hdrRow.appendChild(hdrCell2);
		tbl.appendChild(hdrRow);
		var vars = ColdFire.getVariables();
		for( var i = 0; i < vars.length; i++ ){
			var valRow = this.document.createElement( "tr" );
			valRow.className = "variableRow";
			valRow.panelNode = this.panelNode;
			valRow.addEventListener("onmouseover",this.onMouseOver,false);
			valRow.addEventListener("onmouseout",this.onMouseOut,false);
			var valCell1 = this.document.createElement( "td" );
			valCell1.className = 'labelCell';
			valCell1.innerHTML = vars[i];
			var valCell2 = this.document.createElement( "td" );
			valCell2.className = 'valueCell';
			if (this.variablesRows && this.variablesRows[i] && this.variablesRows[i].VALUE) {
				valCell2.innerHTML = this.dumper.dump(this.variablesRows[i].VALUE,false);
			}
			valRow.appendChild(valCell1);
			valRow.appendChild(valCell2);			
			tbl.appendChild(valRow);
		}		
		this.panelNode.appendChild(tbl);
		
		
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
            delete toolbox.watchRow;
            if (toolbox.parentNode)
                toolbox.parentNode.removeChild(toolbox);
        }
    },
	getToolbox: function() {
        if (!this.toolbox){
			/* delete button */
			var toolbox = this.document.createElement( "div" );
			toolbox.className = "variableToolbox";
			toolbox.varPanel = this;
			toolbox.onclick = function(event) {
				var toolbox = event.currentTarget;
				toolbox.varPanel.deleteVariable(toolbox.varRow);				
			};	
			var cancelBtn = this.document.createElement( "img" );
			cancelBtn.className = "closeButton";
			cancelBtn.src = "blank.gif";
			toolbox.appendChild(cancelBtn);	
			
			this.toolbox = toolbox;	
		}
            
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

function StringBuffer()
{
	this.buffer = [];
}
StringBuffer.prototype.append = function(string)
{
	this.buffer.push(string);
	return this;
}
StringBuffer.prototype.toString = function()
{
	return this.buffer.join("");
}