/* See license.txt for terms of usage */

define([
    "firebug/lib/object",
    "firebug/lib/trace",
    "firebug/lib/dom",
    "firebug/net/httpLib",
    "firebug/net/requestObserver",
    "firebug/lib/options",
],
function(Obj, FBTrace, Dom, Http, HttpRequestObserver, Options) {
	
// ********************************************************************************************* //
// Constants
	
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

var panelName = "coldfusion";

// ********************************************************************************************* //
// Custom Module Implementation

Firebug.ColdFireModule = Obj.extend(Firebug.ActivableModule,
{
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization
	
	dispatchName: "coldFireModule",

    initialize: function()
    {
    	Firebug.ActivableModule.initialize.apply(this, arguments);
    			
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.initialize");
    },
    
    initializeUI: function(detachArgs)
    {
    	Firebug.ActivableModule.initializeUI.apply(this, arguments);
    	
    	// Synchronize UI buttons with the current sub tab.
        this.syncFilterButtons(Firebug.chrome);

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.initializeUI");
    },

    shutdown: function()
    {
    	Firebug.ActivableModule.shutdown.apply(this, arguments);

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.shutdown");
    },
    	
	showContext: function(browser, context)
    {		

		var panel = context.getPanel(panelName);	
		
		if (!panel)
			return;
		
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
		if (panel && panel.name == panelName && this.isAlwaysEnabled())
			this.changeCurrentView(this.coldfireView);		
	},
    
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // ColdFire 
	
	coldfireView: "General",
		
	syncFilterButtons: function(chrome)
	{		
		var button = chrome.$("fbColdFireFilter-"+this.coldfireView);
		button.checked = true;    
	},	
	
	syncVariablesBox: function(chrome)
	{		
		var isVariablesView = this.coldfireView == "Variables";
		var coldFireVariableBox = chrome.$("fbColdFireVariableBox"); 
		Dom.collapse(coldFireVariableBox, !(isVariablesView));		
	},
	
	changeCurrentView: function(view) 
	{				
		this.coldfireView = view;
		this.syncFilterButtons(Firebug.chrome);
		this.syncVariablesBox(Firebug.chrome);		
		Firebug.currentContext.getPanel(panelName).displayCurrentView();
	},	
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // NetMonitor Listener
	
	onResponse: function(context, file) {	
		
		if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.onResponse", file);
		
		var panel = context.getPanel(panelName);
		panel.updateFile(file);		
		
	},
		
	onResponseBody: function(context, file) {	
		
		if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.onResponseBody", file);
		
		var panel = context.getPanel(panelName);
		panel.updateFile(file);		
		
	},
	
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Activable Module

    onObserverChange: function(observer)
    {
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireModule.onObserverChange; hasObservers: " + this.hasObservers() +
                ", Firebug suspended: " + Firebug.getSuspended());

        if (!Firebug.getSuspended())  // then Firebug is in action
            this.onResumeFirebug();   // and we need to test to see if we need to observe stuff
    },

    onResumeFirebug: function()
    {
        if (FBTrace.DBG_NET)
            FBTrace.sysout("coldfire; ColdFireModule.onResumeFirebug; enabled: " + this.isAlwaysEnabled());

        // Resume only if ColdFirePanel is enabled and so, observing ColdFireModule module.
        if (this.isAlwaysEnabled())
        {
        	Firebug.NetMonitor.addListener(this);
        	ColdFireHttpObserver.registerObserver();
        }
        else
        {
        	Firebug.NetMonitor.removeListener(this);
        	ColdFireHttpObserver.unregisterObserver();
        }
    },

    onSuspendFirebug: function()
    {
        if (FBTrace.DBG_NET)
            FBTrace.sysout("coldfire; ColdFireModule.onSuspendFirebug; enabled: " + this.isAlwaysEnabled());

        Firebug.NetMonitor.removeListener(this);
        ColdFireHttpObserver.unregisterObserver();
    },
	    
});

//********************************************************************************************* //
// HTTP Observer

var ColdFireHttpObserver =
{
    dispatchName: "ColdFireHttpObserver",
    registered: false,

    registerObserver: function()
    {
        if (this.registered)
            return;

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireHttpObserver.register;");

        HttpRequestObserver.addObserver(this, "firebug-http-event", false);
        this.registered = true;
    },

    unregisterObserver: function()
    {
        if (!this.registered)
            return;

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireHttpObserver.unregister;");

        HttpRequestObserver.removeObserver(this, "firebug-http-event");
        this.registered = false;
    },

    /* nsIObserve */
    observe: function(subject, topic, data)
    {
        if (!Firebug.ColdFireModule.isAlwaysEnabled())
            return;

        try
        {
            if (FBTrace.DBG_COLDFIRE)
            {
                FBTrace.sysout("coldfire; ColdFireHttpObserver.observe " + (topic ? topic.toUpperCase() : topic) +
                    ", " + ((subject instanceof Ci.nsIRequest) ? Http.safeGetRequestName(subject) : "") +
                    ", Browser: " + Firebug.chrome.window.document.title);
            }

            if (!(subject instanceof Ci.nsIHttpChannel))
                return;

            if (topic == "http-on-modify-request")
                this.onModifyRequest(subject);

        }
        catch (err)
        {
            if (FBTrace.DBG_ERRORS)
                FBTrace.sysout("coldfire; ColdFireHttpObserver.observe EXCEPTION", err);
        }
    },

    onModifyRequest: function(request)
    {

		try{
			request.setRequestHeader("User-Agent",
				request.getRequestHeader("User-Agent") + " " + "ColdFire/" + ColdFire.version,
				true);
		} catch (err) {
			if (FBTrace.DBG_ERRORS)
	            FBTrace.sysout("coldfire; ColdFireHttpObserver.onModifyRequest: Error setting User-Agent header.",err);
		}
		
		try{
			var variables = Firebug.currentContext.getPanel(panelName).variables;
			if(variables.length)
				request.setRequestHeader("x-coldfire-variables", 
					JSON.stringify(variables),
					true);
		} catch (err) {
			if (FBTrace.DBG_ERRORS)
	            FBTrace.sysout("coldfire; ColdFireHttpObserver.onModifyRequest: Error setting x-coldfire-variables header.",err);
		}
		
		try{
			if(Options.get("coldfire.enhanceTrace"))
				request.setRequestHeader("x-coldfire-enhance-trace", 
					"true",
					true);
		} catch (err) {
			if (FBTrace.DBG_ERRORS)
	            FBTrace.sysout("coldfire; ColdFireHttpObserver.onModifyRequest: Error setting x-coldfire-enhance-trace header.",err);
		}
		
		if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFireHttpObserver.onModifyRequest");
    },

    
    /* nsISupports */
    QueryInterface: function(iid)
    {
        if (iid.equals(Ci.nsISupports) ||
            iid.equals(Ci.nsIObserver)) {
             return this;
         }

        throw Cr.NS_ERROR_NO_INTERFACE;
    }
}

// ********************************************************************************************* //
// Registration

Firebug.registerModule(Firebug.ColdFireModule);

return Firebug.ColdFireModule;

// ********************************************************************************************* //
});
