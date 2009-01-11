<cfparam name="form.cfsetting" type="boolean" default="false">

<cfif form.cfsetting>
	<cfsetting showdebugoutput="false">
</cfif>

<html>
<head>
	<title>ColdFire Tests</title>
	
	<script type="text/javascript">
		window.onload = function(){
			console.log(window._coldfireForceDebug);
		};	
	</script>
	
</head>
<body>
<h1>Debugging Mode Tests</h1>

<cfoutput>IsDebugMode(): #IsDebugMode()#</cfoutput><br/>

<cfset factory = CreateObject("java","coldfusion.server.ServiceFactory")>
<cfset cfdebugger = factory.getDebuggingService().getDebugger()>	
<cfoutput>Debugger running: #IsDefined("cfdebugger")#</cfoutput><br/> 

<form action="index.cfm" method="POST">
	<fieldset>
		<legend>CFSETTING SHOWDEBUGOUTPUT FALSE</legend>
		<input type="hidden" name="cfsetting" value="true">
		<input type="submit">
	</fieldset>
</form>

<form action="index.cfm?_cf_nodebug=true" method="POST">
	<fieldset>
		<legend>_cf_nodebug URL PARAM TRUE</legend>
		<input type="submit">
	</fieldset>
</form>

<form action="index.cfm" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD TRUE</legend>
		<input type="hidden" name="_cf_nodebug" value="true">
		<input type="submit">
	</fieldset>
</form>

<form action="index.cfm?_cf_nodebug=true" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD FALSE AND URL PARAM TRUE</legend>
		<input type="hidden" name="_cf_nodebug" value="false">
		<input type="submit">
	</fieldset>
</form>

<form action="index.cfm?_cf_nodebug=false" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD TRUE AND URL PARAM FALSE</legend>
		<input type="hidden" name="_cf_nodebug" value="true">
		<input type="submit">
	</fieldset>
</form>

</body>
</html>