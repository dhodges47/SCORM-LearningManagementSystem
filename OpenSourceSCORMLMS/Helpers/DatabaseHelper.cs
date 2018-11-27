using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Models;
using OpenSourceSCORMLMS.Data.ModelSCORM;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace OpenSourceSCORMLMS.Helpers
{
    public class DatabaseHelper
    {
        private ILogger logger { get; set; }
        public DatabaseHelper(ILogger logger)
        {
            this.logger = logger;
        }
        public bool isCourseInUserStudyArea(int SCORM_Course_id, string UserID)
        {
            bool b = false;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var row = context.User_Module.Where(ix => ix.UserID == UserID && ix.SCORM_Course.id == SCORM_Course_id).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    if (row != null)
                    {
                        b = true;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return b;
        }
        public void AddCourseToUsersStudyArea(int SCORM_Course_id, string UserID)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    User_Module user_module = new User_Module();
                    user_module.dtDateAdded = DateTime.Today;
                    var SCORM_Course = context.SCORM_Course.Where(ix => ix.id == SCORM_Course_id).FirstOrDefault();
                    user_module.SCORM_Course = SCORM_Course;
                    user_module.UserID = UserID;
                    context.User_Module.Add(user_module);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }

        public void UpdateUserModuleDateLastOpened(string UserID, int SCORM_Course_id)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var user_module = context.User_Module.Where(ix => ix.SCORM_Course.id == SCORM_Course_id && ix.UserID == UserID).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    user_module.dtDateLastOpened = DateTime.Now;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateUserModuleDateCompleted(string UserID, int SCORM_Course_id, DateTime dtDateCompleted)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var user_module = context.User_Module.Where(ix => ix.SCORM_Course.id == SCORM_Course_id && ix.UserID == UserID).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    user_module.dtDateCompleted = dtDateCompleted;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateUserModuleScore(string UserID, int SCORM_Course_id, decimal dScore)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var user_module = context.User_Module.Where(ix => ix.SCORM_Course.id == SCORM_Course_id && ix.UserID == UserID).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    user_module.dScore = dScore;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateUserModulePassed(string UserID, int SCORM_Course_id, DateTime dtPassed)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var user_module = context.User_Module.Where(ix => ix.SCORM_Course.id == SCORM_Course_id && ix.UserID == UserID).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    user_module.dtDatePassed = dtPassed;
                    user_module.dtDateCompleted = dtPassed;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateCore(int core_id, string entry, string lesson_status, string total_time)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var core = context.cmi_core.Where(ix => ix.core_id == core_id).FirstOrDefault();
                    core.entry = entry;
                    core.lesson_status = lesson_status;
                    core.total_time = total_time;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateSession(int id, DateTime enddatetime)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var session = context.session.Where(ix => ix.id == id).FirstOrDefault();
                    session.enddatetime = enddatetime;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void UpdateUserModuleCompleted(string UserID, int SCORM_Course_id, DateTime dtCompleted)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var user_module = context.User_Module.Where(ix => ix.SCORM_Course.id == SCORM_Course_id && ix.UserID == UserID).OrderByDescending(iy => iy.dtDateAdded).FirstOrDefault();
                    user_module.dtDateCompleted = dtCompleted;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public List<User_Module> SelectUserModule(string UserID)
        {
            using (var context = ConnectionHelper.getContext())
            {
                var rows = context.User_Module.Where(ix => ix.UserID == UserID)
                    .OrderByDescending(iy => iy.dtDateLastOpened).ThenByDescending(iz => iz.dtDateAdded)
                    .Include(iw => iw.SCORM_Course)
                    .ToList();
                return rows;
            }
        }
        public void InsertCMIData(string user_id, string sco_id, int SCORM_courses_id, string launch_data, string max_time_allowed, decimal? mastery_score, string time_limit_action)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_data cd = new cmi_data();
                    cd.user_id = user_id;
                    cd.sco_id = sco_id;
                    cd.SCORM_courses_id = SCORM_courses_id;
                    cd.launch_data = launch_data;
                    cd.max_time_allowed = max_time_allowed;
                    cd.mastery_score = mastery_score;
                    cd.time_limit_action = time_limit_action;
                    context.cmi_data.Add(cd);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void InsertScormCourse(string titleFromManifest, string title, string pathToIndex, string pathToManifest, string pathToFolder, string SCORM_Version, DateTime dtUploaded, string UserID)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    SCORM_Course SCORM_course = new Data.ModelSCORM.SCORM_Course();
                    SCORM_course.DateUploaded = dtUploaded;
                    SCORM_course.pathToFolder = pathToFolder;
                    SCORM_course.pathToIndex = pathToIndex;
                    SCORM_course.title_from_manifest = title;
                    SCORM_course.title_from_upload = title;
                    SCORM_course.UserUploaded = UserID;
                    SCORM_course.SCORM_version = SCORM_Version;
                    context.SCORM_Course.Add(SCORM_course);
                    context.SaveChanges();

                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void SetValueCore(int core_id, string sDataItem, string sDataValue)
        {
            string s = $"UPDATE cmi_core set {sDataItem} = @sDataValue where core_id = @core_id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                  
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@core_id", SqlDbType.Int) { Value = core_id });
                    cmd.Parameters.Add(new SqlParameter("@sDataValue", SqlDbType.VarChar) { Value = sDataValue });
                    if (cmd.Connection.State.Equals(ConnectionState.Closed))
                    {
                        cmd.Connection.Open();
                    }
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void SetValueStudentPreference(int student_preference_id, string sDataItem, string sDataValue)
        {
            string s = $"UPDATE cmi_student_preference set {sDataItem} = @sDataValue where id = @student_preference_id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@student_preference_id", SqlDbType.Int) { Value = student_preference_id });
                    cmd.Parameters.Add(new SqlParameter("@sDataValue", SqlDbType.VarChar) { Value = sDataValue });
                    if (cmd.Connection.State.Equals(ConnectionState.Closed))
                    {
                        cmd.Connection.Open();
                    }
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void SetValueSuspendData(int data_id, string suspend_data)
        {
            string s = $"UPDATE cmi_data set suspend_data = @suspend_data where id = @data_id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@data_id", SqlDbType.Int) { Value = data_id });
                    cmd.Parameters.Add(new SqlParameter("@suspend_data", SqlDbType.VarChar) { Value = suspend_data });
                    if (cmd.Connection.State.Equals(ConnectionState.Closed))
                    {
                        cmd.Connection.Open();
                    }
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void SetValueObjectives(int id, string sDataItem, string sDataValue)
        {
            string s = $"UPDATE cmi_objectives set {sDataItem} = @sDataValue where id = @id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@id", SqlDbType.Int) { Value = id });
                    cmd.Parameters.Add(new SqlParameter("@sDataValue", SqlDbType.VarChar) { Value = sDataValue });
                    if (cmd.Connection.State.Equals(ConnectionState.Closed))
                    {
                        cmd.Connection.Open();
                    }
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public string GetVersion(int SCORM_Course_id)
        {
            string version = "1.2";
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "select SCORM_version from dbo.SCORM_Courses where id=@SCORM_Course_id";
            cmd.Parameters.Add(new SqlParameter("@SCORM_Course_id", SqlDbType.VarChar) { Value = SCORM_Course_id });
            DataTable dt = GetDataTableCommand(cmd);
            if (dt.Rows.Count > 0)
            {
                string v = dt.Rows[0]["SCORM_Version"].ToString();
                if (v == "1.3")
                {
                    version = v;
                }
            }
            return version;
        }
        public int GetCmiDataID(string user_id, string sco_identifier, string sco_courses_id)
        {
            int cmi_data_id = 0;
            int iSCO_Course_id = 0;
            int.TryParse(sco_courses_id, out iSCO_Course_id);
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_data_id = context.cmi_data.Where(ix => ix.SCORM_courses_id == iSCO_Course_id && ix.user_id == user_id).OrderByDescending(iy => iy.id).FirstOrDefault().id;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return cmi_data_id;
        }
        public cmi_core GetCMICoreById(int core_id)
        {
            cmi_core core = new cmi_core();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    core = context.cmi_core.Find(core_id);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return core;
        }
        public cmi_data GetCMIDataByID(int data_id)
        {
            cmi_data data = new cmi_data();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    data = context.cmi_data.Find(data_id);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return data;

        }
        public int getCountInteractionsByCoreID(int core_id)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_interactions.Select(ix => ix.core_id == core_id).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;
        }
        public cmi_interactions GetInteractionsByInteractionsID(int interactions_id)
        {
            cmi_interactions interactions = new cmi_interactions();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    interactions = context.cmi_interactions.Where(ix => ix.id == interactions_id).FirstOrDefault();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return interactions;
        }
        public string GetInteractionType(int cmi_interactions_id)
        {
            string sType = "";
            cmi_interactions interactions = new cmi_interactions();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    interactions = context.cmi_interactions.Where(ix => ix.id == cmi_interactions_id).FirstOrDefault();
                    if (interactions != null && !string.IsNullOrEmpty(interactions.type))
                    {
                        sType = interactions.type;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return sType;
        }
        public int getCountObjectivesByCoreID(int core_id)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_objectives.Select(ix => ix.core_id == core_id).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;
        }
        public int getCountCommentsFromLearnerByCoreID(int core_id)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_comment_from_learner.Select(ix => ix.core_id == core_id).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;
        }

        public int GetCountInteractionsCorrectResponsesByInteractionsID(int interactions_id)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_interactions_correct_responses.Select(ix => ix.interactions_id == interactions_id).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;

        }
        public int GetCountInteractionsObjectivesByInteractionsID(int interactions_id)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_interactions_objectives.Select(ix => ix.interactions_id == interactions_id).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;

        }
        public int getCountCommentsFromLMS(int SCORM_Course_id, string SCO_identifier)
        {
            int iCount = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    iCount = context.cmi_comment_from_lms.Select(ix => ix.SCORM_Course_id == SCORM_Course_id && ix.SCO_identifier == SCO_identifier).Count();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCount;
        }
        public List<SCORMCourse> getCourseList()
        {
            List<SCORMCourse> listCourses = new List<SCORMCourse>();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var list = context.SCORM_Course.Select(i => new { i.id, i.pathToIndex, i.pathToFolder, i.title_from_manifest, i.DateUploaded }).OrderBy(ix => ix.title_from_manifest).ToList();
                    foreach (var j in list)
                    {
                        var k = new SCORMCourse();
                        k.DateUploaded = j.DateUploaded.ToLongDateString();
                        k.id = j.id;
                        k.Course_title = j.title_from_manifest;
                        k.href = UtilityFunctions.getSCOUrl(j.pathToFolder, j.pathToIndex);
                        listCourses.Add(k);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return listCourses;
        }
        public List<SCORM_Course_fromSP> getCourseListWithUserIndicator(string UserId)
        {
            //
            // note - this demonstatrates how to use a Query Type to map the results from a stored procedure in EF Core 2.1
            // see https://msdn.microsoft.com/en-us/magazine/mt847184.aspx

            List<SCORM_Course_fromSP> listCourses = new List<SCORM_Course_fromSP>();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    listCourses = context.SCORM_Course_FromSP
                      .FromSql($"dbo.Sel_CoursesWithUserIndicator {UserId}")
                      .ToList();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return listCourses;
        }
        public SCORMCourse getSCORMCourse(int SCORM_Course_id)
        {
            SCORMCourse scormCourse = new SCORMCourse();
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var j = context.SCORM_Course.Select(i => new { i.id, i.pathToIndex, i.pathToFolder, i.title_from_manifest, i.DateUploaded }).Where(ix => ix.id == SCORM_Course_id).FirstOrDefault();
                    if (j != null)
                    {
                        scormCourse.DateUploaded = j.DateUploaded.ToLongDateString();
                        scormCourse.id = j.id;
                        scormCourse.Course_title = j.title_from_manifest;
                        scormCourse.href = UtilityFunctions.getSCOUrl(j.pathToFolder, j.pathToIndex);
                        scormCourse.pathToFolder = j.pathToFolder;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return scormCourse;
        }
        public int GetCoreTrackingID(int iSCORM_Course_ID, string UserId)
        {
            int iCoreID = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var cmi_core = context.cmi_core.FromSql($"dbo.Sel_CoreTrackingID {iSCORM_Course_ID},{UserId} ").FirstOrDefault();
                    iCoreID = cmi_core.core_id;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iCoreID;
        }
        public int GetSessionID(int iSCORM_Course_ID, string UserId, string sessionid, int iCore_id, DateTime dtStartTime)
        {
            int iSessionID = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var session = context.session.FromSql($"dbo.Sel_SessionID {iSCORM_Course_ID},  null, {UserId}, {sessionid}, {iCore_id}, {dtStartTime}").FirstOrDefault();
                    iSessionID = session.id;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return iSessionID;
        }

        public int GetInteractionsID(int cmi_core_id, int n, bool bNew)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var cmi_interactions = context.cmi_interactions.FromSql($"select id from dbo.cmi_interactions where core_id = {cmi_core_id} AND n = {n}").FirstOrDefault();
                    id = cmi_interactions.id;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            if (id > 0)
            {
                // already exists
                return id;
            }
            else if (bNew)
            {
                try
                {
                    using (var context = ConnectionHelper.getContext())
                    {
                        // doesn't exist, have to insert it
                        // first, get highest "n"
                        DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = "select COALESCE(max(n)+1,0) as n from dbo.cmi_interactions where core_id=@cmi_core_id";
                        cmd.Parameters.Add(new SqlParameter("@cmi_core_id", SqlDbType.Int) { Value = cmi_core_id });
                        int max_n = (int)cmd.ExecuteScalar();
                        if (max_n == n)
                        {
                            DbCommand cmd1 = context.Database.GetDbConnection().CreateCommand();
                            cmd1.CommandText = "INSERT dbo.cmi_interactions(n, core_id) output INSERTED.ID VALUES(@n, @cmi_core_id)";
                            // they supplied the correct value
                            cmd1.Parameters.Add(new SqlParameter("@cmi_core_id", SqlDbType.Int) { Value = cmi_core_id });
                            cmd1.Parameters.Add(new SqlParameter("@n", SqlDbType.Int) { Value = n });
                            id = (int)cmd.ExecuteNonQuery();
                            return id;
                        }
                        else
                        {
                            // they supplied an incorrect value
                            return -1;
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex.Message);
                }
            }
            return 0;
        }
        // Helper function for LMSGetvalue
        // Returns value for all student_preferences requests
        // the LMSInfo object is used to pass all data
        public void LMSGetValueStudentPreferences(LMSInfo o)
        {
            string DataItem = o.dataItem;
            string user_id = o.userId;
            if (DataItem.ToLower() == "cmi.student_preference._children")
            {
                o.returnValue = "audio,language,speed,text";
                return;
            }
            SqlCommand sqlCommand = new SqlCommand();
            sqlCommand.CommandText = "SELECT user_id, coalesce(CONVERT(varchar(10),audio),'') audio, COALESCE(language,'') language, coalesce(CONVERT(varchar(10),speed),'') speed,  coalesce(CONVERT(varchar(10),[text]),'') [text] FROM cmi_student_preference WHERE user_id=@user_id";
            sqlCommand.Parameters.Add(new SqlParameter("@user_id", SqlDbType.VarChar) { Value = user_id });
            DataTable dt = GetDataTableCommand(sqlCommand);
            if (dt.Rows.Count > 0)
            {
                switch (DataItem.ToLower())
                {
                    case "cmi.student_preference.audio":
                        o.returnValue = dt.Rows[0]["audio"].ToString();
                        break;
                    case "cmi.student_preference.language":
                        o.returnValue = dt.Rows[0]["language"].ToString();
                        break;
                    case "cmi.student_preference.speed":
                        o.returnValue = dt.Rows[0]["speed"].ToString();
                        break;
                    case "cmi.student_preference.text":
                        o.returnValue = dt.Rows[0]["text"].ToString();
                        break;
                    default:
                        o.errorCode = "401";
                        o.returnValue = "false";
                        o.errorString = "Not Implemented";
                        o.returnValue = "";
                        break;
                }
            }
            else
            {
                o.errorString = "Bad value for user_id";
                o.errorCode = "402";
            }
        }
        // Helper function for LMSGetvalue
        // Returns value for all learner_preferences requests
        // the LMSInfo object is used to pass all data
        public void GetValueStudentPreferences2004(LMSInfo o)
        {
            string DataItem = o.dataItem;
            string user_id = o.userId;
            if (DataItem.ToLower() == "cmi.student_preference._children")
            {
                o.returnValue = "audio_level,language,delivery_speed,audio_captioning";
                return;
            }
            SqlCommand sqlCommand = new SqlCommand();
            sqlCommand.CommandText = "SELECT user_id, coalesce(CONVERT(varchar(10),audio),'') audio_lvel, COALESCE(language,'') language, coalesce(CONVERT(varchar(10),speed),'') delivery_speed, coalesce(audio_captioning,'') audio_captioning  FROM cmi_student_preference WHERE user_id=@user_id";
            sqlCommand.Parameters.Add(new SqlParameter("@user_id", SqlDbType.VarChar) { Value = user_id });
            DataTable dt = GetDataTableCommand(sqlCommand);
            if (dt.Rows.Count > 0)
            {
                switch (DataItem.ToLower())
                {
                    case "cmi.learner_preference.audio_level":
                        o.returnValue = dt.Rows[0]["audio_level"].ToString();
                        break;
                    case "cmi.learner_preference.language":
                        o.returnValue = dt.Rows[0]["language"].ToString();
                        break;
                    case "cmi.learner_preference.delivery_speed":
                        o.returnValue = dt.Rows[0]["delivery_speed"].ToString();
                        break;
                    case "cmi.student_preference.audio_captioning":
                        o.returnValue = dt.Rows[0]["audio_captioning"].ToString();
                        break;
                    default:
                        o.errorCode = "401";
                        o.returnValue = "false";
                        o.errorString = "Not Implemented";
                        o.returnValue = "";
                        break;
                }
            }
            else
            {
                o.errorString = "Bad value for user_id";
                o.errorCode = "402";
            }
        }

        public void LMSGetValueObjectives(int core_id, LMSInfo o)
        {
            // get objectives values
            // only "_children" and "_count" don't depend on "n"
            // the rest are like cmi.objectives.n.id
            // the LMSINfo object is used to pass all values
            string DataItem = o.dataItem;
            StringBuilder s = new StringBuilder();
            if (DataItem == "cmi.objectives._children")
            {
                o.returnValue = "id,score,status";
                return;
            }
            if (DataItem == "cmi.objectives._count")
            {
                int i = getCountObjectivesByCoreID(core_id);
                o.returnValue = i.ToString();
                return;
            }
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
            if (int.TryParse(sIndex, out n))
            {
                SqlCommand sqlCommand = new SqlCommand();
                sqlCommand.CommandText = "SELECT COALESCE(n_id,'') n_id, COALESCE(CONVERT(varchar(20), score_raw), '') score_raw, COALESCE(CONVERT(varchar(20), score_min), '') score_min, COALESCE(CONVERT(varchar(20), score_max), '') score_max, status FROM cmi_objectives where n = @n and core_id = @core_id";
                sqlCommand.Parameters.Add(new SqlParameter("@core_id", SqlDbType.Int) { Value = core_id });
                sqlCommand.Parameters.Add(new SqlParameter("@n", SqlDbType.Int) { Value = n });
                DataTable dt = GetDataTableCommand(sqlCommand);
                if (dt.Rows.Count > 0)
                {
                    switch (sDataitem.ToLower())
                    {
                        case "id":
                            o.returnValue = dt.Rows[0]["n_id"].ToString();
                            break;
                        case "status":
                            o.returnValue = dt.Rows[0]["status"].ToString();
                            break;
                        case "score":
                            if (sDatasubitem == "_children")
                            {
                                o.returnValue = "raw,min,max";
                            }
                            else if (sDatasubitem.ToLower() == "raw")
                            {
                                o.returnValue = dt.Rows[0]["score_raw"].ToString();
                            }
                            else if (sDatasubitem == "max")
                            {
                                o.returnValue = dt.Rows[0]["score_max"].ToString();
                            }
                            else if (sDatasubitem == "min")
                            {
                                o.returnValue = dt.Rows[0]["score_min"].ToString();
                            }
                            break;
                        default:
                            break;
                    } // end switch for DataItem (id, status, or score)
                }
            }
            else
            {
                o.errorString = "Bad value for n";
                o.errorCode = "402";
            }

        }
        public void LMSGetValueObjectives2004(int core_id, LMSInfo o)
        {
            // get objectives values for SCORM 2004
            // only "_children" and "_count" don't depend on "n"
            // the rest are like cmi.objectives.n.id
            // the LMSINfo object is used to pass all values
            string DataItem = o.dataItem;
            if (DataItem == "cmi.objectives._children")
            {
                o.returnValue = "id,score,success_status,completion_status,progress_measure,description";
                return;
            }
            if (DataItem == "cmi.objectives._count")
            {
                int i = getCountObjectivesByCoreID(core_id);
                o.returnValue = i.ToString();
                return;
            }
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
            if (ConvertToInt(sIndex, out n))
            {
                SqlCommand sqlCommand = new SqlCommand();
                sqlCommand.CommandText = "SELECT COALESCE(n_id,'') n_id, COALESCE(CONVERT(varchar(20),score_raw),'') score_raw, COALESCE(CONVERT(varchar(20),score_min),'') score_min, COALESCE(CONVERT(varchar(20),score_max),'') score_max, COALESCE(CONVERT(varchar(20),score_scaled),'') score_scaled,COALESCE(success_status,'') success_status, COALESCE(completion_status,'') completion_status, COALESCE(progress_measure,0) progress_measure, COALESCE(description,'') description FROM cmi_objectives where n = @n and core_id = @core_id";
                sqlCommand.Parameters.Add(new SqlParameter("@core_id", SqlDbType.Int) { Value = core_id });
                sqlCommand.Parameters.Add(new SqlParameter("@n", SqlDbType.Int) { Value = n });
                DataTable dt = GetDataTableCommand(sqlCommand);
                if (dt.Rows.Count > 0)
                {
                    switch (sDataitem.ToLower())
                    {
                        case "id":
                            o.returnValue = dt.Rows[0]["n_id"].ToString();
                            break;
                        case "completion_status":
                            o.returnValue = dt.Rows[0]["completion_status"].ToString();
                            break;
                        case "success_status":
                            o.returnValue = dt.Rows[0]["success_status"].ToString();
                            break;
                        case "description":
                            o.returnValue = dt.Rows[0]["description"].ToString();
                            break;
                        case "progress_measure":
                            o.returnValue = dt.Rows[0]["progress_measure"].ToString();
                            break;
                        case "score":
                            if (sDatasubitem == "_children")
                            {
                                o.returnValue = "scaled,raw,min,max";
                            }
                            else if (sDatasubitem.ToLower() == "raw")
                            {
                                o.returnValue = dt.Rows[0]["score_raw"].ToString();
                            }
                            else if (sDatasubitem == "max")
                            {
                                o.returnValue = dt.Rows[0]["score_max"].ToString();
                            }
                            else if (sDatasubitem == "min")
                            {
                                o.returnValue = dt.Rows[0]["score_min"].ToString();
                            }
                            else if (sDatasubitem == "scaled")
                            {
                                o.returnValue = dt.Rows[0]["score_scaled"].ToString();
                            }
                            break;
                        default:
                            break;
                    } // end switch for DataItem 
                }
            }
            else
            {
                o.errorString = "Bad value for n";
                o.errorCode = "402";
            }

        }
        public void LMSGetValueCommentsFromLearner(int core_id, LMSInfo o)
        {
            // get Comments from Learner values for SCORM 2004
            // only "_children" and "_count" don't depend on "n"
            // the rest are like cmi.objectives.n.id
            // the LMSINfo object is used to pass all values
            string DataItem = o.dataItem;
            if (DataItem == "cmi.comments_from_learner._children")
            {
                o.returnValue = "comment,location,timestamp";
                return;
            }
            if (DataItem == "cmi.comments_from_learner._count")
            {
                int i = getCountCommentsFromLearnerByCoreID(core_id);
                o.returnValue = i.ToString();
                return;
            }
            // if there is an "n" value extract the row corresponding to it
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter);
            string sIndex = sDataItem[2]; // get "n" from the string
            string sDataitem = sDataItem[3]; // get desired field from the string
            int n;
            if (int.TryParse(sIndex, out n)) // purpose of this is to guarantee that "n" is an integer
            {
                int cmi_CommentsFromLearner_id = GetCommentsFromLearnerID(core_id, n, false);
                SqlCommand sqlCommand = new SqlCommand();
                sqlCommand.CommandText = "select comment,location,[timestamp] from cmi_comments_from_learner where id = @cmi_CommentsFromLearner_id";
                sqlCommand.Parameters.Add(new SqlParameter("@cmi_CommentsFromLearner_id", SqlDbType.Int) { Value = cmi_CommentsFromLearner_id });
                DataTable dt = GetDataTableCommand(sqlCommand);
                if (dt.Rows.Count > 0)
                {
                    switch (sDataitem.ToLower())
                    {
                        case "comment":
                            o.returnValue = dt.Rows[0]["comment"].ToString();
                            break;
                        case "location":
                            o.returnValue = dt.Rows[0]["location"].ToString();
                            break;
                        case "timestamp":
                            o.returnValue = dt.Rows[0]["[timestamp]"].ToString();
                            break;

                        default:
                            break;
                    } // end switch for DataItem (id, status, or score)
                }
            }
            else
            {
                o.errorString = "General Get Failure";
                o.errorCode = "301";
            }


        }
        public void LMSGetValueCommentsFromLMS(int core_id, LMSInfo o)
        {
            // get Comments From LMS values for SCORM 2004
            // only "_children" and "_count" don't depend on "n"
            // the rest are like cmi.objectives.n.id
            // the LMSINfo object is used to pass all values
            // NOTE: Comments From LMS are unique by SCORM_Course_id and SCO_identifier, not to core_id like the others
            string DataItem = o.dataItem;
            string SCO_identifier = o.scoIdentifier;
            int SCORM_Course_id = Convert.ToInt32(o.scormCourseId);
            if (DataItem == "cmi.comments_from_lms._children")
            {
                o.returnValue = "comment,location,timestamp";
                return;
            }
            if (DataItem == "cmi.comments_from_lms._count")
            {
                int i = getCountCommentsFromLMS(SCORM_Course_id, SCO_identifier);
                return;
            }
            // if there is an "n" value extract the row corresponding to it
            string delimStr = ".";
            char[] delimiter = delimStr.ToCharArray();
            string[] sDataItem = DataItem.Split(delimiter);
            string sIndex = sDataItem[2]; // get "n" from the string
            string sDataitem = sDataItem[3]; // get desired field from the string
            int n;
            if (int.TryParse(sIndex, out n)) // purpose of this is to guarantee that "n" is an integer
            {
                int cmi_CommentsFromLMS_id = GetCommentsFromLMSID(SCORM_Course_id, SCO_identifier, n, false);
                SqlCommand sqlCommand = new SqlCommand();
                sqlCommand.CommandText = "select comment,location,[timestamp] from cmi_comments_from_lms where id=@cmi_CommentsFromLMS_id";
                sqlCommand.Parameters.Add(new SqlParameter("@cmi_CommentsFromLMS_id", SqlDbType.Int) { Value = cmi_CommentsFromLMS_id });
                DataTable dt = GetDataTableCommand(sqlCommand);


                if (dt.Rows.Count > 0)
                {
                    switch (sDataitem.ToLower())
                    {
                        case "comment":
                            o.returnValue = dt.Rows[0]["comment"].ToString();
                            break;
                        case "location":
                            o.returnValue = dt.Rows[0]["location"].ToString();
                            break;
                        case "timestamp":
                            o.returnValue = dt.Rows[0]["[timestamp]"].ToString();
                            break;

                        default:
                            break;
                    } // end switch for DataItem (id, status, or score)
                }
            }
            else
            {
                o.errorString = "General Get Failure";
                o.errorCode = "301";
            }
        }
        // This function inserts a new comment_from_learner row "n" if needed, or returns the id of the existing row
        // validation: make sure the "n" they supply, if new, is 1 more than previous
        // argument "bNew" - if false, don't return a new id. If there are no id's, return 0.
        public int GetCommentsFromLearnerID(int core_id, int n, bool bNew)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var iy = context.cmi_comment_from_learner.Where(ix => ix.core_id == core_id).FirstOrDefault();
                    if (iy != null)
                    {
                        id = iy.id;
                    }
                    if (id > 0)
                    {
                        // already exists
                        return id;
                    }
                    else if (bNew)
                    {
                        // doesn't exist, have to insert it
                        DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = "select COALESCE(max(n)+1,0) as n from dbo.cmi_comment_from_learner where core_id=@core_id";
                        cmd.Parameters.Add(new SqlParameter("@core_id", SqlDbType.Int) { Value = core_id });
                        int max_n = (int)cmd.ExecuteScalar();// first, get highest "n"
                        if (max_n == n)
                        {
                            // they supplied the correct value
                            cmi_comment_from_learner cml = new cmi_comment_from_learner();
                            cml.n = n;
                            cml.core_id = core_id;
                            context.cmi_comment_from_learner.Add(cml);
                            context.SaveChanges();

                            id = cml.id;
                            return id;
                        }
                        else
                        {
                            // they supplied an incorrect value
                            return -1;
                        }
                    }
                    else
                    {
                        return 0;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return id;
        }
        public string GetCommentsFromCMIData(int data_id)
        {
            string comment = "";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_data cd = context.cmi_data.Where(ix => ix.id == data_id).FirstOrDefault();
                    if (cd != null && !string.IsNullOrEmpty(cd.cmi_comments))
                    {
                        comment = cd.cmi_comments;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return comment;
        }
        public void SetValueComments(int data_id, string comment)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_data cd = context.cmi_data.Where(ix => ix.id == data_id).FirstOrDefault();
                    if (cd != null)
                    {
                        cd.cmi_comments = comment;
                        context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return;
        }
        public void SetValueCommentsFromLearner(int comment_id, string sDataItem, string comment)
        {
            string s = $"UPDATE dbo.cmi_comment_from_learner set {sDataItem} = @comment where id = @comment_id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@comment_id", SqlDbType.Int) { Value = comment_id });
                    cmd.Parameters.Add(new SqlParameter("@comment", SqlDbType.VarChar) { Value = comment });
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return;
        }
        public void SetValueInteractions(int interactions_id, string sDataItem, string sDataValue)
        {
            string s = $"UPDATE dbo.cmi_interactions set {sDataItem} = @sDataValue where id = @interactions_id";
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                    cmd.CommandText = s;
                    cmd.Parameters.Add(new SqlParameter("@interactions_id", SqlDbType.Int) { Value = interactions_id });
                    cmd.Parameters.Add(new SqlParameter("@sDataValue", SqlDbType.VarChar) { Value = sDataValue });
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return;
        }
        // find out if the user has a student_preferences record. If not, insert one
        public int GetStudentPreferenceID(int user_id)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var iy = context.cmi_student_preferences.Where(ix => ix.user_id == user_id).FirstOrDefault();
                    if (iy != null)
                    {
                        id = iy.id;
                    }
                    if (id > 0)
                    {
                        // already exists
                        return id;
                    }
                    else
                    {
                        // doesn't exist, have to insert it
                        cmi_student_preference cmp = new cmi_student_preference();
                        cmp.user_id = user_id;
                        context.cmi_student_preferences.Add(cmp);
                        context.SaveChanges();
                        id = cmp.id;
                        return id;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return id;
        }
        // This function inserts a new comment_from_lms row "n" if needed, or returns the id of the existing row
        // validation: make sure the "n" they supply, if new, is 1 more than previous
        // argument "bNew" - if false, don't return a new id. If there are no id's, return 0.
        public int GetCommentsFromLMSID(int SCORM_Course_id, string SCO_identifier, int n, bool bNew)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var iy = context.cmi_comment_from_lms.Where(ix => ix.SCORM_Course_id == SCORM_Course_id && ix.SCO_identifier == SCO_identifier && ix.n == n).FirstOrDefault();
                    if (iy != null)
                    {
                        id = iy.id;
                    }
                    if (id > 0)
                    {
                        // already exists
                        return id;
                    }
                    else if (bNew)
                    {
                        // doesn't exist, have to insert it
                        // first, get highest "n"
                        DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = "select COALESCE(max(n) + 1, 0) as n from dbo.cmi_comment_from_lms where SCORM_Course_id =@SCORM_Course_id and SCO_identifier=@SCO_id";
                        cmd.Parameters.Add(new SqlParameter("@SCORM_Course_id", SqlDbType.Int) { Value = SCORM_Course_id });
                        cmd.Parameters.Add(new SqlParameter("@SCO_id", SqlDbType.VarChar) { Value = SCO_identifier });
                        int max_n = (int)cmd.ExecuteScalar();// first, get highest "n"
                        if (max_n == n)
                        {
                            // they supplied the correct value
                            cmi_comment_from_lms cml = new cmi_comment_from_lms();
                            cml.SCO_identifier = SCO_identifier;
                            cml.SCORM_Course_id = SCORM_Course_id;
                            cml.n = n;
                            context.cmi_comment_from_lms.Add(cml);
                            context.SaveChanges();
                            id = cml.id;
                            return id;
                        }
                        else
                        {
                            // they supplied an incorrect value
                            return -1;
                        }
                    }
                    else
                    {
                        return 0;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return id;
        }
        // find out if the user has a cmi_objectives record. If not, insert one
        // if we are inserting one, but the number is out of sequence, return -1
        public int GetObjectiveID(int core_id, int n)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var iy = context.cmi_objectives.Where(ix => ix.core_id == core_id).FirstOrDefault();
                    if (iy != null)
                    {
                        id = iy.id;
                    }
                    if (id > 0)
                    {
                        // already exists
                        return id;
                    }
                    else
                    {
                        // doesn't exist, have to insert it
                        // first see what the next sequence number should be
                        DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = "SELECT coalesce(max(n),-1) from dbo.cmi_objectives where core_id = @core_id";
                        cmd.Parameters.Add(new SqlParameter("@core_id", SqlDbType.Int) { Value = core_id });
                        int next_n = (int)cmd.ExecuteScalar();// first, get highest "n"

                        if (next_n == -1)
                        {
                            next_n = 0;  // a return of -1 means there is no cmi_objective yet
                        }
                        else
                        {
                            next_n += 1; //increment existing one
                        }
                        // compare next_n to the "n" that they sent
                        if (next_n == n)
                        {
                            cmi_objectives co = new cmi_objectives();
                            co.n = next_n;
                            co.status = "not attempted";
                            co.core_id = core_id;
                            context.cmi_objectives.Add(co);
                            context.SaveChanges();
                            id = co.id;
                            return id;
                        }
                        else
                        {
                            // the "n" they supplied is out of sequence
                            return -1;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return id;
        }

        // This function inserts a new interactions_corect_responses row "n" if needed, or returns the id of the existing row
        // validation: make sure the "n" they supply, if new, is 1 more than previous
        // argument "bNew" - if false, don't return a new id. If there are no id's, return 0.
        // this function avoids the fact that errors will be thrown if the user retakes the test
        // in the same session

        public int GetInteractionsCorrectResponses(int interactions_id, int n, bool bNew)
        {
            int id = 0;
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    var iy = context.cmi_interactions_correct_responses.Where(ix => ix.interactions_id == interactions_id && ix.n == n).FirstOrDefault();
                    if (iy != null)
                    {
                        id = iy.id;
                    }
                    if (id > 0)
                    {
                        // already exists
                        return id;
                    }
                    else if (bNew)
                    {
                        // doesn't exist, have to insert it
                        // first, get highest "n"
                        DbCommand cmd = context.Database.GetDbConnection().CreateCommand();
                        cmd.CommandText = "select COALESCE(max(n)+1,0) as n from dbo.cmi_interactions_correct_responses where interactions_id=@interactions_id";
                        cmd.Parameters.Add(new SqlParameter("@interactions_id", SqlDbType.Int) { Value = interactions_id });
                        int max_n = (int)cmd.ExecuteScalar();// first, get highest "n"
                        if (max_n == n)
                        {
                            // they supplied the correct value
                            cmi_interactions_correct_responses ci = new cmi_interactions_correct_responses();
                            ci.n = n;
                            ci.interactions_id = interactions_id;
                            context.cmi_interactions_correct_responses.Add(ci);
                            context.SaveChanges();
                            id = ci.id;
                            return id;
                        }
                        else
                        {
                            // they supplied an incorrect value
                            return -1;
                        }
                    }
                    else
                    {
                        return 0;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
            return 0;
        }
        public void SetValueInteractionsCorrectResponses(int id, string sValue)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_interactions_correct_responses cicr = context.cmi_interactions_correct_responses.Where(ix => ix.id == id).FirstOrDefault();
                    cicr.pattern = sValue;
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }
        public void SetValueInteractionsObjections(int interaction_n, int n, string objective_id, int interactions_id)
        {
            try
            {
                using (var context = ConnectionHelper.getContext())
                {
                    cmi_interactions_objectives cio = new cmi_interactions_objectives();
                    cio.interactions_id = interactions_id;
                    cio.interaction_n = interaction_n;
                    cio.n = n;
                    cio.objective_id = objective_id;
                    context.cmi_interactions_objectives.Add(cio);
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex.Message);
            }
        }

        // for returning a datatable using a parameterized query
        // the caller populates a command object with the command text and the parameters prepopulated
        public DataTable GetDataTableCommand(SqlCommand sqlCommand)
        {
            DataTable dt = new DataTable();
            using (SqlConnection sqlConnection = new SqlConnection(ConnectionHelper.getConnectionString()))
            {
                try
                {
                    sqlConnection.Open();
                    sqlCommand.Connection = sqlConnection;
                    SqlDataAdapter DataAdapter = new SqlDataAdapter();
                    DataAdapter.SelectCommand = sqlCommand;
                    DataAdapter.Fill(dt);
                    sqlConnection.Close();
                }
                catch (SqlException Sqlerr)
                {
                    logger.LogError(Sqlerr.Message);
                    return dt;
                }
            }

            return dt;
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



