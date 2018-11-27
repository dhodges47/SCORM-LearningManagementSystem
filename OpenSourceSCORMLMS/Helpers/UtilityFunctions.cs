using System;

namespace OpenSourceSCORMLMS.Helpers
{
    public static class UtilityFunctions
    {
        public static bool isInteger(string DataValue)
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
        public static string getSCOUrl(string PathToSco, string hrefSco)
        {
            string url = "";
            string siteUrl = Helpers.ConfigurationHelper.SiteUrl;
            string courseFolder = Helpers.ConfigurationHelper.CourseFolder;
            PathToSco = PathToSco.Replace(@"\", @"/");
            // strip everything in PathToSco up to theCourseFolder
            int i = PathToSco.ToLower().IndexOf(courseFolder.ToLower());
            if (i >= 0)
            {
                PathToSco = PathToSco.Substring(i, PathToSco.Length - i);
            }
          
            url = $"{siteUrl}/{PathToSco}/{hrefSco}";
            return url;
        }
    }
}
