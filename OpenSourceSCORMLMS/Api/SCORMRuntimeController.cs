using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Models;
using Newtonsoft.Json.Linq;
using System;
using System.Data;
using System.Text;
using OpenSourceSCORMLMS.Data.ModelSCORM;

namespace OpenSourceSCORMLMS.Api
{

    [Route("api/[controller]")]
    [ApiController]
    public class SCORMRuntimeController : Controller
    {
        private ILogger _logger { get; set; }
        Helpers.SCORMRuntimeHelper SCORM { get; set; }
        Helpers.DatabaseHelper DatabaseHelper { get; set; }
        public SCORMRuntimeController(ILogger<SCORMRuntimeController> logger)
        {

            _logger = logger;
            SCORM = new Helpers.SCORMRuntimeHelper(_logger);
            DatabaseHelper = new Helpers.DatabaseHelper(_logger);
        }

        // Post api/LMSInitialize
        [HttpPost("/api/LMSInitialize")]
        public JsonResult LMSInitialize([FromBody] LMSInfo o)
        {
            // arguments: sco_identifier, SCORM_course_id, user_id, core_id 
            // (arguments are passed in the LMSInfo object)
            if ((o is null || !SCORM.isInteger(o.scormCourseId)) || (!SCORM.isInteger(o.coreId)))
            {
                LMSInfo o1 = new LMSInfo();
                o1.errorCode = "201";
                o1.errorString = "Invalid or incomplete data, can't initialize";
                o1.returnValue = "false";
                return Json(o1);
            }

            // set up data record if needed (this record holds launch, suspend info
            // there might be one data record for many core_id records
            int cmi_data_id = DatabaseHelper.GetCmiDataID(o.userId.ToString(), o.scoIdentifier, o.scormCourseId);
            if (cmi_data_id == 0)
            {
                // see if there's any launch data
                // Note I'm just doing launch data right now. Add others as needed
                string launch_data = "", max_time_allowed = "", time_limit_action = "";
                int Scorm_course_id = 0;
                DatabaseHelper.ConvertToInt(o.scormCourseId, out Scorm_course_id);
                // insert cmi_data row. This tells us, for prerequisites, that this object has been
                // attempted
                DatabaseHelper.InsertCMIData(o.userId, o.scoIdentifier, Scorm_course_id, launch_data, max_time_allowed, null, time_limit_action);
            }
            o.errorCode = "0";
            o.returnValue = "true";
            o.errorString = "";
            return Json(o);

        }
        // POST api/LMSFinish
        [HttpPost("/api/LMSFinish")]
        public JsonResult LMSFinish([FromBody] LMSInfo o)
        {
            // handle LMSFinish
            // arguments: sessionid, sco_identifier, core_id
            // (arguments are passed in the LMSInfo object)
            if (o is null)
            {
                LMSInfo o1 = new LMSInfo();
                o1.errorCode = "201";
                o1.errorString = "Invalid or incomplete data, can't initialize";
                o1.returnValue = "false";
                return Json(o1);
            }
            // close the session
            int id = 0;
            if (DatabaseHelper.ConvertToInt(o.sessionId, out id))
            {
                DatabaseHelper.UpdateSession(id, DateTime.Now);
            }
            // Update cmi_core.entry. 
            //  if cmi.core.exit = "suspend", set cmi_core.entry = "resume"
            //  for any other value of cmi.core.exit, set cmi_core.entry = blank;
            int core_id = Convert.ToInt32(o.coreId);
            if (core_id < 1)
            {
                // update error object
                o.errorCode = "301";
                o.returnValue = "false";
                o.errorString = "No cmi_core record for this session";
            }
            else
            {
                // get value of cmi.core.exit, session_time, total_time
                cmi_core core = DatabaseHelper.GetCMICoreById(core_id);
                if (core != null)
                {
                    string exit = core.exit;
                    string lesson_status = core.lesson_status;
                    string session_time = core.session_time;
                    string total_time = core.total_time;
                    string entry = "";
                    string status = "";
                    if (exit.ToLower() == "suspend")
                    {
                        entry = "resume";
                    }
                    if ((lesson_status.ToLower() == "not attempted") || (lesson_status == string.Empty))
                    {
                        status = "completed";
                    }
                    else
                    {
                        status = lesson_status;
                    }
                    string Total_time = SCORM.AddCMITime(session_time, total_time);
                    if (Total_time == "false")
                    {
                        Total_time = total_time;
                    }
                    DatabaseHelper.UpdateCore(core_id, entry, status, Total_time);
                }
                o.errorCode = "0";
                o.returnValue = "true";
                o.errorString = "";
            }
            return Json(o);
        }
        // GET api/LMSGetValue
        [HttpPost("/api/LMSGetValue")]
        public JsonResult LMSGetValue([FromBody] LMSInfo o)
        {
            if (o is null)
            {
                LMSInfo o1 = new LMSInfo();
                o1.errorCode = "201";
                o1.errorString = "Invalid or incomplete data, can't initialize";
                o1.returnValue = "false";
                return Json(o1);
            }
            SCORM.Getvalue(o);  //The GetValue static class handles all GetValues
            return Json(o);
        }

        // POST api/LMSSetValue
        [HttpPost("/api/LMSSetValue")]
        public JsonResult LMSSetValue([FromBody] LMSInfo o)
        {
            if (o is null)
            {
                LMSInfo o1 = new LMSInfo();
                o1.errorCode = "201";
                o1.errorString = "Invalid or incomplete data, can't initialize";
                o1.returnValue = "false";
                return Json(o1);
            }
            SCORM.Setvalue(o); // the SetValue object takes care of all Setvalue calls
            return Json(o);

        }

        // GET api/LMSCommit
        [HttpPost("/api/LMSCommit")]
        public JsonResult LMSCommit([FromBody] LMSInfo o)
        {
            // this is a NOOP since we commit every time.
            if (o is null)
            {
                o = new LMSInfo();
            }
            o.errorCode = "0";
            o.returnValue = "true";
            o.errorString = "";
            return Json(o);
        }

    }
}

