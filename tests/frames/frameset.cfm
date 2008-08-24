<cfset pageTitle = "Frameset Example - Frameset">
<cftrace text="Hello from frameset.cfm!">
<html>
<head>
<title><cfoutput>#pageTitle#</cfoutput></title>
</head>
<frameset rows="75,*">
	<frame name="header" src="header.cfm">
	<frameset cols="250,*">
		<frame name="navigation" src="navigation.cfm">
		<frame name="content" src="content.cfm">
	</frameset>
</frameset>
</html>

