using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Department
    {
        [Key]
        public int department_id { get; set; }
        public int university_id { get; set; }
        public string name { get; set; }
        public string abbreviation { get; set; }
        public string head_of_department { get; set; }
        public int? established_year { get; set; }
        public string contact_email { get; set; }
        public string contact_phone { get; set; }

        // Navigation property for the University relationship
        
    }

}
