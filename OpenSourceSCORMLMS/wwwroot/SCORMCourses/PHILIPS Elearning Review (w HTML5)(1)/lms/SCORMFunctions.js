
var SCORM_LOGOUT = "logout";
var SCORM_SUSPEND = "suspend";
var SCORM_NORMAL_EXIT = "";
var SCORM_TIMEOUT = "time-out";

var SCORM_PASSED = "passed";
var SCORM_FAILED = "failed";
var SCORM_COMPLETED = "completed";
var SCORM_BROWSED = "browsed";
var SCORM_INCOMPLETE = "incomplete";
var SCORM_NOT_ATTEMPTED = "not attempted";

var SCORM_CREDIT = "credit";
var SCORM_NO_CREDIT = "no-credit";

var SCORM_BROWSE = "browse";
var SCORM_NORMAL = "normal";
var SCORM_REVIEW = "review";

var SCORM_ENTRY_ABINITIO = "ab-initio";
var SCORM_ENTRY_RESUME = "resume";
var SCORM_ENTRY_NORMAL = "";


var SCORM_TLA_EXIT_MESSAGE = "exit,message";
var SCORM_TLA_EXIT_NO_MESSAGE = "exit,no message";
var SCORM_TLA_CONTINUE_MESSAGE = "continue,message";
var SCORM_TLA_CONTINUE_NO_MESSAGE = "continue,no message";

var SCORM_RESULT_CORRECT = "correct";
var SCORM_RESULT_WRONG = "wrong";
var SCORM_RESULT_UNANTICIPATED = "unanticipated";
var SCORM_RESULT_NEUTRAL = "neutral";

var SCORM_INTERACTION_TYPE_TRUE_FALSE = "true-false";
var SCORM_INTERACTION_TYPE_CHOICE = "choice";
var SCORM_INTERACTION_FILL_IN = "fill-in";
var SCORM_INTERACTION_TYPE_MATCHING = "matching";
var SCORM_INTERACTION_TYPE_PERFORMANCE = "performance";
var SCORM_INTERACTION_TYPE_SEQUENCING = "sequencing";
var SCORM_INTERACTION_TYPE_LIKERT = "likert";
var SCORM_INTERACTION_TYPE_NUMERIC = "numeric";


var SCORM_NO_ERROR = "0";
var SCORM_ERROR_INVALID_PREFERENCE = "-1";
var SCORM_ERROR_INVALID_STATUS = "-2";
var SCORM_ERROR_INVALID_SPEED = "-3";
var SCORM_ERROR_INVALID_TIMESPAN = "-4";
var SCORM_ERROR_INVALID_TIME_LIMIT_ACTION = "-5";
var SCORM_ERROR_INVALID_DECIMAL = "-6";
var SCORM_ERROR_INVALID_CREDIT = "-7";
var SCORM_ERROR_INVALID_LESSON_MODE = "-8";
var SCORM_ERROR_INVALID_ENTRY = "-9";

var SCORM_TRUE = "true";
var SCORM_FALSE = "false";

var SCORM_findAPITries = 0;
var SCORM_objAPI = null;

var intSCORMError = SCORM_NO_ERROR;
var strSCORMErrorString = "";
var strSCORMErrorDiagnostic = "";

var blnReviewModeSoReadOnly = false;

function SCORM_Initialize(){

	var blnResult = true;
	
	WriteToDebug("In SCORM_Initialize");
	
	SCORM_ClearErrorInfo();
	
	WriteToDebug("Grabbing API");
	
	try{
		SCORM_objAPI = SCORM_GrabAPI();
	}
	catch (e){
		WriteToDebug("Error grabbing 1.2 API-" + e.name + ":" + e.message);
	}
	
	if (typeof(SCORM_objAPI) == "undefined" || SCORM_objAPI == null){
		WriteToDebug("Unable to acquire SCORM API:")
		WriteToDebug("SCORM_objAPI=" + typeof(SCORM_objAPI));
		
		InitializeExecuted(false, "Error - unable to acquire LMS API, content may not play properly and results may not be recorded.  Please contact technical support.");
		return false;
	}
	
	WriteToDebug("Calling LMSInit");
	
	blnResult = SCORM_CallLMSInitialize();
	
	if (! blnResult){
		WriteToDebug("ERROR Initializing LMS");		
			
		InitializeExecuted(false, "Error initializing communications with LMS");
		
		return false;	
	}
	
	//only reset status and such if we are not reviewing
	if (SCORM_GetLessonMode() != MODE_REVIEW){
	
		if (SCORM_IsContentInBrowseMode()){
			WriteToDebug("Setting Status to Browsed");
			blnResult = SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_BROWSED);
		}
		else{
			//only set the status to incomplete if it's not attempted yet
			if (SCORM_GetStatus() == LESSON_STATUS_NOT_ATTEMPTED){
				WriteToDebug("Setting Status to Incomplete");
				blnResult = SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_INCOMPLETE);
			}
		}
		
		//we want to set the exit type to suspend immediately because some LMS's only store data if they get a suspend request
		blnResult = SCORM_CallLMSSetValue("cmi.core.exit", SCORM_TranslateExitTypeToSCORM(DEFAULT_EXIT_TYPE)) && blnResult;
	}
	else{
		//mode is review, check if we should go to read only mode
		if (!(typeof(REVIEW_MODE_IS_READ_ONLY) == "undefined") && REVIEW_MODE_IS_READ_ONLY === true){
			blnReviewModeSoReadOnly = true;
		}
	}
	
	WriteToDebug("Calling InitializeExecuted with parameter-" + blnResult);
	
	InitializeExecuted(blnResult, "");
	
	return;
}




function SCORM_Finish(strExitType, blnStatusWasSet){

	var strStatusAfterCompletion;
	var blnResult = true;
	
	WriteToDebug("In SCORM_Finish strExitType=" + strExitType + ", blnStatusWasSet=" + blnStatusWasSet);
	
	SCORM_ClearErrorInfo();
	
	if ( (strExitType == EXIT_TYPE_FINISH) && ! blnStatusWasSet ){
		
		WriteToDebug("Getting completion status");
		
		strStatusAfterCompletion = SCORM_GetCompletionStatus();
		
		WriteToDebug("Setting completion status to " + strStatusAfterCompletion);
		
		blnResult = SCORM_CallLMSSetValue("cmi.core.lesson_status", strStatusAfterCompletion) && blnResult;
	}
	
	WriteToDebug("Setting Exit");
	
	blnResult = SCORM_CallLMSSetValue("cmi.core.exit", SCORM_TranslateExitTypeToSCORM(strExitType)) && blnResult;
	
	WriteToDebug("Calling Commit");
	
	blnResult = SCORM_CallLMSCommit() && blnResult;
	
	WriteToDebug("Calling Finish");
	
	blnResult = SCORM_CallLMSFinish() && blnResult;	
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;

}


function SCORM_CommitData(){
	WriteToDebug("In SCORM_CommitData");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSCommit();
}



//---------------------------------------------------------------------------------
//General Get and Set Values

function SCORM_GetStudentID(){	
	WriteToDebug("In SCORM_GetStudentID");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.core.student_id");
}

function SCORM_GetStudentName(){
	WriteToDebug("In SCORM_GetStudentName");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.core.student_name");
}

function SCORM_GetBookmark(){
	WriteToDebug("In SCORM_GetBookmark");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.core.lesson_location");
}

function SCORM_SetBookmark(strBookmark){
	WriteToDebug("In SCORM_SetBookmark strBookmark=" + strBookmark);
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.core.lesson_location", strBookmark);
}

function SCORM_GetDataChunk(){
	WriteToDebug("In SCORM_GetDataChunk");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.suspend_data");
}

function SCORM_SetDataChunk(strData){
	//need to check for character limits here 4096 characters
	WriteToDebug("In SCORM_SetDataDChunk");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.suspend_data", strData);
}


function SCORM_GetLaunchData(){
	WriteToDebug("In SCORM_GetLaunchData");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.launch_data");
}

function SCORM_GetComments(){
	WriteToDebug("In SCORM_GetComments");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.comments");
}

function SCORM_WriteComment(strComment){
	WriteToDebug("In SCORM_WriteComment strComment=" + strComment);
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.comments", strComment);
}

function SCORM_GetLMSComments(){
	WriteToDebug("In SCORM_GetLMSComments");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.comments_from_lms");
}


function SCORM_GetAudioPlayPreference(){

	var intTempPreference;
	
	WriteToDebug("In SCORM_GetAudioPlayPreference");
	
	SCORM_ClearErrorInfo();
	
	intTempPreference = SCORM_CallLMSGetValue("cmi.student_preference.audio");
	
	if (intTempPreference == ""){
		intTempPreference = 0;
	}
	
	intTempPreference = parseInt(intTempPreference, 10);
	
	WriteToDebug("intTempPreference=" + intTempPreference);
	
	if (intTempPreference > 0){
		WriteToDebug("Returning On");
		return PREFERENCE_ON;
	}
	else if (intTempPreference == 0){
		WriteToDebug("Returning Default");
		return PREFERENCE_DEFAULT;
	}
	else if (intTempPreference < 0) {
		WriteToDebug("returning Off");
		return PREFERENCE_OFF;
	}
	else{
		WriteToDebug("Error: Invalid preference");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_PREFERENCE, 
								  "Invalid audio preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
}



function SCORM_GetAudioVolumePreference(){
	
	var intTempPreference;
	
	WriteToDebug("In SCORM_GetAudioVollumePreference");
	
	SCORM_ClearErrorInfo();
	
	intTempPreference = SCORM_CallLMSGetValue("cmi.student_preference.audio");
	
	WriteToDebug("intTempPreference=" + intTempPreference);
	
	if (intTempPreference == "") {
		intTempPreference = 100;
	}
	
	intTempPreference = parseInt(intTempPreference, 10);
	
	if (intTempPreference <= 0){
		WriteToDebug("Setting to 100");
		intTempPreference = 100;
	}
	
	if (! (intTempPreference > 0 && intTempPreference <= 100)){
		WriteToDebug("ERROR: invalid preference");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_PREFERENCE, 
								  "Invalid audio preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
	
	WriteToDebug("Returning " + intTempPreference);
	return intTempPreference;
	
}

function SCORM_SetAudioPreference(PlayPreference, intPercentOfMaxVolume){
	
	WriteToDebug("In SCORM_SetAudioPreference PlayPreference=" + PlayPreference + ", intPercentOfMaxVolume=" + intPercentOfMaxVolume);
	
	SCORM_ClearErrorInfo();
	
	if (PlayPreference == PREFERENCE_OFF){
		WriteToDebug("Setting percent to -1");
		intPercentOfMaxVolume = -1;
	}
	
	return SCORM_CallLMSSetValue("cmi.student_preference.audio", intPercentOfMaxVolume);
}



function SCORM_SetLanguagePreference(strLanguage){
	WriteToDebug("In SCORM_SetLanguagePreference strLanguage=" + strLanguage);
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.student_preference.language", strLanguage);

}


function SCORM_GetLanguagePreference(){
	WriteToDebug("In SCORM_GetLanguagePreference");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSGetValue("cmi.student_preference.language");

}


function SCORM_SetSpeedPreference(intPercentOfMax){
	
	var intSCORMSpeed;	//SCORM's scale is -100 to +100, our range is 1 to 100
	
	WriteToDebug("In SCORM_SetSpeedPreference intPercentOfMax=" + intPercentOfMax);
	
	SCORM_ClearErrorInfo();
	
	intSCORMSpeed = (intPercentOfMax * 2) - 100;
	
	WriteToDebug("intSCORMSpeed=" + intSCORMSpeed);
	
	return SCORM_CallLMSSetValue("cmi.student_preference.speed", intSCORMSpeed);

}


function SCORM_GetSpeedPreference(){

	var intSCORMSpeed;
	var intPercentOfMax;
		
	WriteToDebug("In SCORM_GetSpeedPreference");
	
	SCORM_ClearErrorInfo();
		
	intSCORMSpeed = SCORM_CallLMSGetValue("cmi.student_preference.speed");
	
	WriteToDebug("intSCORMSpeed=" + intSCORMSpeed);
	
	if (intSCORMSpeed == ""){
		WriteToDebug("Detected empty string, defaulting to 100");
		intSCORMSpeed = 100;
	}
	
	if ( ! ValidInteger(intSCORMSpeed) ){
		WriteToDebug("ERROR - invalid integer");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_SPEED, 
								  "Invalid speed preference received from LMS - not an integer", 
								  "intSCORMSpeed=" + intSCORMSpeed);	
		return null;
	}
	
	intSCORMSpeed = parseInt(intSCORMSpeed, 10);
	
	if (intSCORMSpeed < -100 || intSCORMSpeed > 100){
		WriteToDebug("ERROR - out of range");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_SPEED, 
								  "Invalid speed preference received from LMS - out of range", 
								  "intSCORMSpeed=" + intSCORMSpeed);	
		return null;
	}

	intPercentOfMax = (intSCORMSpeed + 100) / 2;
	intPercentOfMax = parseInt(intPercentOfMax, 10);
	
	WriteToDebug("Returning " + intPercentOfMax);
	
	return intPercentOfMax;

}




function SCORM_SetTextPreference(intPreference){
	WriteToDebug("In SCORM_SetTextPreference intPreference=" + intPreference);
	
	SCORM_ClearErrorInfo();
	
	return SCORM_CallLMSSetValue("cmi.student_preference.text", intPreference);
}


function SCORM_GetTextPreference(){
	var intTempPreference;
	
	WriteToDebug("In SCORM_GetTextPreference");
	
	SCORM_ClearErrorInfo();
	
	intTempPreference = SCORM_CallLMSGetValue("cmi.student_preference.text");
	intTempPreference = parseInt(intTempPreference, 10);
	
	WriteToDebug("intTempPreference=" + intTempPreference);
	
	if (intTempPreference > 0){
		WriteToDebug("Returning On");
		return PREFERENCE_ON;
	}
	else if (intTempPreference == 0 || intTempPreference == ""){
		WriteToDebug("Returning Default");
		return PREFERENCE_DEFAULT;
	}
	else if (intTempPreference < 0) {
		WriteToDebug("returning Off");
		return PREFERENCE_OFF;
	}
	else{
		WriteToDebug("Error: Invalid preference");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_PREFERENCE, 
								  "Invalid text preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
}



//---------------------------------------------------------------------------------
//Time Management Functions
function SCORM_GetPreviouslyAccumulatedTime(){
	
	var strCMITime;
	var intMilliseconds;
	
	WriteToDebug("In SCORM_GetPreviouslyAccumulatedTime");
	
	SCORM_ClearErrorInfo();
	
	strCMITime = SCORM_CallLMSGetValue("cmi.core.total_time")
	
	WriteToDebug("strCMITime=" + strCMITime);

	if (! IsValidCMITimeSpan(strCMITime)){		
		WriteToDebug("ERROR - Invalid CMITimeSpan");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_TIMESPAN, 
									"Invalid timespan received from LMS", 
									"strTime=" + strCMITime);	
		return null;
	}
	
	intMilliseconds = ConvertCMITimeSpanToMS(strCMITime);
	
	WriteToDebug("Returning " + intMilliseconds);
	
	return intMilliseconds;

}


function SCORM_SaveTime(intMilliSeconds){

	var strCMITime;
	
	WriteToDebug("In SCORM_SaveTime intMilliSeconds=" + intMilliSeconds);
	
	SCORM_ClearErrorInfo();
	
	strCMITime = ConvertMilliSecondsToSCORMTime(intMilliSeconds, true);
	
	WriteToDebug("strCMITime=" + strCMITime);
	
	return SCORM_CallLMSSetValue("cmi.core.session_time", strCMITime);
}

function SCORM_GetMaxTimeAllowed(){

	var strCMITime;
	var intMilliseconds;
	
	WriteToDebug("In SCORM_GetMaxTimeAllowed");
	
	SCORM_ClearErrorInfo();
	
	strCMITime = SCORM_CallLMSGetValue("cmi.student_data.max_time_allowed")
	
	WriteToDebug("strCMITime=" + strCMITime);
	
	if (strCMITime == ""){
		strCMITime = "9999:99:99.99";
	}

	if (! IsValidCMITimeSpan(strCMITime)){		
		WriteToDebug("ERROR - Invalid CMITimeSpan");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_TIMESPAN, 
									"Invalid timespan received from LMS", 
									"strTime=" + strCMITime);	
		return null;
	}
	
	intMilliseconds = ConvertCMITimeSpanToMS(strCMITime);
	
	WriteToDebug("intMilliseconds=" + intMilliseconds);
	
	return intMilliseconds;
}



function SCORM_DisplayMessageOnTimeout(){

	var strTLA;
	
	SCORM_ClearErrorInfo();
	
	WriteToDebug("In SCORM_DisplayMessageOnTimeout");
	
	strTLA = SCORM_CallLMSGetValue("cmi.student_data.time_limit_action");
	
	WriteToDebug("strTLA=" + strTLA);
	
	if (strTLA == SCORM_TLA_EXIT_MESSAGE || strTLA == SCORM_TLA_CONTINUE_MESSAGE){
		WriteToDebug("returning true");
		return true;
	}
	else if(strTLA == SCORM_TLA_EXIT_NO_MESSAGE || strTLA == SCORM_TLA_CONTINUE_NO_MESSAGE || strTLA == ""){
		WriteToDebug("returning false");
		return false;
	}
	else{
		WriteToDebug("Error invalid TLA");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_TIME_LIMIT_ACTION, 
								  "Invalid time limit action received from LMS", 
								  "strTLA=" + strTLA);	
	
		return null;
	}
	
}

function SCORM_ExitOnTimeout(){

	var strTLA;
	
	WriteToDebug("In SCORM_ExitOnTimeout");
	
	SCORM_ClearErrorInfo();
	
	strTLA = SCORM_CallLMSGetValue("cmi.student_data.time_limit_action");
	
	WriteToDebug("strTLA=" + strTLA);
	
	if (strTLA == SCORM_TLA_EXIT_MESSAGE || strTLA == SCORM_TLA_EXIT_NO_MESSAGE){
		WriteToDebug("returning true");
		return true;
	}
	else if(strTLA == SCORM_TLA_CONTINUE_MESSAGE || strTLA == SCORM_TLA_CONTINUE_NO_MESSAGE || strTLA == ""){
		WriteToDebug("returning false");
		return false;
	}
	else{
		WriteToDebug("ERROR invalid TLA");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_TIME_LIMIT_ACTION, 
								  "Invalid time limit action received from LMS", 
								  "strTLA=" + strTLA);	
	
		return null;
	}

}


function SCORM_GetPassingScore(){
	var fltScore;
	
	WriteToDebug("In SCORM_GetPassingScore");
	
	SCORM_ClearErrorInfo();
	
	fltScore = SCORM_CallLMSGetValue("cmi.student_data.mastery_score")
	
	WriteToDebug("fltScore=" + fltScore);
	
	if (fltScore == ""){
		fltScore = 0;
	}
	
	if ( ! IsValidDecimal(fltScore)){
		WriteToDebug("Error - score is not a valid decimal");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_DECIMAL, 
								  "Invalid mastery score received from LMS", 
								  "fltScore=" + fltScore);		
		return null;
	}
	
	fltScore = parseFloat(fltScore);
	
	WriteToDebug("returning fltScore");
	
	return fltScore;
}


function SCORM_SetScore(intScore, intMaxScore, intMinScore){
	
	var blnResult;
	
	WriteToDebug("In SCORM_SetScore intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	SCORM_ClearErrorInfo();
	
	blnResult = SCORM_CallLMSSetValue("cmi.core.score.raw", intScore);
	blnResult = SCORM_CallLMSSetValue("cmi.core.score.max", intMaxScore) && blnResult;
	blnResult = SCORM_CallLMSSetValue("cmi.core.score.min", intMinScore) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}

function SCORM_GetScore(){

		
	WriteToDebug("In SCORM_GetScore");
	
	SCORM_ClearErrorInfo();
	
	return SCORM_CallLMSGetValue("cmi.core.score.raw");

}

function SCORM_SetPointBasedScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("SCORM_SetPointBasedScore - SCORM 1.1 and 1.2 do not support SetPointBasedScore, returning false");
	return false;
}

function SCORM_GetScaledScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("SCORM_GetScaledScore - SCORM 1.1 and 1.2 do not support GetScaledScore, returning false");
	return false;
}

function SCORM_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, 
								intWeighting, intLatency, strLearningObjectiveID, dtmTime, scormInteractionType,
								strAlternateResponse, strAlternateCorrectResponse){
	
	var blnResult;
	var blnTempResult;
	var intInteractionIndex;
	var strResult;
	
	
	SCORM_ClearErrorInfo();
	
	//In SCORM 1.2, we always want to add a new interaction rather than updating an old interaction.
	//This is because some LMS vendors have mis-interpreted the "write only" stipulation on interactions to mean "write once"
	intInteractionIndex = SCORM_CallLMSGetValue("cmi.interactions._count");
	
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);
	
	if (intInteractionIndex == ""){
		WriteToDebug("Setting Interaction Index to 0");
		intInteractionIndex = 0;
	}
	
	//need to leave support for blnCorrect=t/f for legacy implementations of RSECA
	if (blnCorrect == true || blnCorrect == INTERACTION_RESULT_CORRECT){
		strResult = SCORM_RESULT_CORRECT;
	}
	else if (blnCorrect == "" || blnCorrect == "false" || blnCorrect == INTERACTION_RESULT_WRONG){	//compare against the string "false" because ("" == false) evaluates to true
		strResult = SCORM_RESULT_WRONG;
	}
	else if (blnCorrect == INTERACTION_RESULT_UNANTICIPATED){
		strResult = SCORM_RESULT_UNANTICIPATED;
	}
	else if (blnCorrect == INTERACTION_RESULT_NEUTRAL){
		strResult = SCORM_RESULT_NEUTRAL;
	}
	
	WriteToDebug("strResult=" + strResult);
	
	blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".id", strID);
	blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".type", scormInteractionType) && blnResult;
	
	
	//try to save the data using the verbose description of the interaciton results (this is not strictly conformant, but most LMS's will allow it and it still passes the Test Suite
	//if the long version errs, try again with the short version (strict adherence to the standard) - this applies to response and correct response
	
	blnTempResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".student_response", strResponse);
	
	if (blnTempResult == false){
		blnTempResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".student_response", strAlternateResponse);
	}
	
	blnResult = blnResult && blnTempResult;
	
	if (strCorrectResponse != undefined && strCorrectResponse != null && strCorrectResponse != ""){
		
		blnTempResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".correct_responses.0.pattern", strCorrectResponse);	
		if (blnTempResult == false){
			blnTempResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".correct_responses.0.pattern", strAlternateCorrectResponse);	
		}
		
		blnResult = blnResult && blnTempResult;
	}

	if (strResult != undefined && strResult != null && strResult != ""){
		blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".result", strResult) && blnResult;
	}
	
	//ignore the description parameter in SCORM 1.2, there is nothing we can do with it
	
	if (intWeighting != undefined && intWeighting != null && intWeighting != ""){
		blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".weighting", intWeighting) && blnResult;
	}

	if (intLatency != undefined && intLatency != null && intLatency != ""){
		blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".latency", ConvertMilliSecondsToSCORMTime(intLatency, true)) && blnResult;
	}
	
	if (strLearningObjectiveID != undefined && strLearningObjectiveID != null && strLearningObjectiveID != ""){
		blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".objectives.0.id", strLearningObjectiveID) && blnResult;
	}
	
	blnResult = SCORM_CallLMSSetValue("cmi.interactions." + intInteractionIndex + ".time", ConvertDateToCMITime(dtmTime)) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}

function SCORM_RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordTrueFalseInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse = "";
	var strCorrectResponse = null;
	
	if (blnResponse == true){
		strResponse = "t";
	}
	else{
		strResponse = "f";
	}
	
	if (blnCorrectResponse == true){
		strCorrectResponse = "t";
	}
	else if(blnCorrectResponse == false){		//test for false b/c it could be null in which case we want to leave it as ""
		strCorrectResponse = "f";
	}
	
	return SCORM_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, 
								   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_TRUE_FALSE,
								   strResponse, strCorrectResponse);
}

function SCORM_RecordMultipleChoiceInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordMultipleChoiceInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	


	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Short;
		strResponseLong += aryResponse[i].Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		strCorrectResponse += aryCorrectResponse[i].Short;
		strCorrectResponseLong += aryCorrectResponse[i].Long;
	}
	
	var blnSuccessfullySaved;
	
	blnSuccessfullySaved = SCORM_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, 
												   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_CHOICE,
												   strResponse, strCorrectResponse);
	
	return blnSuccessfullySaved;

}


function SCORM_RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordFillInInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	strResponse = new String(strResponse);
	if (strResponse.length > 255){strResponse = strResponse.substr(0, 255);}
	
	if (strCorrectResponse == null){
		strCorrectResponse = "";
	}
	
	strCorrectResponse = new String(strCorrectResponse);
	if (strCorrectResponse.length > 255){strCorrectResponse = strCorrectResponse.substr(0, 255);}

	return SCORM_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, 
								   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_FILL_IN,
								   strResponse, strCorrectResponse);
}

function SCORM_RecordMatchingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordMatchingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Source.Short + "." + aryResponse[i].Target.Short;
		strResponseLong += aryResponse[i].Source.Long + "." + aryResponse[i].Target.Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		strCorrectResponse += aryCorrectResponse[i].Source.Short + "." + aryCorrectResponse[i].Target.Short;
		strCorrectResponseLong += aryCorrectResponse[i].Source.Long + "." + aryCorrectResponse[i].Target.Long;
	}
	
	var blnSuccessfullySaved;
	
	blnSuccessfullySaved = SCORM_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, 
												   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_MATCHING,
												   strResponse, strCorrectResponse);
	
	
	return blnSuccessfullySaved;

}

function SCORM_RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordPerformanceInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	strResponse = new String(strResponse);
	if (strResponse.length > 255){strResponse = strResponse.substr(0, 255);}
	
	if (strCorrectResponse == null){
		strCorrectResponse = "";
	}
	
	strCorrectResponse = new String(strCorrectResponse);
	if (strCorrectResponse.length > 255){strCorrectResponse = strCorrectResponse.substr(0, 255);}
	
	return SCORM_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, 
								   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_PERFORMANCE,
								   strResponse, strCorrectResponse);
}

function SCORM_RecordSequencingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordSequencingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	


	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Short;
		strResponseLong += aryResponse[i].Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		strCorrectResponse += aryCorrectResponse[i].Short;
		strCorrectResponseLong += aryCorrectResponse[i].Long;
	}
	
	var blnSuccessfullySaved;
	
	blnSuccessfullySaved = SCORM_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, 
												   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_SEQUENCING,
												   strResponse, strCorrectResponse);
	
	
	return blnSuccessfullySaved;

}

function SCORM_RecordLikertInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordLikertInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse;
	var strResponseLong;
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	strResponse = response.Short;
	strResponseLong = response.Long;
	
	if (correctResponse != null){
		strCorrectResponse = correctResponse.Short;
		strCorrectResponseLong = correctResponse.Long;
	}

	var blnSuccessfullySaved;
	
	blnSuccessfullySaved = SCORM_RecordInteraction(strID, strResponseLong, blnCorrect, strCorrectResponseLong, strDescription, 
												   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_LIKERT,
												   strResponse, strCorrectResponse);
	
	return blnSuccessfullySaved;
}

function SCORM_RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM_RecordNumericInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	return SCORM_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, 
								   intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM_INTERACTION_TYPE_NUMERIC,
								   strResponse, strCorrectResponse);
}


function SCORM_GetEntryMode(){
	var strEntry;
	
	WriteToDebug("In SCORM_GetEntryMode");
	
	SCORM_ClearErrorInfo();
	
	strEntry = SCORM_CallLMSGetValue("cmi.core.entry");
	
	WriteToDebug("strEntry=" + strEntry);
	
	if (strEntry == SCORM_ENTRY_ABINITIO){
		WriteToDebug("Returning first time");
		return ENTRY_FIRST_TIME;
	}
	else if (strEntry == SCORM_ENTRY_RESUME){
		WriteToDebug("Returning resume");
		return ENTRY_RESUME;
	}
	else if (strEntry == SCORM_ENTRY_NORMAL){
		WriteToDebug("returning normal");
		return ENTRY_REVIEW;
	}
	else{
		WriteToDebug("ERROR - invalide entry mode");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_ENTRY, 
						"Invalid entry vocab received from LMS", 
						"strEntry=" + strEntry);
		return null;
	}

}

function SCORM_GetLessonMode(){

	var strLessonMode;
	
	WriteToDebug("In SCORM_GetLessonMode");
	
	SCORM_ClearErrorInfo();
	
	strLessonMode = SCORM_CallLMSGetValue("cmi.core.lesson_mode");
	
	WriteToDebug("strLessonMode=" + strLessonMode);
	
	if (strLessonMode == SCORM_BROWSE){
		WriteToDebug("Returning browse");
		return MODE_BROWSE;
	}
	else if(strLessonMode == SCORM_NORMAL){
		WriteToDebug("returning normal");
		return MODE_NORMAL;
	}
	else if(strLessonMode == SCORM_REVIEW){
		WriteToDebug("Returning Review");
		return MODE_REVIEW;
	}
	else{
		WriteToDebug("ERROR - invalid lesson mode");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_LESSON_MODE, 
								"Invalid lesson_mode vocab received from LMS", 
								"strLessonMode=" + strLessonMode);
		return null;	
	}
	
}

function SCORM_GetTakingForCredit(){
	
	var strCredit;
	
	WriteToDebug("In SCORM_GetTakingForCredit");
	
	SCORM_ClearErrorInfo();
	
	strCredit = SCORM_CallLMSGetValue("cmi.core.credit");
	
	WriteToDebug("strCredit=" + strCredit);
	
	if (strCredit == "credit"){
		WriteToDebug("Returning true");
		return true;
	}
	else if (strCredit == "no-credit"){
		WriteToDebug("Returning false");
		return false;
	}
	else{
		WriteToDebug("ERROR - invalid credit");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_CREDIT, 
								  "Invalid credit vocab received from LMS", 
								  "strCredit=" + strCredit);
		return null;
	}
}



function SCORM_SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore){
	
	var intObjectiveIndex;
	var blnResult;
	
	WriteToDebug("In SCORM_SetObjectiveScore, strObejctiveID=" + strObjectiveID + ", intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	SCORM_ClearErrorInfo();
	
	intObjectiveIndex = SCORM_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".id", strObjectiveID);
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".score.raw", intScore) && blnResult;
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".score.max", intMaxScore) && blnResult;
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".score.min", intMinScore) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
	
}

function SCORM_SetObjectiveDescription(strObjectiveID, strObjectiveDescription){
	
	var intObjectiveIndex;
	var blnResult;
	
	WriteToDebug("In SCORM_SetObjectiveDescription, strObjectiveDescription=" + strObjectiveDescription);
	WriteToDebug("Objective Descriptions are not supported prior to SCORM 2004");
	
	SCORM_ClearErrorInfo();
	
	blnResult = SCORM_TRUE;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
	
}



function SCORM_SetObjectiveStatus(strObjectiveID, Lesson_Status){

	var intObjectiveIndex;
	var blnResult;
	var strSCORMStatus = "";
	
	WriteToDebug("In SCORM_SetObjectiveStatus strObjectiveID=" + strObjectiveID + ", Lesson_Status=" + Lesson_Status);
	
	SCORM_ClearErrorInfo();
	
	intObjectiveIndex = SCORM_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	if (Lesson_Status == LESSON_STATUS_PASSED){
		strSCORMStatus = SCORM_PASSED;
	}
	else if (Lesson_Status == LESSON_STATUS_FAILED){
		strSCORMStatus = SCORM_FAILED;
	}
	else if (Lesson_Status == LESSON_STATUS_COMPLETED){
		strSCORMStatus = SCORM_COMPLETED;
	}
	else if (Lesson_Status == LESSON_STATUS_BROWSED){
		strSCORMStatus = SCORM_BROWSED;
	}
	else if (Lesson_Status == LESSON_STATUS_INCOMPLETE){
		strSCORMStatus = SCORM_INCOMPLETE;
	}
	else if (Lesson_Status == LESSON_STATUS_NOT_ATTEMPTED){
		strSCORMStatus = SCORM_NOT_ATTEMPTED;
	}
	
	WriteToDebug("strSCORMStatus=" + strSCORMStatus);
	
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".id", strObjectiveID);
	blnResult = SCORM_CallLMSSetValue("cmi.objectives." + intObjectiveIndex + ".status", strSCORMStatus) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}



function SCORM_GetObjectiveScore(strObjectiveID){

	var intObjectiveIndex;
		
	WriteToDebug("In SCORM_GetObjectiveScore, strObejctiveID=" + strObjectiveID);
	
	SCORM_ClearErrorInfo();
	
	intObjectiveIndex = SCORM_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);

	return SCORM_CallLMSGetValue("cmi.objectives." + intObjectiveIndex + ".score.raw");

}


function SCORM_GetObjectiveDescription(strObjectiveID){

   WriteToDebug("In SCORM_GetObjectiveDescription, strObejctiveID=" + strObjectiveID);
   WriteToDebug("ObjectiveDescription is not supported prior to SCORM 2004");
   return "";

}


function SCORM_GetObjectiveStatus(strObjectiveID){

	var intObjectiveIndex;
	var strStatus;
	
	WriteToDebug("In SCORM_GetObjectiveStatus, strObejctiveID=" + strObjectiveID);
	
	SCORM_ClearErrorInfo();
	
	intObjectiveIndex = SCORM_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);

	strStatus = SCORM_CallLMSGetValue("cmi.objectives." + intObjectiveIndex + ".status");
	
	if (strStatus == SCORM_PASSED){
		WriteToDebug("returning Passed");
		return LESSON_STATUS_PASSED;
	}
	else if (strStatus == SCORM_FAILED){
		WriteToDebug("Returning Failed");
		return LESSON_STATUS_FAILED;
	}
	else if (strStatus == SCORM_COMPLETED){
		WriteToDebug("Returning Completed");
		return LESSON_STATUS_COMPLETED;
	}
	else if (strStatus == SCORM_BROWSED){
		WriteToDebug("Returning Browsed");
		return LESSON_STATUS_BROWSED;
	}
	else if (strStatus == SCORM_INCOMPLETE){
		WriteToDebug("Returning Incomplete");
		return LESSON_STATUS_INCOMPLETE;
	}
	else if (strStatus == SCORM_NOT_ATTEMPTED || strStatus == ""){
		WriteToDebug("Returning Not Attempted");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
	else{
		WriteToDebug("ERROR - status not found");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_STATUS, 
								"Invalid objective status received from LMS or initial status not yet recorded for objective", 
								"strStatus=" + strStatus);
		return null;

	}	

}


function SCORM_FindObjectiveIndexFromID(strObjectiveID){

	var intCount;
	var i;
	var strTempID;
	
	WriteToDebug("In SCORM_FindObjectiveIndexFromID");
	
	intCount = SCORM_CallLMSGetValue("cmi.objectives._count");
	
	if (intCount == ""){
		WriteToDebug("Setting intCount=0");
		return 0;
	}
	
	intCount = parseInt(intCount, 10);
	
	WriteToDebug("intCount=" + intCount);
	
	for (i=0; i<intCount; i++){
	
		WriteToDebug("Checking index " + i);
		
		strTempID = SCORM_CallLMSGetValue("cmi.objectives." + i + ".id");
		
		WriteToDebug("ID=" + strTempID);
		
		if (strTempID == strObjectiveID){
			WriteToDebug("Found Matching index");
			return i;
		}
	}
	
	WriteToDebug("Did not find match, returning count");
	
	return intCount;
}




//___________________________________________________________
//Interaction Retrieval Functionality
//NOTE ON INTERACTION RETRIEVAL
//A.  It is only available in certain standards, standards where it is unavailable will return nothing
//B.  The interaction records are currently reported using "journaling", whereby each entry is appended
//		Retrieval methods will retrieve only the most recent value


//___________________________________________________________
//Helper Methods
function SCORM_FindInteractionIndexFromID(strInteractionID){

	WriteToDebug("SCORM_FindInteractionIndexFromID - SCORM does not support interaction retrieval, returning null");
	
	return null;
}
//___________________________________________________________


function SCORM_GetInteractionType(strInteractionID)
{

	WriteToDebug("SCORM_GetInteractionType - SCORM does not support interaction retrieval, returning empty string");
	return '';
	

}

//public
function SCORM_GetInteractionTimestamp(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionTimestamp - SCORM does not support interaction retrieval, returning empty string");
	return '';
}



//public
function SCORM_GetInteractionCorrectResponses(strInteractionID)
{

	WriteToDebug("SCORM_GetInteractionCorrectResponses - SCORM does not support interaction retrieval, returning empty array");
	return new Array();

	
}



//public
function SCORM_GetInteractionWeighting(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionWeighting - SCORM does not support interaction retrieval, returning empty string");
	return '';

}



//public
function SCORM_GetInteractionLearnerResponses(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionLearnerResponses - SCORM does not support interaction retrieval, returning empty array");
	return new Array();


}


//public
function SCORM_GetInteractionResult(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionResult - SCORM does not support interaction retrieval, returning empty string");
	return '';
	
}



//public
function SCORM_GetInteractionLatency(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionDescription - SCORM does not support interaction retrieval, returning empty string");
	return '';

}



//public
function SCORM_GetInteractionDescription(strInteractionID)
{
	WriteToDebug("SCORM_GetInteractionDescription - SCORM does not support interaction retrieval, returning empty string");
	return '';

	
}

//________________________________________________


//public
function SCORM_CreateDataBucket(strBucketId, intMinSize, intMaxSize){
	WriteToDebug("SCORM_CreateDataBucket - SCORM 1.1 and 1.2 do not support SSP, returning false");
	return false;
}

//public
function SCORM_GetDataFromBucket(strBucketId){
	WriteToDebug("SCORM_GetDataFromBucket - SCORM 1.1 and 1.2 do not support SSP, returning empty string");
	return "";
}

//public
function SCORM_PutDataInBucket(strBucketId, strData, blnAppendToEnd){
	WriteToDebug("SCORM_PutDataInBucket - SCORM 1.1 and 1.2 do not support SSP, returning false");
	return false;
}

//public
function SCORM_DetectSSPSupport(){
	WriteToDebug("SCORM_DetectSSPSupport - SCORM 1.1 and 1.2 do not support SSP, returning false");
	return false;
}

//public
function SCORM_GetBucketInfo(strBucketId){
    WriteToDebug("AICC_DetectSSPSupport - SCORM 1.1 and 1.2 do not support SSP, returning empty SSPBucketSize");
	return new SSPBucketSize(0, 0);
}

//---------------------------------------------------------------------------------
//Status Management Functions

function SCORM_SetFailed(){
	WriteToDebug("In SCORM_SetFailed");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_FAILED);
}

function SCORM_SetPassed(){
	WriteToDebug("In SCORM_SetPassed");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_PASSED);
}

function SCORM_SetCompleted(){
	WriteToDebug("In SCORM_SetPassed");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_COMPLETED);
}

function SCORM_ResetStatus(){
	WriteToDebug("In SCORM_ResetStatus");
	SCORM_ClearErrorInfo();
	return SCORM_CallLMSSetValue("cmi.core.lesson_status", SCORM_INCOMPLETE);
}

function SCORM_GetStatus(){
	
	var strStatus;
	
	WriteToDebug("In SCORM_GetStatus");
	
	SCORM_ClearErrorInfo();
	
	strStatus = SCORM_CallLMSGetValue("cmi.core.lesson_status");
	
	WriteToDebug("strStatus=" + strStatus);
	
	if (strStatus == SCORM_PASSED){
		WriteToDebug("returning Passed");
		return LESSON_STATUS_PASSED;
	}
	else if (strStatus == SCORM_FAILED){
		WriteToDebug("Returning Failed");
		return LESSON_STATUS_FAILED;
	}
	else if (strStatus == SCORM_COMPLETED){
		WriteToDebug("Returning Completed");
		return LESSON_STATUS_COMPLETED;
	}
	else if (strStatus == SCORM_BROWSED){
		WriteToDebug("Returning Browsed");
		return LESSON_STATUS_BROWSED;
	}
	else if (strStatus == SCORM_INCOMPLETE){
		WriteToDebug("Returning Incomplete");
		return LESSON_STATUS_INCOMPLETE;
	}
	else if (strStatus == SCORM_NOT_ATTEMPTED){
		WriteToDebug("Returning Not Attempted");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
	else{
		WriteToDebug("ERROR - status not found");
		SCORM_SetErrorInfoManually(SCORM_ERROR_INVALID_STATUS, 
								"Invalid lesson status received from LMS", 
								"strStatus=" + strStatus);
		return null;

	}
			
}

//public
function SCORM_GetProgressMeasure(){
	WriteToDebug("SCORM_GetProgressMeasure - SCORM 1.1 and 1.2 do not support progress_measure, returning false");
	return false;
}
//public
function SCORM_SetProgressMeasure(){
	WriteToDebug("SCORM_SetProgressMeasure - SCORM 1.1 and 1.2 do not support progress_measure, returning false");
	return false;
}

//public
function SCORM_GetObjectiveProgressMeasure(){
	WriteToDebug("SCORM_GetObjectiveProgressMeasure - SCORM 1.1 and 1.2 do not support progress_measure, returning false");
	return false;
}
//public
function SCORM_SetObjectiveProgressMeasure(){
	WriteToDebug("SCORM_SetObjectiveProgressMeasure - SCORM 1.1 and 1.2 do not support progress_measure, returning false");
	return false;
}


function SCORM_IsContentInBrowseMode(){
	
	var strLessonMode
	
	WriteToDebug("In SCORM_IsContentInBrowseMode");
	
	strLessonMode = SCORM_CallLMSGetValue("cmi.core.lesson_mode");
	
	WriteToDebug("SCORM_IsContentInBrowseMode,  strLessonMode=" + strLessonMode);
	
	if (strLessonMode == SCORM_BROWSE){
		WriteToDebug("Returning true");
		return true;
	}
	else{
		WriteToDebug("Returning false");
		return false;
	}
}


function SCORM_TranslateExitTypeToSCORM(strExitType){
	
	WriteToDebug("In SCORM_TranslatgeExitTypeToSCORM strExitType-" + strExitType);
	
	if (strExitType == EXIT_TYPE_SUSPEND){
		WriteToDebug("Returning suspend");
		return SCORM_SUSPEND;
	}
	else if (strExitType == EXIT_TYPE_UNLOAD){
		WriteToDebug("Returning Exit");
		return SCORM_NORMAL_EXIT;
	}
	else if (strExitType == EXIT_TYPE_FINISH){
		WriteToDebug("Returning Logout");
		return SCORM_NORMAL_EXIT;
	}
	else if (strExitType == EXIT_TYPE_TIMEOUT){
		WriteToDebug("Returning Timout");
		return SCORM_TIMEOUT;
	}
}


function SCORM_GetCompletionStatus(){
	
	WriteToDebug("In SCORM_GetCompletionStatus");
	
	if (SCORM_IsContentInBrowseMode()){
		WriteToDebug("Returning browsed");
		return SCORM_BROWSED;
	}
	else{
		WriteToDebug("Returning Completed");
		return SCORM_COMPLETED;
	}
	
}





//---------------------------------------------------------------------------------
//Functions to Call the SCORM API

//note: in all functions that interact with API, we concact any returned strings with "" to convert
//the value to a string type, do this b/c many SCORM API's will return a Java String instead of a Javascript
//string


function SCORM_CallLMSInitialize(){

	var strResult;
	
	WriteToDebug("In SCORM_CallLMSInitialize");
	
	SCORM_objAPI = SCORM_GrabAPI();
	
	WriteToDebug("Calling LMSInitialize");
	
	strResult = SCORM_objAPI.LMSInitialize("");
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM_FALSE){
		
		WriteToDebug("Detected failed call to initialize");
		
		SCORM_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSInitialize:");
		WriteToDebug ("              intSCORMError=" + intSCORMError);
		WriteToDebug ("              SCORMErrorString=" + strSCORMErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORMErrorDiagnostic);
		
		return false;

	}
	
	WriteToDebug("Returning true");
	
	return true;
}

function SCORM_CallLMSSetValue(strElement, strValue){
	
	var strResult;
	
	WriteToDebug("SCORM_CallLMSSetValue strElement=" + strElement + ", strValue=" + strValue);
	
	if (blnReviewModeSoReadOnly === true){
		WriteToDebug("Mode is Review and configuration setting dictates this should be read only so exiting.");
		return true;
	}
	
	SCORM_objAPI = SCORM_GrabAPI();		
	
	WriteToDebug("Calling LMSSetValue");

	strElement = strElement + "";
	strValue = strValue + "";
	
	strResult = SCORM_objAPI.LMSSetValue(strElement, strValue)
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM_FALSE){
		
		WriteToDebug("Detected Failed call to LMSSetvalue");
		
		SCORM_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSSetValue:");
		WriteToDebug ("              strElement=" + strElement);
		WriteToDebug ("              strValue=" + strValue);
		WriteToDebug ("              intSCORMError=" + intSCORMError);
		WriteToDebug ("              SCORMErrorString=" + strSCORMErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORMErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning true");
	
	return true;
}

function SCORM_CallLMSGetValue(strElement){

	var strResult
	
	WriteToDebug("In SCORM_CallLMSGetValue strElement=" + strElement);
	
	SCORM_objAPI = SCORM_GrabAPI();	
	
	WriteToDebug("Call LMSGetValue");

	strElement = strElement + "";
	
	strResult = SCORM_objAPI.LMSGetValue(strElement) + ""
	
	WriteToDebug("strResult=" + strResult);
	
	intSCORMError = SCORM_objAPI.LMSGetLastError()
	intSCORMError = intSCORMError + "";
	
	WriteToDebug("intSCORMError=" + intSCORMError);
	
	if (intSCORMError != SCORM_NO_ERROR){	
		
		WriteToDebug("Detected failed called to LMSGetValue");
		
		SCORM_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSGetValue:");
		WriteToDebug ("              strElement=" + strElement);
		WriteToDebug ("              intSCORMError=" + intSCORMError);
		WriteToDebug ("              SCORMErrorString=" + strSCORMErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORMErrorDiagnostic);
	}
	
	WriteToDebug("Returning " + strResult);
	
	return strResult;
	
}


function SCORM_CallLMSCommit(){
	
	var strResult;
	
	WriteToDebug("In SCORM_CallLMSCommit");
	
	SCORM_objAPI = SCORM_GrabAPI();
		
	WriteToDebug("Calling LMSCommit");	
	
	strResult = SCORM_objAPI.LMSCommit("");
	
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM_FALSE){
		
		WriteToDebug("Detected failed call to LMSCommit");
		
		SCORM_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSCommit:");
		WriteToDebug ("              intSCORMError=" + intSCORMError);
		WriteToDebug ("              SCORMErrorString=" + strSCORMErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORMErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning true");
	
	return true;
}


function SCORM_CallLMSFinish(){
	
	var strResult;
	
	WriteToDebug("In SCORM_CallLMSFinish");
	
	SCORM_objAPI = SCORM_GrabAPI();
	
	WriteToDebug("Calling LMS Finish");
	
	strResult = SCORM_objAPI.LMSFinish("");
	
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM_FALSE){
		
		WriteToDebug("Detected failed call to LMSFinish");
		
		SCORM_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSFinish:");
		WriteToDebug ("              intSCORMError=" + intSCORMError);
		WriteToDebug ("              SCORMErrorString=" + strSCORMErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORMErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning True");
	
	return true;
}


//---------------------------------------------------------------------------------
//Error Handling Functions
function SCORM_ClearErrorInfo(){
	
	WriteToDebug("In SCORM_ClearErrorInfo");
	
	intSCORMError = SCORM_NO_ERROR;
	strSCORMErrorString = "";
	strSCORMErrorDiagnostic = "";
}

function SCORM_SetErrorInfo(){
	
	WriteToDebug("In SCORM_SetErrorInfo");
	
	intSCORMError = SCORM_objAPI.LMSGetLastError();
	strSCORMErrorString = SCORM_objAPI.LMSGetErrorString(intSCORMError);
	strSCORMErrorDiagnostic = SCORM_objAPI.LMSGetDiagnostic("");
	
	intSCORMError = intSCORMError + "";
	strSCORMErrorString = strSCORMErrorString + "";
	strSCORMErrorDiagnostic = strSCORMErrorDiagnostic + "";
	
	WriteToDebug("intSCORMError=" + intSCORMError);
	WriteToDebug("strSCORMErrorString=" + strSCORMErrorString);
	WriteToDebug("strSCORMErrorDiagnostic=" + strSCORMErrorDiagnostic);
}

function SCORM_SetErrorInfoManually(intNum, strString, strDiagnostic){
		
		WriteToDebug("In SCORM_SetErrorInfoManually");
		WriteToDebug("ERROR-Num=" + intNum);	
		WriteToDebug("      String=" + strString);	
		WriteToDebug("      Diag=" + strDiagnostic);
		
		intSCORMError = intNum;
		strSCORMErrorString = strString;
		strSCORMErrorDiagnostic = strDiagnostic;	

}

function SCORM_GetLastError(){
	
	WriteToDebug("In SCORM_GetLastError");
	
	if (intSCORMError == SCORM_NO_ERROR){
		WriteToDebug("Returning No Error");
		return NO_ERROR;
	}
	else {
		WriteToDebug("Returning " + intSCORMError);
		return intSCORMError;
	}
}

function SCORM_GetLastErrorDesc(){
	WriteToDebug("In SCORM_GetLastErrorDesc, " + strSCORMErrorString + "\n" + strSCORMErrorDiagnostic);
	return strSCORMErrorString + "\n" + strSCORMErrorDiagnostic;
}



//---------------------------------------------------------------------------------
//API Locating Functions

function SCORM_GrabAPI(){
	
	WriteToDebug("In SCORM_GrabAPI");
	
	//if we haven't already located the API, find it using our improved ADL algorithm
	if (typeof(SCORM_objAPI) == "undefined" || SCORM_objAPI == null){
		WriteToDebug("Searching with improved ADL algorithm");
		SCORM_objAPI = SCORM_GetAPI();
	}		
	
	//if it's still not found, look in every concievable spot...some older LMS's bury it in wierd places
	//drop this because it can cause problems when the content is launched in a cross domain envrionment...for instance the 
	//standard detection algorithm could come upon a frame from a different domain using this algorithm when the content is
	//launched under AICC
	
	//TODO: a better solution might be to wrap this in a try/catch block
	
	//if (typeof(SCORM_objAPI) == "undefined" || SCORM_objAPI == null){
	//	WriteToDebug("Searching everywhere with Rustici Software algorithm");
	//	SCORM_objAPI = SCORM_SearchForAPI(window);
	//}
	
	if (typeof(SCORM_objAPI) == "undefined" || SCORM_objAPI == null){
		SCORM_objAPI = SCORM_SearchForAPI(window);
	}
	
	WriteToDebug("SCORM_GrabAPI, returning");
	
	return SCORM_objAPI;
	
}


function SCORM_SearchForAPI(wndLookIn){
	
	WriteToDebug("SCORM_SearchForAPI");
	
	var objAPITemp = null;
	var strDebugID = "";
	
	strDebugID = "Name=" + wndLookIn.name + ", href=" + wndLookIn.location.href
	
	objAPITemp = wndLookIn.API;
	
	if (SCORM_APIFound(objAPITemp)){
		WriteToDebug("Found API in this window - "  + strDebugID);
		return objAPITemp;
	}
	
	if (SCORM_WindowHasParent(wndLookIn)){
		WriteToDebug("Searching Parent - "  + strDebugID);
		objAPITemp = SCORM_SearchForAPI(wndLookIn.parent);
	}

	if (SCORM_APIFound(objAPITemp)){
		WriteToDebug("Found API in a parent - "  + strDebugID);
		return objAPITemp;
	}

	if (SCORM_WindowHasOpener(wndLookIn)){
		WriteToDebug("Searching Opener - "  + strDebugID);
		objAPITemp = SCORM_SearchForAPI(wndLookIn.opener);
	}

	if (SCORM_APIFound(objAPITemp)){
		WriteToDebug("Found API in an opener - "  + strDebugID);
		return objAPITemp;
	}	
	
	//look in child frames individually, don't call this function recursively
	//on them to prevent an infinite loop when it looks back up to the parents
	WriteToDebug("Looking in children - "  + strDebugID);
	objAPITemp = SCORM_LookInChildren(wndLookIn);

	if (SCORM_APIFound(objAPITemp)){
		WriteToDebug("Found API in Children - "  + strDebugID);
		return objAPITemp;
	}
	
	WriteToDebug("Didn't find API in this window - "  + strDebugID);
	return null;
}


function SCORM_LookInChildren(wnd){
	
	WriteToDebug("SCORM_LookInChildren");
	
	var objAPITemp = null;
	
	var strDebugID = "";
	
	strDebugID = "Name=" + wnd.name + ", href=" + wnd.location.href

	for (var i=0; i < wnd.frames.length; i++){
		
		WriteToDebug("Looking in child frame " + i);
		
		objAPITemp = wnd.frames[i].API;
		
		if (SCORM_APIFound(objAPITemp)){
			WriteToDebug("Found API in child frame of " + strDebugID);
			return objAPITemp;
		}
		
		WriteToDebug("Looking in this child's children " + strDebugID);
		objAPITemp = SCORM_LookInChildren(wnd.frames[i]);

		if (SCORM_APIFound(objAPITemp)){
			WriteToDebug("API found in this child's children " + strDebugID);
			return objAPITemp;
		}		
	}
	
	return null;
}

function SCORM_WindowHasOpener(wnd){
	WriteToDebug("In SCORM_WindowHasOpener");
	if ((wnd.opener != null) && (wnd.opener != wnd) && (typeof(wnd.opener) != "undefined")){
		WriteToDebug("Window Does Have Opener");
		return true;
	}
	else{
		WriteToDebug("Window Does Not Have Opener");
		return false;
	}	
}

function SCORM_WindowHasParent(wnd){
	WriteToDebug("In SCORM_WindowHasParent");
	if ((wnd.parent != null) && (wnd.parent != wnd) && (typeof(wnd.parent) != "undefined")){
		WriteToDebug("Window Does Have Parent");
		return true;
	}
	else{
		WriteToDebug("Window Does Not Have Parent");
		return false;
	}
}


function SCORM_APIFound(obj){
	WriteToDebug("In SCORM_APIFound");
	if (obj == null || typeof(obj) == "undefined"){
		WriteToDebug("API NOT Found");
		return false;
	}
	else{
		WriteToDebug("API Found");
		return true;
	}
}




/*******************************************************************
	* SCORM 2004 API Search Algorithm
	* Description - Improvement of the algorithm developed by ADL to 
		find the SCORM 2004 API Adapter. The improvements eliminate 
		errors, improve code clarity and eliminate the dependence
		on global variables. The errors removed include:
			- The "win" variable was never declared in a scope 
			  accessible to the GetAPI function
			- A call to API.version which is not part of the SCORM
			  2004 specification
			- The previous algorithm was not able to find the API
			  if it was located in the window's parent's opener
	* Original Author - ADL & Concurrent Technologies Corporation
	* Author -  Mike Rustici (April 1, 2004)
				Rustici Software, LLC
				http://www.scorm.com
				mike@scorm.com
*******************************************************************/




/*
ScanParentsForApi
-Searches all the parents of a given window until
 it finds an object named "API". If an
 object of that name is found, a reference to it
 is returned. Otherwise, this function returns null.
*/
function SCORM_ScanParentsForApi(win) 
{ 

	WriteToDebug("In SCORM_ScanParentsForApi, win=" + win.location);
	
	/*
	Establish an outrageously high maximum number of
	parent windows that we are will to search as a
	safe guard against an infinite loop. This is 
	probably not strictly necessary, but different 
	browsers can do funny things with undefined objects.
	*/
	var MAX_PARENTS_TO_SEARCH = 500; 
	var nParentsSearched = 0;
	
	/*
	Search each parent window until we either:
		 -find the API, 
		 -encounter a window with no parent (parent is null 
				or the same as the current window)
		 -or, have reached our maximum nesting threshold
	*/
	while ( (win.API == null || win.API === undefined) && 
			(win.parent != null) && (win.parent != win) && 
			(nParentsSearched <= MAX_PARENTS_TO_SEARCH) 
		  )
	{ 
				
		nParentsSearched++; 
		win = win.parent;
	} 
	
	/*
	If the API doesn't exist in the window we stopped looping on, 
	then this will return null.
	*/
	return win.API; 
} 


/*
GetAPI
-Searches all parent and opener windows relative to the
 current window for the SCORM API Adapter.
 Returns a reference to the API Adapter if found or null
 otherwise.
*/
function SCORM_GetAPI() 
{ 
	WriteToDebug("In SCORM_GetAPI");
	
	var API = null; 
	
	//Search all the parents of the current window if there are any
	if ((window.parent != null) && (window.parent != window)) 
	{ 
		WriteToDebug("SCORM_GetAPI, searching parent");
		API = SCORM_ScanParentsForApi(window.parent); 
	} 
	
	/*
	If we didn't find the API in this window's chain of parents, 
	then search all the parents of the opener window if there is one
	*/
	if ((API == null) && (window.top.opener != null))
	{ 
		WriteToDebug("SCORM_GetAPI, searching opener");
		API = SCORM_ScanParentsForApi(window.top.opener); 
	} 
	
	return API;
}


