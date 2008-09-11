<cfquery name="getOthers" datasource="coldfiretest" cachedwithin="#CreateTimeSpan(0,0,5,0)#">
	SELECT *
	FROM Users
	WHERE UserTypeID = 2
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