import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Calendar, Tag, ArrowRight, BookOpen, PenLine, X, MessageSquare, Heart, Share2 } from "lucide-react";
import "./BlogPage.scss";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";


const PostSkeleton = () => (
  <div className="blog-card blog-card--skeleton">
    <div className="skeleton-line skeleton-line--title" />
    <div className="skeleton-line skeleton-line--meta" />
    <div className="skeleton-line" />
    <div className="skeleton-line" />
    <div className="skeleton-line skeleton-line--short" />
    <div className="skeleton-line skeleton-line--link" />
  </div>
);

const EmptyState = () => (
  <div className="blog-empty blog-empty--hero">
    <div className="blog-empty__icon">
      <PenLine size={48} strokeWidth={1.5} />
    </div>
    <h2 className="blog-empty__title">{t`blog.empty.title`}</h2>
    <p className="blog-empty__subtitle">{t`blog.empty.subtitle`}</p>
    <Link to="/dashboard" className="blog-empty__cta">
      {t`blog.empty.cta`}
    </Link>
  </div>
);

const NoResults = ({ onClear }) => (
  <div className="blog-empty">
    <Search size={40} strokeWidth={1.5} />
    <p className="blog-empty__subtitle">{t`blog.noResults`}</p>
    <button className="blog-empty__clear" onClick={onClear}>
      <X size={14} /> {t`blog.noResults.clear`}
    </button>
  </div>
);

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
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
    const url = `${window.location.origin}/blog/${post.slug}`;
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

  return (
    <article className="blog-card">
      <div className="blog-card__body">
        <div className="blog-card__tags">
          {post.category && (
            <span className="blog-card__tag blog-card__tag--category">
              <Tag size={11} />
              {post.category.name}
            </span>
          )}
          {post.tags && post.tags.map((tag) => (
            <span key={tag.id || tag.name} className="blog-card__tag">
              #{tag.name || tag}
            </span>
          ))}
        </div>

        <h2>{post.title}</h2>

        <div className="blog-card__meta">
          <span>
            <Calendar size={12} />
            {new Date(post.created_at).toLocaleDateString("es-PE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <div className="blog-card__stats">
            <button
              className={`blog-card__stat blog-card__stat--like${liked ? " is-liked" : ""}`}
              onClick={handleLike}
              aria-label="like"
            >
              <Heart size={12} fill={liked ? "currentColor" : "none"} /> {likes}
            </button>
            <span className="blog-card__stat">
              <MessageSquare size={12} /> {post.comments_count || 0}
            </span>
            <button className="blog-card__stat" onClick={handleShare} aria-label="share">
              <Share2 size={12} />
            </button>
          </div>
        </div>

        <p className="blog-card__excerpt">
          {post.content
            ? post.content.replace(/<[^>]+>/g, "").substring(0, 150) + "…"
            : ""}
        </p>
      </div>
      <div className="blog-card__footer">
        <Link to={`/blog/${post.slug}`} className="blog-card__link">
          {t`blog.readMore`} <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const BlogPage = () => {
  useLingui();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "/api/v1";
    fetch(`${apiBase}/posts/`)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const isSearching = search.trim().length > 0;
  const isEmpty = !loading && !error && posts.length === 0;
  const noResults = !loading && !error && posts.length > 0 && filtered.length === 0;

  return (
    <>
      <>
        <title>Blog | wallydev</title>
        <meta name="description" content="Artículos sobre desarrollo fullstack, React, Python, DevOps y arquitectura de software." />
        <meta property="og:title" content="Blog - wallydev" />
        <meta property="og:url" content="https://wallydev.dev/blog" />
      </>

      <div className="blog-page-wrapper">
        <div className="blog-page">
          <div className="blog-header">
            <h1>
              <span className="hashTag">#</span>blog
            </h1>
            <p>{t`blog.subtitle`}</p>
          </div>

          {!isEmpty && (
            <div className="blog-search">
              <Search size={16} />
              <input
                type="text"
                placeholder={t`blog.searchPlaceholder`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isSearching && (
                <button
                  className="blog-search__clear"
                  onClick={() => setSearch("")}
                  aria-label="clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="blog-grid">
              {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="blog-empty">
              <BookOpen size={40} strokeWidth={1.5} />
              <p className="blog-empty__subtitle">{t`blog.error`}</p>
            </div>
          )}

          {isEmpty && <EmptyState />}

          {noResults && <NoResults onClear={() => setSearch("")} />}

          {!loading && !error && filtered.length > 0 && (
            <div className="blog-grid">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
