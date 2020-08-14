/*
* SCORM DEVELOPER'S TOOLKIT
* Copyright 2008 e-Learning Consulting All Rights Reserved
* www.e-learningconsulting.com
* The use of this code is specified by the End-User License Agreement
*/

/* Global variables start with an underscore "_" */
var _sAPI = ""; /* the name of the SCORM API "API" or "API_1484_11" */
var apiHandle = null; /* SCORM API */

/*
* call getAPI() to make sure we have set the apiHandle and _sAPI
*/
getAPI();

/* SESSION FUNCTIONS */

/*
* initilize the communications with the LMS
*/
function initCommunications() {
	scormInitialize();
}

/*
* terminate the communications with the LMS
*/
function termCommunications() {
	scormTerminate();
}

/*
* tell the LMS to restore the bookmark, suspend_data and other SCORM data items when the next session starts
*/
function learnerWillReturn(bWillReturn) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the exit data */
		if (bWillReturn)
			scormSetValue("cmi.exit", "suspend");
		else
			scormSetValue("cmi.exit", "normal");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, set the exit data */
		if (bWillReturn)
			scormSetValue("cmi.core.exit", "suspend");
		else
			scormSetValue("cmi.core.exit", "");
	}
}

/* LAUNCH CONDITIONS */

/*
* return true if this is the first launch of the SCO for the learner
*/
function isFirstLaunch() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, get the entry value */
		var sReturn = scormGetValue("cmi.entry");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the entry value */
		var sReturn = scormGetValue("cmi.core.entry");
	} else {
		/* no SCORM communications, this will always be the first launch */
		return true;
	}
	
	/* see if this is the first launch */
	if (sReturn != "ab-initio") {
		/* it is not the first laucnh */
		return false;
	}
	
	/* must be the first launch launch */
	return true;
}

/*
* return true if this is the first launch of the SCO for the learner
*/
function getLaunchData() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the launch data */
		return scormGetValue("cmi.launch_data");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the launch data */
		return scormGetValue("cmi.launch_data");
	
	} else {
		/* no SCORM communications */
		return "";
	}
}

/*
* return the credit value, "credit" or "no-credit"
*/
function getCredit() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the launch data */
		return scormGetValue("cmi.credit");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the launch data */
		return scormGetValue("cmi.core.credit");
	} else {
		/* no SCORM communications */
		return "credit";
	}
}

/*
* return the mode value, "browse", "normal" or "review"
*/
function getMode() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the launch data */
		return scormGetValue("cmi.mode");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the launch data */
		return scormGetValue("cmi.core.lesson_mode");
	} else {
		/* no SCORM communications */
		return "normal";
	}
}

/* TIME FUNCTIONS */

/* This global is set by a call to startSessionTime() - it contains the start time of this session */
_timeSessionStart = null;

/*
* Start the session time
*
*	Returns: the session start time in milliseconds
*/
function startSessionTime() {
	/* set a global to the start time, we will use this later to get the session time */
	_timeSessionStart = new Date();
	
	return _timeSessionStart;
}

/*
* set the session time
*	timeStart - the session start time in milliseconds
*/
function setSessionTime(timeStart) {
	/* get the current date and time */
	var dateNow = new Date();
	var timeNow = dateNow.getTime();
	
	/* calculate the elapsed time from the session start time to now */
	var timeElapsed = Math.round((timeNow - timeStart) / 1000);
	
	/* format the elapsed time */
	var sTime = formatTime(timeElapsed);
	
	/* see if this is SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is, set the session time */
		scormSetValue("cmi.session_time", sTime);
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, set the session time */
		scormSetValue("cmi.core.session_time", sTime);
	}
}

/*
* get the maximum time allowed for this SCO, this will return a time in seconds or an empty string ""
*/
function getMaxTimeAllowed() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the maximum time allowed */
		return scormGetValue("cmi.max_time_allowed");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the maximum time allowed */
		var sReturn = scormGetValue("cmi.student_data.max_time_allowed");
		
		/* see if this string is empty */
		if (sReturn == "") {
			/* it is, return it */
			return "";
		} else {
			/* this is a hhhh:mm:ss value, convert it */
			var aParts = sReturn.split(':');
			if (aParts.length == 3) {
				return "PT" + aParts[0] * 3600 + aParts[1] * 60 + (aParts[2] - 0) + "S";
			} else {
				return "";
			}
		}
	} else {
		/* no SCORM communications, return as if max time was not set in the manifest */
		return "";
	}
}

/*
* get the time limit action, returns
*	"exit,message"
*	"continue,message"
*	"exit,no message"
*	"continue,no message" (default)
*/
function getTimeLimitAction() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the data */
		return scormGetValue("cmi.time_limit_action");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the data */
		return scormGetValue("cmi.student_data.time_limit_action");
	} else {
		/* no SCORM communications */
		return "continue,no message";
	}
}

/*
* get the total time for all sessions
*/
function getTotalTime() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the total time */
		return scormGetValue("cmi.total_time");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the total time */
		var sReturn = scormGetValue("cmi.core.total_time");
		
		/* see if this string is empty */
		if (sReturn == "") {
			/* it is, return it */
			return "";
		} else {
			/* this is a hhhh:mm:ss value, convert it */
			var aParts = sReturn.split(':');
			if (aParts.length == 3) {
				return "PT" + aParts[0] * 3600 + aParts[1] * 60 + (aParts[2] - 0) + "S";
			} else {
				return "";
			}
		}
	} else {
		/* no SCORM communications */
		return "";
	}
}

/* STATE MANAGEMENT FUNCTIONS */

/*
* get the bookmark string, previously set
*/
function getBookmark() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the bookmark data */
		return scormGetValue("cmi.location");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the bookmark data */
		return scormGetValue("cmi.core.lesson_location");
	} else {
		/* no SCORM communications */
		return "";
	}
}

/*
* set the bookmark string
*/
function setBookmark(sLocation) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the bookmark data */
		scormSetValue("cmi.location", sLocation+"");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, set the bookmark data */
		scormSetValue("cmi.core.lesson_location", sLocation+"");
	}
}

/*
* get the suspend data string, previously set
*/
function getSuspendData() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11" || _sAPI == "API") {
		/* it is SCORM 2004 or SCORM 1.2, return the suspend data */
		return scormGetValue("cmi.suspend_data");
	} else {
		/* no SCORM communications */
		return "";
	}
}

/*
* set the suspend data string
*/
function setSuspendData(sSuspend) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11" || _sAPI == "API") {
		/* it is SCORM 2004, set the suspend data */
		scormSetValue("cmi.suspend_data", sSuspend+"");
	}
}

/*
* get thecomments previously set
*/
function getCommentsData() {
	/* see if this SCORM 1.2 */
	if (_sAPI == "API") {
		/* it is SCORM  1.2, return the comments */
		return scormGetValue("cmi.comments");
	} else {
		/* no SCORM communications */
		return "";
	}
}

/*
* set the comments string
*/
function setCommentsData(sSuspend) {
	/* see if this SCORM 1.2 */
	if (_sAPI == "API") {
		/* it is SCORM 1.2, set the comments */
		scormSetValue("cmi.comments", sSuspend+"");
	}
}

/* COMPLETION FUNCTIONS */

/*
* set the completion status to "completed", "incomplete", "not attempted", "unknown"
*/
function setCompletionStatus(sCompletion) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the completion status */
		scormSetValue("cmi.completion_status", sCompletion+"");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, see if this is a valid completion status for SCORM 1.2 */
		if (sCompletion == "completed" || sCompletion == "incomplete" || sCompletion == "not attempted") {
			/* this is a valid value, get the current value */
			var sReturn = scormGetValue("cmi.core.lesson_status");
			
			/* see it the completion value is already set to passed or failed (this is done with setPassFail())*/
			if (sReturn == "passed" || sReturn == "failed") {
				/* it is, see if we are trying to set the value to something other than completed */
				/* we do not want to replace pass/fail with completed */
				if (sCompletion == "incomplete" || sCompletion == "not attempted") {
					/* we are, set it */
					scormSetValue("cmi.core.lesson_status", sCompletion+"");
				}
			} else {
				/* not passed or failed, so OK to set */
				scormSetValue("cmi.core.lesson_status", sCompletion+"");
			}
		}
	}
}

/*
* get the completion status, "completed", "incomplete", "not attempted", "unknown"
*/
function getCompletionStatus() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the completion status data */
		return scormGetValue("cmi.completion_status");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the compltetion status */
		var sCompletion = scormGetValue("cmi.core.lesson_status");
		
		/* SCORM 1.2 only has a single data item to store completion and pass/fail */
		/* so check to see if we have a failed or passed status, if so return the status as completed */
		if (sCompletion == "passed" || sCompletion == "failed") {
			return "completed";
		} else {
			return sCompletion;
		}
	} else {
		/* no SCORM communications */
		return "not attempted";
	}
}

/*
* set the completion status to a value between 0 and 1
*/
function setCompletionPercentage(sProgress) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the completion percentage data */
		scormSetValue("cmi.progress_measure", sProgress+"");
	}
}

/*
* get the completion status, a value between 0 and 1 or "" if never set by the SCO
*/
function getCompletionPercentage() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the completion percentage data */
		return scormSetValue("cmi.progress_measure");
	}
	
	/* not defined in SCORM 1.2 so return "" */
	return "";
}

/*
* get the completion threshold, a value between 0 and 1 or "" if not defined
*/
function getCompletionThreshold() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the completion theshold data */
		return scormSetValue("cmi.completion_threshold");
	}
	
	/* not defined in SCORM 1.2 so return "" */
	return "";
}


/* PASS-FAIL FUNCTIONS */

/*
* set the completion status to "passed, "failed", "unknown"
*/
function setPassFail(sPassFail) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the success status */
		scormSetValue("cmi.success_status", sPassFail+"");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2,set the completion status */
		scormSetValue("cmi.core.lesson_status", sPassFail+"");
	}
}

/*
* get the completion status, "passed, "failed", "unknown"
*/
function getPassFail() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the success status data */
		return scormGetValue("cmi.success_status");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the completion status data */
		var sReturn = scormGetValue("cmi.core.lesson_status");
		
		/* see if the status is passed or failed */
		if (sReturn == "passed" || sReturn == "failed") {
			/* it is, return it */
			return sReturn;
		} else {
			/* another status, so return "unknown" */
			return "unknown";
		}
	} else {
		/* no SCORM communications */
		return "unknown";
	}
}


/* SCORE FUNCTIONS */

/*
* get the passing score string, -1 to 1 */
function getPassingScore() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the passing score data */
		return scormGetValue("cmi.scaled_passing_score");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, get the mastery score data */
		var sReturn = scormGetValue("cmi.student_data.mastery_score");
		
		/* see if we have a value */
		if (sReturn == "") {
			/* we do not, return the default of 1.0 */
			return "1.0";
		} else {
			/* we do, divide by 100 ot make it a value between 0 and 1 */
			sReturn = (sReturn / 100) + "";
			
			/* return it */
			return sReturn;
		}
	} else {
		/* no SCORM communications */
		return "1.0";
	}
}

/*
* set the score from a value of -1 to 1
*/
function setScore(sScore) {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, set the scaled score data */
		scormSetValue("cmi.score.scaled", sScore+"");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, set the min and max scores */
		scormSetValue("cmi.core.score.min", "0");
		scormSetValue("cmi.core.score.max", "100");
		
		/* see if this is a negative value */
		if ((sScore - 0) < 0) {
			/* it is, SCORM cannot handle a negative value so set the score to 0 */
			scormSetValue("cmi.core.score.raw", "0");
		} else {
			/* multiply by 100 to get it in the range from 0 to 100 */
			scormSetValue("cmi.core.score.raw", (sScore * 100)+"");
		}
	}
}

/*
* get the score string, previously set
*/
function getScore() {
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is SCORM 2004, return the scaled score data */
		return scormGetValue("cmi.scaled.score");
	} else if (_sAPI == "API") {
		/* it is SCORM 1.2, return the score in a range from 0 to 100 data */
		return (scormGetValue("cmi.core.score.raw") / 100) + "";
	} else {
		/* no SCORM communications */
		return "";
	}
}

/* INTERACTION FUNCTIONS */

/*
* set the interaction data except for the objective information
*	sNum - the # of the interaction to set. If this is null, the interaction will be added to the end of the collection (list) of interactions.
*	sId - the id of the interaction
*	sType - the type of the interaction, "true-false, "choice", "fill-in" "long-fill-in", "likert", "matching", "performance", "sequencing", "numeric", "other"
*	sResponse - the response provided by the learner
*	sCorrect - the correct answer
*	sResult - "correct", "incorrect", "unanticipated", "neutral" or "x.y" a character string containing a real number
*	sWeight - the weight of this question, can be null
*	nLatency - the time the learner took to respond to the question in milliseconds, can be null
*	sDescription - the description of this interaction, can be null
*	sIdObjective - the id of the objective, can be null
*/
function setInteraction(sNum,sId,sType,sResponse,sCorrect,sResult,sWeight,nLatency,sDescription,sIdObjective) {
	var nLen, aPairs;
	
	// see if we have a # of an interaction to set
	if (sNum == null) {
		// we do not, get the count of interactions from the LMS */
		sNum = scormGetValue("cmi.interactions._count");
	}

	/* see if this is SCORM 1.2 */
	if (_sAPI == "API") {
		/* it is, modify the responses from SCORM 2004 format to SCORM 1.2 format */
		
		/* see if the result is set to the word "incorrect" */
		if (sResult == "incorrect") {
			/* it is, set it to wrong */
			sResult = "wrong";
		}
		
		/* see if this is true-false */
		if (sType == "true-false") {
			/* it is, modify the responses from "true to "t", "false" to "f" */
			if (sResponse == "true") sResponse = "t";
			else if (sResponse == "false") sResponse = "f";
			
			/* modify the correct answer from "t" or "1" to "true, "f" or "0" to "false" */
			if (sCorrect == "true") sCorrect = "t";
			else if (sCorrect == "false") sCorrect = "f";
		} else if (sType == "choice" || sType == "sequencing") {
			/* this is a choice or sequencing interaction, see if there are [,] separators */
			if (sResponse.indexOf('[,]') != -1) {
				/* there are, replace [.] with commas */
				var aResponses = sResponse.split('[,]');
				sResponse = aResponses.join(',');
			}
			
			/* see if there are [,] separators for the correct answer */
			if (sCorrect.indexOf('[,]') != -1) {
				/* there are, replace them with commas */
				var aCorrect = sCorrect.split('[,]');
				sCorrect = aCorrect.join(',');
			}
		} else if (sType == "matching") {
			/* this is a matching interaction, see if there are [,] separators for the response */
			if (sResponse.indexOf('[,]') != -1) {
				/* there are, break them apart */
				var aResponses = sResponse.split('[,]');
				
				/* loop through the responses */
				nLen = aResponses.length;
				for (var i=0; i<nLen; i++) {
					/* see if the responses are separated by a [.] */
					if (aResponses[i].indexOf("[.]") != -1) {
						/* there are, replace them with a period */
						aPairs = aResponses[i].split("[.]");
						aResponses[i] = aPairs.join(".");
					}
				}
				
				/* recombine with commas */
				sResponse = aResponses.join(',');
			}
			
			/* see if there are [,] separators for the correct answer */
			if (sCorrect.indexOf('[,]') != -1) {
				/* there are, break them apart */
				var aCorrect = sCorrect.split('[,]');
				
				/* loop through the responses */
				nLen = aCorrect.length;
				for (var i=0; i<nLen; i++) {
					/* see if the responses are separated by a [.] */
					if (aCorrect[i].indexOf("[.]") != -1) {
						/* there are, replace them with a period */
						aPairs = aCorrect[i].split("[.]");
						aCorrect[i] = aPairs.join(".");
					}
				}
				
				/* recombine with commas */
				sCorrect = aCorrect.join(',');
			}
		} else if (sType == "numeric") {
			/* this is a numeric interaction, see if find a colon in the correct answer */
			if (sCorrect.indexOf() != -1) {
				/* we did, break it apart */
				aPairs = sCorrect.split("[:]");
				
				/* see if the first part contains a number */
				if (aPairs[0] != "") {
					/* it does, use it as the correct response */
					sCorrect = aPairs[0];
				} else {
					/* use the second number */
					sCorrect = aPairs[1];
				}
			}
		}
	}
		
	/* tell the LMS about the interaction */
	var sInt = "cmi.interactions." + sNum + ".";
	scormSetValue(sInt + "id", sId);
	scormSetValue(sInt + "type", sType);
	if (_sAPI == "API_1484_11")
		scormSetValue(sInt + "learner_response", sResponse);		
	else
		scormSetValue(sInt + "student_response", sResponse);
	scormSetValue(sInt + "correct_responses.0.pattern", sCorrect);
	scormSetValue(sInt + "result", sResult);
	var dateNow = new Date();
	if (_sAPI == "API_1484_11")
		scormSetValue(sInt + "timestamp", dateToTimestamp(dateNow));	
	else
		scormSetValue(sInt + "time", getHMS(dateNow));
				
	if (sWeight!=null) scormSetValue(sInt + "weighting", sWeight);
	if (nLatency!=null)   scormSetValue(sInt + "latency", nLatency+"");
	if (sDescription != null && _sAPI == "API_1484_11") scormSetValue(sInt + "description", sDescription);
	if (sIdObjective != null) scormSetValue(sInt + "objectives.0.id", sIdObjective);
}

/*
* Get the index of an interaction from its ID
*	sStart - the starting index - use "0" if you want to start from the beginning
*	sId - the ID of the interaction that you would like to find
*
*	RETURNS: always null for SCORM 1.2 (SCORM 1.2 cannot read interactions). The index of the interaction if we find a match, else null
*/
function getInteractionIndex(sStart, sId) {
	/* see if this is SCORM 1.2 */
	if (_sAPI == "API") {
		/* it is, we cannot read interactions in SCORM 1.2 so return a null */
		return null;
	}
	
	/* get the count of interactions */
	var nTotal = scormGetValue("cmi.interactions._count") - 0;
	
	/* the start number is a character value, convert to integer */
	var nStart = sStart - 0;
	
	/* see if the number of interactions is less than the starting index */
	if ((nTotal-1) < nStart) {
		/* it is, no more interactions past this start index */
		return null;
	}	
	
	/* loop through the collection of interactions */
	for (; nStart < nTotal; nStart++) {
		/* get the interaction ID */
		var sIdCurrent = scormGetValue("cmi.interactions." + nStart + ".id");
		
		/* see if this is a match */
		if (sIdCurrent == sId) {
			/* it is, return the index */
			return nStart + "";
		}
	}
	
	/* we did not find a match for the ID so return a NULL */
	return null;
}

/* OBJECTIVE FUNCTIONS */

/*
* Set an objective
*	sNum - the # of the objective to set. If this is null, the objective will be added at the end of the collection (list) of objectives.
*	sId - the ID of this objective
*	sCompletion - the completion status of the objective - "completed", "incomplete", "not attempted", "unknown"
*	sPercentComplete - the percent complete as a decimal value, 0 is 0% complete, 0.5 is 50% complete, 1 is 100% complete, can be null
*	sPassFail - the pass/fail status (progress measure) - "passed", "failed", "unknown", can be null
*	sScore - the score of the objective - a decimal value from -1 to 1, can be null
*	sDescription - the description of the SCO, can be null
*/
function setObjective(sNum,sId,sCompletion,sPercentComplete,sPassFail,sScore,sDescription) {
	// see if we have a # of an objective to set
	if (sNum == null) {
		// we do not, get the count of objectives from the LMS */
		sNum = scormGetValue("cmi.objectives._count");
	}
	
	/* tell the LMS about the objective */
	var sObj = "cmi.objectives." + sNum + ".";
	scormSetValue(sObj + "id", sId);
	
	/* see if this SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is, set the SCORM 2004 items for this objective */
		scormSetValue(sObj + "completion_status", sCompletion);
		if (sPercentComplete != null) scormSetValue(sObj + "progress_measure", sPercentComplete);
		if (sPassFail != null) scormSetValue(sObj + "success_status", sPassFail);
		if (sScore != null) scormSetValue(sObj + "score.scaled", sScore);
		if (sDescription != null) scormSetValue(sObj + "description", sDescription);
	} else if (_sAPI == "API") {
		/* set the SCORM 1.2 items for this objective */
		if (sCompletion == "unknown") sCompletion = "incomplete";		
		scormSetValue(sObj + "status", sCompletion);
		if (sPassFail == "passed" || sPassFail == "failed") scormSetValue(sObj + "status", sPassFail);
		if (sScore != null) {
			scormSetValue(sObj + "score.min", "0");
			scormSetValue(sObj + "score.max", "100");
			scormSetValue(sObj + "score.raw", (Math.round(sScore * 100000)/1000)+"");
		}
	}
}
	
/*
* Get the index of an objective from its ID
*	sStart - the starting index - use "0" if you want to start from the beginning
*	sId - the ID of the objective that you would like to find
*
*	RETURNS: The index of the objective if we find a match, else null
*/
function getObjectiveIndex(sStart, sId) {
	/* get the count of objectives */
	var nTotal = scormGetValue("cmi.objectives._count") - 0;
	
	/* the start number is a character value, convert to integer */
	var nStart = sStart - 0;
	
	/* see if the number of objectives is less than the starting index */
	if ((nTotal-1) < nStart) {
		/* it is, no more interactions past this start index */
		return null;
	}	
	
	/* loop through the collection of objectives */
	for (; nStart < nTotal; nStart++) {
		/* get the objective ID */
		var sIdCurrent = scormGetValue("cmi.objectives." + nStart + ".id");
		
		/* see if this is a match */
		if (sIdCurrent == sId) {
			/* it is, return the index */
			return nStart + "";
		}
	}
	
	/* we did not find a match for the ID so return a NULL */
	return null;
}

/*
* Get the count of objectives
*/
function getObjectiveCount() {
	/* return the count */
	return scormGetValue("cmi.objectives._count") - 0;
}

/*
* Get the objective score
*/
function getObjectiveScore(sIndex) {
	if (_sAPI == "API") {
		/* get the score as a number */
		var nScore = scormGetValue("cmi.objectives." + sIndex + ".score.raw") - 0;
		
		/* return the number to a fraction between 0 and 1 and round it to the nearest 1/1000th */
		nScore = (Math.round(nScore * 1000) / 100000);
		return nScore + "";
	} else {
		return scormGetValue("cmi.objectives." + sIndex + ".score.scaled");
	}
}

/*
* get the objective completion status
*/
function getObjectiveCompletionStatus(sIndex) {
	/* see if this is 1.2 */
	if (_sAPI == "API") {
		/* it is */
		return scormGetValue("cmi.objectives." + sIndex + ".status");
	} else {
		/* SCORM 2004 */
		return scormGetValue("cmi.objectives." + sIndex + ".completion_status");
	}
}

/*
* Get the objective progress measure
*/
function getObjectiveCompletionPercentage(sIndex) {
	if (_sAPI == "API") {
		return "";
	} else {
		return scormGetValue("cmi.objectives." + sIndex + ".progress_measure");
	}
}

/*
* get the objective success status
* 	returns passed, failed or unknown
*/
function getObjectivePassFail(sIndex) {
	if (_sAPI == "API") {
			return "";
	} else {
		return scormSetValue("cmi.objectives." + sIndex + ".success_status");
	}
}


/*
* Get the objective description
*/
function getObjectiveDescription(sIndex) {
	if (_sAPI == "API") {
		return "";
	} else {
		return scormGetValue("cmi.objectives." + sIndex + ".description");
	}
}

/* TYPE OF COMMUNICATION FUNCTIONS */

/*
* return true if we can communicate with the LMS, else false
*/
function canCommunicateWithLMS() {
	if (apiHandle != null) {
		/* we found a SCORM API adapter */
		return true;
	}
	
	/* did not find the adapter */
	return false;
}

/*
* return the type of communications with the LMS
*/
function getCommunicationsType() {
	/* see if this is SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* this is SCORM 2004 */
		return "SCORM 2004";
	} else if (_sAPI == "API") {
		/* it is */
		return "SCORM 1.2";
	}
	
	/* no adapter found */
	return "none";
}


/* LOWER LEVEL FUNCTIONS DIRECT COMMUNICATIONS WITH THE SCORM 1.2 and SCORM 2004 RUNTIME API */

/*
* call the SCORM initialize function
*/
function scormInitialize() {
	var API = getAPI();
	if (API == null)
		return "false";

	/* call the correct SCORM function */
	if (_sAPI == "API")
		var result = API.LMSInitialize("");
	else
		var result = API.Initialize("");
	return result;
}

/*
* call the SCORM finish function
*/
function scormTerminate() {
	var API = getAPI();
	if (API == null)
		return "false";
		
	/* call the correct SCORM function */
	if (_sAPI == "API")
		var result = API.LMSFinish("");
	else
		var result = API.Terminate("");
	return result;
}

/*
* call the SCORM commit function
*/
function scormCommit() {
	var API = getAPI();
	if (API == null)
		return "false";
		
	/* call the correct SCORM function */
	if (_sAPI == "API")
		var result = API.LMSCommit("");
	else
		var result = API.Commit("");
	return result;
}

/*
* call the SCORM GetValue function
*/
function scormGetValue(name) {
	var API = getAPI();
	if (API == null)
		return "";

	/* call the correct SCORM function */
	if (_sAPI == "API") {
		var value = API.LMSGetValue(name);
		var errCode = API.LMSGetLastError();
	} else {
		var value = API.GetValue(name);
		var errCode = API.GetLastError();
	}
	
	/* see if there is an error */
	if (errCode != "0") {
		/* there is, return an empty string */
		return "";
	} else {
		return value;
	}
}

/*
* call the SCORM SetValue function
*/
function scormSetValue(name, value) {
	var API = getAPI();
	if (API == null)
		return "true";

	/* call the correct SCORM function */
	if (_sAPI == "API")
		var result = API.LMSSetValue(name, value);
	else
		var result = API.SetValue(name, value);
	return result;
}

/*
* call the SCORM GetLastError function
*/
function scormGetLastError() {
	var API = getAPI();
	if (API == null) {
		/* there is no API available, by returning a not implemented
		*  error code, we let caller assume that the last SCORM
		*  function failed */
		return "401";
	}

	/* call the correct SCORM function */
	if (_sAPI == "API")
		return API.LMSGetLastError();
	else
		return API.GetLastError();
}

/*
* call the SCORM GetErrorString function
*/
function scormGetErrorString() {
	var API = getAPI();
	if (API == null)
		return "";

	/* call the correct SCORM function */
	if (_sAPI == "API")
		return API.LMSGetErrorString();
	else
		return API.GetErrorString();
}

/*
* call the SCORM GetDiagnostic function
*/
function scormGetDiagnostic() {
	var API = getAPI();
	if (API == null)
		return "";

	/* call the correct SCORM function */
	if (_sAPI == "API")
		return API.LMSGetDiagnostic();
	else
		return API.GetDiagnostic();
}



/*** PRIVATE FUNCTIONS USED TO SUPPORT THE TOOLKIT'S PUBLIC FUNCTIONS ***/

/*
* return an ISO 8601 time stamp given a JavaScript date object. The time stamp is in the format required for SCORM 2004.
*/
function dateToTimestamp(date) {
	/* get the parts of the date in UTC time */
	var year    = date.getUTCFullYear();
	var month   = date.getUTCMonth() + 1;
	var day     = date.getUTCDate();
	var hours   = date.getUTCHours();
	var minutes = date.getUTCMinutes();
	var seconds = date.getUTCSeconds();
	var milli   = Math.round(date.getUTCMilliseconds() / 10);

	/* pad a zero if the value is a single digit */
	month   = (month < 10)   ? "0" + month   : month;
	day     = (day < 10)     ? "0" + day     : day;
	hours   = (hours < 10)   ? "0" + hours   : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	milli   = (milli < 10)   ? "0" + milli   : milli;

	/* assemble the 8601 timestamp and return it */
	return year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "." + milli + "Z";
}

/*
* return the current hours:minutes:seconds given a date object for SCORM 1.2
*/
function getHMS(dateNow) {
	var hh = dateNow.getHours();
	var mm = dateNow.getMinutes();
	var ss = dateNow.getSeconds();
	if (hh<10) hh = "0" + hh;
	if (mm<10) mm = "0" + mm;
	if (ss<10) ss = "0" + ss;
	
	if (_sAPI == "API") {
		return hh + ":" + mm + ":" + ss;
	} else {
		var month = dateNow.getMonth() + 1;
		if (month<10) month = "0" + month;
		var day = dateNow.getDate();
		if (day<10)   day   = "0" + day;
		return dateNow.getFullYear() + "-" + month + "-" + day + 
	           "T" + hh + ":" + mm + ":" + ss;
	}
}

/*
* Convert elapsed time in milliseconds to the correct SCORM format
*	timeRaw - the time returned by the JavaScript function date.getTime()
*/
function formatTime(timeRaw) {
	/* get the hours, minutes and seconds from the raw time */
	var hh = Math.floor(timeRaw / 3600);
	timeRaw -= hh * 3600;
	var mm = Math.floor(timeRaw / 60);
	timeRaw -= mm * 60;
	var ss = timeRaw;
	
	/* see if this is SCORM 2004 */
	if (_sAPI == "API_1484_11") {
		/* it is, return the correct value */
		return "PT" + hh + "H" + mm + "M" + ss + "S";
	} else if (_sAPI == "API") {	
		/* this is SCORM 1.2 pad the time values with a 0 if needed */
		if (hh<10) hh = "0" + hh;
		if (mm<10) mm = "0" + mm;
		if (ss<10) ss = "0" + ss;
		
		/* return the correct value */
		return hh + ":" + mm +":" + ss;
	}	
	
	/* no SCORM so return an empty string */
	return "";
}

/*
* get the index of an objective from its id
*/
function getIndexFromId(sId) {
	/* get the count of objectives */
	var nCount = scormGetValue("cmi.objectives._count") - 0;
	
	/* see if there is a count */
	if (nCount > 0) {
		/* there is, loop through the objective ids */
		for (var i=0; i<nCount; i++) {
			/* see if this is the index of the id */
			if (scormGetValue("cmi.objectives." + i + ".id") == sId) {
				/* it does, return the index */
				return i+"";
			}
		}
		
		/* no match, return null */
		return null;
	} else {
		/* not children, return null */
		return null;
	}
}

/*
* look up through the frameset hierarchy for the SCORM API
*/
function findAPI(win, apiName) {
	/* see if the API is not in this window AND the parent is not null AND there is a parent window */
	while ((win[apiName] == null) && (win.parent != null) && (win.parent != win)) {
		/* did not find the API in this window, get the parent */
		win = win.parent;
	}
	
	/* we found the API or ran out of parent windows, set the result */
	apiHandle = win[apiName];
}

/*
* return the SCORM 1.2 or SCORM 2004 API
*/
function getAPI() {
	/* return the API if we already found it */
	if (apiHandle != null)
		return apiHandle;

	/* look for the SCORM 20004 API up in the frameset */
	findAPI(window, 'API_1484_11');

	/* if we still have not found the SCORM 2004 API, look at the opener and it's frameset */
	if ((apiHandle == null) && (window.opener != null)) {
		findAPI(window.opener, 'API_1484_11');
	}

	// force the code to use SCORM 1.2 even though the LMS is providing a SCORM 2004 runtime
	apiHandle = null;

	/* see if we found the SCORM 2004 API */
	if (apiHandle == null) {
		// we are hosting the SCORM API for the frameset so we do not want to look for the API if this window does not have a parent and there is no opener
		if (window.parent == window && !window.opener) return null;
		
		/* we did not, look for the SCORM 1.2 API in the frameset */
		findAPI(window.parent, 'API');
	
		/* if we still have not found the SCORM 2004 API, look at the opener and it's frameset */
		if ((apiHandle == null) && (window.opener != null)) {
			findAPI(window.opener, 'API');
		}
		
		/* see if we found the API */
		if (apiHandle != null) {
			/* we did, remember that we found the SCORM 1.2 API */
			_sAPI = 'API';
		}
	} else {
		/* we found the SCOM 2004 API, remember it */
		_sAPI = 'API_1484_11';
	}
	
	/* return it */
	return apiHandle;
}
// SIG // Begin signature block
// SIG // MIIbDwYJKoZIhvcNAQcCoIIbADCCGvwCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFFgXhkwGVGx7
// SIG // niEQ3Gnb2XRVuwi2oIIV6jCCBIUwggNtoAMCAQICCmEF
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
// SIG // gjcCARUwIwYJKoZIhvcNAQkEMRYEFNny4PLI6kmYyay5
// SIG // hCHPTuVaKLuYMF4GCisGAQQBgjcCAQwxUDBOoCaAJABN
// SIG // AGkAYwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4A
// SIG // Z6EkgCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVh
// SIG // cm5pbmcgMA0GCSqGSIb3DQEBAQUABIIBAJ/e1WBKdgHr
// SIG // B1vCN80USDU/6KAU9CiHs4KLRV5etXdJLOx5jMCDtdox
// SIG // rtj6Me2s5QQQXsBPC7EkQhfCuCOoLovxgTvswrkqJrdO
// SIG // 8G6uRBNSbFY2FwvZGb+Kz5E5XQ129L1o6BH/13kcP3g1
// SIG // 5uw/693iv1ToFm9A2jS6mr4nnEpwPdzoUOGIa25WYpEB
// SIG // y00ym8PDy1nDROTJx6VlFVB2KIlgyRMbL120MeS9eqfu
// SIG // OUQO84Vay9Heb2w1XQjvX8+MjRkbJZwL3WHvHhE0yqx8
// SIG // 2usaCUnNf9FVn7qCgSAeKM0k1WD3K4cYqur/m/UA8QW1
// SIG // KBE4ET7fZtAdRIRtc1+h0wqhggIdMIICGQYJKoZIhvcN
// SIG // AQkGMYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBAgphFrUpAAAAAAAQMAcGBSsOAwIaoF0wGAYJ
// SIG // KoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0B
// SIG // CQUxDxcNMTAwMjE5MjIzNzMxWjAjBgkqhkiG9w0BCQQx
// SIG // FgQUhj9NxtoramEeZVbAHsTVBBrH4YMwDQYJKoZIhvcN
// SIG // AQEFBQAEggEAgAqz9KhT2z2STwTmWtM+b9Gv5NjqL+Pe
// SIG // sTMl1Acmz9hMdh9e7sPxMqYqMmWyrO6Z4NwigmDJMiVU
// SIG // Hx42z3NTbOznYNP7xOdcLv1Av1Wv+bIFLmGF4oPnGn83
// SIG // hY73Qnqe7wq+qbO1aNoE1p3esQ4ELFKJCNRe5PMIDS/o
// SIG // 67hRdosXXVAw7z0wxVqAg8zAJARxOxgzx5eafM57SlvF
// SIG // GebRvLXUl5bk2G9S5LcAbGX2jxMkJfEb7G6AvW0s4f6J
// SIG // 2OHPIzuiPsYZvHh3lnB+n8wi2KrLLdUle0SSEtnuV3xT
// SIG // wjJW3En+93lNhGHaGIy94/nFCYhWan8hqEYLdjjF3Kke1w==
// SIG // End signature block
