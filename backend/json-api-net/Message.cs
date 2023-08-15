using JsonApiDotNetCore.Resources;
using JsonApiDotNetCore.Resources.Annotations;

namespace JsonApiNet
{
    [Resource(PublicName = "messages")]
    public class Message : Identifiable<int>
    {
        [Attr]
        public string Text { get; set; }

        [HasOne]
        public User? User { get; set; }

        [HasOne]
        public Message? Parent { get; set; }

        [HasMany]
        public IList<Message>? Messages { get; set; }

        public int? UserId { get; set; }
        public int? MessageId { get; set; }
    }
}
