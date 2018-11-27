using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_comment_from_learner
    {
        [Key]
        public int id { get; set; }
        public int? n { get; set; }
        [StringLength(4000)]
        public string comment { get; set; }
        [StringLength(250)]
        public string location { get; set; }
        [StringLength(50)]
        public string timestamp { get; set; }
        public int? core_id { get; set; }
        public int? SCORM_courses_id { get; set; }
    }
}
