
var blnDirtyAICCData = false;
var blnCommitSavedData = false;

var intAICCErrorNum = NO_ERROR;
var strAICCErrorDesc = "";

var aryAICCFoundItems = new Array();	//stores a list of data elements that have been found in a AICC GetParam result

var blnUseLongInteractionResultValues = true;	//we start off trying to submit verbose descriptions of interaction results, if this errors, we revert back to strict conformance

var blnReviewModeSoReadOnly = false;

//these variables come from and can go stright to the LMS
var AICC_LMS_Version = "";
var AICC_Student_ID = "";
var AICC_Student_Name = "";
var AICC_Lesson_Location = "";
var AICC_Score = "";
var AICC_Credit = "";
var AICC_Lesson_Status = "";
var AICC_Time = "";
var AICC_Mastery_Score = "";
var AICC_Lesson_Mode = "";
var AICC_Max_Time_Allowed = "";
var AICC_Time_Limit_Action = "";
var AICC_Audio = "";
var AICC_Speed = "";
var AICC_Language = "";
var AICC_Text = "";
var AICC_Launch_Data = "";
var AICC_Data_Chunk = "";
var AICC_Comments = "";
var AICC_Objectives = null;
var AICC_CourseID = "";

//these variables are more logical representations of the above variables
var AICC_fltScoreRaw = "";
var AICC_fltScoreMax = "";
var AICC_fltScoreMin = "";
var AICC_blnCredit = true;
var AICC_strLessonMode = MODE_NORMAL;
var AICC_intPreviouslyAccumulatedMilliseconds = 0;
var AICC_intMaxTimeAllowedMilliseconds = MAX_CMI_TIME;
var AICC_blnExitOnTimeout = false;
var AICC_blnShowMessageOnTimeout = true;
var AICC_TextPreference = PREFERENCE_DEFAULT;
var AICC_Status = LESSON_STATUS_NOT_ATTEMPTED;
var AICC_Entry = AICC_ENTRY_FLAG_DEFAULT;				//must be the default b/c absense of entry flag indicates "review"
var AICC_AudioPlayPreference = PREFERENCE_DEFAULT;
var AICC_intAudioVolume = 100;
var AICC_intPercentOfMaxSpeed = 100;
var AICC_intSessionTimeMilliseconds = 0;
var AICC_aryObjectivesRead = new Array();	//objectives reported from LMS, read results from here, also store copy of currently set objectives here
var AICC_aryObjectivesWrite = new Array();	//objectives altered during this session (that is all we're supposed to report to AICC LMS)
var AICC_aryCommentsFromLearner = new Array();
var AICC_aryInteractions = new Array();

//constants to define the meaning of the positions in the arrays to store objective information
//these arrays contain a top level array index by the obj index, these positions contain subarrays with these indicies
var AICC_OBJ_ARRAY_ID     = 0;
var AICC_OBJ_ARRAY_SCORE  = 1;
var AICC_OBJ_ARRAY_STATUS = 2;

//constants to define the meaning of the positions in the arrays to store interaction information
var AICC_INTERACTIONS_ID					= 0;
var AICC_INTERACTIONS_RESPONSE				= 1;
var AICC_INTERACTIONS_CORRECT				= 2;
var AICC_INTERACTIONS_CORRECT_RESPONSE		= 3;
var AICC_INTERACTIONS_TIME_STAMP			= 4;
var AICC_INTERACTIONS_TYPE					= 5;
var AICC_INTERACTIONS_WEIGHTING				= 6;
var AICC_INTERACTIONS_LATENCY				= 7;
var AICC_INTERACTIONS_RESPONSE_LONG         = 8;
var AICC_INTERACTIONS_CORRECT_RESPONSE_LONG = 9;

var AICC_INTERACTION_TYPE_TRUE_FALSE	= "T";
var AICC_INTERACTION_TYPE_CHOICE		= "C";
var AICC_INTERACTION_TYPE_FILL_IN		= "F";
var AICC_INTERACTION_TYPE_MATCHING		= "M";
var AICC_INTERACTION_TYPE_PERFORMANCE	= "P";
var AICC_INTERACTION_TYPE_SEQUENCING	= "S";
var AICC_INTERACTION_TYPE_LIKERT		= "L";
var AICC_INTERACTION_TYPE_NUMERIC		= "N";

var AICC_RESULT_CORRECT			= "C";
var AICC_RESULT_WRONG			= "W";
var AICC_RESULT_UNANTICIPATED	= "U";
var AICC_RESULT_NEUTRAL			= "N";


//error constants
var AICC_NO_ERROR = "0";
var AICC_ERROR_INVALID_PREFERENCE = "-1";
var AICC_ERROR_INVALID_STATUS = "-2";
var AICC_ERROR_INVALID_SPEED = "-3";
var AICC_ERROR_INVALID_TIMESPAN = "-4";
var AICC_ERROR_INVALID_TIME_LIMIT_ACTION = "-5";
var AICC_ERROR_INVALID_DECIMAL = "-6";
var AICC_ERROR_INVALID_CREDIT = "-7";
var AICC_ERROR_INVALID_LESSON_MODE = "-8";
var AICC_ERROR_INVALID_ENTRY = "-9";

var blnReviewModeSoReadOnly = false;

function AICC_Initialize(){

	WriteToDebug("In AICC_Initialize");
	
	//make getparam request, this will parse the data into local variables then begin loading the content
	
	window.AICCComm.MakeGetParamRequest();
		
	return;
}


function AICC_Finish(strExitType, blnStatusWasSet){
	
	WriteToDebug("In AICC_Finish, strExitType=" + strExitType + ", blnStatusWasSet=" + blnStatusWasSet);

	if (! blnStatusWasSet){
		if ( (strExitType == EXIT_TYPE_FINISH)){
			
			WriteToDebug("Setting status to complete");
			
			AICC_Status = LESSON_STATUS_COMPLETED;
		}
		else{
			WriteToDebug("Setting status to incomplete");
			
			AICC_Status = LESSON_STATUS_INCOMPLETE;
		}
	}
	
	//Commit Data
	AICC_CommitData();
	
	//only kill time if we actually saved some data
	if (blnCommitSavedData == true){
		KillTime();
	}
	
	//Make ExitAU Request
	window.AICCComm.MakeExitAURequest();
	
	return true;
}


function AICC_CommitData(){
	
	var strAICCData;

	WriteToDebug("In AICC_CommitData");
	
	if (blnReviewModeSoReadOnly === true){
		WriteToDebug("Mode is Review and configuration setting dictates this should be read only so exiting.");
		return true;
	}
	
	//if there is data to save, make a putparam request
	blnCommitSavedData = false;
	if (IsThereDirtyAICCData()){
		
		blnCommitSavedData = true;
		
		WriteToDebug("Found Dirty Data");
		
		strAICCData = FormAICCPostData();
		
		window.AICCComm.MakePutParamRequest(strAICCData);
		
		//if there is no course id, then the LMS doesn't support interactions
		//MR - 5/24/05 - removed the course id check to allow aicc courses to be imported into an LMS without using the descriptor files
		//also, Saba doesn't send the Course Id field even when imported with the descriptor files
		if ( /*AICC_CourseID != "" && */ AICC_aryInteractions.length > 0){
			
			WriteToDebug("Saving Interactions");
			
			//strAICCData = FormAICCInteractionsData();
			//window.AICCComm.MakePutInteractionsRequest(strAICCData);
			
			//MR - 5/31/05 - Saba won't always accept two request if they come immediately after one another. Introduce an artifical delay between
			//requests to ensure that they both get processed.
			//window.setTimeout("AICC_SendInteractions()", 250);
			
			//MR - 12/14/05 - Replaced setTimeout call to properly handle this being invoked onunload
			KillTime();
			AICC_SendInteractions();
		}
		
		ClearDirtyAICCData();	//if the PutParam request fails, the data will be set back to dirty via a call to AICC_PutParamFailed()
		
	}
	
	return true;
}


function KillTime(){
	/*
	This function is necessary to space out the requests made by normal form posts
	in a cross domain environment. If two requests are sent too close together, on some
	server platforms, the first request will be ignored. We can't use a setTimout call
	because there are situations where this wait needs to happen in the onunload event.
	
	First try to make requests for a file (on the content server) using the XmlHttp object. 
	If that is not available try an alternate method.
	
	We are using a document.write as the spaced because it is an expensive operation and
	we have seen several instances where it provides enough spacing (when used to write to
	the debug window) to seperate the requests.
	*/
	
	WriteToDebug("In KillTime");
	
	if (USE_AICC_KILL_TIME === false){
		WriteToDebug("Configuration disallows use of KillTime, exiting");
		return;
	}
	
	var start = new Date();
	
	if (window.AICCComm.blnCanUseXMLHTTP == false){
	
		if (window.AICCComm.blnXMLHTTPIsAvailable == true){
			
			var numBlankRequests = 3;
			
			for (var i=0; i < numBlankRequests; i++){
				window.AICCComm.GetBlankHtmlPage(i);
			}
		}
		else{
		
			window.NothingFrame.document.open();

			var numLoops = 1000;
			
			while (((new Date()) - start) < 200)
			{
				window.NothingFrame.document.write("waiting");
			}
			
			window.NothingFrame.document.close();
		}
	
	}
	
	var end = new Date();
	
	WriteToDebug("Killed " + (end - start) + "milliseconds.");

}


function AICC_SendInteractions(){
	
	WriteToDebug("In AICC_SendInteractions.");
	
	if (blnReviewModeSoReadOnly === true){
		WriteToDebug("Mode is Review and configuration setting dictates this should be read only so exiting.");
		return true;
	}

	var strAICCData = FormAICCInteractionsData();
	window.AICCComm.MakePutInteractionsRequest(strAICCData);
}

function AICC_GetStudentID(){
	WriteToDebug("In AICC_GetStudentID, Returning " + AICC_Student_ID);
	
	return AICC_Student_ID ;	
}

function AICC_GetStudentName(){
	WriteToDebug("In AICC_GetStudentName, Returning " + AICC_Student_Name);
	
	return AICC_Student_Name;
}

function AICC_GetBookmark(){
	WriteToDebug("In AICC_GetBookmark, Returning " + AICC_Lesson_Location);
	
	return AICC_Lesson_Location;
}

function AICC_SetBookmark(strBookmark){
	WriteToDebug("In AICC_SetBookmark, strBookmark=" + strBookmark);
	
	SetDirtyAICCData();
	
	AICC_Lesson_Location = strBookmark;
	
	return true;
}

function AICC_GetDataChunk(){
	WriteToDebug("In AICC_GetDataChunk, Returning " + AICC_Data_Chunk);
	return AICC_Data_Chunk ;
}

function AICC_SetDataChunk(strData){
	//need to check for character limits here 4096 characters
	WriteToDebug("In AICC_SetDataChunk, strData=" + strData );
	SetDirtyAICCData();
	AICC_Data_Chunk = strData;
	return true;
}


function AICC_GetLaunchData(){
	WriteToDebug("In AICC_GetLaunchData, Returning " + AICC_Launch_Data );
	
	return AICC_Launch_Data ;
}

function AICC_GetComments(){
	WriteToDebug("In AICC_GetComments, Returning " + AICC_aryCommentsFromLearner.join(" | "));
	
	//not available in AICC - return cached comments from this session		
	return AICC_aryCommentsFromLearner.join(" | ");
}

function AICC_WriteComment(strComment){
	WriteToDebug("In AICC_WriteComment, strComment=" + strComment);
	
	var intNextIndex;
	
	//remove the "|" since AICC has its own delimiters
	if (strComment.search(/ \| /) == 0){
		strComment = strComment.substr(3);
	}
	
	//remove encoding of "|"
	strComment.replace(/\|\|/g, "|")
	
	//add the comment to an array of comments
	intNextIndex = AICC_aryCommentsFromLearner.length;
	
	WriteToDebug("Adding comment to array");
	
	AICC_aryCommentsFromLearner[intNextIndex] = strComment;

	SetDirtyAICCData();
	
	return true;
}

function AICC_GetLMSComments(){
	WriteToDebug("In AICC_GetLMSComments, Returning " + AICC_Comments );
	
	return AICC_Comments;
}


function AICC_GetAudioPlayPreference(){
	WriteToDebug("In AICC_GetAudioPlayPreference, Returning " + AICC_AudioPlayPreference);
	
	return AICC_AudioPlayPreference;
}



function AICC_GetAudioVolumePreference(){
	WriteToDebug("In AICC_GetAudioVolumePreference, Returning " + AICC_intAudioVolume);
	
	return AICC_intAudioVolume;
}


function AICC_SetAudioPreference(PlayPreference, intPercentOfMaxVolume){
	WriteToDebug("In AICC_SetAudioPreference, Returning true");
	
	AICC_AudioPlayPreference = PlayPreference;
	AICC_intAudioVolume = intPercentOfMaxVolume;
	
	SetDirtyAICCData();
	return true;
}




function AICC_SetLanguagePreference(strLanguage){
	WriteToDebug("In AICC_SetLanguagePreference, Returning true");
	
	SetDirtyAICCData();
	
	AICC_Language = strLanguage;
	
	return true;
}


function AICC_GetLanguagePreference(){
	WriteToDebug("In AICC_GetLanguagePreference, Returning " + AICC_Language);
	
	return AICC_Language;
}


function AICC_SetSpeedPreference(intPercentOfMax){
	WriteToDebug("In AICC_SetSpeedPreference, Returning true");
	
	AICC_intPercentOfMaxSpeed = intPercentOfMax;
	
	SetDirtyAICCData();
	
	return true;
}


function AICC_GetSpeedPreference(){
	WriteToDebug("In AICC_GetSpeedPreference, Returning " + AICC_intPercentOfMaxSpeed);
	
	return AICC_intPercentOfMaxSpeed;
}

function AICC_SetTextPreference(intPreference){
	WriteToDebug("In AICC_SetTextPreference, Returning true");
	
	AICC_TextPreference = intPreference;
	
	SetDirtyAICCData();
	
	return true;
}


function AICC_GetTextPreference(){
	WriteToDebug("In AICC_GetTextPreference, Returning " + AICC_TextPreference);
	
	return AICC_TextPreference;
}

function AICC_GetPreviouslyAccumulatedTime(){
	WriteToDebug("In AICC_GetPreviouslyAccumulatedTime, Returning " + AICC_intPreviouslyAccumulatedMilliseconds);
	
	return AICC_intPreviouslyAccumulatedMilliseconds;
}


function AICC_SaveTime(intMilliSeconds){
	WriteToDebug("In intMilliSeconds, Returning true");
	
	AICC_intSessionTimeMilliseconds = intMilliSeconds;
	
	SetDirtyAICCData();
	
	return true;
}

function AICC_GetMaxTimeAllowed(){
	WriteToDebug("In AICC_GetMaxTimeAllowed, Returning " + AICC_intMaxTimeAllowedMilliseconds);
	
	return AICC_intMaxTimeAllowedMilliseconds;	
}



function AICC_DisplayMessageOnTimeout(){
	WriteToDebug("In AICC_DisplayMessageOnTimeout, Returning " + AICC_blnShowMessageOnTimeout);

	return AICC_blnShowMessageOnTimeout;
}

function AICC_ExitOnTimeout(){
	WriteToDebug("In AICC_ExitOnTimeout, Returning " + AICC_blnExitOnTimeout);

	return AICC_blnExitOnTimeout;
}


function AICC_GetPassingScore(){
	WriteToDebug("In AICC_GetPassingScore, Returning " + AICC_Mastery_Score);
	
	return AICC_Mastery_Score;
	
}



function AICC_GetScore(){
	WriteToDebug("In AICC_GetScore, Returning " + AICC_fltScoreRaw);
	
	return AICC_fltScoreRaw;
}

function AICC_SetScore(fltScore, fltMaxScore, fltMinScore){
	WriteToDebug("In AICC_SetScore, fltScore=" + fltScore + ", fltMaxScore=" + fltMaxScore + ", fltMinScore=" + fltMinScore);

	AICC_fltScoreRaw = fltScore;
	AICC_fltScoreMax = fltMaxScore;
	AICC_fltScoreMin = fltMinScore;
	
	SetDirtyAICCData();
	
	return true;
}


function AICC_RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordTrueFalseInteraction strID=" + strID + ", blnResponse=" + blnResponse + 
					", blnCorrect=" + blnCorrect + ", blnCorrectResponse=" + blnCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	
	var strResponse = "";
	var strCorrectResponse = "";
	
	if (blnResponse){
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
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_TRUE_FALSE;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponse;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponse;

	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordMultipleChoiceInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){
	
	WriteToDebug("In AICC_RecordMultipleChoiceInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	
	
	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Short.replace(",", "");
		strResponseLong += aryResponse[i].Long.replace(",", "");
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		strCorrectResponse += aryCorrectResponse[i].Short.replace(",", "");
		strCorrectResponseLong += aryCorrectResponse[i].Long.replace(",", "");
	}
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_CHOICE;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponseLong;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponseLong;
	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordFillInInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	if (strCorrectResponse == null || strCorrectResponse == undefined){strCorrectResponse="";}

	strResponse = new String(strResponse);
	if (strResponse.length > 255) {strResponse = strResponse.substr(0, 255);}

	strCorrectResponse = new String(strCorrectResponse);
	if (strCorrectResponse.length > 255) {strCorrectResponse = strCorrectResponse.substr(0, 255);}
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_FILL_IN;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponse;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponse;
	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordMatchingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordMatchingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}


	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Source.Short.replace(",", "").replace(".", "") + "." + aryResponse[i].Target.Short.replace(",", "").replace(".", "");
		strResponseLong += aryResponse[i].Source.Long.replace(",", "").replace(".", "") + "." + aryResponse[i].Target.Long.replace(",", "").replace(".", "");		
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		if (aryCorrectResponse[i].Source.Short != "" && aryCorrectResponse[i].Source.Long != ""){
			strCorrectResponse += aryCorrectResponse[i].Source.Short.replace(",", "").replace(".", "") + "." + aryCorrectResponse[i].Target.Short.replace(",", "").replace(".", "");
			strCorrectResponseLong += aryCorrectResponse[i].Source.Long.replace(",", "").replace(".", "") + "." + aryCorrectResponse[i].Target.Long.replace(",", "").replace(".", "");
		}
	}
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_MATCHING;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponseLong;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponseLong;
		
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordPerformanceInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	if (strCorrectResponse == null || strCorrectResponse == undefined){strCorrectResponse="";}

	strResponse = new String(strResponse);
	if (strResponse.length > 255) {strResponse = strResponse.substr(0, 255);}

	strCorrectResponse = new String(strCorrectResponse);
	if (strCorrectResponse.length > 255) {strCorrectResponse = strCorrectResponse.substr(0, 255);}	
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_PERFORMANCE;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponse;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponse;
		
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordSequencingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordSequencingInteraction strID=" + strID + ", aryResponse=" + aryResponse + 
					", blnCorrect=" + blnCorrect + ", aryCorrectResponse=" + aryCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}

	var strResponse = "";
	var strResponseLong = "";
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	for (var i=0; i < aryResponse.length; i++){
		
		if (strResponse.length > 0) {strResponse += ",";}
		if (strResponseLong.length > 0) {strResponseLong += ",";}
		
		strResponse += aryResponse[i].Short.replace(",", "");
		strResponseLong += aryResponse[i].Long.replace(",", "");
	}

	for (var i=0; i < aryCorrectResponse.length; i++){
		
		if (strCorrectResponse.length > 0) {strCorrectResponse += ",";}
		if (strCorrectResponseLong.length > 0) {strCorrectResponseLong += ",";}
		
		strCorrectResponse += aryCorrectResponse[i].Short.replace(",", "");
		strCorrectResponseLong += aryCorrectResponse[i].Long.replace(",", "");
	}

	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_SEQUENCING;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponseLong;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponseLong;
	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordLikertInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In RecordLikertInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	
	var strResponse = response.Short;
	var strResponseLong = response.Long;
	
	var strCorrectResponse = "";
	var strCorrectResponseLong = "";
	
	if (correctResponse != null){
		strCorrectResponse = correctResponse.Short;
		strCorrectResponseLong = correctResponse.Long;
	}
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_LIKERT;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponseLong;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponseLong;

	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime){

	WriteToDebug("In AICC_RecordNumericInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + 
					", strLearningObjectiveID=" + strLearningObjectiveID + ", dtmTime=" + dtmTime);	

	
	var intTotalInteractions;
	var aryData = new Array(10);
	
	intTotalInteractions = AICC_aryInteractions.length;
	
	if (intWeighting == null || intWeighting == undefined ){intWeighting="";}
	if (intLatency == null || intLatency == undefined){intLatency="";}
	if (blnCorrect == null || blnCorrect == undefined){blnCorrect="";}
	if (strCorrectResponse == null || strCorrectResponse == undefined){strCorrectResponse="";}
	
	aryData[AICC_INTERACTIONS_ID]               = strID;
	aryData[AICC_INTERACTIONS_RESPONSE]         = strResponse;
	aryData[AICC_INTERACTIONS_CORRECT]          = blnCorrect;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE] = strCorrectResponse;
	aryData[AICC_INTERACTIONS_TIME_STAMP]       = dtmTime;
	aryData[AICC_INTERACTIONS_TYPE]				= AICC_INTERACTION_TYPE_NUMERIC;
	aryData[AICC_INTERACTIONS_WEIGHTING]		= intWeighting;
	aryData[AICC_INTERACTIONS_LATENCY]			= intLatency;
	aryData[AICC_INTERACTIONS_RESPONSE_LONG]		= strResponse;
	aryData[AICC_INTERACTIONS_CORRECT_RESPONSE_LONG]= strCorrectResponse;
	
	//in AICC ignore the description field since there is nothing we can do with it
	//in AICC, don't try to set the interaction objective because these need to specified in the descriptor files
	
	AICC_aryInteractions[intTotalInteractions] = aryData;
	
	WriteToDebug("Added to interactions array, index=" + intTotalInteractions);
	
	SetDirtyAICCData();
	return true;
}

function AICC_GetEntryMode(){
	WriteToDebug("In AICC_GetEntryMode, Returning " + AICC_Entry);

	return AICC_Entry;
}

function AICC_GetLessonMode(){
	WriteToDebug("In AICC_GetLessonMode, Returning " + AICC_strLessonMode);
	
	return AICC_strLessonMode;
}

function AICC_GetTakingForCredit(){
	WriteToDebug("In AICC_GetTakingForCredit, Returning " + AICC_blnCredit);
	
	return AICC_blnCredit;
}



function AICC_SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore){
	
	WriteToDebug("In AICC_SetObjectiveScore, strObjectiveID=" + strObjectiveID + ", intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	var intNextID;
	var intObjIndex;
	var strAICCScore = "";
	
	intObjIndex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesRead);
	
	if (intObjIndex != null){
		WriteToDebug("Found read objective");
		AICC_aryObjectivesRead[intObjIndex][AICC_OBJ_ARRAY_SCORE] = intScore;
	}
	else{
		WriteToDebug("Adding new read objective");
		
		intNextID = AICC_aryObjectivesRead.length;
		
		AICC_aryObjectivesRead[parseInt(intNextID, 10)] = new Array(3);
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_ID] = strObjectiveID;			
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_SCORE] = intScore;
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_STATUS] = "";
	}
	

	intObjIndex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesWrite);
	
	if (intObjIndex != null){
		WriteToDebug("Found write objective");
		AICC_aryObjectivesWrite[intObjIndex][AICC_OBJ_ARRAY_SCORE] = intScore;
	}
	else{
		WriteToDebug("Adding new write objective");
		
		intNextID = AICC_aryObjectivesWrite.length;
		
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)] = new Array(3);
		
		strAICCScore = intScore;
		
		//prior to version 3, AICC scores cannot contain a decimal
		if (AICC_LMS_Version < 3 && strAICCScore != ""){
			strAICCScore = parseInt(strAICCScore, 10);
		}
		
		if (	(AICC_REPORT_MIN_MAX_SCORE === undefined || 
				 AICC_REPORT_MIN_MAX_SCORE === null || 
				 AICC_REPORT_MIN_MAX_SCORE === true) &&
			(AICC_LMS_Version >= 3 )		//min and max scores are only allowed after version 3
		){
		
			if ((intMaxScore != "") || (intMinScore != "")) {
				WriteToDebug("Appending Max and Min scores");
				strAICCScore += "," + intMaxScore + "," + intMinScore;
			}
		
		}
		
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_ID] = strObjectiveID;			
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_SCORE] = strAICCScore;
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_STATUS] = "";
	}

	SetDirtyAICCData();
	
	return true;
}


function AICC_SetObjectiveStatus(strObjectiveID, Lesson_Status){
	
	WriteToDebug("In AICC_SetObjectiveStatus, strObjectiveID=" + strObjectiveID + ", Lesson_Status=" + Lesson_Status);
	
	var intNextID;
	var intObjIdex;
	
	intObjIdex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesRead);
	
	if (intObjIdex != null){
		WriteToDebug("Found read objective");
		AICC_aryObjectivesRead[intObjIdex][AICC_OBJ_ARRAY_STATUS] = Lesson_Status;
	}
	else{
		WriteToDebug("Adding new read objective");
		intNextID = AICC_aryObjectivesRead.length;
		
		AICC_aryObjectivesRead[parseInt(intNextID, 10)] = new Array(3);
		
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_ID] = strObjectiveID;			
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_STATUS] = Lesson_Status;
		AICC_aryObjectivesRead[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_SCORE] = "";
	}


	intObjIdex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesWrite);
	
	if (intObjIdex != null){
		WriteToDebug("Found write objective");
		AICC_aryObjectivesWrite[intObjIdex][AICC_OBJ_ARRAY_STATUS] = Lesson_Status;
	}
	else{
		WriteToDebug("Adding new write objective");
		intNextID = AICC_aryObjectivesWrite.length;
		
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)] = new Array(3);
		
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_ID] = strObjectiveID;			
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_STATUS] = Lesson_Status;
		AICC_aryObjectivesWrite[parseInt(intNextID, 10)][AICC_OBJ_ARRAY_SCORE] = "";
	}

	SetDirtyAICCData();
	
	return true;
}


function AICC_SetObjectiveDescription(strObjectiveID, strObjectiveDescription){
	
	WriteToDebug("In AICC_SetObjectiveDescription, strObjectiveID=" + strObjectiveID + ", strObjectiveDescription=" + strObjectiveDescription);
	WriteToDebug("Objective descriptions are not supported prior to SCORM 2004");
	
    return true;

}


function AICC_GetObjectiveScore(strObjectiveID){
	WriteToDebug("In AICC_SetObjectiveScore, strObjectiveID=" + strObjectiveID);
	
	var intObjIndex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesRead)
	
	if (intObjIndex != null){
		WriteToDebug("Found objective, returning " + AICC_aryObjectivesRead[intObjIndex][AICC_OBJ_ARRAY_SCORE]);
		return AICC_aryObjectivesRead[intObjIndex][AICC_OBJ_ARRAY_SCORE];
	}
	else{
		WriteToDebug("Did not find objective, returning ''");
		return "";
	}
}

function AICC_GetObjectiveDescription(strObjectiveID){
	WriteToDebug("In AICC_GetObjectiveDescription, strObjectiveID=" + strObjectiveID);
	WriteToDebug("Objective descriptions are not supported prior to SCORM 2004");
	
	return "";
}

function AICC_GetObjectiveStatus(strObjectiveID){

	WriteToDebug("In AICC_SetObjectiveStatus, strObjectiveID=" + strObjectiveID);
	
	var intObjIndex = FindObjectiveById(strObjectiveID, AICC_aryObjectivesRead)
	
	if (intObjIndex != null){
		WriteToDebug("Found objective, returning " + AICC_aryObjectivesRead[intObjIndex][AICC_OBJ_ARRAY_STATUS]);
		return AICC_aryObjectivesRead[intObjIndex][AICC_OBJ_ARRAY_STATUS];
	}
	else{
		WriteToDebug("Did not find objective, returning " + LESSON_STATUS_NOT_ATTEMPTED);
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
}

function AICC_SetFailed(){
	WriteToDebug("In AICC_SetFailed, Returning true");
	
	AICC_Status = LESSON_STATUS_FAILED;
	
	SetDirtyAICCData();
	
	return true;
}

function AICC_SetPassed(){
	WriteToDebug("In AICC_SetPassed, Returning true");
	
	AICC_Status = LESSON_STATUS_PASSED;
	
	SetDirtyAICCData();
	
	return true;
}

function AICC_SetCompleted(){
	WriteToDebug("In AICC_SetCompleted, Returning true");
	
	AICC_Status = LESSON_STATUS_COMPLETED;
	
	SetDirtyAICCData();
	
	return true;
}

function AICC_ResetStatus(){
	WriteToDebug("In AICC_ResetStatus, Returning true");
	
	AICC_Status = LESSON_STATUS_INCOMPLETE;
	
	SetDirtyAICCData();
	
	return true;
}

function AICC_GetStatus(){
	WriteToDebug("In AICC_GetStatus, Returning " + AICC_Status);
	
	return AICC_Status;
}

//public
function AICC_GetProgressMeasure(){
	WriteToDebug("AICC_GetProgressMeasure - AICC does not support progress_measure, returning false");
	return false;
}
//public
function AICC_SetProgressMeasure(){
	WriteToDebug("AICC_SetProgressMeasure - AICC does not support progress_measure, returning false");
	return false;
}

//public
function AICC_GetObjectiveProgressMeasure(){
	WriteToDebug("AICC_GetObjectiveProgressMeasure - AICC does not support progress_measure, returning false");
	return false;
}
//public
function AICC_SetObjectiveProgressMeasure(){
	WriteToDebug("AICC_SetObjectiveProgressMeasure - AICC does not support progress_measure, returning false");
	return false;
}

function AICC_SetPointBasedScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("AICC_SetPointBasedScore - AICC does not support SetPointBasedScore, returning false");
	return false;
}

function AICC_GetScaledScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("AICC_GetScaledScore - AICC does not support GetScaledScore, returning false");
	return false;
}

function AICC_GetLastError(){
	WriteToDebug("In AICC_GetLastError, Returning " + intAICCErrorNum);
	
	return intAICCErrorNum;
}

function AICC_GetLastErrorDesc(){
	WriteToDebug("In AICC_GetLastErrorDesc, Returning '" + strAICCErrorDesc + "'");
	
	return strAICCErrorDesc;
}



//==============================================================================


function AICC_PutParamFailed(){
	WriteToDebug("ERROR: In AICC_PutParamFailed");
	
	//set dirty data
	SetDirtyAICCData();
	
	//currently, just leaves the data as dirty, could also re-try or display an error as desired
	
	return;
}

function AICC_PutInteractionsFailed(){
	WriteToDebug("ERROR: In AICC_PutInteractionsFailed");
	
	//set dirty data
	SetDirtyAICCData();

	//the LMS probably only accepts strictly conformant interaction result values, so retry one more time
	//with the short values which will be used from now on
	
	//this call originates from the child frame so be sure to reference the parent
	if (parent.blnUseLongInteractionResultValues == true){
	
		parent.blnUseLongInteractionResultValues = false;
		
		parent.AICC_CommitData();
	}
	
	return;
}

function AICC_SetErrorInfo(strErrorNumLine, strErrorDescLine){
	WriteToDebug("ERROR: In AICC_SetErrorInfo, strErrorNumLine=" + strErrorNumLine + ", strErrorDescLine=" + strErrorDescLine);
	
	if (strErrorNumLine.toLowerCase().search(/error\s*=\s*0/) == -1){
		WriteToDebug("Detected No Error");
		intAICCErrorNum = NO_ERROR;
		strAICCErrorDesc = "";
	}
	else{
		WriteToDebug("Setting Error Info");
		AICC_SetError(GetValueFromAICCLine(strAICCErrorLine), GetValueFromAICCLine(strAICCErrorDesc))
	}
}

function AICC_SetError(intErrorNum, strErrorDesc){
	WriteToDebug("ERROR: In AICC_SetError, intErrorNum=" + intErrorNum + ", strErrorDesc=" + strErrorDesc);

	intAICCErrorNum = intErrorNum;
	strAICCErrorDesc = strAICCErrorDesc;
}

function SetDirtyAICCData(){
	WriteToDebug("In SetDirtyAICCData");
	blnDirtyAICCData = true;
}

function ClearDirtyAICCData(){
	WriteToDebug("In ClearDirtyAICCData");
	blnDirtyAICCData = false;
}

function IsThereDirtyAICCData(){
	WriteToDebug("In IsThereDirtyAICCData, returning " + blnDirtyAICCData);
	return blnDirtyAICCData;
}


function GetValueFromAICCLine(strLine){	
	
	WriteToDebug("In GetValueFromAICCLine, strLine=" + strLine);
	
	//find equal sign
	//if found equal sign
		//get all characters after equal sign
		//remove leading and trailing white space (cr, lf, tab, space, etc)
	
	var intPos;
	var strValue = "";
	var strTemp;
	
	strLine = new String(strLine);
	
	intPos = strLine.indexOf("=");
	
	WriteToDebug("intPos=" + intPos);
	
	if (intPos > -1 && ((intPos + 1) < strLine.length)){
		
		WriteToDebug("Grabbing value");
		
		strTemp = strLine.substring(intPos+1);
		
		WriteToDebug("strTemp=" + strTemp);
		
		strTemp = strTemp.replace(/^\s*/, "");		//replace leading whitespace
		strTemp = strTemp.replace(/\s*$/, "");		//replace trailing whitespace
		
		strValue = strTemp;
	}
	
	WriteToDebug("returning " + strValue);
	
	return strValue;
	
}

function GetNameFromAICCLine(strLine){
	//find equal sign
	//if found equal sign
		//get all characters after equal sign
		//remove leading and trailing white space (cr, lf, tab, space, etc)
	//else, look for brackets and return contents of brackets
	
	WriteToDebug("In GetNameFromAICCLine, strLine=" + strLine);
	
	var intPos;
	var strTemp;
	
	var strName = "";
	
	strLine = new String(strLine);
	
	intPos = strLine.indexOf("=");
	
	WriteToDebug("intPos=" + intPos);
	
	if (intPos > -1 && intPos < strLine.length){
		
		WriteToDebug("Grabbing name from name/value pair");
		
		strTemp = strLine.substring(0, intPos);
		
		WriteToDebug("strTemp=" + strTemp);
		
		strTemp = strTemp.replace(/^\s*/, "");
		strTemp = strTemp.replace(/\s*$/, "");
		
		strName = strTemp;
	}
	
	else{
	
		WriteToDebug("Grabbing name from group / section heading");
		
		intPos = strLine.indexOf("[");
		
		WriteToDebug("intPos=" + intPos);
		
		if (intPos > -1){
			
			WriteToDebug("Replacing []");
			
			strTemp = strLine.replace(/[\[|\]]/g, "");	//replace the square brackets
			
			WriteToDebug("strTemp=" + strTemp);
			
			strTemp = strTemp.replace(/^\s*/, "");		//replace leading whitespace
			strTemp = strTemp.replace(/\s*$/, "");		//replace trailing whitespace
			
			strName = strTemp;
		}

	}
	
	
	WriteToDebug("returning " + strName);
	
	return strName;
}



function GetIndexFromAICCName(strLineName){

	WriteToDebug("In GetIndexFromAICCName, strLineName=" + strLineName);
	
	//find period 
		//if found period
		//get all characters after preiod
		//if there is an equal sign (we got an entire line instead of a line name
			//remove all characters after the equal sign
		//remove leading and trailing white space (cr, lf, tab, space, etc)
	
	var intPos;
	var strIndex = "";
	var strTemp = "";
	
	strLine = new String(strLineName);
	
	intPos = strLine.indexOf(".");
	
	WriteToDebug("intPos=" + intPos);
	
	if (intPos > -1 && (intPos+1) < strLine.length){		
	
		WriteToDebug("Grabbing index");
		
		strTemp = strLine.substring(intPos + 1);
	
		
		WriteToDebug("strTemp=" + strTemp);
		
		WriteToDebug("Checking for equal sign");
		
		intPos = strTemp.indexOf("=");
		
		if (intPos > -1 && intPos < strTemp.length){
			WriteToDebug("Found and removing equal sign");
			strTemp = strLine.substring(0, intPos);
		}
		
		WriteToDebug("Removing white space");
		
		strTemp = strTemp.replace(/^\s*/, "");		//replace leading whitespace
		strTemp = strTemp.replace(/\s*$/, "");		//replace trailing whitespace
		
		strIndex = strTemp;
	}
	
	WriteToDebug("returning " + strIndex);
	
	return strIndex;
}


//==============================================================================

function ParseGetParamData(strLMSResult){
	
	WriteToDebug("In ParseGetParamData");

	var aryAICCResponseLines;
	var strLine;
	var strLineName;
	var strLineValue;
	var i, j;			//loop line counters
	
	//parse LMS Result into local variables
	
	strLMSResult = new String(strLMSResult);
	aryAICCResponseLines = strLMSResult.split("\n");	//only use \n instead of \r\n b/c some LMS's will only use one character
	
	WriteToDebug("Split String");
	
	for (i=0; i < aryAICCResponseLines.length; i++){
		
		WriteToDebug("Processing Line #" + i + ": " + aryAICCResponseLines[i]);
		
		strLine = aryAICCResponseLines[i];
		
		strLineName = "";
		strLineValue = "";

		if (strLine.length > 0){
			
			WriteToDebug("Found non-zero length string");
			
			//remove \r from the beginning or end of the string in case we missed it in the original array split
			if (strLine.charAt(0) == "\r"){
				WriteToDebug("Detected leading \\r");
				strLine = strLine.substr(1);
			}
			if (strLine.charAt(strLine.length - 1) == "\r"){
				WriteToDebug("Detected trailing \\r");
				strLine = strLine.substr(0, strLine.length - 1);
			}
			
			if (strLine.charAt(0) != ";") {				//semi-colon indicates a comment line, ignore these
				WriteToDebug("Found non-comment line");
				
				strLineName  = GetNameFromAICCLine(strLine);
				strLineValue = GetValueFromAICCLine(strLine);
				
				WriteToDebug("strLineName=" + strLineName + ", strLineValue=" + strLineValue);
			}
		}
		
		strLineName = strLineName.toLowerCase();
		
		if (! AICC_HasItemBeenFound(strLineName)){		//only process an item the first time it is found since only the first instance is significant
			
			WriteToDebug("Detected an un-found item");
			
			AICC_FoundItem(strLineName);	
			
			switch (strLineName){

				case "version":				//version
					WriteToDebug("Item is version");
					var tempVersion = parseFloat(strLineValue);
					
					if (isNaN(tempVersion)){tempVersion=0;}
					
					AICC_LMS_Version = tempVersion;
					
				break;
				
				case "student_id":				//student id
					WriteToDebug("Item is student_id");
					AICC_Student_ID = strLineValue;
				break;
				
				case "student_name":			//student name
					WriteToDebug("Item is student_name");
					AICC_Student_Name = strLineValue;
				break;		
				
				case "lesson_location":			//bookmark	
					WriteToDebug("Item is lesson_location");
					AICC_Lesson_Location = strLineValue;
				break;		
				
				case "score":					//score
					WriteToDebug("Item is score");
					AICC_Score = strLineValue;
					
					AICC_SeperateScoreValues(AICC_Score);
					
				break;	
				
				case "credit":					//credit
					WriteToDebug("Item is credit");
					AICC_Credit = strLineValue;
					
					AICC_TranslateCredit(AICC_Credit);

				break;						
				
				case "lesson_status":			//status, flag for entry mode
					WriteToDebug("Item is lesson_status");
					AICC_Lesson_Status = strLineValue;
					
					AICC_TranslateLessonStatus(AICC_Lesson_Status);
									
				break;
				
				case "time":					//previous time
					WriteToDebug("Item is time");
					AICC_Time = strLineValue;
					
					AICC_TranslateTimeToMilliseconds(AICC_Time);
									
				break;
				
				case "mastery_score":			//passing score
					WriteToDebug("Item is mastery_score");
					AICC_Mastery_Score = strLineValue;
					
					AICC_ValidateMasteryScore(AICC_Mastery_Score);
				break;			
				
				case "lesson_mode":				//lesson mode (browse, normal, review)
					WriteToDebug("Item is lesson_mode");
					AICC_Lesson_Mode = strLineValue;
					
					AICC_TranslateLessonMode(AICC_Lesson_Mode);
										
				break;
				
				case "max_time_allowed":		//max time allowed
					WriteToDebug("Item is max_time_allowed");
					AICC_Max_Time_Allowed = strLineValue;
					
					AICC_TranslateMaxTimeToMilliseconds(AICC_Max_Time_Allowed);					
					
				break;
				
				case "time_limit_action":		//display message on timeout, exit on timeout
					WriteToDebug("Item is time_limit_action");
					AICC_Time_Limit_Action = strLineValue;
					
					AICC_TranslateTimeLimitAction(AICC_Time_Limit_Action);
										
				break;
				
				case "audio":					//audio play, audio speed
					WriteToDebug("Item is audio");
					AICC_Audio = strLineValue;
					
					AICC_TranslateAudio(AICC_Audio);
										
				break;
				
				case "speed":					//content speed
					WriteToDebug("Item is speed");
					AICC_Speed = strLineValue;
					
					AICC_TranslateSpeed(AICC_Speed);
											
				break;
				
				case "language":				//language
					WriteToDebug("Item is language");
					AICC_Language = strLineValue;
					
				break;
				
				case "text":					//text
					WriteToDebug("Item is text");
					AICC_Text = strLineValue;
					
					AICC_TranslateTextPreference(AICC_Text);
											
				break;

				case "course_id":				//course id
					WriteToDebug("Item is course id");
					AICC_CourseID = strLineValue;
					
				break;				
				
				case "core_vendor":				//launch data
					WriteToDebug("Item is core_vendor");
				
					AICC_Launch_Data = "";
					
					strLine = "";
					j=1;

					if ((i+j) < aryAICCResponseLines.length){
						strLine = aryAICCResponseLines[i+j];
					}	
					
					//loop to the end of the file or current group
					while ( ((i+j) < aryAICCResponseLines.length) && (! IsGroupIdentifier(strLine))){
						
						if (strLine.charAt(0) != ";"){					
							AICC_Launch_Data += strLine + "\n";		//add \n to make up for the one we dropped when splitting the string into the array
						}
						
						j = j + 1;
						
						if ((i+j) < aryAICCResponseLines.length){
							strLine = aryAICCResponseLines[i+j];
						}						
					}
					
					i = i + j - 1
					
					AICC_Launch_Data = AICC_Launch_Data.replace(/\s*$/, "");		//replace trailing whitespace (we've added an extra \n to the end of the string)
					
				break;
				
				case "core_lesson":				//data chunk
					WriteToDebug("Item is core_lesson");

					AICC_Data_Chunk = "";
										
					strLine = "";
					j=1;

					if ((i+j) < aryAICCResponseLines.length){
						strLine = aryAICCResponseLines[i+j];
					}	
					
					//loop to the end of the file or current group
					while ( ((i+j) < aryAICCResponseLines.length) && (! IsGroupIdentifier(strLine))){
						
						if (strLine.charAt(0) != ";"){					
							AICC_Data_Chunk += strLine + "\n";		//add \n to make up for the one we dropped when splitting the string into the array
						}
						
						j = j + 1;
						
						if ((i+j) < aryAICCResponseLines.length){
							strLine = aryAICCResponseLines[i+j];
						}						
					}
					
					i = i + j - 1
					
					AICC_Data_Chunk = AICC_Data_Chunk.replace(/\s*$/, "");		//replace trailing whitespace (we've added an extra \n to the end of the string)		
				break;	
					
				case "comments":				//comments from LMS
					WriteToDebug("Item is comments");

					AICC_Comments = "";
					
					strLine = "";
					j=1;

					if ((i+j) < aryAICCResponseLines.length){
						strLine = aryAICCResponseLines[i+j];
					}	
					
					//loop to the end of the file or current group
					while ( ((i+j) < aryAICCResponseLines.length) && (! IsGroupIdentifier(strLine))){
						
						if (strLine.charAt(0) != ";"){					
							AICC_Comments += strLine + "\n";		//add \n to make up for the one we dropped when splitting the string into the array
						}
						
						j = j + 1;
						
						if ((i+j) < aryAICCResponseLines.length){
							strLine = aryAICCResponseLines[i+j];
						}						
					}
					
					i = i + j - 1	
					
					AICC_Comments = AICC_Comments.replace(/\s*$/, "");		//replace trailing whitespace (we've added an extra \n to the end of the string)
									
				break;
				
				case "objectives_status":		//objectives
					WriteToDebug("Item is objectives_status");

					AICC_Objectives = "";
					
					strLine = "";
					j=1;

					if ((i+j) < aryAICCResponseLines.length){
						strLine = aryAICCResponseLines[i+j];
					}	
					
					//loop to the end of the file or current group
					while ( ((i+j) < aryAICCResponseLines.length) && (! IsGroupIdentifier(strLine))){
						
						if (strLine.charAt(0) != ";"){					
							AICC_Objectives += strLine + "\n";		//add \n to make up for the one we dropped when splitting the string into the array		
						}
						
						j = j + 1;
						
						if ((i+j) < aryAICCResponseLines.length){
							strLine = aryAICCResponseLines[i+j];
						}						
					}
					
					i = i + j - 1	
					AICC_Objectives = AICC_Objectives.replace(/\s*$/, "");		//replace trailing whitespace (we've added an extra \r\n to the end of the string)		
					
					AICC_FormatObjectives(AICC_Objectives);
						
				break;
				
				default:
					//comment or empty line so do nothing
					WriteToDebug("Unknown Item Found");
				break;
				
			}	//end switch
		}	//end if AICC_HasItemBeenFound
	}	//end for
	
	
	return true;

}


function IsGroupIdentifier(strLine){
	WriteToDebug("In IsGroupIdentifier, strLine=" + strLine);
	
	var intPos;
	
	//remove leading white space
	strLine = strLine.replace(/^\s*/, "");
	
	intPos = strLine.search(/\[[\w]+\]/);
	
	WriteToDebug("intPos=" + intPos);
	
	if (intPos == 0){
		WriteToDebug("Returning True");
		return true;
	}
	else{
		WriteToDebug("Returning False");
		return false;
	}
}

function AICC_FoundItem(strItem){
	WriteToDebug("In AICC_FoundItem, strItem=" + strItem);
	aryAICCFoundItems[strItem] = true;
}

function AICC_HasItemBeenFound(strItem){
	WriteToDebug("In AICC_HasItemBeenFound, strItem=" + strItem);
	
	if (aryAICCFoundItems[strItem] == true){
		WriteToDebug("Returning True");
		return true;
	}
	else{
		WriteToDebug("Returning False");
		return false;
	}
}



//==================================================================
//functions for dealing with specific data elements
//==================================================================
function AICC_SeperateScoreValues(AICC_Score){
	WriteToDebug("In AICC_SeperateScoreValues, AICC_Score=" + AICC_Score);
	
	var aryScores;
	aryScore = AICC_Score.split(",");
	
	AICC_fltScoreRaw = aryScore[0];

	if (IsValidDecimal(AICC_fltScoreRaw)){
		WriteToDebug("Found a valid decimal");
		AICC_fltScoreRaw = parseFloat(AICC_fltScoreRaw);
	}
	else{
		WriteToDebug("ERROR - score from LMS is not a valid decimal");
		AICC_SetError(AICC_ERROR_INVALID_DECIMAL, "score is not a valid decimal")
	}
	
	if (aryScore.length > 1){
		WriteToDebug("Max score found");
		AICC_fltScoreMax = aryScore[1];
		if ( IsValidDecimal(AICC_fltScoreMax)){
			WriteToDebug("Found a valid decimal");
			AICC_fltScoreMax = parseFloat(AICC_fltScoreMax);
		}
		else{
			WriteToDebug("ERROR - max score from LMS is not a valid decimal");
			AICC_SetError(AICC_ERROR_INVALID_DECIMAL, "max score is not a valid decimal")
		}		
	}

	if (aryScore.length > 2){
		WriteToDebug("Max score found");
		AICC_fltScoreMin = aryScore[2];
		if (IsValidDecimal(AICC_fltScoreMin)){
			WriteToDebug("Found a valid decimal");
			AICC_fltScoreMin = parseFloat(AICC_fltScoreMin);
		}
		else{
			WriteToDebug("ERROR - min score from LMS is not a valid decimal");
			AICC_SetError(AICC_ERROR_INVALID_DECIMAL, "min score is not a valid decimal")
		}	
				
	}

}


function AICC_ValidateMasteryScore(strScore){
	WriteToDebug("In AICC_ValidateMasteryScore, strScore=" + strScore);
	
	if (IsValidDecimal(strScore)){
		AICC_Mastery_Score = parseFloat(strScore);
	}
	else{
		WriteToDebug("ERROR - mastery score from LMS is not a valid decimal");
		AICC_SetError(AICC_ERROR_INVALID_DECIMAL, "mastery score is not a valid decimal")
	}
	
}

function AICC_TranslateCredit(strCredit){
	WriteToDebug("In AICC_TranslateCredit, strCredit=" + strCredit);
	
	var strFirstChar;
	
	strFirstChar = strCredit.toLowerCase().charAt(0);
	
	if (strFirstChar == "c"){
		WriteToDebug("Credit = true");
		AICC_blnCredit = true;
	}
	else if (strFirstChar == "n"){
		WriteToDebug("Credit = false");
		AICC_blnCredit = false
	}
	else{
		WriteToDebug("ERROR - credit value from LMS is not a valid");
		AICC_SetError(AICC_ERROR_INVALID_CREDIT, "credit value from LMS is not a valid")
	}

}

function AICC_TranslateLessonMode(strMode){
	WriteToDebug("In AICC_TranslateLessonMode, strMode=" + strMode);
	var strFirstChar;
	
	strFirstChar = strMode.toLowerCase().charAt(0);
	
	if (strFirstChar == "b"){
		WriteToDebug("Lesson Mode = Browse");
		AICC_strLessonMode = MODE_BROWSE;
	}
	else if (strFirstChar == "n"){
		WriteToDebug("Lesson Mode = normal");
		AICC_strLessonMode = MODE_NORMAL;
	}
	else if (strFirstChar == "r"){
		WriteToDebug("Lesson Mode = review");
		AICC_strLessonMode = MODE_REVIEW;
		
		if (!(typeof(REVIEW_MODE_IS_READ_ONLY) == "undefined") && REVIEW_MODE_IS_READ_ONLY === true){
			blnReviewModeSoReadOnly = true;
		}
		
	}
	else{
		WriteToDebug("ERROR - lesson_mode value from LMS is not a valid");
		AICC_SetError(AICC_ERROR_INVALID_LESSON_MODE, "lesson_mode value from LMS is not a valid")
	
	}
}


function AICC_TranslateTimeToMilliseconds(strCMITime){
	WriteToDebug("In AICC_TranslateTimeToMilliseconds, strCMITime=" + strCMITime);
	
	if (IsValidCMITimeSpan(strCMITime)){
		AICC_intPreviouslyAccumulatedMilliseconds = ConvertCMITimeSpanToMS(strCMITime);
	}
	else{
		WriteToDebug("ERROR - Invalid CMITimeSpan");
		AICC_SetError(AICC_ERROR_INVALID_TIMESPAN, "Invalid timespan (previously accumulated time) received from LMS");
	}
	
}

function AICC_TranslateMaxTimeToMilliseconds(strCMITime){
	WriteToDebug("In AICC_TranslateMaxTimeToMilliseconds, strCMITime=" + strCMITime);
	
	if (IsValidCMITimeSpan(strCMITime)){
		AICC_intMaxTimeAllowedMilliseconds = ConvertCMITimeSpanToMS(strCMITime);
	}
	else{
		WriteToDebug("ERROR - Invalid CMITimeSpan");
		AICC_SetError(AICC_ERROR_INVALID_TIMESPAN, "Invalid timespan (max time allowed) received from LMS");
	}

}

function AICC_TranslateTimeLimitAction(strTimeLimitAction){
	WriteToDebug("In AICC_TranslateTimeLimitAction, strTimeLimitAction=" + strTimeLimitAction);
	
	var arySplit;
	var blnError = false;
	var strChar1 = "";
	var strChar2 = "";
	
	//note - order of characters is not significant
	
	arySplit = strTimeLimitAction.split(",");
	
	if (arySplit.length == 2){
		
		WriteToDebug("Found 2 elements");
		
		strChar1 = arySplit[0].charAt(0).toLowerCase();
		strChar2 = arySplit[1].charAt(0).toLowerCase();
		
		WriteToDebug("Got characters, strChar1=" + strChar1 + ", strChar2=" + strChar2);
		
		if ( (strChar1 != "e" && strChar1 != "c" && strChar1 != "m" && strChar1 != "n") || 
			 (strChar2 != "e" && strChar2 != "c" && strChar2 != "m" && strChar2 != "n") ||
			 (strChar1 == strChar2)
		   ) {
				blnError = true
				WriteToDebug("Found an invalid character, or 2 identical characters");
		   }
		
		if (strChar1 == "e" || strChar2 == "e") {AICC_blnExitOnTimeout = true;}
		if (strChar1 == "c" || strChar2 == "c") {AICC_blnExitOnTimeout = false;}
		
		if (strChar1 == "n" || strChar2 == "n") {AICC_blnShowMessageOnTimeout = false;}
		if (strChar1 == "m" || strChar2 == "m") {AICC_blnShowMessageOnTimeout = true;}
		
		WriteToDebug("AICC_blnExitOnTimeout=" + AICC_blnExitOnTimeout + ", AICC_blnShowMessageOnTimeout" + AICC_blnShowMessageOnTimeout);
	}
	else{
		WriteToDebug("Line does not contain two comma-delimited elements");
		blnError = true;
	}
	
	if (blnError){
		WriteToDebug("ERROR - Invalid Time Limit Action");
		AICC_SetError(AICC_ERROR_INVALID_TIME_LIMIT_ACTION, "Invalid time limit action received from LMS");

	}
	
}


function AICC_TranslateTextPreference(strPreference){
	WriteToDebug("In AICC_TranslateTextPreference, strPreference=" + strPreference);
	
	if (strPreference == -1){
		WriteToDebug("Text Preference = off");
		AICC_TextPreference = PREFERENCE_OFF;
	}
	else if (strPreference == 0){
		WriteToDebug("Text Preference = default");
		AICC_TextPreference = PREFERENCE_DEFAULT;
	}
	else if (strPreference == 1){
		WriteToDebug("Text Preference = on");
		AICC_TextPreference = PREFERENCE_ON;
	}
	else{
		WriteToDebug("ERROR - Invalid Text Preference");
		AICC_SetError(AICC_ERROR_INVALID_PREFERENCE, "Invalid Text Preference received from LMS");
	
	}
}


function AICC_TranslateLessonStatus(strStatus){
	WriteToDebug("In AICC_TranslateLessonStatus, strStatus=" + strStatus);
	
	var strFirstChar;
	var intPos;
	var strEntry;
	
	strFirstChar = strStatus.charAt(0).toLowerCase();
	
	AICC_Status = AICC_ConvertAICCStatusIntoLocalStatus(strFirstChar);
	
	WriteToDebug("AICC_Status=" + AICC_Status);
	
	//check for an entry flag
	intPos = strStatus.indexOf(",");
	if (intPos > 0){
		strEntry = strStatus.substr(intPos);
		strEntry = strEntry.replace(/,/, "");
		
		strFirstChar = strEntry.charAt(0).toLowerCase();
		
		if (strFirstChar == "a"){
			WriteToDebug("Entry is Ab initio");
			AICC_Entry = ENTRY_FIRST_TIME;
		}
		else if (strFirstChar == "r"){
			WriteToDebug("Entry is Resume");
			AICC_Entry = ENTRY_RESUME;
		}
		else{
			WriteToDebug("ERROR - entry not found");
			AICC_SetError(AICC_ERROR_INVALID_ENTRY, "Invalid lesson status received from LMS");
		}		
	}
	
}


function AICC_ConvertAICCStatusIntoLocalStatus(strFirstCharOfAICCStatus){
	WriteToDebug("In AICC_ConvertAICCStatusIntoLocalStatus, strFirstCharOfAICCStatus=" + strFirstCharOfAICCStatus);
	
	if (strFirstCharOfAICCStatus == "p"){
		WriteToDebug("Status is Passed");
		return LESSON_STATUS_PASSED;
	}
	else if (strFirstCharOfAICCStatus == "f"){
		WriteToDebug("Status is Failed");
		return LESSON_STATUS_FAILED;
	}
	else if (strFirstCharOfAICCStatus == "c"){
		WriteToDebug("Status is Completed");
		return LESSON_STATUS_COMPLETED;
	}
	else if (strFirstCharOfAICCStatus == "b"){
		WriteToDebug("Status is Browsed");
		return LESSON_STATUS_BROWSED;
	}
	else if (strFirstCharOfAICCStatus == "i"){
		WriteToDebug("Status is Incomplete");
		return LESSON_STATUS_INCOMPLETE;
	}
	else if (strFirstCharOfAICCStatus == "n"){
		WriteToDebug("Status is Not Attempted");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
	else{
		WriteToDebug("ERROR - status not found");
		AICC_SetError(SCORM_ERROR_INVALID_STATUS, "Invalid status");
		return LESSON_STATUS_NOT_ATTEMPTED;
	}
}


function AICC_TranslateAudio(strAudio){
	
	WriteToDebug("In AICC_TranslateAudio, strAudio=" + strAudio);
	
	var intTempPreference = parseInt(strAudio, 10);
	
	WriteToDebug("intTempPreference=" + intTempPreference);
	
	if (intTempPreference > 0 && intTempPreference <= 100){
		WriteToDebug("Returning On");
		AICC_AudioPlayPreference = PREFERENCE_ON;
		AICC_intAudioVolume = intTempPreference;
	}
	else if (intTempPreference == 0){
		WriteToDebug("Returning Default");
		AICC_AudioPlayPreference = PREFERENCE_DEFAULT;
	}
	else if (intTempPreference < 0) {
		WriteToDebug("returning Off");
		AICC_AudioPlayPreference = PREFERENCE_OFF;
	}
	else{
		//preference is not a number
		WriteToDebug("Error: Invalid preference");
		AICC_SetError(AICC_ERROR_INVALID_PREFERENCE, "Invalid audio preference received from LMS");
	}
}


function AICC_TranslateSpeed(intAICCSpeed){
	
	WriteToDebug("In AICC_TranslateSpeed, intAICCSpeed=" + intAICCSpeed);
	
	var intPercentOfMax;
	
	if ( ! ValidInteger(intAICCSpeed) ){
		WriteToDebug("ERROR - invalid integer");
		AICC_SetError(AICC_ERROR_INVALID_SPEED, "Invalid speed preference received from LMS - not an integer");
		return;
	}
	
	intAICCSpeed = parseInt(intAICCSpeed, 10)
	
	if (intAICCSpeed < -100 || intAICCSpeed > 100){
		WriteToDebug("ERROR - out of range");
		AICC_SetError(AICC_ERROR_INVALID_SPEED, "Invalid speed preference received from LMS - out of range");
		return;

	}
	
	AICC_Speed = intAICCSpeed;
	
	intPercentOfMax = (intAICCSpeed + 100) / 2;
	intPercentOfMax = parseInt(intPercentOfMax, 10);
	
	WriteToDebug("Returning " + intPercentOfMax);
	
	AICC_intPercentOfMaxSpeed = intPercentOfMax;

}



function AICC_FormatObjectives(strObjectivesFromLMS){
	
	WriteToDebug("In AICC_FormatObjectives, strObjectivesFromLMS=" + strObjectivesFromLMS);
	
	var aryLines;
	var i;
	var strLineName;
	var strLineValue;
	var strLineType;
	var strIndex;
	
	aryLines = strObjectivesFromLMS.split("\n");
	
	//establish the read array with empty elements for all the IDs we'll encounter
	for (i=0; i < aryLines.length; i++){
		WriteToDebug("Extracting Index From Line: " + aryLines[i]);
		
		strLineName  = GetNameFromAICCLine(aryLines[i]);
		strIndex = GetIndexFromAICCName(strLineName);
		
		strIndex = parseInt(strIndex, 10);
		
		WriteToDebug("strIndex: " + strIndex);
		
		AICC_aryObjectivesRead[parseInt(strIndex, 10)] = new Array(3);
	}


	//loop through the line again and now populate the actual data
	for (i=0; i < aryLines.length; i++){
		WriteToDebug("Populating Line " + aryLines[i]);
		
		strLineName  = GetNameFromAICCLine(aryLines[i]);
		strLineValue = GetValueFromAICCLine(aryLines[i]);
		
		strIndex = GetIndexFromAICCName(strLineName);
		
		strIndex = strIndex;
		
		WriteToDebug("strLineName: " + strLineName);
		WriteToDebug("strLineValue: " + strLineValue);
		WriteToDebug("strIndex: " + strIndex);
		
		strLineType = strLineName.substr(0,4).toLowerCase();
		
		if (strLineType == "j_id"){
			WriteToDebug("Found ID");
			AICC_aryObjectivesRead[parseInt(strIndex, 10)][AICC_OBJ_ARRAY_ID] = strLineValue;
		}
		else if (strLineType =="j_st"){
			WriteToDebug("Found Status");
			AICC_aryObjectivesRead[parseInt(strIndex, 10)][AICC_OBJ_ARRAY_STATUS] = AICC_ConvertAICCStatusIntoLocalStatus(strLineValue.charAt(0).toLowerCase());
		}
		else if (strLineType == "j_sc"){
			WriteToDebug("Found Score");
			AICC_aryObjectivesRead[parseInt(strIndex, 10)][AICC_OBJ_ARRAY_SCORE] = AICC_ExtractSingleScoreFromObjective(strLineValue);
		}
		else{
			WriteToDebug("WARNING - unidentified objective data found - " + aryLines[i]);
		}
		
	}
	
}


function AICC_ExtractSingleScoreFromObjective(strLineValue){
	WriteToDebug("In AICC_ExtractSingleScoreFromObjective, strLineValue=" + strLineValue);
	
	//AICC objectives can have multiple score sets (raw,max,min) seperated by semi-colons,they represent the various attempts at an objective
	//we're just concerned with the most recent attempt
	
	var aryParts;
	
	aryParts = strLineValue.split(";");		//drop the previous instances if any
	aryParts = aryParts[0].split(",");		//drop the max and min scores if any
	
	
	WriteToDebug("returning " + aryParts[0]);
	
	return aryParts[0];
	
}

function FindObjectiveById(strID, aryObjectives){

	WriteToDebug("In FindObjectiveById, strID=" + strID);

	for (var i=0; i <= aryObjectives.length; i++){

		WriteToDebug("Searching element " + i);	

		if (aryObjectives[i]){
			WriteToDebug("Element Exists");	
			
			if (aryObjectives[i][AICC_OBJ_ARRAY_ID].toString() == strID.toString()){
				WriteToDebug("Element matches");	
				return i;
			}
		}
	}
	
	return null;
}



//___________________________________________________________
//Interaction Retrieval Functionality
//NOTE ON INTERACTION RETRIEVAL
//A.  It is only available in certain standards, standards where it is unavailable will return nothing
//B.  The interaction records are currently reported using "journaling", whereby each entry is appended
//		Retrieval methods will retrieve only the most recent value


//___________________________________________________________
//Helper Methods
function AICC_FindInteractionIndexFromID(strInteractionID){

	WriteToDebug("AICC_FindInteractionIndexFromID - AICC does not support interaction retrieval, returning null");
	
	return null;
}
//___________________________________________________________


function AICC_GetInteractionType(strInteractionID)
{

	WriteToDebug("AICC_GetInteractionType - AICC does not support interaction retrieval, returning empty string");
	return '';
	

}

//public
function AICC_GetInteractionTimestamp(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionTimestamp - AICC does not support interaction retrieval, returning empty string");
	return '';
}



//public
function AICC_GetInteractionCorrectResponses(strInteractionID)
{

	WriteToDebug("AICC_GetInteractionCorrectResponses - AICC does not support interaction retrieval, returning empty array");
	return new Array();

	
}



//public
function AICC_GetInteractionWeighting(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionWeighting - AICC does not support interaction retrieval, returning empty string");
	return '';

}



//public
function AICC_GetInteractionLearnerResponses(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionLearnerResponses - AICC does not support interaction retrieval, returning empty array");
	return new Array();


}


//public
function AICC_GetInteractionResult(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionResult - AICC does not support interaction retrieval, returning empty string");
	return '';
	
}



//public
function AICC_GetInteractionLatency(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionDescription - AICC does not support interaction retrieval, returning empty string");
	return '';

}



//public
function AICC_GetInteractionDescription(strInteractionID)
{
	WriteToDebug("AICC_GetInteractionDescription - AICC does not support interaction retrieval, returning empty string");
	return '';
}

//________________________________________________

//public
function AICC_CreateDataBucket(strBucketId, intMinSize, intMaxSize){
	WriteToDebug("AICC_CreateDataBucket - AICC does not support SSP, returning false");
	return false;
}

//public
function AICC_GetDataFromBucket(strBucketId){
	WriteToDebug("AICC_GetDataFromBucket - AICC does not support SSP, returning empty string");
	return "";
}

//public
function AICC_PutDataInBucket(strBucketId, strData, blnAppendToEnd){
	WriteToDebug("AICC_PutDataInBucket - AICC does not support SSP, returning false");
	return false;
}

//public
function AICC_DetectSSPSupport(){
	WriteToDebug("AICC_DetectSSPSupport - AICC does not support SSP, returning false");
	return false;
}

//public
function AICC_GetBucketInfo(strBucketId){
    WriteToDebug("AICC_DetectSSPSupport - AICC does not support SSP, returning empty SSPBucketSize");
	return new SSPBucketSize(0, 0);
}




//==================================================================
//==================================================================

function FormAICCPostData(){
	WriteToDebug("In FormAICCPostData");
	
	var strAICCData = "";
	
	
	strAICCData += "[Core]\r\n";
	
	strAICCData += "Lesson_Location=" + AICC_Lesson_Location + "\r\n";
	strAICCData += "Lesson_Status=" + AICC_TranslateLessonStatusToAICC(AICC_Status) + "\r\n";
	strAICCData += "Score=" + AICC_TranslateScoreToAICC() + "\r\n";
	strAICCData += "Time=" + AICC_TranslateTimeToAICC() + "\r\n";
	
	strAICCData += "[Comments]\r\n" + AICC_TranslateCommentsToAICC() + "\r\n";
	
	strAICCData += "[Objectives_Status]\r\n" + AICC_TranslateObjectivesToAICC() + "\r\n";
	
	strAICCData += "[Student_Preferences]\r\n";
	
	strAICCData += "Audio=" + AICC_TranslateAudioToAICC() + "\r\n";
	strAICCData += "Language=" + AICC_Language + "\r\n";
	strAICCData += "Speed=" + AICC_TranslateSpeedToAICC() + "\r\n";
	strAICCData += "Text=" + AICC_TranslateTextToAICC() + "\r\n";
	
	strAICCData += "[Core_Lesson]\r\n"; 
	strAICCData += AICC_Data_Chunk;
	
	WriteToDebug("FormAICCPostData returning: " + strAICCData);
	
	return strAICCData;
}

function AICC_TranslateLessonStatusToAICC(intStatus){
	
	WriteToDebug("In AICC_TranslateLessonStatusToAICC");
	
	switch (intStatus){
		
		case LESSON_STATUS_PASSED:
			WriteToDebug("Status is passed");
			AICC_Lesson_Status = "P";
		break;
		
		case LESSON_STATUS_COMPLETED:
			WriteToDebug("Status is completed");
			AICC_Lesson_Status = "C";
		break;
		
		case LESSON_STATUS_FAILED:
			WriteToDebug("Status is failed");
			AICC_Lesson_Status = "F";
		break;
		
		case LESSON_STATUS_INCOMPLETE:
			WriteToDebug("Status is incomplete");
			AICC_Lesson_Status = "I";
		break;
		
		case LESSON_STATUS_BROWSED:
			WriteToDebug("Status is browsed");
			AICC_Lesson_Status = "B";
		break;
		
		case LESSON_STATUS_NOT_ATTEMPTED:
			WriteToDebug("Status is not attempted");
			AICC_Lesson_Status = "N";
		break;								
	}
	
	return AICC_Lesson_Status;
}

function AICC_TranslateScoreToAICC(){
	
	WriteToDebug("In AICC_TranslateScoreToAICC");
	
	AICC_Score = AICC_fltScoreRaw;
	
	//prior to version 3, AICC scores cannot contain a decimal
	if (AICC_LMS_Version < 3 && AICC_fltScoreRaw != ""){
		AICC_Score = parseInt(AICC_Score, 10);
	}
	
	//some older versions may not have this setting available
	if (	(AICC_REPORT_MIN_MAX_SCORE === undefined || 
			 AICC_REPORT_MIN_MAX_SCORE === null || 
			 AICC_REPORT_MIN_MAX_SCORE === true) &&
			(AICC_LMS_Version >= 3 )		//min and max scores are only allowed after version 3
		){
		
		WriteToDebug("Using max and min values if available.");
		
		if ((AICC_fltScoreMax != "") || (AICC_fltScoreMin != "")) {
			WriteToDebug("Appending Max and Min scores");
			AICC_Score += "," + AICC_fltScoreMax + "," + AICC_fltScoreMin;
		}
	
	}
	
	WriteToDebug("AICC_Score=" + AICC_Score);
	
	return AICC_Score;
}

function AICC_TranslateTimeToAICC(){
	
	WriteToDebug("In AICC_TranslateTimeToAICC");
	
	var strTime;
	
	strTime = ConvertMilliSecondsToSCORMTime(AICC_intSessionTimeMilliseconds, false);
	
	return strTime;
}

function AICC_TranslateCommentsToAICC(){
	
	WriteToDebug("In AICC_TranslateCommentsToAICC");
	
	var strComments = "";
	for (var i=0; i < AICC_aryCommentsFromLearner.length; i++){
		strComments += "<" + (i+1) + ">" + AICC_aryCommentsFromLearner[i] + "<e." + (i+1) + ">";
	}
	return strComments;
}

function AICC_TranslateObjectivesToAICC(){
	
	WriteToDebug("In AICC_TranslateObjectivesToAICC");
	
	var strObjectives = "";
	
	for (var i=0; i<AICC_aryObjectivesWrite.length; i++){
	
		WriteToDebug("Looking at index: " + i);
		
		if (AICC_aryObjectivesWrite[i]){
			WriteToDebug("Element " + i + " exists, id=" + AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_ID] + ", score=" + AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_SCORE] + ", status=" + AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_STATUS]);
			
			strObjectives += "J_ID." + (i+1) + "=" + AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_ID] + "\r\n";
			
			if (AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_SCORE] != ""){
				strObjectives += "J_Score." + (i+1) + "=" + AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_SCORE] + "\r\n";
			}
			
			if (AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_STATUS] != ""){
				strObjectives += "J_Status." + (i+1) + "=" + AICC_TranslateLessonStatusToAICC(AICC_aryObjectivesWrite[i][AICC_OBJ_ARRAY_STATUS]) + "\r\n";
			}
		}
	}
	
	return strObjectives;
}

function AICC_TranslateAudioToAICC(){
	
	WriteToDebug("In AICC_TranslateAudioToAICC");
	
	var strReturn;
	
	switch (AICC_AudioPlayPreference){
		
		case PREFERENCE_ON:
			WriteToDebug("Preference is ON");
			strReturn = AICC_intAudioVolume;
		break;

		case PREFERENCE_DEFAULT:
			WriteToDebug("Preference is DEFAULT");
			strReturn = 0;
		break;

		case PREFERENCE_OFF:
			WriteToDebug("Preference is OFF");
			strReturn = -1;
		break;		
	}
	
	return strReturn;
}



function AICC_TranslateSpeedToAICC(){
	WriteToDebug("In AICC_TranslateSpeedToAICC");
	
	var intAICCSpeed;
	
	intAICCSpeed = (AICC_intPercentOfMaxSpeed * 2) - 100;
	
	return intAICCSpeed;
}

function AICC_TranslateTextToAICC(){
	WriteToDebug("In AICC_TranslateTextToAICC");
	
	var strPreference = 0;
	
	if (AICC_TextPreference == PREFERENCE_OFF){
		strPreference = -1;
	}
	else if (AICC_TextPreference == PREFERENCE_DEFAULT){
		strPreference = 0;
	}
	else if (AICC_TextPreference == PREFERENCE_ON){
		strPreference = 1;
	}
	
	return strPreference;
}



//==================================================================
//interactions
//==================================================================


function FormAICCInteractionsData(){
	
	WriteToDebug("In FormAICCInteractionsData");
	
	var strInteractions;
	var strDate;
	var strTime;
	var strResult = "";
	
	strInteractions = '"course_id","student_id","lesson_id","date","time","interaction_id",' + 
					  '"objective_id","type_interaction","correct_response","student_response",' +
					  '"result","weighting","latency"\r\n';
	
	var blnCorrect = "";
	var strResponse = "";
	var strCorrectResponse = "";
	var strLatency = "";
	
	for (var i=0; i < AICC_aryInteractions.length; i++){
		
		blnCorrect = AICC_aryInteractions[i][AICC_INTERACTIONS_CORRECT];
		strResult = "";
		
		//need to leave support for blnCorrect=t/f for legacy implementations of RSECA
		//if it's null, leave it as "" (not every interaction is correct/incorrect
		
		if (blnCorrect == true || blnCorrect == INTERACTION_RESULT_CORRECT){
			strResult = AICC_RESULT_CORRECT;
		}
		else if (blnCorrect == "false" || blnCorrect == INTERACTION_RESULT_WRONG){			//compare against the string "false" because ("" == false) evaluates to true
			strResult = AICC_RESULT_WRONG;
		}
		else if (blnCorrect == INTERACTION_RESULT_UNANTICIPATED){
			strResult = AICC_RESULT_UNANTICIPATED;
		}
		else if (blnCorrect == INTERACTION_RESULT_NEUTRAL){
			strResult = AICC_RESULT_NEUTRAL;
		}
		
		strDate = ConvertDateToCMIDate(AICC_aryInteractions[i][AICC_INTERACTIONS_TIME_STAMP]);
		strTime = ConvertDateToCMITime(AICC_aryInteractions[i][AICC_INTERACTIONS_TIME_STAMP]);
		
		
		if (blnUseLongInteractionResultValues == true){
			strResponse = AICC_aryInteractions[i][AICC_INTERACTIONS_RESPONSE_LONG];
			strCorrectResponse = AICC_aryInteractions[i][AICC_INTERACTIONS_CORRECT_RESPONSE_LONG];
		}
		else{
			strResponse = AICC_aryInteractions[i][AICC_INTERACTIONS_RESPONSE];
			strCorrectResponse = AICC_aryInteractions[i][AICC_INTERACTIONS_CORRECT_RESPONSE];
		}
		
		strResponse = new String(strResponse);
		strCorrectResponse = new String(strCorrectResponse);
		
		var tempLatency = AICC_aryInteractions[i][AICC_INTERACTIONS_LATENCY];
		
		if (tempLatency !== null && tempLatency !== undefined && tempLatency != ""){
			strLatency = ConvertMilliSecondsToSCORMTime(tempLatency, false);
		}
		
		strInteractions += '"' + AICC_CourseID.replace("\"", "") + '","' + AICC_Student_ID.replace("\"", "") + '","' + AICC_LESSON_ID.replace("\"", "") + '","' + 
						   strDate + '","' + strTime + '","' + AICC_aryInteractions[i][AICC_INTERACTIONS_ID].replace("\"", "") + '",' +
						   '""' + ',"' + AICC_aryInteractions[i][AICC_INTERACTIONS_TYPE] + '","' + strCorrectResponse.replace("\"", "") + '","' + 
						   strResponse.replace("\"", "") + '","' + strResult + '","' + 
						   AICC_aryInteractions[i][AICC_INTERACTIONS_WEIGHTING] + '","' + strLatency + '"\r\n';
	}
	
	return strInteractions;
}


/*
moved to UtilityFunctions.js ConvertToCMIDate
function ConvertToCMIDate(dtmDate){

	WriteToDebug("In ConvertToCMIDate");
	
	var strYear;
	var strMonth;
	var strDay;
	var strReturn;
	
	dtmDate = new Date(dtmDate);
	
	strYear = dtmDate.getFullYear()
	strMonth = dtmDate.getMonth();
	strDay = dtmDate.getDate();
	
	strReturn = ZeroPad(strYear, 4) + "/" + ZeroPad(strMonth, 2) + "/" + ZeroPad(strDay, 2);
	
	return strReturn;
}
*/
/*
moved to UtilityFunctions.js ConvertDateToCMITime
function ConvertToCMITime(dtmDate){
	
	WriteToDebug("In ConvertToCMITime");

	var strHours;
	var strMinutes;
	var strSeconds;
	var strReturn;
	
	dtmDate = new Date(dtmDate);
	
	strHours = dtmDate.getHours();
	strMinutes = dtmDate.getMinutes();
	strSeconds = dtmDate.getSeconds();
	
	strReturn = ZeroPad(strHours, 2) + ":" + ZeroPad(strMinutes) + ":" + ZeroPad(strSeconds, 2);
	
	return strReturn;
}
*/

//==================================================================
//debug stuff
//==================================================================

//used for debug only
function DisplayAICCVariables(){
	
	var strAlert = "";

	strAlert += "AICC_Student_ID = " + AICC_Student_ID + "\n";
	strAlert += "AICC_Student_Name = " + AICC_Student_Name + "\n";
	strAlert += "AICC_Lesson_Location = " + AICC_Lesson_Location + "\n";
	strAlert += "AICC_Score = " + AICC_Score + "\n";
	strAlert += "AICC_Credit = " + AICC_Credit + "\n";
	strAlert += "AICC_Lesson_Status = " + AICC_Lesson_Status + "\n";
	strAlert += "AICC_Time = " + AICC_Time + "\n";
	strAlert += "AICC_Mastery_Score = " + AICC_Mastery_Score + "\n";
	strAlert += "AICC_Lesson_Mode = " + AICC_Lesson_Mode + "\n";
	strAlert += "AICC_Max_Time_Allowed = " + AICC_Max_Time_Allowed + "\n";
	strAlert += "AICC_Time_Limit_Action = " + AICC_Time_Limit_Action + "\n";
	strAlert += "AICC_Audio = " + AICC_Audio + "\n";
	strAlert += "AICC_Speed = " + AICC_Speed + "\n";
	strAlert += "AICC_Language = " + AICC_Language + "\n";
	strAlert += "AICC_Text = " + AICC_Text + "\n";
	strAlert += "AICC_Launch_Data = " + AICC_Launch_Data + "\n";
	strAlert += "AICC_Data_Chunk = " + AICC_Data_Chunk + "\n";
	strAlert += "AICC_Comments = " + AICC_Comments + "\n";
	strAlert += "AICC_Objectives = " + AICC_Objectives + "\n";
	
	alert(strAlert)
}



