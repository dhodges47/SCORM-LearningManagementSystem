using System;
using System.ComponentModel.DataAnnotations;
namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public class SCORM_Course
    {
        [Key]
        public int id { get; set; }
        public string title_from_manifest { get; set; }
        public string title_from_upload { get; set; }
        public string pathToIndex { get; set; }
        public string pathToFolder { get; set; }
        public DateTime DateUploaded { get; set; }
        [StringLength(450)]
        public string UserUploaded { get; set; }
        public string SCORM_version { get; set; }
    }
}


