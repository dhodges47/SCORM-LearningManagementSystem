using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_interactions
    {
        public cmi_interactions()
        {
            cmi_interactions_objectives = new HashSet<cmi_interactions_objectives>();
        }
        [Key]
        public int id { get; set; }
        public int? n { get; set; }
        [StringLength(255)]
        public string n_id { get; set; }
        [StringLength(50)]
        public string interaction_time { get; set; }
        [StringLength(11)]
        public string type { get; set; }
        [StringLength(50)]
        public string weighting { get; set; }
        [StringLength(8000)]
        public string student_response { get; set; }
        [StringLength(13)]
        public string result { get; set; }
        [StringLength(13)]
        public string latency { get; set; }
        public int core_id { get; set; }
        public Guid? msrepl_tran_version { get; set; }
        [StringLength(255)]
        public string description { get; set; }
        [StringLength(20)]
        public string timestamp { get; set; }

        [InverseProperty("interactions_")]
        public ICollection<cmi_interactions_objectives> cmi_interactions_objectives { get; set; }
    }
}
