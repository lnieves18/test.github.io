
///////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2004 Microsoft Corporation.  All Rights Reserved.
//	This documentation is only for the internal, personal use by customers who have
//	licensed the Microsoft eLearning Library or who are entitled to use the
//	eLearning benefits provided via Microsoft's Software Assurance program.
//	It may not be modified or distributed outside of your organization.
//
// 	File: ScormCode.js
//
// 	Description: Contains the script that causes a hosting page to initiate and terminate an LMS session.
//
///////////////////////////////////////////////////////////////////////////////////////////////////

var g_oAPI = null;

//--------------------------------------------------------------------
// Function: window.onload
//
// Purpose: Initializes LMS session
//
// Parameters: None
//
// Returns: null
//--------------------------------------------------------------------
/*
// This section was placed into contentLoader.js
function window.onload()
{
	if(g_oAPI==null)
	{
		g_oAPI = FindLMSAPI();
		if (g_oAPI) g_oAPI.LMSInitialize('');
	}
}
*/
//--------------------------------------------------------------------
// Function: Initialize
//
// Purpose: Initializes LMS session--can be called prior to onload event
//          if necessary
// Parameters: None
//
// Returns: null
//--------------------------------------------------------------------
function Initialize()
{
	if(g_oAPI==null)
	{
		g_oAPI = FindLMSAPI();
		if (g_oAPI) g_oAPI.LMSInitialize('');
	}
}
//--------------------------------------------------------------------
// Function: window.onunload
//
// Purpose: Finalizes LMS session
//
// Parameters: None
//
// Returns: null
//--------------------------------------------------------------------
window.onunload=function()
{

	// Close down the LMS.
	if ( g_oAPI ) {
		// If the LMS supports assessments.
		if ( scoAssessment!=null && scoAssessment.getLmsSupport() ) {
			// If there are any unfinished assessment items in the SCO.
			if ( !scoAssessment.allAssessmentsComplete() ) {
				// If there are no unfinished assessment items in the SCO, mark as complete and finish.
				if (g_oAPI) g_oAPI.LMSSetValue( "cmi.core.lesson_status", "incomplete" );
				if (g_oAPI.LMSGetLastError()!= "301")
				    if (g_oAPI) g_oAPI.LMSFinish('');
			} else {
				// If there are no unfinished assessment items in the SCO, mark as complete and finish.
				if (g_oAPI) g_oAPI.LMSSetValue( "cmi.core.lesson_status", "completed" );
				if (g_oAPI.LMSGetLastError()!= "301")
				    if (g_oAPI) g_oAPI.LMSFinish('');
			}
		} else {
			// If no assessments are supported, mark the SCO as completed and finish.
			if (g_oAPI) g_oAPI.LMSSetValue( "cmi.core.lesson_status", "completed" );
			if (g_oAPI.LMSGetLastError()!= "301")
			    if (g_oAPI) g_oAPI.LMSFinish('');
		}
	}

    try{
	// Close any popup windows that we have generated.
	while (dynamicWindows.length > 0) {
		var windowToDestroy = dynamicWindows.pop();
		windowToDestroy.close();
		delete windowToDestroy;
	}
	}catch(e){}
}



// Save and retreive the cmi.comments value for the current SCO.
function lmsSet_Notes(notesString) {
	var status = g_oAPI.LMSSetValue("cmi.comments", notesString);
	if (status == "false") {
		// This LMS does not support notes.
		return false;
	} else {
		return true;
	}
}
function lmsGet_Notes() {
	if (g_oAPI != null) {
		var notes = g_oAPI.LMSGetValue("cmi.comments");
		if (g_oAPI.LMSGetLastError() == "0") {
			return notes;
		} else {
			// This LMS does not support notes.
			return "false";
		}
	} else {
		return "";
	}
}
// Set the notes for a particular page in a SCO.
function setScoNotes(pageUri, scoManifestUri, pageNotesString) {

	// Get this SCO's notes.
	var currentScoNotes = lmsGet_Notes();
	// If this LMS does not support notes.
	if (currentScoNotes == "false") {
		alert(gStrings.notes_lmsNoSupport);
	} else {

		// The delimiter that will divide each page's notes within the greater SCO notes string.
		var pageDelimiter = "*$^%";
		// Load the lessonManifest.
		var lessonManifest = new XmlDom();
		var success = lessonManifest.load(scoManifestUri);

		// Define the total number of pages within the SCO.
		var totalPagesArray = lessonManifest.selectNodes("//topic/@uri");
		var totalPages = totalPagesArray.length;
		var currentPagePosition;

		// Determine the position of the current page within the SCO pages.
		for (var i = 0; i < totalPages; i++) {
			if (totalPagesArray[i].value == pageUri) {
				currentPagePosition = i;
			}
		}

		// If no notes are already stored.
		if (currentScoNotes.length == 0) {
			currentScoNotes = new Array(totalPages);
		} else {
			currentScoNotes = currentScoNotes.split(pageDelimiter);
			if (currentScoNotes.length != totalPages) {
				alert(gStrings.notes_lmsErrorRetrieve);
			}
		}

		// Set the value of this sco's notes.
		currentScoNotes[currentPagePosition] = pageNotesString;
		// Collapse the sco notes array back into a string.
		var currentScoNotesMinusDelimeters = currentScoNotes.join('');
		currentScoNotes = currentScoNotes.join(pageDelimiter);
		// If we are trying to store more notes than cmi.comments can contain (4096 byte limit).
		if (currentScoNotes.length > 4000) {
			alert(gStrings.notes_lmsExceededSpace);
		} else {
			// If there are no characters to save, set cmi.comments to an empty string.
			if (currentScoNotesMinusDelimeters.length == 0) {
				currentScoNotes = '';
			}
			var success = lmsSet_Notes(currentScoNotes);
			if (success == false) {
				alert(gStrings.notes_lmsErrorSaving);
			}
		}
	}
}
// Get the notes for a particular page in a SCO.
function getScoNotes(pageUri, scoManifestUri) {

	// Get this SCO's notes.
	var currentScoNotes = lmsGet_Notes();
	// If this LMS does not support notes.
	if (currentScoNotes == "false") {
		return gStrings.notes_lmsNoSupport;
		// return false;
	}
	// If no notes are already stored.
	if (currentScoNotes.length == 0) {
		return "";
	} else {

		// Load the lessonManifest.
		var lessonManifest = new XmlDom();
		lessonManifest.load(scoManifestUri);
		// Define the total number of pages within the SCO.
		var totalPagesArray = lessonManifest.selectNodes("//topic/@uri");
		var totalPages = totalPagesArray.length;
		var currentPagePosition;
		// Determine the position of the current page within the SCO pages.
		for (var i = 0; i < totalPages; i++) {
			if (totalPagesArray[i].value == pageUri) {
				currentPagePosition = i;
			}
		}

		// The delimiter that will divide each page's notes within the greater SCO notes string.
		var pageDelimiter = "*$^%";
		var currentScoNotes = currentScoNotes.split(pageDelimiter);
		if (typeof(currentScoNotes[currentPagePosition]) == "undefined") {
			return gStrings.notes_lmsErrorRetrieve;
			// return false;
		} else {
			return currentScoNotes[currentPagePosition];
		}
	}
}

function saveNotes() {
	// Before closing this SCO, save the last page's notes.
	setScoNotes(contentPageUri(), getLessonManifestUri(), document.getElementById('notesContent').value);
}

// Initialize the SCO
Initialize();

// SIG // Begin signature block
// SIG // MIIbDwYJKoZIhvcNAQcCoIIbADCCGvwCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFM83v30VI6hh
// SIG // 2NnCYnCmmfun6GaCoIIV6jCCBIUwggNtoAMCAQICCmEF
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
// SIG // gjcCARUwIwYJKoZIhvcNAQkEMRYEFAwoIw7wFXvipnkd
// SIG // nxQOwdZcfiLfMF4GCisGAQQBgjcCAQwxUDBOoCaAJABN
// SIG // AGkAYwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4A
// SIG // Z6EkgCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVh
// SIG // cm5pbmcgMA0GCSqGSIb3DQEBAQUABIIBAC3ob1KIwbTb
// SIG // bT3LVnmq0bXsvIjBj0zvkXqyngObwGK7CKw5szY5MUeG
// SIG // tLwVS6061+VNr8UJSevCtwdZHbYRC8UvvGjWs2dDmyDC
// SIG // O9Jadv2I70W/V/GglxZtTSUAiaW/CGGfSBP4Ffs3I0kd
// SIG // 4up1AM2thlK1IG1P5kkAoy8wl6mVh7RuMHtveHAdJj5j
// SIG // rCRIx8MVq+yQgvOoKzk/Y02VCdWPSZGmGJWjLi/Rq/rX
// SIG // d9YhAc/Iu8TlLJVyG2lSax+iN+NaQcbs2dKw7rviXq+q
// SIG // no5V/rLc8HdyTWDl42WIdxLKmZFFTNEpq+xsiYGrGUUG
// SIG // Rp3fh/mehACin35qoqsyvuKhggIdMIICGQYJKoZIhvcN
// SIG // AQkGMYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBAgphFrUpAAAAAAAQMAcGBSsOAwIaoF0wGAYJ
// SIG // KoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0B
// SIG // CQUxDxcNMTAwNjI5MTYzMjEzWjAjBgkqhkiG9w0BCQQx
// SIG // FgQUH8XlbinGTDEpecgJUBZPK5iK4O0wDQYJKoZIhvcN
// SIG // AQEFBQAEggEATAPLM+WDVP0LNRHLfVw5B3+EC0dHzVjf
// SIG // tnfFH+OU6XIkUgh4sUt2b30DzYmL54oyLZq0b04R/hlM
// SIG // ZyaC3qzuewwrn8pUmQdusxzK/doDgM7EnGwz8ICMPvk9
// SIG // Ucgqz8PIx/BAoa4a4AEGBzMFXDFva/Cmmv7yE8tQV394
// SIG // xpHXDWdqqHlvErxmFiWYSnULGXTxbJRarB0DrtoP2bcz
// SIG // 9WM7XJ8j24OKCGRxdPWhuqSSHbcwEKNb3ln0jH4zbK96
// SIG // IM4NnVkIU4bev4YsGEfaYidXPnaX54QsJd5Niy42wrD4
// SIG // eAPLp0nDJUK4l3HSB8D7VqJPfvsKh8xwvrr1VuZJiCWA6g==
// SIG // End signature block
