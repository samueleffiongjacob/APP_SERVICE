using LeadApi.Models;

namespace LeadApi.Services;

public class UserService(PostgresStore store)
{
    public async Task<List<AppUser>> GetAllAsync() => await store.GetAllUsersAsync();
    public async Task<bool> DeleteAsync(string id) => await store.DeleteUserAsync(id);
}


// using LeadApi.Models;

// namespace LeadApi.Services;

// public class UserService(InMemoryStore store)
// {
//     public List<AppUser> GetAll() => store.GetAllUsers();

//     public bool Delete(string id) => store.DeleteUser(id);
// }