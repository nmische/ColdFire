<cfinclude template="../../src/coldfusion/coldfire.cfm"/>
<cfset testVar = CharsetDecode("This is a test.","utf-8") />
<cfset testVar2 = CharsetDecode("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris id enim. Maecenas venenatis, mauris at vehicula viverra, augue purus rutrum sem, vitae pellentesque justo justo sit amet leo. Cras viverra turpis et sapien auctor faucibus. Nam pharetra turpis quis enim. Nam bibendum placerat nulla. Praesent suscipit, lorem et venenatis pellentesque, quam risus consectetuer dolor, eget placerat elit massa quis turpis. Praesent venenatis dolor eu felis. Duis sed nulla. Nulla eleifend, purus eu tincidunt sodales, orci augue vestibulum libero, feugiat semper tellus ipsum eu velit. Morbi nulla mauris, lacinia pulvinar, imperdiet sit amet, condimentum vitae, ligula. Nulla vehicula luctus felis. Quisque tincidunt. Mauris pede tortor, congue in, placerat et, scelerisque ac, justo. Quisque sollicitudin augue eu libero. Cras dictum nisi auctor massa. Nunc neque felis, accumsan convallis, fringilla et, congue in, lorem. Nam faucibus pede eu orci. Nullam vitae nulla. Ut vel tortor. Vestibulum pede. Morbi bibendum volutpat.","utf-8")  />
<cfset testJSON = coldfire_udf_encode(testVar) />
<cfset testJSON2 = coldfire_udf_encode(testVar2) />
<cfoutput>
<html>
<head>
	<title>Binary Test</title>
	
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
<h1>Binary Test</h1>

<h2>DOMPLATE</h2>

<div id="test"></div>

<div id="test2"></div>

</body>
</html>
</cfoutput>