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
                .Include(c => c.Character)
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

        /// <inheritdoc />
        public async Task<(IReadOnlyList<Comment> Items, int TotalCount)> GetPendingAsync(int page, int pageSize, CancellationToken cancellationToken)
        {
            var totalCount = await context.Comments
                .CountAsync(c => c.Status == CommentStatus.Pending, cancellationToken);

            var items = await context.Comments
                .Include(c => c.Author)
                .Include(c => c.Character)
                .Where(c => c.Status == CommentStatus.Pending)
                .OrderBy(c => c.CommentedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        /// <inheritdoc />
        public async Task<int> CountPendingAsync(CancellationToken cancellationToken)
        {
            return await context.Comments
                .CountAsync(c => c.Status == CommentStatus.Pending, cancellationToken);
        }

        /// <inheritdoc />
        public async Task UpdateAsync(Comment comment, CancellationToken cancellationToken)
        {
            context.Comments.Update(comment);
            await context.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc />
        public async Task<int> CountAllAsync(CancellationToken cancellationToken)
        {
            return await context.Comments.CountAsync(cancellationToken);
        }
    }
}
