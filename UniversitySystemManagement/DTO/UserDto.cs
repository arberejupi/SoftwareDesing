using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Serialization; 

namespace UniversityManagementSystem.DTO
{
    public class UserDto
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int user_id { get; set; }
       
        public string name { get; set; } = string.Empty;
        public string surname { get; set; } = string.Empty;
        public string username { get; set; }
        public string password { get; set; }
        public string roleName { get; set; }
        public string Token { get; internal set; }
    }
}
