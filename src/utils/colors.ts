const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"] as const;

type Color = (typeof COLORS)[number];

export function colorFromUuid(uuid: string): Color {
  let hash = 0;

  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
