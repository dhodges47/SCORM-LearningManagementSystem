using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_objectives
    {
        [Key]
        public int id { get; set; }
        public int? n { get; set; }
        [StringLength(255)]
        public string n_id { get; set; }
        public decimal? score_raw { get; set; }
        public decimal? score_min { get; set; }
        public decimal? score_max { get; set; }
        [StringLength(14)]
        public string status { get; set; }
        public int core_id { get; set; }
        public Guid msrepl_tran_version { get; set; }
        public decimal? score_scaled { get; set; }
        public decimal? progress_measure { get; set; }
        [StringLength(20)]
        public string success_status { get; set; }
        [StringLength(20)]
        public string completion_status { get; set; }
        [StringLength(250)]
        public string description { get; set; }

        [ForeignKey("core_id")]
        [InverseProperty("cmi_objectives")]
        public cmi_core core_ { get; set; }
    }
}
