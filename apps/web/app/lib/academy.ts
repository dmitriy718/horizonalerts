import fs from "fs";
import path from "path";
import matter from "gray-matter";

function getContentDirectory() {
  // Production Docker path (mounted volume)
  const prodPath = path.join(process.cwd(), "content/academy");
  if (fs.existsSync(prodPath)) {
    return prodPath;
  }
  
  // Local development path (relative to apps/web)
  return path.join(process.cwd(), "../../content/academy");
}

const contentDirectory = getContentDirectory();

export interface Lesson {
  slug: string;
  title: string;
  difficulty: string;
  duration: string;
  content: string;
  category: string; // Derived or frontmatter
}

export function getAllLessons(): Lesson[] {
  // Check if directory exists (it might be on a different path in Docker vs Local)
  // In Docker/Prod, we mount ./content to /app/content. 
  // But apps/web runs in /app/apps/web usually? 
  // Actually, let's check the Dockerfile.
  // In Prod, we copy apps/web/app etc. We don't strictly copy root content into the web container image unless specified.
  // Wait, I updated the automation service to volume mount content, but the WEB container needs it too.
  
  // Strategy: I will read from a path that works. 
  // Locally: process.cwd() is apps/web. so ../../content/academy is correct.
  // Prod: I need to ensure content is available. 
  
  if (!fs.existsSync(contentDirectory)) {
    return []; 
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const lessons = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug: fileName.replace(/\.md$/, ""),
        title: data.title || "Untitled Lesson",
        difficulty: data.difficulty || "Beginner",
        duration: data.duration || "10 min",
        category: data.category || "General",
        content,
      };
    });

  return lessons;
}

export function getLessonBySlug(slug: string): Lesson | null {
  const fullPath = path.join(contentDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title,
    difficulty: data.difficulty,
    duration: data.duration,
    category: data.category,
    content,
  };
}
