using FantasyRealm.Domain.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents an activity log entry stored in MongoDB.
    /// </summary>
    public class ActivityLog
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; }

        [BsonElement("user_id")]
        public int UserId { get; set; }

        [BsonElement("user_pseudo")]
        public string UserPseudo { get; set; } = string.Empty;

        [BsonElement("action")]
        [BsonRepresentation(BsonType.String)]
        public ActivityAction Action { get; set; }

        [BsonElement("target_type")]
        public string TargetType { get; set; } = string.Empty;

        [BsonElement("target_id")]
        public int TargetId { get; set; }

        [BsonElement("target_name")]
        public string? TargetName { get; set; }

        [BsonElement("details")]
        public BsonDocument? Details { get; set; }

        [BsonElement("ip_address")]
        public string? IpAddress { get; set; }
    }
}
