using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenSourceSCORMLMS.Data.ModelSCORM;
using System.Collections.Generic;

namespace OpenSourceSCORMLMS.Pages
{
    public class PackageListingModel : PageModel
    {
        public List<SCORM_Course_fromSP> listPackagesWithUser { get; set; }
        private readonly UserManager<IdentityUser> _userManager;
        private IConfiguration _configuration;
        private IHostingEnvironment _environment;
        private ILogger _logger { get; set; }
        private Helpers.DatabaseHelper databaseHelper { get; set; }
        public PackageListingModel(UserManager<IdentityUser> User, IConfiguration Configuration, IHostingEnvironment hostingEnvironment, ILogger<UploadFileModel> logger)
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
            string UserID = _userManager.GetUserId(HttpContext.User);
            listPackagesWithUser = databaseHelper.getCourseListWithUserIndicator(UserID);
        }
    }
}