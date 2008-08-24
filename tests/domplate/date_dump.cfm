<cfset testVar = Now() />

<cfoutput>
<html>
<head>
	<title>Date Test</title>
</head>
<body>
<h1>Date Test</h1>

<h2>CFDUMP</h2>

<div><cfdump var="#testVar#"></div>

</body>
</html>
</cfoutput>