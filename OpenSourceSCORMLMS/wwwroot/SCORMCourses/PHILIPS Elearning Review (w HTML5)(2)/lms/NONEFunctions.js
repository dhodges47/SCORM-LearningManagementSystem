
function NONE_Initialize(){
	WriteToDebug("In NONE_Initialize, Returning true");
	
	InitializeExecuted(true, "");
	
	return true;
}


function NONE_Finish(strExitType, blnStatusWasSet){
	WriteToDebug("In NONE_Finish, Returning true");
	return true;
}


function NONE_CommitData(){
	WriteToDebug("In NONE_CommitData, Returning true");
	return true;
}

function NONE_GetStudentID(){
	WriteToDebug("In NONE_GetStudentID, Returning ''");
	return "";	
}

function NONE_GetStudentName(){
	WriteToDebug("In NONE_GetStudentName, Returning ''");
	return "";
}

function NONE_GetBookmark(){
	WriteToDebug("In NONE_GetBookmark, Returning ''");
	return "";
}

function NONE_SetBookmark(strBookmark){
	WriteToDebug("In NONE_SetBookmark, Returning true");
	return true;
}

function NONE_GetDataChunk(){
	WriteToDebug("In NONE_GetDataChunk, Returning ''");
	return "";
}

function NONE_SetDataChunk(strData){
	WriteToDebug("In NONE_SetDataChunk, Returning true");
	return true;
}


function NONE_GetLaunchData(){
	WriteToDebug("In NONE_GetLaunchData, Returning ''");
	return "";
}

function NONE_GetComments(){
	WriteToDebug("In NONE_GetComments, Returning ''");
	return "";
}

function NONE_WriteComment(strComment){
	WriteToDebug("In NONE_WriteComment, Returning true");
	return true;
}

function NONE_GetLMSComments(){
	WriteToDebug("In NONE_GetLMSComments, Returning ''");
	return "";
}


function NONE_GetAudioPlayPreference(){
	WriteToDebug("In NONE_GetAudioPlayPreference, Returning " + PREFERENCE_DEFAULT);
	return PREFERENCE_DEFAULT;
}



function NONE_GetAudioVolumePreference(){
	WriteToDebug("In NONE_GetAudioVolumePreference, Returning 100");
	return 100;
}


function NONE_SetAudioPreference(PlayPreference, intPercentOfMaxSpeed){
	WriteToDebug("In NONE_SetAudioPreference, Returning true");
	return true;
}



function NONE_SetLanguagePreference(strLanguage){
	WriteToDebug("In NONE_SetLanguagePreference, Returning true");
	return true;
}


function NONE_GetLanguagePreference(){
	WriteToDebug("In NONE_GetLanguagePreference, Returning ''");
	return "";
}


function NONE_SetSpeedPreference(intPercentOfMax){
	WriteToDebug("In NONE_SetSpeedPreference, Returning true");
	return true;
}


function NONE_GetSpeedPreference(){
	WriteToDebug("In NONE_GetSpeedPreference, Returning 100");
	return 100;
}

function NONE_SetTextPreference(intPreference){
	WriteToDebug("In NONE_SetTextPreference, Returning true");
	return true;
}


function NONE_GetTextPreference(){
	WriteToDebug("In NONE_GetTextPreference, Returning " + PREFERENCE_DEFAULT);
	return PREFERENCE_DEFAULT;
}

function NONE_GetPreviouslyAccumulatedTime(){
	WriteToDebug("In NONE_GetPreviouslyAccumulatedTime, Returning 0");
	return 0;
}


function NONE_SaveTime(intMilliSeconds){
	WriteToDebug("In intMilliSeconds, Returning true");
	return true;
}

function NONE_GetMaxTimeAllowed(){
	WriteToDebug("In NONE_GetMaxTimeAllowed, Returning 36002439999");
	return MAX_CMI_TIME;	
}



function NONE_DisplayMessageOnTimeout(){
	WriteToDebug("In NONE_DisplayMessageOnTimeout, Returning false");
	return false;
}

function NONE_ExitOnTimeout(){
	WriteToDebug("In NONE_ExitOnTimeout, Returning false");
	return false;
}


function NONE_GetPassingScore(){
	WriteToDebug("In NONE_GetPassingScore, Returning ''");
	return '';
}



function NONE_GetScore(){
	WriteToDebug("In NONE_GetScore, Returning 0");
	return 0;
}

function NONE_SetScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("In NONE_SetScore, Returning true");
	return true;
}



function NONE_RecordTrueFalseInteraction(){
	WriteToDebug("In NONE_RecordTrueFalseInteraction, Returning true");
	return true;
}
function NONE_RecordMultipleChoiceInteraction(strID, strResponse, blnCorrect, strCorrectResponse){
	WriteToDebug("In NONE_RecordMultipleChoiceInteraction, Returning true");
	return true;
}
function NONE_RecordFillInInteraction(){
	WriteToDebug("In NONE_RecordFillInInteraction, Returning true");
	return true;
}
function NONE_RecordMatchingInteraction(){
	WriteToDebug("In NONE_RecordMatchingInteraction, Returning true");
	return true;
}
function NONE_RecordPerformanceInteraction(){
	WriteToDebug("In NONE_RecordPerformanceInteraction, Returning true");
	return true;
}
function NONE_RecordSequencingInteraction(){
	WriteToDebug("In NONE_RecordSequencingInteraction, Returning true");
	return true;
}
function NONE_RecordLikertInteraction(){
	WriteToDebug("In RecordLikertInteraction, Returning true");
	return true;
}
function NONE_RecordNumericInteraction(){
	WriteToDebug("In NONE_RecordNumericInteraction, Returning true");
	return true;
}


function NONE_GetEntryMode(){
	WriteToDebug("In NONE_GetEntryMode, Returning " + ENTRY_FIRST_TIME);
	return ENTRY_FIRST_TIME;
}

function NONE_GetLessonMode(){
	WriteToDebug("In NONE_GetLessonMode, Returning " + MODE_NORMAL);
	return MODE_NORMAL;
}

function NONE_GetTakingForCredit(){
	WriteToDebug("In NONE_GetTakingForCredit, Returning true");
	return true;
}



function NONE_SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore){
	WriteToDebug("In NONE_SetObjectiveScore, Returning true");
	return true;
}


function NONE_SetObjectiveStatus(strObjectiveID, Lesson_Status){
	WriteToDebug("In NONE_SetObjectiveStatus, Returning true");
	return true;
}

function NONE_SetObjectiveDescription(strObjectiveID, strObjectiveDescription){
	WriteToDebug("In NONE_SetObjectiveDescription, Returning true");
	return true;
}


function NONE_GetObjectiveScore(strObjectiveID){
	WriteToDebug("In NONE_SetObjectiveScore, Returning ''");
	return '';
}


function NONE_GetObjectiveStatus(strObjectiveID){
	WriteToDebug("In NONE_SetObjectiveStatus, Returning Not Attempted");
	return LESSON_STATUS_NOT_ATTEMPTED;
}

function NONE_GetObjectiveDescription(strObjectiveID){
	WriteToDebug("In NONE_GetObjectiveDescription, ''");
	return "";
}



//___________________________________________________________
//Interaction Retrieval Functionality
//NOTE ON INTERACTION RETRIEVAL
//A.  It is only available in certain standards, standards where it is unavailable will return nothing
//B.  The interaction records are currently reported using "journaling", whereby each entry is appended
//		Retrieval methods will retrieve only the most recent value


//___________________________________________________________
//Helper Methods
function NONE_FindInteractionIndexFromID(strInteractionID){

	WriteToDebug("NONE_FindInteractionIndexFromID - NONE does not support interaction retrieval, returning null");
	
	return null;
}
//___________________________________________________________


function NONE_GetInteractionType(strInteractionID)
{

	WriteToDebug("NONE_GetInteractionType - NONE does not support interaction retrieval, returning empty string");
	return '';
	

}

//public
function NONE_GetInteractionTimestamp(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionTimestamp - NONE does not support interaction retrieval, returning empty string");
	return '';
}



//public
function NONE_GetInteractionCorrectResponses(strInteractionID)
{

	WriteToDebug("NONE_GetInteractionCorrectResponses - NONE does not support interaction retrieval, returning empty array");
	return new Array();

	
}



//public
function NONE_GetInteractionWeighting(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionWeighting - NONE does not support interaction retrieval, returning empty string");
	return '';

}



//public
function NONE_GetInteractionLearnerResponses(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionLearnerResponses - NONE does not support interaction retrieval, returning empty array");
	return new Array();


}


//public
function NONE_GetInteractionResult(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionResult - NONE does not support interaction retrieval, returning empty string");
	return '';
	
}



//public
function NONE_GetInteractionLatency(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionDescription - NONE does not support interaction retrieval, returning empty string");
	return '';

}



//public
function NONE_GetInteractionDescription(strInteractionID)
{
	WriteToDebug("NONE_GetInteractionDescription - NONE does not support interaction retrieval, returning empty string");
	return '';

	
}

//public
function NONE_CreateDataBucket(strBucketId, intMinSize, intMaxSize){
	WriteToDebug("NONE_CreateDataBucket - NONE does not support SSP, returning false");
	return false;
}

//public
function NONE_GetDataFromBucket(strBucketId){
	WriteToDebug("NONE_GetDataFromBucket - NONE does not support SSP, returning empty string");
	return "";
}

//public
function NONE_PutDataInBucket(strBucketId, strData, blnAppendToEnd){
	WriteToDebug("NONE_PutDataInBucket - NONE does not support SSP, returning false");
	return false;
}

//public
function NONE_DetectSSPSupport(){
	WriteToDebug("NONE_DetectSSPSupport - NONE does not support SSP, returning false");
	return false;
}

//public
function NONE_GetBucketInfo(strBucketId){
    WriteToDebug("NONE_DetectSSPSupport - NONE does not support SSP, returning empty SSPBucketSize");
	return new SSPBucketSize(0, 0);
}


//________________________________________________




function NONE_SetFailed(){
	WriteToDebug("In NONE_SetFailed, Returning true");
	return true;
}

function NONE_SetPassed(){
	WriteToDebug("In NONE_SetPassed, Returning true");
	return true;
}

function NONE_SetCompleted(){
	WriteToDebug("In NONE_SetCompleted, Returning true");
	return true;
}

function NONE_ResetStatus(){
	WriteToDebug("In NONE_ResetStatus, Returning true");
	return true;
}

function NONE_GetStatus(){
	WriteToDebug("In NONE_GetStatus, Returning " + LESSON_STATUS_INCOMPLETE);
	return LESSON_STATUS_INCOMPLETE;
}

//public
function NONE_GetProgressMeasure(){
	WriteToDebug("NONE_GetProgressMeasure - NONE does not support progress_measure, returning false");
	return false;
}
//public
function NONE_SetProgressMeasure(){
	WriteToDebug("NONE_SetProgressMeasure - NONE does not support progress_measure, returning false");
	return false;
}

//public
function NONE_GetObjectiveProgressMeasure(){
	WriteToDebug("NONE_GetObjectiveProgressMeasure - NONE does not support progress_measure, returning false");
	return false;
}
//public
function NONE_SetObjectiveProgressMeasure(){
	WriteToDebug("NONE_SetObjectiveProgressMeasure - NONE does not support progress_measure, returning false");
	return false;
}

function NONE_SetPointBasedScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("NONE_SetPointBasedScore - NONE does not support SetPointBasedScore, returning false");
	return false;
}

function NONE_GetScaledScore(intScore, intMaxScore, intMinScore){
	WriteToDebug("NONE_GetScaledScore - NONE does not support GetScaledScore, returning false");
	return false;
}

function NONE_GetLastError(){
	WriteToDebug("In NONE_GetLastError, Returning " + NO_ERROR);
	return NO_ERROR;
}

function NONE_GetLastErrorDesc(){
	WriteToDebug("In NONE_GetLastErrorDesc, Returning ''");
	return "";
}

