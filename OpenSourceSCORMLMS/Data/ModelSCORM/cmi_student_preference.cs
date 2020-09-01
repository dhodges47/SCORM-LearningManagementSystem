using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_student_preference
    {
        [Key]
        public int id { get; set; }
        public int? audio { get; set; }
        [StringLength(255)]
        public string language { get; set; }
        public int? speed { get; set; }
        public int? text { get; set; }
        public int user_id { get; set; }
        public Guid? msrepl_tran_version { get; set; }
        public int? audio_captioning { get; set; }
    }
}
