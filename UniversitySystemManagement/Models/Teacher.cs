using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Teacher
    {
        [Key]
        public int teacher_id { get; set; }

        public int department_id { get; set; }

        public int user_id { get; set; }

        public string office_location { get; set; }

        public string office_hours { get; set; }

        public string academic_rank { get; set; }

        public string research_interests { get; set; }

    }
}
