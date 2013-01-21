<cfcomponent extends="mxunit.framework.TestCase">
	
	<cfinclude template="/coldfire/src/coldfusion/debug/coldfire.cfm" />
	
	
	<cffunction name="setUp" output="false" access="public" returntype="void" hint="">		
		
	</cffunction>
	
	<cffunction name="tearDown" output="false" access="public" returntype="void" hint="">
		
	</cffunction>
	
	<cffunction name="testArray" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a simple array.">
		<cfset testValue = ['hello','world'] />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '["hello","world"]'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBinary" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for binary data.">
		<cfset testValue = CharsetDecode("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris id enim. Maecenas venenatis, mauris at vehicula viverra, augue purus rutrum sem, vitae pellentesque justo justo sit amet leo. Cras viverra turpis et sapien auctor faucibus. Nam pharetra turpis quis enim. Nam bibendum placerat nulla. Praesent suscipit, lorem et venenatis pellentesque, quam risus consectetuer dolor, eget placerat elit massa quis turpis. Praesent venenatis dolor eu felis. Duis sed nulla. Nulla eleifend, purus eu tincidunt sodales, orci augue vestibulum libero, feugiat semper tellus ipsum eu velit. Morbi nulla mauris, lacinia pulvinar, imperdiet sit amet, condimentum vitae, ligula. Nulla vehicula luctus felis. Quisque tincidunt. Mauris pede tortor, congue in, placerat et, scelerisque ac, justo. Quisque sollicitudin augue eu libero. Cras dictum nisi auctor massa. Nunc neque felis, accumsan convallis, fringilla et, congue in, lorem. Nam faucibus pede eu orci. Nullam vitae nulla. Ut vel tortor. Vestibulum pede. Morbi bibendum volutpat.","utf-8")  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"binary","data":"7611111410110932105112115117109321001111081111143211510511632971091011164432991111101151019911610111611710111432971001051121051159910511010332101108105116463277971171141051153210510032101110105109463277971019910111097115321181011101011109711610511544321099711711410511532971163211810110410599117108973211810511810111411497443297117103117101321121171141171153211411711611411710932115101109443211810511697101321121011081081011101161011151131171013210611711511611132106117115116111321151051163297109101116321081011114632671149711532118105118101114114973211611711411210511532101116321159711210510111032971179911611111432102971179910598117115463278971093211210497114101116114973211611711411210511532113117105115321011101051094632789710932981059810111010011710932112108979910111497116321101171081089746328011497101115101110116321151171159910511210511644321081111141011093210111632118101110101110971161051153211210110810810111011610111511311710144321131179710932114105115117115329911111011510199116101116117101114321001111081111144432101103101116321121089799101114971163210110810511632109971151159732113117105115321161171141121051154632801149710111510111011632118101110101110971161051153210011110811111432101117321021011081051154632681171051153211510110032110117108108974632781171081089732101108101105102101110100443211211711411711532101117321161051109910510011711011632115111100971081011154432111114991053297117103117101321181011151161059811710811710932108105981011141114432102101117103105971163211510110911210111432116101108108117115321051121151171093210111732118101108105116463277111114981053211011710810897321099711711410511544321089799105110105973211211710811810511097114443210510911210111410010510111632115105116329710910111644329911111010010510910111011611710932118105116971014432108105103117108974632781171081089732118101104105991171089732108117991161171153210210110810511546328111710511511311710132116105110991051001171101164632779711711410511532112101100101321161111141161111144432991111101031171013210511044321121089799101114971163210111644321159910110810111410511511311710132979944321061171151161114632811171051151131171013211511110810810599105116117100105110329711710311710132101117321081059810111411146326711497115321001059911611710932110105115105329711799116111114321099711511597463278117110993211010111311710132102101108105115443297999911710911597110329911111011897108108105115443210211410511010310510810897321011164432991111101031171013210511044321081111141011094632789710932102971179910598117115321121011001013210111732111114991054632781171081089710932118105116971013211011710810897463285116321181011083211611111411611111446328610111511610598117108117109321121011001014632","length":1024}' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanTrueBoolean" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a boolean true.">
		<cfset testValue =  true />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = true />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanFalseBoolean" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a boolean false.">
		<cfset testValue =  false />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = false />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBoolean1" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the number 1.">
		<cfset testValue =  1 />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = 1 />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBoolean0" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the number 0.">
		<cfset testValue =  0 />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = 0 />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanYes" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the string 'Yes'.">
		<cfset testValue =  "Yes" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '"Yes"' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanNo" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the string 'No'.">
		<cfset testValue =  "No" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '"No"' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanTrue" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the string 'True'.">
		<cfset testValue = "True" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = true />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testBooleanFalse" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for the string 'False'.">
		<cfset testValue = "False" />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = false />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testCustomFunction" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a UDF.">
		<cfset coldFireJSON = coldfire_udf_encode(functionForTest) />
		<cfset referenceJSON = '{"__cftype__":"customfunction","DESCRIPTION":"This is a test description","NAME":"functionForTest","RETURNTYPE":"string","DISPLAYNAME":"TestFunction","ACCESS":"public","PARAMETERS":[{"__cftype__":"struct","TYPE":"string","REQUIRED":true,"NAME":"message"},{"__cftype__":"struct","DEFAULT":"","TYPE":"string","NAME":"messagePrefix","REQUIRED":false}],"OUTPUT":false,"HINT":"This is a hint","ROLES":"someRole"}' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testDate" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a date.">
		<cfset testValue = Now()  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '"' & ToString(testValue) & '"'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testNumericInteger" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a number.">
		<cfset testValue = 123  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = 123 />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testNumericDecimal" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a number.">
		<cfset testValue = 123.456  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = 123.456 />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testObjectComponent" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a ColdFusion component.">
		<cfset testValue = CreateObject("component","TestComponent")  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"component","FUNCTIONS":[{"__cftype__":"struct","OUTPUT":false,"RETURNTYPE":"string","PARAMETERS":[],"NAME":"getTestProp","ACCESS":"public"},{"__cftype__":"struct","ACCESS":"public","NAME":"testFunction","DISPLAYNAME":"testFunction","OUTPUT":false,"PARAMETERS":[],"RETURNTYPE":"string","HINT":"This is a test function"},{"__cftype__":"struct","OUTPUT":false,"RETURNTYPE":"void","PARAMETERS":[{"__cftype__":"struct","TYPE":"string","REQUIRED":true,"NAME":"testProp"}],"NAME":"setTestProp","ACCESS":"public"}],"NAME":"TestComponent"}' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testObjectJava" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a Java object.">
		<cfset testValue = CreateObject("java","java.lang.String")  />
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"java","CLASSNAME":"java.lang.String","METHODS":[{"__cftype__":"struct","METHOD":"charAt( int)","RETURNTYPE":"char"},{"__cftype__":"struct","METHOD":"codePointAt( int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"codePointBefore( int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"codePointCount( int, int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"compareTo( java.lang.String)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"compareToIgnoreCase( java.lang.String)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"concat( java.lang.String)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"contains( java.lang.CharSequence)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"contentEquals( java.lang.StringBuffer)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"copyValueOf( char[])","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"endsWith( java.lang.String)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"equals( java.lang.Object)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"equalsIgnoreCase( java.lang.String)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"format( java.lang.String, java.lang.Object[])","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"getBytes()","RETURNTYPE":"byte[]"},{"__cftype__":"struct","METHOD":"getChars( int, int, char[], int)","RETURNTYPE":"void"},{"__cftype__":"struct","METHOD":"getClass()","RETURNTYPE":"java.lang.Class"},{"__cftype__":"struct","METHOD":"hashCode()","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"indexOf( int, int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"intern()","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"lastIndexOf( java.lang.String, int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"length()","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"matches( java.lang.String)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"notify()","RETURNTYPE":"void"},{"__cftype__":"struct","METHOD":"notifyAll()","RETURNTYPE":"void"},{"__cftype__":"struct","METHOD":"offsetByCodePoints( int, int)","RETURNTYPE":"int"},{"__cftype__":"struct","METHOD":"regionMatches( boolean, int, java.lang.String, int, int)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"replace( java.lang.CharSequence, java.lang.CharSequence)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"replaceAll( java.lang.String, java.lang.String)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"replaceFirst( java.lang.String, java.lang.String)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"split( java.lang.String)","RETURNTYPE":"java.lang.String[]"},{"__cftype__":"struct","METHOD":"startsWith( java.lang.String)","RETURNTYPE":"boolean"},{"__cftype__":"struct","METHOD":"subSequence( int, int)","RETURNTYPE":"java.lang.CharSequence"},{"__cftype__":"struct","METHOD":"substring( int, int)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"toCharArray()","RETURNTYPE":"char[]"},{"__cftype__":"struct","METHOD":"toLowerCase()","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"toString()","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"toUpperCase( java.util.Locale)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"trim()","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"valueOf( float)","RETURNTYPE":"java.lang.String"},{"__cftype__":"struct","METHOD":"wait()","RETURNTYPE":"void"}],"FIELDS":[{"__cftype__":"struct","FIELD":"java.util.Comparator CASE_INSENSITIVE_ORDER","VALUE":"java.util.Comparator"}]}' />
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testQuery" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a ColdFusion query.">
		<cfquery name="testValue" datasource="cfartgallery">
			SELECT FIRSTNAME, LASTNAME
			FROM   ARTISTS
		</cfquery>		
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"RECORDCOUNT":15,"COLUMNLIST":"FIRSTNAME,LASTNAME","DATA":{"FIRSTNAME":["Aiden","Austin","Elicia","Jeff","Lori","Maxwell","Paul","Raquel","Viata","Diane","Anthony","Ellery","Emma","Taylor Webb","Mike"],"LASTNAME":["Donolan","Weber","Kim","Baclawski","Johnson","Wilson","Trani","Young","Trenton","Demo","Kunovic","Buntel","Buntel","Frazier","Nimer"]}}'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testString" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a string.">
		<cfset testValue = "Hello World!" />	
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '"Hello World!"'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>

	<cffunction name="testStringWithSpecialCharacters" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a string.">
		<cfset testValue = "Quotation Mark: "", Reverse Solidus: \, Solidus: /, Backspace: #Chr(8)#, Form Feed: #Chr(12)#, New Line: #Chr(10)#, Carrige Return: #Chr(13)#, Horizontal Tab: #Chr(9)#" />	
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '"Quotation Mark: \", Reverse Solidus: \\, Solidus: \/, Backspace: \b, Form Feed: \f, New Line: \n, Carrige Return: \r, Horizontal Tab: \t"'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testStruct" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a ColdFusion structure.">
		<cfset testValue = {keyone="item one", keytwo="item two", keythree="item three"} />	
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"struct","KEYONE":"item one","KEYTWO":"item two","KEYTHREE":"item three"}'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testWDDX" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for a WDDX serialized array.">
		<cfset testVarWDDX = ["item one","item two","item three"] />
		<cfwddx action="cfml2wddx" input="#testVarWDDX#" output="testValue" />	
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"wddx","data":["item one","item two","item three"]}'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	<cffunction name="testXML" output="false" access="public" returntype="void" hint="Compare coldfire_udf_encode to referenceJSON for an XML document.">
<cfxml variable="testValue">
<users>
	<user id="1" active="false">
		<name>Nathan</name>
	</user>
	<user id="2" active="true">
		<name>Barbara</name>
	</user>
</users>
</cfxml>	
		<cfset coldFireJSON = coldfire_udf_encode(testValue) />
		<cfset referenceJSON = '{"__cftype__":"xmldoc","XmlComment":"","XmlRoot":{"__cftype__":"xmlelem","XmlName":"users","XmlNsPrefix":"","XmlNsURI":"","XmlText":"\n\t\n\t\n","XmlComment":"","XmlAttributes":{"__cftype__":"struct"},"XmlChildren":[{"__cftype__":"xmlelem","XmlName":"user","XmlNsPrefix":"","XmlNsURI":"","XmlText":"\n\t\t\n\t","XmlComment":"","XmlAttributes":{"__cftype__":"struct","active":false,"id":1},"XmlChildren":[{"__cftype__":"xmlelem","XmlName":"name","XmlNsPrefix":"","XmlNsURI":"","XmlText":"Nathan","XmlComment":"","XmlAttributes":{"__cftype__":"struct"},"XmlChildren":[]}]},{"__cftype__":"xmlelem","XmlName":"user","XmlNsPrefix":"","XmlNsURI":"","XmlText":"\n\t\t\n\t","XmlComment":"","XmlAttributes":{"__cftype__":"struct","active":true,"id":2},"XmlChildren":[{"__cftype__":"xmlelem","XmlName":"name","XmlNsPrefix":"","XmlNsURI":"","XmlText":"Barbara","XmlComment":"","XmlAttributes":{"__cftype__":"struct"},"XmlChildren":[]}]}]}}'/>
		<cfset assertEquals(referenceJSON,coldFireJSON)  />
	</cffunction>
	
	
	<cffunction name="functionForTest" returntype="string" roles="someRole" access="public" description="This is a test description" output="false" displayname="TestFunction" hint="This is a hint">
	
		<cfargument name="message" type="string" required="true"/>
		<cfargument name="messagePrefix" type="string" required="false" default=""/>	
		<cfreturn arguments.messagePrefix & " " & arguments.message />
		
	</cffunction>
	
</cfcomponent>