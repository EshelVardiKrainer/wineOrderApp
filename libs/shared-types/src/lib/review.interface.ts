export interface IWineReview {
  id: string;
  userId: string;
  userName: string;
  wineId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface IWineReviewCreate {
  rating: number;
  comment?: string;
}

export interface IWineReviewSummary {
  avgRating: number;
  count: number;
  reviews: IWineReview[];
}
