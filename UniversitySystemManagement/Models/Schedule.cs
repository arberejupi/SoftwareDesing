using System;
using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Schedule
    {
        [Key]
        public int schedule_id { get; set; }

        public int course_id { get; set; }

        public DateTime daytime { get; set; }

        public int room_number { get; set; }

    }
}