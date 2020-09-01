using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    public partial class cmi_interactions_objectives
    {
        [Key]
        public int id { get; set; }
        public int? n { get; set; }
        public int? interaction_n { get; set; }
        [StringLength(255)]
        public string objective_id { get; set; }
        public int? interactions_id { get; set; }
        public Guid? msrepl_tran_version { get; set; }

        [ForeignKey("interactions_id")]
        [InverseProperty("cmi_interactions_objectives")]
        public cmi_interactions interactions_ { get; set; }
    }
}
