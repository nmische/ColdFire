<cfset pageTitle = "Frameset Example - Content">
<cftrace text="Hello from content.cfm!">
<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	LASTNAME
FROM
	ARTISTS
</cfquery>
<html>
<head>
<title><cfoutput>#pageTitle#</cfoutput></title>
</head>
<body>
<h1><cfoutput>#pageTitle#</cfoutput></h1>
<ul>
<cfoutput query="getArtists">
	<li>#LastName#</li>
</cfoutput>
</ul>
</body>
</html>