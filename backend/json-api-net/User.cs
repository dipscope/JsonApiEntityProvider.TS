using System.Text.Json.Serialization;
using JsonApiDotNetCore.Resources;
using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "users")]
    public class User : Identifiable<int>
    {
        [Attr]
        public string Name { get; set; }

        [Attr]
        public int Position { get; set; }

        [HasOne]
        public UserStatus? UserStatus { get; set; }
        public int? UserStatusId { get; set; }

        [HasOne]
        public Company? Company { get; set; }
        public int? CompanyId { get; set; }

        [HasMany]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public IList<Message> Messages { get; set; }
    }
}
