/* See license.txt for terms of usage */

define([
    "firebug/lib/trace",
    "firebug/trace/traceModule",
    "firebug/trace/traceListener",
    "coldfire/cfPanel",
    "coldfire/cfModule",
],
function(FBTrace, TraceModule, TraceListener) {

// ********************************************************************************************* //
// Documentation
//
// Firebug coding style: http://getfirebug.com/wiki/index.php/Coding_Style
// Firebug tracing: http://getfirebug.com/wiki/index.php/FBTrace

// ********************************************************************************************* //
// The application/extension object
	
var ColdFire =
{
    version: "@VERSION@",
	
	initialize: function()
    {
        // Register trace customization listener for FBTrace. DBG_COLDFIRE represents a CSS rule
        // that is automatically associated with all logs prefixed with "coldfire;".
        // The prefix is removed (third parameter is true).
        // The last parameter represents URL of the stylesheet that should be used by
        // the tracing console.
        this.traceListener = new TraceListener("coldfire;", "DBG_COLDFIRE", true,
            "chrome://coldfire/skin/trace.css");
        TraceModule.addListener(this.traceListener);

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFire extension initialize");  
    },

    shutdown: function()
    {
        TraceModule.removeListener(this.traceListener);
    },
        
}

window.ColdFire = top.ColdFire = ColdFire;

return ColdFire;

// ********************************************************************************************* //
});
