
// Ex: duration = 5m | 5h | 1s | 3w | 3y

export const getValidityPeriodInWords = (duration: string): string => {
  const unitMap: Record<string, string> = {
    m: "minute(s)",
    h: "hour(s)",
    d: "day(s)",
    w: "week(s)",
    y: "year(s)",
  };

  const match = duration.match(/^(\d+)([mhdwy])$/);
  if (!match) throw new Error("Invalid duration format");

  const [_, value, unit] = match;
  return `${value} ${unitMap[unit]}`;
};
