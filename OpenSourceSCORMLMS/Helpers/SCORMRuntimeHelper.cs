using Microsoft.Extensions.Logging;
using Models;
using System;
using System.Data;
using System.Text;
using System.Text.RegularExpressions;
using OpenSourceSCORMLMS.Data.ModelSCORM;

namespace OpenSourceSCORMLMS.Helpers
{
    public class SCORMRuntimeHelper
    {
        private ILogger logger { get; set; }
        private DatabaseHelper DatabaseHelper { get; set; }
        public SCORMRuntimeHelper(ILogger logger)
        {
            this.logger = logger;
            this.DatabaseHelper = new DatabaseHelper(logger);
        }

        public void Getvalue(LMSInfo o)
        {
            // arguments: sessionid, user_id, sco_identifier, DataItem
            // return: DataValue
            // (arguments are passed in the LMSInfo object)
            logger.LogInformation("GetValue", o.dataItem + ", " + o.dataValue);
            // initialize return value
            o.errorCode = "0";
            o.returnValue = "true";
            o.errorString = "";
            // get foreign key for cmi_core table
            int core_id = Convert.ToInt32(o.coreId);
            int cmi_data_id = 0;
            if (core_id < 1)
            {
                // update error object
                o.errorCode = "301";
                o.returnValue = "false";
                o.errorString = "No cmi_core record for this session";

            }
            else if (isWriteOnly(o.dataItem))
            {
                o.errorCode = "404";
                o.returnValue = "";
                o.errorString = "Element is write only";
            }
            else if ((o.dataItem.IndexOf("cmi.interactions") == 0))
            {
                //*********************************************************************
                // handle all the cmi.interactions GetValues
                //***********************************************************************
                LMSGetValueInteractions(core_id, o);

            }
            else if (o.dataItem.IndexOf("cmi.student_preference") == 0)
            {
                //***********************************************************************
                // handle all the cmi.student_preferences GetValues
                //***********************************************************************
                DatabaseHelper.LMSGetValueStudentPreferences(o); // LMSInfo object "o" contains the arguments

            }
            else if (o.dataItem.IndexOf("cmi.learner_preference") == 0)
            {
                //***********************************************************************
                // handle all the cmi.learner_preferences GetValues
                //***********************************************************************
                DatabaseHelper.GetValueStudentPreferences2004(o); // LMSInfo object "o" contains the arguments

            }
            else if (o.dataItem.IndexOf("cmi.objectives") == 0)
            {
                //***********************************************************************
                // handle all the cmi.objectives GetValues
                //***********************************************************************
                DatabaseHelper.LMSGetValueObjectives(core_id, o); // LMSInfo object "o" contains the arguments

            }
            else if (o.dataItem.IndexOf("cmi.comments_from_learner") == 0)
            {
                //***********************************************************************
                // handle all the cmi.objectives GetValues
                //***********************************************************************
                DatabaseHelper.LMSGetValueCommentsFromLearner(core_id, o); // LMSInfo object "o" contains the arguments

            }
            else if (o.dataItem.IndexOf("cmi.comments_from_lms") == 0)
            {
                //***********************************************************************
                // handle all the cmi.objectives GetValues
                //***********************************************************************
                DatabaseHelper.LMSGetValueCommentsFromLMS(core_id, o); // LMSInfo object "o" contains the arguments

            }
            else
            {   //*********************************************************************
                // This section of code handles all the cmi_core and cmi_data GetValues
                //***********************************************************************
                StringBuilder s = new StringBuilder();
                string DataItem = o.dataItem;
                switch (DataItem)
                {
                    case "cmi.core._children":
                        o.returnValue = "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,exit,session_time";
                        break;
                    case "cmi.core.score._children":
                        o.returnValue = "raw,min,max";
                        break;
                    case "cmi.learner_name":
                    case "cmi.core.student_name":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).student_name;
                        break;
                    case "cmi.learner_id":
                    case "cmi.core.student_id":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).student_id;
                        break;
                    case "cmi.core.lesson_status":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).lesson_status;
                        break;
                    case "cmi.mode":
                    case "cmi.core.lesson_mode":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).lesson_mode;
                        break;
                    case "cmi.location":
                    case "cmi.core.lesson_location":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).lesson_location;
                        break;
                    case "cmi.credit":
                    case "cmi.core.credit":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).credit;
                        break;
                    case "cmi.entry":
                    case "cmi.core.entry":
                        o.returnValue = DatabaseHelper.GetCMICoreById(core_id).entry;
                        break;
                    case "cmi.total_time":
                    case "cmi.core.total_time":
                        string totalTime = DatabaseHelper.GetCMICoreById(core_id).total_time;
                        if (string.IsNullOrEmpty(totalTime))
                        {
                            totalTime = "0000:00:00.00";
                        }
                        o.returnValue = totalTime;
                        break;
                    case "cmi.score.raw":
                    case "cmi.core.score.raw":
                        decimal? dscore_raw = DatabaseHelper.GetCMICoreById(core_id).score_raw;
                        o.returnValue = (dscore_raw.HasValue) ? dscore_raw.ToString() : "";
                        break;
                    case "cmi.score.min":
                    case "cmi.core.score.min":
                        decimal? dscore_min = DatabaseHelper.GetCMICoreById(core_id).score_min;
                        o.returnValue = (dscore_min.HasValue) ? dscore_min.ToString() : "";
                        break;
                    case "cmi.score.max":
                    case "cmi.core.score.max":
                        decimal? dscore_max = DatabaseHelper.GetCMICoreById(core_id).score_max;
                        o.returnValue = (dscore_max.HasValue) ? dscore_max.ToString() : "";
                        break;
                    case "cmi.suspend_data":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).suspend_data;
                        break;
                    case "cmi.launch_data":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).launch_data;
                        break;
                    case "cmi.comments":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).cmi_comments;
                        break;
                    case "cmi.comments_from_lms":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).cmi_comments_from_lms;
                        break;
                    case "cmi.student_data._children":
                        o.returnValue = "mastery_score,max_time_allowed,time_limit_action";
                        break;
                    case "cmi.student_data.mastery_score":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        decimal? dmastery_score = DatabaseHelper.GetCMIDataByID(cmi_data_id).mastery_score;
                        o.returnValue = (dmastery_score.HasValue) ? dmastery_score.ToString() : "";
                        break;
                    case "cmi.student_data.max_time_allowed":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).max_time_allowed;
                        break;
                    case "cmi.student_data.time_limit_action":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = DatabaseHelper.GetCMIDataByID(cmi_data_id).time_limit_action;
                        break;
                    //
                    // values added for SCORM 2004
                    //
                    case "cmi.score.scaled":
                        decimal? dscore_scaled = DatabaseHelper.GetCMICoreById(core_id).score_scaled;
                        o.returnValue = (dscore_scaled.HasValue) ? dscore_scaled.ToString() : "";

                        break;
                    case "cmi.success_status":
                        string success_status = DatabaseHelper.GetCMICoreById(core_id).success_status;
                        if (string.IsNullOrEmpty(success_status))
                        {
                            success_status = "unknown";
                        }
                        o.returnValue = success_status;
                        break;
                    case "cmi.completion_status":
                        string completion_status = DatabaseHelper.GetCMICoreById(core_id).completion_status;
                        if (string.IsNullOrEmpty(completion_status))
                        {
                            completion_status = "unknown";
                        }
                        o.returnValue = completion_status;
                        break;
                    //
                    // values changed for SCORM 2004
                    //
                    case "cmi.score._children":
                        o.returnValue = "raw,min,max,scaled";
                        break;
                    case "cmi.exit":
                        o.returnValue = "";
                        o.errorCode = "405";
                        o.errorString = "Data Model Element Is Write Only";
                        break;
                    case "cmi.scaled_passing_score":
                        decimal? dpassing_score = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        o.returnValue = (dpassing_score.HasValue) ? dpassing_score.ToString() : "";
                        break;
                    case "cmi.max_time_allowed":
                        cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        string max_time_allowed = DatabaseHelper.GetCMIDataByID(cmi_data_id).max_time_allowed;
                        if (string.IsNullOrEmpty(max_time_allowed))
                        {
                            max_time_allowed = "PT0H0M0S";
                        }
                        o.returnValue = max_time_allowed;
                        break;
                    default:
                        // if it got here it wasn't a legal value.
                        // check for some popular errors
                        if (DataItem.IndexOf("_count") >= 0)
                        {
                            //
                            o.errorCode = "203";
                            o.errorString = "Element not an array - Cannot have count";
                            o.returnValue = "";
                        }
                        else if (DataItem.IndexOf("_children") >= 0)
                        {
                            o.errorCode = "202";
                            o.errorString = "Element cannot have children";
                            o.returnValue = "";
                        }
                        else
                        {
                            o.returnValue = "";
                            o.errorCode = "201";
                            o.errorString = "Invalid argument error";
                        }
                        break;
                }

            }
            logger.LogInformation("Returning from Getvalue for ", o.dataItem);
            logger.LogInformation("Returning from Getvalue, ErrorCode ", o.errorCode);
            logger.LogInformation("Returning from Getvalue, ErrorString  ", o.errorString);
            logger.LogInformation("Returning from Getvalue, returnValue is ", o.returnValue);
        }
        // Helper function for LMSGetvalue
        // Returns value for all Interactions requests
        // the LMSInfo object contains all data passed in and returned
        private void LMSGetValueInteractions(int core_id, LMSInfo o)
        {
            string version = DatabaseHelper.GetVersion(Convert.ToInt32(o.scormCourseId));
            if (version == "1.3")
            {
                GetValueInteractions2004(core_id, o);
                return;
            }
            StringBuilder s = new StringBuilder();
            if (o.dataItem == "cmi.interactions._children")
            {
                o.returnValue = "id,objectives,time,type,correct_responses,weighting,student_response,result,latency";
                return;
            }
            if (o.dataItem == "cmi.interactions._children")
            {
                o.returnValue = "id,objectives,time,type,correct_responses,weighting,student_response,result,latency";
                return;
            }
            if (o.dataItem == "cmi.interactions._count")
            {
                o.returnValue = DatabaseHelper.getCountInteractionsByCoreID(core_id).ToString();
                return;
            }
            // its one of the types with "n". See if its one of the types
            // "time,type,weighting,student_response, or result"
            string sInteraction = "", sSubInteraction = "", sSubSubInteraction = "";
            string DataItem = o.dataItem;
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter, 6);
            string sIndex = sDataItem[2]; // get "n" from the string
            sInteraction = sDataItem[3]; // get type of interaction from the string
            if (isWriteOnly(sInteraction))
            {
                o.errorCode = "404";
                o.errorString = "element is write only";
                o.returnValue = "";
                return;
            }
            if (sDataItem.Length >= 5)
            {
                sSubInteraction = sDataItem[4];
                if (isWriteOnly(sSubInteraction))
                {
                    o.errorCode = "404";
                    o.errorString = "element is write only";
                    o.returnValue = "";
                    return;
                }
            }
            if (sDataItem.Length >= 6)
            {
                sSubSubInteraction = sDataItem[5];
                o.errorCode = "404";
                o.errorString = "element is write only";
                o.returnValue = "";
                return;
            }
            int n;
            if (int.TryParse(sIndex, out n)) // purpose of this is to guarantee that "n" is an integer
            {
                if (sInteraction.ToLower() == "correct_responses" && sSubInteraction == "_count")
                {
                    int cmi_interactions_id = DatabaseHelper.GetInteractionsID(core_id, n, false);
                    o.returnValue = DatabaseHelper.GetCountInteractionsCorrectResponsesByInteractionsID(cmi_interactions_id).ToString();
                }
                else if (sInteraction.ToLower() == "objectives" && sSubInteraction == "_count")
                {
                    int cmi_interactions_id = DatabaseHelper.GetInteractionsID(core_id, n, false);
                    o.returnValue = DatabaseHelper.GetCountInteractionsObjectivesByInteractionsID(cmi_interactions_id).ToString();
                }
                else if (isWriteOnly(sInteraction.ToLower()) || isWriteOnly(sSubInteraction.ToLower()) || isWriteOnly(sSubSubInteraction.ToLower()))
                {
                    o.errorCode = "404";
                    o.errorString = "element is write only";
                    o.returnValue = "";
                }
            }
            else
            {
                o.errorCode = "405";
                o.errorString = "incorrect datatype";
                o.returnValue = "";
            }

        }
        // Helper function for LMSGetvalue
        // Returns value for all Interactions requests for SCORM2004
        // the LMSInfo object contains all data passed in and returned
        private void GetValueInteractions2004(int core_id, LMSInfo o)
        {

            StringBuilder s = new StringBuilder();
            if (o.dataItem == "cmi.interactions._children")
            {
                o.returnValue = "id,objectives,time,type,correct_responses,weighting,learner_response,result,latency, description,timestamp";
                return;
            }

            if (o.dataItem == "cmi.interactions._count")
            {
                int iCount = DatabaseHelper.getCountInteractionsByCoreID(core_id);
                o.returnValue = iCount.ToString();
                return;
            }
            // its one of the types with "n". See if its one of the types
            // "type, weighting, learner_response, result, latency, [timestamp],description "
            string sInteraction = "", sSubInteraction = "", sSubSubInteraction = "";
            string DataItem = o.dataItem;
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter, 6);
            string sIndex = sDataItem[2]; // get "n" from the string
            sInteraction = sDataItem[3]; // get type of interaction from the string
            if (sDataItem.Length >= 5)
            {
                sSubInteraction = sDataItem[4];
            }

            int n;

            if (ConvertToInt(sIndex, out n)) // purpose of this is to guarantee that "n" is an integer
            {
                int cmi_interactions_id = DatabaseHelper.GetInteractionsID(core_id, n, false);
                if (sInteraction.ToLower() == "correct_responses" && sSubInteraction == "_count")
                {
                    int ii = DatabaseHelper.GetCountInteractionsCorrectResponsesByInteractionsID(cmi_interactions_id);
                    o.returnValue = ii.ToString();
                    return;
                }
                else if (sInteraction.ToLower() == "objectives" && sSubInteraction == "_count")
                {
                    int ii = DatabaseHelper.GetCountInteractionsObjectivesByInteractionsID(cmi_interactions_id);
                    o.returnValue = ii.ToString();
                    return;
                }
                cmi_interactions interactions = DatabaseHelper.GetInteractionsByInteractionsID(cmi_interactions_id);
                if (interactions != null)
                {
                    if (sInteraction.ToLower() == "type")
                    {
                        o.returnValue = interactions.type;
                        return;
                    }
                    else if (sInteraction.ToLower() == "weighting")
                    {
                        o.returnValue = interactions.weighting;
                        return;
                    }
                    else if (sInteraction.ToLower() == "learner_response")
                    {
                        o.returnValue = interactions.student_response;
                        return;
                    }
                    else if (sInteraction.ToLower() == "result")
                    {
                        o.returnValue = interactions.result;
                        return;
                    }
                    else if (sInteraction.ToLower() == "latency")
                    {
                        o.returnValue = interactions.latency;
                        return;
                    }
                    else if (sInteraction.ToLower() == "timestamp")
                    {
                        o.returnValue = interactions.timestamp;
                        return;
                    }
                    else if (sInteraction.ToLower() == "description")
                    {
                        o.returnValue = interactions.description;
                        return;
                    }

                }
                if (sDataItem.Length >= 5)
                {
                    sSubInteraction = sDataItem[4];
                    if (isWriteOnly(sSubInteraction))
                    {
                        o.errorCode = "404";
                        o.errorString = "element is write only";
                        o.returnValue = "";
                        return;
                    }
                }
                if (sDataItem.Length >= 6)
                {
                    sSubSubInteraction = sDataItem[5];
                    o.errorCode = "404";
                    o.errorString = "element is write only";
                    o.returnValue = "";
                    return;
                }
            }
            else
            {
                o.errorCode = "405";
                o.errorString = "incorrect datatype";
                o.returnValue = "";
            }

        }
        public void Setvalue(LMSInfo o)
        {
            logger.LogInformation("SetValue", o.dataItem + ", " + o.dataValue);
            // arguments: user_id, sco_identifier, DataItem, DataValue
            // (arguments are passed in the LMSInfo object)
            string ReturnValue = "true";
            string DataItem = o.dataItem;
            string DataValue = o.dataValue;
            // Fix 6/20/2018 Echelon modules are sending "NaN" for null data values
            if (DataValue == "NaN")
            {
                DataValue = "";
            }
            // initialize return object

            o.errorCode = "0";
            o.returnValue = "true";
            o.errorString = "";
            // get foreign key for cmi_core table
            int core_id = Convert.ToInt32(o.coreId);
            if (core_id < 1)
            {
                // update error object
                o.errorCode = "301";
                o.returnValue = "false";
                o.errorString = "No cmi_core record for this session";
            }
            // check to see if they are asking to set one of the Keyword values
            else if (isReadOnly(DataItem))
            {
                o.errorCode = "403";
                o.returnValue = "false";
                o.errorString = "Element is read only";
            }
            // check to see if they are asking to set one of the ReadOnly values
            else if (isKeyword(DataItem))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid Set Value, element is a keyword";
            }
            else
            {
                if (DataItem.IndexOf("cmi.core") == 0)
                {
                    switch (DataItem)
                    {
                        case "cmi.core.exit":
                            if (isCMIVocabulary("exit", DataValue))
                            {
                                DatabaseHelper.SetValueCore(core_id, "[exit]", o.dataValue);
                            }
                            else
                            {
                                o.errorCode = "405";
                                o.returnValue = "false";
                                o.errorString = "Incorrect DataType";
                            }
                            break;
                        case "cmi.core.session_time":
                            if (isCMITimespan(DataValue))
                            {
                                DatabaseHelper.SetValueCore(core_id, "session_time", o.dataValue);
                            }
                            else
                            {
                                o.errorCode = "405";
                                o.returnValue = "false";
                                o.errorString = "Incorrect DataType";
                            }
                            break;
                        case "cmi.core.score.raw":
                            if (DataValue != "") // blank is valid but we don't do an update
                            {
                                if (isCMIDecimalPositive(DataValue))
                                {
                                    DatabaseHelper.SetValueCore(core_id, "score_raw", o.dataValue);
                                    DatabaseHelper.UpdateUserModuleScore(o.userId, Convert.ToInt32(o.scormCourseId), Convert.ToDecimal(DataValue));
                                }
                                else
                                {
                                    o.errorCode = "405";
                                    o.returnValue = "false";
                                    o.errorString = "Incorrect DataType";
                                }
                            }
                            break;
                        case "cmi.core.score.max":
                            if (DataValue != "") // blank is valid but we don't do an update
                            {
                                if (isCMIDecimalPositive(DataValue))
                                {
                                    DatabaseHelper.SetValueCore(core_id, "score_max", o.dataValue);
                                }
                                else
                                {
                                    o.errorCode = "405";
                                    o.returnValue = "false";
                                    o.errorString = "Incorrect DataType";
                                }
                            }
                            break;
                        case "cmi.core.score.min":
                            if (DataValue != "") // blank is valid but we don't do an update
                            {
                                if (isCMIDecimalPositive(DataValue))
                                {
                                    DatabaseHelper.SetValueCore(core_id, "score_min", o.dataValue);
                                }
                                else
                                {
                                    o.errorCode = "405";
                                    o.returnValue = "false";
                                    o.errorString = "Incorrect DataType";
                                }
                            }
                            break;
                        case "cmi.core.lesson_status":
                            if (isCMIVocabulary("status", DataValue) && DataValue.ToLower() != "not attempted")
                            {
                                DatabaseHelper.SetValueCore(core_id, "lesson_status", o.dataValue);
                                if (DataValue.ToLower() == "completed")
                                {
                                    DatabaseHelper.UpdateUserModuleDateCompleted(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);

                                } else if (DataValue.ToLower() == "passed")
                                {
                                    DatabaseHelper.UpdateUserModulePassed(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);
                                }
                            }
                            else
                            {
                                o.errorCode = "405";
                                o.returnValue = "false";
                                o.errorString = "Incorrect DataType";
                            }
                            break;
                        case "cmi.core.lesson_location":
                            if (isCMIString255(DataValue))
                            {
                                DatabaseHelper.SetValueCore(core_id, "lesson_location", o.dataValue);
                            }
                            else
                            {
                                o.errorCode = "405";
                                o.returnValue = "false";
                                o.errorString = "Incorrect DataType";
                            }
                            break;

                        default:
                            o.errorCode = "201";
                            o.returnValue = "false";
                            o.errorString = "Invalid argument error";
                            break;
                    }
                }  // end of core
                else if (DataItem.IndexOf("cmi.interactions") == 0)
                {
                    SetValueInteractions(core_id, o);
                }
                else if (DataItem == "cmi.suspend_data")
                {
                    if (isCMIString4096(o.dataValue))
                    {
                        int cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        DatabaseHelper.SetValueSuspendData(cmi_data_id, DataItem);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else if (DataItem == "cmi.comments")
                {
                    if (isCMIString4096(o.dataValue))
                    {
                        int cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId, o.scoIdentifier, o.scormCourseId);
                        StringBuilder cmi_comments = new StringBuilder("");
                        string comment = DatabaseHelper.GetCommentsFromCMIData(cmi_data_id);
                        cmi_comments.Append(comment);
                        if (cmi_comments.Length > 0)
                        {
                            cmi_comments.Append(" ");
                        }
                        cmi_comments.Append(o.dataValue);


                        DatabaseHelper.SetValueComments(cmi_data_id, cmi_comments.ToString());
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else if (DataItem.IndexOf("cmi.student_preference") == 0)
                {
                    SetValueStudentPreference(o); // the LMSInfo object contains all arguments, and will return error codes
                }
                else if (DataItem.IndexOf("cmi.learner_preference") == 0)
                {
                    SetValueStudentPreference2004(o); // the LMSInfo object contains all arguments, and will return error codes
                }
                else if (DataItem.IndexOf("cmi.objectives") == 0)
                {
                    SetValueObjectives(core_id, o); // the LMSInfo object contains all arguments, and will return error codes
                    ReturnValue = o.returnValue;
                }
                /******************************************
                 *  new for SCORM2004
                 * ***************************************/
                else if (DataItem.IndexOf("cmi.scaled_passing_score") == 0)
                {
                    o.errorCode = "404";
                    o.returnValue = "false";
                    o.errorString = "Data Model Element is Read Only";
                }
                else if (DataItem.IndexOf("cmi.max_time_allowed") == 0)
                {
                    o.errorCode = "404";
                    o.returnValue = "false";
                    o.errorString = "Data Model Element is Read Only";
                }

                else if (DataItem.IndexOf("cmi.comments_from_lms") == 0)
                {
                    o.errorCode = "404";
                    o.returnValue = "false";
                    o.errorString = "Data Model Element is Read Only";
                }
                else if (DataItem.IndexOf("cmi.comments_from_learner") == 0)
                {
                    SetValueCommentsFromLearner(core_id, o); // the LMSInfo object contains all arguments, and will return error codes
                    ReturnValue = o.returnValue;
                }
                //***********************************************************************************
                // fields added for SCORM 2004
                //***********************************************************************************
                else if (DataItem.IndexOf("cmi.score.scaled") == 0)
                {
                    if (DataValue != "") // blank is valid but we don't do an update
                    {
                        if (isCMIDecimalPositive(DataValue))
                        {
                            DatabaseHelper.SetValueCore(core_id, "score_scaled", o.dataValue);
                        }
                        else
                        {
                            o.errorCode = "405";
                            o.returnValue = "false";
                            o.errorString = "Incorrect DataType";
                        }
                    }
                }
                // NOTE for the new success_status and completion_status fields,
                // we also update lesson_status for backward compatibility
                else if (DataItem.IndexOf("cmi.success_status") == 0)
                {
                    if (isCMIVocabulary("status", DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "success_status", o.dataValue);
                        DatabaseHelper.SetValueCore(core_id, "lesson_status", o.dataValue);
                        if (DataValue.ToLower() == "completed")
                        {
                            DatabaseHelper.UpdateUserModuleDateCompleted(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);

                        }
                        else if (DataValue.ToLower() == "passed")
                        {
                            DatabaseHelper.UpdateUserModulePassed(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);
                        }

                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else if (DataItem.IndexOf("cmi.completion_status") == 0)
                {
                    if (isCMIVocabulary("status", DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "completion_status", o.dataValue);
                        DatabaseHelper.SetValueCore(core_id, "lesson_status", o.dataValue);
                        if (DataValue.ToLower() == "completed")
                        {
                            DatabaseHelper.UpdateUserModuleDateCompleted(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);

                        }
                        else if (DataValue.ToLower() == "passed")
                        {
                            DatabaseHelper.UpdateUserModulePassed(o.userId, Convert.ToInt32(o.scormCourseId), DateTime.Now);
                        }
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                //**********************************************
                // core values whose name changed for SCORM2004
                //**********************************************
                else if (DataItem.IndexOf("cmi.location") == 0)
                {
                    if (isCMIString1000(DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "lesson_location", o.dataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else if (DataItem.IndexOf("cmi.score.raw") == 0)
                {
                    if (DataValue != "") // blank is valid but we don't do an update
                    {
                        if (isCMIDecimalPositive(DataValue))
                        {
                            DatabaseHelper.SetValueCore(core_id, "score_raw", o.dataValue);
                        }
                        else
                        {
                            o.errorCode = "405";
                            o.returnValue = "false";
                            o.errorString = "Incorrect DataType";
                        }
                    }
                }
                else if (DataItem.IndexOf("cmi.score.max") == 0)
                {
                    if (DataValue != "") // blank is valid but we don't do an update
                    {
                        if (isCMIDecimalPositive(DataValue))
                        {
                            DatabaseHelper.SetValueCore(core_id, "score_max", o.dataValue);
                        }
                        else
                        {
                            o.errorCode = "405";
                            o.returnValue = "false";
                            o.errorString = "Incorrect DataType";
                        }
                    }
                }
                else if (DataItem.IndexOf("cmi.score.min") == 0)
                {
                    if (DataValue != "") // blank is valid but we don't do an update
                    {
                        if (isCMIDecimalPositive(DataValue))
                        {
                            DatabaseHelper.SetValueCore(core_id, "score_min", o.dataValue);
                        }
                        else
                        {
                            o.errorCode = "405";
                            o.returnValue = "false";
                            o.errorString = "Incorrect DataType";
                        }
                    }
                }
                else if (DataItem.IndexOf("cmi.total_time") == 0)
                {
                    if (isCMITimeInterval(DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "total_time", o.dataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else if (DataItem.IndexOf("cmi.session_time") == 0)
                {
                    if (isCMITimeInterval(DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "session_time", o.dataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }

                else if (DataItem.IndexOf("cmi.mode") == 0)
                {
                    o.errorCode = "404";
                    o.returnValue = "false";
                    o.errorString = "Element is write only";
                }

                else if (DataItem.IndexOf("cmi.exit") == 0)
                {
                    if (isCMIVocabulary("exit", DataValue))
                    {
                        DatabaseHelper.SetValueCore(core_id, "[exit]", o.dataValue);          
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                }
                else
                {
                    ReturnValue = "401"; //not implemented
                }
                o.returnValue = ReturnValue;


            }
            logger.LogInformation("Returning from Setvalue for ", o.dataItem);
            logger.LogInformation("Returning from Setvalue, ErrorCode ", o.errorCode);
            logger.LogInformation("Returning from Setvalue, ErrorString  ", o.errorString);
            logger.LogInformation("Returning from Setvalue, returnValue is ", o.returnValue);
        }
        private void SetValueStudentPreference(LMSInfo o)
        {
            // set student preference:
            // 1. If there's no preference record, insert one
            // 2. Find out what value they want to set
            // 3. Do the update
            int student_preferences_id = DatabaseHelper.GetStudentPreferenceID(Convert.ToInt32(o.userId));
            StringBuilder s = new StringBuilder();
            string DataValue = o.dataValue;
            string DataItem = o.dataItem;
            switch (DataItem.ToLower())
            {
                case "cmi.student_preference.audio":
                    if (isRangeValid(o.dataValue, -1, 100))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "audio", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.student_preference.language":
                    if (isCMIString255(o.dataValue))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "[language]", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.student_preference.speed":
                    if (isRangeValid(o.dataValue, -100, 100))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "speed", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.student_preference.text":
                    if (isRangeValid(o.dataValue, -1, 1))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "[text]", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                default:
                    o.errorCode = "401";
                    o.returnValue = "false";
                    o.errorString = "Not Implemented";
                    break;
            }
        }
        private  void SetValueStudentPreference2004(LMSInfo o)
        {
            // set student preference:
            // 1. If there's no preference record, insert one
            // 2. Find out what value they want to set
            // 3. Do the update
            int student_preferences_id = DatabaseHelper.GetStudentPreferenceID(Convert.ToInt32(o.userId));
            StringBuilder s = new StringBuilder();
            string DataValue = o.dataValue;
            string DataItem = o.dataItem;
            switch (DataItem.ToLower())
            {
                case "cmi.learner_preference.audio_level":
                    if (isRangeValid(o.dataValue, -1, 100000))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "audio", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.learner_preference.language":
                    if (isCMIString255(o.dataValue))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "[language]", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.learner_preference.delivery_speed":
                    if (isRangeValid(o.dataValue, 0, 10000))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "speed", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "cmi.learner_preference.audio_captioning":
                    if (isRangeValid(o.dataValue, -1, 1))
                    {
                        DatabaseHelper.SetValueStudentPreference(student_preferences_id, "audio_captioning", DataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                default:
                    o.errorCode = "401";
                    o.returnValue = "false";
                    o.errorString = "Not Implemented";
                    break;
            }
        }

        private void SetValueObjectives(int core_id, LMSInfo o)
        {
            StringBuilder s = new StringBuilder();
            if ((o.dataItem.IndexOf("_count") >= 0) || (o.dataItem.IndexOf("_children") >= 0))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid set value, element is a keyword";
                return;
            }
            // first, set up a row for this objective if it doesn't exist
            string DataItem = o.dataItem;
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter, 6);
            string sIndex = sDataItem[2]; // get "n" from the string
            string sDataitem = sDataItem[3]; // get type of objective from the string
            string sDatasubitem = "";
            if (sDataitem.ToLower() == "score")
            {
                sDatasubitem = sDataItem[4].ToLower();
            }
            int n;
            if (!int.TryParse(sIndex, out n))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid set value, element is a keyword";
                return;
            }
            int objective_id = DatabaseHelper.GetObjectiveID(core_id, n);
            if (objective_id == -1)
            {
                o.errorString = "Invalid argument error";
                o.errorCode = "201";
                o.errorDiagnostic = "n refers to non-existent objective";
                o.returnValue = "false";
            }
            switch (sDataitem.ToLower())
            {
                case "id":
                    if (isCMIIdentifier(o.dataValue))
                    {
                        DatabaseHelper.SetValueObjectives(objective_id, "n_id", o.dataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "status":
                    if (isCMIVocabulary("status", o.dataValue))
                    {
                        DatabaseHelper.SetValueObjectives(objective_id, "status", o.dataValue);
                    }
                    else
                    {
                        o.errorCode = "405";
                        o.returnValue = "false";
                        o.errorString = "Incorrect DataType";
                    }
                    break;
                case "score":
                    if (o.dataValue == "" || isCMIDecimalPositive(o.dataValue))
                    {
                        string scoreValue = o.dataValue;
                        if (scoreValue == "") // blank is a legal value for score, so let's substitue null
                        {
                            scoreValue = "null";
                        }
                        // switch on type of score they want to set
                        switch (sDatasubitem)
                        {
                            case "raw":
                                DatabaseHelper.SetValueObjectives(objective_id, "score_raw", o.dataValue);
                                break;
                            case "min":
                                DatabaseHelper.SetValueObjectives(objective_id, "score_min", o.dataValue);
                                break;
                            case "max":
                                DatabaseHelper.SetValueObjectives(objective_id, "score_max", o.dataValue);
                                break;
                            default:
                                o.errorString = "Invalid set value, element is a keyword";
                                o.errorCode = "402";
                                o.returnValue = "false";
                                break;
                        } // end switch for score 
                    }
                    else
                    {  // bad data for score - not decimal, or negative
                        o.errorString = "Bad value for score";
                        o.errorCode = "405";
                        o.returnValue = "false";
                    }
                    break;
                default:
                    o.errorString = "Bad value for objectives";
                    o.errorCode = "405";
                    o.returnValue = "false";
                    break;
            } // end switch for objective

        }
        private void SetValueCommentsFromLearner(int core_id, LMSInfo o)
        {
            StringBuilder s = new StringBuilder();

            string DataItem = o.dataItem;
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter, 6);
            string sIndex = sDataItem[2]; // get "n" from the string
            string sDataitem = sDataItem[3]; // get dataitem from the string

            int n;
            if (!ConvertToInt(sIndex, out n))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid set value, element is a keyword";
                return;
            }
            int comment_id = DatabaseHelper.GetCommentsFromLearnerID(core_id, n, true);
            if (comment_id == -1)
            {
                o.errorString = "Invalid argument error";
                o.errorCode = "201";
                o.errorDiagnostic = "n refers to non-existent comment";
                o.returnValue = "false";
            }
            switch (sDataitem.ToLower())
            {
                case "comment":
                    DatabaseHelper.SetValueCommentsFromLearner(comment_id, "comment", o.dataValue);
                    break;
                case "location":
                    DatabaseHelper.SetValueCommentsFromLearner(comment_id, "location", o.dataValue);
                    break;
                case "timestamp":
                    if (isCMITime(o.dataValue))
                    {
                        DatabaseHelper.SetValueCommentsFromLearner(comment_id, "timestamp", o.dataValue);
                    }
                    else
                    {
                        o.errorString = "Incorrect DataType";
                        o.errorCode = "405";
                        o.returnValue = "false";
                    }
                    break;
                default:
                    o.errorString = "Bad value for comment from learner";
                    o.errorCode = "405";
                    o.returnValue = "false";
                    break;
            } // end switch for objective

        }
        // update interactions. All info is passed in the LMSInfo object
        private void SetValueInteractions(int core_id, LMSInfo o)
        {
            // interactions always have an index ("n" in the documentation). They'll be like
            // cmi.interactions.0.id
            // cmi.interactions.0.type
            // cmi.interactions.0.correct_responses
            // cmi.interactions.0.student_responses
            // cmi_interactions.0.result
            // cmi_interactions.0.objectives.0.id
            // FIRST, get the index "n"
            if ((o.dataItem.IndexOf("_count") >= 0) || (o.dataItem.IndexOf("_children") >= 0))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid set value, element is a keyword";
                return;
            }
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = o.dataItem.Split(delimiter, 6);
            string sIndex = sDataItem[2]; // get "n" from the string
            string sInteraction = sDataItem[3]; // get type of interaction from the string
                                                // guard against bad data. Use Double.TryParse to test for integer
            int n;
            if (!int.TryParse(sIndex, out n))
            {
                o.errorCode = "402";
                o.returnValue = "false";
                o.errorString = "Invalid set value, element is a keyword";
                return;
            }
            int cmi_interactions_id = DatabaseHelper.GetInteractionsID(core_id, n, true);
            if (cmi_interactions_id == -1)
            {
                // -1 error means they supplied a value for "n" out of sequence
                o.errorCode = "201";
                o.returnValue = "false";
                o.errorString = "Invalid argument error";
                return;
            }
            if (sInteraction == "_count")
            {
                o.errorCode = "403";
                o.returnValue = "false";
                o.errorString = "Element is read only";
                return;
            }
            if (sInteraction == "id")
            {
                if (isCMIIdentifier(o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "n_id", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }
            }
            else if (sInteraction == "type")
            {
                if (isCMIVocabulary("interaction", o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "[type]", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }

            }
            else if (sInteraction == "student_response")
            {
                DatabaseHelper.SetValueInteractions(cmi_interactions_id, "student_response", o.dataValue);
            }
            else if (sInteraction == "result")
            {
                // "result" can either be a valid vocabulary OR a valid decimal
                if (isResultValid(o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "result", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }
            }
            else if (sInteraction == "time")
            {
                if (isCMITime(o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "interaction_time", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }

            }
            else if (sInteraction == "weighting")
            {
                if (isCMIDecimal(o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "weighting", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }
            }
            else if (sInteraction == "latency")
            {
                if (isCMITimespan(o.dataValue))
                {
                    DatabaseHelper.SetValueInteractions(cmi_interactions_id, "latency", o.dataValue);
                }
                else
                {
                    o.errorString = "Incorrect DataType";
                    o.errorCode = "405";
                    o.returnValue = "false";
                }
            }
            else if (sInteraction == "correct_responses")
            {
                // this one involves inserting into the cmi_interactions_correct_responses table
                // because some idiot decided there could be more than one row for this
                // even though the "pattern" field supports multiple responses
                // check for this goofy error because the test suite does this: cmi_interactions.n.correct_responses._count
                // they want error 402 rather than 403(readonly)
                if (sDataItem.Length == 6)  // avoid index out of range errors
                {
                    if (sDataItem[5] == "pattern") // example: cmi.interactions.3.correct_responses.0.pattern, b
                    {
                        string pattern = o.dataValue;
                        string sn = sDataItem[4];
                        int nn;
                        if (!int.TryParse(sn, out nn))
                        {
                            o.errorCode = "402";
                            o.returnValue = "false";
                            o.errorString = "Invalid set value, element is a keyword";
                            return;
                        }
                        // validate that "n" is the next sequential number
                        // Note 12/1/2004 this causes an error if the user resubmits the page
                        // because the sequence they are submitting will already be there.
                        // I say, screw this error
 
                        // get "type" so we can validate the pattern
                        string type = DatabaseHelper.GetInteractionType(cmi_interactions_id);
                        if (isInteractionPatternValid(type, o.dataValue))
                        {
                            // if row already exists we just update it.
                            // this prevents errors on resubmits of the test
                            int cmi_interactions_correct_responses_id = DatabaseHelper.GetInteractionsCorrectResponses(cmi_interactions_id, nn, true);
                            DatabaseHelper.SetValueInteractionsCorrectResponses(cmi_interactions_correct_responses_id, pattern);
                        }
                        else
                        {
                            o.errorString = "Incorrect DataType";
                            o.errorCode = "405";
                            o.returnValue = "false";
                        }
                    }
                }
            }
            else if (sInteraction == "objectives")
            {
                // this one involves inserting into the cmi_interactions_objectives table
                // DataItem is like "cmi.interactions.0.objectives.0.id"
                // DataValue is like "A01";
                if (sDataItem.Length == 6)  // avoid index out of range errors
                {
                    if (sDataItem[5] == "id")
                    {
                        string objectives_id = o.dataValue; // this points to the identifier in the cmi_objectives tables
                        if (isCMIIdentifier(objectives_id))
                        {
                            string sn1 = sDataItem[4]; // this is "n"
                            int nn1, interaction_nn1;
                            if (!int.TryParse(sn1, out nn1))
                            {
                                o.errorCode = "402";
                                o.returnValue = "false";
                                o.errorString = "Invalid set value, element is a keyword";
                                return;
                            }
                            string sn2 = sDataItem[2]; // this is "interaction_n"
                            if (!int.TryParse(sn2, out interaction_nn1))
                            {
                                o.errorCode = "402";
                                o.returnValue = "false";
                                o.errorString = "Invalid set value, element is a keyword";
                                return;
                            }
                            DatabaseHelper.SetValueInteractionsObjections(interaction_nn1, nn1, objectives_id, cmi_interactions_id);
                        }
                        else
                        {
                            o.errorString = "Incorrect DataType";
                            o.errorCode = "405";
                            o.returnValue = "false";
                        }
                    }
                }
            }
        }
       
        //*************************************************************************************************************************************************
        // Data Validation Helper Routines
        //*************************************************************************************************************************************************

        public bool isCMIString255(string DataValue)
        {
            if (DataValue.Length > 255)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public bool isCMIString4096(string DataValue)
        {
            if (DataValue.Length > 4096)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public bool isCMIString1000(string DataValue)
        {
            if (DataValue.Length > 1000)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        public bool isCMIDecimal(string DataValue)
        {
            try
            {
                decimal d = Convert.ToDecimal(DataValue);
                return true;
            }
            catch
            {
                return false;
            }
        }
        public bool isCMIDecimalPositive(string DataValue)
        {
            try
            {
                decimal d = Convert.ToDecimal(DataValue);
                if (d >= 0)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }
        public bool isInteger(string DataValue)
        {
            double nn;
            if (Double.TryParse(DataValue, System.Globalization.NumberStyles.Integer, null, out nn))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public bool isCMIInteger(string DataValue)
        {
            double nn;
            if (Double.TryParse(DataValue, System.Globalization.NumberStyles.Integer, null, out nn))
            {
                int n = Convert.ToInt32(nn);
                if (n >= 0 && n <= 65536)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }
        public bool isCMISInteger(string DataValue)
        {
            double nn;
            if (Double.TryParse(DataValue, System.Globalization.NumberStyles.Integer, null, out nn))
            {
                int n = Convert.ToInt32(nn);

                if (n >= -32768 && n <= 32768)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }
        // CMITime is like HH:MM:SS.SS
        public bool isCMITime(string DataValue)
        {
            if (DataValue.Length > 11) return false;
            string delimStr = ":";
            char[] delimiter = delimStr.ToCharArray();
            string[] s = DataValue.Split(delimiter, 3);
            if (s.Length != 3) return false;
            string hours = s[0];
            string mins = s[1];
            string secs = s[2];
            if (!this.isCMIInteger(hours)) return false;
            if (!this.isCMIInteger(mins)) return false;
            if (!this.isCMIDecimal(secs)) return false;
            int iHours = Convert.ToInt32(hours);
            if (iHours < 0 || iHours > 23) return false;
            int iMins = Convert.ToInt32(mins);
            if (iMins < 0 || iMins > 59) return false;
            decimal dSecs = Convert.ToDecimal(secs);
            if (dSecs < 0 || dSecs > Convert.ToDecimal("59.99")) return false;
            return true;
        }
        public bool isCMITimespan(string DataValue)
        {
            // CMITimeSpan is like "HHHH:MM:SS.SS";
            if (DataValue.Length > 13) return false;
            string delimStr = ":";
            char[] delimiter = delimStr.ToCharArray();
            string[] s = DataValue.Split(delimiter, 3);
            if (s.Length != 3) return false;
            string hours = s[0];
            string mins = s[1];
            string secs = s[2];
            if (hours.Length < 2 || hours.Length > 4) return false; // looking for two digits for hours
            if (mins.Length != 2) return false; // looking for two digits for minutes
            if (secs.IndexOf(".") == 0 || secs.IndexOf(".") == 1) return false; // looking for two digits before the decimal point, if there is one
            if (!this.isCMIInteger(hours)) return false;
            if (!this.isCMIInteger(mins)) return false;
            if (!this.isCMIDecimal(secs)) return false;
            //int iHours = Convert.ToInt32(hours);
            //if (iHours < 0 || iHours > 23) return false;
            int iMins = Convert.ToInt32(mins);
            if (iMins < 0 || iMins > 99) return false;
            decimal dSecs = Convert.ToDecimal(secs);
            if (dSecs < 0 || dSecs > Convert.ToDecimal("59.99")) return false;
            return true;

        }
        //  SCORM2004
        public bool isCMITimeInterval(string DataValue)
        {
            // CMITimeInterval is like "PT3H5M2S" which is 3 hours, 5 minutes, 2 seconds;
            // it starts with P
            // if year/month/day duraction is present, it is like P1Y3M2D which is 1 Year, 3 months, 2 days
            // so altogether it might be P1Y3M2DT3H5M2S

            string s = DataValue;
            if (!s.StartsWith("P"))
            {
                return false;
            }
            // TODO finish parsing the value
            return true;

        }
        // add two CMITimeSpan values together. Returns "false" if either argument isn't a valid CMITimeSpan.
        // CMITimeSpan is "HHHH:MM:SS.ss"
        public string AddCMITime(string CMITimeSpan1, string CMITimeSpan2)
        {
            string s1 = CMITimeSpan1;
            string s2 = CMITimeSpan2;
            if (!isCMITimespan(s1))
            {
                return "false";
            }
            if (!isCMITimespan(s2))
            {
                return "false";
            }

            // both fields are valid. Now add them
            //HHHH:MM:SS.SS
            // split the first one into its parts
            string delimStr = ":";
            char[] delimiter = delimStr.ToCharArray();
            string[] s1a = s1.Split(delimiter, 3);
            string hours1 = s1a[0];
            string mins1 = s1a[1];
            string secs1 = s1a[2];
            int iHours1 = Convert.ToInt32(hours1);
            int iMins1 = Convert.ToInt32(mins1);
            decimal dSecs1 = Convert.ToDecimal(secs1);
            // split the second one into its parts
            string[] s2a = s2.Split(delimiter, 3);
            string hours2 = s2a[0];
            string mins2 = s2a[1];
            string secs2 = s2a[2];
            int iHours2 = Convert.ToInt32(hours2);
            int iMins2 = Convert.ToInt32(mins2);
            decimal dSecs2 = Convert.ToDecimal(secs2);
            // add the seconds together
            decimal totsecs = dSecs1 + dSecs2;
            // figure the remainder (take mod 60)
            decimal SecsRemainder = (totsecs % 60);
            int iMinstoCarry = (Convert.ToInt32(totsecs - SecsRemainder)) / 60;
            //  add the minutes together
            int iMinsTot = iMins1 + iMins2 + iMinstoCarry;
            int iMinsRemainder = (iMinsTot % 60);
            int iMinsToCarry = (iMinsTot - iMinsRemainder) / 60;
            // add the hours together
            int iHoursTot = iHours1 + iHours2 + iMinsToCarry;
            // assemble the new value
            StringBuilder sNew = new StringBuilder();
            sNew.AppendFormat("{0,4:0000}", iHoursTot);
            sNew.Append(":");
            sNew.AppendFormat("{0,2:00}", iMinsRemainder);
            sNew.Append(":");
            sNew.AppendFormat("{0,4:00.00}", SecsRemainder);
            return sNew.ToString();
        }
        string[,] vocabulary = {
        {"mode","normal"},
        {"mode","review"},
        {"mode","browse"},
        {"status","passed"},
        {"status","completed"},
        {"status","failed"},
        {"status","incomplete"},
        {"status","browsed"},
        {"status","not attempted"},
        {"exit","time-out"},
        {"exit","suspend"},
        {"exit","logout"},
        {"exit",""},
        {"credit","no-credit"},
        {"credit","credit"},
        {"entry","ab-initio"},
        {"entry","resume"},
        {"entry",""},
        {"interaction","true-false"},
        {"interaction","choice"},
        {"interaction","fill-in"},
        {"interaction","matching"},
        {"interaction","performance"},
        {"interaction","likert"},
        {"interaction","sequencing"},
        {"interaction","numeric"},
        {"result","correct"},
        {"result","wrong"},
        {"result","unanticipated"},
        {"result","neutral"},
        {"time_limit_action","exit,message"},
        {"time_limit_action","exit,no message"},
        {"time_limit_action","continue,message"},
        {"time_limit_action","continue,no message"},
        {"success_status","passed"},
        {"success_status","failed"},
        {"success_status","unknown"},
        {"completion_status","completed"},
        {"completion_status","incomplete"},
        {"completion_status","unknown"}
                               };
        // check to see if the vocabulary type is valid (note, these are case-sensitive. The spec doesn't say this
        // explicitly but the test suite fails if you give "Passed" instead of "passed".
        public bool isCMIVocabulary(string vocabulary_type, string DataValue)
        {
            string sType = vocabulary_type;
            string sValue = DataValue;
            for (int i = 0; i < vocabulary.GetLength(0); i++)
            {
                if (vocabulary[i, 0] == sType)
                {
                    if (vocabulary[i, 1] == sValue) return true;
                }
            }
            return false;
        }
        public bool isInteractionPatternValid(string type, string DataValue)
        {
            DataValue = DataValue.ToLower();
            switch (type)
            {
                case "true-false":
                    string s = DataValue.Substring(0, 1);
                    s = s.ToLower();
                    if (s == "0" || s == "1" || s == "t" || s == "f")
                    { return true; }
                    else
                    { return false; }
                case "choice":
                    // TODO - I need a regular expression to validate this
                    return true;
                case "fill-in":
                    if (DataValue.Length <= 255)
                    { return true; }
                    else
                    { return false; }
                case "numeric":
                    if (this.isCMIDecimal(DataValue))
                    { return true; }
                    else { return false; }
                case "likert":
                    if (DataValue.Trim() == "" || Regex.IsMatch(DataValue, @"\w"))  // alphanumeric only
                    { return true; }
                    else
                    { return false; }
                case "matching":
                    // TODO - I need a regular expression to validate this
                    return true;
                case "performance":
                    if (DataValue.Length <= 255)
                    { return true; }
                    else
                    { return false; }
                case "sequencing":
                    // TODO - I need a regular expression to validate this
                    return true;
                default:
                    return false; // not a valid type
            } // end switch
        }
        // CMIIdentifiers have no whitespace and are alphanumeric only and 255 chars max
        public bool isCMIIdentifier(string DataValue)
        {
            if (DataValue.Length > 255 || DataValue.Length == 0) return false;
            // the regex expression \W will match on NON-alphanumerics including spaces (whereas \w matches on alphanumerics)
            if (Regex.IsMatch(DataValue, @"\W+")) return false;
            return true;

        }
        // first, make sure value is integer.
        // then, make sure it is between the low and high values
        public bool isRangeValid(string DataValue, int low, int high)
        {
            if (this.isCMISInteger(DataValue))
            {
                int i = Convert.ToInt32(DataValue);
                if (i >= low && i <= high)
                {
                    return true;
                }
            }
            return false;
        }
        // the "result" field in the cmi.interactions.n.result "SetValue" call is either 
        // a valid vocabulary OR a valid Decimal
        public bool isResultValid(string DataValue)
        {
            if (this.isCMIVocabulary("result", DataValue))
            {
                return true;
            }
            if (this.isCMIDecimal(DataValue))
            {
                return true;
            }
            return false;
        }
        private string[] ReadOnlyCalls = {    "cmi.core.student_id",
                                             "cmi.core.student_name",
                                             "cmi.core.credit",
                                             "cmi.core.entry",
                                             "cmi.core.total_time",
                                             "cmi.core.lesson_mode",
                                             "cmi.launch_data",
                                             "cmi.comments_from_lms",
                                             "cmi.student_data.mastery_score",
                                             "cmi.student_data.max_time_allowed",
                                             "cmi.student_data.time_limit_action",
                                             "cmi.interactions._count"
                                         };
        private string[] WriteOnlyCalls = {  "cmi.core.session_time",
                                              "cmi.core.exit",
                                            "pattern",
                                            "id",
                                            "time",
                                            "type",
                                            "weighting",
                                            "student_response",
                                            "result",
                                            "latency"

                                         };
        private string[] KeywordCalls = {"cmi.core._children",
                                             "cmi.core.score._children",
                                             "cmi.objectives._children",
                                             "cmi.objectives._count",
                                             "cmi.student_data._children",
                                             "cmi.student_preference._children",
                                             "cmi.interactions._children",
                                             "cmi.interactions._count,"

                                         };

        // provides a fast check to see if the DataValue they passed to LMSSetValue is ReadOnly
        // if so we are supposed to return an error
        public bool isReadOnly(string DataValue)
        {
            for (int i = 0; i < ReadOnlyCalls.Length; i++)
            {
                if (ReadOnlyCalls[i].ToLower() == DataValue.ToLower())
                {
                    return true;
                }

            }
            return false;
        }
        // provides a fast check to see if the DataValue they passed to LMSSetValue is a keyword
        // if so we are supposed to return an error
        public bool isKeyword(string DataValue)
        {
            for (int i = 0; i < KeywordCalls.Length; i++)
            {
                if (KeywordCalls[i].ToLower() == DataValue.ToLower())
                {
                    return true;
                }

            }
            return false;
        }
        // provides a fast check to see if the DataValue they passed to LMSGetValue is WriteOnly
        // if so we are supposed to return an error
        public bool isWriteOnly(string DataValue)
        {
            for (int i = 0; i < WriteOnlyCalls.Length; i++)
            {
                if (WriteOnlyCalls[i].ToLower() == DataValue.ToLower())
                {
                    return true;
                }

            }
            return false;
        }
  
        public bool ConvertToInt(string s, out int i)
        {
            double nn;
            if (Double.TryParse(s, System.Globalization.NumberStyles.Integer, null, out nn))
            {
                i = Convert.ToInt32(nn);
                return true;
            }
            else
            {
                i = 0;
                return false;
            }
        }
     



    }
}


