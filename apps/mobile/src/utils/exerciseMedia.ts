const EXERCISE_MEDIA_BASE_URL = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

/** Resolves dataset-relative image and GIF paths to files in the public source repository. */
export function resolveExerciseMediaUrl(path: string): string | null {
  const normalizedPath = path.trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
  const segments = normalizedPath.split("/");

  if (
    segments.length !== 2 ||
    segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")
  ) {
    return null;
  }

  const [directory, fileName] = segments;
  const isImage = directory === "images" && /\.(?:jpe?g|png)$/i.test(fileName);
  const isVideo = directory === "videos" && /\.gif$/i.test(fileName);

  if (!isImage && !isVideo) {
    return null;
  }

  return `${EXERCISE_MEDIA_BASE_URL}/${directory}/${encodeURIComponent(fileName)}`;
}
