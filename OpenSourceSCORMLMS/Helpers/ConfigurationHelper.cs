using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace OpenSourceSCORMLMS.Helpers
{
    public class ConfigurationHelper
    {
        private static IConfiguration _configuration;
        private static IHttpContextAccessor _contextAccessor;
        public static void Initialize(IConfiguration configuration, IHttpContextAccessor contextAccessor)
        {
            _configuration = configuration;
            _contextAccessor = contextAccessor;

        }

        public static string UploadFolder => _configuration["AppSettings:UploadFolder"];
        public static string CourseFolder => _configuration["AppSettings:CourseFolder"];
        public static string DefaultConnection => _configuration["ConnectionStrings:DefaultConnection"];
        public static string SiteUrl
        {
            get
            {
                return $"{_contextAccessor.HttpContext.Request.Scheme}://{_contextAccessor.HttpContext.Request.Host.Value}";
            }
        }



    }
}


