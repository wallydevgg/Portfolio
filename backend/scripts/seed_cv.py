"""Seed the portfolio with CV data (full replacement).

WARNING: This script DELETES all experiences, projects, skills and skill
categories before inserting the CV data. It is intentionally destructive.

Run from the backend directory:
    python -m scripts.seed_cv

Privacy rule: no personal contact info (phone, address, personal email) is
seeded. Contact references use contact@wallydev.dev only.
"""

from sqlalchemy.orm import Session

from core.database import SessionLocal
from domains.portfolio.models import Experience, Project, Skill, SkillCategory
from domains.about.models import AboutSettings


# === Skill categories (bilingual) ===

CATEGORIES = [
    {"en": "Languages", "es": "Lenguajes"},
    {"en": "Frontend", "es": "Frontend"},
    {"en": "Backend", "es": "Backend"},
    {"en": "Databases", "es": "Bases de Datos"},
    {"en": "DevOps & Cloud", "es": "DevOps y Nube"},
    {"en": "Architecture & Methodologies", "es": "Arquitectura y Metodologías"},
    {"en": "Tools", "es": "Herramientas"},
]

# === Skills: (name, level, icon) — icon must match the IconPicker catalog ===

SKILLS = {
    "Languages": [
        ("Python", 95, "Python"),
        ("JavaScript (ES6+)", 92, "JavaScript"),
        ("TypeScript", 90, "TypeScript"),
        ("SQL", 80, None),
        ("HTML5", 90, "HTML5"),
        ("CSS3", 88, "CSS3"),
    ],
    "Frontend": [
        ("React", 93, "React"),
        ("Next.js", 90, "Next.js"),
        ("Angular", 85, "Angular"),
        ("Redux", 85, None),
        ("Zustand", 85, None),
        ("React Query", 85, None),
        ("Tailwind CSS", 88, "Tailwind"),
        ("Shadcn/UI", 85, None),
        ("Material UI", 82, None),
        ("Bootstrap", 80, "Bootstrap"),
        ("Sass", 85, "Sass"),
    ],
    "Backend": [
        ("Django", 92, "Django"),
        ("Django REST Framework", 90, "Django"),
        ("FastAPI", 90, "FastAPI"),
        ("Flask", 85, "Flask"),
        ("Node.js", 88, "Node.js"),
        ("Express", 85, "Express"),
        ("NestJS", 80, None),
        ("Payload CMS", 80, None),
    ],
    "Databases": [
        ("PostgreSQL", 92, "PostgreSQL"),
        ("MySQL", 85, "MySQL"),
        ("MongoDB", 85, "MongoDB"),
        ("Redis", 85, "Redis"),
        ("Cassandra", 75, None),
    ],
    "DevOps & Cloud": [
        ("Docker", 90, "Docker"),
        ("Docker Compose", 85, "Docker"),
        ("AWS (EC2, ECS, RDS, S3)", 85, None),
        ("GitHub Actions", 85, "GitHub Actions"),
        ("GitLab CI/CD", 80, "GitLab"),
        ("Nginx", 85, "Nginx"),
        ("Gunicorn", 80, None),
        ("Linux", 85, "Linux"),
        ("VPS", 80, None),
    ],
    "Architecture & Methodologies": [
        ("Clean Architecture", 88, None),
        ("Domain-Driven Design (DDD)", 85, None),
        ("SOLID", 90, None),
        ("MVC", 85, None),
        ("REST APIs", 88, None),
        ("SaaS Multitenant", 85, None),
        ("ETL", 80, None),
        ("Web Scraping", 80, None),
        ("CI/CD", 85, None),
        ("Scrum", 80, None),
        ("Kanban", 80, None),
    ],
    "Tools": [
        ("Git", 90, "Git"),
        ("GitHub", 90, "GitHub"),
        ("GitLab", 85, "GitLab"),
        ("Postman", 85, "Postman"),
        ("Insomnia", 80, None),
        ("Figma", 80, "Figma"),
    ],
}

# === Experiences ===

EXPERIENCES = [
    {
        "company": "La Joya Mining Group",
        "date": "Feb 2025 – Nov 2025",
        "title": {"en": "Software Engineer — Full Stack", "es": "Software Engineer — Full Stack"},
        "responsibilities": [
            {
                "en": "Modernized a legacy .NET enterprise system into a Django REST Framework + Angular platform applying Clean Architecture and Domain-Driven Design to improve maintainability and scalability.",
                "es": "Participé en la modernización de un sistema empresarial legado en .NET hacia una plataforma basada en Django REST Framework y Angular, aplicando Clean Architecture y Domain-Driven Design para mejorar la mantenibilidad y escalabilidad del sistema.",
            },
            {
                "en": "Built web scraping solutions to automatically integrate data from SUNAT, SUNARP, INGEMMET, REINFO and other government platforms, eliminating manual processes and significantly reducing operational errors.",
                "es": "Desarrollé soluciones de Web Scraping para integrar automáticamente información proveniente de SUNAT, SUNARP, INGEMMET, REINFO y otras plataformas gubernamentales, eliminando procesos manuales y reduciendo significativamente errores operativos.",
            },
            {
                "en": "Built ETL pipelines with Polars to process large volumes of data, reducing report generation times from minutes to seconds.",
                "es": "Construí pipelines ETL utilizando Polars para el procesamiento de grandes volúmenes de información, reduciendo tiempos de generación de reportes de minutos a segundos.",
            },
            {
                "en": "Designed and implemented CI/CD pipelines with GitHub Actions, Docker and AWS (EC2, ECS, RDS, Nginx, Gunicorn), enabling zero-downtime automated deployments.",
                "es": "Diseñé e implementé pipelines CI/CD utilizando GitHub Actions, Docker y AWS (EC2, ECS, RDS, Nginx y Gunicorn), permitiendo despliegues automatizados sin interrupciones.",
            },
            {
                "en": "Integrated the system with Odoo ERP via REST and RPC APIs to synchronize financial and operational data, and automated internal processes with APScheduler scheduled tasks.",
                "es": "Integré el sistema con Odoo ERP mediante APIs REST y RPC para sincronizar información financiera y operativa, y automatizé procesos internos utilizando APScheduler para tareas programadas.",
            },
            {
                "en": "Implemented development standards, code reviews and reusable Angular components that reduced code duplication and eased onboarding for new developers.",
                "es": "Implementé estándares de desarrollo, revisiones de código y componentes reutilizables en Angular que redujeron la duplicidad de código y facilitaron la incorporación de nuevos desarrolladores.",
            },
        ],
    },
    {
        "company": "Next Level Solutions",
        "date": "Jun 2021 – Nov 2024",
        "title": {"en": "Full Stack Developer", "es": "Full Stack Developer"},
        "responsibilities": [
            {
                "en": "Designed and developed SaaS applications using Django REST Framework, Next.js and PostgreSQL.",
                "es": "Diseñé y desarrollé aplicaciones SaaS utilizando Django REST Framework, Next.js y PostgreSQL.",
            },
            {
                "en": "Implemented multitenant architectures with per-database isolation, storage and API for multiple clients.",
                "es": "Implementé arquitecturas multitenant con aislamiento por base de datos, almacenamiento y API para múltiples clientes.",
            },
            {
                "en": "Developed CMS features using Payload CMS and Next.js App Router.",
                "es": "Desarrollé funcionalidades CMS utilizando Payload CMS y Next.js App Router.",
            },
            {
                "en": "Implemented on-demand ISR regeneration using Celery and Redis to improve load times and content publishing.",
                "es": "Implementé mecanismos de regeneración ISR bajo demanda utilizando Celery y Redis para mejorar tiempos de carga y publicación de contenido.",
            },
            {
                "en": "Designed secure architectures using JWT, HttpOnly cookies, role-based access control (RBAC) and CORS policies.",
                "es": "Diseñé arquitecturas seguras utilizando JWT, cookies HttpOnly, control de acceso por roles (RBAC) y políticas CORS.",
            },
            {
                "en": "Integrated payment gateways via webhooks with signature validation and idempotency.",
                "es": "Integré pasarelas de pago mediante webhooks con validación de firma e idempotencia.",
            },
            {
                "en": "Managed infrastructure on AWS, Google Cloud Platform and Linux VPS servers, and redesigned interfaces for tourism and e-commerce platforms with measurable UX and conversion improvements.",
                "es": "Administré infraestructura sobre AWS, Google Cloud Platform y servidores Linux VPS, y rediseñé interfaces para plataformas de turismo y comercio electrónico obteniendo mejoras medibles en experiencia de usuario y conversión.",
            },
        ],
    },
    {
        "company": "Duality Projects",
        "date": "May 2020 – May 2021",
        "title": {"en": "Full Stack Developer", "es": "Full Stack Developer"},
        "responsibilities": [
            {
                "en": "Developed web applications for various clients using React, Flask, PostgreSQL and MongoDB.",
                "es": "Desarrollé aplicaciones web para diversos clientes utilizando React, Flask, PostgreSQL y MongoDB.",
            },
            {
                "en": "Improved Core Web Vitals, SEO and overall performance of existing applications.",
                "es": "Mejoré métricas Core Web Vitals, SEO y rendimiento general de aplicaciones existentes.",
            },
            {
                "en": "Designed UX-oriented interfaces achieving measurable performance and conversion increases.",
                "es": "Diseñé interfaces orientadas a experiencia de usuario logrando incrementos en rendimiento y conversión.",
            },
            {
                "en": "Participated in all development stages, from UX/UI design to production deployment.",
                "es": "Participé en todas las etapas del desarrollo, desde el diseño UX/UI hasta el despliegue en producción.",
            },
        ],
    },
]

# === Projects ===

def _placeholder_image(name: str) -> str:
    """Placeholder image with theme colors (user replaces via dashboard later)."""
    return f"https://placehold.co/600x400/1a1a2e/ff8906?text={name.replace(' ', '+')}"


PROJECTS = [
    {
        "title": {"en": "SIGOMC", "es": "SIGOMC"},
        "description": {
            "en": "Mining operations management system that centralizes collection, laboratory, settlements, document management, operational dashboards and Odoo ERP integration.",
            "es": "Sistema para la gestión de operaciones mineras que centraliza procesos de acopio, laboratorio, liquidaciones, gestión documental, dashboards operativos e integración con Odoo ERP.",
        },
        "tech_stack": ["Python", "Django", "Django REST Framework", "Angular", "PostgreSQL", "Docker", "GitHub Actions", "AWS", "Odoo", "Polars", "APScheduler"],
        "image_url": _placeholder_image("SIGOMC"),
    },
    {
        "title": {"en": "Kafi Wasi", "es": "Kafi Wasi"},
        "description": {
            "en": "SaaS platform for coffee shops integrating CMS, reservation system, content management, multi-company support and cloud infrastructure.",
            "es": "Plataforma SaaS para cafeterías que integra CMS, sistema de reservas, gestión de contenido, multiempresa e infraestructura cloud.",
        },
        "tech_stack": ["React", "Next.js", "Django", "Django REST Framework", "PostgreSQL", "Redis", "Celery", "Payload CMS", "Docker", "AWS", "Google Cloud Platform"],
        "image_url": _placeholder_image("Kafi Wasi"),
    },
    {
        "title": {"en": "NextLevel ERP", "es": "NextLevel ERP"},
        "description": {
            "en": "Modular ERP architecture ready for multiple business verticals with a shared core and client-specific modules.",
            "es": "Arquitectura ERP modular preparada para múltiples verticales de negocio con un núcleo compartido y módulos específicos para cada cliente.",
        },
        "tech_stack": ["React", "Next.js", "Django", "Django REST Framework", "PostgreSQL", "Redis", "Celery", "Payload CMS", "Docker", "AWS"],
        "image_url": _placeholder_image("NextLevel ERP"),
    },
    {
        "title": {"en": "Wallydev Portfolio", "es": "Portafolio de Wallydev"},
        "description": {
            "en": "This very website! A full-stack bilingual portfolio built with React, Vite and FastAPI, featuring a complete admin dashboard, i18n (EN/ES), blog, contact form with Cloudflare Turnstile, SEO and a CI/CD pipeline that deploys to a VPS via Docker and GitHub Actions.",
            "es": "¡Este mismo sitio web! Un portafolio full-stack bilingüe construido con React, Vite y FastAPI, con dashboard de administración completo, i18n (EN/ES), blog, formulario de contacto con Cloudflare Turnstile, SEO y un pipeline de CI/CD que despliega a un VPS mediante Docker y GitHub Actions.",
        },
        "tech_stack": ["React", "Vite", "FastAPI", "PostgreSQL", "Docker", "Nginx", "GitHub Actions", "Lingui", "Sass", "Cloudflare"],
        "image_url": _placeholder_image("Wallydev Portfolio"),
        "website_link": "https://wallydev.dev",
        "github_link": "https://github.com/wallydevgg/Portfolio",
    },
]


def seed_cv(db: Session) -> dict:
    """Full replacement: wipe portfolio tables, then insert CV data."""
    # 1. Wipe (FK-safe order: skills reference categories)
    db.query(Skill).delete()
    db.query(SkillCategory).delete()
    db.query(Experience).delete()
    db.query(Project).delete()
    db.query(AboutSettings).delete()
    db.commit()

    # 1.5 About Settings
    about_text = {
        "en": "Software Engineer with 5+ years of experience designing and developing scalable web applications for mining, education, tourism, finance, accounting and ERP sectors. Specialized in Full Stack solutions using Python (Django, Django REST Framework, FastAPI) and JavaScript/TypeScript (React, Next.js, Angular and Node.js), with experience in legacy system modernization, process automation, multitenant SaaS architectures, enterprise system integration, ETL pipelines and cloud deployments on AWS.\n\nI have participated in every stage of the software lifecycle, from requirements gathering and architecture design to implementation, deployment, monitoring and production optimization. I focus on building maintainable software applying principles like Clean Architecture, Domain-Driven Design (DDD), SOLID and agile methodologies.",
        "es": "Software Engineer con más de 5 años de experiencia diseñando y desarrollando aplicaciones web escalables para los sectores minería, educación, turismo, finanzas, contabilidad y ERP. Especializado en el desarrollo de soluciones Full Stack utilizando Python (Django, Django REST Framework, FastAPI) y JavaScript/TypeScript (React, Next.js, Angular y Node.js), con experiencia en modernización de sistemas legados, automatización de procesos, arquitecturas SaaS multitenant, integración de sistemas empresariales, pipelines ETL y despliegues cloud sobre AWS.\n\nHe participado en todas las etapas del ciclo de vida del software, desde el levantamiento de requerimientos y diseño de arquitectura hasta la implementación, despliegue, monitoreo y optimización en producción. Me enfoco en construir software mantenible aplicando principios como Clean Architecture, Domain-Driven Design (DDD), SOLID y metodologías ágiles."
    }
    db.add(AboutSettings(
        text=about_text,
        image_url="",
        layout=AboutSettings.LAYOUT_TEXT_LEFT
    ))

    # 2. Categories + skills
    categories = {}
    for order, name in enumerate(CATEGORIES):
        cat = SkillCategory(name=name, order=order)
        db.add(cat)
        db.flush()  # get cat.id
        categories[name["en"]] = cat

        for skill_order, (skill_name, level, icon) in enumerate(SKILLS[name["en"]]):
            db.add(Skill(
                name=skill_name,
                level=level,
                icon=icon,
                category_id=cat.id,
                order=skill_order,
            ))

    # 3. Experiences
    for order, exp in enumerate(EXPERIENCES):
        db.add(Experience(
            company=exp["company"],
            date=exp["date"],
            title=exp["title"],
            responsibilities=exp["responsibilities"],
            order=order,
        ))

    # 4. Projects
    for order, proj in enumerate(PROJECTS):
        db.add(Project(
            title=proj["title"],
            description=proj["description"],
            image_url=proj["image_url"],
            tech_stack=proj["tech_stack"],
            website_link=proj.get("website_link"),
            github_link=proj.get("github_link"),
            order=order,
        ))

    db.commit()

    return {
        "categories": len(CATEGORIES),
        "skills": sum(len(v) for v in SKILLS.values()),
        "experiences": len(EXPERIENCES),
        "projects": len(PROJECTS),
    }


def main() -> None:
    db = SessionLocal()
    try:
        counts = seed_cv(db)
        print("Seeded CV data (full replacement):")
        for key, value in counts.items():
            print(f"  {key}: {value}")
    finally:
        db.close()


if __name__ == "__main__":
    main()