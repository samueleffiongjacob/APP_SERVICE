using Dapper;
using LeadApi.Models;
using Npgsql;

namespace LeadApi.Services;

public sealed class PostgresStore(IConfiguration config)
{
    private NpgsqlConnection Connect()
        => new(config.GetConnectionString("Default"));

    public async Task InitAsync()
    {
        using var db = Connect();
        await db.ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );

            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                service TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );
        """);
    }

    public async Task<AppUser> SaveUserAsync(AppUser user, string password)
    {
        using var db = Connect();
        await db.ExecuteAsync("""
            INSERT INTO users (id, name, email, phone, password, created_at)
            VALUES (@Id, @Name, @Email, @Phone, @Password, @CreatedAt)
        """, new { user.Id, user.Name, user.Email, user.Phone, Password = password, user.CreatedAt });
        return user;
    }
    public async Task<bool> EmailExistsAsync(string email)
    {
        using var db = Connect();
        return await db.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM users WHERE email = @email", new { email });
    }
    public async Task<AppUser?> LoginAsync(LoginRequest request)
    {
        using var db = Connect();
        return await db.QuerySingleOrDefaultAsync<AppUser>("""
            SELECT id, name, email, phone, created_at AS CreatedAt
            FROM users
            WHERE email = @Email AND password = @Password
        """, new { request.Email, request.Password });
    }

    public async Task<List<AppUser>> GetAllUsersAsync()
    {
        using var db = Connect();
        var result = await db.QueryAsync<AppUser>("""
            SELECT id, name, email, phone, created_at AS CreatedAt FROM users
        """);
        return result.ToList();
    }

    public async Task<List<LeadRequest>> GetAllLeadsAsync()
    {
        using var db = Connect();
        var result = await db.QueryAsync<LeadRequest>("""
            SELECT id, name, email, phone, service, message, created_at FROM leads
        """);
        return result.ToList();
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        using var db = Connect();
        var rows = await db.ExecuteAsync("DELETE FROM users WHERE id = @id", new { id });
        return rows > 0;
    }

    public async Task<bool> DeleteLeadAsync(string id)
    {
        using var db = Connect();
        var rows = await db.ExecuteAsync("DELETE FROM leads WHERE id = @id", new { id });
        return rows > 0;
    }

    public async Task<LeadRequest> SaveLeadAsync(LeadRequest lead)
    {
        using var db = Connect();
        await db.ExecuteAsync("""
            INSERT INTO leads (id, name, email, phone, service, message, created_at)
            VALUES (@Id, @Name, @Email, @Phone, @Service, @Message, @CreatedAt)
        """, lead);
        return lead;
    }
}