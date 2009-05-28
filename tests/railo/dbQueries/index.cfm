<cfquery name="getPassengers" datasource="coldfiretest" cachedwithin="#CreateTimeSpan(0,0,5,0)#">
	SELECT *
	FROM Users
</cfquery>

<cfquery name="getPassengersWithWhitespace" datasource="coldfiretest" cachedwithin="#CreateTimeSpan(0,0,5,0)#">
	
	
	
	
	
	
	
	SELECT
	
		UserID,
		

    			FirstName
,

    		
	
	   LastName,
	  Active
	FROM 
	
	
	
	
Users


   
   
			
					
						
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
	<cfprocparam value="K" cfsqltype="cf_sql_varchar">
	<cfprocparam value="A" cfsqltype="cf_sql_varchar">
	<cfprocparam value="1" cfsqltype="cf_sql_bit">
	<cfprocresult name="getKate">
</cfstoredproc>

<cfoutput>
<html>
<head>
	<title>Railo ColdFire Tests</title>
</head>
<body>
<h1>Railo ColdFire Tests</h1>
<ul>
	
<cfadmin action="getDebugData" returnVariable="debugging">
<cfdump var="#debugging#" />
	
</ul>
</body>
</html>
</cfoutput>

		