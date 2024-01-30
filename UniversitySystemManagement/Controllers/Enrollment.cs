using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Enrollment
    {
        [Key]
        public int enrollment_id { get; set; }

        public int student_id { get; set; }

        public int course_id { get; set; }
    }
}

