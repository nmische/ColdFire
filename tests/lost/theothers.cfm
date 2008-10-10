<cfquery name="getOthers" datasource="coldfiretest" cachedwithin="#CreateTimeSpan(0,0,5,0)#">
	SELECT	*
	FROM	Users
	WHERE	UserTypeID = <cfqueryparam value="2" cfsqltype="cf_sql_integer" />
		AND UserCode = <cfqueryparam value="OTH" cfsqltype="cf_sql_char" maxlength="3" null="no"/>
</cfquery>

<html>
	<head>
		<title>The Others</title>
	</head>
	<body>
		<h1>The Others</h1>
		
		<ul>
		<cfoutput query="getOthers">
			<li>#FirstName# #LastName#</li>
		</cfoutput>		
		</ul>
		
	
	</body>
</html>