<html>
	<head>
		<title>ColdFire Test</title>
	</head>
	<body>
		<h1>ColdFire Test</h1>
		
		<cfinclude template="include.cfm" />
		
		<iframe height="100" with="75%" src="theothers.cfm" />
		
	
	</body>
</html>

<!--- Test General Tab --->

<!--- Test Execution Times Tab --->

<cfset computer = CreateObject("component","computer") />
<cfset log = computer.printLog() />

<!--- Test DB Queries Tab --->

<cfquery name="getPassengers" datasource="coldfiretest" cachedwithin="#CreateTimeSpan(0,0,5,0)#">
	SELECT *
	FROM Users
</cfquery>

<cfquery name="getJack" datasource="coldfiretest">
	SELECT 
		*
	FROM 
		Users
	WHERE 
		FirstName = <cfqueryparam value="Jack" cfsqltype="cf_sql_varchar">
		AND Active = <cfqueryparam value="Yes" cfsqltype="cf_sql_bit">
</cfquery>

<cfstoredproc procedure="GetUsers" datasource="coldfiretest" debug="true">
	<cfprocparam dbvarname="fnfilter" value="K" cfsqltype="cf_sql_varchar">
	<cfprocparam dbvarname="lnfilter" value="A" cfsqltype="cf_sql_varchar">
	<cfprocparam dbvarname="afilter" value="1" cfsqltype="cf_sql_bit">
	<cfprocresult name="getKate">
</cfstoredproc>

<!--- Test Traces Tab (Text) --->

<cftrace text="108:00" type="information">
<cftrace text="004:00" type="warning">
<cftrace text="001:00" type="warning">
<cftrace text="000:10" type="warning">
<cftrace text="000:00" type="error">
<cftrace text="System Failure" type="fatal information">


<!--- Test Timer Tab --->

<cftimer label="Timer One" type="debug">
<cf_sleep ms="3" />
</cftimer>

<cftimer label="Timer Two" type="debug">
<cf_sleep ms="7" />
</cftimer>

<cftimer label="Timer Three" type="debug">
<cf_sleep ms="14" />
</cftimer>

<cftimer label="Timer Four" type="debug">
<cf_sleep ms="15" />
</cftimer>

<cftimer label="Timer Five" type="debug">
<cf_sleep ms="22" />
</cftimer>

<cftimer label="Timer Six" type="debug">
<cf_sleep ms="41" />
</cftimer>

<!--- Test Variables Tab --->

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

<cftrace category="test" var="computer" />
<cftrace category="test" var="log" />
<cftrace category="LOST" var="flightNumber" />
<cftrace category="LOST" var="stations" />
<cftrace var="multilineVar" />



