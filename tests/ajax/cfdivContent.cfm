<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	LASTNAME
FROM
	ARTISTS
</cfquery>
<!--- <cftrace text="Hello from cfdivContent.cfm!" /> --->
<html>
<head>
	<title>CF Div Example - Content</title>
</head>
<body>
<ul>
<cfoutput query="getArtists">
	<li>#LastName#</li>
</cfoutput>
</ul>
</body>
</html>