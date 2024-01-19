using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace UniversityManagementSystem.Models
{
    public class Users

    {
        [Key]
        public int user_id { get; set; }
        
      
        public string? name { get; set; } = string.Empty;
        public string? surname { get; set; } = string.Empty;
        public string? username { get; set; } = string.Empty;
        public string? password { get; set; }
        public string? RefreshToken { get; set; } = string.Empty;
        public DateTime TokenCreated { get; set; }
        public DateTime TokenExpires { get; set; }
        public string? roleName { get; set; }
    }
}
