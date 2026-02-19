using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;

namespace FantasyRealm.Domain.Entities
{
    /// <summary>
    /// Represents a player character created by a user.
    /// </summary>
    public class Character
    {
        public int Id { get; set; }

        public string Name { get; internal set; } = string.Empty;

        public int ClassId { get; internal set; }

        public Gender Gender { get; internal set; }

        public CharacterStatus Status { get; internal set; }

        public string SkinColor { get; internal set; } = string.Empty;

        public string EyeColor { get; internal set; } = string.Empty;

        public string HairColor { get; internal set; } = string.Empty;

        public string HairStyle { get; internal set; } = string.Empty;

        public string EyeShape { get; internal set; } = string.Empty;

        public string NoseShape { get; internal set; } = string.Empty;

        public string MouthShape { get; internal set; } = string.Empty;

        public string FaceShape { get; internal set; } = string.Empty;

        public byte[]? Image { get; internal set; }

        public bool IsShared { get; internal set; }

        public DateTime CreatedAt { get; internal set; }

        public DateTime UpdatedAt { get; internal set; }

        public int UserId { get; internal set; }

        public User User { get; set; } = null!;

        public CharacterClass Class { get; set; } = null!;

        public ICollection<CharacterArticle> CharacterArticles { get; set; } = [];

        public ICollection<Comment> Comments { get; set; } = [];

        /// <summary>
        /// Creates a new character in draft status.
        /// </summary>
        public static Character Create(
            string name,
            int classId,
            Gender gender,
            string skinColor,
            string eyeColor,
            string hairColor,
            string hairStyle,
            string eyeShape,
            string noseShape,
            string mouthShape,
            string faceShape,
            int userId)
        {
            return new Character
            {
                Name = name,
                ClassId = classId,
                Gender = gender,
                Status = CharacterStatus.Draft,
                SkinColor = skinColor,
                EyeColor = eyeColor,
                HairColor = hairColor,
                HairStyle = hairStyle,
                EyeShape = eyeShape,
                NoseShape = noseShape,
                MouthShape = mouthShape,
                FaceShape = faceShape,
                IsShared = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };
        }

        /// <summary>
        /// Creates a duplicate of an existing character with a new name in draft status.
        /// </summary>
        /// <param name="source">The character to duplicate.</param>
        /// <param name="newName">The name for the duplicate.</param>
        /// <param name="userId">The owner of the duplicate.</param>
        public static Character Duplicate(Character source, string newName, int userId)
        {
            return new Character
            {
                Name = newName,
                ClassId = source.ClassId,
                Gender = source.Gender,
                Status = CharacterStatus.Draft,
                SkinColor = source.SkinColor,
                EyeColor = source.EyeColor,
                HairColor = source.HairColor,
                HairStyle = source.HairStyle,
                EyeShape = source.EyeShape,
                NoseShape = source.NoseShape,
                MouthShape = source.MouthShape,
                FaceShape = source.FaceShape,
                IsShared = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };
        }

        /// <summary>
        /// Submits the character for moderation review.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the character is not in a submittable state.</exception>
        public void SubmitForReview()
        {
            if (Status is not (CharacterStatus.Draft or CharacterStatus.Rejected))
                throw new DomainException("Seuls les personnages en brouillon ou rejetés peuvent être soumis.");

            Status = CharacterStatus.Pending;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Approves the character after moderation review.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the character is not pending review.</exception>
        public void Approve()
        {
            if (Status is not CharacterStatus.Pending)
                throw new DomainException("Seuls les personnages en attente peuvent être approuvés.");

            Status = CharacterStatus.Approved;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Rejects the character after moderation review.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the character is not pending review.</exception>
        public void Reject()
        {
            if (Status is not CharacterStatus.Pending)
                throw new DomainException("Seuls les personnages en attente peuvent être rejetés.");

            Status = CharacterStatus.Rejected;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Toggles the shared visibility of an approved character.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the character is not approved.</exception>
        public void ToggleShare()
        {
            if (Status != CharacterStatus.Approved)
                throw new DomainException("Seuls les personnages approuvés peuvent être partagés.");

            IsShared = !IsShared;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Updates the character appearance and metadata.
        /// If the character is approved and the name changes, it is automatically re-submitted for review.
        /// </summary>
        /// <exception cref="DomainException">Thrown when the character is not in an editable state.</exception>
        public void UpdateAppearance(
            string name,
            int classId,
            Gender gender,
            string skinColor,
            string eyeColor,
            string hairColor,
            string hairStyle,
            string eyeShape,
            string noseShape,
            string mouthShape,
            string faceShape)
        {
            if (Status is not (CharacterStatus.Draft or CharacterStatus.Rejected or CharacterStatus.Approved))
                throw new DomainException("Seuls les personnages en brouillon, rejetés ou approuvés peuvent être modifiés.");

            var nameChanged = !string.Equals(Name, name, StringComparison.Ordinal);

            Name = name;
            ClassId = classId;
            Gender = gender;
            SkinColor = skinColor;
            EyeColor = eyeColor;
            HairColor = hairColor;
            HairStyle = hairStyle;
            EyeShape = eyeShape;
            NoseShape = noseShape;
            MouthShape = mouthShape;
            FaceShape = faceShape;
            UpdatedAt = DateTime.UtcNow;

            if (Status == CharacterStatus.Approved && nameChanged)
            {
                Status = CharacterStatus.Pending;
                IsShared = false;
            }
        }
    }
}
