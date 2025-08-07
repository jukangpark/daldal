import { Heart, Brain, Image, Zap, Magnet } from "lucide-react";

interface GameItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  difficulty: "쉬움" | "보통" | "어려움";
  players: string;
  duration: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const games: GameItem[] = [
  {
    id: "love-quiz",
    title: "연애 가치관 테스트",
    description: "연애 가치관을 테스트 하고 나와 잘 맞는 사람을 찾아보아요!",
    icon: Brain,
    href: "/dadalgame/love-quiz",
    difficulty: "쉬움",
    players: "1명",
    duration: "3분 이내",
    isPopular: true,
  },
  {
    id: "sexy-quiz",
    title: "19금 성향 테스트",
    description: "19금 성향을 테스트 하고 나와 잘 맞는 사람을 찾아보아요!",
    icon: Heart,
    href: "/dadalgame/sexy-quiz",
    difficulty: "어려움",
    players: "1명",
    duration: "3분 이내",
    isPopular: true,
  },
  {
    id: "catch-mind",
    title: "캐치마인드",
    description: "내 그림을 맞춰봐!",
    icon: Image,
    href: "/dadalgame/catch-mind",
    difficulty: "보통",
    players: "1명",
    duration: "5분 이내",
    isPopular: true,
  },
  {
    id: "reaction-speed",
    title: "반응 속도 테스트",
    description: "당신의 반응 속도를 측정해보세요!",
    icon: Zap,
    href: "/dadalgame/reaction-speed",
    difficulty: "쉬움",
    players: "1명",
    duration: "2분 이내",
    isNew: true,
  },
  {
    id: "tetotest",
    title: "테토 vs 에겐 테스트",
    description: "테토인가 에겐인가 그것이 문제로다",
    icon: Magnet,
    href: "/dadalgame/tetotest",
    difficulty: "쉬움",
    players: "1명",
    duration: "2분 이내",
    isNew: true,
  },
];

export default games;
