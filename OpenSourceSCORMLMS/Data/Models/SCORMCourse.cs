using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    [BindProperties]
    public class SCORMCourse
    {
        public int id { get; set; }
        public string href { get; set; }
        public string pathToFolder { get; set; }
        [Display(Name = "Course Title")]
        public string Course_title { get; set; }
        [Display(Name = "Date Uploaded")]
        public string DateUploaded { get; set; }

    }
}
