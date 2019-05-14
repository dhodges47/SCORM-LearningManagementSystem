//API functions - each function validates inputs, then passes call to Standard function

//global status variables
var blnCalledFinish = false;
var blnStandAlone = false;
var blnLoaded = false;
var blnReachedEnd = false;
var blnStatusWasSet = false;
var blnLmsPresent = false;

//time tracking variables
var dtmStart = null;
var dtmEnd = null;
var intAccumulatedMS = 0;
var blnOverrodeTime = false;
var intTimeOverrideMS = null;

//debug info
var aryDebug = new Array();
var strDebug = "";
var winDebug;

var intError = NO_ERROR;
var strErrorDesc = "";

var objLMS = null;

//public
function Start(){

	var strStandAlone;
	var strShowInteractiveDebug;
	var objTempAPI = null;
	var strTemp = "";
	
	WriteToDebug("----------------------------------------");
	WriteToDebug("----------------------------------------");
	WriteToDebug("In Start - Version: " + VERSION + "  Last Modified=" + window.document.lastModified);
	WriteToDebug("Browser Info (" + navigator.appName + " " + navigator.appVersion + ")");
	WriteToDebug("URL: " + window.document.location.href);
	WriteToDebug("----------------------------------------");
	WriteToDebug("----------------------------------------");
		
	ClearErrorInfo();
	
	strStandAlone           = GetQueryStringValue("StandAlone", window.location.search);
	strShowInteractiveDebug = GetQueryStringValue("ShowDebug", window.location.search);
	
	WriteToDebug("strStandAlone=" + strStandAlone + "  strShowInteractiveDebug=" + strShowInteractiveDebug);
	
	if (ConvertStringToBoolean(strStandAlone)){
		WriteToDebug("Entering Stand Alone Mode");
		blnStandAlone = true;
	}	
	
	if (blnStandAlone){
		//allow NONE standard here to override config setting
		WriteToDebug("Using NONE Standard");
		objLMS = new LMSStandardAPI("NONE");
	}
	else{
		WriteToDebug("Standard From Configuration File - " + strLMSStandard);

		if (strLMSStandard.toUpperCase() == "AUTO"){
			
			//to try to overcome some unsafe javascript warnings in AUTO mode,
	        //let's check for AICC first:
	        WriteToDebug("Searching for AICC querystring parameters");
	        strTemp = GetQueryStringValue("AICC_URL", document.location.search);
	        if(strTemp!=null && strTemp!="")
	        {
				WriteToDebug("Found AICC querystring parameters, using AICC");
				objLMS = new LMSStandardAPI("AICC");
				blnLmsPresent = true;
	        }else{
				WriteToDebug("Auto-detecting standard - Searching for SCORM 2004 API");
				/*
				We wrap the API grabbers in try blocks because we don't know what kind of envrionment we were
				launched in (especially in AUTO mode). The LMS may have taken away the opener/parent window (like 
				the Saba preview mode does in AICC) or there could be pages from different domains to deal with.
				*/
				try{
					objTempAPI = SCORM2004_GrabAPI();
				}
				catch (e){
					WriteToDebug("Error grabbing 2004 API-" + e.name + ":" + e.message);
				}
				if (! (typeof(objTempAPI) == "undefined" || objTempAPI == null)){
					WriteToDebug("Found SCORM 2004 API, using SCORM 2004");
					objLMS = new LMSStandardAPI("SCORM2004");
					blnLmsPresent = true;
				}else{
					WriteToDebug("Searching for SCORM 1.2 API");
					try{
						objTempAPI = SCORM_GrabAPI();
					}
					catch (e){
						WriteToDebug("Error grabbing 1.2 API-" + e.name + ":" + e.message);
					}
				
					if (! (typeof(objTempAPI) == "undefined" || objTempAPI == null)){
						WriteToDebug("Found SCORM API, using SCORM");
						objLMS = new LMSStandardAPI("SCORM");
						blnLmsPresent = true;
					}else{
						if(ALLOW_NONE_STANDARD===true)
						{
							WriteToDebug("Could not determine standard, defaulting to Stand Alone");				
							objLMS = new LMSStandardAPI("NONE");
						}else{
							WriteToDebug("Could not determine standard, Stand Alone is disabled in configuration");
							DisplayError("Could not determine standard. Neither SCORM nor AICC APIs could be found");
							return;
						}
					}
					
				}
			}
		}else{
			WriteToDebug("Using Standard From Configuration File - " + strLMSStandard);
			objLMS = new LMSStandardAPI(strLMSStandard);
			
			blnLmsPresent = true;	//set to true here and revert back to false if Initialize fails (in InitiaizeExecuted)
		}
	}

	if (ConvertStringToBoolean(strShowInteractiveDebug) || 
			(  !(typeof(SHOW_DEBUG_ON_LAUNCH) == "undefined") && SHOW_DEBUG_ON_LAUNCH === true )
	){
		WriteToDebug("Showing Interactive Debug Windows");
		ShowDebugWindow();
	}
	
	WriteToDebug("Calling Standard Initialize");
	
	objLMS.Initialize();
	
	return;
}
	


function InitializeExecuted(blnSuccess, strErrorMessage){
	
	WriteToDebug("In InitializeExecuted, blnSuccess=" + blnSuccess + ", strErrorMessage=" + strErrorMessage);
	
	if (!blnSuccess){
		WriteToDebug("ERROR - LMS Initialize Failed");
		if (strErrorMessage == ""){
			strErrorMessage = "An Error Has Occurred";
		}
		blnLmsPresent = false;
		DisplayError(strErrorMessage);
		return;
	}

	blnLoaded = true;
	dtmStart = new Date();
		
	setTimeout(LoadContent, 0);
	
	return;
}


//private - no need to call this directly, use "Finish", "Suspend" or "Timeout"
function ExecFinish(ExitType){
	
	WriteToDebug("In ExecFinish, ExiType=" + ExitType);
	
	ClearErrorInfo();
	
	if (blnLoaded && ! blnCalledFinish ){
		
		WriteToDebug("Haven't called finish before, finishing");
		
		blnCalledFinish = true;

		if (blnReachedEnd){
			WriteToDebug("Reached End, overiding exit type to FINISH");
			ExitType = EXIT_TYPE_FINISH;
		}
		
		//MR - 5/31/05 - changed this call to happen in the SetSessionTime function so we can be sure it is always called
		//if (blnOverrodeTime){
		//	WriteToDebug("Overrode Time");
		//	objLMS.SaveTime(intTimeOverrideMS);
		//}

        //DE - 5/6/2010 - we should only accumulate and save the time
        //                on exit if it wasn't set already using SetSessionTime
        if(!blnOverrodeTime){
			WriteToDebug("Did not override time");
			dtmEnd = new Date();
			AccumulateTime();
			objLMS.SaveTime(intAccumulatedMS);
        }
		
		blnLoaded = false;
		
		WriteToDebug("Calling LMS Finish");
		return objLMS.Finish(ExitType, blnStatusWasSet);
		
	}
	
	return true;
}


//Utilities

//public
//tells child frames when the API is ready
function IsLoaded(){
	WriteToDebug("In IsLoaded, returning -" + blnLoaded);
	return blnLoaded;
}


//public
function WriteToDebug(strInfo){
	
	if (blnDebug){
	
		var dtm = new Date();
		var strLine;
		
		strLine = aryDebug.length + ":" + dtm.toString() + " - " + strInfo;
				
		aryDebug[aryDebug.length] = strLine;
		
		if (winDebug && !winDebug.closed){
			winDebug.document.body.appendChild( winDebug.document.createTextNode(strLine) );
			winDebug.document.body.appendChild( winDebug.document.createElement("br") );
		}

	}
	return;
}

//public
function ShowDebugWindow(){
	var renderLog = function () {
		var i,
			len = aryDebug.length;

		winDebug.document.body.innerHTML = "";
		for (i = 0; i < len; i += 1) {
			winDebug.document.body.appendChild( winDebug.document.createTextNode(aryDebug[i]) );
			winDebug.document.body.appendChild( winDebug.document.createElement("br") );
		}
	};

	if (winDebug && !winDebug.closed){
		winDebug.close();
	}

	winDebug = window.open("lms/blank.html", "Debug", "width=600,height=300,resizable,scrollbars");

	if (winDebug === null) {
		alert("Debug window could not be opened, popup blocker in place?");
	}
	else {
		if (winDebug.addEventListener || winDebug.attachEvent) {
			winDebug[winDebug.addEventListener ? 'addEventListener' : 'attachEvent'](
				(winDebug.attachEvent ? 'on' : '') + 'load',
				renderLog,
				false
			);
		}

		renderLog();

		winDebug.document.close();
		winDebug.focus();
	}

	return;
}

//public
function DisplayError(strMessage){
	
	var blnShowDebug;
	
	WriteToDebug("In DisplayError, strMessage=" + strMessage);
	
	blnShowDebug = confirm("An error has occured:\n\n" + strMessage + "\n\nPress 'OK' to view debug information to send to technical support.");
	
	if (blnShowDebug){
		ShowDebugWindow();
	}
	
}


//public
//combines API error information with Standard's error information
function GetLastError(){
	
	WriteToDebug("In GetLastError, intError=" + intError);
	
	if (intError != NO_ERROR){
		WriteToDebug("Returning API Error");
		return intError;
	}
	else if (IsLoaded() && objLMS.GetLastError() != NO_ERROR){
		WriteToDebug("Returning LMS Error");
		return ERROR_LMS;
	}
	
	WriteToDebug("Returning No Error");
	return NO_ERROR;
}

function GetLastLMSErrorCode(){
	
	WriteToDebug("In GetLastLMSErrorCode, intError=" + intError);
	
	var LMSError = objLMS.GetLastError();
	
	if (IsLoaded() && LMSError != NO_ERROR){
		
			
		WriteToDebug("Returning LMS Error: " + LMSError);
		return LMSError;
	}
	
	WriteToDebug("Returning No Error");
	return NO_ERROR;
}

//public
function GetLastErrorDesc(){
	WriteToDebug("In GetLastErrorDesc");
	
	if (intError != NO_ERROR){
		WriteToDebug("Returning API Error - " + strErrorDesc);
		return strErrorDesc;
	}
	else if (IsLoaded() && objLMS.GetLastError() != NO_ERROR){
		WriteToDebug("returning LMS Error");
		return objLMS.GetLastErrorDesc;
	}
	
	WriteToDebug("Returning No Error");
	return "";
}

//private
function SetErrorInfo(intErrorNumToSet, strErrorDescToSet){


	WriteToDebug("In SetErrorInfo - Num=" + intErrorNumToSet + " Desc=" + strErrorDescToSet);
	
	intError = intErrorNumToSet;
	strErrorDesc = strErrorDescToSet;
}

//private
function ClearErrorInfo(){
	WriteToDebug("In ClearErrorInfo");
	
	var intError = NO_ERROR;
	var strErrorDesc = "";
}


//public
function CommitData(){
	WriteToDebug("In CommitData");
	
	ClearErrorInfo();
	
	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}

	//MR - 5/31/05 - We want to make sure this call happens someplace other than just in the onunload event, so periodically save the data as it accumulates
	if (! blnOverrodeTime){
		WriteToDebug("Did not override time, saving incremental time");
		dtmEnd = new Date();
		AccumulateTime();
		dtmStart = new Date();
		objLMS.SaveTime(intAccumulatedMS);
	}
		
	return objLMS.CommitData();
}


//Finish functions

//public
function Suspend(){
	WriteToDebug("In Suspend");
	ClearErrorInfo();	
	
	return ExecFinish(EXIT_TYPE_SUSPEND);
}

//public
function Finish(){
	WriteToDebug("In Finish");
	ClearErrorInfo();
		
	return ExecFinish(EXIT_TYPE_FINISH);
}

//public
function TimeOut(){
	WriteToDebug("In TimeOut");
	ClearErrorInfo();
		
	return ExecFinish(EXIT_TYPE_TIMEOUT);
}

//public
function Unload(){
	WriteToDebug("In Unload");
	ClearErrorInfo();
		
	return ExecFinish(DEFAULT_EXIT_TYPE);
}

//public
function SetReachedEnd(){
	WriteToDebug("In SetReachedEnd");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	if (blnStatusWasSet == false){
		objLMS.SetCompleted();
	}
	
	blnReachedEnd = true;
	
	return true;
}

//public
function ConcedeControl()
{
	WriteToDebug("Conceding control with type: " + EXIT_BEHAVIOR);
	ClearErrorInfo();
	
	//It's ok to always call Suspend in here and not Finish. The proper way to get an exit type
	//of Finish is to call SetReachedEnd before calling ConcedeControl. This will ensure that
	//the ExecFinish function always uses the ExitTypeFinish behavior (which is to set the status to completed
	//if no status was previously set)
	
	var contentRoot = null;
	var urlBase = null;
	
	switch (EXIT_BEHAVIOR)
	{
		case "SCORM_RECOMMENDED":
			contentRoot = SearchParentsForContentRoot();
			
			if (contentRoot==window.top)
			{
				Suspend();				
				contentRoot.window.close();
			}  
			else
			{
				Suspend();
				if (contentRoot != null){
                    //DE - 10/26/2010 - Add ability to specify absolute URL for EXIT_TARGET
                    if(IsAbsoluteUrl(EXIT_TARGET)){
                        contentRoot.scormdriver_content.location.href = EXIT_TARGET;
                    } else {
				        urlBase = GetContentRootUrlBase(contentRoot);
				 	    contentRoot.scormdriver_content.location.href= urlBase + EXIT_TARGET;
				    }
                }
			}
			break;
		case "ALWAYS_CLOSE":
			Suspend();
			window.close();
			break;
		case "ALWAYS_CLOSE_TOP":
			Suspend();
			window.top.close();
			break;
		case "NOTHING":
			Suspend();
			break;
		case "REDIR_CONTENT_FRAME":
			Suspend();
			contentRoot = SearchParentsForContentRoot();
			if (contentRoot != null){
                //DE - 10/26/2010 - Add ability to specify absolute URL for EXIT_TARGET
                if(IsAbsoluteUrl(EXIT_TARGET)){
                    contentRoot.scormdriver_content.location.href = EXIT_TARGET;
                } else {
			        urlBase = GetContentRootUrlBase(contentRoot);
			      	contentRoot.scormdriver_content.location.href= urlBase + EXIT_TARGET;
			    }
            }
			break;	
	}

	return true;

}

function GetContentRootUrlBase(contentRoot){
    
    var urlParts = contentRoot.location.href.split("/");
    delete urlParts[urlParts.length - 1];
    contentRoot = urlParts.join("/");
    return contentRoot;
}

function SearchParentsForContentRoot(){

	var contentRoot = null;
	var wnd = window;
	var i=0;	//safety guard to prevent infinite loop
	
	if (wnd.scormdriver_content){
		contentRoot = wnd;
		return contentRoot;
	}
	
	while (contentRoot == null && wnd != window.top && (i++ < 100)){
		if (wnd.scormdriver_content){
			contentRoot = wnd;
			return contentRoot;
		}
		else{
			wnd = wnd.parent;
		}
	}
	WriteToDebug("Unable to locate content root");
	return null;
}


//Storing and retrieving data

//public
function GetStudentID(){
	WriteToDebug("In GetStudentID");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetStudentID();

}

//public
function GetStudentName(){
	WriteToDebug("In GetStudentName");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetStudentName();
}

//public
function GetBookmark(){
	WriteToDebug("In GetBookmark");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetBookmark();

}

//public
function SetBookmark(strBookmark){
	WriteToDebug("In SetBookmkar - strBookmark=" + strBookmark);
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.SetBookmark(strBookmark);
	
}

//public
function GetDataChunk(){
	WriteToDebug("In GetDataChunk");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetDataChunk();
}

//public
function SetDataChunk(strData){
	WriteToDebug("In SetDataChunk strData=" + strData);
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.SetDataChunk(strData);
}

//public
function GetLaunchData(){
	WriteToDebug("In GetLaunchData");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetLaunchData();
}

//public
function GetComments(){

	var strCommentString;
	var aryComments;
	var i;
	
	WriteToDebug("In GetComments");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return null;
	}
		
	strCommentString = objLMS.GetComments();
	
	WriteToDebug("strCommentString=" + strCommentString);
	
	strCommentString = new String(strCommentString);
	
	if (strCommentString != ""){
	
		aryComments = strCommentString.split(" | ");
		
		for (i=0; i < aryComments.length; i++){
			WriteToDebug("Returning Comment #" + i);
			aryComments[i] = new String(aryComments[i]);
			aryComments[i] = aryComments[i].replace(/\|\|/g, "|");
			WriteToDebug("Comment #" + i + "=" + aryComments[i]);
		}
	}
	else{
		aryComments = new Array(0);
	}
	
	return aryComments;
}

//public
function WriteComment(strComment){	

	var strExistingCommentString;
	
	WriteToDebug("In WriteComment strComment=" + strComment);
	
	ClearErrorInfo();
	
	strComment = new String(strComment);
	
	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	strComment = strComment.replace(/\|/g, "||");

	strExistingCommentString = objLMS.GetComments();
	
	if (strExistingCommentString != ""){
		strComment = " | " + strComment;
	}
	
	strComment = strComment;
	
	return objLMS.WriteComment(strComment);
}


//public
function GetLMSComments(){
	WriteToDebug("In GetLMSComments");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetLMSComments();
}


//Preferences

//public
function GetAudioPlayPreference(){
	WriteToDebug("In GetAudioPlayPreference");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return PREFERENCE_DEFAULT;
	}
		
	return objLMS.GetAudioPlayPreference();	
}

//public
//returns int 1-100
function GetAudioVolumePreference(){
	WriteToDebug("GetAudioVolumePreference");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 100;
	}
		
	return objLMS.GetAudioVolumePreference();
}

//public
//percent is int 1-100
//PlayPreference is On/Off
function SetAudioPreference(PlayPreference, intPercentOfMaxVolume){
	
	WriteToDebug("In SetAudioPreference PlayPreference=" + PlayPreference + " intPercentOfMaxVolume=" + intPercentOfMaxVolume);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	if (PlayPreference != PREFERENCE_OFF &&
		PlayPreference != PREFERENCE_ON){
		
		WriteToDebug("Error Invalid PlayPreference");
		
		SetErrorInfo(ERROR_INVALID_PREFERENCE, "Invalid PlayPreference passed to SetAudioPreference, PlayPreference=" + PlayPreference);
		
		return false;	
	}
	
	if ( ! ValidInteger(intPercentOfMaxVolume) ){
		WriteToDebug("Error Invalid PercentOfMaxVolume - not an integer");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid PercentOfMaxVolume passed to SetAudioPreference (not an integer), intPercentOfMaxVolume=" + intPercentOfMaxVolume);
		return false;
	}
	
	intPercentOfMaxVolume = parseInt(intPercentOfMaxVolume, 10);
	
	if (intPercentOfMaxVolume < 1 || intPercentOfMaxVolume > 100){
		WriteToDebug("Error Invalid PercentOfMaxVolume - out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid PercentOfMaxVolume passed to SetAudioPreference (must be between 1 and 100), intPercentOfMaxVolume=" + intPercentOfMaxVolume);
		return false;
	}
	
	WriteToDebug("Calling to LMS");
	return objLMS.SetAudioPreference(PlayPreference, intPercentOfMaxVolume);

}

//public
function GetLanguagePreference(){
	WriteToDebug("In GetLanguagePreference");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return "";
	}
		
	return objLMS.GetLanguagePreference();
}

//public
function SetLanguagePreference(strLanguage){
	WriteToDebug("In SetLanguagePreference strLanguage=" + strLanguage);
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.SetLanguagePreference(strLanguage);

}

//public
function GetSpeedPreference(){
	WriteToDebug("In GetSpeedPreference");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 100;
	}
		
	return objLMS.GetSpeedPreference();
}


//public
function SetSpeedPreference(intPercentOfMax){
	WriteToDebug("In SetSpeedPreference intPercentOfMax=" + intPercentOfMax);
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	if ( ! ValidInteger(intPercentOfMax) ){
		WriteToDebug("ERROR Invalid Percent of MaxSpeed, not an integer");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid PercentOfMaxSpeed passed to SetSpeedPreference (not an integer), intPercentOfMax=" + intPercentOfMax);
		return false;
	}
	
	intPercentOfMax = parseInt(intPercentOfMax, 10);
	
	if (intPercentOfMax < 0 || intPercentOfMax > 100){
		WriteToDebug("ERROR Invalid Percent of MaxSpeed, out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid PercentOfMaxSpeed passed to SetSpeedPreference (must be between 1 and 100), intPercentOfMax=" + intPercentOfMax);
		return false;
	}
	
	WriteToDebug("Calling to LMS");
	return objLMS.SetSpeedPreference(intPercentOfMax);

}

//public
function GetTextPreference(){
	WriteToDebug("In GetTextPreference");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.GetTextPreference();
}

//public
function SetTextPreference(intPreference){
	WriteToDebug("In SetTextPreference intPreference=" + intPreference);
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	if (intPreference != PREFERENCE_DEFAULT &&
		intPreference != PREFERENCE_OFF &&
		intPreference != PREFERENCE_ON){
		WriteToDebug("Error - Invalid Preference");
		SetErrorInfo(ERROR_INVALID_PREFERENCE, "Invalid Preference passed to SetTextPreference, intPreference=" + intPreference);
		
		return false;	
	}	
	
	return objLMS.SetTextPreference(intPreference);

}




//Timing

//public
function GetPreviouslyAccumulatedTime(){
	WriteToDebug("In GetPreviouslyAccumulatedTime");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 0;
	}
		
	return objLMS.GetPreviouslyAccumulatedTime();
}



//private
function AccumulateTime(){
	WriteToDebug("In AccumulateTime dtmStart=" + dtmStart + " dtmEnd=" + dtmEnd + " intAccumulatedMS=" + intAccumulatedMS);
	if (dtmEnd != null && dtmStart != null){
		WriteToDebug("Accumulating Time");
		intAccumulatedMS += (dtmEnd.getTime() - dtmStart.getTime());
		WriteToDebug("intAccumulatedMS=" + intAccumulatedMS);
	}
	
}



//public
function GetSessionAccumulatedTime(){
	
	WriteToDebug("In GetSessionAccumulatedTime");
	
	ClearErrorInfo();
	
	WriteToDebug("Setting dtmEnd to now");
	
	dtmEnd = new Date();
	
	WriteToDebug("Accumulating Time");
	
	AccumulateTime();
	
	if (dtmStart != null){
		WriteToDebug("Resetting dtmStart");
		dtmStart = new Date();
	}
	
	WriteToDebug("Setting dtmEnd to null");
	dtmEnd = null;
	
	WriteToDebug("Returning " + intAccumulatedMS);
	
	return intAccumulatedMS;
}


//public
function SetSessionTime(intMilliseconds){
	
	WriteToDebug("In SetSessionTime");
	
	ClearErrorInfo();
	
	if ( ! ValidInteger(intMilliseconds)){
		WriteToDebug("ERROR parameter is not an integer");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid intMilliseconds passed to SetSessionTime (not an integer), intMilliseconds=" + intMilliseconds);
		return false;
	}
	
	intMilliseconds = parseInt(intMilliseconds, 10);
	
	if (intMilliseconds < 0){
		WriteToDebug("Error, parameter is less than 0");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid intMilliseconds passed to SetSessionTime (must be greater than 0), intMilliseconds=" + intMilliseconds);
		return false;
	}
	
	blnOverrodeTime = true;
	intTimeOverrideMS = intMilliseconds;
	
	//MR - 5/31/05 - added this immediate call because in AICC the onunload call isn't always reliable
	objLMS.SaveTime(intTimeOverrideMS);
	
	return true;
}

//public
function PauseTimeTracking(){
	
	WriteToDebug("In PauseTimeTracking");
	
	ClearErrorInfo();
	
	WriteToDebug("Setting dtmEnd to now");
	dtmEnd = new Date();
	
	WriteToDebug("Accumulating Time");
	AccumulateTime();
	
	WriteToDebug("Setting Start and End times to null");
	dtmStart = null;
	dtmEnd = null;
	
	return true;
}

//public
//note in docs - can be used to start tracking at a point other than beginning
function ResumeTimeTracking(){
	
	WriteToDebug("In ResumeTimeTracking");
	
	ClearErrorInfo();
	
	WriteToDebug("Setting dtmStart to now");
	
	dtmStart = new Date();
	
	return true;
	
}


//public
function GetMaxTimeAllowed(){
	
	WriteToDebug("In GetMaxTimeAllowed");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return MAX_CMI_TIME;
	}
		
	return objLMS.GetMaxTimeAllowed();

}


//public
function DisplayMessageOnTimeout(){
	
	WriteToDebug("In DisplayMessageOnTimeOut");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.DisplayMessageOnTimeout();

}

//public
function ExitOnTimeout(){
	
	WriteToDebug("In ExitOnTimeOut");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	return objLMS.ExitOnTimeout();

}


//Testing

//public
function GetPassingScore(){
	WriteToDebug("In GetPassingScore");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 0;
	}
		
	return objLMS.GetPassingScore();
	
}

//public
function GetScore(){

	WriteToDebug("In GetScore");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 0;
	}
		
	return objLMS.GetScore();

}

//public
function GetScaledScore(){

	WriteToDebug("In GetScaledScore");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return 0;
	}
		
	return objLMS.GetScaledScore();

}

//public
function SetScore(intScore, intMaxScore, intMinScore){
	
	WriteToDebug("In SetScore, intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	if (! IsValidDecimal(intScore)){
		WriteToDebug("ERROR - intScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetScore (not a valid decimal), intScore=" + intScore);
		return false;
	}

	if (! IsValidDecimal(intMaxScore)){
		WriteToDebug("ERROR - intMaxScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetScore (not a valid decimal), intMaxScore=" + intMaxScore);
		return false;
	}
	
	if (! IsValidDecimal(intMinScore)){
		WriteToDebug("ERROR - intMinScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetScore (not a valid decimal), intMinScore=" + intMinScore);
		return false;
	}
	
	WriteToDebug("Converting SCORES to floats");
	intScore = parseFloat(intScore);
	intMaxScore = parseFloat(intMaxScore);
	intMinScore = parseFloat(intMinScore);

	if (intScore < 0 || intScore > 100){
		WriteToDebug("ERROR - intScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetScore (must be between 0-100), intScore=" + intScore);
		return false;
	}

	if (intMaxScore < 0 || intMaxScore > 100){
		WriteToDebug("ERROR - intMaxScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetScore (must be between 0-100), intMaxScore=" + intMaxScore);
		return false;
	}

	if (intMinScore < 0 || intMinScore > 100){
		WriteToDebug("ERROR - intMinScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetScore (must be between 0-100), intMinScore=" + intMinScore);
		return false;
	}	
	
	if (SCORE_CAN_ONLY_IMPROVE === true){
		
		var previousScore = GetScore();
		
		if (previousScore != null && previousScore != "" && previousScore > intScore){
			WriteToDebug("Previous score was greater than new score, configuration only allows scores to improve, returning.");
			return true;
		}
	}
	
	WriteToDebug("Calling to LMS");
	return objLMS.SetScore(intScore, intMaxScore, intMinScore);	

}

//public
function SetPointBasedScore(intScore, intMaxScore, intMinScore){
	
	WriteToDebug("In SetPointBasedScore, intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	if (! IsValidDecimal(intScore)){
		WriteToDebug("ERROR - intScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetScore (not a valid decimal), intScore=" + intScore);
		return false;
	}

	if (! IsValidDecimal(intMaxScore)){
		WriteToDebug("ERROR - intMaxScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetScore (not a valid decimal), intMaxScore=" + intMaxScore);
		return false;
	}
	
	if (! IsValidDecimal(intMinScore)){
		WriteToDebug("ERROR - intMinScore not a valid decimal");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetScore (not a valid decimal), intMinScore=" + intMinScore);
		return false;
	}
	
	WriteToDebug("Converting SCORES to floats");
	intScore = parseFloat(intScore);
	intMaxScore = parseFloat(intMaxScore);
	intMinScore = parseFloat(intMinScore);

	if (intScore < 0 || intScore > 100){
		WriteToDebug("ERROR - intScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetScore (must be between 0-100), intScore=" + intScore);
		return false;
	}

	if (intMaxScore < 0 || intMaxScore > 100){
		WriteToDebug("ERROR - intMaxScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetScore (must be between 0-100), intMaxScore=" + intMaxScore);
		return false;
	}

	if (intMinScore < 0 || intMinScore > 100){
		WriteToDebug("ERROR - intMinScore out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetScore (must be between 0-100), intMinScore=" + intMinScore);
		return false;
	}	
	
	if (SCORE_CAN_ONLY_IMPROVE === true){
		
		var previousScore = GetScore();
		
		if (previousScore != null && previousScore != "" && previousScore > intScore){
			WriteToDebug("Previous score was greater than new score, configuration only allows scores to improve, returning.");
			return true;
		}
	}
	
	WriteToDebug("Calling to LMS");
	return objLMS.SetPointBasedScore(intScore, intMaxScore, intMinScore);	

}


//class to hold a short and long version of an identifier for an interaction response
function CreateResponseIdentifier(strShort, strLong){
	
	//validate that the short id is a single alphanumeric character

	if (strShort.replace(" ", "") == ""){
		WriteToDebug("Short Identifier is empty");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
		return false;
	}
	
	if (strShort.length != 1){
		WriteToDebug("ERROR - Short Identifier  not 1 character");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
		return false;
	}

	if ( ! IsAlphaNumeric(strShort) ){
		WriteToDebug("ERROR - Short Identifier  not alpha numeric");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid short identifier, strShort=" + strShort);
		return false;
	}
	
	//convert the short identifier to lower case because it is unclear in the SCORM 1.2 spec whether or not
	//the response is allowed to be upper case and some LMS's may only allow lower case
	strShort = strShort.toLowerCase();
	
	strLong = CreateValidIdentifier(strLong);
	

	return new ResponseIdentifier(strShort, strLong);
}




function ResponseIdentifier(strShort, strLong){
	this.Short = new String(strShort);
	this.Long = new String(strLong);
	
	this.toString = function (){
		return "[Response Identifier " + this.Short + ", " + this.Long + "]";
	};
}

//Represents a response to a matching interaction
//Contains two values, a source and a target, each of which can be a string or a ResponseIdentifier
function MatchingResponse(source, target){
	
	if (source.constructor == String){
		source = CreateResponseIdentifier(source, source);
	}

	if (target.constructor == String){
		target = CreateResponseIdentifier(target, target);
	}
	
	this.Source = source;
	this.Target = target;
	
	this.toString = function (){
		return "[Matching Response " + this.Source + ", " + this.Target + "]";
	};
}

function CreateMatchingResponse(pattern)
{
	var aryPairs = new Array();
	var aryEachPair = new Array();
	pattern = new String(pattern);
	
	
	aryPairs = pattern.split("[,]");
	
	for(var i=0; i<aryPairs.length; i++)
	{
		var thisPair = new String(aryPairs[i]);
		aryEachPair = thisPair.split("[.]");
		WriteToDebug("Matching Response [" + i + "]  source: " + aryEachPair[0] + "  target: " + aryEachPair[1]);
		aryPairs[i] = new MatchingResponse(aryEachPair[0], aryEachPair[1]);
	}
	
	WriteToDebug("pattern: " + pattern + " becomes " + aryPairs[0]);
	
	if (aryPairs.length==0) return aryPairs[0];
	else return aryPairs;
}

//make sure all the criteria are met to allow this value to be an identifier
function CreateValidIdentifier(str){
	str = new String(str);
	str = Trim(str);

	//if the string starts with "urn:" then it has special requirements
	if (str.toLowerCase().indexOf("urn:") == 0){
		str = str.substr(4);
	}	
		
	//urns may only contain the following characters: letters, numbers - ( ) + . : = @ ; $ _ ! * ' %
	//if anything else is found, replace it with _
	str = str.replace(/[^\w\-\(\)\+\.\:\=\@\;\$\_\!\*\'\%]/g, "_");

	return str;
}

function Trim(str){
	str = str.replace(/^\s*/, "");
	str = str.replace(/\s*$/, "");
	return str;
}



function RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){
	
	WriteToDebug("In RecordTrueFalseInteraction strID=" + strID + ", blnResponse=" + blnResponse + 
					", blnCorrect=" + blnCorrect + ", blnCorrectResponse=" + blnCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	
	if ( !(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	//blnResponse and blnCorrectResponse must be valid boolean values
	if (blnResponse != true && blnResponse != false){
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The Response parameter must be a valid boolean value.");
		return false;	
	}
	if (blnCorrectResponse != null && blnCorrectResponse != true && blnCorrectResponse != false){
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The Correct Response parameter must be a valid boolean value or null.");
		return false;	
	}	
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordTrueFalseInteraction(strID, blnResponse, blnCorrect, blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);	
}

//public
//strResponse and strCorrectResponse can be either:
//	-a single character alphanumeric string representing the response
//	-a single ResponseIdentifier object
//	-an array of ResponseIdentifier objects representing multiple selections that must be/were made

function RecordMultipleChoiceInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){
	
	WriteToDebug("In RecordMultipleChoiceInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	strID = new String(strID);
	
	var aryResponse;
	var aryCorrectResponse;
	
	//translate the 3 possible argument types into to an array of ResponseIdentifier objects to be passed to the standard functions
	if (response.constructor == String){
		
		aryResponse = new Array();
		var responseIdentifier = CreateResponseIdentifier(response, response);
		
		if (responseIdentifier == false){
			SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
			return false;	
		}
		
		aryResponse[0] = responseIdentifier;
	}
	else if (response.constructor == ResponseIdentifier){
		aryResponse = new Array();
		aryResponse[0] = response;
	}
	else if (response.constructor == Array || response.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
		aryResponse = response;
	}
	else if(window.console && response.constructor.toString() == '(Internal Function)' && response.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
		aryResponse = response;
	}
	else{
		if(window.console){
			window.console.log("ERROR_INVALID_INTERACTION_RESPONSE :: The response is not in the correct format.");
		}
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
		return false;	
	}
	
	
	if (correctResponse != null && correctResponse != undefined && correctResponse != ""){
		if (correctResponse.constructor == String){
		
			aryCorrectResponse = new Array();
			responseIdentifier = CreateResponseIdentifier(correctResponse, correctResponse);
			
			if (responseIdentifier == false){
				SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The correct response is not in the correct format");
				return false;	
			}
			
			aryCorrectResponse[0] = responseIdentifier;
		
		}
		else if (correctResponse.constructor == ResponseIdentifier){
			aryCorrectResponse = new Array();
			aryCorrectResponse[0] = correctResponse;	
		}
		else if (correctResponse.constructor == Array || correctResponse.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
			aryCorrectResponse = correctResponse;
		}
		else if(window.console && correctResponse.constructor.toString() == '(Internal Function)' && correctResponse.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
			aryCorrectResponse = correctResponse;
		}	
		else{
			SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The correct response is not in the correct format");
			return false;	
		}	
	}
	else{
		aryCorrectResponse = new Array();
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordMultipleChoiceInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);	
	

}


function RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){

	WriteToDebug("In RecordFillInInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);

	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordFillInInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
	
}


//public
//strResponse and strCorrectResponse can be either:
//	-a single MatchingResponse object
//	-an array of MatchingResponse objects representing multiple selections that must be/were made

function RecordMatchingInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){

	WriteToDebug("In RecordMatchingInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	var aryResponse;
	var aryCorrectResponse;
	
	if (response.constructor == MatchingResponse){
		aryResponse = new Array();
		aryResponse[0] = response;
	}
	else if (response.constructor == Array || response.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
		aryResponse = response;
	}
	else if(window.console && response.constructor.toString() == '(Internal Function)' && response.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
		aryResponse = response;
	}
	else{
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
		return false;	
	}

	if (correctResponse != null && correctResponse != undefined){
		if (correctResponse.constructor == MatchingResponse){
			aryCorrectResponse = new Array();
			aryCorrectResponse[0] = correctResponse;
		}
		else if (correctResponse.constructor == Array || correctResponse.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
			aryCorrectResponse = correctResponse;
		}
		else if(window.console && correctResponse.constructor.toString() == '(Internal Function)' && correctResponse.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
			aryCorrectResponse = correctResponse;
		}
		else{
			SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
			return false;	
		}
	}
	else{
		aryCorrectResponse = new Array();
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordMatchingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
	
}

function RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){

	WriteToDebug("In RecordPerformanceInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordPerformanceInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
}

//public
//response and correctResponse can be either:
//	-a string representing the response
//	-a single ResponseIdentifier object
//	-an array of ResponseIdentifier objects representing multiple steps that must be/were made

function RecordSequencingInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){

	WriteToDebug("In RecordSequencingInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}


	var aryResponse;
	var aryCorrectResponse;
	
	//translate the 3 possible argument types into to an array of ResponseIdentifier objects to be passed to the standard functions
	if (response.constructor == String){
		
		aryResponse = new Array();
		var responseIdentifier = CreateResponseIdentifier(response, response);
		
		if (responseIdentifier == false){
			SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
			return false;	
		}
		
		aryResponse[0] = responseIdentifier;
	}
	else if (response.constructor == ResponseIdentifier){
		aryResponse = new Array();
		aryResponse[0] = response;
	}
	else if (response.constructor == Array || response.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
		aryResponse = response;
	}
	else if(window.console && response.constructor.toString() == '(Internal Function)' && response.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
		aryResponse = response;
	}
	else{
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
		return false;	
	}
	
	
	if (correctResponse != null && correctResponse != undefined && correctResponse != ""){
		if (correctResponse.constructor == String){
		
			aryCorrectResponse = new Array();
			responseIdentifier = CreateResponseIdentifier(correctResponse, correctResponse);
			
			if (responseIdentifier == false){
				SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The correct response is not in the correct format");
				return false;	
			}
			
			aryCorrectResponse[0] = responseIdentifier;
		
		}
		else if (correctResponse.constructor == ResponseIdentifier){
			aryCorrectResponse = new Array();
			aryCorrectResponse[0] = correctResponse;	
		}
		else if (correctResponse.constructor == Array || correctResponse.constructor.toString().search("Array") > 0){		//sometimes the array constructor isn't handled correctly so we check its string
			aryCorrectResponse = correctResponse;
		}	
		else if(window.console && correctResponse.constructor.toString() == '(Internal Function)' && correctResponse.length > 0){
		// we're in Safari. Safari doesn't return the Array function as a string like IE and FireFox. It does however return the ResponseIdentifier function as a string
			aryCorrectResponse = correctResponse;
		}
		else{
			SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The correct response is not in the correct format");
			return false;	
		}	
	}
	else{
		aryCorrectResponse = new Array();
	}

	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordSequencingInteraction(strID, aryResponse, blnCorrect, aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
	
}

//public
//response and correctResponse can be either:
//	-a string representing the response
//	-a single ResponseIdentifier object

function RecordLikertInteraction(strID, response, blnCorrect, correctResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){
	
	WriteToDebug("In RecordLikertInteraction strID=" + strID + ", response=" + response + 
					", blnCorrect=" + blnCorrect + ", correctResponse=" + correctResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	var riResponse;
	var riCorrectResponse;
	
	//translate the 3 possible argument types into to an array of ResponseIdentifier objects to be passed to the standard functions
	if (response.constructor == String){
		riResponse = CreateResponseIdentifier(response, response);
	}
	else if (response.constructor == ResponseIdentifier){
		riResponse = response;
	}
	else{
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
		return false;	
	}


	if (correctResponse == null || correctResponse == undefined){
		riCorrectResponse = null;
	}
	else if (correctResponse.constructor == ResponseIdentifier){
		riCorrectResponse = correctResponse;
	}
	else if (correctResponse.constructor == String){
		riCorrectResponse = CreateResponseIdentifier(correctResponse, correctResponse);
	}
	else{
		SetErrorInfo(ERROR_INVALID_INTERACTION_RESPONSE, "The response is not in the correct format");
		return false;	
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordLikertInteraction(strID, riResponse, blnCorrect, riCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
	
}

function RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID){
	WriteToDebug("In RecordNumericInteraction strID=" + strID + ", strResponse=" + strResponse + 
					", blnCorrect=" + blnCorrect + ", strCorrectResponse=" + strCorrectResponse + 
					", strDescription=" + strDescription + ", intWeighting=" + intWeighting + ", intLatency=" + intLatency + ", strLearningObjectiveID=" + strLearningObjectiveID);
	
	if (!(typeof(DO_NOT_REPORT_INTERACTIONS) == "undefined") && DO_NOT_REPORT_INTERACTIONS === true){
		WriteToDebug("Configuration specifies interactions should not be reported, exiting.");
		return true;
	}
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}

	if (! IsValidDecimal(strResponse)){
		WriteToDebug("ERROR - Invalid Response, not a valid decmial");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Response passed to RecordNumericInteraction (not a valid decimal), strResponse=" + strResponse);
		return false;
	}

	if (strCorrectResponse != undefined && strCorrectResponse != null && IsValidDecimal(strCorrectResponse) == false){
		WriteToDebug("ERROR - Invalid Correct Response, not a valid decmial");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Correct Response passed to RecordNumericInteraction (not a valid decimal), strCorrectResponse=" + strCorrectResponse);
		return false;
	}
	
	var dtmTime = new Date();
	
	WriteToDebug("Calling to LMS");
	return objLMS.RecordNumericInteraction(strID, strResponse, blnCorrect, strCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
}


//State Functions

//public
function GetStatus(){

	WriteToDebug("In GetStatus");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return LESSON_STATUS_INCOMPLETE;
	}
		
	return objLMS.GetStatus();

}

//public
function ResetStatus(){	
	WriteToDebug("In ResetStatus");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		
	WriteToDebug("Setting blnStatusWasSet to false");
	
	blnStatusWasSet = false;	
	
	return objLMS.ResetStatus();	
}

//public
function GetProgressMeasure(){
	WriteToDebug("In GetProgressMeasure");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return LESSON_STATUS_INCOMPLETE;
	}
		
	return objLMS.GetProgressMeasure();
}
//public
function SetProgressMeasure(numMeasure){
	WriteToDebug("In SetProgressMeasure, passing in: "+ numMeasure);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return LESSON_STATUS_INCOMPLETE;
	}
		
	return objLMS.SetProgressMeasure(numMeasure);
}

//public
//optional to call
function SetPassed(){
	WriteToDebug("In SetPassed");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	WriteToDebug("Setting blnStatusWasSet to true");
	
	blnStatusWasSet = true;	
	
	return objLMS.SetPassed();
	
}

//public
function SetFailed(){
	WriteToDebug("In SetFailed");
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	WriteToDebug("Setting blnStatusWasSet to true");
	
	blnStatusWasSet = true;
	
	return objLMS.SetFailed();
	
}


//public
function GetEntryMode(){
	WriteToDebug("In GetEntryMode");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return ENTRY_FIRST_TIME;
	}
			
	return objLMS.GetEntryMode();

}

//public
function GetLessonMode(){
	WriteToDebug("In GetLessonMode");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return MODE_NORMAL;
	}
			
	return objLMS.GetLessonMode();
	
}

//public
function GetTakingForCredit(){
	WriteToDebug("In GetTakingForCredit");
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetTakingForCredit();
	
}


//Objectives	

//public
function SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore){
	
	WriteToDebug("In SetObjectiveScore, intObjectiveID=" + strObjectiveID + ", intScore=" + intScore + ", intMaxScore=" + intMaxScore + ", intMinScore=" + intMinScore);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	strObjectiveID = new String(strObjectiveID);
	if (strObjectiveID.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid ObjectiveID, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid ObjectiveID passed to SetObjectiveScore (must have a value), strObjectiveID=" + strObjectiveID);
		return false;
	}

	if (! IsValidDecimal(intScore)){
		WriteToDebug("ERROR - Invalid Score, not a valid decmial");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetObjectiveScore (not a valid decimal), intScore=" + intScore);
		return false;
	}

	if (! IsValidDecimal(intMaxScore)){
		WriteToDebug("ERROR - Invalid Max Score, not a valid decmial");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetObjectiveScore (not a valid decimal), intMaxScore=" + intMaxScore);
		return false;
	}
	
	if (! IsValidDecimal(intMinScore)){
		WriteToDebug("ERROR - Invalid Min Score, not a valid decmial");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetObjectiveScore (not a valid decimal), intMinScore=" + intMinScore);
		return false;
	}
	
	WriteToDebug("Converting Scores to floats");
	intScore = parseFloat(intScore);
	intMaxScore = parseFloat(intMaxScore);
	intMinScore = parseFloat(intMinScore);
	
	if (intScore < 0 || intScore > 100){
		WriteToDebug("ERROR - Invalid Score, out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Score passed to SetObjectiveScore (must be between 0-100), intScore=" + intScore);
		return false;
	}

	if (intMaxScore < 0 || intMaxScore > 100){
		WriteToDebug("ERROR - Invalid Max Score, out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Score passed to SetObjectiveScore (must be between 0-100), intMaxScore=" + intMaxScore);
		return false;
	}

	if (intMinScore < 0 || intMinScore > 100){
		WriteToDebug("ERROR - Invalid Min Score, out of range");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Score passed to SetObjectiveScore (must be between 0-100), intMinScore=" + intMinScore);
		return false;
	}	

	WriteToDebug("Calling To LMS");
	return objLMS.SetObjectiveScore(strObjectiveID, intScore, intMaxScore, intMinScore);

}

//public
function SetObjectiveStatus(strObjectiveID, Lesson_Status){	
	
	WriteToDebug("In SetObjectiveStatus strObjectiveID=" + strObjectiveID + ", Lesson_Status=" + Lesson_Status);
	
	ClearErrorInfo();


	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		

	strObjectiveID = new String(strObjectiveID);
	if (strObjectiveID.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid ObjectiveID, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid ObjectiveID passed to SetObjectiveStatus (must have a value), strObjectiveID=" + strObjectiveID);
		return false;
	}
	
	if (
	   (Lesson_Status != LESSON_STATUS_PASSED) &&
	   (Lesson_Status != LESSON_STATUS_COMPLETED) &&
	   (Lesson_Status != LESSON_STATUS_FAILED) &&
	   (Lesson_Status != LESSON_STATUS_INCOMPLETE) &&
	   (Lesson_Status != LESSON_STATUS_BROWSED) &&
	   (Lesson_Status != LESSON_STATUS_NOT_ATTEMPTED)
	   ){
		WriteToDebug("ERROR - Invalid Status");
		SetErrorInfo(ERROR_INVALID_STATUS, "Invalid status passed to SetObjectiveStatus, Lesson_Status=" + Lesson_Status);
		return false;

	}	
	
	WriteToDebug("Calling To LMS");
	return objLMS.SetObjectiveStatus(strObjectiveID, Lesson_Status);

	
}


//public
function GetObjectiveStatus(strObjectiveID){

	WriteToDebug("In GetObjectiveStatus, strObjectiveID=" + strObjectiveID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetObjectiveStatus(strObjectiveID);
}




//public
function SetObjectiveDescription(strObjectiveID, strObjectiveDescription){	
	
	WriteToDebug("In SetObjectiveDescription strObjectiveID=" + strObjectiveID + ", strObjectiveDescription=" + strObjectiveDescription);
	
	ClearErrorInfo();


	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		

	strObjectiveID = new String(strObjectiveID);
	if (strObjectiveID.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid ObjectiveID, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid ObjectiveID passed to SetObjectiveStatus (must have a value), strObjectiveID=" + strObjectiveID);
		return false;
	}
	

    //include validation for string length?
	
	WriteToDebug("Calling To LMS");
	return objLMS.SetObjectiveDescription(strObjectiveID, strObjectiveDescription);

	
}


//public
function GetObjectiveDescription(strObjectiveID){

	WriteToDebug("In GetObjectiveDescription, strObjectiveID=" + strObjectiveID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetObjectiveDescription(strObjectiveID);
}





//public
function GetObjectiveScore(strObjectiveID){

	WriteToDebug("In GetObjectiveScore, strObjectiveID=" + strObjectiveID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetObjectiveScore(strObjectiveID);
}


//public
function IsLmsPresent(){
	return blnLmsPresent;
}

//public
function SetObjectiveProgressMeasure(strObjectiveID, strObjectiveProgressMeasure){	
	
	WriteToDebug("In SetObjectiveProgressMeasure strObjectiveID=" + strObjectiveID + ", strObjectiveProgressMeasure=" + strObjectiveProgressMeasure);
	
	ClearErrorInfo();


	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
		

	strObjectiveID = new String(strObjectiveID);
	if (strObjectiveID.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid ObjectiveID, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid ObjectiveID passed to SetObjectiveProgressMeasure (must have a value), strObjectiveID=" + strObjectiveID);
		return false;
	}
	

    //include validation for string length?
	
	WriteToDebug("Calling To LMS");
	return objLMS.SetObjectiveProgressMeasure(strObjectiveID, strObjectiveProgressMeasure);

	
}


//public
function GetObjectiveProgressMeasure(strObjectiveID){

	WriteToDebug("In GetObjectiveProgressMeasure, strObjectiveID=" + strObjectiveID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetObjectiveProgressMeasure(strObjectiveID);
}



//NOTE ON INTERACTION RETRIEVAL
//A.  It is only available in certain standards, standards where it is unavailable will return nothing
//B.  The interaction records are currently reported using "journaling", whereby each entry is appended
//		Retrieval methods will retrieve only the most recent value
//public
function GetInteractionType(strInteractionID)
{
	WriteToDebug("In GetInteractionType, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionType(strInteractionID);
}

//public
function GetInteractionTimestamp(strInteractionID)
{
	WriteToDebug("In GetInteractionTimestamp, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionTimestamp(strInteractionID);
}



//public
function GetInteractionCorrectResponses(strInteractionID)
{
	WriteToDebug("In GetInteractionCorrectResponses, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionCorrectResponses(strInteractionID);
}



//public
function GetInteractionWeighting(strInteractionID)
{
	WriteToDebug("In GetInteractionWeighting, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionWeighting(strInteractionID);
}



//public
function GetInteractionLearnerResponses(strInteractionID)
{
	WriteToDebug("In GetInteractionLearnerResponses, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionLearnerResponses(strInteractionID);
}



//public
function GetInteractionResult(strInteractionID)
{
	WriteToDebug("In GetInteractionResult, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionResult(strInteractionID);
}



//public
function GetInteractionLatency(strInteractionID)
{
	WriteToDebug("In GetInteractionLatency, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionLatency(strInteractionID);
}



//public
function GetInteractionDescription(strInteractionID)
{
	WriteToDebug("In GetInteractionDescription, strInteractionID=" + strInteractionID);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
			
	return objLMS.GetInteractionDescription(strInteractionID);
}


//public
/*
Bucket sizes are listed in characters. In SCORM, all transmitted data is represented as JavaScript strings.
JavaScript strings use two bytes for each character so the actual size (in bytes) of what is allocated will be  
double the value that is passed to this function.
*/
function CreateDataBucket(strBucketId, intMinSize, intMaxSize){
    
    WriteToDebug("In CreateDataBucket, strBucketId=" + strBucketId + ", intMinSize=" + intMinSize + ", intMaxSize=" + intMaxSize);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	strBucketId = new String(strBucketId);
	if (strBucketId.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid BucketId, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid strBucketId passed to CreateDataBucket (must have a value), strBucketId=" + strBucketId);
		return false;
	}
	
	if ( ! ValidInteger(intMinSize) ){
		WriteToDebug("ERROR Invalid Min Size, not an integer");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid intMinSize passed to CreateDataBucket (not an integer), intMinSize=" + intMinSize);
		return false;
	}
	
	if ( ! ValidInteger(intMaxSize) ){
		WriteToDebug("ERROR Invalid Max Size, not an integer");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid intMaxSize passed to CreateDataBucket (not an integer), intMaxSize=" + intMaxSize);
		return false;
	}
	
	intMinSize = parseInt(intMinSize, 10);
	intMaxSize = parseInt(intMaxSize, 10);
	
	if (intMinSize < 0){
		WriteToDebug("ERROR Invalid Min Size, must be greater than or equal to 0");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Min Size passed to CreateDataBucket (must be greater than or equal to 0), intMinSize=" + intMinSize);
		return false;
	}
	
	if (intMaxSize <= 0){
		WriteToDebug("ERROR Invalid Max Size, must be greater than 0");
		SetErrorInfo(ERROR_INVALID_NUMBER, "Invalid Max Size passed to CreateDataBucket (must be greater than 0), intMaxSize=" + intMaxSize);
		return false;
	}
	
	//need to double the values to get from "characters" (the representation exposed by this API) to "octets" the value used by SSP
	intMinSize = (intMinSize * 2);
	intMaxSize = (intMaxSize * 2);
	
	return objLMS.CreateDataBucket(strBucketId, intMinSize, intMaxSize);
}

//public
function GetDataFromBucket(strBucketId){

    WriteToDebug("In GetDataFromBucket, strBucketId=" + strBucketId);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	strBucketId = new String(strBucketId);
	if (strBucketId.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid BucketId, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid strBucketId passed to GetDataFromBucket (must have a value), strBucketId=" + strBucketId);
		return false;
	}
				
	return objLMS.GetDataFromBucket(strBucketId);
}

//public
function PutDataInBucket(strBucketId, strData, blnAppendToEnd){

    WriteToDebug("In PutDataInBucket, strBucketId=" + strBucketId + ", blnAppendToEnd=" + blnAppendToEnd + ", strData=" + strData);
	
	ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	strBucketId = new String(strBucketId);
	if (strBucketId.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid BucketId, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid strBucketId passed to PutDataInBucket (must have a value), strBucketId=" + strBucketId);
		return false;
	}
	
	if (blnAppendToEnd != true){
	    WriteToDebug("blnAppendToEnd was not explicitly true so setting it to false, blnAppendToEnd=" + blnAppendToEnd);
	    blnAppendToEnd = false;
	}
	
	return objLMS.PutDataInBucket(strBucketId, strData, blnAppendToEnd);
}

//public
function DetectSSPSupport(){
    return objLMS.DetectSSPSupport();
}

//public returns a SSPBucketSize object containing information about the allocated size of the specified bucket
function GetBucketInfo(strBucketId){
    
    WriteToDebug("In GetBucketInfo, strBucketId=" + strBucketId );
     
    ClearErrorInfo();

	if (! IsLoaded()){
		SetErrorInfo(ERROR_NOT_LOADED, "Cannot make calls to the LMS before calling Start");
		return false;
	}
	
	strBucketId = new String(strBucketId);
	if (strBucketId.replace(" ", "") == ""){
		WriteToDebug("ERROR - Invalid BucketId, empty string");
		SetErrorInfo(ERROR_INVALID_ID, "Invalid strBucketId passed to GetBucketInfo (must have a value), strBucketId=" + strBucketId);
		return false;
	}
	
	var bucketInfo = objLMS.GetBucketInfo(strBucketId);
	
	//bucket size needs to be halfed to translate from octets to characters
	bucketInfo.TotalSpace = (bucketInfo.TotalSpace / 2);
	bucketInfo.UsedSpace = (bucketInfo.UsedSpace / 2);
	
	WriteToDebug("GetBucketInfo returning " + bucketInfo );
	
	return bucketInfo;
}


//Represents the size of an SSP Bucket
//Contains two values, a total space and used space, each of which is represented in characters
function SSPBucketSize(totalSpace, usedSpace){
	
	this.TotalSpace = totalSpace;
	this.UsedSpace = usedSpace;
	
	this.toString = function (){
		return "[SSPBucketSize " + this.TotalSpace + ", " + this.UsedSpace + "]";
	};
}
