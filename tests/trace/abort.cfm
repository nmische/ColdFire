<cfset computer= StructNew()>
<cfset computer.processor = "Intel"/>

<cfset flightNumber = "815" />
<cfset stations = ArrayNew(1) />
<cfset stations[1] = "The Arrow" />
<cfset stations[2] = "The Swan" />
<cfset stations[3] = "The Flame" />
<cfset stations[4] = "The Pearl" />
<cfset stations[5] = "The Orchid" />
<cfset stations[6] = "The Staff" />
<cfset stations[7] = "The Hydra" />
<cfset stations[8] = "The Looking Glass" />

<cfsavecontent variable="multilineVar">
<p>This is a test.</p>
<ul>
	<li>One</li>
	<li>Two</li>
	<li>Three</li>
</ul>
</cfsavecontent>

<cfsavecontent variable="testScript">
<script language="JavaScript">
	var gConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
	gConsoleService.logStringMessage('All your base are belong to us.');

	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	var fileContractId = "@mozilla.org/file/local;1";  
	var fileInterface = Components.interfaces.nsILocalFile;
	var localFileClass = Components.classes[fileContractId];  
	var file = localFileClass.createInstance(fileInterface);  
	file.initWithPath('/Users/Shared/temp.txt'); 
	if ( file.exists() == false ) {
			alert( "Creating file... " );
			file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
	} 
	var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream );
	/* Open flags 
	#define PR_RDONLY       0x01
	#define PR_WRONLY       0x02
	#define PR_RDWR         0x04
	#define PR_CREATE_FILE  0x08
	#define PR_APPEND      0x10
	#define PR_TRUNCATE     0x20
	#define PR_SYNC         0x40
	#define PR_EXCL         0x80
	*/
	/*
	** File modes ....
	**
	** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
	** The 'mode' argument may be ignored by PR_Open on other platforms.
	**
	**   00400   Read by owner.
	**   00200   Write by owner.
	**   00100   Execute (search if a directory) by owner.
	**   00040   Read by group.
	**   00020   Write by group.
	**   00010   Execute by group.
	**   00004   Read by others.
	**   00002   Write by others
	**   00001   Execute by others.
	**
	*/
	outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
	var output = 'All your base belong to us.'
	var result = outputStream.write( output, output.length );
	outputStream.close();

	alert('All your base are belong to us.');
</script>
</cfsavecontent>




<!--- Test Traces Tab (Var) --->

<cftrace text="Just Some Text" >

<cftrace category="test" type="warning" var="computer" />
<cftrace category="LOST" var="flightNumber" >
<cftrace category="LOST" var="stations" />

<cftrace var="multilineVar" >
<cftrace type="fatal information" var="undefinedVar" />

<cftrace text="Hello World!" >
<cftrace text="stations" var="stations" />

<cftrace inline="true" text="Inline text trace." >

<cftrace abort="true" text="This is an abort." />



<cfoutput>
<html>
<head>
	<title>ColdFire Tests</title>
</head>
<body>
<h1>ColdFire Trace Tests</h1>

<cfif IsDebugMode()>
	<cfset factory = CreateObject("java","coldfusion.server.ServiceFactory")>
	<cfset cfdebugger = factory.getDebuggingService()>
	<cfset qEvents = cfdebugger.getDebugger().getData()>
	<cfdump var="#qEvents#">
</cfif>

</body>
</html>
</cfoutput>