<cfinvoke component="mxunit.runner.DirectoryTestSuite"   
	method="run"  
	directory="#expandPath('.')#"   
	recurse="false"   
	excludes="" 
	componentPath="coldfire.tests.mxunit" 
	returnvariable="results" />  

<cfoutput> #results.getResultsOutput('extjs')# </cfoutput> 