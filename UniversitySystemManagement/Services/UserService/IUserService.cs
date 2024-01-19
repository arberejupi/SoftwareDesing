using UniversityManagementSystem.DTO;
namespace UniversityManagementSystem.Services.UserService
{
    public interface IUserService
    {
        string GetMyName();
       // string GetUserNameAndSurname();
        List<UserSearch> GetAllUsers();
    }
}
