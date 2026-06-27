using LeadApi.Models;
using LeadApi.Services;

namespace LeadApi.Controllers;

public static class AuthController
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        // group.MapPost("/signup", (SignupRequest request, AuthService auth) =>
        // {
        //     var user = auth.Signup(request);
        //     return Results.Created("/api/users", user);
        // });

        // group.MapPost("/login", (LoginRequest request, AuthService auth) =>
        // {
        //     var result = auth.Login(request);
        //     return result is { } r
        //         ? Results.Ok(new { token = r.Token, user = r.User })
        //         : Results.Unauthorized();
        // });

        group.MapPost("/signup", async (SignupRequest request, AuthService auth) =>
        {
            var (success, message, user) = await auth.SignupAsync(request);
            return success
                ? Results.Created("/api/users", user)
                : Results.BadRequest(new { message });
        });  
           // Results.Created("/api/users", await auth.SignupAsync(request))
        

        group.MapPost("/login", async (LoginRequest request, AuthService auth) =>
        {
            var result = await auth.LoginAsync(request);
            return result is { } r
                ? Results.Ok(new { token = r.Token, user = r.User })
                : Results.Unauthorized();
        });
    }
}