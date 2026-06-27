using LeadApi.Models;

namespace LeadApi.Services;

public class LeadService(PostgresStore store)
{
    public async Task<List<LeadRequest>> GetAllAsync() => await store.GetAllLeadsAsync();
    public async Task<LeadRequest> SubmitAsync(LeadRequest request)
    {
        //var stamped = request with { Id = Guid.NewGuid().ToString(), CreatedAt = DateTimeOffset.UtcNow };
        var stamped  = new LeadRequest
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Service = request.Service,
            Message = request.Message,
            CreatedAt = DateTimeOffset.UtcNow
        };
        return await store.SaveLeadAsync(stamped);
    }

    public async Task<bool> DeleteAsync(string id) => await store.DeleteLeadAsync(id);
        
}


// using LeadApi.Models;

// namespace LeadApi.Services;

// public class LeadService(InMemoryStore store)
// {
//     public LeadRequest Submit(LeadRequest request)
//     {
//         var stamped = request with
//         {
//             Id = Guid.NewGuid().ToString(),
//             CreatedAt = DateTimeOffset.UtcNow
//         };
//         return store.SaveRequest(stamped);
//     }
// }