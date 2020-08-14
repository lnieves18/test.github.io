/*
* FUNCTIONS USED FOR THE SCO TO MANAGE SCORM DATA AND OTHER SCO FUNCTIONS
* Copyright 2008 e-Learning Consulting All Rights Reserved
* www.e-learningconsulting.com
* The use of this code is specified by the End-User License Agreement
*/

/* Global variables start with an underscore "_" */
var _sSep = "^^";               /* the separator used to store the suspend data */

/* Global variables used in the API, these should not be modified by the author */
var _bTerminated = false;  /* true if we have called termSCO() */
var _bReadState = false;   /* true if we have read in the state information */
var _aComments = new Array(); /* an array to hold the comments */

// create the SCORM RTE for the SCOS to call
API = new Object;
API.LMSInitialize     = LMSInitialize;
API.LMSFinish         = LMSFinish;
API.LMSSetValue       = LMSSetValue;
API.LMSGetValue       = LMSGetValue;
API.LMSGetLastError   = LMSGetLastError;
API.LMSGetErrorString = LMSGetErrorString;	
API.LMSCommit         = LMSCommit;
API.LMSGetDiagnostic  = LMSGetDiagnostic;

/*
* This function is called when the launch page of the SCO is loaded
*/
function initSCO() {
	/* tell SCORM API we have started the SCO session */
	initCommunications();
	
	/* remember the start time so we can record the duration of this session when the SCO session ends */
	startSessionTime();
	
	/* see if this is the first launch of the SCO by this learner */
	if (isFirstLaunch()) {
		/* it is, set the status to incomplete so the LMS knows the learner is not done with this SCO yet */
		setCompletionStatus("incomplete");
		
		/* we will need to get the bookmark in the next session so tell the LMS that the learner may return in the future */
		learnerWillReturn(true);
		
		// navigate to the first page
		navMoveToIndex(0);
	} else {
		// not the first launch,get the suspend data
		var sData = getSuspendData();
		
		// convert the suspend data string to an array
		var aData = sData.split(",");
		
		// get the length of the array
		var nTotal = aData.length;
		
		// loop through the array
		for (var i=0; i<nTotal; i++) {
			// restore the status in the node
			_navCourseNodes[i].status = aData[i] -0;
			
			// restore the image for the node
			_navSetStatusImageByNode(document.getElementById(_navCourseNodes[i].navStatusId), _navCourseNodes[i]);
		}
		
		// get the bookmark (the bookmark was set in a previous session)
		var sBookmark = getBookmark();
		
		// go to the bookmarked page
		navMoveToIndex(sBookmark-0);
		
		// load the comments
		loadState();
	}
}

/*
* The frameset has received an onunload or onbeforeunload event. So, it is time to end the SCO session
*/
function termSCO() {
	/* see if we have already called this function */
	if (!_bTerminated) {
		/* we have not, so set this var to make sure we do this only once */
		_bTerminated = true;
		
		/* record the session time */
		setSessionTime(_timeSessionStart);
		
		// init a var to keep track of completed nodes
		var nComplete = 0;
		
		// init a string to store the node status
		var sData = "";
		
		// get the number of nodes
		var nTotal = _navCourseNodes.length;
		var isLessonNode;
		// loop through the list of nodes
		for (var i=0; i<nTotal; i++) {
			
			isLessonNode = false;
			
			//see if we have info in course data
			if (sData != "") {
				// we do, add a comma before the next value
				sData += ",";
			}
			
			// add the node status
			sData += _navCourseNodes[i].status;
			
			//check for lesson node
			if(_navCourseNodes[i].hasChildren == true && _navCourseNodes[i].parent!= null)
			{
			    isLessonNode = true;
			}
			// see if this node is complete, any visited status will do
			if ((_navCourseNodes[i].status > _NAV_Status_None) ||(_navCourseNodes[i].status == _NAV_Status_None && isLessonNode == true && !_bLessonEnabled)) {
				// it is, increment the completed count
				nComplete++;
			}
		}

        //Below is to fix the Glossary issue
        //Check if all of the nodes are complete 
        //OR Except one lesson and topic everything is completed and that is of type glossary
        //OR Except one topic everything is completed and that is of type glossary
        //if (nComplete == nTotal || (nComplete == nTotal-1 && _navCourseNodes[nTotal-1].status == _NAV_Status_None) ) {
		if (nComplete == nTotal || (nComplete > nTotal - 3)) {
        var isCompleted= false;
        if (nComplete < nTotal) {
            //there could be maximum of 2 items as Glossary, one for Lesson and one for Topic.
            //check whether the incomplete nodes are of type Glossary.
            var topic1 = "";
            var topic2 = "";
            //find which are all the topics not completed.
            for (var topicCount = 0; topicCount < _navCourseNodes.length; topicCount++) {
                if ((_navCourseNodes[topicCount].status == _NAV_Status_None && _navCourseNodes[topicCount].hasChildren == false) ||
                    (_navCourseNodes[topicCount].status == _NAV_Status_None && _bLessonEnabled)) {
                    if (topic1 == "")
                        topic1 = _navCourseNodes[topicCount];
                    else {
                        topic2 = _navCourseNodes[topicCount];
                        break;
                    }
                }
            }

            isCompleted = checkCompletion(topic1) && checkCompletion(topic2);

        } else
            isCompleted = true;
        if (isCompleted) {
            // the course is complete, so tell the LMS the course is complete and the learner will not return
            setCompletionStatus("completed");
            learnerWillReturn(false);
        }
		}
		
		// save the completed node info in suspend data
		setSuspendData(sData);
		
		// save the comments from the state array
		stateToComments();
			
		/* tell SCORM we are done with this SCO session */
		termCommunications();	
	}
}

function checkCompletion(topic) {
    var isCompleted = false;
    //check whether it is lesson/glossary
    if (topic != null && topic != "") {
        if (topic.hasContent == false)//lesson does not have content in this.
            isCompleted = true;
        else {
            //check for the xml
            var myXml = new XmlDom();
            myXml.load("course\\" + topic.url.substring(topic.url.indexOf("#") + 1) + ".xml");
            if (myXml.selectSingleNode("topic/@type").value == "glossary000" || myXml.selectSingleNode("topic/@type").value == "")
                isCompleted = true;
            myXml = null;
        }
    } else
        isCompleted = true;
    return isCompleted;
}
/*
* Remember a state value associated with this id
* The state information is held in a javascript array
*/
function setState(sId,sValue) {
	/* make sure the state data is loaded */
	loadState();
	
	/* set the state */
	_aComments[sId] = sValue;
}

/*
* Get the state value of this id
*/
function getState(sId) {
	/* make sure the state data is loaded */
	loadState();
	
	/* see if there is an ID in the state array */
	if (_aComments[sId]) {
		/* there is, return it */
		return _aComments[sId];
	} else {
		/* there is no ID, return an empty string */
		return "";
	}
}

/*
* Set the comments
* we do this by flattening the data stored in the state array
*/
function stateToComments() {
	/* buffer for the state arrray */
	var sComments = "";
	
	/* loop through the array */
	for (var i in _aComments) {
		sComments += i + _sSep + _aComments[i] + _sSep;
	}
	
	/* see if there is any data to set */
	/* we will have data to set if there was state information set on this page */
	if (sComments != "") {	
		/* there is, store this with SCORM */
		setCommentsData(sComments);
	}
}

/*
* Load the comment data into our state array
*/
function loadState() {
	/* see if we have read in information from cmi.comments */
	if (!_bReadState) {
		/* we have not, read it in now */
		_bReadState = true;
		var sComments = getCommentsData();
		
		/* load the data into a temp array */
		var aParts = sComments.split(_sSep);
		
		/* loop through the array */
		for (var i=0; i<aParts.length; i=i+2) {
			/* see if we have an id */
			if (aParts[i] != "") {
				/* we do, copy the data to the state array */
				_aComments[ aParts[i] ] = aParts[i+1];
			}
		}
	}
}

function LMSInitialize(sVal) {
	//alert("LMSInitialize");
	return "true";
}
function LMSFinish(sVal) {
	//alert("LMSFinish");
	return "true";
}
function LMSSetValue(sItem, sData) {
	//alert("LMSSetValue(" + sItem + "," + sData + ")");
	
	// handle specific SCORM data items
	switch (sItem) {
		case "cmi.core.lesson_status":
			// we have a completion status, see if the SCO is complete
			if (sData == "completed" || sData == "passed" || sData == "failed") {
				// it is, see if there is a previous node
				if (_navPreviousCourseNode != null) {
					// we have a previous node, update the last node selected's status
					_navPreviousCourseNode.status = _NAV_Status_Complete;
					
					// reset its image
					_navSetStatusImageByNode(document.getElementById(_navPreviousCourseNode.navStatusId), _navPreviousCourseNode);
				} else {
					// no previous node, this happens when the course is closed and only one node has been selected, so complete the current node
					_navCurrentCourseNode.status = _NAV_Status_Complete;
				}
			}
			break;
			
		case "cmi.comments":
			// remember this comment in the state array
			setState(_navCurrentCourseNode.index, sData);
			break;
	}
	
	return "true";
}
function LMSGetValue(sItem) {
	//alert("LMSGetValue(" + sItem + ")");
	
	// handle specific SCORM data items
	switch (sItem) {
		case "cmi.comments":
			// return the correct comment from the state array
			return getState(_navCurrentCourseNode.index);
			break;
	}
	return "";
}
function LMSGetLastError() {
	//alert("LMSGetLastError");
	return "0";
}
function LMSGetErrorString() {
	//alert("LMSGetErrorString");
	return "";
}	
function LMSCommit(sVal) {
	//alert("LMSCommit");
	return "true";
}
function LMSGetDiagnostic() {
	//alert("");
	return "";
}
// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFBbtzmBOHJu8
// SIG // xl1AdSeciPhSETUEoIIV5zCCBIUwggNtoAMCAQICCmEI
// SIG // d18AAAAAAEowDQYJKoZIhvcNAQEFBQAweTELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENv
// SIG // ZGUgU2lnbmluZyBQQ0EwHhcNMTAwNzE5MjI1MzEwWhcN
// SIG // MTExMDE5MjI1MzEwWjCBgzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAzH6Ae0H6i7RNmSlD3eb4Ut9b
// SIG // Qpe9Mxmc77Xa0MDc6PG3vlzhCrLCNaB+5PPUOKfyD0Jy
// SIG // p7qbzx8k3lYNhHPM02P3F82vaW9hTUyAT8h3HFFkyNME
// SIG // 8xQms7hCPzNDsNsmWViTtW2JYg8HVlvVEqCxCcwWK/mM
// SIG // 32FW6AZ4f9dziCYDZ9Gj/zSCrC1M2ALs7W+5ojHFMky7
// SIG // 9v1fYlte8fZkkceFd0cc9qcrRy0LN1RPth8EjbXsYCen
// SIG // 8362fKFMkaaLcdbGNWFHvMEVS92sMyK+BhmWS4oebgDr
// SIG // vh5p3VhZIQMrPL7mEwUXZjWnhi0a8dk0wAGAGvyaRp1u
// SIG // pOdI3DXqNwIDAQABo4IBAjCB/zATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDAzAdBgNVHQ4EFgQU5G9fyon5U77wcFcGUKrC
// SIG // eQ2sVpswDgYDVR0PAQH/BAQDAgeAMB8GA1UdIwQYMBaA
// SIG // FFdFdBxdsPbIQwXgjFQtjzKn/kiWMEkGA1UdHwRCMEAw
// SIG // PqA8oDqGOGh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL0NvZGVTaWdQQ0EuY3JsME0G
// SIG // CCsGAQUFBwEBBEEwPzA9BggrBgEFBQcwAoYxaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9Db2Rl
// SIG // U2lnUENBLmNydDANBgkqhkiG9w0BAQUFAAOCAQEAlkFd
// SIG // PVwrpM64KkUvQgJeoZAcTHQnCc4LVH1wKEFyO6QVvNEE
// SIG // Ulevd3RtC1VXhzcQSR7W5tTCY5S0/aQuLfpf4hlZFYTZ
// SIG // t7bpUqJS3iNfIC9Z06sahH8d473qD98BiDkl2O1kYRkb
// SIG // eq+mFEpGUEjZckvVS5Ld8A+EfMvTxvJMeG79vP9mEAr3
// SIG // A10V6l6YDAnSmY8utSC9YebJbwUUEct7+0IIvQPxJldn
// SIG // TY9Zi7hEx0XTYgQMLTADWF7sSPRuqBQxBP00orgELQLd
// SIG // OqEJXq1hsY9wwHhVI2Oon1l3otu5G3EoHPwu4QSPte80
// SIG // vkqZR+NkUhY8+r3g6OAUDBAiNIKCHjCCBMowggOyoAMC
// SIG // AQICCmED3PYAAAAAAAwwDQYJKoZIhvcNAQEFBQAwdzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBMB4XDTA4MDcyNTE5MTI1
// SIG // MFoXDTExMDcyNTE5MjI1MFowgbMxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsTHm5D
// SIG // aXBoZXIgRFNFIEVTTjoxNTlDLUEzRjctMjU3MDElMCMG
// SIG // A1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vydmlj
// SIG // ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
// SIG // AMDtgRShXnfAW/R2iWL6rXxoFLT3vTXYE3laF8rZbFFF
// SIG // YiZ6Lx/Y6sFuARf5w6YfZ9tRsCzeihft/yCtNOqY+6XW
// SIG // KtLxRCcHWi06k/9WU7DI9fMD8knMFtD1AExY+Jv1ByWx
// SIG // ZhfAvcjSUoWNwis4ssM2vvmH2vSOXUPXBr+ZBZ+kzv6r
// SIG // jWFj5znF8xj22PwxNmlyWqIaTD7qhyVCndE+8ZfSGDKT
// SIG // cFVTgR7jOw3ovoJ4beb6zZikb9vuZvSVyM01yZ67Ng2D
// SIG // lpQmp5DgqTQ71cCePvDUR42GDIKkWDA6HHbjrZVmtLf9
// SIG // CYoFYA+jD+KTllginJ0r26KUGJCVAr0GQJUCAwEAAaOC
// SIG // ARkwggEVMB0GA1UdDgQWBBTS7Q0eJLs3qdggak0d0hbV
// SIG // Lr6e6zAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7syuw
// SIG // wzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsGAQUF
// SIG // BwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRU
// SIG // aW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQUF
// SIG // AAOCAQEAnApVyMxEEzQM2GMndn0++jgyg1Od8gj5MvXF
// SIG // bnChybFjaxmdCWfZneuKattgZunpUibzO8Zq08JSvqi5
// SIG // 62qqeIzJFn2QlaDMIbOegb3NwYspvWIl7wlX54ZOKuyA
// SIG // yrv8IRbEP05SGeYOsdjBwnmQZLRQcxA1Xl0Rwbi6qs9S
// SIG // 9oCRAObvUUNG6dDolPYsJA2KxrIxiqN+NmykBUxnByq7
// SIG // uxClpTAactAGIDskk1sV2TmT03MtGsTUbB6hCOz2Mbhr
// SIG // S+zuXDMCFDKMfBEgLyADf/kMnbjTnl/WCPyBoJm4u1Vu
// SIG // zUJLOk2MFCvKyBLTYm7qDQqdCaNm2XlPjhqi/8yYBDCC
// SIG // BgcwggPvoAMCAQICCmEWaDQAAAAAABwwDQYJKoZIhvcN
// SIG // AQEFBQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcG
// SIG // CgmSJomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMk
// SIG // TWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9y
// SIG // aXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIxMDQwMzEzMDMw
// SIG // OVowdzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMY
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn6Fssd/bSJIq
// SIG // fGsuGeG94uPFmVEjUK3O3RhOJA/u0afRTK10MCAR6wfV
// SIG // VJUVSZQbQpKumFwwJtoAa+h7veyJBw/3DgSY8InMH8sz
// SIG // JIed8vRnHCz8e+eIHernTqOhwSNTyo36Rc8J0F6v0LBC
// SIG // BKL5pmyTZ9co3EZTsIbQ5ShGLieshk9VUgzkAyz7apCQ
// SIG // MG6H81kwnfp+1pez6CGXfvjSE/MIt1NtUrRFkJ9IAEpH
// SIG // ZhEnKWaol+TTBoFKovmEpxFHFAmCn4TtVXj+AZodUAiF
// SIG // ABAwRu233iNGu8QtVJ+vHnhBMXfMm987g5OhYQK1HQ2x
// SIG // /PebsgHOIktU//kFw8IgCwIDAQABo4IBqzCCAacwDwYD
// SIG // VR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUIzT42VJGcArt
// SIG // QPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGGMBAGCSsGAQQB
// SIG // gjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2AFA6sgmBAVieX
// SIG // 5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYKCZImiZPyLGQB
// SIG // GRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWljcm9zb2Z0
// SIG // MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBDZXJ0aWZp
// SIG // Y2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWtTHNY9AcTLmUw
// SIG // UAYDVR0fBEkwRzBFoEOgQYY/aHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvbWljcm9z
// SIG // b2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUFBwEBBEgwRjBE
// SIG // BggrBgEFBQcwAoY4aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNyb3NvZnRSb290Q2VydC5j
// SIG // cnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcN
// SIG // AQEFBQADggIBABCXisNcA0Q23em0rXfbznlRTQGxLnRx
// SIG // W20ME6vOvnuPuC7UEqKMbWK4VwLLTiATUJndekDiV7uv
// SIG // WJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciNSOLwUxXdT6uS
// SIG // 5OeNatWAweaU8gYvhQPpkSokInD79vzkeJkuDfcH4nC8
// SIG // GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiLID/iBxoy+cwx
// SIG // SnYxPStyC8jqcD3/hQoT38IKYY7w17gX606Lf8U1K16j
// SIG // v+u8fQtCe9RTciHuMMq7eGVcWwEXChQO0toUmPU8uWZY
// SIG // sy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oYemIp76KbKTQG
// SIG // dxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOkqHQ1uE7FcSMS
// SIG // JnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkhgJ4VMGboQhJe
// SIG // GsieIiHQQ+kr6bv0SMws1NgygEwmKkgkX1rqVu+m3pmd
// SIG // yjpvvYEndAYR7nYhv5uCwSdUtrFqPYmhdmG0bqETpr+q
// SIG // R/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQCPS2vWY+45CHl
// SIG // tbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZkocTdSIvMqgI
// SIG // bqBbjCW/oO+EyiHW6x5PyZruSeD3AWVviQt9yGnI5m7q
// SIG // p5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJE6P9MIIGgTCC
// SIG // BGmgAwIBAgIKYRUIJwAAAAAADDANBgkqhkiG9w0BAQUF
// SIG // ADBfMRMwEQYKCZImiZPyLGQBGRYDY29tMRkwFwYKCZIm
// SIG // iZPyLGQBGRYJbWljcm9zb2Z0MS0wKwYDVQQDEyRNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkw
// SIG // HhcNMDYwMTI1MjMyMjMyWhcNMTcwMTI1MjMzMjMyWjB5
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQTCCASIwDQYJKoZI
// SIG // hvcNAQEBBQADggEPADCCAQoCggEBAJ+N34U3jLEGVmY2
// SIG // TtQK6zYjkR6vq41Y6cTPwZ86CiTExMResO4VFMX6Ppkz
// SIG // axlpcvR8BV/lmSVE1zUZipDcKI6QDO/VkGGt3twYcC2D
// SIG // yW+vhSz43bm5MP1xeByD/cipuYJnDXq4wQnCvBaXVz8c
// SIG // mNNp1zCQkJCNMB/YJtSee4jZ4gntl0lF6wRSgXV7uLUi
// SIG // uC5Wu9fPqU48CoOiqDrFrbYBDmrPIrQjH2zVJ+e3fsG0
// SIG // 1TKteSUcQobinYX0V9obWS8tJpIpxbPXhaOeYFqU5nuc
// SIG // e16CNEtt/9TuJ9Ci3NGQDM59DhV8iKw0x8BsmIRKyUR5
// SIG // aCjfIoMNuIosSGHi/hECAwEAAaOCAiMwggIfMBAGCSsG
// SIG // AQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRXRXQcXbD2yEMF
// SIG // 4IxULY8yp/5IljALBgNVHQ8EBAMCAcYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zCBmAYDVR0jBIGQMIGNgBQOrIJgQFYnl+Ul
// SIG // E/wq4QpTlVnkpKFjpGEwXzETMBEGCgmSJomT8ixkARkW
// SIG // A2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEt
// SIG // MCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNh
// SIG // dGUgQXV0aG9yaXR5ghB5rRahSqClrUxzWPQHEy5lMFAG
// SIG // A1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jvc29m
// SIG // dHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYwRAYI
// SIG // KwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQuY3J0
// SIG // MHYGA1UdIARvMG0wawYJKwYBBAGCNxUvMF4wXAYIKwYB
// SIG // BQUHAgIwUB5OAEMAbwBwAHkAcgBpAGcAaAB0ACAAqQAg
// SIG // ADIAMAAwADYAIABNAGkAYwByAG8AcwBvAGYAdAAgAEMA
// SIG // bwByAHAAbwByAGEAdABpAG8AbgAuMBMGA1UdJQQMMAoG
// SIG // CCsGAQUFBwMDMA0GCSqGSIb3DQEBBQUAA4ICAQAwvLAg
// SIG // pGKgp+85JmE93KzGmdCGxC71gzJlXiI+m9aG+Oi2n8qL
// SIG // 1jt1C6GRPkzdZHSMSfKIjBhnbP4VZka4OkZCl8iRN9Qk
// SIG // sees0+pBFIN308lPBV+jFFK/lqQvPlZbEHXOU8POBVRp
// SIG // tGXJJKUP4SW4GrlN5QK5UB5Ps5gMHZUC7iJZrSLLBXQL
// SIG // BEV7BFng2A+z60z4YN3CeJ7Rup9r9/PufkQRQNK9uptL
// SIG // FghupL5V5KY4EqNI9BxVeoog0X3+kduUjy/Ce2umZIVP
// SIG // o+UsNCldC7/1xzgvxCDEVjH2ac6F+AqR7NDWrro4BQzr
// SIG // bk9MnAMpqqL8GKApDA1cXFYjV9oclg3IJjbBRMvl4eZv
// SIG // ieeP6Zi1c9N44+2jATx05V68bPYhiWcF7JedtbH9r6bp
// SIG // cqXDNOEvn/n0ajniLQSCW/zQnK58nRH55rVTGXS6OUo5
// SIG // 631Cs0o7Nz3CSnsnmOfiTpsbSlQ4aiM3vmq3SO7qQg1J
// SIG // JJGOtwQul2/k50W7j039YNnXWcLYgNZgNHu3oZMg/oG4
// SIG // qqVcCemKDb4oTX7X6A/tZXjRMV+5ZtvfQucLzAIHjd//
// SIG // IAajRWW0szKNLpHiTbSpyfq8awQOsp/qn96kyQqW9I33
// SIG // 2Jio8IUCCFmkIKYsCxryUgbtaeVkGBvgo6veynwUYUO4
// SIG // ZfU2o1UTK2csTRswTDGCBJEwggSNAgEBMIGHMHkxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jvc29m
// SIG // dCBDb2RlIFNpZ25pbmcgUENBAgphCHdfAAAAAABKMAkG
// SIG // BSsOAwIaBQCggb4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFKMOYGo6qoUJ8yKbBfq6
// SIG // 8a748eorMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBAK6iAoBf+tSMpzsh
// SIG // Sb5GftCYvuHAMPI/IOK3iMEpCJGNw1fXbu+NqZTEaInI
// SIG // OelSpH/befP3R/+EXOjNJS99csxv9QRB1VPp9NeMjIh4
// SIG // uqA/YpWYP/XBfaRWiyXMEOVVDmMxSqPXHtZc2T6LE3+D
// SIG // tc9E1cZu7n8k6Dhi4QDPOd8kTyvtpPAcpVswLm16ffef
// SIG // oxr5cZpwopFeNtKTncTcExr5gBGFbGs+chL55FwaoIuX
// SIG // qp5oivCL1bBv6d8Y/rn9Ig2Y7/0hAkhmOPLasQFjnTes
// SIG // IhXzz2ykbsmOlBrdeol3Qk5f6T3U9keXVcVWiLlwX6VW
// SIG // qsPfjapoMNNKoy6uhRqhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphA9z2AAAAAAAMMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTEwNjEwMTgyNDQ1WjAjBgkqhkiG9w0BCQQxFgQU
// SIG // MpZlQcfdPIwtMfn0R6Etfjx68+owDQYJKoZIhvcNAQEF
// SIG // BQAEggEAYbgawUxgMHNnPgUqXZbq7wdRhtBRGVPbjy6s
// SIG // lYrmNgfGCYUMB00cyaDLrBQSNUuTIQZFNdDlmblJMZZb
// SIG // yfISkMlRpCrR3k9TNkUFipCpwXDDwKdE4DX5wCnIeqJo
// SIG // xf+de5w6DNRRRk0O9GdN/KRUMwR4LRFYrC1AlToLhdJ7
// SIG // IHycWF26V5eg5Pfu45FVPFUWUqKKUdRN5wJ/tGQGsWQ5
// SIG // g66k/E51I8trv4m7lwQybm0m1HB7W4Af6HmSGtYNczUh
// SIG // tPI8YKd4UmWdQW1aJK/vhqSn9LXD/d6S+efZE7KpldDd
// SIG // TLClC8xnQa/X+hSpcvjgYSmgxjDwpP7OzL6bQKnhUA==
// SIG // End signature block
