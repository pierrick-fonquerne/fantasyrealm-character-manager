using FantasyRealm.Application.Interfaces;
using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Repositories
{
    /// <summary>
    /// Provides persistence operations for comments using PostgreSQL.
    /// </summary>
    public sealed class CommentRepository(FantasyRealmDbContext context) : ICommentRepository
    {
        /// <inheritdoc />
        public async Task<Comment?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Comments
                .Include(c => c.Author)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Comment?> GetByCharacterAndAuthorAsync(int characterId, int authorId, CancellationToken cancellationToken)
        {
            return await context.Comments
                .Include(c => c.Author)
                .FirstOrDefaultAsync(c => c.CharacterId == characterId && c.AuthorId == authorId, cancellationToken);
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<Comment>> GetApprovedByCharacterAsync(int characterId, CancellationToken cancellationToken)
        {
            return await context.Comments
                .Include(c => c.Author)
                .Where(c => c.CharacterId == characterId && c.Status == CommentStatus.Approved)
                .OrderByDescending(c => c.CommentedAt)
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<Comment> AddAsync(Comment comment, CancellationToken cancellationToken)
        {
            context.Comments.Add(comment);
            await context.SaveChangesAsync(cancellationToken);

            await context.Entry(comment).Reference(c => c.Author).LoadAsync(cancellationToken);

            return comment;
        }

        /// <inheritdoc />
        public async Task DeleteAsync(Comment comment, CancellationToken cancellationToken)
        {
            context.Comments.Remove(comment);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
