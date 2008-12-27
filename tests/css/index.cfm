<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	LASTNAME
FROM
	ARTISTS
</cfquery>
<html>
<head>
	<title>Dynamic Style Sheet Example</title>
	<link rel="stylesheet" href="css.cfm" type="text/css">
</head>
<body>
<h1>Dynamic Style Sheet Example</h1>
<ul>
<cfoutput query="getArtists">
	<li class="#Left(LastName,1)#">#LastName#</li>
</cfoutput>
</ul>
</body>
</html>