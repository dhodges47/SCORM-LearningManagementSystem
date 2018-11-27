
function LMSStandardAPI(strStandard){
	
	WriteToDebug("In LMSStandardAPI strStandard=" + strStandard);
	
	if (strStandard == ""){
		WriteToDebug("No standard specified, using NONE");
		strStandard = "NONE";
	}

	eval ("this.Initialize = " + strStandard + "_Initialize");
	eval ("this.Finish = " + strStandard + "_Finish");
	eval ("this.CommitData = " + strStandard + "_CommitData");
	eval ("this.GetStudentID = " + strStandard + "_GetStudentID");
	eval ("this.GetStudentName = " + strStandard + "_GetStudentName");
	eval ("this.GetBookmark = " + strStandard + "_GetBookmark");
	eval ("this.SetBookmark = " + strStandard + "_SetBookmark");
	eval ("this.GetDataChunk = " + strStandard + "_GetDataChunk");
	eval ("this.SetDataChunk = " + strStandard + "_SetDataChunk");
	eval ("this.GetLaunchData = " + strStandard + "_GetLaunchData");
	eval ("this.GetComments = " + strStandard + "_GetComments");
	eval ("this.WriteComment = " + strStandard + "_WriteComment");
	eval ("this.GetLMSComments = " + strStandard + "_GetLMSComments");
	eval ("this.GetAudioPlayPreference = " + strStandard + "_GetAudioPlayPreference");
	eval ("this.GetAudioVolumePreference = " + strStandard + "_GetAudioVolumePreference");
	eval ("this.SetAudioPreference = " + strStandard + "_SetAudioPreference");
	eval ("this.SetLanguagePreference = " + strStandard + "_SetLanguagePreference");
	eval ("this.GetLanguagePreference = " + strStandard + "_GetLanguagePreference");
	eval ("this.SetSpeedPreference = " + strStandard + "_SetSpeedPreference");
	eval ("this.GetSpeedPreference = " + strStandard + "_GetSpeedPreference");
	eval ("this.SetTextPreference = " + strStandard + "_SetTextPreference");
	eval ("this.GetTextPreference = " + strStandard + "_GetTextPreference");
	eval ("this.GetPreviouslyAccumulatedTime = " + strStandard + "_GetPreviouslyAccumulatedTime");
	eval ("this.SaveTime = " + strStandard + "_SaveTime");
	eval ("this.GetMaxTimeAllowed = " + strStandard + "_GetMaxTimeAllowed");
	eval ("this.DisplayMessageOnTimeout = " + strStandard + "_DisplayMessageOnTimeout");
	eval ("this.ExitOnTimeout = " + strStandard + "_ExitOnTimeout");
	eval ("this.GetPassingScore = " + strStandard + "_GetPassingScore");
	eval ("this.SetScore = " + strStandard + "_SetScore");
	eval ("this.GetScore = " + strStandard + "_GetScore");
	eval ("this.GetScaledScore = " + strStandard + "_GetScaledScore");
	
	eval ("this.RecordTrueFalseInteraction = " + strStandard + "_RecordTrueFalseInteraction");
	eval ("this.RecordMultipleChoiceInteraction = " + strStandard + "_RecordMultipleChoiceInteraction");
	eval ("this.RecordFillInInteraction = " + strStandard + "_RecordFillInInteraction");
	eval ("this.RecordMatchingInteraction = " + strStandard + "_RecordMatchingInteraction");
	eval ("this.RecordPerformanceInteraction = " + strStandard + "_RecordPerformanceInteraction");
	eval ("this.RecordSequencingInteraction = " + strStandard + "_RecordSequencingInteraction");
	eval ("this.RecordLikertInteraction = " + strStandard + "_RecordLikertInteraction");
	eval ("this.RecordNumericInteraction = " + strStandard + "_RecordNumericInteraction");
	
	eval ("this.GetEntryMode = " + strStandard + "_GetEntryMode");
	eval ("this.GetLessonMode = " + strStandard + "_GetLessonMode");
	eval ("this.GetTakingForCredit = " + strStandard + "_GetTakingForCredit");
	eval ("this.SetObjectiveScore = " + strStandard + "_SetObjectiveScore");
	eval ("this.SetObjectiveStatus = " + strStandard + "_SetObjectiveStatus");
	eval ("this.GetObjectiveScore = " + strStandard + "_GetObjectiveScore");
	eval ("this.GetObjectiveStatus = " + strStandard + "_GetObjectiveStatus");
	eval ("this.SetObjectiveDescription = " + strStandard + "_SetObjectiveDescription");
	eval ("this.GetObjectiveDescription = " + strStandard + "_GetObjectiveDescription");
	eval ("this.SetFailed = " + strStandard + "_SetFailed");
	eval ("this.SetPassed = " + strStandard + "_SetPassed");
	eval ("this.SetCompleted = " + strStandard + "_SetCompleted");
	eval ("this.ResetStatus = " + strStandard + "_ResetStatus");
	eval ("this.GetStatus = " + strStandard + "_GetStatus");	
	eval ("this.GetLastError = " + strStandard + "_GetLastError");
	eval ("this.GetLastErrorDesc = " + strStandard + "_GetLastErrorDesc");	
	
	eval ("this.GetInteractionType = " + strStandard + "_GetInteractionType");
	eval ("this.GetInteractionTimestamp = " + strStandard + "_GetInteractionTimestamp");
	eval ("this.GetInteractionCorrectResponses = " + strStandard + "_GetInteractionCorrectResponses");
	eval ("this.GetInteractionWeighting = " + strStandard + "_GetInteractionWeighting");
	eval ("this.GetInteractionLearnerResponses = " + strStandard + "_GetInteractionLearnerResponses");
	eval ("this.GetInteractionResult = " + strStandard + "_GetInteractionResult");
	eval ("this.GetInteractionLatency = " + strStandard + "_GetInteractionLatency");
	eval ("this.GetInteractionDescription = " + strStandard + "_GetInteractionDescription");
	
	eval ("this.CreateDataBucket = " + strStandard + "_CreateDataBucket");
	eval ("this.GetDataFromBucket = " + strStandard + "_GetDataFromBucket");
	eval ("this.PutDataInBucket = " + strStandard + "_PutDataInBucket");
	eval ("this.DetectSSPSupport = " + strStandard + "_DetectSSPSupport");
	eval ("this.GetBucketInfo = " + strStandard + "_GetBucketInfo");
	
	eval ("this.GetProgressMeasure = " + strStandard + "_GetProgressMeasure");
	eval ("this.SetProgressMeasure = " + strStandard + "_SetProgressMeasure");
	
	eval ("this.SetPointBasedScore = " + strStandard + "_SetPointBasedScore");
	
	this.Standard = strStandard;
}
