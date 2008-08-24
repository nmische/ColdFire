<cfset loadPaths = ArrayNew(1) />
<cfset loadPaths[1] = ExpandPath(".") & "/mxunit/commons-lang-2.4.jar" />
<cfset javaloader = createObject("component", "javaloader.JavaLoader").init(loadPaths) />
<cfset StringUtils = javaloader.create("org.apache.commons.lang.StringUtils") />
<cfoutput>#StringUtils.difference("govern", "government")#</cfoutput>


<h3>YesNoFormat Example</h3>
<p>The YesNoFormat function returns non-zero values as "Yes"; zero, false and no Boolean values, and empty strings ("") as "No".

<cfoutput>
<ul>
   <li>YesNoFormat(1):   #YesNoFormat(1)#
   <li>YesNoFormat(0):   #YesNoFormat(0)#
   <li>YesNoFormat("1123"):   #YesNoFormat("1123")#
   <li>YesNoFormat("No"):   #YesNoFormat("No")#
   <li>YesNoFormat(True):   #YesNoFormat(True)#
</ul>
</cfoutput>


<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	LASTNAME
FROM
	ARTISTS
WHERE
	LASTNAME = <cfqueryparam value="Buntel" cfsqltype="cf_sql_varchar" /> 
</cfquery>

<cfset o = CreateObject("java","java.lang.String")>


<cfdump var="#o.getClass().getFields()#">



<cfset methods = o.getClass().getMethods()>

<cfset methodStruct = StructNew() />
<cfset methodArray = ArrayNew(1) />

<cfloop from="1" to="#ArrayLen(methods)#" index="i">	
	<cfset methodString = methods[i].getName() & "(" />
	<cfset params = methods[i].getParameterTypes()>
	<cfset delim = ""/>
	<cfloop from="1" to="#ArrayLen(params)#" index="x">
		<cfset methodString = methodString & delim & " " & params[x].getCanonicalName() />
		<cfset delim = "," />
	</cfloop>
	<cfset methodString = methodString & ")" />	
	<cfset methodStruct[methods[i].getName()] = StructNew() />
	<cfset methodStruct[methods[i].getName()].method = methodString />	
	<cfset methodStruct[methods[i].getName()].retrunType = methods[i].getReturnType().getCanonicalName() />
</cfloop>

<cfset sortedKeys = StructSort(methodStruct,"textnocase","asc","method") />

<cfloop from="1" to="#ArrayLen(sortedKeys)#" index="i">
	<cfset ArrayAppend(methodArray,methodStruct[sortedKeys[i]]) />
</cfloop>

<cfdump var="#methodArray#">


<cfset fields = o.getClass().getFields()>

<cfset fieldStruct = StructNew() />
<cfset fieldArray = ArrayNew(1) />

<cfloop from="1" to="#ArrayLen(fields)#" index="i">	
	<cfset fieldStruct[fields[i].getName()] = StructNew() />
	<cfset fieldStruct[fields[i].getName()].field = fields[i].getType().getName() & " " & fields[i].getName() />	
	<cfset fieldStruct[fields[i].getName()].value = fields[i].getType().getName() />
</cfloop>

<cfset sortedKeys = StructSort(fieldStruct,"textnocase","asc","field") />

<cfloop from="1" to="#ArrayLen(sortedKeys)#" index="i">
	<cfset ArrayAppend(fieldArray,fieldStruct[sortedKeys[i]]) />
</cfloop>

<cfdump var="#fieldArray#">

