
function GetQueryStringValue(strElement, strQueryString){
		
	var aryPairs;
	var foundValue;
	
	//WriteToDebug("In GetQueryStringValue strElement=" + strElement + ", strQueryString=" + strQueryString);
	
	//get rid of the leading "?"
	strQueryString = strQueryString.substring(1);
		
	//split into name/value pairs
	aryPairs = strQueryString.split("&");
	
	foundValue = SearchQueryStringPairs(aryPairs, strElement);
	
	if (foundValue === null){
		//sometimes we wind up with a querystring that looks like "indexAPI.html?ShowDebug=true?AICC_URL=http://www.blah.com/blahblah&AICC_SID=12345"
		//try to handle this case by splitting on both ? and &
		
		aryPairs = strQueryString.split(/[\?\&]/);
		foundValue = SearchQueryStringPairs(aryPairs, strElement);
	}
	
	if (foundValue === null){
		//if we didn't find a match, return an empty string
		WriteToDebug("GetQueryStringValue Element '" + strElement + "' Not Found, Returning: empty string");
		return "";
	}
	else{
		WriteToDebug("GetQueryStringValue for '" + strElement + "' Returning: " + foundValue);
		return foundValue;
	}
}

function SearchQueryStringPairs(aryPairs, strElement){
	
	var i;
	var intEqualPos;
	var strArg = "";
	var strValue = "";
	
	strElement = strElement.toLowerCase();
	
	//search each querystring value and return the first match
	for (i=0; i < aryPairs.length; i++){
		
		//WriteToDebug("Looking at element-" + aryPairs[i]);
		
		intEqualPos = aryPairs[i].indexOf('=');
		
		if (intEqualPos != -1){
		
			strArg = aryPairs[i].substring(0,intEqualPos);
			
			//WriteToDebug("Arg=" + strArg);
			
			if (EqualsIgnoreCase(strArg, strElement)){
			
				//WriteToDebug("Found Match");
				strValue = aryPairs[i].substring(intEqualPos+1);
				
				//WriteToDebug("Decoding value-" + strValue);	
				
				strValue = new String(strValue)
				
				strValue = strValue.replace(/\+/g, "%20")
				strValue = unescape(strValue);

				//WriteToDebug("Returning value-" + strValue);	
				
				return new String(strValue);
			}
		}
	} 
	
	return null;
}

function ConvertStringToBoolean(str){
	        
	var intTemp;
	
	//WriteToDebug("In ConvertStringToBoolean");
	
	if (EqualsIgnoreCase(str, "true") || EqualsIgnoreCase(str, "t") || str.toLowerCase().indexOf("t") == 0){
		//WriteToDebug("Found alpha true");
		return true;   
	}
	else{
		intTemp = parseInt(str, 10);
		if (intTemp == 1 || intTemp==-1){
			//WriteToDebug("Found numeric true");
		     return true;
		}
		else{
			//WriteToDebug("Returning false");
		    return false;
		}
	}
}



function EqualsIgnoreCase(str1, str2){
	
	//WriteToDebug("In EqualsIgnoreCase str1=" + str1 + ", str2=" + str2);
	
	var blnReturn;
	
	str1 = new String(str1);
	str2 = new String(str2);
	
	blnReturn = (str1.toLowerCase() == str2.toLowerCase())
	
	//WriteToDebug("Returning " + blnReturn);
	
	return blnReturn;
}


function ValidInteger(intNum){
	
	WriteToDebug("In ValidInteger intNum=" + intNum);
	
	var str = new String(intNum);
	 
	if (str.indexOf("-", 0) == 0){
		str = str.substring(1, str.length - 1);
	}
	  
	var regValidChars= new RegExp("[^0-9]"); 
	  
	if (str.search(regValidChars) == -1){
		WriteToDebug("Returning true");
		return true; 
	}
	  
	WriteToDebug("Returning false");
	return false;
}


//---------------------------------------------------------------------------------
//Time Manipulation Functions

function ConvertDateToIso8601TimeStamp(dtm){
	
	var strTimeStamp;
	
	dtm = new Date(dtm);
	
	var Year   = dtm.getFullYear();
	var Month  = dtm.getMonth() + 1;
	var Day    = dtm.getDate();
	var Hour   = dtm.getHours();
	var Minute = dtm.getMinutes();
	var Second = dtm.getSeconds();
	
	Month  = ZeroPad(Month, 2);
	Day    = ZeroPad(Day, 2);
	Hour   = ZeroPad(Hour, 2);
	Minute = ZeroPad(Minute, 2);
	Second = ZeroPad(Second, 2);
	
	strTimeStamp = Year + "-" + Month + "-" + Day + "T" + Hour + ":" + Minute + ":" + Second;
	
	return strTimeStamp;
	
}

function ConvertIso8601TimeStampToDate(strTimeStamp){
	
	strTimeStamp = new String(strTimeStamp);
	var ary = new Array();
	ary = strTimeStamp.split(/[\:T-]/);
	
	var Year   = ary[0];
	var Month  = ary[1]-1;
	var Day    = ary[2];
	var Hour   = ary[3];
	var Minute = ary[4];
	var Second = ary[5];
	
	
	return new Date(Year, Month, Day, Hour, Minute, Second, 0);
	
}

function ConvertDateToCMIDate(dtmDate){

	WriteToDebug("In ConvertDateToCMIDate");
	
	var strYear;
	var strMonth;
	var strDay;
	var strReturn;
	
	dtmDate = new Date(dtmDate);
	
	strYear = dtmDate.getFullYear()
	strMonth = (dtmDate.getMonth() + 1);
	strDay = dtmDate.getDate();
	
	strReturn = ZeroPad(strYear, 4) + "/" + ZeroPad(strMonth, 2) + "/" + ZeroPad(strDay, 2);
	
	return strReturn;
}

function ConvertDateToCMITime(dtmDate){
	
	var strHours;
	var strMinutes;
	var strSeconds;
	var strReturn;
	
	dtmDate = new Date(dtmDate);
	
	strHours = dtmDate.getHours();
	strMinutes = dtmDate.getMinutes();
	strSeconds = dtmDate.getSeconds();
	
	strReturn = ZeroPad(strHours, 2) + ":" + ZeroPad(strMinutes, 2) + ":" + ZeroPad(strSeconds, 2);
	
	return strReturn;
}


function ConvertCMITimeSpanToMS(strTime){
	
	WriteToDebug("In ConvertCMITimeSpanToMS, strTime=" + strTime);
	
	var aryParts;
	var intHours;
	var intMinutes;
	var intSeconds;
	
	var intTotalMilliSeconds;
	
	//split the string into its parts
	aryParts = strTime.split(":");
	
	//make sure it's valid before we knock ourselves out
	if (! IsValidCMITimeSpan(strTime)){
		WriteToDebug("ERROR - Invalid TimeSpan");
		SetErrorInfo(SCORM_ERROR_GENERAL, "LMS ERROR - Invalid time span passed to ConvertCMITimeSpanToMS, please contact technical support");
		return 0;
	}
	
	//seperate the parts and multiply by the appropriate constant (3600000 = num milliseconds in an hour, etc)
	intHours   = aryParts[0];
	intMinutes = aryParts[1];
	intSeconds = aryParts[2];	//don't need to worry about milliseconds b/c they are expressed as fractions of a second
	
	WriteToDebug("intHours=" + intHours + " intMinutes=" + intMinutes + " intSeconds=" + intSeconds);
	
	intTotalMilliSeconds = (intHours * 3600000) + (intMinutes * 60000) + (intSeconds * 1000);
	
	//necessary because in JavaScript, some values for intSeconds (such as 2.01) will have a lot of decimal
	//places when multiplied by 1000. For instance, 2.01 turns into 2009.999999999999997.
	intTotalMilliSeconds = Math.round(intTotalMilliSeconds);
	
	WriteToDebug("Returning " + intTotalMilliSeconds);
	
	return intTotalMilliSeconds;
}


function ConvertScorm2004TimeToMS(strIso8601Time){
	
	WriteToDebug("In ConvertScorm2004TimeToMS, strIso8601Time=" + strIso8601Time);
	
	var intTotalMs = 0;
	
	var strNumberBuilder;
	var strCurrentCharacter;
	var blnInTimeSection;
	

	var Seconds = 0;	// 100 hundreths of a seconds
	var Minutes = 0;	// 60 seconds
	var Hours = 0;		// 60 minutes
	var Days = 0;		// 24 hours
	var Months = 0;		// assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
	var Years = 0;		// assumed to be 12 "average" months
	
	var MILLISECONDS_PER_SECOND = 1000;
	var MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * 60;
	var MILLISECONDS_PER_HOUR   = MILLISECONDS_PER_MINUTE * 60;
	var MILLISECONDS_PER_DAY    = MILLISECONDS_PER_HOUR * 24;
	var MILLISECONDS_PER_MONTH  = MILLISECONDS_PER_DAY * (((365 * 4) + 1) / 48);
	var MILLISECONDS_PER_YEAR   = MILLISECONDS_PER_MONTH * 12;

	
	strIso8601Time = new String(strIso8601Time);
	
	strNumberBuilder = "";
	strCurrentCharacter = "";
	blnInTimeSection = false;

	//start at 1 to get past the "P"
	for (var i=1; i < strIso8601Time.length; i++){
		
		strCurrentCharacter = strIso8601Time.charAt(i);

		
		if (IsIso8601SectionDelimiter(strCurrentCharacter)){
			
			switch (strCurrentCharacter.toUpperCase()){
				
				case "Y":
					Years = parseInt(strNumberBuilder, 10);
				break;
				
				case "M":
					if (blnInTimeSection){
						Minutes = parseInt(strNumberBuilder, 10);
					}
					else{
						Months = parseInt(strNumberBuilder, 10);
					}
				break;
				
				case "D":
					Days = parseInt(strNumberBuilder, 10);
				break;
				
				case "H":
					Hours = parseInt(strNumberBuilder, 10);
				break;
				
				case "S":
					Seconds = parseFloat(strNumberBuilder);
				break;
				
				case "T":
					blnInTimeSection = true;
				break;
				
			}

			strNumberBuilder = "";
		}
		else{
			strNumberBuilder += "" + strCurrentCharacter;		//use "" to keep the number as string concats instead of numeric additions
		}
		
	}
	
	WriteToDebug("Years=" + Years + "\n" +
				"Months=" + Months + "\n" +
				"Days=" + Days + "\n" +
				"Hours=" + Hours + "\n" +
				"Minutes=" + Minutes + "\n" +
				"Seconds=" + Seconds + "\n"
				);
	
	intTotalMs = (Years * MILLISECONDS_PER_YEAR) +
				 (Months * MILLISECONDS_PER_MONTH) + 
				 (Days * MILLISECONDS_PER_DAY) + 
				 (Hours * MILLISECONDS_PER_HOUR) + 
				 (Minutes * MILLISECONDS_PER_MINUTE) + 
				 (Seconds * MILLISECONDS_PER_SECOND);
	
	//necessary because in JavaScript, some values (such as 2.01) will have a lot of decimal
	//places when multiplied by a larger number. For instance, 2.01 turns into 2009.999999999999997.
	intTotalMs = Math.round(intTotalMs);
	
	WriteToDebug ("returning-" + intTotalMs);
		 
	return intTotalMs;
	
}

function IsIso8601SectionDelimiter(str){
	
	if (str.search(/[PYMDTHS]/) >=0 ){
		return true;
	}
	else{
		return false;
	}
	
}


function IsValidCMITimeSpan(strValue){
	
	WriteToDebug("In IsValidCMITimeSpan strValue=" + strValue);
		
	//note that the spec does not say that minutes or seconds have to be < 60
	
	var regValid = /^\d?\d?\d?\d:\d?\d:\d?\d(.\d\d?)?$/;	

	if (strValue.search(regValid) > -1){
		WriteToDebug("Returning True");
		return true;
	}
	else{
		WriteToDebug("Returning False");
		return false;
	}
}



function IsValidIso8601TimeSpan(strValue){
	
	WriteToDebug("In IsValidIso8601TimeSpan strValue=" + strValue);	
	
	var regValid = /^P(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+(.\d\d?)?S)?)?$/;	

	if (strValue.search(regValid) > -1){
		WriteToDebug("Returning True");
		return true;
	}
	else{
		WriteToDebug("Returning False");
		return false;
	}
}

function ConvertMilliSecondsToSCORMTime(intTotalMilliseconds, blnIncludeFraction){
	
	var intHours;
	var intintMinutes;
	var intSeconds;
	var intMilliseconds;
	var intHundredths;
	var strCMITimeSpan;
	
	WriteToDebug("In ConvertMilliSecondsIntoSCORMTime, intTotalMilliseconds = " + intTotalMilliseconds + ", blnIncludeFraction = " + blnIncludeFraction);
	
	if (blnIncludeFraction == null || blnIncludeFraction == undefined){
		blnIncludeFraction = true;
	}
	
	//extract time parts
	intMilliseconds = intTotalMilliseconds % 1000;

	intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

	intMinutes = ((intTotalMilliseconds - intMilliseconds - (intSeconds * 1000)) / 60000) % 60;

	intHours = (intTotalMilliseconds - intMilliseconds - (intSeconds * 1000) - (intMinutes * 60000)) / 3600000;
	
	WriteToDebug("Separated Parts, intHours=" + intHours + ", intMinutes=" + intMinutes + ", intSeconds=" + intSeconds + ", intMilliseconds=" + intMilliseconds);
	
	/*
	deal with exceptional case when content used a huge amount of time and interpreted CMITimstamp 
	to allow a number of intMinutes and seconds greater than 60 i.e. 9999:99:99.99 instead of 9999:60:60:99
	note - this case is permissable under SCORM, but will be exceptionally rare
	*/

	if (intHours == 10000) 
	{
		WriteToDebug("Max intHours detected");
		
		intHours = 9999;

		intMinutes = (intTotalMilliseconds - (intHours * 3600000)) / 60000;
		if (intMinutes == 100) 
		{
			intMinutes = 99;
		}
		intMinutes = Math.floor(intMinutes);
		
		intSeconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000)) / 1000;
		if (intSeconds == 100) 
		{
			intSeconds = 99;
		}
		intSeconds = Math.floor(intSeconds);
		
		intMilliseconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000) - (intSeconds * 1000));
		
		WriteToDebug("Separated Parts, intHours=" + intHours + ", intMinutes=" + intMinutes + ", intSeconds=" + intSeconds + ", intMilliseconds=" + intMilliseconds);

	}

	//drop the extra precision from the milliseconds
	intHundredths = Math.floor(intMilliseconds / 10);

	//put in padding 0's and concatinate to get the proper format
	strCMITimeSpan = ZeroPad(intHours, 4) + ":" + ZeroPad(intMinutes, 2) + ":" + ZeroPad(intSeconds, 2);
	
	if (blnIncludeFraction){
		strCMITimeSpan += "." + intHundredths;
	}
	
	WriteToDebug("strCMITimeSpan=" + strCMITimeSpan);
	
	//check for case where total milliseconds is greater than max supported by strCMITimeSpan
	if (intHours > 9999) 
	{
		strCMITimeSpan = "9999:99:99";
		
		if (blnIncludeFraction){
			strCMITimeSpan += ".99";
		}
	}
	
	WriteToDebug("returning " + strCMITimeSpan);
	
	return strCMITimeSpan;
	
}


function ConvertMilliSecondsIntoSCORM2004Time(intTotalMilliseconds){
	
	WriteToDebug("In ConvertMilliSecondsIntoSCORM2004Time intTotalMilliseconds=" + intTotalMilliseconds);
	
	var ScormTime = "";
	
	var HundredthsOfASecond;	//decrementing counter - work at the hundreths of a second level because that is all the precision that is required
	
	var Seconds;	// 100 hundreths of a seconds
	var Minutes;	// 60 seconds
	var Hours;		// 60 minutes
	var Days;		// 24 hours
	var Months;		// assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
	var Years;		// assumed to be 12 "average" months
	
	var HUNDREDTHS_PER_SECOND = 100;
	var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
	var HUNDREDTHS_PER_HOUR   = HUNDREDTHS_PER_MINUTE * 60;
	var HUNDREDTHS_PER_DAY    = HUNDREDTHS_PER_HOUR * 24;
	var HUNDREDTHS_PER_MONTH  = HUNDREDTHS_PER_DAY * (((365 * 4) + 1) / 48);
	var HUNDREDTHS_PER_YEAR   = HUNDREDTHS_PER_MONTH * 12;
	
	
	HundredthsOfASecond = Math.floor(intTotalMilliseconds / 10);
	
	Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
	HundredthsOfASecond -= (Years * HUNDREDTHS_PER_YEAR);
	
	Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
	HundredthsOfASecond -= (Months * HUNDREDTHS_PER_MONTH);
	
	Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
	HundredthsOfASecond -= (Days * HUNDREDTHS_PER_DAY);
	
	Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
	HundredthsOfASecond -= (Hours * HUNDREDTHS_PER_HOUR);
	
	Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
	HundredthsOfASecond -= (Minutes * HUNDREDTHS_PER_MINUTE);
	
	Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
	HundredthsOfASecond -= (Seconds * HUNDREDTHS_PER_SECOND);
	
	
	if (Years > 0) {
		ScormTime += Years + "Y";
	}
	if (Months > 0){
		ScormTime += Months + "M";
	}
	if (Days > 0){
		ScormTime += Days + "D";
	}
	
	//check to see if we have any time before adding the "T"
	if ((HundredthsOfASecond + Seconds + Minutes + Hours) > 0 ){
		
		ScormTime += "T";
		
		if (Hours > 0){
			ScormTime += Hours + "H";
		}
		
		if (Minutes > 0){
			ScormTime += Minutes + "M";
		}
		
		if ((HundredthsOfASecond + Seconds) > 0){
			ScormTime += Seconds;
			
			if (HundredthsOfASecond > 0){
				ScormTime += "." + HundredthsOfASecond;
			}
			
			ScormTime += "S";
		}
		
	}
	
	
	if (ScormTime == ""){
		ScormTime = "0S";
	}
	
	ScormTime = "P" + ScormTime;
	
	WriteToDebug("Returning-" + ScormTime);
	
	return ScormTime;
}



function ZeroPad(intNum, intNumDigits){
	
	WriteToDebug("In ZeroPad intNum=" + intNum + " intNumDigits=" + intNumDigits);
	
	var strTemp;
	var intLen;
	var i;
	
	strTemp = new String(intNum);
	intLen = strTemp.length;
	
	if (intLen > intNumDigits){
		WriteToDebug("Length of string is greater than num digits, trimming string");
		strTemp = strTemp.substr(0,intNumDigits);
	}
	else{
		for (i=intLen; i<intNumDigits; i++){
			strTemp = "0" + strTemp;
		}
	}
	
	WriteToDebug("Returning - " + strTemp);
	return strTemp;
}




function IsValidDecimal(strValue){
	
	WriteToDebug("In IsValidDecimal, strValue=" + strValue);
	
	strValue = new String(strValue);
	
	//check for characters "0-9", ".", and "-" only
	if (strValue.search(/[^.\d-]/) > -1){
		WriteToDebug("Returning False - character other than a digit, dash or period found");
		return false;
	}
	
	//if contains a dash, ensure it is first and that there is only 1
	if (strValue.search("-") > -1){
		if (strValue.indexOf("-", 1) > -1){
			WriteToDebug("Returning False - dash found in the middle of the string");
			return false;
		}
	}
	
	//ensure only 1 decimal point
	if (strValue.indexOf(".") != strValue.lastIndexOf(".")){
		WriteToDebug("Returning False - more than one decimal point found");
		return false;
	}
	
	//ensure there is at least 1 digit
	if (strValue.search(/\d/) < 0){
		WriteToDebug("Returning False - no digits found");
		return false;
	}
	
	WriteToDebug("Returning True");
	return true;
	
}


function IsAlphaNumeric(strValue){
	WriteToDebug("In IsAlphaNumeric");
	if (strValue.search(/\w/) < 0){
		WriteToDebug("Returning false");
		return false;
	}
	else{
		WriteToDebug("Returning true");
		return true;
	}
}


function ReverseNameSequence(strName)
{
	var strFirstName;
	var strLastName;
	var intCommaLoc;
	
	
	//debug
	if (strName=="") strName="Not Found, Learner Name";
	
	intCommaLoc = strName.indexOf(",");
	strFirstName = strName.slice(intCommaLoc+1);
	strLastName = strName.slice(0, intCommaLoc);
	
	strFirstName = Trim(strFirstName);
	strLastName = Trim(strLastName);
	
	
	
	return strFirstName + ' ' + strLastName;
}


function LTrim(str) {					// remove leading spaces 
	str = new String(str);
	return(str.replace(/^\s+/, '')); 
	
} 

function RTrim(str) {					// remove trailing spaces
	str = new String(str);
	return(str.replace(/\s+$/, ''));
} 

function Trim(strToTrim) {
	var str = LTrim(RTrim(strToTrim)); // remove leading and trailing spaces
  return (str.replace(/\s{2,}/g," ")); // replace multiple spaces with single spaces
}




function GetValueFromDataChunk(strID)
{
	var strChunk = new String(GetDataChunk());
	var aryPairs = new Array();
	var aryValues = new Array();
	var i;
	
	aryPairs = strChunk.split(parent.DATA_CHUNK_PAIR_SEPARATOR);
	
	for (i=0;i<aryPairs.length;i++)
	{
		aryValues = aryPairs[i].split(parent.DATA_CHUNK_VALUE_SEPARATOR);
		if (aryValues[0]==strID) return aryValues[1];
	}

	return '';
}


function SetDataChunkValue(strID, strValue)
{
	var strChunk = new String(GetDataChunk());
	var aryPairs = new Array();
	var aryValues = new Array();
	var i;
	var blnFound = new Boolean(false);
	
	
	
	aryPairs = strChunk.split(parent.DATA_CHUNK_PAIR_SEPARATOR);

	for (i=0;i<aryPairs.length;i++)
	{
		aryValues = aryPairs[i].split(parent.DATA_CHUNK_VALUE_SEPARATOR);
		if (aryValues[0]==strID) 
		{
			aryValues[1] = strValue;
			blnFound = true;
			aryPairs[i] = aryValues[0] + parent.DATA_CHUNK_VALUE_SEPARATOR + aryValues[1];
		}
	}
	
	
	if (blnFound==true)
	{
		strChunk = aryPairs.join(parent.DATA_CHUNK_PAIR_SEPARATOR);
	}
	else
	{
		if (strChunk=='') 
		{
			//if data chunk is empty, just add this value
			strChunk = strID + parent.DATA_CHUNK_VALUE_SEPARATOR + strValue;
		}
		else 
		{	
			//otherwise, append
			strChunk += parent.DATA_CHUNK_PAIR_SEPARATOR + strID + parent.DATA_CHUNK_VALUE_SEPARATOR + strValue;
		}
	}
	
	SetDataChunk(strChunk);
	
	return true;
}


function GetLastDirAndPageName(str)
{	
	var page = new String(str);
	var LastSlashLocation = page.lastIndexOf("/");
	var SecondLastSlashLocation = page.lastIndexOf("/", LastSlashLocation-1);
	return page.substr(SecondLastSlashLocation+1);
	
}


function RoundToPrecision(number, significantDigits){

	number = parseFloat(number);
    return (Math.round(number * Math.pow(10, significantDigits)) / Math.pow(10, significantDigits))
}

function IsAbsoluteUrl(urlStr) {
    return urlStr != null && (urlStr.indexOf("http://") == 0 || urlStr.indexOf("https://") == 0)
}
