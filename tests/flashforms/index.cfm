<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	*
FROM
	ARTISTS
</cfquery>

<cfoutput>
<html>
<head>
	<title>Flash Form Example</title>
</head>
<body>
<h1>Flash Form Example</h1>

<cfform format="flash" action="index.cfm">

	<cfinput type="text" name="testTextInput" value="" label="Text Input:" size="40">

</cfform>

</body>
</html>
</cfoutput>