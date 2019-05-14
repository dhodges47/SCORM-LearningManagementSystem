/**************
Articulate LMS Libary
--
Modify data to fit the rsecAPI
--
Version 4.0.000
**************/

var SURVEY_CORRECT_RESPONSE = "_";

// RSEC API
var lmsAPI = parent;
var g_bAPIPresent = false;
var g_bLMSPresent = false;


// Is Lesson Completed
var g_bLessonCompleted = false;

// Resume data
var g_strResumeData = "";

// Save State Delay
var g_nSaveTimeout;
var g_nDelayCount = 0;
var g_strStatus = "";

if (lmsAPI && lmsAPI.IsLmsPresent)
{
	g_bAPIPresent = true;
	g_bLMSPresent = lmsAPI.IsLmsPresent();
}
	
var g_strLDelim = "|~|";
var g_strLInteractionDelim = "|#|";

function lms_DoFSCommand(command, args)
{
	if (g_bAPIPresent)
	{
		args = String(args);
		command = String(command);

		var arrArgs = args.split(g_strLDelim);
		
		switch (command)
		{				
			case "BW_StoreQuestionResult":
				RecordInteraction(arrArgs);
				break;

			case "BW_SetResumeData":
				g_strResumeData = args;
				SaveStateData();
				break;
				
			case "BW_UpdateStatus":
				ReportStatus();
				break;
				
			case "BW_UpdateViewStatus":
				SetStatus(normalizeStatus(g_oContentResults.strStatus));
				break;
				
			case "BW_InitResume":
				if (arrArgs[0] == "true")
				{
					g_strStatus = "incomplete";
				}
				else
				{
					SetStatus("incomplete");
				}
				break;
			case "BW_ClosePlayer":
				// This is an important milestone, save the data
				
				ReportStatus();
				
				LMSCommit();

				lmsAPI.ConcedeControl()

				break;				
		}
	}
}

function ReportStatus()
{
	if (g_oContentResults.strType == "quiz")
	{
		lmsAPI.SetScore(g_oContentResults.nScore, 100, 0);
	}
	
	SetStatus(normalizeStatus(g_oContentResults.strStatus));
}

function RecordInteraction(arrArgs)
{
	var bResult = true;

	var strQuizId = arrArgs[0];
	var strId = arrArgs[1];
	// var strId = arrArgs[2];  // Quiz id
	var strType = arrArgs[3];
	var strCorrectResponse = arrArgs[4];
	var strStudentResponse = arrArgs[5];
	var nLatency = arrArgs[6];
	var strResult = arrArgs[7];
	var nPoints = arrArgs[8];
	var strTime = arrArgs[9];
	var strWeight = arrArgs[10];
	var nQuestionNumber = arrArgs[11];
	var strDescription = arrArgs[12];
	var strLearningObjectiveId = arrArgs[13];
	var bTracked = (arrArgs[14] == "true");
	var bSurvey = (strResult.toLowerCase() == "neutral");
	
	if (bTracked)
	{
		strLearningObjectiveId = strLearningObjectiveId.replace(/[ \t\r\n\v\f]/g, "_");
		
		strResult = normalizeResult(strResult);

		var strTemp = "";
		strTemp += "Description: " + strDescription + "\n";
		strTemp += "Time: " + strTime + "\n";
		strTemp += "Id: " + strId + "\n";
		strTemp += "Learning Objective Id: " + strLearningObjectiveId + "\n";
		strTemp += "Type: " + strType + "\n";
		strTemp += "Correct Response: " + strCorrectResponse + "\n";
		strTemp += "Student Response: " + strStudentResponse + "\n";
		strTemp += "Result: " + strResult + "\n";
		strTemp += "Weight: " + strWeight + "\n";
		strTemp += "Latency: " + parseInt(nLatency) + "\n";
		strTemp += "Survey: " + bSurvey;
		
		switch(strType)
		{
			case "truefalse":	// True - False		
				var bUserResult = (strStudentResponse.toLowerCase() == "true");
				var bCorrectResult = (strCorrectResponse.toLowerCase() == "true");

				bResult = lmsAPI.RecordTrueFalseInteraction(strId, 
								  bUserResult,
								  strResult,
								  bCorrectResult,
								  strDescription,
								  parseInt(strWeight),
								  parseInt(nLatency),
								  strLearningObjectiveId);
				break;
			
			case "wordbank":
			case "hotspot":
			case "multiplechoice":
			case "multipleresponse":
				var arrUserResult = strStudentResponse.split(g_strLInteractionDelim); 
				var arrCorrectResult = strCorrectResponse.split(g_strLInteractionDelim);

				for (var i = 0; i < arrUserResult.length; i++)
				{
					var objUserResult = lmsAPI.CreateResponseIdentifier(arrUserResult[i].substr(0,1), arrUserResult[i]);
					arrUserResult[i] = objUserResult;
				}
				
				if (!bSurvey)
				{
					for (var i = 0; i < arrCorrectResult.length; i++)
					{
						var strShort = "";
						if (arrCorrectResult[i].length > 0)
						{
							strShort = arrCorrectResult[i].substr(0,1);
						}

						var objCorrectResponse = lmsAPI.CreateResponseIdentifier(strShort, arrCorrectResult[i]);

						arrCorrectResult[i] = objCorrectResponse;
					}
				}
				else
				{
					arrCorrectResult = new Array();
				}


				bResult = lmsAPI.RecordMultipleChoiceInteraction(strId, 
									   arrUserResult,
									   strResult,
									   arrCorrectResult,
									   strDescription,
									   parseInt(strWeight),
									   parseInt(nLatency),
									   strLearningObjectiveId);
				break;
			
			case "essay":
			case "fillin":
			case "numeric":
				bResult = lmsAPI.RecordFillInInteraction(strId, 
								   strStudentResponse,
								   strResult,
								   strCorrectResponse,
								   strDescription,
								   parseInt(strWeight),
								   parseInt(nLatency),
								   strLearningObjectiveId);
				break;
				
			case "matching":	// Matching

				var arrUserResult = strStudentResponse.split(g_strLInteractionDelim);
				var arrCorrectResult = strCorrectResponse.split(g_strLInteractionDelim);
				var arrNewUserResult = new Array();
				var arrNewCorrectResult = new Array();
				var nIndex = 0;
				
				for (var i = 0; i < arrUserResult.length; i += 2)
				{
					var strShort = "" + (nIndex + 1);

					var objSource = lmsAPI.CreateResponseIdentifier(strShort.substr(0,1), arrUserResult[i]);
					var objUserResult = lmsAPI.CreateResponseIdentifier(arrUserResult[i + 1].substr(0,1), arrUserResult[i + 1]);
					arrNewUserResult[nIndex] = new lmsAPI.MatchingResponse(objSource, objUserResult);
					nIndex++;
				}

				nIndex = 0;
				
				if (!bSurvey)
				{
					for (var i = 0; i < arrCorrectResult.length; i += 2)
					{
						var strShort = "" + (nIndex + 1);
						
						var objSource = lmsAPI.CreateResponseIdentifier(strShort.substr(0,1), arrCorrectResult[i]);
						var objCorrectResponse = lmsAPI.CreateResponseIdentifier(arrCorrectResult[i + 1].substr(0,1), arrCorrectResult[i + 1]);
						arrNewCorrectResult[nIndex] = new lmsAPI.MatchingResponse(objSource, objCorrectResponse);
						nIndex++;
					}
				}

				bResult = lmsAPI.RecordMatchingInteraction(strId, 
								 arrNewUserResult,
								 strResult,
								 arrNewCorrectResult,
								 strDescription,
								 parseInt(strWeight),
								 parseInt(nLatency),
								 strLearningObjectiveId);
				break;
				
			case "sequence":
				var arrUserResult = strStudentResponse.split(g_strLInteractionDelim);
				var arrCorrectResult = strCorrectResponse.split(g_strLInteractionDelim);

				for (var i = 0; i < arrUserResult.length; i++)
				{
					var objUserResult = lmsAPI.CreateResponseIdentifier(arrUserResult[i].substr(0,1), arrUserResult[i]);
					arrUserResult[i] = objUserResult;
				}
				
				if (!bSurvey)
				{
					for (var i = 0; i < arrCorrectResult.length; i++)
					{
						var strShort = "";
						if (arrCorrectResult[i].length > 0)
						{
							strShort = arrCorrectResult[i].substr(0,1);
						}

						var objCorrectResponse = lmsAPI.CreateResponseIdentifier(arrCorrectResult[i].substr(0,1), arrCorrectResult[i]);
						arrCorrectResult[i] = objCorrectResponse;
					}
				}
				else
				{
					arrCorrectResult = new Array();
				}

				bResult = lmsAPI.RecordSequencingInteraction(strId, 
								   arrUserResult,
								   strResult,
								   arrCorrectResult,
								   strDescription,
								   parseInt(strWeight),
								   parseInt(nLatency),
								   strLearningObjectiveId);
				break;
			case "likert":
				bResult = lmsAPI.RecordLikertInteraction(strId,
									 lmsAPI.CreateResponseIdentifier(strStudentResponse.substr(0,1), strStudentResponse),
									 strResult,
									 strCorrectResponse,
									 strDescription,
									 parseInt(strWeight),
									 parseInt(nLatency),
									 strLearningObjectiveId);
				break;
				break;
			default:
				// alert("Unhandled: " + strType);
				break;
		}
	}	
}

function normalizeResult(result)  
{
	switch (result.toUpperCase().charAt(0))  
	{
		case 'C': return lmsAPI.INTERACTION_RESULT_CORRECT;
		case 'I': return lmsAPI.INTERACTION_RESULT_WRONG;
		case 'W': return lmsAPI.INTERACTION_RESULT_WRONG;
		case 'U': return lmsAPI.INTERACTION_RESULT_UNANTICIPATED;
		case 'N': return lmsAPI.INTERACTION_RESULT_NEUTRAL;
	}
	return result;
}

function normalizeStatus(status)  
{
	switch (status.toUpperCase().charAt(0)) {
	case 'C': return "completed";
	case 'I': return "incomplete";
	case 'N': return "not attempted";	
	case 'F': return "failed";
	case 'P': return "passed";
	}
	return status;
}


function timecodeToMilliSeconds( tCode) 
{
	var results = tCode.split(":");
	var secs;
	for (var i = 0; i < results.length; i++)
	{
		if (results[i].substr(0,1) == "0")
		{
			results[i] = results[i].substr(1);
		}
	}
	secs = ((parseInt(results[0]) * 60) + parseInt(results[1])) * 60 + parseInt(results[2]);
	return secs * 1000;
}

function SetStatus(strStatus)
{
	if (strStatus != g_strStatus)
	{
		g_strStatus = strStatus;
		
		switch (strStatus)
		{
			case "complete":
			case "completed":
				lmsAPI.SetReachedEnd();
				break;
			case "incomplete":
				lmsAPI.ResetStatus();
				break;
			case "not attempted":
				break;
			case "failed":
				lmsAPI.SetFailed();
				break;
			case "passed":
				lmsAPI.SetPassed();
				break;
		}
		
		ForceCommit();
	}
}

function SaveStateData()
{
	g_nDelayCount++;

	if (g_nSaveTimeout)
	{
		clearTimeout(g_nSaveTimeout);
	}

	if (g_nDelayCount >= 10)
	{
		SaveNow();
	}
	else
	{
		g_nSaveTimeout = setTimeout("SaveNow()",500);
	}
}

function ForceCommit()
{
	if (g_bAPIPresent)
	{
		lmsAPI.SetDataChunk(g_strResumeData);
		
		LMSCommit();
	}
}

function SaveNow()
{
	g_nDelayCount = 0;

	if (g_bAPIPresent)
	{
		lmsAPI.SetDataChunk(g_strResumeData);
	}
}

function RetrieveStateData()
{
	if (g_bAPIPresent)
	{
		// Get Resume Data
		g_strResumeData = lmsAPI.GetDataChunk();

		// Check to see if the lesson was completed
		g_bLessonCompleted = (lmsAPI.GetStatus() == lmsAPI.LESSON_STATUS_COMPLETED);
	}
}

function LMSCommit()
{
	if (g_bWarnOnCommitFail)
	{
		var bResult = true;
		
		try
		{
			bResult = lmsAPI.CommitData();
		}
		catch(e) 
		{
			bResult = false;
		};
		
		if (!bResult)
		{
			WarnCommit();
		}
	}
	else
	{
		lmsAPI.CommitData();
	}
}

function WarnCommit()
{
	var bResult = false;
	
	while (!bResult)
	{
		bResult = true;
		if (confirm("The method CommitData failed sending data to LMS. Retry?"))
		{
			try
			{
				bResult = lmsAPI.CommitData();
			}
			catch(e) 
			{
				bResult = false;
			};
		}
	}
}


// Use this method to update the status at the last minute and then call the LMS APIs Unload method
function LMSUnload()
{
	if (g_bAPIPresent)
	{
		ReportStatus();
		
		lmsAPI.Unload();
	}
}

setInterval("ForceCommit()", 600000);

if (g_bAPIPresent)
{
	
	if (IE6)
	{
		setTimeout("ForceCommit()", 5000);
	}
	else
	{
		LMSCommit();
	}
}