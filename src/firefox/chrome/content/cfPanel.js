/* See license.txt for terms of usage */

define([
    "firebug/lib/object",
    "firebug/lib/trace",
    "firebug/lib/locale",
    "firebug/lib/domplate"
],
function(Obj, FBTrace, Locale, Domplate) {

// ********************************************************************************************* //
// Custom Panel Implementation

var panelName = "coldfire";

function ColdFirePanel() {}
ColdFirePanel.prototype = Obj.extend(Firebug.Panel,
{
    name: panelName,
    title: "ColdFusion",

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function()
    {
        Firebug.Panel.initialize.apply(this, arguments);

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.initialize");

        // TODO: Panel initialization (there is one panel instance per browser tab)

        this.refresh();
    },

    destroy: function(state)
    {
        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.destroy");

        Firebug.Panel.destroy.apply(this, arguments);
    },

    show: function(state)
    {
        Firebug.Panel.show.apply(this, arguments);

        if (FBTrace.DBG_COLDFIRE)
            FBTrace.sysout("coldfire; ColdFirePanel.show");
    },

    refresh: function()
    {
        // Render panel content. The HTML result of the template corresponds to: 
        //this.panelNode.innerHTML = "<span>" + Locale.$STR("coldfire.panel.label") + "</span>";
        this.ColdFireTemplate.render(this.panelNode);

        // TODO: Render panel content
    }
});

// ********************************************************************************************* //
// Panel UI (Domplate)

// Register locales before the following template definition.
Firebug.registerStringBundle("chrome://coldfire/locale/coldfire.properties");

/**
 * Domplate template used to render panel's content. Note that the template uses
 * localized strings and so, Firebug.registerStringBundle for the appropriate
 * locale file must be already executed at this moment.
 */
with (Domplate) {
ColdFirePanel.prototype.ColdFireTemplate = domplate(
{
    tag:
        SPAN(
            Locale.$STR("coldfire.panel.label")
        ),

    render: function(parentNode)
    {
        this.tag.replace({}, parentNode);
    }
})}

// ********************************************************************************************* //
// Registration

Firebug.registerPanel(ColdFirePanel);
Firebug.registerStylesheet("resource://coldfire/skin/classic/coldfire.css");

if (FBTrace.DBG_COLDFIRE)
    FBTrace.sysout("coldfire; cfPanel.js, stylesheet registered");

return MyPanel;

// ********************************************************************************************* //
});
