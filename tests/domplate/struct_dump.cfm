<cfset testVar = {keyone="item one", keytwo="item two", keythree="item three"} />
<cfoutput>
<html>
<head>
	<title>Struct Test</title>
</head>
<body>
<h1>Struct Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

</body>
</html>
</cfoutput>