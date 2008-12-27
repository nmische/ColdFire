<cfinclude template="../../src/coldfusion/coldfire.cfm"/>
<cfset testVar = true />
<cfset testVar2 = "true" />
<cfset testJSON = coldfire_udf_encode(testVar) />
<cfset testJSON2 = coldfire_udf_encode(testVar2) />
<cfoutput>
<html>
<head>
	<title>Boolean Test</title>
	
	<script src="debug.js" type="text/javascript"></script>
	<script src="domplate.js" type="text/javascript"></script>
	<script src="lib.js" type="text/javascript"></script>
	
	<script>	
	
		function runTest(){
			
			with (FBL){		
				var testVar = #testJSON#;			
				var testVar2 = #testJSON2#
				ColdFireFormatter.dump.append({value:testVar}, $("test"));
				ColdFireFormatter.dump.append({value:testVar2}, $("test2"));			
			}
		
		};
					
		window.addEventListener("load", runTest, false);				

	</script>	
	
	<link rel="stylesheet" type="text/css" href="dump.css" />
</head>
<body>
<h1>Boolean Test</h1>

<h2>DOMPLATE</h2>

<div id="test"></div>

<div id="test2"></div>

</body>
</html>
</cfoutput>