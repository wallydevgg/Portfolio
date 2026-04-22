import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Tag, ArrowRight, BookOpen, PenLine, X } from "lucide-react";
import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";

const skeletonLine = "h-[13px] rounded-[4px] mb-3 bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]";
const skeletonBg = "bg-gradient-to-r from-[rgba(167,169,190,0.08)] via-[rgba(167,169,190,0.18)] to-[rgba(167,169,190,0.08)]";

const PostSkeleton = () => (
  <div className="pointer-events-none min-h-[200px] border border-[rgba(167,169,190,0.2)] rounded-[10px] p-6">
    <div className={`${skeletonLine} ${skeletonBg} h-[17px] w-[80%]`} />
    <div className={`${skeletonLine} ${skeletonBg} w-[50%]`} />
    <div className={`${skeletonLine} ${skeletonBg}`} />
    <div className={`${skeletonLine} ${skeletonBg}`} />
    <div className={`${skeletonLine} ${skeletonBg} w-[35%]`} />
    <div className={`${skeletonLine} ${skeletonBg} w-[28%] h-[12px] mt-4`} />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center gap-5 py-20 px-8 text-[var(--parrafos)] text-center">
    <div className="w-20 h-20 rounded-full flex items-center justify-center border border-[rgba(255,137,6,0.25)] bg-[rgba(255,137,6,0.06)] mb-2">
      <PenLine size={48} strokeWidth={1.5} className="text-[var(--color-primary)] opacity-100" />
    </div>
    <h2 className="text-[1.5rem] font-semibold text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
      {t`blog.empty.title`}
    </h2>
    <p className="max-w-[480px] leading-relaxed text-[0.95rem]">{t`blog.empty.subtitle`}</p>
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-[0.4rem] mt-2 px-6 py-[0.65rem] bg-[var(--color-primary)] text-[#0f0e17] rounded-[8px] no-underline font-[var(--font-1)] text-[0.88rem] font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
    >
      {t`blog.empty.cta`}
    </Link>
  </div>
);

const NoResults = ({ onClear }) => (
  <div className="flex flex-col items-center gap-4 py-12 px-8 text-[var(--parrafos)] text-center">
    <Search size={40} strokeWidth={1.5} />
    <p className="max-w-[480px] leading-relaxed text-[0.95rem]">{t`blog.noResults`}</p>
    <button
      onClick={onClear}
      className="inline-flex items-center gap-[0.35rem] bg-none border border-[rgba(167,169,190,0.3)] rounded-[6px] px-[0.9rem] py-[0.4rem] font-[var(--font-1)] text-[0.82rem] cursor-pointer text-[var(--parrafos)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-200"
    >
      <X size={14} /> {t`blog.noResults.clear`}
    </button>
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
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  const isSearching = search.trim().length > 0;
  const isEmpty = !loading && !error && posts.length === 0;
  const noResults = !loading && !error && posts.length > 0 && filtered.length === 0;

  return (
    <>
      <Helmet>
        <title>Blog | wallydev</title>
        <meta name="description" content="Artículos sobre desarrollo fullstack, React, Python, DevOps y arquitectura de software." />
        <meta property="og:title" content="Blog - wallydev" />
        <meta property="og:url" content="https://wallydev.dev/blog" />
      </Helmet>

      <div className="max-w-[960px] mx-auto px-8 pt-12 pb-20 max-[599px]:px-4 max-[599px]:pt-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[2.25rem] font-semibold mb-2 text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
            <span className="hashTag">#</span>blog
          </h1>
          <p className="text-[var(--parrafos)] text-base">{t`blog.subtitle`}</p>
        </div>

        {/* Search */}
        {!isEmpty && (
          <div className="flex items-center gap-[0.6rem] px-4 py-[0.65rem] border border-[rgba(167,169,190,0.3)] rounded-[8px] mb-10 transition-colors duration-200 focus-within:border-[var(--color-primary)]">
            <Search size={16} className="text-[var(--parrafos)] shrink-0" />
            <input
              type="text"
              placeholder={t`blog.searchPlaceholder`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-[var(--font-1)] text-[0.9rem] text-[var(--LM-Title)] dark:text-[var(--DM-Title)] placeholder:text-[var(--parrafos)]"
            />
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                aria-label="clear"
                className="bg-none border-none cursor-pointer text-[var(--parrafos)] p-[2px] flex items-center hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-2 max-[599px]:grid-cols-1">
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-4 py-12 text-[var(--parrafos)] text-center">
            <BookOpen size={40} strokeWidth={1.5} />
            <p className="max-w-[480px] text-[0.95rem]">{t`blog.error`}</p>
          </div>
        )}

        {isEmpty && <EmptyState />}
        {noResults && <NoResults onClear={() => setSearch("")} />}

        {/* Post grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-2 max-[599px]:grid-cols-1">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="flex flex-col justify-between border border-[rgba(167,169,190,0.2)] rounded-[10px] p-6 transition-all duration-[0.25s] hover:border-[var(--color-primary)] hover:-translate-y-[3px]"
              >
                <div className="flex-1">
                  {post.category && (
                    <span className="inline-flex items-center gap-[0.3rem] text-[0.72rem] text-[var(--color-primary)] font-semibold uppercase tracking-[0.04em] mb-[0.6rem]">
                      <Tag size={11} />{post.category.name}
                    </span>
                  )}
                  <h2 className="text-[1.05rem] font-semibold mb-2 leading-[1.4] text-[var(--LM-Title)] dark:text-[var(--DM-Title)]">
                    {post.title}
                  </h2>
                  <div className="flex gap-4 text-[0.78rem] text-[var(--parrafos)] mb-[0.85rem]">
                    <span className="flex items-center gap-[0.3rem]">
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[var(--parrafos)] text-[0.88rem] leading-relaxed mb-5">
                    {post.content ? post.content.replace(/<[^>]+>/g, "").substring(0, 150) + "…" : ""}
                  </p>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-[0.4rem] text-[var(--color-primary)] no-underline text-[0.85rem] font-semibold transition-[gap] duration-200 hover:gap-[0.7rem]"
                >
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
