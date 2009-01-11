
<cfparam name="url.suggestvalue" default=""/>
<cfparam name="url.lastName" default=""/>

<cfif url.lookup eq "lastName">
	<!--- The function must return suggestions as an array. --->
    <cfset myarray = ArrayNew(1)>
    <!--- Get all unique last names that match the typed characters. --->
    <cfquery name="getDBNames" datasource="cfdocexamples">
    SELECT DISTINCT LASTNAME FROM Employees
    WHERE LASTNAME LIKE <cfqueryparam value="#url.suggestvalue#%"
        cfsqltype="cf_sql_varchar">
    </cfquery>

    <cfloop query="getDBNames">
        <cfset arrayAppend(myarray, lastname)>
    </cfloop>
	
    <cfset result = myarray>
	
<cfelseif url.lookup eq "firstName">
	<cfset myarray = ArrayNew(1)>
    <cfquery name="getFirstNames" datasource="cfdocexamples">
    <!--- Get the first names that match the last name and the typed characters. --->
    SELECT FIRSTNAME FROM Employees
    WHERE LASTNAME = <cfqueryparam value="#lastName#"
        cfsqltype="cf_sql_varchar">
    AND FIRSTNAME LIKE <cfqueryparam value="#suggestvalue & '%'#"
        cfsqltype="cf_sql_varchar">
    </cfquery>

    <cfloop query="getFirstNames">
        <cfset arrayAppend(myarray, Firstname)>
    </cfloop>
	
    <cfset result = myarray>
	
</cfif>

<cfif IsDefined("result")>
<cfcontent type="text/plain" reset="true"/>
<cfoutput>#SerializeJSON(result)#</cfoutput>
</cfif>

 