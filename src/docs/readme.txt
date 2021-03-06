LICENSE Copyright 2006 Raymond Camden, Adam Podolnick, Nathan Mische

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Support Us! Like this app? Visit our wishlists:

Nathan Mische
https://www.amazon.com/gp/registry/wishlist/1PMU5WXR9RZNJ/ref=wl_web/

Raymond Camden 
http://www.amazon.com/o/registry/2TCL1D08EZEYE 

Adam Podolnick
http://www.amazon.com/gp/registry/wishlist/2IX25DTK2ITG6/ref=wl_web



------------------------------ LAST UPDATE ----------------------------- 

Last Updated: January 20, 2013 (@VERSION@)

* updated to work with Firefox 18 and Firebug 1.11+. 
* updated JSON serialization in debugging tempate.
* updated extensionto use JSON.parse. (GitHub issue #4)


------------------------------ OLDER UPDATES ---------------------------

Last Updated: September 17, 2012 (1.10.207.250)

* updated to work with Firefox 15 and Firebug 1.10+. (GitHub issues #8 and #9)
* fixed issue with variables box. (GitHub issues #5)


Last Updated: January 21, 2012 (1.9.207.249)

* updated to work with Firefox 9 and Firebug 1.9+. Added icons. (issues 66, 67, 68 and 69)


Last Updated: June 23, 2011 (1.7.207.246)

* updated to work with Firefox 5. (issue 65)


Last Updated: March 23, 2011 (1.7.207.239)

* updated to work with Firefox 4/Firebug 1.7. (issue 64)


Last Updated: December 28, 2010 (1.6.207.235)

* fixed issues with changing views. (issue 62)


Last Updated: November 29, 2010 (1.5.207.232)

* initial support for Firefox 3.6/Firebug 1.6.


Last Updated: January 21, 2010 (1.5.207.223)

* initial support for Firefox 3.6/Firebug 1.5.


Last Updated: June 23, 2009 (1.4.207.218)

* initial support for Firefox 3.5/Firebug 1.4.


Last Updated: June 23, 2009 (1.3.207.211)

* fix for query parameter formatting.


Last Updated: May 29, 2009 (1.3.207.199)

* inital release of Railo support.


Last Updated: May 27, 2009 (1.3.187.199)

* fixed stored procedure domplate to support procedures with no 
  parameters or resultsets.


Last Updated: May 11, 2009 (1.3.187.192)

* fixed component domplate to support components with no methods.
* added option to show execution time totals at top of tab.
* fixed issue with preference persistence.


Last Updated: April 4, 2009 (1.3.187.187)

* updated SQL rendering to use domplate.
* added Copy SQL context menu option.
* fixed issue with reported start and end times with enhanced trace tag.
* changed CFAJAX JS injection so that more requests can be debugged.


Last Updated: Jan 24, 2009 (1.3.172.172)

* removed dependency on custom cfajax library.
* added exceptions tab.
* added ColdFireAdvice for ColdSpring AOP.


Last Updated: Jan 11, 2009 (1.3.151.151)

* updated coldfire.cfm to address variable dump issue due to variable
  scope pollution.
* fixed issues with execution times (Thanks Ray Camden).
* added cfajax.js to support new "Force Debugging" option for CF AJAX
  requests.
* enhanced white space suppression (Thanks Ray Camden and John Hartmann).
* updated variable name validation in Variables tab to allow dot
  notation.


Last Updated: Jan 7, 2009 (1.3.142.145)

* first 1.3 release!
* fixed issues with trace.cfm custom tag.
* new UI for selecting files from request queue.
* added suppress query white space option.
* toggling parse query params option now updates UI immediately.
* updated query tab to use Firebug domplate.


Last Updated: Dec 21, 2008 (1.2.117.126)

* fixed issues with execution times tab summary rows. (issues 42 and 44) 
* fixed issue with variables tab. (issue 43) 
* improved multiple tab support.


Last Updated: Nov 16, 2008 (1.2.117.117)

* updated to allow for debugging of pages that use <cflocation>. 
* added Application.cfc components to allow for variable tab usage on 
  sites that use Applicaiton.onRequest(). 
* added support for enhanced tracing.


Last Updated: Oct 21, 2008 (1.2.95.100)

* updated coldfusion.js to fix cfsqltype formatting issue (issue 41).
  This patch was submitted by Shane Bradley.


Last Updated: Oct 12, 2008 (1.2.95.95)

* updated coldfire.cfm to properly encode cfsqltype (issue 38). 
* changed extension to escape all single quotes in test queryparams 
  (issue 39). 
* updated coldfire.cfm to properly encode undefined variable values
  (issue 40).


Last Updated: Sept 11, 2008 (1.2.89.89)

* added option to fallback to classic or dockable debugging templates. 
* updated variable tab variable formatting to use Firebug domplate. 
* add variable trace support as well as trace category.


Last Updated: July 16, 2008 (1.2.51.70)

Update install.rdf to make compatible with FF 3.0.*


Last Updated: June 29, 2008 (1.2.51.65)

The first 1.2 release: 
* added support for Firebug 1.2. 
* updated to use new Net Monitor listener interface. 
* fixed issue with duplicate option menu items.


Last Updated: April 7, 2008 (1.1.51.59)

The first 1.1 release: 
* removed XPCOM object. 
* now uses Firebug's network monitor. 
* consolidated helper objects into one lib.js file. 
* renamed source files to more closely match Firebug conventions. 
* added request queue functionality. 
* variables now stored per tab.


Last Updated: March 12, 2008 (1.1.51.51)

The first 1.1 release: 
* added support for Firefox 3. 
* updated to use new version numbering
  (major_version.minor_version.cf_revision.ff_revision). 
* updated coldfire.cfm to check for cf_revision only. 
* added template, cached, and timestamp columns to DB Queries tab. 
* updated build file to generate version number based on SVN revisions.


Last Updated: March 5, 2008 (1.004)

Updated build file to use branch and local property files. Updates to
coldfire- service including new extensions.coldfire.logSvcMsgs property
to control logging. Added platform specific chrome.manifest overrides.


Last Updated: Feb 6, 2008 (1.003)

Updated extension to escape HTML. Core coldfirePanel now uses Firebug's
DOMPlate templating engine. Minor change to coldfire.cfm to return
general info as a query object.


Last Updated: Jan 2, 2008 (1.002)

Fixes to coldfire_udf_encode UDF in coldfire.cfm based on latest CFJSON.


Last Updated: Sept 26, 2007 (1.001)

Fixed Firefox extension so that ColdFire can be used in Firebug's popup
window.


Last Updated: Sept 25, 2007 (1.0)

Additional updated to both Firefox extension and coldfire.cfm to support
displaying complex variable values.


Last Updated: July 25, 2007 (0.0.802)

Update Firefox extension to display variable values. Also updated to fix
memory leak. Updated coldfire.cfm to return variable labels, values as a
query.


Last Updated: July 23, 2007 (0.0.801)

Added variables tab. Variables added to the variables tab will be sent
as a JSON array in the ColdFire-Variables request header.


Last Updated: July 19, 2007 (0.0.7)

Completed localization for en-US. Updated extension to prevent variable
name conflicts with other Firebug extensions.


Last Updated: July 1, 2007 (0.0.6)

The ColdFire extension now modifies your UserAgent, as other Firebug
extensions do. coldfire.cfm debug template looks for this UA, and if it
doesn't exist, it will not return debug information.

If you use another extension that changes your UA, please disable it
when using ColdFire.


Last Updated: June 20, 2007 (0.0.5)

This is a big update, 99% of it done by Nathan Mische
(nmische@gmail.com) Here are his changes. Note some are removed as they
apply to the source setup for the XPI which is not yet included in SVN.

coldfire.cfm
* added udf_coldfire_CFDebugSerializable UDF
* changed udf_coldfire_getQueries to return query parameter as well as 
  stored procedure parameter/resultset data. This data is now formatted 
  by the coldfire client.

coldfireextension
* added the parseParams preference 
* added ColdFireFormatter object to handle formatting query and stored 
  procedure data 
* added localized content for parseParams preference and
  ColdFireFormatter object (en-US only, but it's a start)

I made one small change to his updates, which is to fix an issue where
SQL with line breaks formatted a bit oddly.


Last Updated: April 4, 2007 (0.0.401) 

I lost a fix that was done a while ago. It fixes replacement of bound 
parameters in the query.


Last Updated: April 4, 2007 (0.0.4)

udfs renamed to avoid duplicate udf error cftimer support added
duplicate qEvents to prevent problems with changes to data coldfire.xpi
updated to handle these changes


Last Updated: March 21, 2007 (0.0.3)

coldfire.cfm splits large strings and uses multiple headers coldfire.xpi
updated to handle these changes


Last Updated: March 18, 2007 (0.02)

coldfire.cfm uses JSON now. coldfire.cfm uses multiple headers.
coldfire.cfm won't break on cflocation anymore. coldfire.xpi updated to
support json + multiple headers


Last Updated: March 13, 2007 (0.0.1)

coldfire.cfm updated to check if CFFLUSH was called. If so - no debug
info is returned. Docs will eventually cover that you can't use cfflush
with ColdFire.

Note new version #. This matches what you see in Firefox as well. We
will be 0.X until the final formal release.

coldfire.xpi was updated to reflect new version #.


Last Updated: March 13, 2007 (RC1) Initial release.
