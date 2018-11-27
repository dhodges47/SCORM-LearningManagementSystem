using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;

namespace OpenSourceSCORMLMS.Pages
{

    public class UploadFileModel : PageModel
    {
        private readonly UserManager<IdentityUser> _userManager;
        private IConfiguration _configuration;
        private IHostingEnvironment _environment;
        private ILogger _logger { get; set; }
        private Helpers.DatabaseHelper databaseHelper { get; set; }
        public UploadFileModel(UserManager<IdentityUser> User, IConfiguration Configuration, IHostingEnvironment hostingEnvironment, ILogger<UploadFileModel> logger)
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
            
        }
        [Authorize]
        public async Task<IActionResult> OnPostAsync(IFormFile file)
        {
            string UserID = _userManager.GetUserId(HttpContext.User);
            bool isSavedSuccessfully = true;
            _logger.LogInformation("Saving package...");
            var siteRoot = _environment.ContentRootPath;
            var uploadFolder = Path.Combine(siteRoot, Helpers.ConfigurationHelper.UploadFolder);
            var courseFolder = Path.Combine(siteRoot, Helpers.ConfigurationHelper.CourseFolder);
            if (!Directory.Exists(courseFolder))
            {
                Directory.CreateDirectory(courseFolder);
            }
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }
            string fname = file.FileName;
            string pathToFile = Path.Combine(uploadFolder, file.FileName);

            if (file.Length > 0)
            {

                string newFilename = Helpers.FileSystemHelper.getUniqueFileName(pathToFile);
                if (!string.IsNullOrWhiteSpace(newFilename))
                {
                    fname = newFilename;
                    pathToFile = Path.Combine(uploadFolder, newFilename);
                }
                using (var fileStream = new FileStream(pathToFile, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
            }
            // Make sure the folder name doesn't have invalid characters
            string sFileNameWithoutExtension = Path.GetFileNameWithoutExtension(pathToFile);
            foreach (var c in System.IO.Path.GetInvalidFileNameChars())
            {
                sFileNameWithoutExtension = sFileNameWithoutExtension.Replace(c.ToString(), string.Empty);
            }
    
            // Unzip the package
            string sPathToPackageFolder = Path.Combine(courseFolder, sFileNameWithoutExtension);
            ZipFile.ExtractToDirectory(pathToFile, sPathToPackageFolder, true);
            // find the imsmanifest.xml file
            string sPathToManifest = Helpers.FileSystemHelper.FindManifestFile(sPathToPackageFolder);
            Helpers.SCORMUploadHelper scorm = new Helpers.SCORMUploadHelper(_logger);
            scorm.parseManifest(sPathToManifest);
            string sPathToIndex = scorm.href;
            databaseHelper.InsertScormCourse(scorm.title, scorm.title, sPathToIndex, sPathToManifest, sPathToPackageFolder, scorm.SCORM_Version, DateTime.Now, UserID);
           
            if (isSavedSuccessfully)
            {
                _logger.LogInformation("SCORM package saved.");
                return new JsonResult(new { Message = fname, Url = sPathToIndex });
            }
            else
            {
                _logger.LogError("Error saving file.");
                return new JsonResult(new { Message = "Error in saving file" });
            }
        }

        private void InsertPackagesTable(string sPathToPackageFolder)
        {
            // TODO replace this method with one that writes to SCO_Courses table

            //string module_title = "";
            //string datecreated = "";
            //int module_id = 0;
            //// get and parse LaunchParameters
            //string sPathToLaunchParameters = Helpers.FileSystemHelper.FindLaunchParametersFile(sPathToPackageFolder);
            //if (System.IO.File.Exists(sPathToLaunchParameters))
            //{
            //    // Read launch Parameters

            //    string s = System.IO.File.ReadAllText(sPathToLaunchParameters);
            //    foreach (string s1 in Helpers.ReadLineExtension.ReadLines(s))
            //    {
            //        if (s1.Contains("="))
            //        {
            //            string s2 = s1.Replace(@"""", "").Replace(";", "").Replace(" ", "").Replace("SCOClient.", "");
            //            // we now have a name/value pair
            //            string[] s3 = s2.Split("=");
            //            if (s3.Length == 2)
            //            {
            //                string sKey = s3[0];
            //                string sValue = s3[1].Replace("'", "");
            //                switch (sKey)
            //                {
            //                    case "Module_ID":
            //                        int _module_id = 0;
            //                        if (int.TryParse(sValue, out _module_id))
            //                        {
            //                            module_id = _module_id;
            //                        }
            //                        break;
            //                    case "Module_Title":
            //                        module_title = sValue;
            //                        break;
            //                    case "DateCreated":
            //                        datecreated = sValue;
            //                        break;

            //                }

            //            }
            //        }

            //    }
            //    Helpers.SQLLiteHelper.insertPackage(sPathToPackageFolder, module_id, module_title, datecreated);
            //}
        }
    }


}
