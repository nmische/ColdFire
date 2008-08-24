<cffunction name="decisionTest" output="true" returntype="void">

	<cfargument name="testVar" type="any" required="true" />
	
	<table border="1">
		<thead>
			<tr>
				<th scope="col">Test</th>
				<th scope="col">Result</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>IsArray (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsArray(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsBinary (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsBinary(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsBoolean (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsBoolean(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsCustomFunction (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsCustomFunction(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsDate (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsDate(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsDDX (8)</td>
				<td>
					<cftry>
					#IsDDX(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsJSON (8)</td>
				<td>
					<cftry>
					#IsJSON(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsNumeric (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsNumeric(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsNumericDate (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsNumericDate(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsObject (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsObject(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsPDFFile (8)</td>
				<td>
					<cftry>
					#IsPDFFile(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsPDFObject (8)</td>
				<td>
					<cftry>
					#IsPDFObject(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsQuery (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsQuery(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsSimpleValue (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsSimpleValue(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsStruct (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsStruct(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsWDDX (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsWDDX(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsXML (MX 7, 8)</td>
				<td>
					<cftry>
					#IsXML(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsXmlAttribute (MX 7, 8)</td>
				<td>
					<cftry>
					#IsXmlAttribute(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>
			<tr>
				<td>IsXmlDoc (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsXmlDoc(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsXmlElem (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsXmlElem(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsXmlNode (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsXmlNode(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
			<tr>
				<td>IsXmlRoot (MX 6.1, MX 7, 8)</td>
				<td>
					<cftry>
					#IsXmlRoot(testVar)#
						<cfcatch type="any">
							Error: #cfcatch.message#
						</cfcatch>				
					</cftry>
				</td>
			</tr>	
		</tbody>
	</table>

</cffunction>