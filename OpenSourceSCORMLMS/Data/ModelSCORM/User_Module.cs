using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace OpenSourceSCORMLMS.Data.ModelSCORM
{
    [Table("Study.User_Module")]
    public partial class User_Module
    {
        public int id { get; set; }

        [Required]
        [StringLength(256)]
        public string UserID { get; set; }
        public SCORM_Course SCORM_Course { get; set; }
        public DateTime? dtDateAdded { get; set; }
        public DateTime? dtDateCompleted { get; set; }
        public DateTime? dtDatePassed { get; set; }
        public DateTime? dtDateLastOpened { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal dScore { get; set; }
    }
}


