const localImages = require.context("../../assets/images", false, /\.(?:jpe?g|png)$/i);
const localVideos = require.context("../../assets/videos", false, /\.gif$/i);

type MediaContext = ((key: string) => number) & { keys(): string[] };

const localImageKeys = new Set(localImages.keys());
const localVideoKeys = new Set(localVideos.keys());

function getLocalAsset(context: MediaContext, availableKeys: ReadonlySet<string>, fileName: string): number | null {
  const key = `./${fileName}`;

  if (!availableKeys.has(key)) {
    return null;
  }

  return context(key);
}

/** Resolves dataset-relative image and GIF paths to bundled local assets. */
export function resolveExerciseMediaAsset(path: string): number | null {
  const normalizedPath = path.trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
  const segments = normalizedPath.split("/");

  if (
    segments.length !== 2 ||
    segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")
  ) {
    return null;
  }

  const [directory, fileName] = segments;

  if (directory === "images" && /\.(?:jpe?g|png)$/i.test(fileName)) {
    return getLocalAsset(localImages, localImageKeys, fileName);
  }

  if (directory === "videos" && /\.gif$/i.test(fileName)) {
    return getLocalAsset(localVideos, localVideoKeys, fileName);
  }

  return null;
}
