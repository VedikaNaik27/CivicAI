import { AIClassificationResult, IssueCategory } from "@/types";
import { seededFloat } from "@/lib/deterministic";

export interface ClassifyComplaintInput {
  text?: string;
  transcript?: string;
  normalizedText?: string;
  imageName?: string;
  imageDataUrl?: string;
}

interface CategorySignal {
  category: IssueCategory;
  keywords: string[];
  reason: string;
}

const SIGNALS: CategorySignal[] = [
  {
    category: "Pothole",
    keywords: [
      "pothole",
      "gundi",
      "gaddha",
      "pot hole",
      "crater",
      "road hole",
      "sunken",
    ],
    reason:
      "Road surface damage consistent with a pothole was detected in the description/image.",
  },
  {
    category: "Road Damage",
    keywords: [
      "road damage",
      "cracked road",
      "broken road",
      "road crack",
      "road collapse",
    ],
    reason: "Widespread surface damage to the road was detected.",
  },
  {
    category: "Streetlight",
    keywords: [
      "streetlight",
      "street light",
      "lamp post",
      "light pole",
      "bulb",
      "not working light",
      "dark street",
    ],
    reason:
      "Language describing a non-functional street lighting fixture was detected.",
  },
  {
    category: "Garbage",
    keywords: [
      "garbage",
      "trash",
      "waste",
      "dump",
      "overflow",
      "litter",
      "kachra",
    ],
    reason:
      "Description matches overflowing waste / garbage accumulation.",
  },
  {
    category: "Drainage",
    keywords: [
      "drain",
      "drainage",
      "sewage",
      "manhole",
      "blocked drain",
      "chamber",
    ],
    reason:
      "Blocked or overflowing drainage infrastructure was detected.",
  },
  {
    category: "Water Leakage",
    keywords: [
      "water leak",
      "pipe burst",
      "leaking pipe",
      "water pipeline",
      "water wastage",
    ],
    reason:
      "Language indicating a water supply leak was detected.",
  },
  {
    category: "Flooding",
    keywords: [
      "flood",
      "flooded",
      "waterlogged",
      "water logging",
      "submerged",
    ],
    reason:
      "Standing/flooded water on a public road was detected.",
  },
  {
    category: "Traffic Signal",
    keywords: [
      "traffic signal",
      "traffic light",
      "signal not working",
      "junction light",
    ],
    reason:
      "A malfunctioning traffic signal was described.",
  },
  {
    category: "Fallen Tree",
    keywords: [
      "fallen tree",
      "tree fell",
      "branch fell",
      "uprooted tree",
      "tree blocking",
    ],
    reason:
      "A fallen or hazardous tree was described.",
  },
  {
    category: "Unsafe Infrastructure",
    keywords: [
      "collapse",
      "unsafe",
      "exposed wire",
      "live wire",
      "broken railing",
      "structural",
    ],
    reason:
      "Language indicating an unsafe public-infrastructure hazard was detected.",
  },
];

const VALID_CATEGORIES: IssueCategory[] = [
  "Pothole",
  "Road Damage",
  "Streetlight",
  "Garbage",
  "Drainage",
  "Water Leakage",
  "Flooding",
  "Traffic Signal",
  "Fallen Tree",
  "Unsafe Infrastructure",
  "Other",
];

function scoreText(text: string) {
  const lower = text.toLowerCase();

  const scored = SIGNALS.map((s) => {
    const hits = s.keywords.filter((k) =>
      lower.includes(k)
    );

    return {
      signal: s,
      hits: hits.length,
    };
  }).filter((s) => s.hits > 0);

  scored.sort((a, b) => b.hits - a.hits);

  return scored;
}

function scoreImageName(imageName: string) {
  return scoreText(
    imageName.replace(/[_\-.]/g, " ")
  );
}

/**
 * Existing deterministic classifier.
 *
 * This remains as a fallback so CivicAI continues to work
 * even if the Gemini API is unavailable.
 */
export function classifyComplaint(
  input: ClassifyComplaintInput
): AIClassificationResult {
  const combinedText = [
    input.normalizedText,
    input.text,
    input.transcript,
  ]
    .filter(Boolean)
    .join(". ");

  const textMatches = combinedText
    ? scoreText(combinedText)
    : [];

  const imageMatches = input.imageName
    ? scoreImageName(input.imageName)
    : [];

  const allMatches = [
    ...textMatches,
    ...imageMatches,
  ];

  const seed =
    combinedText ||
    input.imageName ||
    "unclassified";

  if (allMatches.length === 0) {
    return {
      category: "Other",
      confidence:
        Math.round(
          seededFloat(seed, 0.55, 0.68) * 100
        ) / 100,
      reason:
        "No strong category signal was found in the supplied text or image filename; classified as a general civic issue for manual review.",
    };
  }

  const top = allMatches[0];

  const secondCandidate = allMatches.find(
    (m) =>
      m.signal.category !==
      top.signal.category
  );

  const baseConfidence =
    0.82 +
    Math.min(top.hits, 3) * 0.04;

  const confidence = Math.min(
    0.98,
    Math.round(
      (
        baseConfidence +
        seededFloat(
          seed,
          -0.03,
          0.03
        )
      ) * 100
    ) / 100
  );

  return {
    category: top.signal.category,
    confidence,
    reason: top.signal.reason,
    secondaryCategory:
      secondCandidate
        ? secondCandidate.signal.category
        : undefined,
    secondaryReason:
      secondCandidate
        ? secondCandidate.signal.reason
        : undefined,
  };
}

/**
 * REAL GEMINI VISION CLASSIFIER
 *
 * The uploaded image is sent to Gemini as base64 image data.
 *
 * Flow:
 *
 * Uploaded image
 *      ↓
 * Gemini Vision
 *      ↓
 * Civic issue category
 *      ↓
 * Existing CivicAI routing
 */
export async function classifyComplaintWithVision(
  input: ClassifyComplaintInput
): Promise<AIClassificationResult> {
  
  const apiKey =
    process.env.GEMINI_API_KEY;

  /*
   * If Gemini is not configured or there is
   * no image, use the existing classifier.
   */
  if (
    !apiKey ||
    !input.imageDataUrl
  ) {
    return classifyComplaint(input);
  }

  const model =
    process.env.GEMINI_VISION_MODEL ||
    "gemini-3.8-flash";

  const additionalText = [
    input.normalizedText,
    input.text,
    input.transcript,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `
You are the visual AI classification engine
for CivicAI, a civic issue reporting platform.

Analyze the uploaded image carefully.

Identify the MAIN public civic infrastructure
problem visible in the image.

Allowed categories:

Pothole
Road Damage
Streetlight
Garbage
Drainage
Water Leakage
Flooding
Traffic Signal
Fallen Tree
Unsafe Infrastructure
Other

Classification rules:

1. Classify based primarily on what is actually
   visible in the image.

2. Do not invent objects or problems that cannot
   reasonably be seen.

3. If multiple problems are visible, select the
   most important primary civic issue.

4. If another clearly visible civic problem exists,
   provide it as the secondary category.

5. If the image is unclear or does not show a
   recognizable civic issue, classify it as Other.

6. Focus on public infrastructure and civic issues.

7. Return valid JSON matching the requested schema.

8. Confidence must be a number between 0 and 1.

${
  additionalText
    ? `
Additional information provided by the citizen:
${additionalText}
`
    : ""
}
`;

  try {
    /*
     * Convert:
     *
     * data:image/jpeg;base64,ABC123...
     *
     * into:
     *
     * mimeType = image/jpeg
     * base64Data = ABC123...
     */
    const match =
      input.imageDataUrl.match(
        /^data:(.+);base64,(.+)$/
      );

    if (!match) {
      console.error(
        "Invalid image data URL."
      );

      return classifyComplaint(input);
    }

    const mimeType = match[1];
    const base64Data = match[2];

    /*
     * Gemini GenerateContent API.
     *
     * The image is sent using inline_data.
     */
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],

          generationConfig: {
            responseMimeType:
              "application/json",

            responseSchema: {
              type: "OBJECT",

              properties: {
                category: {
                  type: "STRING",
                  enum: VALID_CATEGORIES,
                },

                confidence: {
                  type: "NUMBER",
                  minimum: 0,
                  maximum: 1,
                },

                reason: {
                  type: "STRING",
                },

                secondaryCategory: {
                  type: "STRING",
                  enum: [
                    ...VALID_CATEGORIES,
                    "None",
                  ],
                },

                secondaryReason: {
                  type: "STRING",
                },
              },

              required: [
                "category",
                "confidence",
                "reason",
                "secondaryCategory",
                "secondaryReason",
              ],
            },
          },
        }),
      }
    );

    /*
     * Gemini returned an HTTP error.
     */
    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Gemini vision classification failed:",
        response.status,
        errorText
      );

      return classifyComplaint(input);
    }

    const data =
      await response.json();

    /*
     * Extract Gemini's JSON response.
     */
    const content =
      data?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (!content) {
      console.error(
        "Gemini returned no classification."
      );

      return classifyComplaint(input);
    }

    const result =
      JSON.parse(content);

    /*
     * Validate the category before
     * allowing it into CivicAI.
     */
    if (
      !VALID_CATEGORIES.includes(
        result.category
      )
    ) {
      console.error(
        "Gemini returned invalid category:",
        result.category
      );

      return classifyComplaint(input);
    }

    /*
     * Keep confidence between 0 and 1.
     */
    const confidence =
      Math.max(
        0,
        Math.min(
          1,
          Number(result.confidence) || 0
        )
      );

    /*
     * Convert "None" into undefined
     * because our application does not
     * need a secondary category in that case.
     */
    const secondaryCategory =
      result.secondaryCategory &&
      result.secondaryCategory !== "None"
        ? result.secondaryCategory
        : undefined;

    const secondaryReason =
      secondaryCategory
        ? result.secondaryReason ||
          undefined
        : undefined;

    return {
      category:
        result.category,

      confidence,

      reason:
        result.reason ||
        "Gemini identified the civic issue from the uploaded image.",

      secondaryCategory,

      secondaryReason,
    };
  } catch (error) {
    /*
     * If anything goes wrong with Gemini,
     * CivicAI falls back to the existing
     * classifier instead of crashing.
     */
    console.error(
      "Gemini vision classification error:",
      error
    );

    return classifyComplaint(input);
  }
}