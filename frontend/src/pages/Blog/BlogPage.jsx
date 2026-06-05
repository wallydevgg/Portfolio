import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Tag, ArrowRight, BookOpen, PenLine, X } from "lucide-react";
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
              <article key={post.id} className="blog-card">
                <div className="blog-card__body">
                  {post.category && (
                    <span className="blog-card__category">
                      <Tag size={11} />
                      {post.category.name}
                    </span>
                  )}
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
                  </div>
                  <p className="blog-card__excerpt">
                    {post.content
                      ? post.content.replace(/<[^>]+>/g, "").substring(0, 150) + "…"
                      : ""}
                  </p>
                </div>
                <Link to={`/blog/${post.slug}`} className="blog-card__link">
                  {t`blog.readMore`} <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;
