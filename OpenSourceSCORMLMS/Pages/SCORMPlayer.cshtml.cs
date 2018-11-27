using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenSourceSCORMLMS.Data.Models;
using System;


namespace OpenSourceSCORMLMS.Pages
{
    public class SCORMPlayerModel : PageModel
    {
        public int SCORM_Course_id { get; set;}
        public string UserID { get; set; }
        public string sLaunchParameters { get; set; } // this is javascript to tell the SCORM scripts what course to launch etc.
        public string sIframeSrc { get; set; }
        private readonly UserManager<IdentityUser> _userManager;
        private IConfiguration _configuration;
        private IHostingEnvironment _environment;
        private ILogger _logger { get; set; }
        private Helpers.DatabaseHelper databaseHelper { get; set; }
        public SCORMPlayerModel(UserManager<IdentityUser> User, IConfiguration Configuration, IHostingEnvironment hostingEnvironment, ILogger<UploadFileModel> logger)
        {
            _userManager = User;
            _configuration = Configuration;
            _environment = hostingEnvironment;
            _logger = logger;
            databaseHelper = new Helpers.DatabaseHelper(_logger);
        }
        [Authorize]
        public void OnGet()
        {
            if (!Models.SignedInUser.isSignedIn)
            {
                Response.Redirect("/Identity/Account/Login?returnUrl=" + Request.Path);
            }
            string siteUrl = Request.Host.ToUriComponent();
            UserID = _userManager.GetUserId(HttpContext.User);
            
            if (Request.Query["id"] != String.Empty && Helpers.UtilityFunctions.isInteger(Request.Query["id"]))
            {
                SCORM_Course_id = Convert.ToInt32(Request.Query["id"]);
                var scoLaunch = GetCourseInformation(UserID);
                databaseHelper.UpdateUserModuleDateLastOpened(UserID, SCORM_Course_id);
                sLaunchParameters = SetupJavascript(scoLaunch);
                sIframeSrc = scoLaunch.Url;
            }
        }
        private string SetupJavascript(SCORMLaunchParameters scoLaunch)
        {
            return $@"var SCOClient = SCOClient || {{}};
SCOClient.sessionid = '{scoLaunch.SessionId}';
SCOClient.userid = '{scoLaunch.UserId}';
SCOClient.coreid = '{scoLaunch.CoreId}';
SCOClient.moduleid = '{SCORM_Course_id}';
SCOClient.sco_identifier = 'default'; 
SCOClient.scorm_course_id = '{scoLaunch.SCORM_Course_Id}';
SCOClient.scoAddress = '{scoLaunch.Url}';
SCOClient.scoFrameClientID = 'SCO1';
SCOClient.divDebugID = 'divDebug';
SCOClient.bDebug = false;
SCOClient.DateCreated = '{DateTime.Today}'; ";
        }
        private SCORMLaunchParameters GetCourseInformation(string user_id)
        {
            SCORMLaunchParameters scoLaunch = new SCORMLaunchParameters();
            // convert user_ID to a valid user in our system
            // get all the information for the SCO_ID and formulate the launch parameters

            var launchInfo = databaseHelper.getSCORMCourse(SCORM_Course_id);
            scoLaunch.SCORM_Course_Id = SCORM_Course_id.ToString();
            scoLaunch.UserId = user_id.ToString();
            // get url to sco
            scoLaunch.Url = launchInfo.href;
            // get coreid
            int iCore_id = getSCOCoreID(user_id, SCORM_Course_id);
            scoLaunch.CoreId = iCore_id.ToString();
            // get SCORM sessionid. We supply the asp.net session id, and the other scorm identifiers
            string AspNetSessionID = "ScormClientAPI";
            scoLaunch.SessionId = getSCOSessionID(iCore_id, SCORM_Course_id, UserID, AspNetSessionID, DateTime.Now).ToString();
            return scoLaunch;

        }

        private int getSCOSessionID(int iCore_id, int iSCORM_Course_id, string UserId, string aspnetSessionID, DateTime dtStartTime)
        {
            int iSessionID = databaseHelper.GetSessionID(iSCORM_Course_id,  UserId, aspnetSessionID, iCore_id, dtStartTime);
            return iSessionID;
        }

        private int getSCOCoreID(string UserID, int iSCORM_Course_id)
        {
            int iCore_id = databaseHelper.GetCoreTrackingID(iSCORM_Course_id, UserID);
            return iCore_id;
        }

        
    }
}