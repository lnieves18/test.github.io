
ScoAssessment = function( apiAdapterRef )
{
	this.construct( apiAdapterRef );
}

ScoAssessment.prototype =
{
	_apiAdapterRef: null,
	_lmsSupport: false,
	_courseSupport: false,

	_scoAssessmentDetails: null,

	construct: function( apiAdapterRef ) {

		_apiAdapterRef = null;
		_lmsSupport = false;
		_courseSupport = false;

		if ( apiAdapterRef ) {
			_apiAdapterRef = apiAdapterRef;

			// If the settings.xml file specifies that assessments should be persisted on the LMS.
			_courseSupport = ( gSettings.assessments_persistResultsInLms == "true" );
			if ( _courseSupport ) {

				// Determine and store LMS assessment support.
				_lmsSupport = this.queryLmsAssessmentSupport();
				if ( this.getLmsSupport() ) {

					// Set up the SCO's assessment details XML object.
					this.setScoAssessmentDetails();
				}
			}
		}
	},

	getLmsSupport: function() {
		return _lmsSupport;
	},
	getCourseSupport: function() {
		return _courseSupport;
	},

    getAssessmentId: function(assessmentPageOffset) {

    //item's SCO id is set with the  assesmentPageOFfset
        var assessmentId = Number(assessmentPageOffset);
		return assessmentId;
	},


// private
	queryLmsDataElementSupport: function( dataElement ) {
		// Attempt to retrieve the value of the specified data element.
		_apiAdapterRef.LMSGetValue( dataElement );
		// If this attemped retrieval does not result in an error, then the specified data element is supported.
		if ( _apiAdapterRef.LMSGetLastError() != "401")
			return true;
		else
			return false;
	},
	queryLmsAssessmentSupport: function() {
		var assessmentIdSupport = this.queryLmsDataElementSupport( "cmi.interactions.0.id" );
		var assessmentTimestampSupport = this.queryLmsDataElementSupport( "cmi.interactions.0.time" );
		var assessmentTypeSupport = this.queryLmsDataElementSupport( "cmi.interactions.0.type" );
		var assessmentLearnerResponseSupport = this.queryLmsDataElementSupport( "cmi.interactions.0.student_response" );
		var assessmentResultSupport = this.queryLmsDataElementSupport( "cmi.interactions.0.result" );

		// debug
		//return true;

		// If all required assessment data model elements are supported by the LMS.
		if ( assessmentTypeSupport && assessmentTimestampSupport && assessmentIdSupport &&
			assessmentLearnerResponseSupport && assessmentResultSupport )
			return true;
		else
			return false;
	},

	setScoAssessmentDetails: function() {

		// If this LMS doesn't supports assessments, then exit.
		if ( !this.getLmsSupport() )
			return;

		// Initialize the data structure.
		_scoAssessmentDetails = new XmlDom();

		// Check to see if this SCO's assessment details are stored in the SCO suspend_data
		var suspendData = _apiAdapterRef.LMSGetValue( "cmi.suspend_data" );

		// If there is content within the suspend data
		if ( String( suspendData ).length > 0 ) {

			_scoAssessmentDetails.loadXML( suspendData );

		// Otherwise, build the _scoAssessmentDetails from scratch.
		} else {

			// Set the root element as a <sco/> element.
			var rootElement = _scoAssessmentDetails.createElement( "sco" );

			// Get an array of all the topic uris in the SCO.

			// Keep track of the total number of assessment items.
			var totalAssessmentItems = 0;
            //Get the Topic Uri from the globally set Variable.
            var topicUri = requestedContentUri + ".xml";
				var topicElement = _scoAssessmentDetails.createElement( "topic" );
				// Set the uri attribute of the <topic/> element to its uri.
				topicElement.setAttribute( "uri", topicUri );

				// Open each content page.
				var topicXmlDom = new XmlDom();
				topicXmlDom.load( topicUri );

				// Define the template types of all the assessments on this page.
				var topicTemlateType = topicXmlDom.selectSingleNode( "/topic/@type" ).value;
				// Trim the version number from the template name.
				topicTemlateType = topicTemlateType.slice( 0, -3 );

				// Create an array of all assessment items on the page.
				var topicAssessmentItems = topicXmlDom.selectNodes( "//assessment/item[descendant::text()]" );// only pick populated assessments - that have any text nodes as children

				// Add an <assessment/> element and required attributes for each corresponding page assessment element.
				for ( var j = 0; j < topicAssessmentItems.length; ++j ) {

					var assessmentElement = _scoAssessmentDetails.createElement( "assessment" );

					// Retrieve and normalize the assessment type.
					//	SCORM 1.2 allowable values are: true-false, choice, fill-in, numeric, likert, matching, performance, sequencing
					//    SCORM 2004 allowable values are: true_false, multiple_choice, fill_in, long_fill_in, matching, performance, sequencing, likert, numeric, other

					switch ( topicTemlateType ) {
						case "multipleChoice":
							var assessmentType = "choice";
							break;
						case "essayQuestion":
							var assessmentType = "fill-in";
							break;
						case "trueFalse":
							var assessmentType = "true-false";
							break;
					}
					assessmentElement.setAttribute( "type", assessmentType );

// 					// Add the assessment question as an element to the assessmentDetails node tree.  This is for SCORM 2004 support.
// 					var questionElement = topicAssessmentItems[j].selectSingleNode( "./question" );
// 					assessmentElement.appendChild( questionElement );

					// If the assessment result has been persisted in the LMS, add this attribute to the element.
					var lmsInteractionName = "cmi.interactions." + totalAssessmentItems + ".result";
					var assessmentResult = _apiAdapterRef.LMSGetValue( lmsInteractionName );

					if ( assessmentResult )
						assessmentElement.setAttribute( "result", assessmentResult );

					topicElement.appendChild( assessmentElement );

					// Increment the total number of assessment items.
					++totalAssessmentItems;
				}
				rootElement.appendChild( topicElement );
			// Append the root element to the XmlDom.
			_scoAssessmentDetails.appendChild( rootElement );
		}
	},

    setLmsAssessmentLearnerResponse: function( assessmentPageOffset, learnerResponse, correctResponse) {

		// Insert the learnerResponse into the sco assessment details.
        var currentElementSelection = "/sco/topic/assessment[" + (assessmentPageOffset + 1) + "]";
		var assessmentElement = _scoAssessmentDetails.selectSingleNode( currentElementSelection );
		assessmentElement.setAttribute( "learnerResponse", learnerResponse );
		if ( typeof correctResponse != "undefined" ) {
		    assessmentElement.setAttribute( "correctResponse", correctResponse );
		}

		// Set the result -- passed, failed, neutral
		if ( typeof correctResponse != "undefined" ) {
			// Determine the result of the assessment.
			if (isNaN(correctResponse))
			    var assessmentResult = ( correctResponse == learnerResponse );
			else
			    var assessmentResult = Number( correctResponse ) == Number( learnerResponse );
			 // SCORM 2004 becomes "incorrect" vs. "correct"
			assessmentResult = assessmentResult ? "correct" : "wrong";
		} else {
			var assessmentResult = "neutral";
		}
		// Add the assessment result to the _scoAssessmentDetails node tree.
		assessmentElement.setAttribute( "result", assessmentResult );

		// Get the assessment's id.
        var assessmentId = this.getAssessmentId(assessmentPageOffset);

		// Grab the current time.
		var responseTime = new Date();

		// Convert the current time into a timestamp for the LMS.
		var year = String( responseTime.getFullYear() );
		var month = String( responseTime.getMonth() );
		month = month.length < 2 ? "0" + month : month;
		var day = String( responseTime.getDay() );
		day = day.length < 2 ? "0" + day : day;
		var hours = String( responseTime.getHours() );
		hours = hours.length < 2 ? "0" + hours : hours;
		var minutes = String( responseTime.getMinutes() );
		minutes = minutes.length < 2 ? "0" + minutes : minutes;
		var seconds = String( responseTime.getSeconds() );
		seconds = seconds.length < 2 ? "0" + seconds : seconds;
		// For future SCORM 2004 timestamp
		var responseTimeStamp = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
		// CMITime
		var responseTime = hours + ":" + minutes + ":" + seconds;

		// Get the assessment's type.
		var assessmentType = assessmentElement.getAttribute( "type" );
		
		if (assessmentType == "fill-in")
		{
		    var regexPattern = /[^a-zA-Z0-9\s]/g;
            learnerResponse = learnerResponse.replace( eval(regexPattern), "" );
		}

// 		// Retrieve the assessment's question. This is for SCORM 2004 implementation.
// 		var questionElement = assessmentElement.selectSingleNode( "./question" );
// 		var questionString = new String();
// 		for ( var i=0; i < questionElement.childNodes.length; ++i )
// 			questionString += questionElement.childNodes[i].xml;

        var interactionId;
        interactionId = _apiAdapterRef.LMSGetValue("cmi.interactions._count");
        if ( _apiAdapterRef.LMSGetLastError() != "0")
			interactionId = 0;
			
		var interactionsPrefix = "cmi.interactions." + interactionId + ".";
		
		// Persist all the above values to the LMS.
		_apiAdapterRef.LMSSetValue( interactionsPrefix + "id", assessmentId );
		_apiAdapterRef.LMSSetValue( interactionsPrefix + "time", responseTime );
		_apiAdapterRef.LMSSetValue( interactionsPrefix + "type", assessmentType );
		_apiAdapterRef.LMSSetValue( interactionsPrefix + "student_response", learnerResponse );// 2004 "learner_response"
		_apiAdapterRef.LMSSetValue( interactionsPrefix + "result", assessmentResult );



		// 201
//		_apiAdapterRef.LMSSetValue( interactionsPrefix + "description", questionString );

		// Persist the correct response to the LMS.
//		_apiAdapterRef.LMSSetValue( interactionsPrefix + "correct_responses.0.count", 1 );
//		_apiAdapterRef.LMSSetValue( interactionsPrefix + "correct_responses.0.pattern", correctResponse );



		// Persist the SCO's assessment node tree as suspend data so that it can be retrieved later.
		_apiAdapterRef.LMSSetValue( "cmi.suspend_data", _scoAssessmentDetails.documentElement.xml );
		// Do an LMS commit.
		_apiAdapterRef.LMSCommit();

		// If this SCO contains scoring assessments.
		if ( this.scoContainsScoringAssessments() ) {
			// If there are no other scoring assesssments left to finish in this SCO.
			if ( this.scoringAssessmentsComplete() ) {

				// Get the average score.
				var scoScore = this.getAssessmentAverage();

				// Persist the sco score in the LMS.
				this.setLmsScore( scoScore );
			}
		}
	},
	
    getAssessmentCompletionStatus: function(assessmentPageOffset) {
		// Get the assessment's completion status.
        var itemTypeXpathSelection = "/sco/topic/assessment[" + (assessmentPageOffset + 1) + "]";
		var assessmentElement = _scoAssessmentDetails.selectSingleNode( itemTypeXpathSelection );

		if ( assessmentElement == null || !assessmentElement.getAttribute( "result" ) )
			return false;
		else
			return true;
	},
	
    getAssessmentResult: function(assessmentPageOffset) {
		// Get the assessment's completion status.
        var itemTypeXpathSelection = "/sco/topic/assessment[" + (assessmentPageOffset + 1) + "]";
		var assessmentElement = _scoAssessmentDetails.selectSingleNode( itemTypeXpathSelection );

		return assessmentElement.getAttribute( "result" );
	},
	
    getAssessmentLearnerResponse: function(assessmentPageOffset) {

		// Get the assessment's completion status.
        var assessmentSelection = "/sco/topic/assessment[" + (assessmentPageOffset + 1) + "]";
		var assessmentElement = _scoAssessmentDetails.selectSingleNode( assessmentSelection );

		return assessmentElement.getAttribute( "learnerResponse" );
	},
	
	scoContainsScoringAssessments: function() {
		// Retrieve any assessments that score that don't have a "result" attribute set.
		var unfinishedScoredItemXpathSelection = "//assessment[@type='choice' or @type='true-false']";
		var unfinishedScoredItems = _scoAssessmentDetails.selectNodes( unfinishedScoredItemXpathSelection );

		// If there are no unfinished scored items, then return true - all scoring assessments are completed.
		if ( unfinishedScoredItems == null || unfinishedScoredItems.length == 0 )
			return false;
		else
			return true;
	},
	
	scoringAssessmentsComplete: function() {

		// Retrieve any assessments that score that don't have a "result" attribute set.
		var unfinishedScoredItemXpathSelection = "//assessment[@type='choice' or @type='true-false'][not(@result)]";
		var unfinishedScoredItems = _scoAssessmentDetails.selectNodes( unfinishedScoredItemXpathSelection );

		// If there are no unfinished scored items, then return true - all scoring assessments are completed.
		if ( unfinishedScoredItems == null || unfinishedScoredItems.length == 0 )
			return true;
		else
			return false;
	},
	
	allAssessmentsComplete: function() {
		// Retrieve any assessments that score that don't have a "result" attribute set.
		var unfinishedItemXpathSelection = "//assessment[not(@result)]";
		var unfinishedItems = _scoAssessmentDetails.selectNodes( unfinishedItemXpathSelection );

		// If there are no unfinished scored items, then return true - all scoring assessments are completed.
		if ( unfinishedItems == null || unfinishedItems.length == 0 )
			return true;
		else
			return false;
	},
	
	getAssessmentAverage: function() {

		// Retrieve any assessments that score that don't have a "result" attribute set.
		var itemsCorrectXPathSelection = "//assessment[@result='correct']";
		var correctItems = _scoAssessmentDetails.selectNodes( itemsCorrectXPathSelection );

		var itemsIncorrectXPathSelection = "//assessment[@result='wrong']";
		var incorrectItems = _scoAssessmentDetails.selectNodes( itemsIncorrectXPathSelection );

		if ( correctItems == null || correctItems.length == 0 )
			var correctItemsCount = 0;
		else
			var correctItemsCount = Number( correctItems.length );

		if ( incorrectItems == null || incorrectItems.length == 0 )
			var incorrectItemsCount = 0;
		else
			var incorrectItemsCount = Number( incorrectItems.length );

		var totalCount = correctItemsCount + incorrectItemsCount;
		var percentageCorrect = Math.round( ( correctItemsCount / totalCount ) * 100 );

		return percentageCorrect;
	},
	
	setLmsScore: function( scoAveragedScore ) {

		_apiAdapterRef.LMSSetValue( "cmi.core.score.min", 0 );
		_apiAdapterRef.LMSSetValue( "cmi.core.score.max", 100 );
		_apiAdapterRef.LMSSetValue( "cmi.core.score.raw", scoAveragedScore );
	}
}


// SIG // Begin signature block
// SIG // MIIbDwYJKoZIhvcNAQcCoIIbADCCGvwCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFCi+shczZ/0G
// SIG // QM2QF8aaCNSmUKw8oIIV6jCCBIUwggNtoAMCAQICCmEF
// SIG // 9x4AAAAAADIwDQYJKoZIhvcNAQEFBQAweTELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENv
// SIG // ZGUgU2lnbmluZyBQQ0EwHhcNMDkwNzEzMjMwMDE4WhcN
// SIG // MTAxMDEzMjMxMDE4WjCBgzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAtYypnJSEYRrMLiLEoJNkCd6F
// SIG // obCQXfzJbGi18e/8jmv0+KBu11HeYKMnY9T237ZM0kUL
// SIG // pz3Yb/7tpxhj0x/GgdS/BzeXQCt/519aNdmTT6vzKpLw
// SIG // po2B7AUk3Nu4YWNTYQI1ONa49e57VKbJWDXp9BXv2gds
// SIG // BS1NpLa6mzu4MTB+RbypoSU5DEOkRzuXnCBEcjfPUKBN
// SIG // TfTDZdxE0Qg7ON0+xRdsRsetcyTAj4nB6uq6zWipEtZY
// SIG // DFMWDP45A9aB8j5cV/N622bhBxjZGQMU9uZFmSpRTJDX
// SIG // Wu+vtzsMKU1tIK4Ht5Iu6GnKnzBC58MyigsiSjLonAzG
// SIG // UQMmAW2ScwIDAQABo4IBAjCB/zATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDAzAdBgNVHQ4EFgQUh4G33+76d/pZBWM3BArX
// SIG // 6dqg4OAwDgYDVR0PAQH/BAQDAgeAMB8GA1UdIwQYMBaA
// SIG // FFdFdBxdsPbIQwXgjFQtjzKn/kiWMEkGA1UdHwRCMEAw
// SIG // PqA8oDqGOGh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL0NvZGVTaWdQQ0EuY3JsME0G
// SIG // CCsGAQUFBwEBBEEwPzA9BggrBgEFBQcwAoYxaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9Db2Rl
// SIG // U2lnUENBLmNydDANBgkqhkiG9w0BAQUFAAOCAQEANiGE
// SIG // 9Y+DIU2HqD+L58WkD0wwbll0mwuXdBapsfNwpK/CDDMk
// SIG // 86BK+sHkIca22epcW5Fh9yJt/zH8F07XzUDjndLltNL6
// SIG // jWwH2neayivuDVlHzwTCEGf66ulDO7fm0ZzZjiNgbhKb
// SIG // w9l+XFcy3ZQN333FSJJNSHa3osBTlT78OqOTfPKFBMfG
// SIG // hTiXNvgSkyIAmU55r5brWiCDrNBcWjCwAOJrOY8kido9
// SIG // DKRGeWI2U2rXyc2SCPuH5VT1fFnFxHd9sMEsmMeXbEOn
// SIG // +CD4g1RknmD44kqlZ9RJv1SIfVJE81HAJtHFfPCJ1hEJ
// SIG // KMJFRYAdkCK9jqIFPjyzT73XOeCIkzCCBM0wggO1oAMC
// SIG // AQICCmEWtSkAAAAAABAwDQYJKoZIhvcNAQEFBQAwdzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBMB4XDTEwMDEwNDIxMTIw
// SIG // M1oXDTEzMDEwNDIxMjIwM1owgbYxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xEDAOBgNVBAsTB25DaXBoZXIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjpBQ0QzLUFFNjYtRTBCNTEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAOMoqtk8Q0L4BhO64sf5wS9ZyzyV51SQbMNYlWKz
// SIG // D2y9g9stWIgIkgvbzXbHVsbg7irTiDtcyqlwowAjIixT
// SIG // OOhQx/EUCY0dy3yL9aYza6/IRl9Le17556bHL0KFZzaN
// SIG // YEryE2bcsDltzhDK3XIFWHKd8gA7ADntJlM+Hs3uUJLN
// SIG // hfQ6/YGhBV8L6UQO79VZQCYoy4JOTivIFCK7cB3kPdH9
// SIG // YHZUTDns73c4i4z+dK/nFvRwMbjLrdTdi7b6AK3tdBSw
// SIG // Rb78ZYjhrfxJ21/R1M50edSNhm+z9ZcHIS2aYcn8uhtM
// SIG // 0uiruVDk0yv0wdlN1kCsFKeIhXNeaD5jt0HUZr0CAwEA
// SIG // AaOCARkwggEVMB0GA1UdDgQWBBTh8K4PDQX8MvMcfRl/
// SIG // z8TFv5FVTTAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0B
// SIG // AQUFAAOCAQEAjVtJKFSHyYqpk/6b+I1UcSCdwDiTJym5
// SIG // y5ZTios1tZQ3Fli9nj4XJ19ZL+Rdfh3iWdwH+2IY5WO/
// SIG // 9AvPTdpbMPbImv8mWb8ZwxCy8OMewQyZ2lWSxswS38BY
// SIG // TN2a1B0j+YYSROcmAuiAQWgWVDYdp2WzxDOh46SY2b5i
// SIG // kE+SN7apiBdUSB+dwiLYciq5wzCTPjfsKam5zgvVwskW
// SIG // pudeVQ3MgYRh6SwD25umG1MCOIsKWJEXyHFwFs4uxmP8
// SIG // eZ+DBIK0gecvV2mtuKUfIzZ29hWUhgoe6t0RO2ZE0hVa
// SIG // z6YrKB9OxQpzV0uVA2Ci6+kyfr09j6a9SSopwVcxwBDf
// SIG // UTCCBgcwggPvoAMCAQICCmEWaDQAAAAAABwwDQYJKoZI
// SIG // hvcNAQEFBQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZ
// SIG // MBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UE
// SIG // AxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0
// SIG // aG9yaXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIxMDQwMzEz
// SIG // MDMwOVowdzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UE
// SIG // AxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBMIIBIjAN
// SIG // BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn6Fssd/b
// SIG // SJIqfGsuGeG94uPFmVEjUK3O3RhOJA/u0afRTK10MCAR
// SIG // 6wfVVJUVSZQbQpKumFwwJtoAa+h7veyJBw/3DgSY8InM
// SIG // H8szJIed8vRnHCz8e+eIHernTqOhwSNTyo36Rc8J0F6v
// SIG // 0LBCBKL5pmyTZ9co3EZTsIbQ5ShGLieshk9VUgzkAyz7
// SIG // apCQMG6H81kwnfp+1pez6CGXfvjSE/MIt1NtUrRFkJ9I
// SIG // AEpHZhEnKWaol+TTBoFKovmEpxFHFAmCn4TtVXj+AZod
// SIG // UAiFABAwRu233iNGu8QtVJ+vHnhBMXfMm987g5OhYQK1
// SIG // HQ2x/PebsgHOIktU//kFw8IgCwIDAQABo4IBqzCCAacw
// SIG // DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUIzT42VJG
// SIG // cArtQPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGGMBAGCSsG
// SIG // AQQBgjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2AFA6sgmBA
// SIG // VieX5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYKCZImiZPy
// SIG // LGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWljcm9z
// SIG // b2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWtTHNY9AcT
// SIG // LmUwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDovL2NybC5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvbWlj
// SIG // cm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUFBwEBBEgw
// SIG // RjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRSb290Q2Vy
// SIG // dC5jcnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZI
// SIG // hvcNAQEFBQADggIBABCXisNcA0Q23em0rXfbznlRTQGx
// SIG // LnRxW20ME6vOvnuPuC7UEqKMbWK4VwLLTiATUJndekDi
// SIG // V7uvWJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciNSOLwUxXd
// SIG // T6uS5OeNatWAweaU8gYvhQPpkSokInD79vzkeJkuDfcH
// SIG // 4nC8GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiLID/iBxoy
// SIG // +cwxSnYxPStyC8jqcD3/hQoT38IKYY7w17gX606Lf8U1
// SIG // K16jv+u8fQtCe9RTciHuMMq7eGVcWwEXChQO0toUmPU8
// SIG // uWZYsy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oYemIp76Kb
// SIG // KTQGdxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOkqHQ1uE7F
// SIG // cSMSJnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkhgJ4VMGbo
// SIG // QhJeGsieIiHQQ+kr6bv0SMws1NgygEwmKkgkX1rqVu+m
// SIG // 3pmdyjpvvYEndAYR7nYhv5uCwSdUtrFqPYmhdmG0bqET
// SIG // pr+qR/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQCPS2vWY+4
// SIG // 5CHltbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZkocTdSIv
// SIG // MqgIbqBbjCW/oO+EyiHW6x5PyZruSeD3AWVviQt9yGnI
// SIG // 5m7qp5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJE6P9MIIG
// SIG // gTCCBGmgAwIBAgIKYRUIJwAAAAAADDANBgkqhkiG9w0B
// SIG // AQUFADBfMRMwEQYKCZImiZPyLGQBGRYDY29tMRkwFwYK
// SIG // CZImiZPyLGQBGRYJbWljcm9zb2Z0MS0wKwYDVQQDEyRN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkwHhcNMDYwMTI1MjMyMjMyWhcNMTcwMTI1MjMzMjMy
// SIG // WjB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTCCASIwDQYJ
// SIG // KoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ+N34U3jLEG
// SIG // VmY2TtQK6zYjkR6vq41Y6cTPwZ86CiTExMResO4VFMX6
// SIG // PpkzaxlpcvR8BV/lmSVE1zUZipDcKI6QDO/VkGGt3twY
// SIG // cC2DyW+vhSz43bm5MP1xeByD/cipuYJnDXq4wQnCvBaX
// SIG // Vz8cmNNp1zCQkJCNMB/YJtSee4jZ4gntl0lF6wRSgXV7
// SIG // uLUiuC5Wu9fPqU48CoOiqDrFrbYBDmrPIrQjH2zVJ+e3
// SIG // fsG01TKteSUcQobinYX0V9obWS8tJpIpxbPXhaOeYFqU
// SIG // 5nuce16CNEtt/9TuJ9Ci3NGQDM59DhV8iKw0x8BsmIRK
// SIG // yUR5aCjfIoMNuIosSGHi/hECAwEAAaOCAiMwggIfMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRXRXQcXbD2
// SIG // yEMF4IxULY8yp/5IljALBgNVHQ8EBAMCAcYwDwYDVR0T
// SIG // AQH/BAUwAwEB/zCBmAYDVR0jBIGQMIGNgBQOrIJgQFYn
// SIG // l+UlE/wq4QpTlVnkpKFjpGEwXzETMBEGCgmSJomT8ixk
// SIG // ARkWA2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29m
// SIG // dDEtMCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlm
// SIG // aWNhdGUgQXV0aG9yaXR5ghB5rRahSqClrUxzWPQHEy5l
// SIG // MFAGA1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jv
// SIG // c29mdHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYw
// SIG // RAYIKwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQu
// SIG // Y3J0MHYGA1UdIARvMG0wawYJKwYBBAGCNxUvMF4wXAYI
// SIG // KwYBBQUHAgIwUB5OAEMAbwBwAHkAcgBpAGcAaAB0ACAA
// SIG // qQAgADIAMAAwADYAIABNAGkAYwByAG8AcwBvAGYAdAAg
// SIG // AEMAbwByAHAAbwByAGEAdABpAG8AbgAuMBMGA1UdJQQM
// SIG // MAoGCCsGAQUFBwMDMA0GCSqGSIb3DQEBBQUAA4ICAQAw
// SIG // vLAgpGKgp+85JmE93KzGmdCGxC71gzJlXiI+m9aG+Oi2
// SIG // n8qL1jt1C6GRPkzdZHSMSfKIjBhnbP4VZka4OkZCl8iR
// SIG // N9Qksees0+pBFIN308lPBV+jFFK/lqQvPlZbEHXOU8PO
// SIG // BVRptGXJJKUP4SW4GrlN5QK5UB5Ps5gMHZUC7iJZrSLL
// SIG // BXQLBEV7BFng2A+z60z4YN3CeJ7Rup9r9/PufkQRQNK9
// SIG // uptLFghupL5V5KY4EqNI9BxVeoog0X3+kduUjy/Ce2um
// SIG // ZIVPo+UsNCldC7/1xzgvxCDEVjH2ac6F+AqR7NDWrro4
// SIG // BQzrbk9MnAMpqqL8GKApDA1cXFYjV9oclg3IJjbBRMvl
// SIG // 4eZvieeP6Zi1c9N44+2jATx05V68bPYhiWcF7JedtbH9
// SIG // r6bpcqXDNOEvn/n0ajniLQSCW/zQnK58nRH55rVTGXS6
// SIG // OUo5631Cs0o7Nz3CSnsnmOfiTpsbSlQ4aiM3vmq3SO7q
// SIG // Qg1JJJGOtwQul2/k50W7j039YNnXWcLYgNZgNHu3oZMg
// SIG // /oG4qqVcCemKDb4oTX7X6A/tZXjRMV+5ZtvfQucLzAIH
// SIG // jd//IAajRWW0szKNLpHiTbSpyfq8awQOsp/qn96kyQqW
// SIG // 9I332Jio8IUCCFmkIKYsCxryUgbtaeVkGBvgo6veynwU
// SIG // YUO4ZfU2o1UTK2csTRswTDGCBJEwggSNAgEBMIGHMHkx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jv
// SIG // c29mdCBDb2RlIFNpZ25pbmcgUENBAgphBfceAAAAAAAy
// SIG // MAkGBSsOAwIaBQCggb4wGQYJKoZIhvcNAQkDMQwGCisG
// SIG // AQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQB
// SIG // gjcCARUwIwYJKoZIhvcNAQkEMRYEFEHYihhqPBvgeGmr
// SIG // cYko7v95e3cqMF4GCisGAQQBgjcCAQwxUDBOoCaAJABN
// SIG // AGkAYwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4A
// SIG // Z6EkgCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVh
// SIG // cm5pbmcgMA0GCSqGSIb3DQEBAQUABIIBADg4NxhxfGuZ
// SIG // 3STpIYCWq89VNRZ1kAIQEuFKgi9o3CtIKQcUZaSM+AVK
// SIG // tOU6ZLydB1gI3g7PiqlTqiJXNmUp8uiPrjLO0G917ENT
// SIG // T8sNMX9pIoaZ0cQEPrpdB3/eOWt/tqQ+3JaxdaK9tc2P
// SIG // G5xGdfEBhIha5R89LlDEn+NoXn1MoCHYiCsiRW/qfcVm
// SIG // sRoU6RzWUzdLRhDaD5x3RbbvTBgpmrVlRVJBUkAPbjcw
// SIG // xfyOYba1PMvmT1NXjOsntfy12ZAkLdh3u7iIHPcFrq9b
// SIG // juSVS445Lh2hFVd8v9v6piLc/OXL7+R+h0cGPRv5te4E
// SIG // ONNlqzDJaq5VrzfaO5gEokOhggIdMIICGQYJKoZIhvcN
// SIG // AQkGMYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBAgphFrUpAAAAAAAQMAcGBSsOAwIaoF0wGAYJ
// SIG // KoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0B
// SIG // CQUxDxcNMTAwMjE5MjIzNzIwWjAjBgkqhkiG9w0BCQQx
// SIG // FgQUvuf8M4G3wE7Yddjpr69Qx/tyjBcwDQYJKoZIhvcN
// SIG // AQEFBQAEggEALlGiglT0tpKIWfDlsywS5jupQccVpNDw
// SIG // 3Ipfzs6DR9a44JhKEjAq5GbQk3mDj/qu//6tz7qqEfim
// SIG // Rd6aKO8oFM1uWL+Y3mBcoMS/x6sMRNSTdZsug3PYSt+D
// SIG // qZ+dHkENmy6+b+vKuSnXq+Mpfn30bc4KobY44+geT+4n
// SIG // bEOuLl7Auek5hwzjXhCr7amOKDA0TnvfHQn+BWjJ2FWB
// SIG // JkMUQtrelsD9CqPhIxh6JxX4JLN2C+MR4Yg+D6fEETiV
// SIG // azWpL5MQI5rIayt1lQ74nMsyZhxqLYSod6jKPg6XnETC
// SIG // t/rGitYhpNf1NRFgYb8NHeiggDUeb4eVt8yK3ndO9b5jBA==
// SIG // End signature block
