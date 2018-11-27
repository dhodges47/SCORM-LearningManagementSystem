using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_data
    {
        [Key]
        public int id { get; set; }
        [StringLength(450)]
        public string user_id { get; set; }
        public int SCORM_courses_id { get; set; }
        [Required]
        [StringLength(100)]
        public string sco_id { get; set; }
        [StringLength(50)]
        public string total_time { get; set; }
        [StringLength(8000)]
        public string launch_data { get; set; }
        [StringLength(8000)]
        public string suspend_data { get; set; }
        [Column(TypeName = "text")]
        public string cmi_comments { get; set; }
        [StringLength(8000)]
        public string cmi_comments_from_lms { get; set; }
        public decimal? mastery_score { get; set; }
        [StringLength(14)]
        public string max_time_allowed { get; set; }
        [StringLength(19)]
        public string time_limit_action { get; set; }
        public decimal? scaled_passing_score { get; set; }
    }
}
