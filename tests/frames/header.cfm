<cfset pageTitle = "Frameset Example - Header">
<cftrace text="Hello from header.cfm!">
<html>
<head>
<title><cfoutput>#pageTitle#</cfoutput></title>
</head>
<body>
<h1><cfoutput>#pageTitle#</cfoutput></h1>
</body>
</html>