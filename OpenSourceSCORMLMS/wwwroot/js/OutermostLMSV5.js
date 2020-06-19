/*******************************************************************************
**
** FileName: OutermostLMSV5.js
** Common LMS interface routines 
*******************************************************************************/

/*******************************************************************************
**
** By David Hodges
** Outermost Software, LLC
** Brattleboro, VT
 **  Rev 5/15/2018 Revised from OutermostLMSV3.js for ThinClient project, using new WebAPI interface
 ** Rev 6/11/2018 Adding error log for debugging, plus debug window
 * Bug Fix 6/19/2020 Somehow an old bug resurfaced in GetValue and SetValue, where the return value wasn't being returned to the caller
*******************************************************************************/
//debug info
var blnDebug = false;
var aryDebug = new Array();
var strDebug = "";
var winDebug;
// establish a pointer to this api so the SCO can find it (HAS to be called "API" for 1.2 and 
// for SCORM 2004 it has to be API_1484_11
var API = new apiclass();
API.version = '1.2';
var API_1484_11 = new apiclass();
API_1484_11.version = '1.3';
var sessionid;
var userid;
var coreid;
var scorm_course_id;
var sco_identifier;
var exit_status;

/****************************************************************************************
** api class. This api takes the SCORM-compliant calls from the SCO
** and converts them to the OUTERMOST Web Service behavior calls that interact
** with the OUTERMOST LMS.
****************************************************************************************/
function apiclass() {
    this._Debug = true;  // set this to false to turn debugging off

    this.version = '1.3'; // new value for SCORM2004

    // Define exception/error codes
    this._NoError = 0;
    this._GeneralException = 101;
    this._ServerBusy = 102;
    this._InvalidArgumentError = 201;
    this._ElementCannotHaveChildren = 202;
    this._ElementIsNotAnArray = 203;
    this._NotInitialized = 301;
    this._NotImplementedError = 401;
    this._InvalidSetValue = 402;
    this._ElementIsReadOnly = 403;
    this._ElementIsWriteOnly = 404;
    this._IncorrectDataType = 405;
    // define properties
    this.serviceAvailable = false; // WebService initialization state
    this.initialized = false; // SCO LMSInitialize state
    this.LastError = this._NotInitialized;
    this.LastErrorString = "";
    this.LastErrorDiagnostic = "";

    this._sessionid = "";
    this._userid = "";
    this._coreid = "";
    this._scorm_course_id = "";
    this._sco_identifier = "";
    this._exit_status = ""; // this will stay as is in browse or review mode, will change if they are actually taking the sco for credit to completed. Will only request the next page if this is "completed"

    // initialize the member function references
    // for the class prototype
    if (typeof (_api_prototype_called) == 'undefined') {
        _api_prototype_called = true;
        apiclass.prototype.LMSInitialize = _LMSInitialize;
        apiclass.prototype.LMSFinish = _LMSFinish;
        apiclass.prototype.LMSGetValue = _LMSGetValue;
        apiclass.prototype.LMSSetValue = _LMSSetValue;
        apiclass.prototype.LMSCommit = _LMSCommit;
        apiclass.prototype.LMSGetLastError = _LMSGetLastError;
        apiclass.prototype.LMSGetErrorString = _LMSGetErrorString;
        apiclass.prototype.LMSGetDiagnostic = _LMSGetDiagnostic;
        // for SCORM 2004
        apiclass.prototype.Initialize = _LMSInitialize;
        apiclass.prototype.Terminate = _LMSFinish;
        apiclass.prototype.GetValue = _LMSGetValue;
        apiclass.prototype.SetValue = _LMSSetValue;
        apiclass.prototype.Commit = _LMSCommit;
        apiclass.prototype.GetLastError = _LMSGetLastError;
        apiclass.prototype.GetErrorString = _LMSGetErrorString;
        apiclass.prototype.GetDiagnostic = _LMSGetDiagnostic;
    }

	/*******************************************************************************
	**
	** Function: LMSInitialize()
	** Inputs:  None
	** Return:  CMIBoolean true if the initialization was successful, or
	**          CMIBoolean false if the initialization failed.
	**
	** Description:
	** Initialize communication with LMS by calling the LMSInitialize
	** Web Service
	**
	*******************************************************************************/

    function _LMSInitialize(val) {

        WriteToDebug("----------------------------------------");
        WriteToDebug("----------------------------------------");
        WriteToDebug("In LMS Initialize");
        WriteToDebug("Browser Info (" + navigator.appName + " " + navigator.appVersion + ")");
        WriteToDebug("URL: " + window.document.location.href);
        WriteToDebug("----------------------------------------");
        WriteToDebug("----------------------------------------");

        if (val != '') {
            this.LastErrorString = "Value passed to LMSInitialize, should be blank";
            this.LastError = "201";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }

        if (this.initialized) {
            this.LastErrorString = "LMS is already initialized, call to LMSInitialize ignored.";
            this.LastError = "101";
            this.LastErrorDiagnostic = "Error from API";
            WriteToDebug(this.LastErrorString);
            return "false";
        }
        // the calling application leaves a session id and other variables 
        this._sessionid = SCOClient.sessionid;
        this._userid = SCOClient.userid;
        this._coreid = SCOClient.coreid;
        this._scorm_course_id = SCOClient.scorm_course_id;
        this._sco_identifier = SCOClient.sco_identifier;
        // LMSInfo object carries arguments to the server and back
        var lmsInfo = JSON.stringify(createLMSInfo(this._sessionid, this._userid, this._coreid, this._scorm_course_id, this._sco_identifier));
        WriteToDebug("LMSInitialize: " + lmsInfo);
        var that = this; // get reference to current API instance
        $.ajax({
            type: "POST",
            url: "/api/LMSInitialize",
            data: lmsInfo,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (response) {
                lmsInfo = response;
                that.LastError = lmsInfo.errorCode;
                that.LastErrorString = lmsInfo.errorString
                // check error code from server
                if (lmsInfo.errorCode != "0") {
                    that.initialized = false;
                }
                else {
                    that.initialized = true;
                }
                //    return (API.initialized) ? "true" : "false";
            },
            error: function (request, error) {
                // Ajax call failed
                that.LastError = "101"; //general exception
                that.LastErrorString = error.Message;
                that.LastErrorDiagnostic = "AJAX error";
                WriteToDebug("Ajax error");
                WriteToDebug(error.Message);
                return "false";
            }
        });
        return (this.initialized) ? "true" : "false";
    }
	/*******************************************************************************
	**
	** Function LMSFinish()
	** Inputs:  None
	** Return:  CMIBoolean true if successful
	**          CMIBoolean false if failed.
	**
	** Description:
	** Close communication with LMS by calling the LMSFinish
	** function which will be implemented by the LMS
	**
	*******************************************************************************/
    function _LMSFinish(val) {
        WriteToDebug("LMSFinish");
        if (val != '') {
            this.LastErrorString = "Value passed to LMSFinish, should be blank";
            this.LastError = "201";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }
        if (!this.initialized) {
            this.LastErrorString = "LMS is not initialized, call to LMSFinish ignored.";
            this.LastError = "301";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }
        // LMSInfo object carries arguments to the server and back
        var lmsInfo = JSON.stringify(createLMSInfo(this._sessionid, this._userid, this._coreid, this._scorm_course_id, this._sco_identifier));
        WriteToDebug("LMSFinish: " + JSON.stringify({ 'lmsInfo': lmsInfo }));
        var that = this; // get reference to current instance
        $.ajax({
            type: "POST",
            url: "/api/LMSFinish",
            data: lmsInfo,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: true,
            success: LMSFinish_callback,
            error: function (request, error) {
                // Ajax call failed
                that.LastError = "101"; //general exception
                that.LastErrorString = error;
                that.LastErrorDiagnostic = "AJAX error";
                WriteToDebug("Ajax error");
                WriteToDebug(error.Message);
                return "false";
            }
        });

        // AJAX callback for the LMSFinish call
        function LMSFinish_callback(response) {
            lmsInfo = response.d == null ? response : response.d; // asp.net 3.5 adds the 'd' attribute to the response object
            that.LastError = lmsInfo.errorCode;
            that.LastErrorString = lmsInfo.errorString
            that.LastError = "101";
            that.LastErrorString = "";
            that.initialized = false;
        }
        return (this.initialized) ? "true" : "false";
    }

	/*******************************************************************************
	**
	** Function LMSGetValue(name)
	** Inputs:  name - string representing the cmi data model defined category or
	**             element (e.g. cmi.core.student_id)
	** Return:  The value presently assigned by the LMS to the cmi data model
	**       element defined by the element or category identified by the name
	**       input value.
	**
	** Description:
	** Wraps the call to the LMS LMSGetValue method
	**
	*******************************************************************************/
    function _LMSGetValue(name) {
        WriteToDebug("LMSGetValue");
        if (!this.initialized) {
            this.LastErrorString = "LMS is not initialized, call to LMSGetValue ignored.";
            this.LastError = "301";
            this.LastErrorDiagnostic = "Error from API";
            return "";
        }
        var lmsInfo = JSON.stringify(createLMSInfo(this._sessionid, this._userid, this._coreid, this._scorm_course_id, this._sco_identifier, name));
        WriteToDebug("GETVALUE: " + JSON.stringify({ 'lmsInfo': lmsInfo }));

        var returnValue = '';
        var that = this; // get reference to current API instance
        $.ajax({
            type: "POST",
            url: "/api/LMSGetValue",
            data: lmsInfo,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (response) {
                lmsInfo = response;
                that.LastError = lmsInfo.errorCode;
                that.LastErrorString = lmsInfo.errorString;
                // check error code from server
                if (lmsInfo.errorCode != "0") {
                    return "false";
                }
                else {
                    returnValue = lmsInfo.returnValue;
                    return lmsInfo.returnValue;

                }
            },
            error: function (request, error) {
                // Ajax call failed
                that.LastError = "101"; //general exception
                that.LastErrorString = error;
                that.LastErrorDiagnostic = "AJAX error";
                WriteToDebug("Ajax error");
                WriteToDebug(error.Message);
                return "false";

            }
        });

        return returnValue;

    }
	/*******************************************************************************
	**
	** Function LMSSetValue(name, value)
	** Inputs:  name -string representing the data model defined category or element
	**          value -the value that the named element or category will be assigned
	** Return:  CMIBoolean true if successful
	**          CMIBoolean false if failed.
	**
	** Description:
	** Wraps the call to the LMS LMSSetValue function
	**
	*******************************************************************************/
    function _LMSSetValue(name, value) {
        if (name == "cmi.core.lesson_status" || name == "cmi.core.exit") {
            this._exit_status = value; // set this so LMSFinish knows what to do
        }
        if (!this.initialized) {
            this.LastErrorString = "LMS is not initialized, call to LMSSetValue ignored.";
            this.LastError = "301";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }
        var lmsInfo = JSON.stringify(createLMSInfo(this._sessionid, this._userid, this._coreid, this._scorm_course_id, this._sco_identifier, name, value));
        WriteToDebug("SETVALUE: " + JSON.stringify({ 'lmsInfo': lmsInfo }));
        var returnValue = '';
        var that = this; // get reference to current API instance
        $.ajax({
            type: "POST",
            url: "/api/LMSSetValue",
            data: lmsInfo,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            success: function (response) {
                lmsInfo = response;
                that.LastError = lmsInfo.errorCode;
                that.LastErrorString = lmsInfo.errorString
                // check error code from server
                if (lmsInfo.errorCode != "0") {
                    returnValue = "false;"
                    return "false";
                }
                else {
                    returnValue = lmsInfo.ReturnValue;
                    return lmsInfo.ReturnValue;
                }
            },
            error: function (request, error) {
                // Ajax call failed
                that.LastError = "101"; //general exception
                that.LastErrorString = error;
                that.LastErrorDiagnostic = "AJAX error";
                WriteToDebug("Ajax error");
                WriteToDebug(error.Message);
                return "false";
            }
        });
        return returnValue;
    }
	/*******************************************************************************
	**
	** Function LMSCommit()
	** Inputs:  None
	** Return:  None
	**
	** Description:
	** Call the LMSCommit function 
	**
	*******************************************************************************/
    function _LMSCommit(val) {
        // LMSCommit is a no-op since we commit every time.
        if (val != '') {
            this.LastErrorString = "Value passed to LMSCommit, should be blank";
            this.LastError = "201";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }
        if (!this.initialized) {
            this.LastErrorString = "LMS is not initialized, call to LMSCommit ignored.";
            this.LastError = "301";
            this.LastErrorDiagnostic = "Error from API";
            return "false";
        }
        return "true";
    }
	/*******************************************************************************
	**
	** Function LMSGetLastError()
	** Inputs:  None
	** Return:  The error code that was set by the last LMS function call
	**
	** Description:
	** Call the LMSGetLastError function 
	**
	*******************************************************************************/
    function _LMSGetLastError() {
        return this.LastError;
    }

	/*******************************************************************************
	**
	** Function LMSGetErrorString(errorCode)
	** Inputs:  errorCode - Error Code
	** Return:  The textual description that corresponds to the input error code
	**
	** Description:
	** Call the LMSGetErrorString function 
	**
	********************************************************************************/
    function _LMSGetErrorString() {
        return this.LastErrorString;
    }

	/*******************************************************************************
	**
	** Function MSGetDiagnostic()
	** Return:  The vendor specific textual description that corresponds to the 
	**          input error code
	**
	** Description:
	** Call the LMSGetDiagnostic function
	**
	*******************************************************************************/
    function _LMSGetDiagnostic() {
        return this.LastErrorDiagnostic;
    }
} // end API
/*********************************************************************************
**
** Function createLMSInfo(...)
** returns an LMSInfo object for data transfer to and from the server
 * 
*********************************************************************************/
function createLMSInfo(Sessionid, user_id, core_id, SCORM_course_id, SCO_identifier, DataItem, DataValue, ErrorCode, ErrorString, ErrorDiagnostic, ReturnValue) {
    var o = new Object();
    o.sessionId = Sessionid;
    o.userId = user_id;
    o.coreId = core_id;
    o.scoIdentifier = SCO_identifier;
    o.scormCourseId = SCORM_course_id;
    o.dataItem = DataItem;
    o.dataValue = DataValue;
    o.errorCode = ErrorCode;
    o.errorString = ErrorString;
    o.errorDiagnostic = ErrorDiagnostic;
    o.returnValue = ReturnValue;
    for (prop in o) {
        if (o[prop] == null) {
            o[prop] = "null";
        }
    }
    return o;
}
/*********************************************************************************
**
** Debug functions
**
*********************************************************************************/
function WriteToDebug(strInfo) {

    if (blnDebug) {

        var dtm = new Date();
        var strLine;

        strLine = aryDebug.length + ":" + dtm.toString() + " - " + strInfo;

        aryDebug[aryDebug.length] = strLine;

        if (winDebug && !winDebug.closed) {
            winDebug.document.body.appendChild(winDebug.document.createTextNode(strLine));
            winDebug.document.body.appendChild(winDebug.document.createElement("br"));
        }

    }
    return;
}

//public
function ShowDebugWindow() {
    var renderLog = function () {
        var i,
            len = aryDebug.length;

        winDebug.document.body.innerHTML = "";
        for (i = 0; i < len; i += 1) {
            winDebug.document.body.appendChild(winDebug.document.createTextNode(aryDebug[i]));
            winDebug.document.body.appendChild(winDebug.document.createElement("br"));
        }
    };

    if (winDebug && !winDebug.closed) {
        winDebug.close();
    }

    winDebug = window.open("/SCORM/ThinClient/blank.html", "Debug", "width=600,height=300,resizable,scrollbars");

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
function DisplayError(strMessage) {

    var blnShowDebug;

    WriteToDebug("In DisplayError, strMessage=" + strMessage);

    blnShowDebug = confirm("An error has occured:\n\n" + strMessage + "\n\nPress 'OK' to view debug information to send to technical support.");

    if (blnShowDebug) {
        ShowDebugWindow();
    }

}

