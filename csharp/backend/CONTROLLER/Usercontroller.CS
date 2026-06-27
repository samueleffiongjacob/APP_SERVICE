using LeadApi.Services;

namespace LeadApi.Controllers;

public static class UserController
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users");
        
        group.MapGet("/", async (UserService users) =>
            Results.Ok(await users.GetAllAsync())
        );

        group.MapDelete("/{id}", async (string id, UserService users) =>
            await users.DeleteAsync(id) ? Results.NoContent() : Results.NotFound());
        // group.MapGet("/", (UserService users) =>
        //     Results.Ok(users.GetAll()));

        // group.MapDelete("/{id}", (string id, UserService users) =>
        // {
        //     users.Delete(id);
        //     return Results.NoContent();
        // });
    }
}