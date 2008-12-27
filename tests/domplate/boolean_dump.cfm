<cfset testVar = true />
<cfset testVar2 = "true" />

<cfoutput>
<html>
<head>
	<title>Boolean Test</title>
</head>
<body>
<h1>Boolean Test</h1>

<h2>CFDUMP</h2>

<div><cfdump var="#testVar#"></div>

<div><cfdump var="#testVar2#"></div>

</body>
</html>
</cfoutput>