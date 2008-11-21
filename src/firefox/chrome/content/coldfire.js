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
 * The Initial Developer of the Original Code is Nathan Mische.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): *      	
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
 
const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
const cfPrefService = Components.classes['@mozilla.org/preferences-service;1'];
const cfPrefs = cfPrefService.getService(nsIPrefBranch2);
const cfPrefDomain = "extensions.coldfire";
const cfPrefNames =
[
    //coldfire
    "parseParams",
	"logMsgs",
	"maxQueueRequests",
	"showLastRequest",
	"enhanceTrace"
];

var cfOptionUpdateMap = {};
 
top.ColdFire = {

    version: '@VERSION@',
    name: 'ColdFire',
    title: 'ColdFire',
    
    initialize: function() 
    {  	
       				
        /* Set preferences */
        for (var i = 0; i < cfPrefNames.length; ++i)
            this[cfPrefNames[i]] = this.getPref(cfPrefNames[i]);
            
        cfPrefs.addObserver(cfPrefDomain, this, false);
    
    },
    
    shutdown: function()
    {        
 		cfPrefs.removeObserver(cfPrefDomain, this, false);       
    },
	
    togglePref: function(name)
    {
        this.setPref(name, !this[name]);
    },

    getPref: function(name)
    {
        var prefName = cfPrefDomain + "." + name;

        var type =  cfPrefs.getPrefType(prefName);
        if (type == nsIPrefBranch.PREF_STRING)
            return  cfPrefs.getCharPref(prefName);
        else if (type == nsIPrefBranch.PREF_INT)
            return  cfPrefs.getIntPref(prefName);
        else if (type == nsIPrefBranch.PREF_BOOL)
            return  cfPrefs.getBoolPref(prefName);
    },

    setPref: function(name, value)
    {       
        var prefName = cfPrefDomain + "." + name;
    
        var type =  cfPrefs.getPrefType(prefName);
        if (type == nsIPrefBranch.PREF_STRING)
             cfPrefs.setCharPref(prefName, value);
        else if (type == nsIPrefBranch.PREF_INT)
             cfPrefs.setIntPref(prefName, value);
        else if (type == nsIPrefBranch.PREF_BOOL)
             cfPrefs.setBoolPref(prefName, value);
    },
    
    updatePref: function(name, value)
    {
        // Prevent infinite recursion due to pref observer
        if (name in cfOptionUpdateMap)
            return;
        
        cfOptionUpdateMap[name] = 1;
        this[name] = value;
                
        delete cfOptionUpdateMap[name];
    },
    
    observe: function(subject, topic, data)
    {
        var name = data.substr(cfPrefDomain.length+1);       
        var value = this.getPref(name);
        this.updatePref(name, value);
    }
}

}});
