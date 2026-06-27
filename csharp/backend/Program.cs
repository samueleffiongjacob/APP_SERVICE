using LeadApi.Controllers;
using LeadApi.Middleware;
using LeadApi.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000") // React host
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Services
//builder.Services.AddSingleton<InMemoryStore>();
builder.Services.AddSingleton<PostgresStore>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<LeadService>();
builder.Services.AddScoped<UserService>();
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var app = builder.Build();
//cor policy
app.UseCors("ReactPolicy");

// Run DB migrations on startup
await app.Services.GetRequiredService<PostgresStore>().InitAsync();


// Middleware
app.UseGlobalExceptionHandler();
app.UseRequestLogging();

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Controllers
app.MapAuthEndpoints();
app.MapLeadEndpoints();
app.MapUserEndpoints();

app.Run();






















// using System.Collections.Concurrent;

// var builder = WebApplication.CreateBuilder(args);
// var app = builder.Build();
// var store = new InMemoryStore();

// app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
// app.MapPost("/api/requests", (LeadRequest request) => Results.Created("/api/requests", store.SaveRequest(request with { Id = Guid.NewGuid().ToString(), CreatedAt = DateTimeOffset.UtcNow })));
// app.MapPost("/api/auth/signup", (SignupRequest request) => Results.Created("/api/users", store.SaveUser(new AppUser(Guid.NewGuid().ToString(), request.Name, request.Email, request.Phone, DateTimeOffset.UtcNow), request.Password)));
// app.MapPost("/api/auth/login", (LoginRequest request) => store.Login(request) is { } user ? Results.Ok(new { token = Guid.NewGuid().ToString(), user }) : Results.Unauthorized());
// app.MapGet("/api/users", () => Results.Ok(store.Users()));
// app.MapDelete("/api/users/{id}", (string id) => { store.DeleteUser(id); return Results.NoContent(); });

// app.Run();

// record AppUser(string Id, string Name, string Email, string Phone, DateTimeOffset CreatedAt);
// record LeadRequest(string? Id, string Name, string Email, string Phone, string Service, string Message, DateTimeOffset? CreatedAt);
// record SignupRequest(string Name, string Email, string Phone, string Password);
// record LoginRequest(string Email, string Password);

// sealed class InMemoryStore
// {
//     private readonly ConcurrentDictionary<string, AppUser> users = new();
//     private readonly ConcurrentDictionary<string, string> passwords = new();
//     private readonly List<LeadRequest> requests = [];

//     public LeadRequest SaveRequest(LeadRequest payload)
//     {
//         requests.Add(payload);
//         return payload;
//     }

//     public AppUser SaveUser(AppUser user, string password)
//     {
//         users[user.Id] = user;
//         passwords[user.Email] = password;
//         return user;
//     }

//     public AppUser? Login(LoginRequest request)
//         => users.Values.FirstOrDefault(user => user.Email == request.Email && passwords.TryGetValue(request.Email, out var saved) && saved == request.Password);

//     public List<AppUser> Users() => users.Values.ToList();

//     public void DeleteUser(string id)
//     {
//         if (users.TryRemove(id, out var user))
//         {
//             passwords.TryRemove(user.Email, out _);
//         }
//     }
// }
