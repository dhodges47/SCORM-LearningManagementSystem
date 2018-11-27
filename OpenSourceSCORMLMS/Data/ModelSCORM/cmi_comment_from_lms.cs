using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_comment_from_lms
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
        public int? SCORM_Course_id { get; set; }
        [StringLength(255)]
        public string SCO_identifier { get; set; }
    }
}
