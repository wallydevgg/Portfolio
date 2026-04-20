// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/pages/Blog/BlogPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import "./BlogPage.scss";
import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";

const PostSkeleton = () => (
  <div className="blog-card blog-card--skeleton">
    <div className="skeleton-line skeleton-line--title" />
    <div className="skeleton-line skeleton-line--meta" />
    <div className="skeleton-line" />
    <div className="skeleton-line skeleton-line--short" />
  </div>
);

const BlogPage = () => {
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

  return (
    <>
      <Helmet>
        <title>Blog | wallydev</title>
        <meta name="description" content="Artículos sobre desarrollo fullstack, React, Python, DevOps y arquitectura de software." />
        <meta property="og:title" content="Blog - wallydev" />
        <meta property="og:url" content="https://wallydev.dev/blog" />
      </Helmet>

      <div className="blog-page">
        <div className="blog-header">
          <h1>
            <span className="hashTag">#</span>blog
          </h1>
          <p>{t`blog.subtitle`}</p>
        </div>

        <div className="blog-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={t`blog.searchPlaceholder`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="blog-grid">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="blog-empty">
            <BookOpen size={48} />
            <p>{t`blog.error`}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="blog-empty">
            <BookOpen size={48} />
            <p>{t`blog.noPosts`}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="blog-grid">
            {filtered.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card__body">
                  <h2>{post.title}</h2>
                  <div className="blog-card__meta">
                    <span>
                      <Calendar size={13} />
                      {new Date(post.created_at).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {post.category && (
                      <span>
                        <Tag size={13} />
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <p className="blog-card__excerpt">
                    {post.content.replace(/<[^>]+>/g, "").substring(0, 160)}…
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
