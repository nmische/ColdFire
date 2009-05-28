<cfoutput>
<html>
<head>
	<title>Railo ColdFire Timer Test</title>
</head>
<body>
<h1>Railo ColdFire Timer Test</h1>
<p>This page generates six timer messages.</p>
</body>
</html>
</cfoutput>


<cftimer label="Timer One" type="debug">
<cf_sleep ms="3" />
</cftimer>

<cftimer label="Timer Two" type="debug">
<cf_sleep ms="7" />
</cftimer>

<cftimer label="Timer Three" type="debug">
<cf_sleep ms="14" />
</cftimer>

<cftimer label="Timer Four" type="debug">
<cf_sleep ms="15" />
</cftimer>

<cftimer label="Timer Five" type="debug">
<cf_sleep ms="22" />
</cftimer>

<cftimer label="Timer Six" type="debug">
<cf_sleep ms="41" />
</cftimer>