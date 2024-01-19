using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
  
        public class University
        {
            [Key]
            public int university_id { get; set; }
            public string name { get; set; }
            public string abbreviation { get; set; }
            public int? established_year { get; set; }
            public string location { get; set; }
            public string website_url { get; set; }
            public string contact_email { get; set; }
            public string contact_phone { get; set; }
            public string accreditation_status { get; set; }
            public int? ranking { get; set; }
        }

    }
