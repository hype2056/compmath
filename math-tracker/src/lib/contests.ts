export const CONTESTS = ["AMC10", "AMC12", "AIME", "USAMO", "BMT", "SMT"] as const;

export type ContestName = (typeof CONTESTS)[number];
