export interface User {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  location: string;
  bio: string;
  interests: string[];
  photos: string[];
  createdAt: Date;
}

export interface SelfIntroduction {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SuperDateApplication {
  id: string;
  userId: string;
  targetUserId: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}
