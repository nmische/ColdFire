<cfif thisTag.ExecutionMode eq "start">
	<cfif not StructKeyExists(attributes, "ms")>
		<cfabort showerror="The sleep tag requires the ms attribute.">
	</cfif>
<cfelseif thisTag.ExecutionMode eq "end">
	<cfset thread = CreateObject("java", "java.lang.Thread")>
	<cfset thread.sleep(attributes.ms)>
</cfif>
