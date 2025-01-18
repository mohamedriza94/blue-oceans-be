export interface INotification {
  status: "read" | "unread";
  icon?: string;
  relatedEntityId?: string;
  title: string;
  description: string;
  link: string;
  showToChiefOccupantId?: string;
}
