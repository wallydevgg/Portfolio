import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, Tag, Heart, MessageSquare, Share2, BookOpen, Send, User } from "lucide-react";
import "./BlogPostPage.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const BlogPostPage = () => {
  useLingui();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liking, setLiking] = useState(false);

  // comments
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "/api/v1";
    fetch(`${apiBase}/posts/slug/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLikes(data.likes_count || 0);
        setLoading(false);
        return fetch(`${apiBase}/posts/${data.id}/comments`);
      })
      .then((r) => {
        if (!r.ok) throw new Error("comments fetch failed");
        return r.json();
      })
      .then((data) => {
        setComments(data);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const handleLike = async () => {
    if (liking || !post) return;
    setLiking(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "/api/v1";
      const res = await fetch(`${apiBase}/posts/${post.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikes(data.likes_count);
      }
    } catch {
      // silent fail — keep current state
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!post || submitting) return;
    if (!authorName.trim() || !commentContent.trim()) {
      setSubmitError(t`blog.comments.requiredFields`);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const apiBase = import.meta.env.VITE_API_URL || "/api/v1";
      const res = await fetch(`${apiBase}/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName.trim(),
          content: commentContent.trim(),
        }),
      });
      if (res.status === 429) {
        setSubmitError(t`blog.comments.rateLimited`);
        setSubmitting(false);
        return;
      }
      if (!res.ok) throw new Error("comment submit failed");
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setCommentContent("");
      setSubmitting(false);
    } catch {
      setSubmitError(t`blog.comments.error`);
      setSubmitting(false);
    }
  };

  return (
    <>
      {post && (
        <>
          <title>{post.title} | wallydev</title>
          <meta name="description" content={post.content ? post.content.replace(/<[^>]+>/g, "").substring(0, 160) : ""} />
          <meta property="og:title" content={post.title} />
          <meta property="og:url" content={`https://wallydev.dev/blog/${post.slug}`} />
        </>
      )}

      <div className="blog-post-wrapper">
        <div className="blog-post">
          <Link to="/blog" className="blog-post__back">
            <ArrowLeft size={16} /> {t`blog.backToList`}
          </Link>

          {loading && (
            <div className="blog-post__skeleton">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--meta" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          )}

          {error && (
            <div className="blog-empty">
              <BookOpen size={40} strokeWidth={1.5} />
              <p className="blog-empty__subtitle">{t`blog.error`}</p>
              <Link to="/blog" className="blog-empty__cta">
                {t`blog.backToList`}
              </Link>
            </div>
          )}

          {post && (
            <article className="blog-post__article">
              <div className="blog-post__tags">
                {post.category && (
                  <span className="blog-post__tag blog-post__tag--category">
                    <Tag size={11} />
                    {post.category.name}
                  </span>
                )}
                {post.tags && post.tags.map((tag) => (
                  <span key={tag.id || tag.name} className="blog-post__tag">
                    #{tag.name || tag}
                  </span>
                ))}
              </div>

              <h1 className="blog-post__title">{post.title}</h1>

              <div className="blog-post__meta">
                <span>
                  <Calendar size={13} />
                  {new Date(post.created_at).toLocaleDateString("es-PE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div
                className="blog-post__content"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              {/* Action bar — like + share */}
              <div className="blog-post__actions">
                <button
                  className={`blog-post__action blog-post__action--like${liked ? " is-liked" : ""}`}
                  onClick={handleLike}
                  disabled={liking}
                  aria-label="like"
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  {likes > 0 ? likes : t`blog.actions.like`}
                </button>
                <button
                  className="blog-post__action blog-post__action--share"
                  onClick={handleShare}
                  aria-label="share"
                >
                  <Share2 size={16} /> {t`blog.actions.share`}
                </button>
              </div>
            </article>
          )}

          {post && (
            <section className="blog-post__comments">
              <h2 className="blog-post__comments-title">
                <MessageSquare size={17} />
                {t`blog.comments.title`} ({comments.length})
              </h2>

              <div className="blog-post__comments-list">
                {comments.length === 0 && (
                  <p className="blog-post__comments-empty">{t`blog.comments.empty`}</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="blog-post__comment">
                    <div className="blog-post__comment-avatar">
                      <User size={14} />
                    </div>
                    <div className="blog-post__comment-body">
                      <div className="blog-post__comment-head">
                        <span className="blog-post__comment-author">{c.author_name}</span>
                        <span className="blog-post__comment-date">
                          {new Date(c.created_at).toLocaleDateString("es-PE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="blog-post__comment-content">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form className="blog-post__comment-form" onSubmit={handleCommentSubmit}>
                <h3 className="blog-post__comment-form-title">{t`blog.comments.leaveComment`}</h3>
                {submitError && (
                  <p className="blog-post__comment-form-error">{submitError}</p>
                )}
                <input
                  type="text"
                  className="blog-post__comment-input"
                  placeholder={t`blog.comments.namePlaceholder`}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={60}
                />
                <textarea
                  className="blog-post__comment-textarea"
                  placeholder={t`blog.comments.contentPlaceholder`}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <button
                  type="submit"
                  className="blog-post__comment-submit"
                  disabled={submitting}
                >
                  <Send size={14} />
                  {submitting ? t`blog.comments.sending` : t`blog.comments.submit`}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPostPage;