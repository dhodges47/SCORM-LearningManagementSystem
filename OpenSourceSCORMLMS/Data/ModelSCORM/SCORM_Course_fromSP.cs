using System.ComponentModel.DataAnnotations;
using System;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    // Query Type class to hold the results of sp_Sel_CoursesWithUserIndicator
    public class SCORM_Course_fromSP
    {
        public int id { get; set; }
        public string title { get; set; }
        public DateTime DateUploaded { get; set; }
        public string pathToIndex { get; set; }
        public int user_module_id { get; set; }
    }
}
