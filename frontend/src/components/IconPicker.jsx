import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiNodedotjs,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiGithub,
  SiGitlab,
  SiLinux,
  SiNginx,
  SiHtml5,
  SiCss,
  SiSass,
  SiTailwindcss,
  SiBootstrap,
  SiVite,
  SiWebpack,
  SiBabel,
  SiEslint,
  SiPrettier,
  SiJest,
  SiVitest,
  SiCypress,
  SiGraphql,
  SiOpenapiinitiative,
  SiJson,
  SiYaml,
  SiMarkdown,
  SiVercel,
  SiNetlify,
  SiCloudflare,
  SiDigitalocean,
  SiGooglecloud,
  SiFirebase,
  SiSupabase,
  SiMinio,
  SiNpm,
  SiPnpm,
  SiYarn,
  SiFigma,
  SiPostman,
  SiSwagger,
  SiRust,
  SiGo,
  SiPhp,
  SiLaravel,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiNextdotjs,
  SiNuxt,
  SiExpress,
  SiPrisma,
  SiSqlite,
  SiElasticsearch,
  SiRabbitmq,
  SiApachekafka,
  SiPrometheus,
  SiGrafana,
  SiTerraform,
  SiAnsible,
  SiJenkins,
  SiGithubactions,
  SiCircleci,
  SiUbuntu,
  SiDebian,
  SiCentos,
  SiAlpinelinux,
  SiGnubash,
  SiVim,
  SiVscodium,
  SiPycharm,
  SiIntellijidea,
  SiWebstorm,
  SiAndroid,
  SiApple,
  SiDart,
  SiFlutter,
  SiKotlin,
  SiSwift,
  SiCplusplus,
  SiC,
  SiOpenjdk,
  SiDotnet,
  SiUnity,
  SiUnrealengine,
  SiBlender,
  SiArduino,
  SiRaspberrypi,
  SiOpencv,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiJupyter,
  SiKeras,
  SiHuggingface,
  SiAnthropic,
  SiClaude,
  SiLangchain,
  SiRedux,
} from "react-icons/si";
import { FaAws, FaDatabase, FaLayerGroup } from "react-icons/fa6";
import "./IconPicker.scss";

/**
 * Catálogo curado de iconos de tecnología (Simple Icons).
 * Mantiene el bundle pequeño en vez de importar los ~3000 iconos de react-icons.
 */
const ICONS = [
// Frontend
  { name: "React", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "Vue", icon: SiVuedotjs },
  { name: "Angular", icon: SiAngular },
  { name: "Svelte", icon: SiSvelte },
  { name: "Nuxt", icon: SiNuxt },
  { name: "HTML5", icon: SiHtml5 },
  { name: "CSS3", icon: SiCss },
  { name: "Sass", icon: SiSass },
  { name: "Tailwind", icon: SiTailwindcss },
  { name: "Bootstrap", icon: SiBootstrap },
  { name: "Redux", icon: SiRedux },
  { name: "Zustand", icon: FaLayerGroup },
  // Lenguajes
  { name: "TypeScript", icon: SiTypescript },
  { name: "JavaScript", icon: SiJavascript },
  { name: "Python", icon: SiPython },
  { name: "Rust", icon: SiRust },
  { name: "Go", icon: SiGo },
  { name: "Java", icon: SiOpenjdk },
  { name: "PHP", icon: SiPhp },
  { name: "C++", icon: SiCplusplus },
  { name: "C", icon: SiC },
  { name: "C#", icon: SiDotnet },
  { name: "Dart", icon: SiDart },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Swift", icon: SiSwift },
  { name: "Bash", icon: SiGnubash },
  // Backend
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Express", icon: SiExpress },
  { name: "FastAPI", icon: SiFastapi },
  { name: "Django", icon: SiDjango },
  { name: "Flask", icon: SiFlask },
  { name: "Laravel", icon: SiLaravel },
  { name: ".NET", icon: SiDotnet },
  { name: "GraphQL", icon: SiGraphql },
  { name: "OpenAPI", icon: SiOpenapiinitiative },
  // Bases de datos
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "MySQL", icon: SiMysql },
  { name: "MongoDB", icon: SiMongodb },
  { name: "Redis", icon: SiRedis },
  { name: "SQLite", icon: SiSqlite },
  { name: "SQL", icon: FaDatabase },
  { name: "Elasticsearch", icon: SiElasticsearch },
  // DevOps / Infra
  { name: "Docker", icon: SiDocker },
  { name: "Kubernetes", icon: SiKubernetes },
  { name: "Git", icon: SiGit },
  { name: "GitHub", icon: SiGithub },
  { name: "GitLab", icon: SiGitlab },
  { name: "Linux", icon: SiLinux },
  { name: "Nginx", icon: SiNginx },
  { name: "Terraform", icon: SiTerraform },
  { name: "Ansible", icon: SiAnsible },
  { name: "Jenkins", icon: SiJenkins },
  { name: "GitHub Actions", icon: SiGithubactions },
  { name: "CircleCI", icon: SiCircleci },
  { name: "Prometheus", icon: SiPrometheus },
  { name: "Grafana", icon: SiGrafana },
  { name: "RabbitMQ", icon: SiRabbitmq },
  { name: "Apache Kafka", icon: SiApachekafka },
  // Cloud
  { name: "DigitalOcean", icon: SiDigitalocean },
  { name: "Google Cloud", icon: SiGooglecloud },
  { name: "Vercel", icon: SiVercel },
  { name: "Netlify", icon: SiNetlify },
  { name: "Cloudflare", icon: SiCloudflare },
  { name: "AWS", icon: FaAws },
  { name: "Firebase", icon: SiFirebase },
  { name: "Supabase", icon: SiSupabase },
  { name: "MinIO", icon: SiMinio },
  // Herramientas
  { name: "Vite", icon: SiVite },
  { name: "Webpack", icon: SiWebpack },
  { name: "Babel", icon: SiBabel },
  { name: "ESLint", icon: SiEslint },
  { name: "Prettier", icon: SiPrettier },
  { name: "Jest", icon: SiJest },
  { name: "Vitest", icon: SiVitest },
  { name: "Cypress", icon: SiCypress },
  { name: "npm", icon: SiNpm },
  { name: "pnpm", icon: SiPnpm },
  { name: "Yarn", icon: SiYarn },
  { name: "Postman", icon: SiPostman },
  { name: "Swagger", icon: SiSwagger },
  { name: "Figma", icon: SiFigma },
  { name: "VS Code", icon: SiVscodium },
  { name: "PyCharm", icon: SiPycharm },
  { name: "IntelliJ", icon: SiIntellijidea },
  { name: "WebStorm", icon: SiWebstorm },
  { name: "Vim", icon: SiVim },
  // OS / Plataformas
  { name: "Ubuntu", icon: SiUbuntu },
  { name: "Debian", icon: SiDebian },
  { name: "Alpine", icon: SiAlpinelinux },
  { name: "Android", icon: SiAndroid },
  { name: "Apple", icon: SiApple },
  // IA / ML
  { name: "TensorFlow", icon: SiTensorflow },
  { name: "PyTorch", icon: SiPytorch },
  { name: "scikit-learn", icon: SiScikitlearn },
  { name: "Pandas", icon: SiPandas },
  { name: "NumPy", icon: SiNumpy },
  { name: "Jupyter", icon: SiJupyter },
  { name: "OpenCV", icon: SiOpencv },
  { name: "Hugging Face", icon: SiHuggingface },
  { name: "Anthropic", icon: SiAnthropic },
  { name: "Claude", icon: SiClaude },
  { name: "LangChain", icon: SiLangchain },
];

const IconPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter(({ name }) => name.toLowerCase().includes(q));
  }, [query]);

  const selected = ICONS.find(({ name }) => name === value);

  return (
    <div className="icon-picker">
      <div className="icon-picker__trigger">
        {selected ? (
          <span className="icon-picker__selected">
            <selected.icon size={20} />
            {selected.name}
          </span>
        ) : (
          <span className="icon-picker__placeholder">Select an icon…</span>
        )}
        <button
          type="button"
          className="icon-picker__btn"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Choose"}
        </button>
        {value && (
          <button
            type="button"
            className="icon-picker__clear"
            onClick={() => onChange("")}
            title="Clear icon"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="icon-picker__dropdown">
          <div className="icon-picker__search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="icon-picker__grid">
            {filtered.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                className={`icon-picker__option ${value === name ? "icon-picker__option--active" : ""}`}
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Icon size={20} />
                <span>{name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="icon-picker__empty">No icons match "{query}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;

/**
 * Resolves an icon name to its component, for use outside the picker
 * (e.g. rendering skill icons on the public site). Returns null for
 * unknown names so rendering never crashes.
 */
export function resolveSkillIcon(name) {
  if (!name) return null;
  const match = ICONS.find(
    ({ name: n }) => n.toLowerCase() === String(name).toLowerCase()
  );
  return match ? match.icon : null;
}