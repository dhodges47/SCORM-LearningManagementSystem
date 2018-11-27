using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_core
    {
        public cmi_core()
        {
            cmi_objectives = new HashSet<cmi_objectives>();
            session = new HashSet<session>();
        }

        [Key]
        public int core_id { get; set; }
        [StringLength(450)]
        public string student_id { get; set; }
        [StringLength(255)]
        public string student_name { get; set; }
        [StringLength(1000)]
        public string lesson_location { get; set; }
        [StringLength(9)]
        public string credit { get; set; }
        [StringLength(13)]
        public string lesson_status { get; set; }
        [StringLength(9)]
        public string entry { get; set; }
        public decimal? score_raw { get; set; }
        public decimal? score_min { get; set; }
        public decimal? score_max { get; set; }
        [StringLength(20)]
        public string total_time { get; set; }
        [StringLength(6)]
        public string lesson_mode { get; set; }
        [StringLength(8)]
        public string exit { get; set; }
        [StringLength(20)]
        public string session_time { get; set; }
        public int? SCORM_course_id { get; set; }
        [StringLength(255)]
        public string sco_identifier { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? timestamp { get; set; }
        public decimal? score_scaled { get; set; }
        [StringLength(20)]
        public string success_status { get; set; }
        [StringLength(20)]
        public string completion_status { get; set; }

        [InverseProperty("core_")]
        public ICollection<cmi_objectives> cmi_objectives { get; set; }
        [InverseProperty("cmi_core_")]
        public ICollection<session> session { get; set; }
    }
}
