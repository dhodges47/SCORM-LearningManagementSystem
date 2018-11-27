using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace OpenSourceSCORMLMS.Pages
{
    public class MyCoursesForStudyModel : PageModel
    {
        public List<Data.ModelSCORM.User_Module> listModules{ get; set; }
        public string UserID { get; set; }
        private readonly UserManager<IdentityUser> _userManager;
        private IConfiguration _configuration;
        private IHostingEnvironment _environment;
        private ILogger _logger { get; set; }
        private Helpers.DatabaseHelper databaseHelper { get; set; }
        public MyCoursesForStudyModel(UserManager<IdentityUser> User, IConfiguration Configuration, IHostingEnvironment hostingEnvironment, ILogger<UploadFileModel> logger)
        {
            _userManager = User;
            _configuration = Configuration;
            _environment = hostingEnvironment;
            _logger = logger;
            databaseHelper = new Helpers.DatabaseHelper(_logger);
        }
        public void OnGet()
        {
            // get user_id
            // retrieve their courses available for study
            // build the table
            if (!Models.SignedInUser.isSignedIn)
            {
                Response.Redirect("/Identity/Account/Login?returnUrl=" + Request.Path);
            }
            string siteUrl = Request.Host.ToUriComponent();
            UserID = _userManager.GetUserId(HttpContext.User);
            listModules = databaseHelper.SelectUserModule(UserID);
        }
    }
}