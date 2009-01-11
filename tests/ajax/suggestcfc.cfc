<cfcomponent>

    <cffunction name="getLNames" access="remote" returntype="array" output="false">
        <cfargument name="suggestvalue" required="true">
        <!--- The function must return suggestions as an array. --->
        <cfset var myarray = ArrayNew(1)>
        <!--- Get all unique last names that match the typed characters. --->
        <cfquery name="getDBNames" datasource="cfdocexamples">
        SELECT DISTINCT LASTNAME FROM Employees
        WHERE LASTNAME LIKE <cfqueryparam value="#suggestvalue#%"
            cfsqltype="cf_sql_varchar">
        </cfquery>
	
        <cfloop query="getDBNames">
            <cfset arrayAppend(myarray, lastname)>
        </cfloop>
        <cfreturn myarray>
    </cffunction>

    <cffunction name="getFNames" access="remote" returntype="array"
            output="false">
        <cfargument name="suggestvalue" required="true">
        <cfargument name="lastName" required="true">
        <cfset var myarray = ArrayNew(1)>
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
        <cfreturn myarray>
    </cffunction>
    
 </cfcomponent>