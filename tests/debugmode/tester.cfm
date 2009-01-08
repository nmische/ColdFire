<html>
<head>
	<title>ColdFire Tests</title>
</head>
<body>
<h1>Debugging Mode Test</h1>

<cfoutput>IsDebugMode(): #IsDebugMode()#</cfoutput><br/>

<cfset factory = CreateObject("java","coldfusion.server.ServiceFactory")>
<cfset cfdebugger = factory.getDebuggingService().getDebugger()>
	
<cfoutput>Debugger running: #IsDefined("cfdebugger")#</cfoutput><br/>

</body>
</html>