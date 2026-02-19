using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;
using Xunit;

namespace FantasyRealm.Tests.Unit.Entities
{
    public class CharacterTests
    {
        [Fact]
        public void SubmitForReview_WhenDraft_SetsStatusPending()
        {
            var character = new Character { Status = CharacterStatus.Draft };

            character.SubmitForReview();

            Assert.Equal(CharacterStatus.Pending, character.Status);
        }

        [Fact]
        public void SubmitForReview_WhenRejected_SetsStatusPending()
        {
            var character = new Character { Status = CharacterStatus.Rejected };

            character.SubmitForReview();

            Assert.Equal(CharacterStatus.Pending, character.Status);
        }

        [Fact]
        public void SubmitForReview_WhenApproved_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Approved };

            var ex = Assert.Throws<DomainException>(() => character.SubmitForReview());
            Assert.Contains("brouillon ou rejetés", ex.Message);
        }

        [Fact]
        public void SubmitForReview_WhenPending_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Pending };

            Assert.Throws<DomainException>(() => character.SubmitForReview());
        }

        [Fact]
        public void Approve_WhenPending_SetsStatusApproved()
        {
            var character = new Character { Status = CharacterStatus.Pending };

            character.Approve();

            Assert.Equal(CharacterStatus.Approved, character.Status);
        }

        [Fact]
        public void Approve_WhenNotPending_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Draft };

            var ex = Assert.Throws<DomainException>(() => character.Approve());
            Assert.Contains("en attente", ex.Message);
        }

        [Fact]
        public void Reject_WhenPending_SetsStatusRejected()
        {
            var character = new Character { Status = CharacterStatus.Pending };

            character.Reject();

            Assert.Equal(CharacterStatus.Rejected, character.Status);
        }

        [Fact]
        public void Reject_WhenNotPending_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Approved };

            var ex = Assert.Throws<DomainException>(() => character.Reject());
            Assert.Contains("en attente", ex.Message);
        }

        [Fact]
        public void ToggleShare_WhenApproved_TogglesIsShared()
        {
            var character = new Character { Status = CharacterStatus.Approved, IsShared = false };

            character.ToggleShare();
            Assert.True(character.IsShared);

            character.ToggleShare();
            Assert.False(character.IsShared);
        }

        [Fact]
        public void ToggleShare_WhenNotApproved_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Draft };

            var ex = Assert.Throws<DomainException>(() => character.ToggleShare());
            Assert.Contains("approuvés", ex.Message);
        }

        [Fact]
        public void UpdateAppearance_WhenApprovedAndNameChanged_SetsStatusPending()
        {
            var character = new Character
            {
                Name = "OldName",
                Status = CharacterStatus.Approved,
                IsShared = true
            };

            character.UpdateAppearance(
                "NewName", 1, Gender.Male,
                "#fff", "#000", "#111", "short",
                "round", "small", "wide", "oval");

            Assert.Equal(CharacterStatus.Pending, character.Status);
            Assert.False(character.IsShared);
        }

        [Fact]
        public void UpdateAppearance_WhenApprovedAndNameUnchanged_KeepsStatusApproved()
        {
            var character = new Character
            {
                Name = "SameName",
                Status = CharacterStatus.Approved,
                IsShared = true
            };

            character.UpdateAppearance(
                "SameName", 1, Gender.Male,
                "#fff", "#000", "#111", "short",
                "round", "small", "wide", "oval");

            Assert.Equal(CharacterStatus.Approved, character.Status);
            Assert.True(character.IsShared);
        }

        [Fact]
        public void UpdateAppearance_WhenPending_ThrowsDomainException()
        {
            var character = new Character { Status = CharacterStatus.Pending };

            var ex = Assert.Throws<DomainException>(() =>
                character.UpdateAppearance(
                    "Name", 1, Gender.Male,
                    "#fff", "#000", "#111", "short",
                    "round", "small", "wide", "oval"));

            Assert.Contains("brouillon, rejetés ou approuvés", ex.Message);
        }

        [Fact]
        public void Create_ReturnsCharacterInDraftStatus()
        {
            var character = Character.Create(
                "Hero", 1, Gender.Male,
                "#fff", "#000", "#111", "short",
                "round", "small", "wide", "oval", 42);

            Assert.Equal("Hero", character.Name);
            Assert.Equal(CharacterStatus.Draft, character.Status);
            Assert.Equal(42, character.UserId);
            Assert.False(character.IsShared);
        }

        [Fact]
        public void Duplicate_ReturnsNewCharacterInDraftStatus()
        {
            var source = new Character
            {
                Name = "Original",
                ClassId = 2,
                Gender = Gender.Female,
                Status = CharacterStatus.Approved,
                SkinColor = "#aaa",
                EyeColor = "#bbb",
                HairColor = "#ccc",
                HairStyle = "long",
                EyeShape = "almond",
                NoseShape = "pointed",
                MouthShape = "thin",
                FaceShape = "round",
                UserId = 10
            };

            var duplicate = Character.Duplicate(source, "Clone", 10);

            Assert.Equal("Clone", duplicate.Name);
            Assert.Equal(CharacterStatus.Draft, duplicate.Status);
            Assert.Equal(source.ClassId, duplicate.ClassId);
            Assert.Equal(source.Gender, duplicate.Gender);
            Assert.Equal(source.SkinColor, duplicate.SkinColor);
            Assert.False(duplicate.IsShared);
        }
    }
}
