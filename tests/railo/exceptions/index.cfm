<html>
<head>
	<title>ColdFire Tests</title>
</head>
<body>
<h1>Exception Tests</h1>

<h2>Database Error</h2>

<cftry>
	
	<cfquery name="getArtists" datasource="nodatasource">
		SELECT * FROM Artists
	</cfquery>	
	
	<cfcatch type="database">
		<cfdump var="#cfcatch#">
	</cfcatch>
	
</cftry>

<h2>Missing Include Error</h2>

<cftry>
	
	<cfinclude template="noinclude.cfm">	
	
	<cfcatch type="missinginclude">
		<cfdump var="#cfcatch#">
	</cfcatch>
	
</cftry>

<cfadmin action="getDebugData" returnVariable="debugging">
<cfdump var="#debugging#" />

</body>
</html>