import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { shopifyQuery } from "../client";
import { CACHE_TAGS } from "../constants";

const GET_HOMEPAGE_HERO_METAOBJECT_QUERY = /* GraphQL */ `
  query GetHomepageHeroMetaobject($type: String!, $handle: String!) {
    metaobjectByHandle(handle: { type: $type, handle: $handle }) {
      id
      handle
      type
      fields {
        key
        value
        type
        reference {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            url
          }
          ... on Video {
            sources {
              url
              mimeType
            }
          }
        }
      }
    }
  }
`;

type MetaobjectReference =
  | {
      __typename: "MediaImage";
      image?: {
        url?: string | null;
      } | null;
    }
  | {
      __typename: "GenericFile";
      url?: string | null;
    }
  | {
      __typename: "Video";
      sources?: Array<{
        url?: string | null;
        mimeType?: string | null;
      }> | null;
    }
  | {
      __typename: string;
    };

interface MetaobjectFieldRaw {
  key: string;
  value: string | null;
  type: string;
  reference?: MetaobjectReference | null;
}

interface ApiResponse {
  metaobjectByHandle: {
    id: string;
    handle: string;
    type: string;
    fields: MetaobjectFieldRaw[];
  } | null;
}

export interface HomepageHeroContent {
  title: string;
  videoDesktop: string;
  videoMobile: string;
}

function getField(fields: MetaobjectFieldRaw[], key: string): MetaobjectFieldRaw | undefined {
  return fields.find((field) => field.key === key);
}

function normaliseFileUrl(field?: MetaobjectFieldRaw): string {
  if (!field) return "";

  const raw = field.value?.trim() ?? "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  const reference = field.reference;
  if (!reference) return "";

  if (reference.__typename === "GenericFile") {
    return reference.url ?? "";
  }

  if (reference.__typename === "MediaImage") {
    return reference.image?.url ?? "";
  }

  if (reference.__typename === "Video") {
    const mp4 = reference.sources?.find((source) => source.mimeType === "video/mp4");
    return mp4?.url ?? reference.sources?.[0]?.url ?? "";
  }

  return "";
}

export async function getHomepageHeroContent(options?: {
  type?: string;
  handle?: string;
}): Promise<HomepageHeroContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.METAOBJECTS);

  const { type = "hero_videos", handle = "main" } = options ?? {};

  const data = await shopifyQuery<ApiResponse>(GET_HOMEPAGE_HERO_METAOBJECT_QUERY, {
    type,
    handle,
  });

  if (!data.metaobjectByHandle) return null;

  const fields = data.metaobjectByHandle.fields ?? [];
  const title = getField(fields, "Title")?.value?.trim() || "Transform Your Outdoor Space";
  const videoDesktop = normaliseFileUrl(getField(fields, "video_desktop"));
  const videoMobile = normaliseFileUrl(getField(fields, "video_mobile"));

  return {
    title,
    videoDesktop,
    videoMobile,
  };
}
