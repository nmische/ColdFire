<cfset testVar = CreateObject("component","TestComponent") />		
<cfset testVar2 = CreateObject("java","java.lang.String") />
<cfoutput>
<html>
<head>
	<title>Object Test</title>
</head>
<body>
<h1>Object Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

<br/>
<br/>

<cfdump var="#testVar2#">

</body>
</html>
</cfoutput>