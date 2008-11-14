<cfoutput>
<html>
<head>
	<title>ColdFire Application.cfc Test</title>
</head>
<body>
<h1>ColdFire Application.cfc Test (CF 8)</h1>
<ul>
	<li>Variables 
		<ul>
			<li>testVar</li>
			<li>testStruct</li>
			<li>testArray</li>
			<li>testQuery</li>
		</ul>
	</li>
	<li>Form 
		<ul><li>testFormVar</li></ul>
	</li>
	<li>URL
		<ul><li>testURLVar</li></ul>
	</li>
	<li>Request
		<ul><li>testRequestVar</li></ul>
	</li>
	<li>CGI
		<ul><li>SCRIPT_NAME</li></ul>
	</li>
	<li>Cookie
		<ul><li>testCookieVar</li></ul>
	</li>
	<li>Client
		<ul><li>testClientVar</li></ul>
	</li>
	<li>Session
		<ul><li>testSessionVar</li></ul>
	</li>
	<li>Application
		<ul><li>testApplicationVar</li></ul>
	</li>
	<li>Server
		<ul><li>testServerVar</li></ul>
	</li>
</ul>

<cfset testVar = "This is a test."/>
<cfset testStruct = StructNew() />
<cfset testStruct.KeyOne = "Hello" />
<cfset testArray = ArrayNew(1) />
<cfset testArray[1] = "Hello" />
<cfquery name="testQuery" datasource="coldfiretest">
	SELECT	*
	FROM	Users
	WHERE	UserTypeID = <cfqueryparam value="2" cfsqltype="cf_sql_integer" />
</cfquery>
<cfset form.testFormVar = "This is a test. FORM" />
<cfset url.testURLVar = "This is a test. URL" />
<cfset request.testRequestVar = "This is a test. REQUEST" />
<cfset cookie.testCookieVar = "This is a test. COOKIE" />
<cfset client.testClientVar = "This is a test. CLIENT" />
<cfset session.testSessionVar = "This is a test. SESSION">
<cfset application.testApplicationVar = "This is a test. APPLICATION">
<cfset server.testServerVar = "This is a test. SERVER">

</body>
</html>
</cfoutput>