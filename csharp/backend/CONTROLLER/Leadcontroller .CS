using LeadApi.Models;
using LeadApi.Services;

namespace LeadApi.Controllers;

public static class LeadController
{
    public static void MapLeadEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/requests");

        // group.MapPost("/", (LeadRequest request, LeadService leads) =>
        // {
        //     var saved = leads.Submit(request);
        //     return Results.Created("/api/requests", saved);
        // });

        group.MapGet("/", async (LeadService users) =>
            Results.Ok(await users.GetAllAsync())
        );

        group.MapPost("/", async (LeadRequest request, LeadService leads) =>
            Results.Created("/api/requests", await leads.SubmitAsync(request))
        );

        group.MapDelete("/{id}", async (string id, LeadService users) =>
            await users.DeleteAsync(id) ? Results.NoContent() : Results.NotFound());
    }
}