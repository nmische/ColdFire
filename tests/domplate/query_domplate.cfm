
<cfinclude template="../../src/coldfusion/coldfire.cfm"/>

<cfquery name="testVar" datasource="cfartgallery">
	SELECT LASTNAME, FIRSTNAME
	FROM   ARTISTS
</cfquery>

<cfset testJSON = coldfire_udf_encode(testVar) />

<cfoutput>
<html>
<head>
	<title>Query Test</title>
	
	<script src="debug.js" type="text/javascript"></script>
	<script src="domplate.js" type="text/javascript"></script>
	<script src="lib.js" type="text/javascript"></script>
	<script src="dump.js" type="text/javascript"></script >
	
	<script>	
	
		function runTest(){
			
			with (FBL){		
				var testVar = #testJSON#;			
				ColdFireFormatter.dump.append({value:testVar}, $("test"));
			}
		
		};
					
		window.addEventListener("load", runTest, false);				

	</script>	
	
	<link rel="stylesheet" type="text/css" href="dump.css" />
</head>
<body>
<h1>Query Test</h1>

<h2>DOMPLATE</h2>

<div id="test"></div>

</body>
</html>
</cfoutput>