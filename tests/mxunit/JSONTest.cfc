<cfcomponent extends="mxunit.framework.TestCase">
	
	
	<!--- load commons-lang for diff utility 
	<cfset loadPaths = ArrayNew(1) />
	<cfset loadPaths[1] = ExpandPath("/coldfire/tests/mxunit/commons-lang-2.4.jar") />
	<cfset variables.javaloader = createObject("component", "javaloader.JavaLoader").init(loadPaths) />
	<cfset variables.StringUtils = javaloader.create("org.apache.commons.lang.StringUtils") />
	--->
	
	
	<cfinclude template="/coldfire/src/coldfusion/coldfire.cfm" />
	
	
	<cffunction name="setUp" output="false" access="public" returntype="void" hint="">		
		
	</cffunction>
	
	<cffunction name="tearDown" output="false" access="public" returntype="void" hint="">
		
	</cffunction>
	
	<cffunction name="testArray" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for a simple array.">
		<cfset testValue = ['hello','world'] />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBinary" output="false" access="public" returntype="void" hint="Validate coldfire_udf_encode output for a binary object. Note: SerializeJSON fails for binary objects.">
		<cfset testValue = CharsetDecode("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris id enim. Maecenas venenatis, mauris at vehicula viverra, augue purus rutrum sem, vitae pellentesque justo justo sit amet leo. Cras viverra turpis et sapien auctor faucibus. Nam pharetra turpis quis enim. Nam bibendum placerat nulla. Praesent suscipit, lorem et venenatis pellentesque, quam risus consectetuer dolor, eget placerat elit massa quis turpis. Praesent venenatis dolor eu felis. Duis sed nulla. Nulla eleifend, purus eu tincidunt sodales, orci augue vestibulum libero, feugiat semper tellus ipsum eu velit. Morbi nulla mauris, lacinia pulvinar, imperdiet sit amet, condimentum vitae, ligula. Nulla vehicula luctus felis. Quisque tincidunt. Mauris pede tortor, congue in, placerat et, scelerisque ac, justo. Quisque sollicitudin augue eu libero. Cras dictum nisi auctor massa. Nunc neque felis, accumsan convallis, fringilla et, congue in, lorem. Nam faucibus pede eu orci. Nullam vitae nulla. Ut vel tortor. Vestibulum pede. Morbi bibendum volutpat.","utf-8")  />
		<cfset jsonString = "" />
		
		<cfloop index="i" from="1" to="#Min(ArrayLen(testValue),1000)#" step="1">
			<cfset jsonString = jsonString & testValue[i] />
		</cfloop>
				
		<cfset testJSON = "{""__cftype__"":""binary"",""data"":""" & jsonString & """,""length"":" & ArrayLen(testValue) & "}" />
		
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		
		<cfset debug(testJSON) />
		<cfset debug(coldFireJSON) />
		
		<cfset assertEquals(coldFireJSON,testJSON) />
	</cffunction>
	
	<cffunction name="testBooleanTrueBoolean" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for a boolean true.">
		<cfset testValue =  true />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBooleanFalseBoolean" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for a boolean false.">
		<cfset testValue =  false />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBoolean1" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the number 1.">
		<cfset testValue =  1 />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBoolean0" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the number 0.">
		<cfset testValue =  0 />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBooleanYes" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the string 'Yes'.">
		<cfset testValue =  "Yes" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBooleanNo" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the string 'No'.">
		<cfset testValue =  "No" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBooleanTrue" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the string 'True'.">
		<cfset testValue = "True" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testBooleanFalse" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to SerializeJSON for the string 'False'.">
		<cfset testValue = "False" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testCustomFunction" output="false" access="public" returntype="void" hint="">
		<cfset coldFireJSON = coldfire_udf_encode(setUp) />
		<cfset coldFusionJSON = SerializeJSON(GetMetadata(setUp)) />	
				
		<cfset coldFireJSON = Replace(coldFireJSON,"""__cftype__"":""customfunction"",","","ALL")>
		
		<cfset debug(coldFireJSON) />
		<cfset debug(coldFusionJSON) />
		
		<cfset assertEquals(coldFusionJSON,coldFireJSON) />
	</cffunction>
	
	<cffunction name="testDate" output="false" access="public" returntype="void" hint="">
		<cfset testValue = Now()  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testNumericInteger" output="false" access="public" returntype="void" hint="">
		<cfset testValue = 123  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testNumericDecimal" output="false" access="public" returntype="void" hint="">
		<cfset testValue = 123.456  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testObjectComponent" output="false" access="public" returntype="void" hint="">
		<cfset testValue = CreateObject("component","TestComponent")  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset debug(coldFireJSON) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testObjectJava" output="false" access="public" returntype="void" hint="">
		<cfset testValue = CreateObject("java","java.lang.String")  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset debug(coldFireJSON) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
	<cffunction name="testQuery" output="false" access="public" returntype="void" hint="">
		
		<cfquery name="testValue" datasource="cfartgallery">
			SELECT FIRSTNAME, LASTNAME
			FROM   ARTISTS
		</cfquery>		
		
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset coldFusionJSON = SerializeJSON(testValue) />
		<cfset debug(coldFireJSON) />
		<cfset assertEquals(coldFireJSON,coldFusionJSON) />
	</cffunction>
	
</cfcomponent>