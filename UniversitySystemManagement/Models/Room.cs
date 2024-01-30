using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Room
    {
        [Key]
        public int room_number { get; set; }

        [Required]
        public int capacity { get; set; }

        [StringLength(255)]
        public string equipment { get; set; }

        [StringLength(100)]
        public string building_name { get; set; }

        public int floor_number { get; set; }

        [StringLength(50)]
        public string room_type { get; set; }
    }
}
