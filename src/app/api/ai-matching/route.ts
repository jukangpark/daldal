import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Claude API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
});

interface SelfIntroduction {
  id: string;
  user_id: string;
  user_name: string;
  user_age: number;
  user_gender: "male" | "female";
  user_location: string;
  title: string;
  content: string;
  photos: string[];
  mbti?: string;
  created_at: string;
  updated_at: string;
}

interface AIMatchingRequest {
  currentUser: SelfIntroduction;
  candidates: SelfIntroduction[];
}

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      console.error("NEXT_PUBLIC_ANTHROPIC_API_KEY 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { currentUser, candidates }: AIMatchingRequest = await request.json();

    if (!currentUser || !candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // AI에게 매칭 분석 요청
    const prompt = `
당신은 전문적인 연애 매칭 AI입니다. 주어진 사용자 정보를 바탕으로 최고의 궁합을 찾아주세요.

중요한 지침:
- 동일한 사람이 매칭되더라도 매번 다른 관점과 접근 방식으로 분석해주세요
- 매칭 이유는 다양한 각도에서 접근하여 매번 새로운 인사이트를 제공해주세요
- 데이트 코스는 계절, 상황, 관계 단계에 따라 다양하게 제안해주세요
- 연애 팁은 매번 다른 측면의 조언을 포함해주세요
- 창의적이고 독창적인 분석을 통해 사용자에게 새로운 발견을 제공해주세요

**현재 사용자 정보:**
- 이름: ${currentUser.user_name}
- 나이: ${currentUser.user_age}세
- 성별: ${currentUser.user_gender === "male" ? "남성" : "여성"}
- MBTI: ${currentUser.mbti || "미입력"}
- 제목: ${currentUser.title}
- 자기소개: ${currentUser.content}
- 거주지: ${currentUser.user_location}

**매칭 후보들:**
${candidates
  .map(
    (candidate, index) => `
${index + 1}. 이름: ${candidate.user_name}
   - 나이: ${candidate.user_age}세
   - 성별: ${candidate.user_gender === "male" ? "남성" : "여성"}
   - MBTI: ${candidate.mbti || "미입력"}
   - 제목: ${candidate.title}
   - 자기소개: ${candidate.content}
   - 거주지: ${candidate.user_location}
`
  )
  .join("\n")}

위 정보를 바탕으로 현재 사용자와 가장 궁합이 좋은 상대를 선택하고, 다음 형식으로 응답해주세요:

{
  "matchedUserIndex": 선택된 후보의 인덱스 (0부터 시작),
  "compatibilityScore": 궁합도 점수 (70-95 사이의 숫자),
  "explanation": "왜 이 상대가 최고의 궁합인지에 대한 전체적인 설명 (3-4문장으로 상세히)",
  "reasons": [
    {
      "title": "매칭 이유 제목 1",
      "description": "구체적이고 상세한 설명 (2-3문장)"
    },
    {
      "title": "매칭 이유 제목 2", 
      "description": "구체적이고 상세한 설명 (2-3문장)"
    },
    {
      "title": "매칭 이유 제목 3",
      "description": "구체적이고 상세한 설명 (2-3문장)"
    },
    {
      "title": "매칭 이유 제목 4",
      "description": "구체적이고 상세한 설명 (2-3문장)"
    }
  ],
  "recommendedDateCourses": [
    {
      "title": "추천 데이트 코스 1",
      "description": "상세한 데이트 코스 설명과 이유",
      "duration": "소요 시간",
      "budget": "예상 비용"
    },
    {
      "title": "추천 데이트 코스 2",
      "description": "상세한 데이트 코스 설명과 이유",
      "duration": "소요 시간", 
      "budget": "예상 비용"
    }
  ],
  "relationshipTips": [
    {
      "category": "주의사항",
      "title": "주의할 점 제목",
      "description": "구체적인 주의사항과 이유 설명"
    },
    {
      "category": "소통 팁",
      "title": "소통 팁 제목", 
      "description": "효과적인 소통 방법과 이유 설명"
    },
    {
      "category": "관계 발전",
      "title": "관계 발전 팁 제목",
      "description": "관계를 발전시키는 방법과 이유 설명"
    }
  ]
}

매칭 기준:
1. MBTI 궁합도 - 성격 유형의 호환성과 보완성
2. 나이 차이 - 적당한 나이 차이로 인한 안정성과 활력의 균형
3. 관심사나 가치관의 유사성 - 공통 관심사와 인생 목표의 일치
4. 자기소개 내용의 호환성 - 라이프스타일과 성향의 조화
5. 거주지 근접성 - 만남의 편의성과 지속 가능성

추천 데이트 코스 작성 가이드:
- 두 사람의 성격과 관심사를 고려한 맞춤형 코스
- 단계별로 관계 발전을 도모할 수 있는 활동
- 예산과 시간을 고려한 현실적인 제안
- 계절과 지역 특성을 반영한 구체적인 장소와 활동

연애 주의사항 및 팁 작성 가이드:
- MBTI 성격 차이로 인한 잠재적 갈등점과 해결방안
- 나이 차이로 인한 가치관 차이와 소통 방법
- 각자의 라이프스타일 차이를 존중하는 방법
- 관계 발전 단계별 주의사항과 권장사항
- 갈등 해결과 의사소통 개선 방법

모든 설명은 구체적이고 실용적이며, 두 사람의 특성을 고려한 맞춤형 조언이어야 합니다.

중요: 반드시 위의 JSON 형식에 맞춰 모든 필드를 포함하여 응답해주세요. recommendedDateCourses와 relationshipTips 필드도 반드시 포함해야 합니다.

JSON 형식으로만 응답하고, 다른 설명이나 마크다운 형식은 포함하지 마세요.
`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSON 파싱
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("AI 응답 파싱 오류:", parseError);
      console.error("파싱 실패한 응답:", responseText);
      return NextResponse.json(
        { error: "AI 응답을 처리하는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 매칭된 사용자 정보 가져오기
    const matchedUser = candidates[aiResponse.matchedUserIndex];
    if (!matchedUser) {
      return NextResponse.json(
        { error: "매칭된 사용자를 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    // 최종 응답 구성
    const result = {
      matchedUser,
      compatibilityScore: aiResponse.compatibilityScore,
      explanation: aiResponse.explanation,
      reasons: aiResponse.reasons,
      recommendedDateCourses: aiResponse.recommendedDateCourses || [],
      relationshipTips: aiResponse.relationshipTips || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI 매칭 오류:", error);
    return NextResponse.json(
      { error: "AI 매칭 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
