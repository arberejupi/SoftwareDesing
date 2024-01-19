using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Course
    {
        [Key]

        public int course_id { get; set; }

        public int department_id { get; set; }

        public int teacher_id { get; set; }

        public string name { get; set;}

        public string code { get; set;}

        public string description { get; set;}

        public int credit_hours { get; set;}

        public DateTime start_date { get; set;}

        public DateTime end_date { get; set;}
    }
}
