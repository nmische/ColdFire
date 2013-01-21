/* See license.txt for terms of usage */

define([
    "firebug/lib/lib",
    "firebug/lib/object",
    "firebug/lib/options",
    "firebug/lib/trace",
    "firebug/lib/events",
    "firebug/lib/locale",
    "firebug/lib/dom",
    "firebug/lib/css",
    "firebug/lib/domplate",
    "firebug/firefox/xpcom",
    "firebug/firefox/system",
],
function(FBL, Obj, Options, FBTrace, Events, Locale, Dom, Css, Domplate, Xpcom, System) {
    
const promtService = Xpcom.CCSV("@mozilla.org/embedcomp/prompt-service;1", "nsIPromptService");
    
// ********************************************************************************************* //
// Custom Panel Implementation

//row data object is used to hold coldfire data

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

var panelName = "coldfusion";

function ColdFirePanel() {}
ColdFirePanel.prototype = Obj.extend(Firebug.ActivablePanel,
{
    name: panelName,
    title: Locale.$STR("ColdFusion"),

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function()
    {
        this.onMouseOver = Obj.bind(this.onMouseOver, this);
        this.onMouseOut = Obj.bind(this.onMouseOut, this);    
        this.clear();
        Firebug.registerUIListener(this);        
        Firebug.ActivablePanel.initialize.apply(this, arguments);
        Options.addListener(this);
        
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.initialize");
    },

    destroy: function(state)
    {
        Firebug.unregisterUIListener(this);
        Firebug.ActivablePanel.destroy.apply(this, arguments);
        Options.removeListener(this);
        
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.destroy");
    },
    
    updateOption: function(name, value)
    {        
        // Disable this panel if the Net panel is disabled
        if (name == "net.enableSites" && value == false) {            
            
            if (FBTrace.DBG_COLDFIRE)
                FBTrace.sysout("coldfire; ColdFirePanel.disablePanel");
            
            var cfPanelType = Firebug.getPanelType(panelName);
            Firebug.PanelActivation.disablePanel(cfPanelType);
            
        }
    },
    
    onActivationChanged: function(enable)
    {
        if (FBTrace.DBG_COLDFIRE || FBTrace.DBG_ACTIVATION)
            FBTrace.sysout("coldfire; ColdFirePanel.onActivationChanged; enable: " + enable);
        
        if(enable) {
               var netPanelType = Firebug.getPanelType("net");
            Firebug.PanelActivation.enablePanel(netPanelType);
             Firebug.ColdFireModule.addObserver(this);             
        } else {
            Firebug.ColdFireModule.removeObserver(this);
        }
    },
       
    reattach: function(doc)
    {
        Firebug.ActivablePanel.reattach.apply(this, arguments);    
    },     
    
    initializeNode: function(myPanelNode)
    {
        Events.addEventListener(this.panelNode, "mouseover", this.onMouseOver, false);
        Events.addEventListener(this.panelNode, "mouseout", this.onMouseOut, false);
        
        Firebug.ActivablePanel.initializeNode.apply(this, arguments);
    },
    
    destroyNode: function()
    {
        Events.removeEventListener(this.panelNode, "mouseover", this.onMouseOver, false);
        Events.removeEventListener(this.panelNode, "mouseout", this.onMouseOut, false);
        
        Firebug.ActivablePanel.destroyNode.apply(this, arguments);
    },    
    
    show: function(state)
    {    	
    	var enabled = Firebug.ColdFireModule.isAlwaysEnabled();
        this.showToolbarButtons("fbColdFireButtons", enabled);
        this.showToolbarButtons("fbColdFireVariableBox", enabled && Firebug.ColdFireModule.coldfireView == "Variables");
        
        if (!enabled)
            return;       
        
        this.displayCurrentView();    
        
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.show");
         
    },
        
    hide: function(state)
    {
        this.showToolbarButtons("fbColdFireButtons", false);
        this.showToolbarButtons("fbColdFireVariableBox", false);
        
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.hide");
    },
    
    supportsObject: function(object)
    {
         if (object instanceof NetFile)
            return 1;
            
        return 0;
    },
    
    navigate: function(object)
    {
        Firebug.ActivablePanel.navigate.apply(this, arguments);
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
                    generalObj: JSON.parse(this.stringifyHeaders(headers.general)),
                    exceptionsObj: JSON.parse(this.stringifyHeaders(headers.exceptions)),
                    queriesObj: JSON.parse(this.stringifyHeaders(headers.queries)),
                    traceObj: JSON.parse(this.stringifyHeaders(headers.trace)),
                    templatesObj:  JSON.parse( this.stringifyHeaders(headers.templates)),
                    ctemplatesObj: JSON.parse( this.stringifyHeaders(headers.ctemplates)),
                    cfcsObj: JSON.parse(this.stringifyHeaders(headers.cfcs)),
                    timerObj: JSON.parse(this.stringifyHeaders(headers.timer)),
                    variablesObj: JSON.parse(this.stringifyHeaders(headers.variables))
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
            this.cfMenuOptionRefresh("ParseQueryParams","coldfire.parseParams"),
            this.cfMenuOptionRefresh("SuppressQueryWhiteSpace","coldfire.suppressWhiteSpace"),
            this.cfMenuOption("ShowLastRequest","coldfire.showLastRequest"),
            this.cfMenuOption("EnhanceTrace","coldfire.enhanceTrace"),
            this.cfMenuOptionRefresh("ExecTimeTotalsOnTop","coldfire.etTotalsOnTop"),
             "-",
            {label: Locale.$STR("ClearVariables"), nol10n: true, command: Obj.bindFixed(this.deleteVariables, this) }      
        ];
    },
    
    cfMenuOption: function (label, option) {
    	var value = Options.get(option);
        return {
                label: Locale.$STR(label), 
                type: "checkbox", 
                nol10n: true,
                checked: value,
                command: Obj.bindFixed(Options.set, this, option, !value)
                };        
    },
    
    cfMenuOptionRefresh: function (label, option) {
    	var value = Options.get(option);
        return {
                label: Locale.$STR(label), 
                type: "checkbox", 
                nol10n: true,
                checked: value,
                command: Obj.bindFixed(this.toggleOption, this, option)
                };        
    },
    
    toggleOption: function (option) {
        Options.set(option,!Options.get(option));
        this.displayCurrentView();
    },
    
    getContextMenuItems: function(nada, target)
    {
        var items = [];

        var query = Firebug.getRepObject(target);
        if (!query)
            return items;
            
        var cbText = this.ColdFuisonPlate.formatClipboardSQL(query);
            
        items.push(
            {label: Locale.$STR("CopySQL"), command: Obj.bindFixed(System.copyToClipboard, System, cbText) }
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
        //total exection time
        if (this.rowData.totalET < 0) {
            this.rowData.totalET = this.rowData.dbET + this.rowData.cfcET + this.rowData.templateET + this.rowData.ctemplateET;
        }
        
        try{
        //add total execution time to general tab
        var temp = {
            LABEL: Locale.$STR("TotalExecTime"),
            VALUE: this.rowData.totalET + " ms" 
        }
        this.rowData.generalRows.push( temp );
        }catch(e){ 
        	if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFirePanel.generateRows EXCEPTION", e);
        }
        
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
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //add general rows  
        if(this.rowData.generalRows.length)
            var row = this.ColdFuisonPlate.generalRowTag.insertRows({rows: this.rowData.generalRows}, this.table.childNodes[1])[0];            
    },
    
    renderETTable: function() {
        //create table        
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.etHeaderRow.insertRows({}, this.table.firstChild)[0];
        //add et rows
        if (this.rowData.etRows.length) {
            // put totals at top if pref is set
            if (Options.get("coldfire.etTotalsOnTop")) {                            
                //total row
                var totalRow = this.ColdFuisonPlate.etTotalRow.insertRows({
                    totalTime: this.rowData.totalET
                }, headerRow)[0];
                //db row 
                var dbRow = this.ColdFuisonPlate.etDBRow.insertRows({
                    times: {
                        totalET: this.rowData.totalET,
                        dbET: this.rowData.dbET
                    }
                }, totalRow)[0];
                //cfc row
                var cfcRow = this.ColdFuisonPlate.etCFCRow.insertRows({
                    times: {
                        totalET: this.rowData.totalET,
                        cfcET: this.rowData.cfcET
                    }
                }, dbRow)[0];                
                //other time row
                var otherRow = this.ColdFuisonPlate.etOtherRow.insertRows({
                    time: this.rowData.totalET - this.rowData.templateET
                }, cfcRow)[0];                
            }
                        
            var row = this.ColdFuisonPlate.etRowTag.insertRows({
                rows: this.rowData.etRows
            }, this.table.childNodes[1])[0];
            
            if (!Options.get("coldfire.etTotalsOnTop")) {
                //other time row
                var otherRow = this.ColdFuisonPlate.etOtherRow.insertRows({
                    time: this.rowData.totalET - this.rowData.templateET
                }, this.table.lastChild)[0];
                //total row
                var totalRow = this.ColdFuisonPlate.etTotalRow.insertRows({
                    totalTime: this.rowData.totalET
                }, otherRow)[0];
                //db row 
                var dbRow = this.ColdFuisonPlate.etDBRow.insertRows({
                    times: {
                        totalET: this.rowData.totalET,
                        dbET: this.rowData.dbET
                    }
                }, totalRow)[0];
                //cfc row
                var cfcRow = this.ColdFuisonPlate.etCFCRow.insertRows({
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
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.exceptionHeaderRow.insertRows({}, this.table.firstChild)[0];
        //add exception rows
        if (this.rowData.exceptionRows.length) {
            var row = this.ColdFuisonPlate.exceptionRowTag.insertRows({rows: this.rowData.exceptionRows}, this.table.childNodes[1])[0];
        }        
    },
    
    renderDBTable: function() {                
        //create table        
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.queryHeaderRow.insertRows({}, this.table.firstChild)[0];
        var sqlString = "";
        var rowNum = 0;
        //add db rows
        if (this.rowData.queryRows.length) {
            var row = this.ColdFuisonPlate.queryRowTag.insertRows({rows: this.rowData.queryRows}, this.table.childNodes[1])[0];
        }        
    },
        
    renderTraceTable: function() {
        //create table        
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.traceHeaderRow.insertRows({}, this.table.firstChild)[0];
        //add trace rows
        if (this.rowData.traceRows.length) {
            if (Options.get("coldfire.enhanceTrace")) {
                var row = this.ColdFuisonPlate.traceRowEnhancedTag.insertRows({rows: this.rowData.traceRows}, this.table.childNodes[1])[0];
            } else {
                var row = this.ColdFuisonPlate.traceRowTag.insertRows({rows: this.rowData.traceRows}, this.table.childNodes[1])[0];
            }            
        }
                        
        //now we need to format the result if we are doing an enhanced trace
        if (Options.get("coldfire.enhanceTrace")) {
            var traceCell = null;
            for (var i = 0; i < this.rowData.traceRows.length; i++) {
                if (this.rowData.traceRows && this.rowData.traceRows[i] && this.rowData.traceRows[i].RESULT) {
                    traceCell = Dom.getElementsByClass(this.table, "traceValue")[i];
                    this.FormatterPlate.dump.append({
                        value: JSON.parse(this.rowData.traceRows[i].RESULT)
                    }, traceCell);
                }
            }
        }
    },
    
    renderTimerTable: function() {
        //create table        
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.timerHeaderRow.insertRows({}, this.table.firstChild)[0];
        //add timer rows
        if (this.rowData.timerRows.length)
            var row = this.ColdFuisonPlate.timerRowTag.insertRows({rows: this.rowData.timerRows}, this.table.childNodes[1])[0];        
    },
    
    renderVariablesTable: function() {        
        //create table        
        this.table = this.ColdFuisonPlate.tableTag.append({}, this.panelNode, this);
        //create header        
        var headerRow =  this.ColdFuisonPlate.varHeaderRow.insertRows({}, this.table.firstChild)[0];
        //add variable rows
        var vars = this.variables;    
        if (vars.length)            
            var row = this.ColdFuisonPlate.varRowTag.insertRows({rows: vars}, this.table.childNodes[1])[0];        
        // now we need to format the variable
        var varCell = null;    
        for( var i = 0; i < vars.length; i++ ){            
            if (this.rowData.variablesRows && this.rowData.variablesRows[i] && this.rowData.variablesRows[i].VALUE) {
                varCell = Dom.getElementsByClass(this.table, "varValue")[i];
                this.FormatterPlate.dump.append( {value: JSON.parse(this.rowData.variablesRows[i].VALUE )}, varCell);
            }            
        }    
    },
    
    showToolbox: function(row) {
        var toolbox = this.getToolbox();
        if (row)
        {
            if (Css.hasClass(row, "editing"))
                return;
            
            toolbox.varRow = row;

            var offset = Dom.getClientOffset(row);
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
            this.toolbox = this.ToolboxPlate.tag.replace({domPanel: this}, this.document);

        return this.toolbox;
    },
    
    onMouseOver: function(event) {            
        var variableRow = Dom.getAncestorByClass(event.target, "variableRow");
        if (variableRow)             
             this.showToolbox(variableRow);            
    },
    
    onMouseOut: function(event) {
        if (Dom.isAncestor(event.relatedTarget, this.getToolbox()))
            return;

        var variableRow = Dom.getAncestorByClass(event.relatedTarget, "variableRow");
        if (!variableRow) 
            this.showToolbox(null);            
    },
    
    getVariableRowIndex : function(row) {
        var index = -1;
        for (; row && Css.hasClass(row, "variableRow"); row = row.previousSibling)
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
                promtService.alert(window, Locale.$STR("ColdFire"), Locale.$STR("InvalidVarName") + ": " + varString);
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
                
    // handle files from netMonitor
    
    updateFile: function(file)
    {
        
    	if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.updateFile",file);
    	
        var index = this.queue.indexOf(file);
                            
        if ((index == -1) && (this.hasColdFireHeader(file))) {
        	
            if (this.queue.length >= Options.get("coldfire.maxQueueRequests"))
                this.queue.splice(0, 1);
            
            index = this.queue.push(file) - 1;    
            
            if (Options.get("coldfire.showLastRequest") || index == 0) {
                this.navigate(file);
            } else {
                this.displayCurrentView();
            }
        
        }    
            
    },
    
    hasColdFireHeader: function(file){
    	
    	if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.hasColdFireHeader", file);
    	
        if (!file.responseHeaders) {
        	
        	if (FBTrace.DBG_COLDFIRE)
                FBTrace.sysout("coldfire; ColdFirePanel.hasColdFireHeader; false; no headers");
        	
            return false;
        }
                    
        for (var i = 0; i < file.responseHeaders.length; i++){
            if (file.responseHeaders[i].name.match(/x-coldfire/)) {
            	
            	if (FBTrace.DBG_COLDFIRE)
                    FBTrace.sysout("coldfire; ColdFirePanel.hasColdFireHeader; true");
            	
                return true;          
                
            }
        }
        
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.hasColdFireHeader; false; no coldfire headers");
        
        return false;
    },
    
});

//********************************************************************************************* //
//Panel UI (Domplate)

//Register locales before the following template definitions.
Firebug.registerStringBundle("chrome://coldfire/locale/coldfire.properties");

/**
* Domplate template used to render panel's content. Note that the template uses
* localized strings and so, Firebug.registerStringBundle for the appropriate
* locale file must be already executed at this moment.
*/
with (Domplate) {
    
    
ColdFirePanel.prototype.ToolboxPlate = domplate(
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

ColdFirePanel.prototype.FormatterPlate = domplate(
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
                                    TD({width:"30%"},SPAN({class:'ital'},'ReturnType:')),
                                    TD('$value|formatUDFReturnType')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'Roles:')),
                                    TD('$value|formatUDFRoles')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'Access:')),
                                    TD('$value|formatUDFAccess')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'Output:')),
                                    TD('$value|formatUDFOutput')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'DisplayName:')),
                                    TD('$value|formatUDFDisplayName')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'Hint:')),
                                    TD('$value|formatUDFHint')                                
                                ),
                                TR(
                                    TD(SPAN({class:'ital'},'Description:')),
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
                SPAN({class:'ital'},'Arguments:'),
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
            TD(SPAN({class:'ital'},'Arguments:')),
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
        if ( switchToState == 'open' )    target.style.display = '' ;
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
        
ColdFirePanel.prototype.ColdFuisonPlate = domplate(
{
    tableTag:
        TABLE({class: "panelTable", width: "100%", cellpadding: 2, cellspacing: 0},
            THEAD(),
            TBODY({class: "panelTableBody"}),
            TFOOT()
        ),
        
    generalHeaderRow:
        TR(
            TD({class: "labelCell", width: "25%"}, Locale.$STR('Requests')),
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
                    Locale.$STR('Type')
                )
            ),
            TH({class: "headerCell alphaValue", width: "35%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('File')
                )
            ),
            TH({class: "headerCell alphaValue", width: "25%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Method')
                )
            ),
            TH({class: "headerCell", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('TotalInstances')
                )
            ),
            TH({class: "headerCell", width: "5%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('AvgTime')
                )
            ),
            TH({class: "headerCell", width: "5%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('TotalTime')
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
            TD({class: "valueCell", width: "90%", colspan: 4}, Locale.$STR('OtherTime')),
            TD({class: "valueCell", width: "10%", align: "right", colspan: 2}, "$time|formatTime")        
        ),    
    
    etTotalRow:
        TR(
            TD({class: "valueCell bold", width: "90%", colspan: 4}, Locale.$STR('TotalExecTime')),
            TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$totalTime|formatTime")        
        ),    
    
    etDBRow:
        TR(
            TD({class: "valueCell bold", width: "90%", colspan: 4}, Locale.$STR('DBExecTime')),
            TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$times|formatDBTime")        
        ),    
        
    etCFCRow:
        TR(
            TD({class: "valueCell bold", width: "90%", colspan: 4}, Locale.$STR('CFCExecTime')),
            TD({class: "valueCell bold", width: "10%", align: "right", colspan: 2}, "$times|formatCFCTime")        
        ),    
        
    exceptionHeaderRow:
        TR({class: "headerRow"},
            TH({class: "headerCell", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Timestamp')
                )
            ),
            TH({class: "headerCell alphaValue", width: "25%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Type')
                )
            ),
            TH({class: "headerCell alphaValue", width: "65%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Template')
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
                    Locale.$STR('QueryName')
                )
            ),
            TH({class: "headerCell alphaValue", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('DataSource')
                )
            ),            
            TH({class: "headerCell", width: "7%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Time')
                )
            ),
            TH({class: "headerCell", width: "7%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Records')
                )
            ),
            TH({class: "headerCell alphaValue", width: "7%"}, 
                DIV({class: "headerCellBox"},
                    Locale.$STR('Cached')
                )
            ),
            TH({class: "headerCell alphaValue", width: "49%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Template')
                )
            ),
            TH({class: "headerCell", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Timestamp')
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
            TAG("$row|spParamDisplay", {parameters: "$row.PARAMETERS"}),
            TAG("$row|spResultSetDisplay", {resultsets: "$row.RESULTSETS"})
        ),
        
    spParamsTag:
        TABLE({border: 0, width: "100%", cellpadding: 2, cellspacing: 0},        
            THEAD(),
            TBODY(
                TR({class: "procHead"},
                    TH({colspan: "5", class: "procHead"}, Locale.$STR("StoredProcedureParameters"))
                ),
                TR({class: "procSubHead"},
                    TD({class: "procSubHead"}, Locale.$STR("lcType")),
                    TD({class: "procSubHead"}, Locale.$STR("lcCFSqlType")),
                    TD({class: "procSubHead"}, Locale.$STR("lcValue")),
                    TD({class: "procSubHead"}, Locale.$STR("lcVariable")),
                    TD({class: "procSubHead"}, Locale.$STR("lcDBVarname"))
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
                    TH({colspan: "2", class: "procHead"}, Locale.$STR("StoredProcedureResultSets"))
                ),
                TR({class: "procSubHead"},
                    TD({class: "procSubHead"}, Locale.$STR("lcName")),
                    TD({class: "procSubHead"}, Locale.$STR("lcResultset"))
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
                DIV({class: "queryParam"},"$param|formatParamString")
            )
        ),
        
    traceHeaderRow:
        TR({class: "headerRow", onclick: "$onHeaderClick"},
            TH({class: "headerCell alphaValue", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Type')
                )
            ),
            TH({class: "headerCell", width: "10%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Delta')
                )
            ),
            TH({class: "headerCell alphaValue", width: "10%"}, 
                DIV({class: "headerCellBox"},
                    Locale.$STR('Category')
                )
            ),
            TH({class: "headerCell alphaValue", width: "70%"}, 
                DIV({class: "headerCellBox"},
                    Locale.$STR('MessageResult')
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
                    Locale.$STR('Message')
                )
            ),
            TH({class: "headerCell", width: "10%"},  
                DIV({class: "headerCellBox"},
                    Locale.$STR('Duration')
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
                    Locale.$STR('Variable')
                )
            ),
            TH({class: "headerCell alphaValue", width: "80%"},
                DIV({class: "headerCellBox"},
                    Locale.$STR('Value')
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
        
    spParamDisplay: function(row)
    {
        var params = row.PARAMETERS;
        if (params.length && params.length > 0) {
             return this.spParamsTag; 
        } else {
             return this.blankDiv; 
        }
    },
    
    spResultSetDisplay: function(row)
    {
        var rs = row.RESULTSETS;
        if (rs.length && rs.length > 0) {
             return this.spResultSetsTag; 
        } else {
             return this.blankDiv; 
        }
    },
    
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
            if (!((params.length == questionMarks.length) && Options.get("coldfire.parseParams") )) {    
                return this.sqlParamsTag;                
            }            
        }         
        return this.blankDiv;                
    },
        
    // convenience for domplates
        
    safeCFSTR: function(name)
    {
        try{
            return Locale.$STR(name);            
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
        return (cached == "1")?Locale.$STR("Yes"):Locale.$STR("No");
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
        var parseParams = (parseParams) ? parseParams : Options.get("coldfire.parseParams");
        var showParam = (showParam) ? showParam : false;
        var suppressWhiteSpace = (suppressWhiteSpace) ? suppressWhiteSpace : Options.get("coldfire.suppressWhiteSpace");
        
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
                        val += " /* " + this.formatParamString(param) + " */ ";
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
        if (type == 3){
            // handle bit types
            tmpVal = (value == "1" || value.toUpperCase() == "TRUE" || value.toUpperCase() == "YES") ? 1 : 0;
        } else if ( type < 15){
            // handle numeric types
            tmpVal =  value;
        } else if (type < 18) {
            // handle date time types
            tmpVal = (value.indexOf("{") == 0) ? value : "'" + value + "'";
        } else if (type < 24) {
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
        return Locale.$STR("QueryParamValues") + " -";
    },
    
    formatParamString: function(param) {        
        return Locale.$STR("Parameter") + " #" + param[param.length-1] + " (" + this.cfsqltypes[param[0]] + ") = " + param[1];
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
                       
        } else {
                        
            sqlText = this.formatSQLString(query, true, true, false);
            
            var params = query.PARAMETERS;
                                
            if (params.length && params.length > 0) {                
                var questionMarks = query.SQL.match(/\?/g);            
                if (params.length != questionMarks.length) {                    
                    for (var i = 0; i < params.length; i++) {
                        // this is a little hack to store the param index for display in formatParamString below.
                        var param = params[i];
                        param[param.length] = i + 1;
                        // get the formatted value    
                        var val = this.formatParamString(param);
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
    
    onHeaderClick: function(event) {
        var table = Dom.getAncestorByClass(event.target, "panelTable");
        var header = Dom.getAncestorByClass(event.target, "headerCell");
        var queryTable = Dom.getAncestorByClass(event.target, "queryTable");
        if (!header)
            return;

        var numerical = !Css.hasClass(header, "alphaValue");

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
        var tbody = Dom.getChildByClass(table, "panelTableBody");

        var values = [];
        for (var row = tbody.childNodes[0]; row; row = row.nextSibling)
        {
            var cell = row.childNodes[colIndex];
            var value = numerical ? parseFloat(cell.textContent) : cell.textContent;
            values.push({row: row, value: value});
        }

        values.sort(function(a, b) { return a.value < b.value ? -1 : 1; });

        var headerRow = table.firstChild.firstChild;
        var headerSorted = Dom.getChildByClass(headerRow, "headerSorted");
        Css.removeClass(headerSorted, "headerSorted");

        var header = headerRow.childNodes[colIndex];
        Css.setClass(header, "headerSorted");

        if (!header.sorted || header.sorted == 1)
        {
            Css.removeClass(header, "sortedDescending");
            Css.setClass(header, "sortedAscending");

            header.sorted = -1;

            for (var i = 0; i < values.length; ++i) {
                values[i].row.setAttribute("odd", (i % 2));
                tbody.appendChild(values[i].row);
            }
        }
        else
        {
            Css.removeClass(header, "sortedAscending");
            Css.setClass(header, "sortedDescending");

            header.sorted = 1;

            for (var i = values.length-1; i >= 0; --i) {
                values[i].row.setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].row);
            }
        }
    },
    
    sortQueries: function(table, colIndex, numerical)
    {
        var tbody = Dom.getChildByClass(table, "panelTableBody");

        var values = [];
        for (var row = tbody.childNodes[0]; row; row = row.nextSibling.nextSibling)
        {
            var sqlRow = row.nextSibling;
            var cell = row.childNodes[colIndex];
            var value = numerical ? this.safeParseFloat(cell.textContent) : cell.textContent;
            values.push({rows: [row, sqlRow], value: value});
        }

        values.sort(function(a, b) { return a.value < b.value ? -1 : 1; });

        var headerRow = table.firstChild.firstChild;
        var headerSorted = Dom.getChildByClass(headerRow, "headerSorted");
        Css.removeClass(headerSorted, "headerSorted");

        var header = headerRow.childNodes[colIndex];
        Css.setClass(header, "headerSorted");

        if (!header.sorted || header.sorted == 1)
        {
            Css.removeClass(header, "sortedDescending");
            Css.setClass(header, "sortedAscending");

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
            Css.removeClass(header, "sortedAscending");
            Css.setClass(header, "sortedDescending");

            header.sorted = 1;

            for (var i = values.length-1; i >= 0; --i) {
                values[i].rows[0].setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].rows[0]);
                values[i].rows[1].setAttribute("odd", (Math.abs(i-values.length-1) % 2));
                tbody.appendChild(values[i].rows[1]);
            }
        }
    },
    
    safeParseFloat: function(val)
    {
    	return (isNaN(parseFloat(val))) ? 0 : parseFloat(val);
    },
    
});
    
}


// ********************************************************************************************* //
// Registration

Firebug.registerPanel(ColdFirePanel);
Firebug.registerStylesheet("chrome://coldfire/skin/panel.css");

if (FBTrace.DBG_COLDFIRE)
    FBTrace.sysout("coldfire; cfPanel.js, stylesheet registered");

return ColdFirePanel;

// ********************************************************************************************* //
});
