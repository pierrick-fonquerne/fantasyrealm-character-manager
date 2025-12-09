using FantasyRealm.Domain.Entities;
using MongoDB.Driver;

namespace FantasyRealm.Infrastructure.Persistence
{
    /// <summary>
    /// MongoDB context for activity logs storage.
    /// </summary>
    public class MongoDbContext(IMongoClient client, string databaseName)
    {
        private readonly IMongoDatabase _database = client.GetDatabase(databaseName);

        public IMongoCollection<ActivityLog> ActivityLogs
            => _database.GetCollection<ActivityLog>("activity_logs");
    }
}
