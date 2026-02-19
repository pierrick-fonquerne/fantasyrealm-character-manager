using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Domain.Exceptions;
using Xunit;

namespace FantasyRealm.Tests.Unit.Entities
{
    public class CommentTests
    {
        [Fact]
        public void Approve_WhenPending_SetsStatusApproved()
        {
            var comment = new Comment { Status = CommentStatus.Pending };

            comment.Approve(reviewerId: 5);

            Assert.Equal(CommentStatus.Approved, comment.Status);
            Assert.Equal(5, comment.ReviewedById);
            Assert.NotNull(comment.ReviewedAt);
        }

        [Fact]
        public void Approve_WhenNotPending_ThrowsDomainException()
        {
            var comment = new Comment { Status = CommentStatus.Approved };

            var ex = Assert.Throws<DomainException>(() => comment.Approve(reviewerId: 5));
            Assert.Contains("en attente", ex.Message);
        }

        [Fact]
        public void Reject_WhenPending_SetsStatusRejected()
        {
            var comment = new Comment { Status = CommentStatus.Pending };

            comment.Reject("Contenu inapproprié pour la plateforme", reviewerId: 5);

            Assert.Equal(CommentStatus.Rejected, comment.Status);
            Assert.Equal("Contenu inapproprié pour la plateforme", comment.RejectionReason);
            Assert.Equal(5, comment.ReviewedById);
            Assert.NotNull(comment.ReviewedAt);
        }

        [Fact]
        public void Reject_WhenNotPending_ThrowsDomainException()
        {
            var comment = new Comment { Status = CommentStatus.Rejected };

            var ex = Assert.Throws<DomainException>(() =>
                comment.Reject("Raison valide de plus de dix chars", reviewerId: 5));
            Assert.Contains("en attente", ex.Message);
        }

        [Fact]
        public void Reject_WhenReasonTooShort_ThrowsDomainException()
        {
            var comment = new Comment { Status = CommentStatus.Pending };

            var ex = Assert.Throws<DomainException>(() =>
                comment.Reject("Court", reviewerId: 5));
            Assert.Contains("au moins 10 caractères", ex.Message);
        }

        [Fact]
        public void Reject_WhenReasonTooLong_ThrowsDomainException()
        {
            var comment = new Comment { Status = CommentStatus.Pending };
            var longReason = new string('x', 501);

            var ex = Assert.Throws<DomainException>(() =>
                comment.Reject(longReason, reviewerId: 5));
            Assert.Contains("500 caractères", ex.Message);
        }

        [Fact]
        public void Reject_WhenReasonEmpty_ThrowsDomainException()
        {
            var comment = new Comment { Status = CommentStatus.Pending };

            var ex = Assert.Throws<DomainException>(() =>
                comment.Reject("", reviewerId: 5));
            Assert.Contains("obligatoire", ex.Message);
        }

        [Fact]
        public void Create_ReturnsCommentInPendingStatus()
        {
            var comment = Comment.Create(4, "Great character!", 10, 20);

            Assert.Equal(4, comment.Rating);
            Assert.Equal("Great character!", comment.Text);
            Assert.Equal(CommentStatus.Pending, comment.Status);
            Assert.Equal(10, comment.CharacterId);
            Assert.Equal(20, comment.AuthorId);
        }
    }
}
