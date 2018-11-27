using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class session
    {
        [Key]
        public int id { get; set; }
        [Required]
        [StringLength(100)]
        public string sessionid { get; set; }
        [StringLength(450)]
        public string user_id { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? startdatetime { get; set; }
        [Column(TypeName = "datetime")]
        public DateTime? enddatetime { get; set; }
        public int? SCORM_Course_id { get; set; }
        [StringLength(100)]
        public string SCO_identifier { get; set; }
        public int? cmi_core_id { get; set; }
        [ForeignKey("cmi_core_id")]
        [InverseProperty("session")]
        public cmi_core cmi_core_ { get; set; }
    }
}
