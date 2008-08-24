<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>XML Test</title>
</head>
<body>
<h1>XML Test</h1>

<cfxml variable="testVarXML">
<users>
	<user id="1" active="false">
		<name>Nathan</name>
	</user>
	<user id="2" active="true">
		<name>Barbara</name>
	</user>
</users>
</cfxml>

<cfset testVar = testVarXML />

<pre>
<code>
&lt;cfxml variable="testVar"&gt;
&lt;users&gt;
	&lt;user id="1" active="false"&gt;
		&lt;name&gt;Nathan&lt;/name&gt;
	&lt;/user&gt;
	&lt;user id="2" active="true"&gt;
		&lt;name&gt;Barbara&lt;/name&gt;
	&lt;/user&gt;
&lt;/users&gt;
&lt;/cfxml&gt;

&lt;cfset testVar = testVarXML /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = testVarXML.users />

<pre>
<code>
&lt;cfset testVar = testVarXML.users /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#
<br />

<cfset testVar = testVarXML.users.XmlChildren[1] />

<pre>
<code>
&lt;cfset testVar = testVarXML.users.XmlChildren[1] /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#
<br />

<cfset testVar = XmlSearch(testVarXML, '//@active') />

<pre>
<code>
&lt;cfset testVar = XmlSearch(testVarXML, '//@active') /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar[1]#">

<br/>

#decisionTest(testVar[1])#
<br />

</body>
</html>
</cfoutput>