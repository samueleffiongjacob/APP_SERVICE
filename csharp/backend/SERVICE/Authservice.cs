using LeadApi.Models;

namespace LeadApi.Services;

public class AuthService(PostgresStore store)
{
    public async Task<(string Token, AppUser User)?> LoginAsync(LoginRequest request)
    {
        var user = await store.LoginAsync(request);
        if (user is null) return null;
        return (Guid.NewGuid().ToString(), user);
    }

    public async Task<(bool Success, string Message, AppUser? User)> SignupAsync(SignupRequest request)
    {

        if (await store.EmailExistsAsync(request.Email))
        {
            return (false, "User already exists", null);
        }

        if (request.Password.Length < 6)
        {
            return (false, "Password must be at least 6 characters long", null);
        }

        var user = new AppUser
        {
            Id= Guid.NewGuid().ToString(),
            Name= request.Name,
            Email= request.Email,
            Phone= request.Phone,
            CreatedAt= DateTimeOffset.UtcNow
        };
        var savedUser = await store.SaveUserAsync(user, request.Password);
        return (true, "Signup successfully", savedUser);
    }
}


// using LeadApi.Models;

// namespace LeadApi.Services;

// public class AuthService(InMemoryStore store)
// {
//     public (string Token, AppUser User)? Login(LoginRequest request)
//     {
//         var user = store.Login(request);
//         if (user is null) return null;

//         var token = Guid.NewGuid().ToString(); // swap for JWT in production
//         return (token, user);
//     }

//     public AppUser Signup(SignupRequest request)
//     {
//         var user = new AppUser(
//             Id: Guid.NewGuid().ToString(),
//             Name: request.Name,
//             Email: request.Email,
//             Phone: request.Phone,
//             CreatedAt: DateTimeOffset.UtcNow
//         );
//         return store.SaveUser(user, request.Password);
//     }
// }