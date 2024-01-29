using System;
using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Student
    {
        [Key]
        public int student_id { get; set; }

        public int user_id { get; set; }

        public DateTime date_of_birth { get; set; }

        [StringLength(1)]
        public string gender { get; set; }

        [StringLength(100)]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string email { get; set; }

        [StringLength(20)]
        public string phone_number { get; set; }

        [StringLength(255)]
        public string address { get; set; }

        public int department_id { get; set; }
    }
}

