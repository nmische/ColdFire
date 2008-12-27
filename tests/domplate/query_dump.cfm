
<cfquery name="testVar" datasource="cfartgallery">
	SELECT LASTNAME, FIRSTNAME
	FROM   ARTISTS
</cfquery>

<cfoutput>
<html>
<head>
	<title>Query Test</title>
</head>
<body>
<h1>Query Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

</body>
</html>
</cfoutput>