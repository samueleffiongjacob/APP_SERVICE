namespace LeadApi.Models;

public record AppUser
{
    public string Id { get; init; } = "";
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public DateTimeOffset CreatedAt { get; init; }

    // Parameterless constructor Dapper needs
    public AppUser() { }

    public AppUser(string id, string name, string email, string phone, DateTimeOffset createdAt)
    {
        Id = id; Name = name; Email = email; Phone = phone; CreatedAt = createdAt;
    }
}


public record LeadRequest
{
    public string? Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public string Service { get; init; } = "";
    public string Message { get; init; } = "";
    public DateTimeOffset? CreatedAt { get; init; }

    public LeadRequest() { }
}

//public record LeadRequest(string? Id, string Name, string Email, string Phone, string Service, string Message, DateTimeOffset? CreatedAt);
public record SignupRequest(string Name, string Email, string Phone, string Password);
public record LoginRequest(string Email, string Password);

// namespace LeadApi.Models;

// public record AppUser(string Id, string Name, string Email, string Phone, DateTimeOffset CreatedAt);

// public record LeadRequest(string? Id, string Name, string Email, string Phone, string Service, string Message, DateTimeOffset? CreatedAt);

// public record SignupRequest(string Name, string Email, string Phone, string Password);

// public record LoginRequest(string Email, string Password);