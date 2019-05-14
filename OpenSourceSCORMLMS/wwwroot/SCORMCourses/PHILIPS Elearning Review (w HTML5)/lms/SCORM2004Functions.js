
var SCORM2004_LOGOUT = "logout";
var SCORM2004_SUSPEND = "suspend";
var SCORM2004_NORMAL_EXIT = "normal";
var SCORM2004_TIMEOUT = "time-out";

var SCORM2004_PASSED = "passed";
var SCORM2004_FAILED = "failed";
var SCORM2004_UNKNOWN = "unknown";

var SCORM2004_COMPLETED = "completed";
var SCORM2004_INCOMPLETE = "incomplete";
var SCORM2004_NOT_ATTEMPTED = "not attempted";

//var SCORM2004_BROWSED = "browsed";

var SCORM2004_CREDIT = "credit";
var SCORM2004_NO_CREDIT = "no-credit";

var SCORM2004_BROWSE = "browse";
var SCORM2004_NORMAL = "normal";
var SCORM2004_REVIEW = "review";

var SCORM2004_ENTRY_ABINITIO = "ab-initio";
var SCORM2004_ENTRY_RESUME = "resume";
var SCORM2004_ENTRY_NORMAL = "";

var SCORM2004_TLA_EXIT_MESSAGE = "exit,message";
var SCORM2004_TLA_EXIT_NO_MESSAGE = "exit,no message";
var SCORM2004_TLA_CONTINUE_MESSAGE = "continue,message";
var SCORM2004_TLA_CONTINUE_NO_MESSAGE = "continue,no message";


var SCORM2004_RESULT_CORRECT = "correct";
var SCORM2004_RESULT_WRONG = "incorrect";
var SCORM2004_RESULT_UNANTICIPATED = "unanticipated";
var SCORM2004_RESULT_NEUTRAL = "neutral";

var SCORM2004_INTERACTION_TYPE_TRUE_FALSE = "true-false";
var SCORM2004_INTERACTION_TYPE_CHOICE = "choice";
var SCORM2004_INTERACTION_TYPE_FILL_IN = "fill-in";
var SCORM2004_INTERACTION_TYPE_LONG_FILL_IN = "long-fill-in";
var SCORM2004_INTERACTION_TYPE_MATCHING = "matching";
var SCORM2004_INTERACTION_TYPE_PERFORMANCE = "performance";
var SCORM2004_INTERACTION_TYPE_SEQUENCING = "sequencing";
var SCORM2004_INTERACTION_TYPE_LIKERT = "likert";
var SCORM2004_INTERACTION_TYPE_NUMERIC = "numeric";


var SCORM2004_NO_ERROR = "0";
var SCORM2004_ERROR_INVALID_PREFERENCE = "-1";
var SCORM2004_ERROR_INVALID_STATUS = "-2";
var SCORM2004_ERROR_INVALID_SPEED = "-3";
var SCORM2004_ERROR_INVALID_TIMESPAN = "-4";
var SCORM2004_ERROR_INVALID_TIME_LIMIT_ACTION = "-5";
var SCORM2004_ERROR_INVALID_DECIMAL = "-6";
var SCORM2004_ERROR_INVALID_CREDIT = "-7";
var SCORM2004_ERROR_INVALID_LESSON_MODE = "-8";
var SCORM2004_ERROR_INVALID_ENTRY = "-9";

var SCORM2004_TRUE = "true";
var SCORM2004_FALSE = "false";

var SCORM2004_EARLIEST_DATE = new Date("1/1/1900");




var intSCORM2004Error = SCORM2004_NO_ERROR;
var strSCORM2004ErrorString = "";
var strSCORM2004ErrorDiagnostic = "";

var SCORM2004_objAPI = null;

var blnReviewModeSoReadOnly = false;

var blnSCORM2004_SSP_Is_Supported = null;

function SCORM2004_Initialize(){

	WriteToDebug("In SCORM2004_Initialize");

	var blnResult = true;
	
	SCORM2004_ClearErrorInfo();
	
	WriteToDebug("Grabbing API");
	
	try{
		SCORM2004_objAPI = SCORM2004_GrabAPI();
	}
	catch (e){
		WriteToDebug("Error grabbing 1.2 API-" + e.name + ":" + e.message);
	}
	
	if (typeof(SCORM2004_objAPI) == "undefined" || SCORM2004_objAPI == null){
		WriteToDebug("Unable to acquire SCORM API:")
		WriteToDebug("SCORM2004_objAPI=" + typeof(SCORM2004_objAPI));
		
		InitializeExecuted(false, "Error - unable to acquire LMS API, content may not play properly and results may not be recorded.  Please contact technical support.");
		return false;
	}
	
	WriteToDebug("Calling LMSInit");
	
	blnResult = SCORM2004_CallInitialize();
	
	if (! blnResult){
		WriteToDebug("ERROR Initializing LMS");		
			
		InitializeExecuted(false, "Error initializing communications with LMS");
		
		return false;	
	}
	
	

	//only set the status to incomplete if it's not attempted yet
	if (SCORM2004_GetStatus() == LESSON_STATUS_NOT_ATTEMPTED){
		WriteToDebug("Setting Status to Incomplete");
		blnResult = SCORM2004_CallSetValue("cmi.completion_status", SCORM2004_INCOMPLETE);
	}

	
	//we want to set the exit type to suspend immediately because some LMS's only store data if they get a suspend request
	blnResult = SCORM2004_CallSetValue("cmi.exit", SCORM2004_TranslateExitTypeToSCORM(DEFAULT_EXIT_TYPE)) && blnResult;

	//if mode is review, check if we should go to read only mode
	if (SCORM2004_GetLessonMode() == MODE_REVIEW){
		if (!(typeof(REVIEW_MODE_IS_READ_ONLY) == "undefined") && REVIEW_MODE_IS_READ_ONLY === true){
			blnReviewModeSoReadOnly = true;
		}
	}
	
	WriteToDebug("Calling InitializeExecuted with parameter-" + blnResult);
	
	InitializeExecuted(blnResult, "");
	
	return;
	
}




function SCORM2004_Finish(strExitType, blnStatusWasSet){

	WriteToDebug("In SCORM2004_Finish strExitType=" + strExitType + ", blnStatusWasSet=" + blnStatusWasSet);
	
	var strStatusAfterCompletion;
	var blnResult = true;
	
	SCORM2004_ClearErrorInfo();
	
	if ( (strExitType == EXIT_TYPE_FINISH) && ! blnStatusWasSet ){
		
		WriteToDebug("Getting completion status");
		
		strStatusAfterCompletion = SCORM2004_GetCompletionStatus();
		
		WriteToDebug("Setting completion status to " + strStatusAfterCompletion);
		
		blnResult = SCORM2004_CallSetValue("cmi.completion_status", strStatusAfterCompletion) && blnResult;

	}
	
	if( strExitType == EXIT_TYPE_SUSPEND && USE_2004_SUSPENDALL_NAVREQ ) {
		WriteToDebug("Setting adl.nav.request to suspendAll");
		blnResult = SCORM2004_CallSetValue("adl.nav.request","suspendAll");
	}
	
	WriteToDebug("Setting Exit");
	
	blnResult = SCORM2004_CallSetValue("cmi.exit", SCORM2004_TranslateExitTypeToSCORM(strExitType)) && blnResult;
	
	WriteToDebug("Calling Commit");
	
	blnResult = SCORM2004_CallCommit() && blnResult;
	
	WriteToDebug("Calling Finish");
	
	blnResult = SCORM2004_CallTerminate() && blnResult;	
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;

}


function SCORM2004_CommitData(){

	WriteToDebug("In SCORM2004_CommitData");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallCommit();

}



//---------------------------------------------------------------------------------
//General Get and Set Values

function SCORM2004_GetStudentID(){	

	WriteToDebug("In SCORM2004_GetStudentID");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.learner_id");

}

function SCORM2004_GetStudentName(){

	WriteToDebug("In SCORM2004_GetStudentName");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.learner_name");

}

function SCORM2004_GetBookmark(){
	WriteToDebug("In SCORM2004_GetBookmark");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.location");

}

function SCORM2004_SetBookmark(strBookmark){
	WriteToDebug("In SCORM2004_SetBookmark strBookmark=" + strBookmark);
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallSetValue("cmi.location", strBookmark);
}

function SCORM2004_GetDataChunk(){
	WriteToDebug("In SCORM2004_GetDataChunk");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.suspend_data");
}

function SCORM2004_SetDataChunk(strData){
	// 4000 characters for 2nd edition
	// 64000 characters here for 3rd edition
	WriteToDebug("In SCORM2004_SetDataChunk");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallSetValue("cmi.suspend_data", strData);
}


function SCORM2004_GetLaunchData(){
	WriteToDebug("In SCORM2004_GetLaunchData");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.launch_data");
}


function SCORM2004_GetComments(){
	
	WriteToDebug("In SCORM2004_GetComments");
	
	SCORM2004_ClearErrorInfo();
	
	var intCommentCount;
	var strComments = "";
	
	intCommentCount = SCORM2004_CallGetValue("cmi.comments_from_learner._count");
	
	for (var i=0; i < intCommentCount; i++){
		
		if (strComments.length > 0){
			strComments += " | ";
		}
		
		strComments += SCORM2004_CallGetValue("cmi.comments_from_learner." + i + ".comment");
	}
	
	return strComments;

}

function SCORM2004_WriteComment(strComment){

	WriteToDebug("In SCORM2004_WriteComment strComment=" + strComment);
	
	var intCurrentIndex;
	var blnResult;
	
	SCORM2004_ClearErrorInfo();	
	
	//remove the "|" since we can use the comments collection
	if (strComment.search(/ \| /) == 0){
		strComment = strComment.substr(3);
	}
	
	//remove encoding of "|"
	strComment.replace(/\|\|/g, "|")
	
	intCurrentIndex = SCORM2004_CallGetValue("cmi.comments_from_learner._count");
	
	blnResult = SCORM2004_CallSetValue("cmi.comments_from_learner." + intCurrentIndex + ".comment", strComment);
	blnResult = SCORM2004_CallSetValue("cmi.comments_from_learner." + intCurrentIndex + ".timestamp", ConvertDateToIso8601TimeStamp(new Date())) && blnResult;
	
	return blnResult;
}


function SCORM2004_GetLMSComments(){
	
	WriteToDebug("In SCORM2004_GetLMSComments");
	
	SCORM2004_ClearErrorInfo();
	
	var intCommentCount;
	var strComments = "";
	
	intCommentCount = SCORM2004_CallGetValue("cmi.comments_from_lms._count");
	
	for (var i=0; i < intCommentCount; i++){
		
		if (strComments.length > 0){
			strComments += " \r\n";
		}
		
		strComments += SCORM2004_CallGetValue("cmi.comments_from_lms." + i + ".comment");
	}
	
	return strComments;
}


function SCORM2004_GetAudioPlayPreference(){

	var intTempPreference;
	
	WriteToDebug("In SCORM2004_GetAudioPlayPreference");
	
	SCORM2004_ClearErrorInfo();
	
	intTempPreference = SCORM2004_CallGetValue("cmi.learner_preference.audio_level");
	
	if (intTempPreference == ""){
		intTempPreference = 0;
	}
	
	intTempPreference = parseInt(intTempPreference, 10);
	
	WriteToDebug("intTempPreference=" + intTempPreference);
	
	if (intTempPreference > 0){
		WriteToDebug("Returning On");
		return PREFERENCE_ON;
	}
	else if (intTempPreference <= 0) {
		WriteToDebug("Returning Off");
		return PREFERENCE_OFF;
	}
	else{
		WriteToDebug("Error: Invalid preference");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_PREFERENCE, 
								  "Invalid audio preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
}



function SCORM2004_GetAudioVolumePreference(){
	
	var intTempPreference;
	
	WriteToDebug("In SCORM2004_GetAudioVollumePreference");
	
	SCORM2004_ClearErrorInfo();
	
	intTempPreference = SCORM2004_CallGetValue("cmi.learner_preference.audio_level");
	
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
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_PREFERENCE, 
								  "Invalid audio preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
	
	WriteToDebug("Returning " + intTempPreference);
	return intTempPreference;
	
}

function SCORM2004_SetAudioPreference(PlayPreference, intPercentOfMaxVolume){
	
	WriteToDebug("In SCORM2004_SetAudioPreference PlayPreference=" + PlayPreference + ", intPercentOfMaxVolume=" + intPercentOfMaxVolume);
	
	SCORM2004_ClearErrorInfo();
	
	if (PlayPreference == PREFERENCE_OFF){
		WriteToDebug("Setting percent to 0");
		intPercentOfMaxVolume = 0;
	}
	
	return SCORM2004_CallSetValue("cmi.learner_preference.audio_level", intPercentOfMaxVolume);
}



function SCORM2004_SetLanguagePreference(strLanguage){
	WriteToDebug("In SCORM2004_SetLanguagePreference strLanguage=" + strLanguage);
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallSetValue("cmi.learner_preference.language", strLanguage);

}


function SCORM2004_GetLanguagePreference(){
	WriteToDebug("In SCORM2004_GetLanguagePreference");
	SCORM2004_ClearErrorInfo();
	return SCORM2004_CallGetValue("cmi.learner_preference.language");

}


function SCORM2004_SetSpeedPreference(intPercentOfMax){
	
	//SCORM 2004's scale is greater than 0, our range is 1 to 100, just store our range
	
	WriteToDebug("In SCORM2004_SetSpeedPreference intPercentOfMax=" + intPercentOfMax);

	SCORM2004_ClearErrorInfo();
		
	return SCORM2004_CallSetValue("cmi.learner_preference.delivery_speed", intPercentOfMax);

}


function SCORM2004_GetSpeedPreference(){

	var intSCORMSpeed;
	var intPercentOfMax;
		
	WriteToDebug("In SCORM2004_GetSpeedPreference");

	SCORM2004_ClearErrorInfo();
		
	intSCORMSpeed = SCORM2004_CallGetValue("cmi.learner_preference.delivery_speed");
	
	WriteToDebug("intSCORMSpeed=" + intSCORMSpeed);
	
	if (intSCORMSpeed == ""){
		WriteToDebug("Detected empty string, defaulting to 100");
		intSCORMSpeed = 100;
	}
	
	intSCORMSpeed = parseInt(intSCORMSpeed, 10);
	
	if (intSCORMSpeed < 0){
		WriteToDebug("ERROR - out of range");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_SPEED, 
								  "Invalid speed preference received from LMS - out of range", 
								  "intSCORMSpeed=" + intSCORMSpeed);	
		return null;
	}

	WriteToDebug("intSCORMSpeed " + intSCORMSpeed);
	
	return intSCORMSpeed;

}




function SCORM2004_SetTextPreference(intPreference){
	
	WriteToDebug("In SCORM2004_SetTextPreference intPreference=" + intPreference);
	
	SCORM2004_ClearErrorInfo();
	
	return SCORM2004_CallSetValue("cmi.learner_preference.audio_captioning", intPreference);

}


function SCORM2004_GetTextPreference(){

	var intTempPreference;
	
	WriteToDebug("In SCORM2004_GetTextPreference");
	
	SCORM2004_ClearErrorInfo();

	intTempPreference = SCORM2004_CallGetValue("cmi.learner_preference.audio_captioning");
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
		WriteToDebug("Returning Off");
		return PREFERENCE_OFF;
	}
	else{
		WriteToDebug("Error: Invalid preference");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_PREFERENCE, 
								  "Invalid text preference received from LMS", 
								  "intTempPreference=" + intTempPreference);
		return null;
	}
}



//---------------------------------------------------------------------------------
//Time Management Functions
function SCORM2004_GetPreviouslyAccumulatedTime(){
	
	var strIso8601Time;
	var intMilliseconds;
	
	WriteToDebug("In SCORM2004_GetPreviouslyAccumulatedTime");
	

	SCORM2004_ClearErrorInfo();
	
	strIso8601Time = SCORM2004_CallGetValue("cmi.total_time")
	
	WriteToDebug("strIso8601Time=" + strIso8601Time);

	if (! IsValidIso8601TimeSpan(strIso8601Time)){		
		WriteToDebug("ERROR - Invalid Iso8601Time");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_TIMESPAN, 
									"Invalid timespan received from LMS", 
									"strTime=" + strIso8601Time);	
		return null;
	}
	
	intMilliseconds = ConvertScorm2004TimeToMS(strIso8601Time);
	
	WriteToDebug("Returning " + intMilliseconds);
	
	return intMilliseconds;

}


function SCORM2004_SaveTime(intMilliSeconds){

	var strISO8601Time;
	
	WriteToDebug("In SCORM2004_SaveTime intMilliSeconds=" + intMilliSeconds);
	
	SCORM2004_ClearErrorInfo();
	
	strISO8601Time = ConvertMilliSecondsIntoSCORM2004Time(intMilliSeconds);
	
	WriteToDebug("strISO8601Time=" + strISO8601Time);
	
	return SCORM2004_CallSetValue("cmi.session_time", strISO8601Time);
}

function SCORM2004_GetMaxTimeAllowed(){

	var strIso8601Time;
	var intMilliseconds;
	
	WriteToDebug("In SCORM2004_GetMaxTimeAllowed");


	SCORM2004_ClearErrorInfo();
	
	strIso8601Time = SCORM2004_CallGetValue("cmi.max_time_allowed")
	
	WriteToDebug("strIso8601Time=" + strIso8601Time);
	
	if (strIso8601Time == ""){
		strIso8601Time = "20Y";
	}

	if (! IsValidIso8601TimeSpan(strIso8601Time)){		
		WriteToDebug("ERROR - Invalid Iso8601Time");
		SCORM2004_SetErrorInfoManually(SCORM_ERROR_INVALID_TIMESPAN, 
									"Invalid timespan received from LMS", 
									"strIso8601Time=" + strIso8601Time);	
		return null;
	}
	
	intMilliseconds = ConvertScorm2004TimeToMS(ConvertScorm2004TimeToMS);
	
	WriteToDebug("intMilliseconds=" + intMilliseconds);
	
	return intMilliseconds;

}



function SCORM2004_DisplayMessageOnTimeout(){

	var strTLA;
	WriteToDebug("In SCORM2004_DisplayMessageOnTimeout");
	
	SCORM2004_ClearErrorInfo();
	
	
	strTLA = SCORM2004_CallGetValue("cmi.time_limit_action");
	
	WriteToDebug("strTLA=" + strTLA);
	
	if (strTLA == SCORM2004_TLA_EXIT_MESSAGE || strTLA == SCORM2004_TLA_CONTINUE_MESSAGE){
		WriteToDebug("returning true");
		return true;
	}
	else if(strTLA == SCORM2004_TLA_EXIT_NO_MESSAGE || strTLA == SCORM2004_TLA_CONTINUE_NO_MESSAGE || strTLA == ""){
		WriteToDebug("returning false");
		return false;
	}
	else{
		WriteToDebug("Error invalid TLA");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_TIME_LIMIT_ACTION, 
								  "Invalid time limit action received from LMS", 
								  "strTLA=" + strTLA);	
	
		return null;
	}
	
}

function SCORM2004_ExitOnTimeout(){

	var strTLA;
	
	WriteToDebug("In SCORM2004_ExitOnTimeout");
	
	SCORM2004_ClearErrorInfo();
	
	strTLA = SCORM2004_CallGetValue("cmi.time_limit_action");
	
	WriteToDebug("strTLA=" + strTLA);
	
	if (strTLA == SCORM2004_TLA_EXIT_MESSAGE || strTLA == SCORM2004_TLA_EXIT_NO_MESSAGE){
		WriteToDebug("returning true");
		return true;
	}
	else if(strTLA == SCORM2004_TLA_CONTINUE_MESSAGE || strTLA == SCORM2004_TLA_CONTINUE_NO_MESSAGE || strTLA == ""){
		WriteToDebug("returning false");
		return false;
	}
	else{
		WriteToDebug("ERROR invalid TLA");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_TIME_LIMIT_ACTION, 
								  "Invalid time limit action received from LMS", 
								  "strTLA=" + strTLA);	
	
		return null;
	}

}


function SCORM2004_GetPassingScore(){
	var fltScore;
	
	WriteToDebug("In SCORM2004_GetPassingScore");
	
	SCORM2004_ClearErrorInfo();
	
	fltScore = SCORM2004_CallGetValue("cmi.scaled_passing_score")
	
	WriteToDebug("fltScore=" + fltScore);
	
	if (fltScore == ""){
		fltScore = 0;
	}
	
	if ( ! IsValidDecimal(fltScore)){
		WriteToDebug("Error - score is not a valid decimal");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_DECIMAL, 
								  "Invalid mastery score received from LMS", 
								  "fltScore=" + fltScore);		
		return null;
	}
	
	fltScore = parseFloat(fltScore);
	
	//multiply by 100 to normalize from -1 to 1 to 0-100 - (we always set the score so we know it won't be negative)
	fltScore = fltScore * 100;
	
	WriteToDebug("returning fltScore-" + fltScore);
	
	return fltScore;
}


function SCORM2004_SetScore(intScore, intMaxScore, intMinScore){
	
	var blnResult;
	var fltNormalizedScore;

	
	WriteToDebug("In SCORM2004_SetScore intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);

	SCORM2004_ClearErrorInfo();
	
	fltNormalizedScore = intScore / 100;

	var strPercentScore = fltNormalizedScore.toString();
	var nPos = strPercentScore.lastIndexOf(".");
	
	if (nPos >= 0 && strPercentScore.length - 5 > nPos)
	{
		strPercentScore = strPercentScore.substring(0, nPos + 5);
	}	
	
	blnResult = SCORM2004_CallSetValue("cmi.score.raw", intScore);
	blnResult = SCORM2004_CallSetValue("cmi.score.max", intMaxScore) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.score.min", intMinScore) && blnResult;
	
	blnResult = SCORM2004_CallSetValue("cmi.score.scaled", strPercentScore) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}

function SCORM2004_GetScore(){

		
	WriteToDebug("In SCORM2004_GetScore");
	
	SCORM2004_ClearErrorInfo();
	
	return SCORM2004_CallGetValue("cmi.score.raw");

}

function SCORM2004_GetScaledScore(){

		
	WriteToDebug("In SCORM2004_GetScaledScore");
	
	SCORM2004_ClearErrorInfo();
	
	return SCORM2004_CallGetValue("cmi.score.scaled");

}

function SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004InteractionType){
	
	var blnResult;
	var intInteractionIndex;
	var strResult;
	
	blnCorrect = new String(blnCorrect);  //have to cast as string to support false
	
	
	SCORM2004_ClearErrorInfo();
	
	intInteractionIndex = SCORM2004_CallGetValue("cmi.interactions._count");
	
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);
	
	if (intInteractionIndex == ""){
		WriteToDebug("Setting Interaction Index to 0");
		intInteractionIndex = 0;
	}
	
	//need to leave support for blnCorrect=t/f for legacy implementations of RSECA
	if (blnCorrect == true || blnCorrect =="true" || blnCorrect == INTERACTION_RESULT_CORRECT){
		strResult = SCORM2004_RESULT_CORRECT;
	}
	else if (String(blnCorrect) == "false" || blnCorrect == INTERACTION_RESULT_WRONG){		//compare against the string "false" because ("" == false) evaluates to true
		strResult = SCORM2004_RESULT_WRONG;
	}
	else if (blnCorrect == INTERACTION_RESULT_UNANTICIPATED){
		strResult = SCORM2004_RESULT_UNANTICIPATED;
	}
	else if (blnCorrect == INTERACTION_RESULT_NEUTRAL){
		strResult = SCORM2004_RESULT_NEUTRAL;
	}
	else{
		strResult = "";
	}
	
	WriteToDebug("strResult=" + strResult);
	
	strID = CreateValidIdentifier(strID);
	
	blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".id", strID);
	blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".type", SCORM2004InteractionType) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".learner_response", strResponse) && blnResult;
	
	if (strResult != undefined && strResult != null && strResult != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".result", strResult) && blnResult;
	}
	
	if (strCorrectResponse != undefined && strCorrectResponse != null && strCorrectResponse != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".correct_responses.0.pattern", strCorrectResponse) && blnResult;
	}
	
	if (strDescription != undefined && strDescription != null && strDescription != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".description", strDescription) && blnResult;
	}
	
	if (intWeighting != undefined && intWeighting != null && intWeighting != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".weighting", intWeighting) && blnResult;
	}

	if (intLatency != undefined && intLatency != null && intLatency != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".latency", ConvertMilliSecondsIntoSCORM2004Time(intLatency)) && blnResult;
	}
	
	if (strLearningObjectiveID != undefined && strLearningObjectiveID != null && strLearningObjectiveID != ""){
		blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".objectives.0.id", strLearningObjectiveID) && blnResult;
	}
	
	blnResult = SCORM2004_CallSetValue("cmi.interactions." + intInteractionIndex + ".timestamp", ConvertDateToIso8601TimeStamp(dtmTime)) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}

function SCORM2004_RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordTrueFalseInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	var strResponse = "";
	var strCorrectResponse = null;
	
	if (blnResponse){
		strResponse = "true";
	}
	else{
		strResponse = "false";
	}
	
	if (blnCorrectResponse == true){
		strCorrectResponse = "true";
	}
	else if(blnCorrectResponse == false){		//test for false b/c it could be null in which case we want to leave it as ""
		strCorrectResponse = "false";
	}	
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_TRUE_FALSE);
}


function SCORM2004_RecordMultipleChoiceInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordMultipleChoiceInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse = "";
	var strCorrectResponse = "";
	
	for (var i=0; i < aryResponse.length; i++){
	
		if (strResponse.length > 0) {strResponse += "[,]";}
		strResponse += aryResponse[i].Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += "[,]";}
		strCorrectResponse += aryCorrectResponse[i].Long;
	}
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_CHOICE);
}


function SCORM2004_RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordFillInInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var interactionType;
	
	if (strCorrectResponse == null){
		strCorrectResponse = "";
	}
	
	strCorrectResponse = new String(strCorrectResponse);
	
	if (strCorrectResponse.length > 250 || strResponse.length > 250){
		interactionType = SCORM2004_INTERACTION_TYPE_LONG_FILL_IN;
	}
	else{
		interactionType = SCORM2004_INTERACTION_TYPE_FILL_IN;
	}
	
	if (strCorrectResponse.length > 4000){strCorrectResponse = strCorrectResponse.substr(0, 4000);}
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, interactionType);
}

function SCORM2004_RecordMatchingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordMatchingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse = "";
	var strCorrectResponse = "";

	for (var i=0; i < aryResponse.length; i++){
	
		if (strResponse.length > 0) {strResponse += "[,]";}
		strResponse += aryResponse[i].Source.Long + "[.]" + aryResponse[i].Target.Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += "[,]";}
		strCorrectResponse += aryCorrectResponse[i].Source.Long + "[.]" + aryCorrectResponse[i].Target.Long;
	}	
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_MATCHING);
}

function SCORM2004_RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordPerformanceInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	strResponse = new String(strResponse);
	if (strResponse.length > 250){strResponse = strResponse.substr(0, 250);}

	if (strCorrectResponse == null){
		strCorrectResponse = "";
	}
		
	strCorrectResponse = new String(strCorrectResponse);
	if (strCorrectResponse.length > 250){strCorrectResponse = strCorrectResponse.substr(0, 250);}
	
	//we're only recording the step answer, not the step name
	strResponse = "[.]" + strResponse;
	strCorrectResponse = "[.]" + strCorrectResponse;
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_PERFORMANCE);
}

function SCORM2004_RecordSequencingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordSequencingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	var strResponse = "";
	var strCorrectResponse = "";
	
	for (var i=0; i < aryResponse.length; i++){
	
		if (strResponse.length > 0) {strResponse += "[,]";}
		strResponse += aryResponse[i].Long;
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += "[,]";}
		strCorrectResponse += aryCorrectResponse[i].Long;
	}
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_SEQUENCING);
}


function SCORM2004_RecordLikertInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In RecordLikertInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	var strResponse = response.Long;
	var strCorrectResponse = "";
	
	if (correctResponse != null){
		strCorrectResponse = correctResponse.Long;
	}
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_LIKERT);
}

function SCORM2004_RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In SCORM2004_RecordNumericInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	
	
	if (strCorrectResponse != undefined && strCorrectResponse != null && strCorrectResponse != ""){
		strCorrectResponse = strCorrectResponse + "[:]" + strCorrectResponse;
	}
	
	return SCORM2004_RecordInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime, SCORM2004_INTERACTION_TYPE_NUMERIC);
}



function SCORM2004_GetEntryMode(){
	var strEntry;
	
	WriteToDebug("In SCORM2004_GetEntryMode");
	
	SCORM2004_ClearErrorInfo();
	
	strEntry = SCORM2004_CallGetValue("cmi.entry");
	
	WriteToDebug("strEntry=" + strEntry);
	
	if (strEntry == SCORM2004_ENTRY_ABINITIO){
		WriteToDebug("Returning first time");
		return ENTRY_FIRST_TIME;
	}
	else if (strEntry == SCORM2004_ENTRY_RESUME){
		WriteToDebug("Returning resume");
		return ENTRY_RESUME;
	}
	else if (strEntry == SCORM2004_ENTRY_NORMAL){
		WriteToDebug("returning normal");
		return ENTRY_REVIEW;
	}
	else{
		WriteToDebug("ERROR - invalid entry mode");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_ENTRY, 
						"Invalid entry vocab received from LMS", 
						"strEntry=" + strEntry);
		return null;
	}

}

function SCORM2004_GetLessonMode(){

	var strLessonMode;
	
	WriteToDebug("In SCORM2004_GetLessonMode");
	
	SCORM2004_ClearErrorInfo();
	
	strLessonMode = SCORM2004_CallGetValue("cmi.mode");
	
	WriteToDebug("strLessonMode=" + strLessonMode);
	
	if (strLessonMode == SCORM2004_BROWSE){
		WriteToDebug("Returning browse");
		return MODE_BROWSE;
	}
	else if(strLessonMode == SCORM2004_NORMAL){
		WriteToDebug("returning normal");
		return MODE_NORMAL;
	}
	else if(strLessonMode == SCORM2004_REVIEW){
		WriteToDebug("Returning Review");
		return MODE_REVIEW;
	}
	else{
		WriteToDebug("ERROR - invalid lesson mode");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_LESSON_MODE, 
								"Invalid lesson_mode vocab received from LMS", 
								"strLessonMode=" + strLessonMode);
		return null;	
	}
	
}

function SCORM2004_GetTakingForCredit(){
	
	var strCredit;
	
	WriteToDebug("In SCORM2004_GetTakingForCredit");
	
	SCORM2004_ClearErrorInfo();
	
	strCredit = SCORM2004_CallGetValue("cmi.credit");
	
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
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_CREDIT, 
								  "Invalid credit vocab received from LMS", 
								  "strCredit=" + strCredit);
		return null;
	}
}



function SCORM2004_SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore){
	
	var intObjectiveIndex;
	var blnResult;
	var fltNormalizedScore;
	
	WriteToDebug("In SCORM2004_SetObjectiveScore, strObejctiveID=" + strObjectiveID + ", intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	fltNormalizedScore = intScore / 100;
	
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".id", strObjectiveID);
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".score.raw", intScore) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".score.max", intMaxScore) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".score.min", intMinScore) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".score.scaled", fltNormalizedScore) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
	
}


function SCORM2004_SetObjectiveStatus(strObjectiveID, Lesson_Status){

	var intObjectiveIndex;
	var blnResult;
	var strSCORMSuccessStatus = "";
	var strSCORMCompletionStatus = "";
	
	WriteToDebug("In SCORM2004_SetObjectiveStatus strObjectiveID=" + strObjectiveID + ", Lesson_Status=" + Lesson_Status);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	if (Lesson_Status == LESSON_STATUS_PASSED){
		strSCORMSuccessStatus = SCORM2004_PASSED;
		strSCORMCompletionStatus = SCORM2004_COMPLETED;
	}
	else if (Lesson_Status == LESSON_STATUS_FAILED){
		strSCORMSuccessStatus = SCORM2004_FAILED;
		strSCORMCompletionStatus = SCORM2004_COMPLETED;
	}
	else if (Lesson_Status == LESSON_STATUS_COMPLETED){
		strSCORMSuccessStatus = SCORM2004_UNKNOWN;
		strSCORMCompletionStatus = SCORM2004_COMPLETED;
	}
	else if (Lesson_Status == LESSON_STATUS_BROWSED){
		strSCORMSuccessStatus = SCORM2004_UNKNOWN;
		strSCORMCompletionStatus = SCORM2004_COMPLETED;
	}
	else if (Lesson_Status == LESSON_STATUS_INCOMPLETE){
		strSCORMSuccessStatus = SCORM2004_UNKNOWN;
		strSCORMCompletionStatus = SCORM2004_INCOMPLETE;
	}
	else if (Lesson_Status == LESSON_STATUS_NOT_ATTEMPTED){
		strSCORMSuccessStatus = SCORM2004_UNKNOWN;
		strSCORMCompletionStatus = SCORM2004_NOT_ATTEMPTED;
	}
	
	WriteToDebug("strSCORMSuccessStatus=" + strSCORMSuccessStatus);
	WriteToDebug("strSCORMCompletionStatus=" + strSCORMCompletionStatus);
	
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".id", strObjectiveID);
	
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".success_status", strSCORMSuccessStatus) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".completion_status", strSCORMCompletionStatus) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}


function SCORM2004_SetObjectiveDescription(strObjectiveID, strObjectiveDescription){

	var intObjectiveIndex;
	
	WriteToDebug("In SCORM2004_SetObjectiveDescription strObjectiveID=" + strObjectiveID + ", strObjectiveDescription=" + strObjectiveDescription);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	
	
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".id", strObjectiveID);
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".description", strObjectiveDescription) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
}


function SCORM2004_GetObjectiveScore(strObjectiveID){

	var intObjectiveIndex;
		
	WriteToDebug("In SCORM2004_GetObjectiveScore, strObejctiveID=" + strObjectiveID);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);

	return SCORM2004_CallGetValue("cmi.objectives." + intObjectiveIndex + ".score.raw");

}


function SCORM2004_GetObjectiveStatus(strObjectiveID){

	var intObjectiveIndex;
	var strSuccessStatus;
	var strCompletionStatus;
	
	WriteToDebug("In SCORM2004_GetObjectiveStatus, strObejctiveID=" + strObjectiveID);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);

	strSuccessStatus = SCORM2004_CallGetValue("cmi.objectives." + intObjectiveIndex + ".success_status");
	strCompletionStatus = SCORM2004_CallGetValue("cmi.objectives." + intObjectiveIndex + ".completion_status");
	
	if (strSuccessStatus == SCORM2004_PASSED){
		WriteToDebug("returning Passed");
		return LESSON_STATUS_PASSED;
	}
	else if (strSuccessStatus == SCORM2004_FAILED){
		WriteToDebug("Returning Failed");
		return LESSON_STATUS_FAILED;
	}
	else if (strCompletionStatus == SCORM2004_COMPLETED){
		WriteToDebug("Returning Completed");
		return LESSON_STATUS_COMPLETED;
	}
	else if (strCompletionStatus == SCORM2004_INCOMPLETE){
		WriteToDebug("Returning Incomplete");
		return LESSON_STATUS_INCOMPLETE;
	}
	else if (strCompletionStatus == SCORM2004_NOT_ATTEMPTED || strCompletionStatus == SCORM2004_UNKNOWN || strCompletionStatus == ""){
		WriteToDebug("Returning Not Attempted");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
	else{
		WriteToDebug("ERROR - status not found");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_STATUS, 
								"Invalid objective status received from LMS or initial status not yet recorded for objective", 
								"strCompletionStatus=" + strCompletionStatus);
		return null;

	}	

}

function SCORM2004_GetObjectiveProgressMeasure(strObjectiveID){
	
	var strProgressMeasure = SCORM2004_CallGetValue("cmi.objectives." + strObjectiveID + ".progress_measure");
	
	return strProgressMeasure;

}


function SCORM2004_GetObjectiveDescription(strObjectiveID){

	var intObjectiveIndex;
	var strSuccessStatus;
	var strCompletionStatus;
	
	WriteToDebug("In SCORM2004_GetObjectiveDescription, strObejctiveID=" + strObjectiveID);
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);

	strDescription = SCORM2004_CallGetValue("cmi.objectives." + intObjectiveIndex + ".description");
	
    return strDescription;

}

function SCORM2004_FindObjectiveIndexFromID(strObjectiveID){

	var intCount;
	var i;
	var strTempID;
	
	WriteToDebug("In SCORM2004_FindObjectiveIndexFromID");
	
	intCount = SCORM2004_CallGetValue("cmi.objectives._count");
	
	if (intCount == ""){
		WriteToDebug("Setting intCount=0");
		return 0;
	}
	
	intCount = parseInt(intCount, 10);
	
	WriteToDebug("intCount=" + intCount);
	
	for (i=0; i<intCount; i++){
	
		WriteToDebug("Checking index " + i);
		
		strTempID = SCORM2004_CallGetValue("cmi.objectives." + i + ".id");
		
		WriteToDebug("ID=" + strTempID);
		
		if (strTempID == strObjectiveID){
			WriteToDebug("Found Matching index");
			return i;
		}
	}
	
	WriteToDebug("Did not find match, returning count");
	
	return intCount;
}


//---------------------------------------------------------------------------------
//Status Management Functions

function SCORM2004_SetFailed(){
	
	WriteToDebug("In SCORM2004_SetFailed");
	
	var blnResult;
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.success_status", SCORM2004_FAILED);
	blnResult = SCORM2004_CallSetValue("cmi.completion_status", SCORM2004_COMPLETED) && blnResult;
	
	return blnResult;
}

function SCORM2004_SetPassed(){

	WriteToDebug("In SCORM2004_SetPassed");
	
	var blnResult;
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.success_status", SCORM2004_PASSED);
	blnResult = SCORM2004_CallSetValue("cmi.completion_status", SCORM2004_COMPLETED) && blnResult;
	
	return blnResult;
}

function  SCORM2004_SetCompleted(){

	WriteToDebug("In SCORM2004_SetCompleted");
	
	var blnResult;
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.completion_status", SCORM2004_COMPLETED);
	
	return blnResult;
}

function SCORM2004_ResetStatus(){
	
	WriteToDebug("In SCORM2004_ResetStatus");
	
	var blnResult;
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.success_status", SCORM2004_UNKNOWN);
	blnResult = SCORM2004_CallSetValue("cmi.completion_status", SCORM2004_INCOMPLETE) && blnResult;
	
	return blnResult;
}

function SCORM2004_GetStatus(){
	
	var strSuccessStatus;
	var strCompletionStatus;
	
	WriteToDebug("In SCORM2004_GetStatus");
	
	SCORM2004_ClearErrorInfo();
	
	strSuccessStatus = SCORM2004_CallGetValue("cmi.success_status");
	strCompletionStatus = SCORM2004_CallGetValue("cmi.completion_status");
	
	WriteToDebug("strSuccessStatus=" + strSuccessStatus);
	WriteToDebug("strCompletionStatus=" + strCompletionStatus);
	
	if (strSuccessStatus == SCORM2004_PASSED){
		WriteToDebug("returning Passed");
		return LESSON_STATUS_PASSED;
	}
	else if (strSuccessStatus == SCORM2004_FAILED){
		WriteToDebug("Returning Failed");
		return LESSON_STATUS_FAILED;
	}
	else if (strCompletionStatus == SCORM2004_COMPLETED){
		WriteToDebug("Returning Completed");
		return LESSON_STATUS_COMPLETED;
	}
	else if (strCompletionStatus == SCORM2004_INCOMPLETE){
		WriteToDebug("Returning Incomplete");
		return LESSON_STATUS_INCOMPLETE;
	}
	else if (strCompletionStatus == SCORM2004_NOT_ATTEMPTED || strCompletionStatus == SCORM2004_UNKNOWN){
		WriteToDebug("Returning Not Attempted");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
	else{
		WriteToDebug("ERROR - status not found");
		SCORM2004_SetErrorInfoManually(SCORM2004_ERROR_INVALID_STATUS, 
								"Invalid lesson status received from LMS", 
								"strCompletionStatus=" + strCompletionStatus);
		return null;

	}
	
					
}

//public
function SCORM2004_GetProgressMeasure(){
	WriteToDebug("In SCORM2004_GetProgressMeasure");
	
	var blnResult;
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallGetValue("cmi.progress_measure");
	
	return blnResult;
}
/*
	cmi.progress_measure cmi.completion_status 
	0 Ònot attemptedÓ 
	1 ÒcompletedÓ 
	0 > value < 1 ÒincompleteÓ (typically, unless a cmi.completion_threshold is defined and the cmi.progress_measure is >= the cmi.completion_threshold) 


	GetValue(Òcmi.progress_measureÓ) 
	SetValue(Òcmi.progress_measureÓ,Ó0.75Ó) 
	SetValue(Òcmi.progress_measureÓ,Ó1.0Ó) 

*/

//public
function SCORM2004_SetProgressMeasure(numMeasure){
	WriteToDebug("In SCORM2004_SetProgressMeasure");
	
	var blnResult;
	
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.progress_measure", numMeasure);
	
	return blnResult;
}

function SCORM2004_SetObjectiveProgressMeasure(strObjectiveID, numMeasure){
	WriteToDebug("In SCORM2004_SetObjectiveProgressMeasure");
	var intObjectiveIndex;
	var blnResult;
	
	WriteToDebug("In SCORM2004_SetObjectiveProgressMeasure, strObejctiveID=" + strObjectiveID + ", numMeasure=" + numMeasure );
	
	SCORM2004_ClearErrorInfo();
	
	intObjectiveIndex = SCORM2004_FindObjectiveIndexFromID(strObjectiveID);
	
	WriteToDebug("intObjectiveIndex=" + intObjectiveIndex);
	
	SCORM2004_ClearErrorInfo();
	
	blnResult = SCORM2004_CallSetValue("cmi.objectives." + intObjectiveIndex + ".progress_measure", numMeasure);
	
	return blnResult;
}

function SCORM2004_IsContentInBrowseMode(){
	
	var strLessonMode
	
	WriteToDebug("In SCORM2004_IsContentInBrowseMode");
	
	strLessonMode = SCORM2004_CallGetValue("cmi.mode");
	
	WriteToDebug("SCORM2004_IsContentInBrowseMode,  strLessonMode=" + strLessonMode);
	
	if (strLessonMode == SCORM2004_BROWSE){
		WriteToDebug("Returning true");
		return true;
	}
	else{
		WriteToDebug("Returning false");
		return false;
	}
}


function SCORM2004_TranslateExitTypeToSCORM(strExitType){
	
	WriteToDebug("In SCORM2004_TranslatgeExitTypeToSCORM strExitType-" + strExitType);
	
	if (strExitType == EXIT_TYPE_SUSPEND){
		WriteToDebug("Returning suspend");
		return SCORM2004_SUSPEND;
	}
	else if (strExitType == EXIT_TYPE_UNLOAD){
		WriteToDebug("Returning Exit");
		return SCORM2004_NORMAL_EXIT;
	}
	else if (strExitType == EXIT_TYPE_FINISH){
		WriteToDebug("Returning Logout");
		return SCORM2004_NORMAL_EXIT;
	}
	else if (strExitType == EXIT_TYPE_TIMEOUT){
		WriteToDebug("Returning Timout");
		return SCORM2004_TIMEOUT;
	}
}


function SCORM2004_GetCompletionStatus(){
	
	WriteToDebug("In SCORM2004_GetCompletionStatus");
	
	return SCORM2004_COMPLETED;
	
}

function SCORM2004_SetPointBasedScore(intScore, intMaxScore, intMinScore){
	
	var blnResult;
	var fltCalculatedScore;
	
	WriteToDebug("In SCORM2004_SetPointBasedScore intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);

	SCORM2004_ClearErrorInfo();
	
	if(intScore >= intMinScore)
	{
		fltCalculatedScore = intScore / intMaxScore;
	}else{
		WriteToDebug("intScore is lower than intMinScore. Overriding score with minscore for cmi.score.scaled");
		fltCalculatedScore = intMinScore / intMaxScore;
	}
	fltCalculatedScore = RoundToPrecision(fltCalculatedScore, 7);
	
	blnResult = SCORM2004_CallSetValue("cmi.score.raw", intScore);
	blnResult = SCORM2004_CallSetValue("cmi.score.max", intMaxScore) && blnResult;
	blnResult = SCORM2004_CallSetValue("cmi.score.min", intMinScore) && blnResult;
	
	blnResult = SCORM2004_CallSetValue("cmi.score.scaled", fltCalculatedScore) && blnResult;
	
	WriteToDebug("Returning " + blnResult);
	
	return blnResult;
	
}


//___________________________________________________________
//Interaction Retrieval Functionality
//NOTE ON INTERACTION RETRIEVAL
//A.  It is only available in certain standards, standards where it is unavailable will return nothing
//B.  The interaction records are currently reported using "journaling", whereby each entry is appended
//		Retrieval methods will retrieve only the most recent value


//___________________________________________________________
//Helper Methods
function SCORM2004_FindInteractionIndexFromID(strInteractionID){

	//with interactions, this method returns the index for the MOST RECENT (by timestamp)
	//interaction with this identifier

	var intCount;
	var i;
	var strTempID;
	var dtmTempDate = new Date();
	var index;
	var currentIndexTimestamp = new Date("1/1/1900");
	
	
	WriteToDebug("In SCORM2004_FindInteractionIndexFromID");
	
	intCount = SCORM2004_CallGetValue("cmi.interactions._count");
	
	if (intCount == ""){
		WriteToDebug("Setting intCount=0");
		return null;
	}
	
	intCount = parseInt(intCount, 10);
	
	WriteToDebug("intCount=" + intCount);
	
	for (i=0; i<intCount; i++){
	
		WriteToDebug("Checking index " + i);
		
		strTempID = SCORM2004_CallGetValue("cmi.interactions." + i + ".id");
		
		WriteToDebug("ID=" + strTempID);
		
		if (strTempID == strInteractionID){
			WriteToDebug("Found Matching index: " + i);
			//this is NOT a call to SCORM2004_GetInteractionTimestamp because that will use this method to loop
			dtmTempDate = ConvertIso8601TimeStampToDate(SCORM2004_CallGetValue("cmi.interactions." + i + ".timestamp"));
			
			WriteToDebug("timestamp for " + i + ": " + dtmTempDate);
			
			if (dtmTempDate>currentIndexTimestamp)
			{
				index = i;
				currentIndexTimestamp = dtmTempDate;
			}
		}
	}
	
	if (index>=0) return index;
	
	WriteToDebug("Did not find match, returning null");
	
	return null;
}
//___________________________________________________________


function SCORM2004_GetInteractionType(strInteractionID)
{

	var intInteractionIndex;
		
	WriteToDebug("In SCORM2004_GetInteractionType, strInteractionID=" + strInteractionID);
	
	SCORM2004_ClearErrorInfo();
	
	intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);

	
	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}

	
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	var type = SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".type");
	
	switch (type)
	{
		case SCORM2004_INTERACTION_TYPE_FILL_IN:
			return INTERACTION_TYPE_FILL_IN;
		case SCORM2004_INTERACTION_TYPE_LONG_FILL_IN:
			return INTERACTION_TYPE_LONG_FILL_IN;
		case SCORM2004_INTERACTION_TYPE_CHOICE:
			return INTERACTION_TYPE_CHOICE;
		case SCORM2004_INTERACTION_TYPE_LIKERT:
			return INTERACTION_TYPE_LIKERT;
		case SCORM2004_INTERACTION_TYPE_MATCHING:
			return INTERACTION_TYPE_MATCHING;
		case SCORM2004_INTERACTION_TYPE_NUMERIC:
			return INTERACTION_TYPE_NUMERIC;
		case SCORM2004_INTERACTION_TYPE_PERFORMANCE:
			return INTERACTION_TYPE_PERFORMANCE;
		case SCORM2004_INTERACTION_TYPE_SEQUENCING:
			return INTERACTION_TYPE_SEQUENCING;
		case SCORM2004_INTERACTION_TYPE_TRUE_FALSE:
			return INTERACTION_TYPE_TRUE_FALSE;
		default:
			return "";
	}
	

}

//public
function SCORM2004_GetInteractionTimestamp(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionTimestamp, strInteractionID=" + strInteractionID);
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();



	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}

	

	return SCORM2004_CallGetValue(ConvertIso8601TimeStampToDate("cmi.interactions." + intInteractionIndex + ".timestamp"));

}



//public
function SCORM2004_GetInteractionCorrectResponses(strInteractionID)
{

	WriteToDebug("In SCORM2004_GetInteractionCorrectResponses, strInteractionID=" + strInteractionID);
	
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();
	
	
	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}
	
	
	var strType = SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".type");
	
	var intCorrectResponseCount = SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".correct_responses._count");
	
	
	if (intCorrectResponseCount == ""){
		WriteToDebug("Setting intCorrectResponseCount=0");
		return 0;
	}
	
	intCorrectResponseCount = parseInt(intCorrectResponseCount, 10);
	WriteToDebug("intCorrectResponseCount=" + intCorrectResponseCount);
	if (intCorrectResponseCount==0) return new Array();
	if (intCorrectResponseCount>1) WriteToDebug("SCORM Driver is not currently implemented to support multiple correct response combinations and will only return the first");
	
	var strResponse = new String(SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".correct_responses.0.pattern"));
	var aryResponse = strResponse.split("[,]");
	WriteToDebug("aryResponse.length = " + aryResponse.length);
	aryResponse = SCORM2004_ProcessResponseArray(strType, aryResponse);
	
	/*
	//this is the basis for handling N correct responses
	//because the API currently does not allow for the posting of multiple
	//correct response combinations, this functionality is not currently 
	//implemented
	var aryResponses = new Array();
	
	for (i=0; i<intCorrectResponseCount; i++)
	{
		WriteToDebug("examining CorrectResponse: " + i);
		var strResponse = new String(SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".correct_responses." + i + ".pattern"));
		var aryResponse = strResponse.split("[,]");
		WriteToDebug("aryResponses.length = " + aryResponses.length);
		aryResponse = SCORM2004_ProcessResponseArray(strType, aryResponse);
		aryResponses.push(aryResponse);
	}
	*/
	
	

	
	WriteToDebug("aryResponse.length = " + aryResponse.length);
	return aryResponse;
	

	
}



//public
function SCORM2004_GetInteractionWeighting(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionWeighting, strInteractionID=" + strInteractionID);
	
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();
	
	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}

	return SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".weighting");

}



//public
function SCORM2004_GetInteractionLearnerResponses(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionLearnerResponses, strInteractionID=" + strInteractionID);
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();

	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}

	
	var strType = SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".type");

	var strResponse = new String(SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".learner_response"));
	
	var aryResponses = strResponse.split("[,]");
	
	WriteToDebug("aryResponses.length = " + aryResponses.length);
	
	aryResponses = SCORM2004_ProcessResponseArray(strType, aryResponses);
	
	return aryResponses;
}

function SCORM2004_ProcessResponseArray(strInteractionType, aryResponses)
{
	//process them (into ResponseIdentifiers, etc?)
	//only include the right amount of stuff
	
	WriteToDebug("Processing Response Array with " + aryResponses.length + " pieces");
	
	
	for(var i=0; i<aryResponses.length; i++)
	{
		if (strInteractionType == SCORM2004_INTERACTION_TYPE_MATCHING)
		{
			WriteToDebug("processing matching type, i=" + i);
			aryResponses[i] = CreateMatchingResponse(aryResponses[i]);
		}
	}
	
	return aryResponses;

}

//public
function SCORM2004_GetInteractionResult(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionResult, strInteractionID=" + strInteractionID);

	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();

	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}
	

	return SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".result");

	
}



//public
function SCORM2004_GetInteractionLatency(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionLatency, strInteractionID=" + strInteractionID);
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();

	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}
	
	var strLatency = SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".latency");
	
	WriteToDebug("latency returns: " + strLatency);
	var intLatency = ConvertScorm2004TimeToMS(strLatency);
	WriteToDebug("latency in milliseconds: " + intLatency);

	return intLatency;

}



//public
function SCORM2004_GetInteractionDescription(strInteractionID)
{
	WriteToDebug("In SCORM2004_GetInteractionDescription, strInteractionID=" + strInteractionID);
	var intInteractionIndex = SCORM2004_FindInteractionIndexFromID(strInteractionID);
	WriteToDebug("intInteractionIndex=" + intInteractionIndex);

	SCORM2004_ClearErrorInfo();
	
	if(intInteractionIndex == undefined || intInteractionIndex == null){
		return null;
	}
	

	return SCORM2004_CallGetValue("cmi.interactions." + intInteractionIndex + ".description");

	
}

//________________________________________________


//public
function SCORM2004_CreateDataBucket(strBucketId, intMinSize, intMaxSize, strPersistenceType){

	WriteToDebug("In SCORM2004_CreateDataBucket, strBucketId=" + strBucketId + ", intMinSize=" + intMinSize + ", intMaxSize=" + intMaxSize + ", course=" + strPersistenceType);
    
    if (SCORM2004_DetectSSPSupport()){
        
        if (SCORM2004_DoesBucketExist(strBucketId) == true){
            WriteToDebug("Bucket already exists and can't be re-allocated.");
            return false;
        }
        else{
            return SCORM2004_CallSetValue("ssp.allocate", "{bucketID=" + strBucketId + "}{requested=" + intMaxSize + "}{minimum=" + intMinSize + "}{reducible=true}{persistence="+ strPersistenceType +"}")//")
        }
    }
    else{
        WriteToDebug("SSP is not supported in this LMS, returning false.");
	    return false;
	}
}

//public
function SCORM2004_GetDataFromBucket(strBucketId){
	WriteToDebug("In SCORM2004_GetDataFromBucket, strBucketId=" + strBucketId);

	if (SCORM2004_DetectSSPSupport()){
        var data = SCORM2004_CallGetValue("ssp.data.{bucketID=" + strBucketId + "}");
        return data;
    }
    else{
        WriteToDebug("SSP is not supported in this LMS, returning empty string.");
	    return "";
	}
}

//public
function SCORM2004_PutDataInBucket(strBucketId, strData, blnAppendToEnd){
	WriteToDebug("In SCORM2004_PutDataInBucket, strBucketId=" + strBucketId + ", blnAppendToEnd=" + blnAppendToEnd + ", strData=" + strData);
    
    if (SCORM2004_DetectSSPSupport()){
    
        if (blnAppendToEnd == true){
            return SCORM2004_CallSetValue("ssp.appendData", "{bucketID=" + strBucketId + "}" + strData);
        }
        else{
            return SCORM2004_CallSetValue("ssp.data", "{bucketID=" + strBucketId + "}" + strData);
        }
    }
    else{
        WriteToDebug("SSP is not supported in this LMS, returning false.");
	    return false;
	}
}

//public
function SCORM2004_DetectSSPSupport(){

    WriteToDebug("In SCORM2004_DetectSSPSupport");
    
    if (blnSCORM2004_SSP_Is_Supported == true){
        WriteToDebug("Support already detected, returning true");
        return true;    
    }
    
    else if (blnSCORM2004_SSP_Is_Supported == false){
        WriteToDebug("Support already determined to me missing, returning false");
        return false;    
    }
    
    else{
        //make an error-free call to the SSP data model to see if it is supported
        var intBucketCount = SCORM2004_CallGetValue("ssp._count");
        
        //if the call succeed, then SSP is supported, otherwise it is not
        if (SCORM2004_GetLastError() == NO_ERROR){
            WriteToDebug("SSP data model call succeeded, SSP is supported");
            blnSCORM2004_SSP_Is_Supported = true;
            return true;
        }
        else{
            WriteToDebug("SSP data model call failed, SSP is NOT supported");
            blnSCORM2004_SSP_Is_Supported = false;
            return false;
        }
    }
}

//public
function SCORM2004_GetBucketInfo(strBucketId){
    
    WriteToDebug("In SCORM2004_GetBucketInfo, strBucketId=" + strBucketId);
    
    var intTotalSpace = 0;
    var intUsedSpace = 0;
    
    var strBucketState = new String(SCORM2004_CallGetValue("ssp.bucket_state.{bucketID=" + strBucketId + "}"));
    
    if (strBucketState == "" || strBucketState == null || strBucketState == undefined){
        WriteToDebug ("Could not retrieve bucket state, returning 0 total size and 0 used size");
        return new SSPBucketSize(0, 0);
    }
   
    var sectionArray = strBucketState.split("{");

    for (var section in sectionArray){
        
        section = new String(sectionArray[section]);
        
        section = section.replace("}", "");
        
        if (section.indexOf("totalSpace", 0) == 0){
            WriteToDebug("Found total space");
            intTotalSpace = parseInt(section.substr(11), 10);
            WriteToDebug("total space=" + intTotalSpace);
        }
        else if (section.indexOf("used", 0) == 0){
            WriteToDebug("Found used space");
            intUsedSpace = parseInt(section.substr(5), 10);
            WriteToDebug("used=" + intUsedSpace);
        }
    }
    
    var returnValue = new SSPBucketSize(intTotalSpace, intUsedSpace);
  
	return returnValue;
}

//private
function SCORM2004_DoesBucketExist(strBucketId){
    
    WriteToDebug("In SCORM2004_DoesBucketExist, strBucketId=" + strBucketId);
    
    var intBucketCount = SCORM2004_CallGetValue("ssp._count");
    intBucketCount = parseInt(intBucketCount, 10);
    
    for (var i=0; i < intBucketCount; i++){
        if (strBucketId == SCORM2004_CallGetValue("ssp." + i + ".id")){
            WriteToDebug("Bucket '" + strBucketId + "' Exists");
            return true;
        }
    }
    
    WriteToDebug("Bucket '" + strBucketId + "' DOES NOT Exist");
    return false;
}



//---------------------------------------------------------------------------------
//Functions to Call the SCORM API

//note: in all functions that interact with API, we concact any returned strings with "" to convert
//the value to a string type, do this b/c many SCORM API's will return a Java String instead of a Javascript
//string


function SCORM2004_CallInitialize(){

	var strResult;
	
	WriteToDebug("In SCORM2004_CallInitialize");
	
	SCORM2004_objAPI = SCORM2004_GrabAPI();
	
	WriteToDebug("Calling Initialize");
	
	strResult = SCORM2004_objAPI.Initialize("");
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM2004_FALSE){
		
		WriteToDebug("Detected failed call to initialize");
		
		SCORM2004_SetErrorInfo();
		
		WriteToDebug ("Error calling Initialize:");
		WriteToDebug ("              Error Number=" + intSCORM2004Error);
		WriteToDebug ("              Error String=" + strSCORM2004ErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORM2004ErrorDiagnostic);
		
		return false;

	}
	
	WriteToDebug("Returning true");
	
	return true;
}

function SCORM2004_CallSetValue(strElement, strValue){
	
	var strResult;
	
	WriteToDebug("SCORM2004_CallSetValue strElement=" + strElement + ", strValue=" + strValue);
	
	if (blnReviewModeSoReadOnly === true){
		WriteToDebug("Mode is Review and configuration setting dictates this should be read only so exiting.");
		return true;
	}
	
	SCORM2004_objAPI = SCORM2004_GrabAPI();		
	
	WriteToDebug("Calling SetValue");
	
	strElement = strElement + "";
	strValue = strValue + "";
	
	strResult = SCORM2004_objAPI.SetValue(strElement, strValue)
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM2004_FALSE){
		
		WriteToDebug("Detected Failed call to SetValue");
		
		SCORM2004_SetErrorInfo();
		
		WriteToDebug ("Error calling SetValue:");
		WriteToDebug ("              strElement=" + strElement);
		WriteToDebug ("              strValue=" + strValue);
		WriteToDebug ("              Error Number=" + intSCORM2004Error);
		WriteToDebug ("              Error String=" + strSCORM2004ErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORM2004ErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning true");
	
	return true;
}

function SCORM2004_CallGetValue(strElement){

	var strResult
	
	WriteToDebug("In SCORM2004_CallGetValue strElement=" + strElement);
	
	SCORM2004_objAPI = SCORM2004_GrabAPI();	
	
	WriteToDebug("Call GetValue");

	strElement = strElement + "";
		
	strResult = SCORM2004_objAPI.GetValue(strElement) + ""
	
	WriteToDebug("strResult=" + strResult);
	
	intSCORM2004Error = SCORM2004_objAPI.GetLastError()
	intSCORM2004Error = intSCORM2004Error + "";
	
	WriteToDebug("intSCORM2004Error=" + intSCORM2004Error);
	
	if (intSCORM2004Error != SCORM2004_NO_ERROR){	
		
		WriteToDebug("Detected failed called to GetValue");
		
		SCORM2004_SetErrorInfo();
		
		WriteToDebug ("Error calling LMSGetValue:");
		WriteToDebug ("              strElement=" + strElement);
		WriteToDebug ("              Error Number=" + intSCORM2004Error);
		WriteToDebug ("              Error String=" + strSCORM2004ErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORM2004ErrorDiagnostic);
	}
	
	WriteToDebug("Returning " + strResult);
	
	return strResult;
	
}


function SCORM2004_CallCommit(){
	
	var strResult;
	
	WriteToDebug("In SCORM2004_CallCommit");
	
	SCORM2004_objAPI = SCORM2004_GrabAPI();
		
	WriteToDebug("Calling Commit");	
	
	strResult = SCORM2004_objAPI.Commit("");
	
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM2004_FALSE){
		
		WriteToDebug("Detected failed call to Commit");
		
		SCORM2004_SetErrorInfo();
		
		WriteToDebug ("Error calling Commit:");
		WriteToDebug ("              Error Number=" + intSCORM2004Error);
		WriteToDebug ("              Error String=" + strSCORM2004ErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORM2004ErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning true");
	
	return true;
}


function SCORM2004_CallTerminate(){
	
	var strResult;
	
	WriteToDebug("In SCORM2004_CallTerminate");
	
	SCORM2004_objAPI = SCORM2004_GrabAPI();
	
	WriteToDebug("Calling Terminate");
	
	strResult = SCORM2004_objAPI.Terminate("");
	
	strResult = strResult + "";
	
	WriteToDebug("strResult=" + strResult);
	
	if (strResult == SCORM2004_FALSE){
		
		WriteToDebug("Detected failed call to Terminate");
		
		SCORM2004_SetErrorInfo();
		
		WriteToDebug ("Error calling Terminate:");
		WriteToDebug ("              Error Number=" + intSCORM2004Error);
		WriteToDebug ("              Error String=" + strSCORM2004ErrorString);
		WriteToDebug ("              Diagnostic=" + strSCORM2004ErrorDiagnostic);
		
		return false;
	}
	
	WriteToDebug("Returning True");
	
	return true;
}


//---------------------------------------------------------------------------------
//Error Handling Functions
function SCORM2004_ClearErrorInfo(){
	
	WriteToDebug("In SCORM2004_ClearErrorInfo");
	
	intSCORM2004Error = SCORM2004_NO_ERROR;
	strSCORM2004ErrorString = "";
	strSCORM2004ErrorDiagnostic = "";
}

function SCORM2004_SetErrorInfo(){
	
	WriteToDebug("In SCORM2004_SetErrorInfo");
	
	intSCORM2004Error = SCORM2004_objAPI.GetLastError();
	strSCORM2004ErrorString = SCORM2004_objAPI.GetErrorString(intSCORM2004Error);
	strSCORM2004ErrorDiagnostic = SCORM2004_objAPI.GetDiagnostic("");
	
	intSCORM2004Error = intSCORM2004Error + "";
	strSCORM2004ErrorString = strSCORM2004ErrorString + "";
	strSCORM2004ErrorDiagnostic = strSCORM2004ErrorDiagnostic + "";
	
	WriteToDebug("intSCORM2004Error=" + intSCORM2004Error);
	WriteToDebug("strSCORM2004ErrorString=" + strSCORM2004ErrorString);
	WriteToDebug("strSCORM2004ErrorDiagnostic=" + strSCORM2004ErrorDiagnostic);
}

function SCORM2004_SetErrorInfoManually(intNum, strString, strDiagnostic){
		
		WriteToDebug("In SCORM2004_SetErrorInfoManually");
		WriteToDebug("ERROR-Num=" + intNum);	
		WriteToDebug("      String=" + strString);	
		WriteToDebug("      Diag=" + strDiagnostic);
		
		intSCORM2004Error = intNum;
		strSCORM2004ErrorString = strString;
		strSCORM2004ErrorDiagnostic = strDiagnostic;	

}

function SCORM2004_GetLastError(){
	
	WriteToDebug("In SCORM2004_GetLastError");
	
	if (intSCORM2004Error == SCORM2004_NO_ERROR){
		WriteToDebug("Returning No Error");
		return NO_ERROR;
	}
	else {
		WriteToDebug("Returning " + intSCORMError);
		return intSCORM2004Error;
	}
}

function SCORM2004_GetLastErrorDesc(){
	WriteToDebug("In SCORM2004_GetLastErrorDesc, " + strSCORM2004ErrorString + "\n" + strSCORM2004ErrorDiagnostic);
	return strSCORM2004ErrorString + "\n" + strSCORM2004ErrorDiagnostic;
}



//---------------------------------------------------------------------------------
//API Locating Functions

function SCORM2004_GrabAPI(){

	WriteToDebug("In SCORM2004_GrabAPI");
	
	if (typeof(SCORM2004_objAPI) == "undefined" || SCORM2004_objAPI == null){
		WriteToDebug("Searching with Rustici Software algorithm");
		SCORM2004_objAPI = SCORM2004_GetAPI();
	}
	
	if (typeof(SCORM2004_objAPI) == "undefined" || SCORM2004_objAPI == null || SCORM2004_objAPI ==false){
		WriteToDebug("Searching with SearchForAPI");
		SCORM2004_objAPI = SCORM2004_SearchForAPI(window);
	}
	
	WriteToDebug("Grab API, returning, found API = " + (SCORM2004_objAPI != null));
	
	return SCORM2004_objAPI;

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
 it finds an object named "API_1484_11". If an
 object of that name is found, a reference to it
 is returned. Otherwise, this function returns null.
*/
function SCORM2004_ScanParentsForApi(win) 
{ 

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
	while ( (win.API_1484_11 == null || win.API_1484_11 == undefined) && 
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
	return win.API_1484_11; 
} 


/*
GetAPI
-Searches all parent and opener windows relative to the
 current window for the SCORM 2004 API Adapter.
 Returns a reference to the API Adapter if found or null
 otherwise.
*/
function SCORM2004_GetAPI() 
{ 
	
	var API = null; 
	
	//Search all the parents of the current window if there are any
	if ((window.parent != null) && (window.parent != window)) 
	{ 
		API = SCORM2004_ScanParentsForApi(window.parent); 
	} 
	
	/*
	If we didn't find the API in this window's chain of parents, 
	then search all the parents of the opener window if there is one
	*/
	if ((API == null) && (window.top.opener != null))
	{ 
		API = SCORM2004_ScanParentsForApi(window.top.opener); 
	} 
	
	return API;
}

function SCORM2004_SearchForAPI(wndLookIn){
	
	WriteToDebug("SCORM2004_SearchForAPI");
	
	var objAPITemp = null;
	var strDebugID = "";
	
	strDebugID = "Name=" + wndLookIn.name + ", href=" + wndLookIn.location.href
	
	objAPITemp = wndLookIn.API_1484_11;
	
	if (SCORM2004_APIFound(objAPITemp)){
		WriteToDebug("Found API in this window - "  + strDebugID);
		return objAPITemp;
	}
	
	if (SCORM2004_WindowHasParent(wndLookIn)){
		WriteToDebug("Searching Parent - "  + strDebugID);
		objAPITemp = SCORM2004_SearchForAPI(wndLookIn.parent);
	}

	if (SCORM2004_APIFound(objAPITemp)){
		WriteToDebug("Found API in a parent - "  + strDebugID);
		return objAPITemp;
	}

	if (SCORM2004_WindowHasOpener(wndLookIn)){
		WriteToDebug("Searching Opener - "  + strDebugID);
		objAPITemp = SCORM2004_SearchForAPI(wndLookIn.opener);
	}

	if (SCORM2004_APIFound(objAPITemp)){
		WriteToDebug("Found API in an opener - "  + strDebugID);
		return objAPITemp;
	}	
	
	//look in child frames individually, don't call this function recursively
	//on them to prevent an infinite loop when it looks back up to the parents
	WriteToDebug("Looking in children - "  + strDebugID);
	objAPITemp = SCORM2004_LookInChildren(wndLookIn);

	if (SCORM2004_APIFound(objAPITemp)){
		WriteToDebug("Found API in Children - "  + strDebugID);
		return objAPITemp;
	}
	
	WriteToDebug("Didn't find API in this window - "  + strDebugID);
	return null;
}

function SCORM2004_LookInChildren(wnd){
	
	WriteToDebug("SCORM2004_LookInChildren");
	
	var objAPITemp = null;
	
	var strDebugID = "";
	
	strDebugID = "Name=" + wnd.name + ", href=" + wnd.location.href

	for (var i=0; i < wnd.frames.length; i++){
		
		WriteToDebug("Looking in child frame " + i);
		
		objAPITemp = wnd.frames[i].API_1484_11;
		
		if (SCORM2004_APIFound(objAPITemp)){
			WriteToDebug("Found API in child frame of " + strDebugID);
			return objAPITemp;
		}
		
		WriteToDebug("Looking in this child's children " + strDebugID);
		objAPITemp = SCORM2004_LookInChildren(wnd.frames[i]);

		if (SCORM2004_APIFound(objAPITemp)){
			WriteToDebug("API found in this child's children " + strDebugID);
			return objAPITemp;
		}		
	}
	
	return null;
}

function SCORM2004_WindowHasOpener(wnd){
	WriteToDebug("In SCORM2004_WindowHasOpener");
	if ((wnd.opener != null) && (wnd.opener != wnd) && (typeof(wnd.opener) != "undefined")){
		WriteToDebug("Window Does Have Opener");
		return true;
	}
	else{
		WriteToDebug("Window Does Not Have Opener");
		return false;
	}	
}

function SCORM2004_WindowHasParent(wnd){
	WriteToDebug("In SCORM2004_WindowHasParent");
	if ((wnd.parent != null) && (wnd.parent != wnd) && (typeof(wnd.parent) != "undefined")){
		WriteToDebug("Window Does Have Parent");
		return true;
	}
	else{
		WriteToDebug("Window Does Not Have Parent");
		return false;
	}
}


function SCORM2004_APIFound(obj){
	WriteToDebug("In SCORM2004_APIFound");
	if (obj == null || typeof(obj) == "undefined"){
		WriteToDebug("API NOT Found");
		return false;
	}
	else{
		WriteToDebug("API Found");
		return true;
	}
}

