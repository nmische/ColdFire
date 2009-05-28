<cfimport taglib="./tags" prefix="t"/>
<cfset testCFC = CreateObject("component","test") />
<html>
	<head>
		<title>Test</title>
	</head>
	<body>
		<h1>Test</h1>
		<t:HelloWorld/>
		<p>IsDebugMode():<cfoutput>#IsDebugMode()#</cfoutput></p>
		<cfinclude template="include.cfm"/>
		<cfset testCFC.sayHello() />
		
		<cfadmin action="getDebugData" returnVariable="debugging">
		<cfdump var="#debugging#" />
		
	</body>
</html>