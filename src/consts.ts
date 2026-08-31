export const SITE = {
  TITLE: "Elizabeth Le Grange",
  DESCRIPTION: "Portfolio of Elizabeth Le Grange",
  EMAIL: "elegrange11@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
}

// Open Graph / Social Media Preview Image
export const IMAGE = "/flow.jpeg"

export const STUDIO = {
  TITLE: "Studio",
  DESCRIPTION: "Inside the art studio.",
}

export const SEARCH = {
  TITLE: "Search",
  DESCRIPTION: "Search the portfolio.",
}

// Controls pages in the build (Keeping only active paths to prevent errors)
export const LINKS = [
  { TEXT: "Home", HREF: "/" },
  { TEXT: "Studio", HREF: "/studio" },
]

// Controls the header navigation menu on your website (Shows only Home and Studio)
export const NAV_LINKS = [
  { href: "/", label: "home" },
  { href: "/studio", label: "studio" },
]

export const SOCIALS = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "elegrange11@gmail.com",
    HREF: "mailto:elegrange11@gmail.com",
  },
  {
    NAME: "Instagram",
    ICON: "instagram",
    TEXT: "@elizabeth_le_grange",
    HREF: "https://www.instagram.com/elizabeth_le_grange?utm_source=qr&igsh=djhsbGppMGlycXp1",
  },
]

export const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/elizabeth_le_grange?utm_source=qr&igsh=djhsbGppMGlycXp1", label: "instagram" },
]

// These lines keep the automated template pages from crashing during the build phase
export const PROJECTS: any[] = []
export const WORK: any[] = []
export const BLOG = { TITLE: "Blog", DESCRIPTION: "Journal and updates." }